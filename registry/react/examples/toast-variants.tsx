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
          toast.success("Payment received", {
            description: "Invoice #1042 has been paid in full.",
            variant: "solid",
          })
        }
      >
        Solid
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.info("New sign-in", {
            description: "Chrome on macOS · Jakarta, Indonesia",
            variant: "minimal",
          })
        }
      >
        Minimal
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          toast.warning("Storage almost full", {
            description: "92% of 20 GB used on acme-eu-west.",
            variant: "subtle",
          })
        }
      >
        Subtle
      </button>
    </div>
  );
}
