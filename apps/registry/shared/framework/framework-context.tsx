"use client";

import { createContext, useContext, useState } from "react";

import { cn } from "@/lib/utils";

type Framework = "react" | "vue";

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

/** The single React/Vue switch that drives every framework-aware block. */
export function FrameworkSwitch({ className }: { className?: string }) {
  const { framework, setFramework } = useFramework();
  return (
    <div
      className={cn(
        "bg-muted/50 inline-flex rounded-md border p-0.5 text-xs",
        className,
      )}
    >
      {(["react", "vue"] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setFramework(key)}
          className={cn(
            "rounded px-2.5 py-1 font-medium capitalize transition-colors",
            framework === key
              ? "bg-linear-to-br from-sapa-warning to-sapa-error text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
