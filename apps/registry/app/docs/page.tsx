import { Play } from "lucide-react";

import { BASE_URL, getSource, itemUrl } from "@/shared/lib/registry";
import { highlight } from "@/features/docs/highlight";
import { FrameworkProvider } from "@/shared/framework/framework-context";
import { InstallCommand } from "@/shared/components/install-command";
import { CodeFrame, FrameworkCodeFrame } from "@/features/docs/code-frame";
import { DocsToc, type TocGroup } from "@/features/docs/docs-toc";
import { Chip } from "@/features/docs/chip";
import {
  ReferenceTable,
  TokenTable,
  type PropRow,
  type TokenRow,
} from "@/features/docs/reference-table";
import { GradientLinkButton } from "@/shared/components/link-button";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import { HeroWaves } from "@/shared/components/hero-waves";
import { ToastLayoutToggle } from "@/features/toast/toast-layout-toggle";

import ToastDefault from "@/registry/react/examples/toast-default";
import ToastTypes from "@/registry/react/examples/toast-types";
import ToastVariants from "@/registry/react/examples/toast-variants";
import ToastSizes from "@/registry/react/examples/toast-sizes";
import ToastDescription from "@/registry/react/examples/toast-description";
import ToastAction from "@/registry/react/examples/toast-action";
import ToastPromise from "@/registry/react/examples/toast-promise";
import ToastProgress from "@/registry/react/examples/toast-progress";
import ToastCustom from "@/registry/react/examples/toast-custom";
import ToastPositions from "@/registry/react/examples/toast-positions";
import ToastStack from "@/registry/react/examples/toast-stack";
import { getLatestVersion } from "@/features/changelog/changelog";

export const metadata = {
  title: "Sapa — Documentation",
  description:
    "How to install and use the Sapa toast — one API, both React and Vue.",
};

// Variants shown with a live preview + install command + real registry source.
const EXAMPLES = [
  {
    key: "types",
    title: "Types & rich colors",
    description:
      "Success, error, warning and info — each with a semantic color + icon.",
    Preview: ToastTypes,
  },
  {
    key: "variants",
    title: "Variants",
    description: "Three styles — filled, outline and accent.",
    Preview: ToastVariants,
  },
  {
    key: "sizes",
    title: "Sizes",
    description: "Three sizes — sm, default and lg.",
    Preview: ToastSizes,
  },
  {
    key: "description",
    title: "Title + description",
    description: "A headline with a secondary line of detail.",
    Preview: ToastDescription,
  },
  {
    key: "action",
    title: "Action + cancel",
    description: "Inline buttons, e.g. undo a destructive change.",
    Preview: ToastAction,
  },
  {
    key: "promise",
    title: "Promise",
    description: "Drive one toast through loading → success/error.",
    Preview: ToastPromise,
  },
  {
    key: "progress",
    title: "Progress",
    description:
      "A determinate progress bar — update it in place, then finish as success.",
    Preview: ToastProgress,
  },
  {
    key: "custom",
    title: "Custom content",
    description: "Render any markup — JSX in React, a component in Vue.",
    Preview: ToastCustom,
  },
  {
    key: "positions",
    title: "Positions",
    description: "Six anchor positions, set per-toast or globally.",
    Preview: ToastPositions,
  },
  {
    key: "stack",
    title: "Stack",
    description: "Toasts collapse into a pile; hover to expand.",
    Preview: ToastStack,
  },
] as const;

const TOC_GROUPS: TocGroup[] = [
  {
    label: "Getting started",
    items: [
      { key: "installation", title: "Installation" },
      { key: "setup", title: "Mount the Toaster" },
      { key: "basic", title: "Basic usage" },
      { key: "loading", title: "Loading & dismiss" },
    ],
  },
  {
    label: "Examples",
    items: EXAMPLES.map((e) => ({ key: e.key, title: e.title })),
  },
  {
    label: "API",
    items: [
      { key: "options", title: "Options" },
      { key: "toaster-props", title: "<Toaster> props" },
    ],
  },
  {
    label: "Theming",
    items: [{ key: "theming", title: "Custom colors" }],
  },
];

// Hand-written snippets for concepts that have no registry example file.
const SNIPPETS: Record<string, { react: string; vue: string }> = {
  setup: {
    react: `import { Toaster } from "@/components/ui/sapa-toast/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}`,
    vue: `<script setup lang="ts">
import Toaster from "@/components/ui/sapa-toast/Toaster.vue"
</script>

<template>
  <RouterView />
  <Toaster rich-colors position="bottom-right" />
</template>`,
  },
  loading: {
    react: `import { toast } from "@/components/ui/sapa-toast/toaster"

const id = toast.loading("Saving…") // persists until you change it
toast.dismiss(id)                    // dismiss one
toast.dismiss()                      // dismiss every toast`,
    vue: `<script setup lang="ts">
import { toast } from "@/components/ui/sapa-toast/useToast"

const id = toast.loading("Saving…") // persists until you change it
toast.dismiss(id)                    // dismiss one
toast.dismiss()                      // dismiss every toast
</script>`,
  },
};

// Framework-agnostic — the same CSS overrides the toast colors in React and Vue.
const THEMING_CSS = `/* globals.css — override Sapa's rich colors */
:root {
  --sapa-success: oklch(0.62 0.17 149);
  --sapa-success-foreground: oklch(0.98 0.02 150);
  --sapa-error: oklch(0.58 0.22 27);
  --sapa-error-foreground: oklch(0.98 0.02 20);
  --sapa-warning: oklch(0.75 0.16 78);
  --sapa-warning-foreground: oklch(0.28 0.07 70);
  --sapa-info: oklch(0.6 0.13 240);
  --sapa-info-foreground: oklch(0.98 0.02 240);
}

.dark {
  --sapa-success: oklch(0.7 0.16 150);
  --sapa-error: oklch(0.7 0.19 22);
  --sapa-warning: oklch(0.82 0.16 82);
  --sapa-info: oklch(0.68 0.14 240);
  /* …plus the matching *-foreground tokens */
}`;

// The eight semantic tokens that power the toast "rich colors".
const SAPA_TOKENS: TokenRow[] = [
  { name: "--sapa-success", desc: "Success border, glow and title." },
  {
    name: "--sapa-success-foreground",
    desc: "Icon/text on the solid success chip.",
  },
  { name: "--sapa-error", desc: "Error border, glow and title." },
  {
    name: "--sapa-error-foreground",
    desc: "Icon/text on the solid error chip.",
  },
  { name: "--sapa-warning", desc: "Warning border, glow and title." },
  {
    name: "--sapa-warning-foreground",
    desc: "Icon/text on the solid warning chip.",
  },
  { name: "--sapa-info", desc: "Info border, glow and title." },
  { name: "--sapa-info-foreground", desc: "Icon/text on the solid info chip." },
];

const OPTIONS: PropRow[] = [
  {
    name: "title",
    type: "ReactNode",
    desc: "Main message — the first argument of toast().",
  },
  {
    name: "description",
    type: "ReactNode",
    desc: "Secondary line of detail below the title.",
  },
  {
    name: "duration",
    type: "number",
    desc: "Auto-dismiss delay in ms (default 4000). Use Infinity to persist.",
  },
  {
    name: "position",
    type: "ToastPosition",
    desc: "One of the six anchors — overrides the Toaster default.",
  },
  {
    name: "variant",
    type: "ToastVariant",
    desc: 'Visual treatment: "default", "outline", "filled" or "accent".',
  },
  {
    name: "size",
    type: "ToastSize",
    desc: 'Toast size: "sm", "default" or "lg".',
  },
  {
    name: "richColors",
    type: "boolean",
    desc: 'Deprecated alias for variant: "outline".',
  },
  {
    name: "icon",
    type: "ReactNode",
    desc: "Custom leading icon; falls back to the type's default.",
  },
  {
    name: "progress",
    type: "number",
    desc: "0–100 — renders a determinate progress bar (see toast.progress).",
  },
  {
    name: "action",
    type: "{ label, onClick }",
    desc: "Primary inline button, e.g. Undo.",
  },
  {
    name: "cancel",
    type: "{ label, onClick }",
    desc: "Secondary / dismiss button.",
  },
  {
    name: "id",
    type: "string | number",
    desc: "Stable id — reuse it to update a toast in place.",
  },
  {
    name: "onDismiss",
    type: "(toast) => void",
    desc: "Called once the toast is removed, whatever closed it.",
  },
  {
    name: "onAutoClose",
    type: "(toast) => void",
    desc: "Called only when the duration ran out — not on close, swipe or action.",
  },
];

const TOASTER_PROPS: PropRow[] = [
  {
    name: "position",
    type: "ToastPosition",
    desc: 'Default position for toasts that don\'t set their own (default "bottom-right").',
  },
  {
    name: "variant",
    type: "ToastVariant",
    desc: 'Default visual treatment for every toast (default "default").',
  },
  {
    name: "size",
    type: "ToastSize",
    desc: 'Default size for every toast (default "default").',
  },
  {
    name: "richColors",
    type: "boolean",
    desc: 'Deprecated alias for variant="outline" (default false).',
  },
  {
    name: "expand",
    type: "boolean",
    desc: "Show toasts as a flat list instead of a collapsible stack (default false).",
  },
];

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export default async function DocsPage() {
  const version = await getLatestVersion();
  // Real registry sources for every variant (default + examples), highlighted server-side.
  const variantKeys = ["default", ...EXAMPLES.map((e) => e.key)];
  const sourceEntries = await Promise.all(
    variantKeys.map(async (key) => {
      const react = await getSource(`react/toast-${key}`);
      const vue = await getSource(`vue/toast-${key}`);
      return [
        key,
        {
          react,
          vue,
          reactHtml: await highlight(react, "tsx"),
          vueHtml: await highlight(vue, "vue"),
        },
      ] as const;
    }),
  );
  const src = Object.fromEntries(sourceEntries);

  // Hand-written concept snippets (setup, loading).
  const snippetEntries = await Promise.all(
    Object.entries(SNIPPETS).map(
      async ([key, s]) =>
        [
          key,
          {
            react: s.react,
            vue: s.vue,
            reactHtml: await highlight(s.react, "tsx"),
            vueHtml: await highlight(s.vue, "vue"),
          },
        ] as const,
    ),
  );
  const hl = Object.fromEntries(snippetEntries);

  // Theming snippet — a single CSS block, identical for React and Vue.
  const themingHtml = await highlight(THEMING_CSS, "css");

  // A hand-written snippet, labelled with the file it belongs in.
  const docCode = (
    key: string,
    reactFilename?: string,
    vueFilename?: string,
  ) => (
    <FrameworkCodeFrame
      react={{
        code: hl[key].react,
        html: hl[key].reactHtml,
        filename: reactFilename,
      }}
      vue={{ code: hl[key].vue, html: hl[key].vueHtml, filename: vueFilename }}
    />
  );

  // A real registry source — long, so it starts collapsed behind "Show code".
  const sourceTabs = (key: string) => (
    <FrameworkCodeFrame
      react={{ code: src[key].react, html: src[key].reactHtml }}
      vue={{ code: src[key].vue, html: src[key].vueHtml }}
      collapsible
    />
  );

  return (
    <FrameworkProvider>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden">
          <HeroWaves />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
          <SiteHeader
            title="Documentation"
            subtitle="One API, both React and Vue. Copy, paste, own it."
            actions={
              <GradientLinkButton href="/playground">
                <Play className="size-3.5" />
                Playground
              </GradientLinkButton>
            }
          />

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="lg:w-52 lg:shrink-0">
              <DocsToc groups={TOC_GROUPS} />
            </aside>

            <main className="divide-border flex min-w-0 flex-1 flex-col divide-y">
              {/* Installation */}
              <section id="installation" className="scroll-mt-6 pb-8">
                <h2 className="text-xl font-bold tracking-tight">
                  Installation
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  The registry is served as JSON. Add it with the shadcn CLI —
                  the files land in <Chip>components/ui/sapa-toast/</Chip>.
                </p>
                <div className="mt-4 w-full">
                  <InstallCommand
                    reactUrl={itemUrl("react/toaster")}
                    vueUrl={itemUrl("vue/toaster")}
                  />
                </div>
              </section>

              {/* Mount the Toaster */}
              <section id="setup" className="scroll-mt-6 py-8">
                <h2 className="text-xl font-bold tracking-tight">
                  Mount the Toaster
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Render <Chip>&lt;Toaster /&gt;</Chip> once, near the root of
                  your app. After that you can call <Chip>toast()</Chip> from
                  anywhere.
                </p>
                <div className="mt-4">
                  {docCode("setup", "app/layout.tsx", "App.vue")}
                </div>
              </section>

              {/* Basic usage */}
              <section id="basic" className="scroll-mt-6 py-8">
                <h2 className="text-xl font-bold tracking-tight">
                  Basic usage
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Call <Chip>toast()</Chip> with a message. Everything else is
                  optional.
                </p>
                <div className="bg-linear-to-b from-muted/50 to-muted/20 mt-4 flex min-h-28 items-center justify-center rounded-xl border border-dashed p-4">
                  <ToastDefault />
                </div>
                <div className="mt-4">
                  <InstallCommand
                    reactUrl={itemUrl("react/toast-default")}
                    vueUrl={itemUrl("vue/toast-default")}
                  />
                </div>
                <div className="mt-4">{sourceTabs("default")}</div>
              </section>

              {/* Loading & dismiss */}
              <section id="loading" className="scroll-mt-6 py-8">
                <h2 className="text-xl font-bold tracking-tight">
                  Loading &amp; dismiss
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  <Chip>toast.loading()</Chip> persists until you dismiss or
                  replace it. Every call returns an id you can pass to{" "}
                  <Chip>toast.dismiss()</Chip>.
                </p>
                <div className="mt-4">{docCode("loading")}</div>
              </section>

              {/* Examples */}
              {EXAMPLES.map(({ key, title, description, Preview }) => (
                <section key={key} id={key} className="scroll-mt-6 py-8">
                  <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {description}
                  </p>

                  {key === "positions" && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {POSITIONS.map((p) => (
                        <code
                          key={p}
                          className="bg-muted/40 text-muted-foreground rounded-md border px-2 py-1 font-mono text-xs"
                        >
                          {p}
                        </code>
                      ))}
                    </div>
                  )}

                  {key === "stack" && (
                    <div className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
                      <span>Try it:</span>
                      <ToastLayoutToggle />
                    </div>
                  )}

                  <div className="bg-linear-to-b from-muted/50 to-muted/20 mt-4 flex min-h-28 items-center justify-center rounded-xl border border-dashed p-4">
                    <Preview />
                  </div>
                  <div className="mt-4">
                    <InstallCommand
                      reactUrl={itemUrl(`react/toast-${key}`)}
                      vueUrl={itemUrl(`vue/toast-${key}`)}
                    />
                  </div>
                  <div className="mt-4">{sourceTabs(key)}</div>
                </section>
              ))}

              {/* Options */}
              <section id="options" className="scroll-mt-6 py-8">
                <h2 className="text-xl font-bold tracking-tight">Options</h2>
                <p className="text-muted-foreground mb-4 mt-2 text-sm">
                  The second argument of every <Chip>toast()</Chip> call.
                  Identical in React and Vue.
                </p>
                <ReferenceTable rows={OPTIONS} />
              </section>

              {/* Toaster props */}
              <section id="toaster-props" className="scroll-mt-6 py-8">
                <h2 className="text-xl font-bold tracking-tight">
                  &lt;Toaster&gt; props
                </h2>
                <p className="text-muted-foreground mb-4 mt-2 text-sm">
                  Defaults for the mounted toaster.
                </p>
                <ReferenceTable rows={TOASTER_PROPS} />
              </section>

              {/* Theming — custom colors */}
              <section id="theming" className="scroll-mt-6 pb-96 pt-8">
                <h2 className="text-xl font-bold tracking-tight">
                  Custom colors
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  The rich colors come from eight semantic CSS variables —{" "}
                  <Chip>--sapa-success</Chip>, <Chip>--sapa-error</Chip>,{" "}
                  <Chip>--sapa-warning</Chip>, <Chip>--sapa-info</Chip> and
                  their <Chip>-foreground</Chip> pairs. They apply whenever a
                  toast runs with <Chip>richColors</Chip>. The{" "}
                  <Chip>theme</Chip> registry item installs them into your
                  project on setup; to re-brand the toast, just override them in
                  your own <Chip>globals.css</Chip> — no component changes
                  needed.
                </p>

                <div className="mt-4">
                  <TokenTable rows={SAPA_TOKENS} />
                </div>

                <p className="text-muted-foreground mb-4 mt-6 text-sm">
                  Redefine any of them under <Chip>:root</Chip> (light) and{" "}
                  <Chip>.dark</Chip> (dark). Values use{" "}
                  <a
                    href="https://oklch.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sapa-info underline underline-offset-2"
                  >
                    oklch
                  </a>
                  , but any valid CSS color works.
                </p>
                <CodeFrame
                  code={THEMING_CSS}
                  html={themingHtml}
                  filename="app/globals.css"
                />

                <p className="text-muted-foreground mb-4 mt-6 text-sm">
                  The result — flip the theme to see both palettes:
                </p>
                <div className="bg-linear-to-b from-muted/50 to-muted/20 flex min-h-28 items-center justify-center rounded-xl border border-dashed p-4">
                  <ToastTypes />
                </div>
              </section>
            </main>
          </div>

          <SiteFooter baseUrl={BASE_URL} version={version} />
        </div>
      </div>
    </FrameworkProvider>
  );
}
