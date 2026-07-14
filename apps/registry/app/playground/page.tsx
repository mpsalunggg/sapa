import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

import { BASE_URL, getSource, getItemFiles, getPreviewCss } from "@/lib/registry"
import { Playground } from "@/components/playground"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeroWaves } from "@/components/hero-waves"

export const metadata = {
  title: "Sapa — Playground",
  description: "Live, editable playground for the Sapa toast components.",
}

const VARIANTS = [
  { key: "default", title: "Default", description: "A plain toast." },
  { key: "types", title: "Types · rich colors", description: "Semantic colors + icons." },
  { key: "description", title: "Title + description", description: "Headline + detail line." },
  { key: "action", title: "Action + cancel", description: "Inline action buttons." },
  { key: "promise", title: "Promise", description: "Loading → success/error." },
  { key: "custom", title: "Custom content", description: "Any JSX inside the toast." },
  { key: "positions", title: "Positions", description: "Six anchor positions." },
  { key: "stack", title: "Stack", description: "Collapsible stack; hover to expand." },
] as const

export default async function PlaygroundPage() {
  const entries = await Promise.all(
    VARIANTS.map(async (v) => [v.key, await getSource(`react/toast-${v.key}`)] as const)
  )
  const examples = Object.fromEntries(entries)
  const [toasterFiles, utilsFiles, previewCss] = await Promise.all([
    getItemFiles("react/toaster"),
    getItemFiles("react/utils"),
    getPreviewCss(),
  ])

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]">
        <HeroWaves />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex size-9 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground hover:shadow-xl"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Playground
              <span className="bg-linear-to-br from-sapa-warning to-sapa-error bg-clip-text text-transparent">
                .
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Edit the code — the preview updates live.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className="group inline-flex h-9 items-center gap-1.5 rounded-md border bg-background px-3.5 text-sm font-medium text-muted-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground hover:shadow-xl"
          >
            <BookOpen className="size-3.5" />
            Docs
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <Playground
        variants={VARIANTS.map((v) => ({ ...v }))}
        examples={examples}
        toasterFiles={toasterFiles}
        utilsFiles={utilsFiles}
        previewCss={previewCss}
      />

      <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
        Sapa · registry served from{" "}
        <code className="text-xs">{BASE_URL}/r</code>
      </footer>
      </div>
    </div>
  )
}
