"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";

import {
  EMPTY_OVERRIDES,
  SAPA_DEFAULTS,
  type ThemeMode,
  type TokenOverrides,
} from "@/components/theme-customizer";

export type ToastLayout = "stack" | "list";

const ToastLayoutContext = createContext<{
  layout: ToastLayout;
  setLayout: (l: ToastLayout) => void;
} | null>(null);

export function useToastLayout() {
  const ctx = useContext(ToastLayoutContext);
  if (!ctx) {
    throw new Error("useToastLayout must be used within <Providers>");
  }
  return ctx;
}

const STORAGE_KEY = "sapa-theme-overrides";
const ALL_TOKENS = Object.keys(SAPA_DEFAULTS.light);

const ThemeOverridesContext = createContext<{
  overrides: TokenOverrides;
  setOverrides: (o: TokenOverrides) => void;
} | null>(null);

export function useThemeOverrides() {
  const ctx = useContext(ThemeOverridesContext);
  if (!ctx) {
    throw new Error("useThemeOverrides must be used within <Providers>");
  }
  return ctx;
}

/** Holds the live rich-color overrides, persists them, and applies the active
 *  mode's overrides as inline custom properties on <html> so every real toast
 *  (and --sapa-* accent) recolors live. Must live inside <ThemeProvider>. */
function ThemeOverridesProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [overrides, setOverrides] = useState<TokenOverrides>(EMPTY_OVERRIDES);
  const loadedRef = useRef(false);

  // Load persisted overrides once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TokenOverrides>;
        setOverrides({
          light: parsed.light ?? {},
          dark: parsed.dark ?? {},
        });
      }
    } catch {
      /* ignore malformed storage */
    }
    loadedRef.current = true;
  }, []);

  // Persist after the initial load so we never clobber stored values with the
  // empty default.
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [overrides]);

  // Apply the active mode's overrides to <html> inline; clear the rest so the
  // stylesheet defaults win for untouched tokens.
  useEffect(() => {
    const mode: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";
    const active = overrides[mode];
    const el = document.documentElement;
    for (const name of ALL_TOKENS) {
      if (active[name]) el.style.setProperty(name, active[name]);
      else el.style.removeProperty(name);
    }
  }, [overrides, resolvedTheme]);

  return (
    <ThemeOverridesContext.Provider value={{ overrides, setOverrides }}>
      {children}
    </ThemeOverridesContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<ToastLayout>("stack");
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastLayoutContext.Provider value={{ layout, setLayout }}>
        <ThemeOverridesProvider>{children}</ThemeOverridesProvider>
      </ToastLayoutContext.Provider>
    </ThemeProvider>
  );
}
