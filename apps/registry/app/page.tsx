import Link from "next/link";
import { Github, Play } from "lucide-react";

import { BASE_URL, getSource, itemUrl } from "@/lib/registry";
import { highlight } from "@/lib/highlight";
import { CodeTabs } from "@/components/code-tabs";
import { InstallCommand } from "@/components/install-command";
import { FrameworkProvider } from "@/components/framework-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReactLogo, VueLogo } from "@/components/logos";
import { VariantNav } from "@/components/variant-nav";
import { HeroToastPreview } from "@/components/hero-toast-preview";
import { HeroWaves } from "@/components/hero-waves";

import ToastDefault from "@/registry/react/examples/toast-default";
import ToastTypes from "@/registry/react/examples/toast-types";
import ToastDescription from "@/registry/react/examples/toast-description";
import ToastAction from "@/registry/react/examples/toast-action";
import ToastPromise from "@/registry/react/examples/toast-promise";
import ToastCustom from "@/registry/react/examples/toast-custom";
import ToastPositions from "@/registry/react/examples/toast-positions";
import ToastStack from "@/registry/react/examples/toast-stack";

const VARIANTS = [
  {
    key: "default",
    title: "Default",
    description: "A plain toast with a single message.",
    Preview: ToastDefault,
  },
  {
    key: "types",
    title: "Types · rich colors",
    description:
      "Success, error, warning and info with semantic colors + icons.",
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
    description: "Inline action buttons, e.g. undo a destructive change.",
    Preview: ToastAction,
  },
  {
    key: "promise",
    title: "Promise",
    description: "Loading → success/error, driven by a promise.",
    Preview: ToastPromise,
  },
  {
    key: "custom",
    title: "Custom content",
    description: "Render any JSX/markup inside the toast.",
    Preview: ToastCustom,
  },
  {
    key: "positions",
    title: "Positions",
    description: "Six anchor positions, per-toast.",
    Preview: ToastPositions,
  },
  {
    key: "stack",
    title: "Stack",
    description:
      "Toasts collapse into a pile; hover to expand. Keeps things short.",
    Preview: ToastStack,
  },
] as const;

export default async function Home() {
  const sources = await Promise.all(
    VARIANTS.map(async (v) => {
      const react = await getSource(`react/toast-${v.key}`);
      const vue = await getSource(`vue/toast-${v.key}`);
      return {
        key: v.key,
        react,
        vue,
        reactHtml: await highlight(react, "tsx"),
        vueHtml: await highlight(vue, "vue"),
      };
    }),
  );
  const sourceMap = Object.fromEntries(sources.map((s) => [s.key, s]));

  return (
    <FrameworkProvider>
      <div className="relative overflow-hidden">
        <HeroWaves />
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-8 sm:pb-16 sm:pt-10">
          <header className="mb-12 flex items-center justify-between">
            <span className="text-2xl font-extrabold tracking-tight rounded-xl">
              Sapa
              <span className="bg-linear-to-br from-sapa-warning to-sapa-error bg-clip-text text-transparent">
                .
              </span>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/playground"
                className="group inline-flex h-9 items-center gap-1.5 rounded-md bg-linear-to-br from-sapa-warning via-sapa-error to-sapa-info bg-size-[200%_200%] bg-left px-3.5 text-sm font-semibold text-white shadow-lg shadow-sapa-error/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-right hover:shadow-xl hover:shadow-sapa-error/40"
              >
                <Play className="size-3.5" />
                Playground
              </Link>
              <a
                href="https://github.com/mpsalunggg/sapa"
                className="group inline-flex size-9 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground hover:shadow-xl"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </a>
              <ThemeToggle />
            </div>
          </header>

          <section>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border bg-background py-1 pl-1.5 pr-3 text-xs font-medium">
                  <span className="flex items-center -space-x-1.5">
                    <span className="flex size-6 items-center justify-center rounded-full border bg-background">
                      <ReactLogo className="size-3.5" />
                    </span>
                    <span className="flex size-6 items-center justify-center rounded-full border bg-background">
                      <VueLogo className="size-3" />
                    </span>
                  </span>
                  Works with React{" "}
                  <span className="text-muted-foreground">&</span> Vue
                </div>

                <h1 className="mt-5 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  A toast system you{" "}
                  <span className="bg-linear-to-br from-sapa-warning to-sapa-error bg-clip-text text-transparent">
                    own
                  </span>
                  .
                </h1>
                <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                  Hand-built toasts you actually own — no black boxes. One
                  command drops the source straight into your{" "}
                  <span className="font-semibold text-foreground">React</span>{" "}
                  or <span className="font-semibold text-foreground">Vue</span>{" "}
                  app. One design, both frameworks.
                </p>

                <div className="mt-7 max-w-xl">
                  <InstallCommand
                    reactUrl={itemUrl("react/toaster")}
                    vueUrl={itemUrl("vue/toaster")}
                  />
                </div>
                <div className="mt-7">
                  <ToastTypes />
                </div>
              </div>

              <div className="hidden sm:block">
                <HeroToastPreview />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-4">
        <section className="space-y-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="lg:w-52 lg:shrink-0">
              <VariantNav
                items={VARIANTS.map((v) => ({ key: v.key, title: v.title }))}
              />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex min-w-0 flex-col divide-y divide-border">
                {VARIANTS.map(({ key, title, description, Preview }) => (
                  <div
                    key={key}
                    id={key}
                    className="flex min-w-0 scroll-mt-6 flex-col gap-4 py-8 first:pt-0"
                  >
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed bg-linear-to-b from-muted/50 to-muted/20 p-4">
                      <Preview />
                    </div>
                    <InstallCommand
                      reactUrl={itemUrl(`react/toast-${key}`)}
                      vueUrl={itemUrl(`vue/toast-${key}`)}
                    />
                    <CodeTabs
                      reactCode={sourceMap[key].react}
                      vueCode={sourceMap[key].vue}
                      reactHtml={sourceMap[key].reactHtml}
                      vueHtml={sourceMap[key].vueHtml}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          Sapa · registry served from{" "}
          <code className="text-xs">{BASE_URL}/r</code>
        </footer>
      </div>
    </FrameworkProvider>
  );
}
