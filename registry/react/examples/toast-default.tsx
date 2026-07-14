"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

export default function ToastDefault() {
  return (
    <button
      type="button"
      onClick={() => toast("Event has been created")}
      className="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    >
      Show toast
    </button>
  );
}
