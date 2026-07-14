import Link from "next/link";
import { BookOpen, Github, Play } from "lucide-react";

import { BASE_URL, itemUrl } from "@/lib/registry";
import { InstallCommand } from "@/components/install-command";
import {
  FrameworkProvider,
  FrameworkSwitch,
} from "@/components/framework-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReactLogo, VueLogo } from "@/components/logos";
import { HeroToastPreview } from "@/components/hero-toast-preview";
import { HeroWaves } from "@/components/hero-waves";
import { TryToasts } from "@/components/try-toasts";

export default function Home() {
  return (
    <FrameworkProvider>
      <div className="relative flex min-h-svh flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60svh] overflow-hidden">
          <HeroWaves />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
          <header className="mb-12 flex items-center justify-between">
            <span className="font-display rounded-xl text-3xl font-semibold tracking-tight">
              Sapa
              <span className="bg-linear-to-br from-sapa-warning to-sapa-error bg-clip-text text-transparent">
                .
              </span>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/docs"
                className="bg-background text-muted-foreground hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground group inline-flex h-9 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <BookOpen className="size-3.5" />
                Docs
              </Link>
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

          <section className="flex flex-1 items-center">
            <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="min-w-0">
                <div className="bg-background inline-flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-xs font-medium">
                  <span className="flex items-center -space-x-1.5">
                    <span className="bg-background flex size-6 items-center justify-center rounded-full border">
                      <ReactLogo className="size-3.5" />
                    </span>
                    <span className="bg-background flex size-6 items-center justify-center rounded-full border">
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
                <p className="text-muted-foreground mt-4 max-w-xl text-pretty text-lg leading-relaxed">
                  Hand-built toasts you actually own — no black boxes. One
                  command drops the source straight into your{" "}
                  <span className="text-foreground font-semibold">React</span>{" "}
                  or <span className="text-foreground font-semibold">Vue</span>{" "}
                  app. One design, both frameworks.
                </p>

                <div className="mt-7 max-w-xl">
                  <div className="mb-2">
                    <FrameworkSwitch />
                  </div>
                  <InstallCommand
                    reactUrl={itemUrl("react/toaster")}
                    vueUrl={itemUrl("vue/toaster")}
                  />
                </div>
                <div className="mt-7">
                  <TryToasts />
                </div>
              </div>

              <div className="hidden sm:block">
                <HeroToastPreview />
              </div>
            </div>
          </section>

          <footer className="text-muted-foreground mt-8 border-t pt-6 text-sm">
            Sapa · registry served from{" "}
            <code className="text-xs">{BASE_URL}/r</code>
          </footer>
        </div>
      </div>
    </FrameworkProvider>
  );
}
