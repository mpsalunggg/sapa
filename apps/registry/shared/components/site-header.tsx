import { ArrowLeft } from "lucide-react";

import { GradientDot } from "@/shared/components/gradient-dot";
import { IconLinkButton } from "@/shared/components/link-button";
import { HeaderActions } from "@/shared/components/nav-links";

export function SiteHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <IconLinkButton href="/" label="Back to home">
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
      <HeaderActions>{actions}</HeaderActions>
    </header>
  );
}
