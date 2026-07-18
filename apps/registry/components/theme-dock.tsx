"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useThemeOverrides } from "@/app/providers";
import { ThemeCustomizer } from "@/components/theme-customizer";

/** Global floating "live theme" editor. A palette button (bottom-left, clear of
 *  the bottom-right toaster) opens a popover that drives the rich-color tokens
 *  for every real toast on the page. */
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
    <div ref={rootRef} className="fixed bottom-4 right-4 z-40">
      {open && (
        <div
          role="dialog"
          aria-label="Live theme editor"
          className="bg-popover/95 text-popover-foreground animate-in fade-in slide-in-from-bottom-2 absolute bottom-12 right-0 w-72 rounded-xl border shadow-xl backdrop-blur duration-200"
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
            ? "border-sapa-warning/40 bg-linear-to-br from-sapa-warning/15 to-sapa-error/10"
            : "text-muted-foreground hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:text-foreground",
        )}
      >
        <Palette
          className={cn(
            "size-4 transition-colors",
            open ? "text-sapa-error" : "group-hover:text-sapa-warning",
          )}
        />
      </button>
    </div>
  );
}
