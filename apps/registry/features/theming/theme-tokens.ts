export type ThemeMode = "light" | "dark";

export type TokenOverrides = Record<ThemeMode, Record<string, string>>;

export const EMPTY_OVERRIDES: TokenOverrides = { light: {}, dark: {} };

export const TOKEN_GROUPS = [
  { key: "success", label: "Success" },
  { key: "error", label: "Error" },
  { key: "warning", label: "Warning" },
  { key: "info", label: "Info" },
] as const;

export const SAPA_DEFAULTS: TokenOverrides = {
  light: {
    "--sapa-success": "oklch(0.62 0.17 149)",
    "--sapa-success-foreground": "oklch(0.98 0.02 150)",
    "--sapa-error": "oklch(0.58 0.22 27)",
    "--sapa-error-foreground": "oklch(0.98 0.02 20)",
    "--sapa-warning": "oklch(0.75 0.16 78)",
    "--sapa-warning-foreground": "oklch(0.28 0.07 70)",
    "--sapa-info": "oklch(0.6 0.13 240)",
    "--sapa-info-foreground": "oklch(0.98 0.02 240)",
  },
  dark: {
    "--sapa-success": "oklch(0.7 0.16 150)",
    "--sapa-success-foreground": "oklch(0.16 0.03 150)",
    "--sapa-error": "oklch(0.7 0.19 22)",
    "--sapa-error-foreground": "oklch(0.16 0.04 20)",
    "--sapa-warning": "oklch(0.82 0.16 82)",
    "--sapa-warning-foreground": "oklch(0.2 0.06 70)",
    "--sapa-info": "oklch(0.68 0.14 240)",
    "--sapa-info-foreground": "oklch(0.16 0.03 240)",
  },
};

export const TOKEN_ORDER = Object.keys(SAPA_DEFAULTS.light);

export const BASE_TOKENS = TOKEN_ORDER.filter(
  (t) => !t.endsWith("-foreground"),
);

export function resolveVars(
  overrides: TokenOverrides,
  mode: ThemeMode,
): Record<string, string> {
  return { ...SAPA_DEFAULTS[mode], ...overrides[mode] };
}

export function buildCss(
  overrides: TokenOverrides,
  tokens: readonly string[] = TOKEN_ORDER,
): string {
  const block = (mode: ThemeMode) => {
    const vars = resolveVars(overrides, mode);
    return tokens.map((t) => `  ${t}: ${vars[t]};`).join("\n");
  };
  return `/* globals.css — override Sapa's rich colors */
:root {
${block("light")}
}

.dark {
${block("dark")}
}`;
}
