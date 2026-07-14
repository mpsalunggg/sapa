"use client";

import { toast } from "@/components/ui/sapa-toast/toaster";

export function TryToasts() {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Say hi"
        onClick={() =>
          toast("Halo 👋", {
            description: "That was Sapa — a toast you own.",
          })
        }
        className="origin-bottom-right cursor-pointer text-4xl leading-none transition-transform duration-300 hover:-rotate-12 hover:scale-110"
      >
        👋
      </button>
      <span className="font-display text-muted-foreground text-lg italic">
        click the wave to say hi
      </span>
    </div>
  );
}
