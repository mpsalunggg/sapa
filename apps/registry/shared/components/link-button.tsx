import Link from "next/link";

import { cn } from "@/lib/utils";

/** The bordered chrome surface shared by every header button: sits on the
 *  background, lifts on hover with a warm warning→error tint. Exported so
 *  non-link buttons (e.g. the theme toggle) can wear the same skin. */
export const chromeSurface =
  "bg-background hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 group inline-flex items-center justify-center rounded-md border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl";

const chromeText = "text-muted-foreground hover:text-foreground";

function Anchor({
  href,
  external,
  className,
  label,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  /** aria-label, for buttons whose content is icon-only. */
  label?: string;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} aria-label={label} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

/** Square icon-only chrome button — back arrow, GitHub. */
export function IconLinkButton({
  href,
  external,
  label,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Anchor
      href={href}
      external={external}
      label={label}
      className={cn(chromeSurface, chromeText, "size-9", className)}
    >
      {children}
    </Anchor>
  );
}

/** Icon + label chrome button — the secondary nav links (Docs). */
export function NavLinkButton({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Anchor
      href={href}
      external={external}
      className={cn(
        chromeSurface,
        chromeText,
        "h-9 gap-1.5 px-3.5 text-sm font-medium",
        className,
      )}
    >
      {children}
    </Anchor>
  );
}

/** The primary call to action — a shifting three-stop gradient (Playground). */
export function GradientLinkButton({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Anchor
      href={href}
      external={external}
      className={cn(
        "bg-linear-to-br from-sapa-warning via-sapa-error to-sapa-info bg-size-[200%_200%] shadow-sapa-error/25 hover:shadow-sapa-error/40 group inline-flex h-9 items-center gap-1.5 rounded-md bg-left px-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-right hover:shadow-xl",
        className,
      )}
    >
      {children}
    </Anchor>
  );
}
