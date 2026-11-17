"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { chromeSurface } from "@/shared/lib/styles";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(chromeSurface, "text-muted-foreground size-9")}
    >
      <Sun className="group-hover:text-sapa-warning hidden size-4 transition-colors dark:block" />
      <Moon className="group-hover:text-sapa-info size-4 transition-colors dark:hidden" />
    </button>
  );
}
