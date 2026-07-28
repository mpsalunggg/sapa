"use client";

import { ThemeProvider } from "next-themes";

import { ThemeOverridesProvider } from "@/features/theming/theme-overrides-context";
import { ToastLayoutProvider } from "@/features/toast/toast-layout-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastLayoutProvider>
        <ThemeOverridesProvider>{children}</ThemeOverridesProvider>
      </ToastLayoutProvider>
    </ThemeProvider>
  );
}
