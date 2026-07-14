"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

const MESSAGES = [
  "Event has been created",
  "Your report is ready",
  "New comment on your post",
  "Payment received",
  "Deployment finished",
] as const;

export default function ToastStack() {
  return (
    <button
      type="button"
      onClick={() => {
        MESSAGES.forEach((m, i) =>
          setTimeout(() => toast(m, { description: "Just now" }), i * 220),
        );
      }}
      className="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    >
      Stack toasts
    </button>
  );
}
