"use client"

import { toast } from "@/components/ui/sapa-toast/toaster"
import type { ToastPosition } from "@/components/ui/sapa-toast/toast-store"

const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]

export default function ToastPositions() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {POSITIONS.map((position) => (
        <button
          key={position}
          type="button"
          onClick={() => toast(position, { position, richColors: true, type: "info" })}
          className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-muted"
        >
          {position}
        </button>
      ))}
    </div>
  )
}
