"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

const btn =
  "inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted";

export default function ToastVariants() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.success("Berhasil dijalankan", { variant: "filled" })
        }
      >
        Filled
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => toast.info("Jalankan operasi", { variant: "outline" })}
      >
        Outline
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.warning("Perubahan disimpan", { variant: "accent" })
        }
      >
        Accent
      </button>
    </div>
  );
}
