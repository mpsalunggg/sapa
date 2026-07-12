"use client"

import { toast } from "@/components/ui/sapa-toast/toaster"

function fakeUpload(): Promise<{ name: string }> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      // Randomly resolve/reject to show both branches.
      Math.round(Date.now() / 1000) % 2 === 0
        ? resolve({ name: "avatar.png" })
        : reject(new Error("Network error"))
    }, 1800)
  )
}

export default function ToastPromise() {
  return (
    <button
      type="button"
      onClick={() =>
        toast.promise(fakeUpload(), {
          loading: "Uploading file…",
          success: (data) => `${data.name} uploaded`,
          error: (err) => `Upload failed: ${(err as Error).message}`,
        })
      }
      className="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    >
      Promise
    </button>
  )
}
