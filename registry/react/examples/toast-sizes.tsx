"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

const btn =
  "inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted";

export default function ToastSizes() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => toast.info("Ukuran kecil", { size: "sm" })}
      >
        Small
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => toast.info("Ukuran default", { size: "default" })}
      >
        Default
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => toast.info("Ukuran besar", { size: "lg" })}
      >
        Large
      </button>
    </div>
  );
}
