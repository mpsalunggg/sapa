"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

const btn =
  "inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted";

export default function ToastTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => toast.success("Changes saved", { richColors: true })}
      >
        Success
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.error("Something went wrong", { richColors: true })
        }
      >
        Error
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.warning("Your session is about to expire", {
            richColors: true,
          })
        }
      >
        Warning
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.info("A new update is available", { richColors: true })
        }
      >
        Info
      </button>
    </div>
  );
}
