"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { hexToOklch, oklchToHex } from "@/lib/color";
import { CopyButton } from "@/components/copy-button";

export type ThemeMode = "light" | "dark";

/** Partial per-mode overrides — a token only appears once the user edits it,
 *  so untouched tokens keep their exact default oklch string on export. */
export type TokenOverrides = Record<ThemeMode, Record<string, string>>;

export const EMPTY_OVERRIDES: TokenOverrides = { light: {}, dark: {} };

/** The eight rich-color tokens, grouped by semantic type. */
const GROUPS = [
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

const TOKEN_ORDER = Object.keys(SAPA_DEFAULTS.light);

/** Effective (default + overrides) token map for one mode — used for the live
 *  preview and the exported CSS. */
export function resolveVars(
  overrides: TokenOverrides,
  mode: ThemeMode,
): Record<string, string> {
  return { ...SAPA_DEFAULTS[mode], ...overrides[mode] };
}

/** Build the copy-pasteable globals.css override block (both modes). */
function buildCss(overrides: TokenOverrides): string {
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

function Swatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <label
      className="border-input hover:border-sapa-warning/40 relative block size-7 cursor-pointer overflow-hidden rounded-md border shadow-sm transition-colors"
      title={label}
      style={{ backgroundColor: value }}
    >
      <span className="sr-only">{label}</span>
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
    </label>
  );
}

export function ThemeCustomizer({
  overrides,
  onChange,
}: {
  overrides: TokenOverrides;
  onChange: (next: TokenOverrides) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mode: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";
  const vars = resolveVars(overrides, mode);

  const setToken = (token: string, hex: string) => {
    onChange({
      ...overrides,
      [mode]: { ...overrides[mode], [token]: hexToOklch(hex) },
    });
  };

  const resetMode = () => {
    onChange({ ...overrides, [mode]: {} });
  };

  const dirty = mounted && Object.keys(overrides[mode]).length > 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="font-display text-muted-foreground text-[0.95rem] italic">
          Rich colors
        </p>
        <span className="text-muted-foreground/60 text-[10px] font-medium uppercase tracking-wide">
          {mounted ? mode : ""}
        </span>
      </div>

      {/* Header row labels for the two swatch columns. */}
      <div className="text-muted-foreground/60 mb-1 flex items-center justify-end gap-1.5 px-3 text-[10px]">
        <span className="w-7 text-center">Bg</span>
        <span className="w-7 text-center">Fg</span>
      </div>

      <ul className="space-y-0.5">
        {GROUPS.map((g) => {
          const colorToken = `--sapa-${g.key}`;
          const fgToken = `--sapa-${g.key}-foreground`;
          return (
            <li
              key={g.key}
              className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-md px-3 py-1 transition-colors"
            >
              <span className="text-sm">{g.label}</span>
              <div className="flex items-center gap-1.5">
                {mounted && (
                  <>
                    <Swatch
                      label={`${g.label} color`}
                      value={oklchToHex(vars[colorToken])}
                      onChange={(hex) => setToken(colorToken, hex)}
                    />
                    <Swatch
                      label={`${g.label} foreground`}
                      value={oklchToHex(vars[fgToken])}
                      onChange={(hex) => setToken(fgToken, hex)}
                    />
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-center gap-1 px-3">
        <button
          type="button"
          onClick={resetMode}
          disabled={!dirty}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            dirty
              ? "text-muted-foreground hover:bg-muted hover:text-foreground"
              : "text-muted-foreground/40 cursor-not-allowed",
          )}
        >
          <RotateCcw className="size-3" />
          Reset
        </button>
        <span className="text-muted-foreground/60 ml-auto text-xs">
          Copy CSS
        </span>
        <CopyButton value={buildCss(overrides)} />
      </div>
    </div>
  );
}
