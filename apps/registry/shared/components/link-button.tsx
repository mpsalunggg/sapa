import Link from "next/link";

import { cn } from "@/lib/utils";
import { chromeSurface } from "@/shared/lib/styles";

const chromeText = "text-muted-foreground hover:text-foreground";

export function IconLinkButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(chromeSurface, chromeText, "size-9")}
    >
      {children}
    </Link>
  );
}

export function NavLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        chromeSurface,
        chromeText,
        "h-9 gap-1.5 px-3.5 text-sm font-medium",
      )}
    >
      {children}
    </Link>
  );
}

export function GradientLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-linear-to-br from-sapa-warning via-sapa-error to-sapa-info bg-size-[200%_200%] shadow-sapa-error/25 hover:shadow-sapa-error/40 group inline-flex h-9 items-center gap-1.5 rounded-md bg-left px-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-right hover:shadow-xl"
    >
      {children}
    </Link>
  );
}
