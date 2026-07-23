import Link from "next/link";
import { ArrowLeft, BookOpen, Github } from "lucide-react";

import {
  BASE_URL,
  getSource,
  getItemFiles,
  getPreviewCss,
} from "@/lib/registry";
import { Playground } from "@/components/playground";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroWaves } from "@/components/hero-waves";

export const metadata = {
  title: "Sapa — Playground",
  description: "Live, editable playground for the Sapa toast components.",
};

const VARIANTS = [
  { key: "default", title: "Default", description: "A plain toast." },
  {
    key: "types",
    title: "Types · rich colors",
    description: "Semantic colors + icons.",
  },
  {
    key: "variants",
    title: "Variants",
    description: "Filled, outline and accent styles.",
  },
  {
    key: "sizes",
    title: "Sizes",
    description: "sm, default and lg.",
  },
  {
    key: "description",
    title: "Title + description",
    description: "Headline + detail line.",
  },
  {
    key: "action",
    title: "Action + cancel",
    description: "Inline action buttons.",
  },
  { key: "promise", title: "Promise", description: "Loading → success/error." },
  {
    key: "progress",
    title: "Progress",
    description: "Determinate progress bar.",
  },
  {
    key: "custom",
    title: "Custom content",
    description: "Any JSX inside the toast.",
  },
  {
    key: "positions",
    title: "Positions",
    description: "Six anchor positions.",
  },
  {
    key: "stack",
    title: "Stack",
    description: "Collapsible stack; hover to expand.",
  },
] as const;

export default async function PlaygroundPage() {
  const [entries, vueEntries] = await Promise.all([
    Promise.all(
      VARIANTS.map(
        async (v) => [v.key, await getSource(`react/toast-${v.key}`)] as const,
      ),
    ),
    Promise.all(
      VARIANTS.map(
        async (v) => [v.key, await getSource(`vue/toast-${v.key}`)] as const,
      ),
    ),
  ]);
  const examples = Object.fromEntries(entries);
  const vueExamples = Object.fromEntries(vueEntries);
  const [toasterFiles, utilsFiles, vueToasterFiles, vueUtilsFiles, previewCss] =
    await Promise.all([
      getItemFiles("react/toaster"),
      getItemFiles("react/utils"),
      getItemFiles("vue/toaster"),
      getItemFiles("vue/utils"),
      getPreviewCss(),
    ]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]">
        <HeroWaves />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-background text-muted-foreground hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground group inline-flex size-9 items-center justify-center rounded-md border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
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
              <p className="text-muted-foreground text-xs">
                Edit the code — the preview updates live.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/docs"
              className="bg-background text-muted-foreground hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground group inline-flex h-9 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <BookOpen className="size-3.5" />
              Docs
            </Link>
            <a
              href="https://github.com/mpsalunggg/sapa"
              className="bg-background text-muted-foreground hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground group inline-flex size-9 items-center justify-center rounded-md border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
            <ThemeToggle />
          </div>
        </header>

        <Playground
          variants={VARIANTS.map((v) => ({ ...v }))}
          examples={examples}
          toasterFiles={toasterFiles}
          utilsFiles={utilsFiles}
          vueExamples={vueExamples}
          vueToasterFiles={vueToasterFiles}
          vueUtilsFiles={vueUtilsFiles}
          previewCss={previewCss}
        />

        <footer className="text-muted-foreground mt-16 border-t pt-6 text-sm">
          Sapa · registry served from{" "}
          <code className="text-xs">{BASE_URL}/r</code>
        </footer>
      </div>
    </div>
  );
}
