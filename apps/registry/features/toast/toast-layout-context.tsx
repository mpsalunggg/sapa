"use client";

import { createContext, useContext, useState } from "react";

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
