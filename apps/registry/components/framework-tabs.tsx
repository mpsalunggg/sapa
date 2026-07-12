"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

export function FrameworkTabs({
  react,
  vue,
}: {
  react: React.ReactNode
  vue: React.ReactNode
}) {
  const [tab, setTab] = useState<"react" | "vue">("react")

  return (
    <div className="min-w-0">
      <div className="mb-2 inline-flex rounded-md border bg-muted/50 p-0.5 text-xs">
        {(["react", "vue"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded px-2.5 py-1 font-medium capitalize transition-colors",
              tab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="min-w-0">{tab === "react" ? react : vue}</div>
    </div>
  )
}
