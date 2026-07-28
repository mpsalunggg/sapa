import { promises as fs } from "node:fs";
import path from "node:path";

export const BASE_URL = (
  process.env.SAPA_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const itemUrl = (name: string) => `${BASE_URL}/r/${name}.json`;

interface RegistryFile {
  path: string;
  content: string;
}

/** Read a built registry item (from public/r) and return its first file's source. */
export async function getSource(name: string): Promise<string> {
  const p = path.join(process.cwd(), "public", "r", `${name}.json`);
  const item = JSON.parse(await fs.readFile(p, "utf8")) as {
    files: RegistryFile[];
  };
  return item.files?.[0]?.content ?? "";
}

/** Read the precompiled playground preview stylesheet (public/toast-preview.css). */
export async function getPreviewCss(): Promise<string> {
  const p = path.join(process.cwd(), "public", "toast-preview.css");
  return fs.readFile(p, "utf8");
}

/** Read a built registry item and return ALL of its files (path + content). */
export async function getItemFiles(
  name: string,
): Promise<{ path: string; content: string }[]> {
  const p = path.join(process.cwd(), "public", "r", `${name}.json`);
  const item = JSON.parse(await fs.readFile(p, "utf8")) as {
    files: RegistryFile[];
  };
  return (item.files ?? []).map((f) => ({ path: f.path, content: f.content }));
}
