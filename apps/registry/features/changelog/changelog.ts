import { promises as fs } from "node:fs";
import path from "node:path";

export interface Release {
  version: string;
  date: string;
  body: string;
}

const CHANGELOG_PATH = path.join(process.cwd(), "..", "..", "CHANGELOG.md");

const RELEASE_HEADING = /^## \[([^\]]+)\](?:\s*-\s*(\S+))?\s*$/gm;

export async function getReleases(): Promise<Release[]> {
  const markdown = await fs.readFile(CHANGELOG_PATH, "utf8");
  const headings = [...markdown.matchAll(RELEASE_HEADING)];

  return headings.map((heading, i) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[i + 1]?.index ?? markdown.length;
    return {
      version: heading[1],
      date: heading[2] ?? "",
      body: markdown.slice(start, end).trim(),
    };
  });
}

export async function getLatestVersion(): Promise<string | null> {
  const [latest] = await getReleases();
  return latest?.version ?? null;
}
