import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { getSource, itemUrl } from "@/shared/lib/registry";
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
import { PlaygroundLink } from "@/shared/components/nav-links";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import { HeroWaves } from "@/shared/components/hero-waves";
import { ToastLayoutToggle } from "@/features/toast/toast-layout-toggle";

import ToastDefault from "@/registry/react/examples/toast-default";
import ToastTypes from "@/registry/react/examples/toast-types";
import ToastVariants from "@/registry/react/examples/toast-variants";
import ToastDescription from "@/registry/react/examples/toast-description";
import ToastAction from "@/registry/react/examples/toast-action";
import ToastPromise from "@/registry/react/examples/toast-promise";
import ToastProgress from "@/registry/react/examples/toast-progress";
import ToastCustom from "@/registry/react/examples/toast-custom";
import ToastPositions from "@/registry/react/examples/toast-positions";
import ToastStack from "@/registry/react/examples/toast-stack";
import {
  buildCss,
  BASE_TOKENS,
  EMPTY_OVERRIDES,
} from "@/features/theming/theme-tokens";

export const metadata = {
  title: "Sapa · Documentation",
  description:
    "How to install and use the Sapa toast, with one API for React and Vue.",
};

interface Example {
  key: string;
  title: string;
  description: ReactNode;
  Preview: ComponentType;
  extra?: ReactNode;
}

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const EXAMPLES: Example[] = [
  {
    key: "types",
    title: "Types & rich colors",
    description:
      "Success, error, warning and info, each with its own color and icon.",
    Preview: ToastTypes,
  },
  {
    key: "variants",
    title: "Variants",
    description:
      "Solid, minimal and subtle: three ways to carry the type's color.",
    Preview: ToastVariants,
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
      "A determinate progress bar. Update it in place, then finish as success.",
    Preview: ToastProgress,
  },
  {
    key: "custom",
    title: "Custom content",
    description: "Render any markup: JSX in React, a component in Vue.",
    Preview: ToastCustom,
  },
  {
    key: "positions",
    title: "Positions",
    description: "Six anchor positions, set per-toast or globally.",
    Preview: ToastPositions,
    extra: (
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
    ),
  },
  {
    key: "stack",
    title: "Stack",
    description: "Toasts collapse into a pile; hover to expand.",
    Preview: ToastStack,
    extra: (
      <div className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
        <span>Try it:</span>
        <ToastLayoutToggle />
      </div>
    ),
  },
];

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
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}`,
    vue: `<script setup lang="ts">
import Toaster from "@/components/ui/sapa-toast/Toaster.vue"
</script>

<template>
  <RouterView />
  <Toaster position="bottom-right" />
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

const THEMING_CSS = buildCss(EMPTY_OVERRIDES, BASE_TOKENS);

const SAPA_TOKENS: TokenRow[] = [
  {
    name: "--sapa-success",
    desc: "Success tile, countdown ring and progress bar.",
  },
  {
    name: "--sapa-error",
    desc: "Error tile, countdown ring and progress bar.",
  },
  {
    name: "--sapa-warning",
    desc: "Warning tile, countdown ring and progress bar.",
  },
  { name: "--sapa-info", desc: "Info tile, countdown ring and progress bar." },
];

const OPTIONS: PropRow[] = [
  {
    name: "title",
    type: "ReactNode",
    desc: "The main message, passed as the first argument of toast().",
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
    desc: "One of the six anchors. Overrides the Toaster default.",
  },
  {
    name: "variant",
    type: '"solid" | "minimal" | "subtle"',
    desc: "Color treatment. Overrides the Toaster default.",
  },
  {
    name: "icon",
    type: "ReactNode",
    desc: "Custom leading icon; falls back to the type's default.",
  },
  {
    name: "progress",
    type: "number",
    desc: "A value from 0 to 100, shown as a determinate bar inside the card (see toast.progress).",
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
    desc: "Stable id. Reuse it to update a toast in place.",
  },
  {
    name: "onDismiss",
    type: "(toast) => void",
    desc: "Called once the toast is removed, whatever closed it.",
  },
  {
    name: "onAutoClose",
    type: "(toast) => void",
    desc: "Called only when the duration runs out. Closing, swiping or an action button doesn't trigger it.",
  },
];

const TOASTER_PROPS: PropRow[] = [
  {
    name: "position",
    type: "ToastPosition",
    desc: 'Default position for toasts that don\'t set their own (default "bottom-right").',
  },
  {
    name: "expand",
    type: "boolean",
    desc: "Show toasts as a flat list instead of a collapsible stack (default false).",
  },
  {
    name: "variant",
    type: '"solid" | "minimal" | "subtle"',
    desc: 'Default color treatment for toasts that don\'t set their own (default "minimal").',
  },
];

type HighlightedPair = {
  react: string;
  vue: string;
  reactHtml: string;
  vueHtml: string;
};

async function highlightPair(
  react: string,
  vue: string,
): Promise<HighlightedPair> {
  const [reactHtml, vueHtml] = await Promise.all([
    highlight(react, "tsx"),
    highlight(vue, "vue"),
  ]);
  return { react, vue, reactHtml, vueHtml };
}

function DocsSection({
  id,
  title,
  intro,
  className = "py-8",
  introClassName,
  children,
}: {
  id: string;
  title: ReactNode;
  intro: ReactNode;
  className?: string;
  introClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-6", className)}>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className={cn("text-muted-foreground mt-2 text-sm", introClassName)}>
        {intro}
      </p>
      {children}
    </section>
  );
}

function PreviewBox({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-linear-to-b from-muted/50 to-muted/20 flex min-h-28 items-center justify-center rounded-xl border border-dashed p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ExampleSection({
  id,
  sourceKey,
  title,
  description,
  Preview,
  extra,
  source,
}: Omit<Example, "key"> & {
  id: string;
  sourceKey: string;
  source: HighlightedPair;
}) {
  return (
    <DocsSection id={id} title={title} intro={description}>
      {extra}
      <PreviewBox className="mt-4">
        <Preview />
      </PreviewBox>
      <div className="mt-4">
        <InstallCommand
          reactUrl={itemUrl(`react/toast-${sourceKey}`)}
          vueUrl={itemUrl(`vue/toast-${sourceKey}`)}
        />
      </div>
      <div className="mt-4">
        <FrameworkCodeFrame
          react={{ code: source.react, html: source.reactHtml }}
          vue={{ code: source.vue, html: source.vueHtml }}
          collapsible
        />
      </div>
    </DocsSection>
  );
}

export default async function DocsPage() {
  const [sources, snippets, themingHtml] = await Promise.all([
    Promise.all(
      ["default", ...EXAMPLES.map((e) => e.key)].map(async (key) => {
        const [react, vue] = await Promise.all([
          getSource(`react/toast-${key}`),
          getSource(`vue/toast-${key}`),
        ]);
        return [key, await highlightPair(react, vue)] as const;
      }),
    ).then((entries) => Object.fromEntries(entries)),
    Promise.all(
      Object.entries(SNIPPETS).map(
        async ([key, s]) => [key, await highlightPair(s.react, s.vue)] as const,
      ),
    ).then((entries) => Object.fromEntries(entries)),
    highlight(THEMING_CSS, "css"),
  ]);

  const snippet = (
    key: string,
    reactFilename?: string,
    vueFilename?: string,
  ) => (
    <FrameworkCodeFrame
      react={{
        code: snippets[key].react,
        html: snippets[key].reactHtml,
        filename: reactFilename,
      }}
      vue={{
        code: snippets[key].vue,
        html: snippets[key].vueHtml,
        filename: vueFilename,
      }}
    />
  );

  return (
    <FrameworkProvider>
      <div className="relative">
        <HeroWaves className="h-[480px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
          <SiteHeader
            title="Documentation"
            subtitle="One API, both React and Vue. Copy, paste, own it."
            actions={<PlaygroundLink />}
          />

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="lg:w-52 lg:shrink-0">
              <DocsToc groups={TOC_GROUPS} />
            </aside>

            <main className="divide-border flex min-w-0 flex-1 flex-col divide-y">
              <DocsSection
                id="installation"
                title="Installation"
                className="pb-8"
                intro={
                  <>
                    The registry is served as JSON. Add it with the shadcn CLI
                    and the files land in <Chip>components/ui/sapa-toast/</Chip>
                    .
                  </>
                }
              >
                <div className="mt-4 w-full">
                  <InstallCommand
                    reactUrl={itemUrl("react/toaster")}
                    vueUrl={itemUrl("vue/toaster")}
                  />
                </div>
              </DocsSection>

              <DocsSection
                id="setup"
                title="Mount the Toaster"
                intro={
                  <>
                    Render <Chip>&lt;Toaster /&gt;</Chip> once, near the root of
                    your app. After that you can call <Chip>toast()</Chip> from
                    anywhere.
                  </>
                }
              >
                <div className="mt-4">
                  {snippet("setup", "app/layout.tsx", "App.vue")}
                </div>
              </DocsSection>

              <ExampleSection
                id="basic"
                sourceKey="default"
                title="Basic usage"
                description={
                  <>
                    Call <Chip>toast()</Chip> with a message. Everything else is
                    optional.
                  </>
                }
                Preview={ToastDefault}
                source={sources.default}
              />

              <DocsSection
                id="loading"
                title="Loading & dismiss"
                intro={
                  <>
                    <Chip>toast.loading()</Chip> persists until you dismiss or
                    replace it. Every call returns an id you can pass to{" "}
                    <Chip>toast.dismiss()</Chip>.
                  </>
                }
              >
                <div className="mt-4">{snippet("loading")}</div>
              </DocsSection>

              {EXAMPLES.map(({ key, ...example }) => (
                <ExampleSection
                  key={key}
                  id={key}
                  sourceKey={key}
                  source={sources[key]}
                  {...example}
                />
              ))}

              <DocsSection
                id="options"
                title="Options"
                introClassName="mb-4"
                intro={
                  <>
                    The second argument of every <Chip>toast()</Chip> call. It
                    works the same in React and Vue.
                  </>
                }
              >
                <ReferenceTable rows={OPTIONS} />
              </DocsSection>

              <DocsSection
                id="toaster-props"
                title="<Toaster> props"
                introClassName="mb-4"
                intro="Defaults for the mounted toaster."
              >
                <ReferenceTable rows={TOASTER_PROPS} />
              </DocsSection>

              <DocsSection
                id="theming"
                title="Custom colors"
                className="pb-96 pt-8"
                intro={
                  <>
                    The rich colors come from four semantic CSS variables:{" "}
                    <Chip>--sapa-success</Chip>, <Chip>--sapa-error</Chip>,{" "}
                    <Chip>--sapa-warning</Chip> and <Chip>--sapa-info</Chip>.
                    The toast&apos;s <Chip>type</Chip> picks one and uses it
                    twice. It tints the round icon tile (a soft wash plus the
                    glyph), and it paints the thin countdown ring around that
                    tile, or the bar inside the card when you pass a{" "}
                    <Chip>progress</Chip> value. The <Chip>theme</Chip> registry
                    item installs the variables into your project on setup. To
                    re-brand the toast, override them in your own{" "}
                    <Chip>globals.css</Chip>. The components stay as they are.
                  </>
                }
              >
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
                  Flip the theme to see both palettes:
                </p>
                <PreviewBox>
                  <ToastTypes />
                </PreviewBox>
              </DocsSection>
            </main>
          </div>

          <SiteFooter />
        </div>
      </div>
    </FrameworkProvider>
  );
}
