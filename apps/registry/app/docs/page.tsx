import Link from "next/link";
import { ArrowLeft, Github, Play } from "lucide-react";

import { BASE_URL, getSource, itemUrl } from "@/lib/registry";
import { highlight } from "@/lib/highlight";
import { FrameworkProvider } from "@/components/framework-context";
import { InstallCommand } from "@/components/install-command";
import { CodeTabs } from "@/components/code-tabs";
import { DocCode } from "@/components/doc-code";
import { DocsToc, type TocGroup } from "@/components/docs-toc";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroWaves } from "@/components/hero-waves";
import { ToastLayoutToggle } from "@/components/toast-layout-toggle";

import ToastDefault from "@/registry/react/examples/toast-default";
import ToastTypes from "@/registry/react/examples/toast-types";
import ToastDescription from "@/registry/react/examples/toast-description";
import ToastAction from "@/registry/react/examples/toast-action";
import ToastPromise from "@/registry/react/examples/toast-promise";
import ToastCustom from "@/registry/react/examples/toast-custom";
import ToastPositions from "@/registry/react/examples/toast-positions";
import ToastStack from "@/registry/react/examples/toast-stack";

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

const OPTIONS: { name: string; type: string; desc: string }[] = [
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
    name: "richColors",
    type: "boolean",
    desc: "Use the semantic --sapa-* colors instead of the neutral surface.",
  },
  {
    name: "icon",
    type: "ReactNode",
    desc: "Custom leading icon; falls back to the type's default.",
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
    desc: "Called when the toast is dismissed.",
  },
  {
    name: "onAutoClose",
    type: "(toast) => void",
    desc: "Called when the toast auto-closes.",
  },
];

const TOASTER_PROPS: { name: string; type: string; desc: string }[] = [
  {
    name: "position",
    type: "ToastPosition",
    desc: 'Default position for toasts that don\'t set their own (default "bottom-right").',
  },
  {
    name: "richColors",
    type: "boolean",
    desc: "Apply the semantic colors to every toast by default (default false).",
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

const codeChip = "rounded bg-muted px-1 py-0.5 font-mono text-xs";

function ReferenceTable({
  rows,
}: {
  rows: { name: string; type: string; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-muted/40 text-muted-foreground border-b text-xs uppercase tracking-wide">
            <th className="px-3 py-2 font-semibold">Prop</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((r) => (
            <tr key={r.name} className="align-top">
              <td className="text-foreground whitespace-nowrap px-3 py-2 font-mono text-xs font-medium">
                {r.name}
              </td>
              <td className="text-sapa-info whitespace-nowrap px-3 py-2 font-mono text-xs">
                {r.type}
              </td>
              <td className="text-muted-foreground px-3 py-2">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function DocsPage() {
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

  const docCode = (
    key: string,
    reactFilename?: string,
    vueFilename?: string,
  ) => (
    <DocCode
      reactCode={hl[key].react}
      vueCode={hl[key].vue}
      reactHtml={hl[key].reactHtml}
      vueHtml={hl[key].vueHtml}
      reactFilename={reactFilename}
      vueFilename={vueFilename}
    />
  );

  const sourceTabs = (key: string) => (
    <CodeTabs
      reactCode={src[key].react}
      vueCode={src[key].vue}
      reactHtml={src[key].reactHtml}
      vueHtml={src[key].vueHtml}
    />
  );

  return (
    <FrameworkProvider>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden">
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
                  Documentation
                  <span className="bg-linear-to-br from-sapa-warning to-sapa-error bg-clip-text text-transparent">
                    .
                  </span>
                </h1>
                <p className="text-muted-foreground text-xs">
                  One API, both React and Vue. Copy, paste, own it.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/playground"
                className="bg-linear-to-br from-sapa-warning via-sapa-error to-sapa-info bg-size-[200%_200%] shadow-sapa-error/25 hover:shadow-sapa-error/40 group inline-flex h-9 items-center gap-1.5 rounded-md bg-left px-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-right hover:shadow-xl"
              >
                <Play className="size-3.5" />
                Playground
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
                  the files land in{" "}
                  <code className={codeChip}>components/ui/sapa-toast/</code>.
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
                  Render <code className={codeChip}>&lt;Toaster /&gt;</code>{" "}
                  once, near the root of your app. After that you can call{" "}
                  <code className={codeChip}>toast()</code> from anywhere.
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
                  Call <code className={codeChip}>toast()</code> with a message.
                  Everything else is optional.
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
                  <code className={codeChip}>toast.loading()</code> persists
                  until you dismiss or replace it. Every call returns an id you
                  can pass to <code className={codeChip}>toast.dismiss()</code>.
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
                  The second argument of every{" "}
                  <code className={codeChip}>toast()</code> call. Identical in
                  React and Vue.
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
            </main>
          </div>

          <footer className="text-muted-foreground mt-16 border-t pt-6 text-sm">
            Sapa · registry served from{" "}
            <code className="text-xs">{BASE_URL}/r</code>
          </footer>
        </div>
      </div>
    </FrameworkProvider>
  );
}
