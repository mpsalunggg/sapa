"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { chromeSurface } from "@/shared/components/link-button";

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
      className={cn(chromeSurface, "text-muted-foreground size-9")}
    >
      {mounted && isDark ? (
        <Sun className="group-hover:text-sapa-warning size-4 transition-colors" />
      ) : (
        <Moon className="group-hover:text-sapa-info size-4 transition-colors" />
      )}
    </button>
  );
}
