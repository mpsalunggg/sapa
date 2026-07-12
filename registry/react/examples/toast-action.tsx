"use client"

import { toast } from "@/components/ui/toaster"

export default function ToastAction() {
  return (
    <button
      type="button"
      onClick={() =>
        toast("File deleted", {
          description: "report-2026.pdf was moved to trash.",
          duration: 8000,
          action: {
            label: "Undo",
            onClick: () => toast.success("Restored"),
          },
          cancel: { label: "Dismiss" },
        })
      }
      className="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    >
      With action
    </button>
  )
}
