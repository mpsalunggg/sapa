/** The rich-color token data behind the live theme editor. Pure data + pure
 *  functions, deliberately free of React so that providers, server components
 *  and the playground can all read it without pulling in the customizer UI. */

export type ThemeMode = "light" | "dark";

/** Partial per-mode overrides — a token only appears once the user edits it,
 *  so untouched tokens keep their exact default oklch string on export. */
export type TokenOverrides = Record<ThemeMode, Record<string, string>>;

export const EMPTY_OVERRIDES: TokenOverrides = { light: {}, dark: {} };

/** The eight rich-color tokens, grouped by semantic type. */
export const TOKEN_GROUPS = [
  { key: "success", label: "Success" },
  { key: "error", label: "Error" },
  { key: "warning", label: "Warning" },
  { key: "info", label: "Info" },
] as const;

/** token name → default value per mode. Mirrors registry/theme/globals.css. */
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

/** Effective (default + overrides) token map for one mode — used for the live
 *  preview and the exported CSS. */
export function resolveVars(
  overrides: TokenOverrides,
  mode: ThemeMode,
): Record<string, string> {
  return { ...SAPA_DEFAULTS[mode], ...overrides[mode] };
}

/** Build the copy-pasteable globals.css override block (both modes). */
export function buildCss(overrides: TokenOverrides): string {
  const block = (mode: ThemeMode) => {
    const vars = resolveVars(overrides, mode);
    return TOKEN_ORDER.map((t) => `  ${t}: ${vars[t]};`).join("\n");
  };
  return `/* globals.css — override Sapa's rich colors */
:root {
${block("light")}
}

.dark {
${block("dark")}
}`;
}
