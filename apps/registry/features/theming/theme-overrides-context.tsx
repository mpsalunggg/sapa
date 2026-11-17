"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import {
  EMPTY_OVERRIDES,
  TOKEN_ORDER,
  type ThemeMode,
  type TokenOverrides,
} from "@/features/theming/theme-tokens";

const STORAGE_KEY = "sapa-theme-overrides";

const ThemeOverridesContext = createContext<{
  overrides: TokenOverrides;
  setOverrides: (o: TokenOverrides) => void;
} | null>(null);

export function useThemeOverrides() {
  const ctx = useContext(ThemeOverridesContext);
  if (!ctx) {
    throw new Error(
      "useThemeOverrides must be used within <ThemeOverridesProvider>",
    );
  }
  return ctx;
}

export function useThemeMode(): ThemeMode {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? "dark" : "light";
}

function loadOverrides(): TokenOverrides {
  if (typeof window === "undefined") return EMPTY_OVERRIDES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_OVERRIDES;
    const parsed = JSON.parse(raw) as Partial<TokenOverrides>;
    return { light: parsed.light ?? {}, dark: parsed.dark ?? {} };
  } catch {
    return EMPTY_OVERRIDES;
  }
}

export function ThemeOverridesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = useThemeMode();
  const [overrides, setOverrides] = useState(loadOverrides);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      return;
    }
  }, [overrides]);

  useEffect(() => {
    const active = overrides[mode];
    const el = document.documentElement;
    for (const name of TOKEN_ORDER) {
      if (active[name]) el.style.setProperty(name, active[name]);
      else el.style.removeProperty(name);
    }
  }, [overrides, mode]);

  return (
    <ThemeOverridesContext.Provider value={{ overrides, setOverrides }}>
      {children}
    </ThemeOverridesContext.Provider>
  );
}
