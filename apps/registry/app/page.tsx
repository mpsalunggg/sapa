import { Github } from "lucide-react";

import { BASE_URL, getSource, itemUrl } from "@/lib/registry";
import { CodeTabs } from "@/components/code-tabs";
import { InstallCommand } from "@/components/install-command";
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
] as const;

export default async function Home() {
  const sources = await Promise.all(
    VARIANTS.map(async (v) => ({
      key: v.key,
      react: await getSource(`react/toast-${v.key}`),
      vue: await getSource(`vue/toast-${v.key}`),
    })),
  );
  const sourceMap = Object.fromEntries(sources.map((s) => [s.key, s]));

  return (
    <>
      <div className="relative overflow-hidden">
        <HeroWaves />
        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-10">
          <header className="mb-12 flex items-center justify-between">
            <span className="text-xl font-extrabold tracking-tight">Sapa.</span>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/mpsalunggg/sapa"
                className="inline-flex size-9 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </a>
              <ThemeToggle />
            </div>
          </header>

          <section>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
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

                <h1 className="mt-5 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
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

              <div className="hidden lg:block">
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

            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {VARIANTS.map(({ key, title, description, Preview }) => (
                <div
                  key={key}
                  id={key}
                  className="flex min-w-0 scroll-mt-6 flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-md"
                >
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed bg-gradient-to-b from-muted/50 to-muted/20 p-4">
                    <Preview />
                  </div>
                  <InstallCommand
                    reactUrl={itemUrl(`react/toast-${key}`)}
                    vueUrl={itemUrl(`vue/toast-${key}`)}
                  />
                  <CodeTabs
                    reactCode={sourceMap[key].react}
                    vueCode={sourceMap[key].vue}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          Sapa · registry served from{" "}
          <code className="text-xs">{BASE_URL}/r</code>
        </footer>
      </div>
    </>
  );
}
