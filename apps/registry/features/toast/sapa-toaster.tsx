"use client";

import { Toaster } from "@/components/ui/sapa-toast/toaster";
import { useToastLayout } from "@/app/providers";

/** Global toaster whose layout (stack vs list) follows the showcase toggle. */
export function SapaToaster() {
  const { layout } = useToastLayout();
  return <Toaster position="bottom-right" expand={layout === "list"} />;
}
