import { cn } from "@/lib/utils";
import Link from "next/link";

export function SiteFooter({
  baseUrl,
  version,
  className,
}: {
  baseUrl: string;
  version?: string | null;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "text-muted-foreground mt-16 flex flex-wrap items-center gap-x-2 gap-y-2 border-t pt-6 text-sm",
        className,
      )}
    >
      <span>
        Sapa · registry served from <code className="text-xs">{baseUrl}/r</code>
      </span>
      {version && (
        <Link
          href="/changelog"
          className="hover:border-sapa-warning/40 hover:text-foreground rounded-full border px-2 py-0.5 font-mono text-xs transition-colors"
        >
          v{version}
        </Link>
      )}
    </footer>
  );
}
