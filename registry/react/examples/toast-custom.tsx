"use client"

import { toast } from "@/components/ui/sapa-toast/toaster"

export default function ToastCustom() {
  return (
    <button
      type="button"
      onClick={() =>
        toast.custom(
          <div className="flex items-center gap-3">
            <img
              src="https://avatars.githubusercontent.com/u/124599?v=4"
              alt=""
              className="size-10 rounded-full"
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Olivia Martin</p>
              <p className="text-xs text-muted-foreground">
                sent you a friend request
              </p>
            </div>
            <button
              type="button"
              className="ml-2 inline-flex h-7 items-center rounded-md bg-foreground px-2.5 text-xs font-medium text-background"
              onClick={() => toast.success("Accepted")}
            >
              Accept
            </button>
          </div>,
          { duration: 6000 }
        )
      }
      className="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    >
      Custom content
    </button>
  )
}
