"use client";

import { createContext, useContext, useState } from "react";

/** How the global toaster stacks its toasts: a collapsible pile, or a flat list. */
export type ToastLayout = "stack" | "list";

const ToastLayoutContext = createContext<{
  layout: ToastLayout;
  setLayout: (l: ToastLayout) => void;
} | null>(null);

export function useToastLayout() {
  const ctx = useContext(ToastLayoutContext);
  if (!ctx) {
    throw new Error("useToastLayout must be used within <ToastLayoutProvider>");
  }
  return ctx;
}

export function ToastLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layout, setLayout] = useState<ToastLayout>("stack");
  return (
    <ToastLayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </ToastLayoutContext.Provider>
  );
}
