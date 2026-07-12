"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

export function CopyButton({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      aria-label="Copy to clipboard"
      onClick={() => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  )
}
