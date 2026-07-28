"use client";

import { Toaster } from "@/components/ui/sapa-toast/toaster";
import { useToastLayout } from "@/features/toast/toast-layout-context";

/** Global toaster whose layout (stack vs list) follows the showcase toggle. */
export function SapaToaster() {
  const { layout } = useToastLayout();
  return <Toaster position="bottom-right" expand={layout === "list"} />;
}
