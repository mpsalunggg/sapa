"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"
import { FrameworkTabs } from "@/components/framework-tabs"

function Code({ code }: { code: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {open ? "Hide code" : "Show code"}
        </button>
        <CopyButton value={code} />
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-3 font-mono text-xs leading-relaxed",
          !open && "max-h-40 overflow-y-hidden opacity-70"
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function CodeTabs({
  reactCode,
  vueCode,
}: {
  reactCode: string
  vueCode: string
}) {
  return (
    <FrameworkTabs
      react={<Code code={reactCode} />}
      vue={<Code code={vueCode} />}
    />
  )
}
