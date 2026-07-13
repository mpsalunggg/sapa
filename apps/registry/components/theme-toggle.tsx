"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group inline-flex size-9 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:border-sapa-warning/40 hover:bg-linear-to-br hover:from-sapa-warning/15 hover:to-sapa-error/10 hover:shadow-xl"
    >
      {mounted && isDark ? (
        <Sun className="size-4 transition-colors group-hover:text-sapa-warning" />
      ) : (
        <Moon className="size-4 transition-colors group-hover:text-sapa-info" />
      )}
    </button>
  )
}
