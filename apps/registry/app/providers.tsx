"use client"

import { createContext, useContext, useState } from "react"
import { ThemeProvider } from "next-themes"

export type ToastLayout = "stack" | "list"

const ToastLayoutContext = createContext<{
  layout: ToastLayout
  setLayout: (l: ToastLayout) => void
} | null>(null)

export function useToastLayout() {
  const ctx = useContext(ToastLayoutContext)
  if (!ctx) {
    throw new Error("useToastLayout must be used within <Providers>")
  }
  return ctx
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<ToastLayout>("stack")
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastLayoutContext.Provider value={{ layout, setLayout }}>
        {children}
      </ToastLayoutContext.Provider>
    </ThemeProvider>
  )
}
