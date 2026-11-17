import { promises as fs } from "node:fs";
import path from "node:path";

export const BASE_URL = (
  process.env.SAPA_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const itemUrl = (name: string) => `${BASE_URL}/r/${name}.json`;

export interface RegistryFile {
  path: string;
  content: string;
}

const publicPath = (...segments: string[]) =>
  path.join(process.cwd(), "public", ...segments);

export async function getItemFiles(name: string): Promise<RegistryFile[]> {
  const item = JSON.parse(
    await fs.readFile(publicPath("r", `${name}.json`), "utf8"),
  ) as { files?: RegistryFile[] };
  return (item.files ?? []).map((f) => ({ path: f.path, content: f.content }));
}

export async function getSource(name: string): Promise<string> {
  const [file] = await getItemFiles(name);
  return file?.content ?? "";
}

export function getPreviewCss(): Promise<string> {
  return fs.readFile(publicPath("toast-preview.css"), "utf8");
}
