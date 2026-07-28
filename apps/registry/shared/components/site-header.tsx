import { ArrowLeft, Github } from "lucide-react";

import { GradientDot } from "@/shared/components/gradient-dot";
import { IconLinkButton } from "@/shared/components/link-button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { GITHUB_URL } from "@/shared/lib/site";

/** Header for the inner pages (docs, playground): a back arrow, the page
 *  title + tagline, then the page's own call to action followed by the
 *  GitHub link and theme toggle that every page carries. */
export function SiteHeader({
  title,
  subtitle,
  backHref = "/",
  actions,
}: {
  title: string;
  subtitle: string;
  backHref?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <IconLinkButton href={backHref} label="Back to home">
          <ArrowLeft className="size-4" />
        </IconLinkButton>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {title}
            <GradientDot />
          </h1>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <IconLinkButton href={GITHUB_URL} external label="GitHub">
          <Github className="size-4" />
        </IconLinkButton>
        <ThemeToggle />
      </div>
    </header>
  );
}
