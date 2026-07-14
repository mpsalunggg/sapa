"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

function startUpload() {
  let value = 0;
  const id = toast.progress("Uploading avatar.png…", {
    value,
    description: "0%",
  });

  const timer = setInterval(() => {
    value = Math.min(100, value + Math.round(8 + Math.random() * 14));
    toast.progress("Uploading avatar.png…", {
      id,
      value,
      description: `${value}%`,
    });

    if (value >= 100) {
      clearInterval(timer);
      // Transition the same toast in place once the work is done —
      // clearing `progress` removes the bar from the success toast.
      toast.success("avatar.png uploaded", {
        id,
        description: undefined,
        progress: undefined,
      });
    }
  }, 350);
}

export default function ToastProgress() {
  return (
    <button
      type="button"
      onClick={startUpload}
      className="bg-background hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium shadow-sm transition-colors"
    >
      Upload file
    </button>
  );
}
