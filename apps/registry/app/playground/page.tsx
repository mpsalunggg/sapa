import { getItemFiles, getPreviewCss, getSource } from "@/shared/lib/registry";
import { Playground } from "@/features/playground/playground";
import type { FrameworkSources } from "@/features/playground/playground-files";
import { DocsLink } from "@/shared/components/nav-links";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import { HeroWaves } from "@/shared/components/hero-waves";
import type { Framework } from "@/shared/framework/framework-context";

export const metadata = {
  title: "Sapa · Playground",
  description: "Live, editable playground for the Sapa toast components.",
};

const VARIANTS = [
  { key: "default", title: "Default" },
  { key: "types", title: "Types · rich colors" },
  { key: "variants", title: "Variants" },
  { key: "description", title: "Title + description" },
  { key: "action", title: "Action + cancel" },
  { key: "promise", title: "Promise" },
  { key: "progress", title: "Progress" },
  { key: "custom", title: "Custom content" },
  { key: "positions", title: "Positions" },
  { key: "stack", title: "Stack" },
] as const;

async function loadSources(framework: Framework): Promise<FrameworkSources> {
  const [examples, toasterFiles, utilsFiles] = await Promise.all([
    Promise.all(
      VARIANTS.map(
        async (v) =>
          [v.key, await getSource(`${framework}/toast-${v.key}`)] as const,
      ),
    ).then(Object.fromEntries),
    getItemFiles(`${framework}/toaster`),
    getItemFiles(`${framework}/utils`),
  ]);
  return { examples, toasterFiles, utilsFiles };
}

export default async function PlaygroundPage() {
  const [react, vue, previewCss] = await Promise.all([
    loadSources("react"),
    loadSources("vue"),
    getPreviewCss(),
  ]);

  return (
    <div className="relative overflow-hidden">
      <HeroWaves className="h-[480px]" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        <SiteHeader
          title="Playground"
          subtitle="Edit the code and the preview updates live."
          actions={<DocsLink />}
        />

        <Playground
          variants={VARIANTS}
          react={react}
          vue={vue}
          previewCss={previewCss}
        />

        <SiteFooter />
      </div>
    </div>
  );
}
