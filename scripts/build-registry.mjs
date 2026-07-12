// Sapa — registry builder.
// Reads registry.json, inlines each file's content, rewrites intra-registry
// registryDependencies (names) into absolute URLs, and emits one JSON per item
// under apps/registry/public/r/<name>.json (+ an index at r/registry.json).
//
// Usage:
//   node scripts/build-registry.mjs
//   SAPA_BASE_URL=https://sapa.example.com node scripts/build-registry.mjs

import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "apps", "registry", "public", "r")
// Base URL priority: explicit override → Vercel production domain → localhost.
const BASE_URL = (
  process.env.SAPA_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "")

const itemUrl = (name) => `${BASE_URL}/r/${name}.json`

/** Turn a bare item name into an absolute URL; leave real URLs untouched. */
const resolveDep = (dep) => (/^https?:\/\//.test(dep) ? dep : itemUrl(dep))

async function readFileSafe(relPath) {
  const abs = path.join(ROOT, relPath)
  return fs.readFile(abs, "utf8")
}

async function build() {
  const registry = JSON.parse(await readFileSafe("registry.json"))
  await fs.rm(OUT_DIR, { recursive: true, force: true })
  await fs.mkdir(OUT_DIR, { recursive: true })

  const index = []

  for (const item of registry.items) {
    const files = []
    for (const file of item.files ?? []) {
      // `src` is the on-disk source (what we read); `path` is the CLI-facing
      // output hint. Keeping `path` flat (registry/sapa/<basename>) makes both
      // the shadcn (React) and shadcn-vue CLIs place files at components/ui/<basename>.
      const diskPath = file.src ?? file.path
      files.push({
        path: file.path,
        type: file.type,
        ...(file.target ? { target: file.target } : {}),
        content: await readFileSafe(diskPath),
      })
    }

    const output = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: item.name,
      type: item.type,
      ...(item.title ? { title: item.title } : {}),
      ...(item.description ? { description: item.description } : {}),
      ...(item.dependencies ? { dependencies: item.dependencies } : {}),
      ...(item.devDependencies
        ? { devDependencies: item.devDependencies }
        : {}),
      ...(item.registryDependencies
        ? { registryDependencies: item.registryDependencies.map(resolveDep) }
        : {}),
      files,
      ...(item.cssVars ? { cssVars: item.cssVars } : {}),
      ...(item.css ? { css: item.css } : {}),
    }

    const outPath = path.join(OUT_DIR, `${item.name}.json`)
    await fs.mkdir(path.dirname(outPath), { recursive: true })
    await fs.writeFile(outPath, JSON.stringify(output, null, 2) + "\n")

    index.push({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      url: itemUrl(item.name),
    })
  }

  await fs.writeFile(
    path.join(OUT_DIR, "registry.json"),
    JSON.stringify(
      { name: registry.name, homepage: registry.homepage, items: index },
      null,
      2
    ) + "\n"
  )

  console.log(
    `Sapa: built ${registry.items.length} items → ${path.relative(
      ROOT,
      OUT_DIR
    )} (base ${BASE_URL})`
  )
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
