"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="bg-background text-muted-foreground hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 group inline-flex size-9 items-center justify-center rounded-md border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      {mounted && isDark ? (
        <Sun className="group-hover:text-sapa-warning size-4 transition-colors" />
      ) : (
        <Moon className="group-hover:text-sapa-info size-4 transition-colors" />
      )}
    </button>
  );
}
