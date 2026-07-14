"use client";

import { cn } from "@/lib/utils";
import { useToastLayout, type ToastLayout } from "@/app/providers";

const OPTIONS: { key: ToastLayout; label: string }[] = [
  { key: "stack", label: "Stack" },
  { key: "list", label: "List" },
];

/** Segmented control to switch the global toaster between stacked and flat list. */
export function ToastLayoutToggle({ className }: { className?: string }) {
  const { layout, setLayout } = useToastLayout();
  return (
    <div
      className={cn(
        "bg-muted/50 inline-flex rounded-md border p-0.5 text-xs",
        className,
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => setLayout(o.key)}
          className={cn(
            "rounded px-2.5 py-1 font-medium transition-colors",
            layout === o.key
              ? "bg-linear-to-br from-sapa-warning to-sapa-error text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
