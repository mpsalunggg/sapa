"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

export default function ToastDescription() {
  return (
    <button
      type="button"
      onClick={() =>
        toast.success("Event created", {
          description: "Monday, January 3rd at 6:00pm",
          richColors: true,
        })
      }
      className="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    >
      With description
    </button>
  );
}
