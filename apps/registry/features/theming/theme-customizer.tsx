"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { hexToOklch, oklchToHex } from "@/features/theming/color";
import {
  buildCss,
  resolveVars,
  TOKEN_GROUPS,
  type ThemeMode,
  type TokenOverrides,
} from "@/features/theming/theme-tokens";
import { CopyButton } from "@/shared/components/copy-button";

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
        {TOKEN_GROUPS.map((g) => {
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
