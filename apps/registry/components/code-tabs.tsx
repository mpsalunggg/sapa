"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"
import { FrameworkTabs } from "@/components/framework-tabs"

function Code({ code, html }: { code: string; html: string }) {
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
      <div
        className={cn(
          "shiki-code overflow-x-auto p-3 font-mono text-xs leading-relaxed",
          !open && "max-h-40 overflow-y-hidden opacity-70"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

export function CodeTabs({
  reactCode,
  vueCode,
  reactHtml,
  vueHtml,
}: {
  reactCode: string
  vueCode: string
  reactHtml: string
  vueHtml: string
}) {
  return (
    <FrameworkTabs
      react={<Code code={reactCode} html={reactHtml} />}
      vue={<Code code={vueCode} html={vueHtml} />}
    />
  )
}
