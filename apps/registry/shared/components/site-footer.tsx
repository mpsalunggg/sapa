import Link from "next/link";

import { cn } from "@/lib/utils";
import { getLatestVersion } from "@/features/changelog/changelog";
import { BASE_URL } from "@/shared/lib/registry";

export async function SiteFooter({ className }: { className?: string }) {
  const version = await getLatestVersion();

  return (
    <footer
      className={cn(
        "text-muted-foreground mt-16 flex flex-wrap items-center gap-2 border-t pt-6 text-sm",
        className,
      )}
    >
      <span>
        Sapa · registry served from{" "}
        <code className="text-xs">{BASE_URL}/r</code>
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
