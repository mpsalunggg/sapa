import { cn } from "@/lib/utils";

export function GradientBullet() {
  return (
    <span
      aria-hidden
      className="bg-linear-to-br from-sapa-warning to-sapa-error size-1.5 rounded-full"
    />
  );
}

export function SidebarLabel({
  children,
  bullet,
}: {
  children: React.ReactNode;
  bullet?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-display text-muted-foreground mb-2 px-3 text-[0.95rem] italic",
        bullet && "flex items-center gap-1.5",
      )}
    >
      {children}
      {bullet && <GradientBullet />}
    </p>
  );
}

export function navItemClass(active: boolean) {
  return cn(
    "relative block rounded-md px-3 py-1.5 text-sm transition-colors",
    active
      ? "bg-linear-to-r from-sapa-warning/15 to-sapa-error/10 text-foreground font-medium"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  );
}

export function ActiveBar() {
  return (
    <span
      aria-hidden
      className="bg-linear-to-b from-sapa-warning to-sapa-error absolute inset-y-1 left-0 hidden w-0.5 rounded-full lg:block"
    />
  );
}
