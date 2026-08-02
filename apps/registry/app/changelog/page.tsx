import { BookOpen } from "lucide-react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";

import { getReleases } from "@/features/changelog/changelog";
import { Chip } from "@/features/docs/chip";
import { HeroWaves } from "@/shared/components/hero-waves";
import { NavLinkButton } from "@/shared/components/link-button";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import { BASE_URL } from "@/shared/lib/registry";

export const metadata = {
  title: "Sapa — Changelog",
  description:
    "Every release of the Sapa toast registry, and the files each one touched.",
};

const COMPONENTS: Components = {
  h3: ({ children }) => (
    <h3 className="font-display text-muted-foreground mt-7 flex items-center gap-1.5 text-[0.95rem] italic">
      {children}
      <span
        aria-hidden
        className="bg-linear-to-br from-sapa-warning to-sapa-error size-1.5 rounded-full"
      />
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-3 flex flex-col gap-2.5">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="text-muted-foreground relative pl-4 text-sm leading-relaxed">
      <span
        aria-hidden
        className="bg-border absolute left-0 top-[0.6rem] size-1 rounded-full"
      />
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="text-foreground font-semibold">{children}</strong>
  ),
  code: ({ children }) => <Chip>{children}</Chip>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-foreground underline underline-offset-4 hover:no-underline"
    >
      {children}
    </a>
  ),
};

export default async function ChangelogPage() {
  const releases = await getReleases();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden">
        <HeroWaves />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-8">
        <SiteHeader
          title="Changelog"
          subtitle="Every release, and the files it touched."
          actions={
            <NavLinkButton href="/docs">
              <BookOpen className="size-3.5" />
              Docs
            </NavLinkButton>
          }
        />

        <main className="divide-border flex flex-col divide-y">
          {releases.map((release) => (
            <section
              key={release.version}
              id={`v${release.version}`}
              className="scroll-mt-6 py-8 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  v{release.version}
                </h2>
                {release.date && (
                  <time
                    dateTime={release.date}
                    className="text-muted-foreground font-mono text-xs"
                  >
                    {release.date}
                  </time>
                )}
              </div>
              <Markdown components={COMPONENTS}>{release.body}</Markdown>
            </section>
          ))}
        </main>

        <SiteFooter baseUrl={BASE_URL} version={releases[0]?.version} />
      </div>
    </div>
  );
}
