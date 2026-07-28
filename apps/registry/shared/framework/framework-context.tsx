"use client";

import { createContext, useContext, useState } from "react";

export type Framework = "react" | "vue";

const FrameworkContext = createContext<{
  framework: Framework;
  setFramework: (f: Framework) => void;
} | null>(null);

export function FrameworkProvider({ children }: { children: React.ReactNode }) {
  const [framework, setFramework] = useState<Framework>("react");
  return (
    <FrameworkContext.Provider value={{ framework, setFramework }}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const ctx = useContext(FrameworkContext);
  if (!ctx) {
    throw new Error("useFramework must be used within a FrameworkProvider");
  }
  return ctx;
}
