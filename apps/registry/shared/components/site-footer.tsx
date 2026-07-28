import { cn } from "@/lib/utils";

export function SiteFooter({
  baseUrl,
  className,
}: {
  baseUrl: string;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "text-muted-foreground mt-16 border-t pt-6 text-sm",
        className,
      )}
    >
      Sapa · registry served from <code className="text-xs">{baseUrl}/r</code>
    </footer>
  );
}
