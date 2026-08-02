import { BookOpen } from "lucide-react";

import {
  BASE_URL,
  getSource,
  getItemFiles,
  getPreviewCss,
} from "@/shared/lib/registry";
import { Playground } from "@/features/playground/playground";
import { NavLinkButton } from "@/shared/components/link-button";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import { HeroWaves } from "@/shared/components/hero-waves";
import { getLatestVersion } from "@/features/changelog/changelog";

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
  const version = await getLatestVersion();
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
        <SiteHeader
          title="Playground"
          subtitle="Edit the code — the preview updates live."
          actions={
            <NavLinkButton href="/docs">
              <BookOpen className="size-3.5" />
              Docs
            </NavLinkButton>
          }
        />

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

        <SiteFooter baseUrl={BASE_URL} version={version} />
      </div>
    </div>
  );
}
