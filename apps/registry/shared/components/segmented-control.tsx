"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/** The one small pill-shaped switch used for every either/or choice in the
 *  showcase — framework (React/Vue), toast layout (stack/list), and the
 *  playground's own copies of both. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  itemClassName,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div
      className={cn(
        "bg-muted/50 inline-flex rounded-md border p-0.5 text-xs",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors",
            value === o.value
              ? "bg-linear-to-br from-sapa-warning to-sapa-error text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
            itemClassName,
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
