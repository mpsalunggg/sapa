"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useThemeOverrides } from "@/app/providers";
import { ThemeCustomizer } from "@/components/theme-customizer";

/** Global floating "live theme" editor. A palette button pinned to the
 *  center-right of the viewport opens a popover that drives the rich-color
 *  tokens for every real toast on the page. The palette icon itself carries a
 *  red → green → blue gradient stroke (sapa error / success / info tokens). */
export function ThemeDock() {
  const { overrides, setOverrides } = useThemeOverrides();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on Escape or a click outside the dock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="fixed right-4 top-1/2 z-40 -translate-y-1/2">
      {/* Hidden defs: red → green → blue gradient for the palette icon stroke. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="sapa-rgb-icon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--sapa-error)" />
            <stop offset="50%" stopColor="var(--sapa-success)" />
            <stop offset="100%" stopColor="var(--sapa-info)" />
          </linearGradient>
        </defs>
      </svg>

      {open && (
        <div
          role="dialog"
          aria-label="Live theme editor"
          className="bg-popover/95 text-popover-foreground animate-in fade-in slide-in-from-right-2 absolute right-12 top-1/2 w-72 -translate-y-1/2 rounded-xl border shadow-xl backdrop-blur duration-200"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="font-display text-sm font-semibold">
              Live theme
              <span className="bg-linear-to-br from-sapa-warning to-sapa-error bg-clip-text text-transparent">
                .
              </span>
            </span>
            <button
              type="button"
              aria-label="Close theme editor"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="max-h-[70svh] overflow-y-auto py-3">
            <ThemeCustomizer overrides={overrides} onChange={setOverrides} />
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label="Customize theme"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "bg-background group inline-flex size-10 items-center justify-center rounded-full border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl",
          open
            ? "border-sapa-info/40 bg-linear-to-br from-sapa-error/15 via-sapa-success/15 to-sapa-info/15"
            : "hover:border-sapa-info/40 hover:bg-linear-to-br hover:from-sapa-error/15 hover:via-sapa-success/15 hover:to-sapa-info/15",
        )}
      >
        <Palette
          className="size-4 transition-transform group-hover:scale-110"
          style={{ stroke: "url(#sapa-rgb-icon)" }}
        />
      </button>
    </div>
  );
}
