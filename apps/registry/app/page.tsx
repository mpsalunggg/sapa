import { itemUrl } from "@/shared/lib/registry";
import { InstallCommand } from "@/shared/components/install-command";
import { FrameworkProvider } from "@/shared/framework/framework-context";
import { FrameworkSwitch } from "@/shared/framework/framework-switch";
import { GradientDot } from "@/shared/components/gradient-dot";
import {
  DocsLink,
  HeaderActions,
  PlaygroundLink,
} from "@/shared/components/nav-links";
import { SiteFooter } from "@/shared/components/site-footer";
import { gradientText } from "@/shared/lib/styles";
import { ReactLogo, VueLogo } from "@/features/landing/logos";
import { HeroToastPreview } from "@/features/landing/hero-toast-preview";
import { HeroWaves } from "@/shared/components/hero-waves";
import { SupportLink } from "@/features/landing/support-link";
import { TryToasts } from "@/features/landing/try-toasts";

export default function Home() {
  return (
    <FrameworkProvider>
      <div className="relative flex min-h-svh flex-col overflow-hidden">
        <HeroWaves className="h-[60svh]" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
          <header className="mb-12 flex items-center justify-between">
            <span className="font-display text-3xl font-semibold tracking-tight">
              Sapa
              <GradientDot />
            </span>
            <HeaderActions>
              <DocsLink />
              <PlaygroundLink />
            </HeaderActions>
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
                  A toast system you <span className={gradientText}>own</span>.
                </h1>
                <p className="text-muted-foreground mt-4 max-w-xl text-pretty text-lg leading-relaxed">
                  Hand-built toasts with nothing hidden in a package. One
                  command drops the source straight into your{" "}
                  <span className="text-foreground font-semibold">React</span>{" "}
                  or <span className="text-foreground font-semibold">Vue</span>{" "}
                  app, and both get the same design.
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
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <SupportLink />
                  <TryToasts />
                </div>
              </div>

              <div className="hidden sm:block">
                <HeroToastPreview />
              </div>
            </div>
          </section>

          <SiteFooter className="mt-8" />
        </div>
      </div>
    </FrameworkProvider>
  );
}
