/**
 * Minimal, dependency-free sRGB ↔ OKLCH conversion.
 *
 * The Sapa design tokens are authored in `oklch(L C H)` (see
 * registry/theme/globals.css), but the theme customizer drives them with a
 * native `<input type="color">`, which only speaks 6-digit hex. These helpers
 * bridge the two: `oklchToHex` seeds the picker from a token's default value,
 * and `hexToOklch` turns the picked color back into the oklch string we apply
 * live and export.
 *
 * Math follows Björn Ottosson's OKLab reference
 * (https://bottosson.github.io/posts/oklab/). Alpha is ignored — the pickers
 * only deal with opaque colors.
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** sRGB channel (0–1) → linear-light. */
function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** linear-light channel (0–1) → sRGB. */
function toGamma(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** "#rrggbb" | "#rgb" → [r, g, b] in 0–1. Falls back to black on bad input. */
function parseHex(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return [0, 0, 0];
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function toHex2(n: number): string {
  return Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** Round to at most `p` decimals, dropping trailing zeros. */
function round(n: number, p: number): number {
  return Number(n.toFixed(p));
}

/** Convert a hex color to an `oklch(L C H)` string (L as 0–1, matching tokens). */
export function hexToOklch(hex: string): string {
  const [sr, sg, sb] = parseHex(hex);
  const r = toLinear(sr);
  const g = toLinear(sg);
  const b = toLinear(sb);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  // Neutral colors have no meaningful hue — pin to 0 for a stable string.
  if (C < 1e-4) H = 0;

  return `oklch(${round(L, 4)} ${round(C, 4)} ${round(H, 3)})`;
}

/** Parse `oklch(L C H)` (ignoring any alpha) into [L, C, H]. */
function parseOklch(value: string): [number, number, number] | null {
  const m = value.match(/oklch\(\s*([^)]+)\)/i);
  if (!m) return null;
  const parts = m[1]
    .replace(/\//g, " ") // drop the alpha separator
    .trim()
    .split(/[\s,]+/);
  if (parts.length < 3) return null;
  const num = (raw: string) =>
    raw.endsWith("%") ? parseFloat(raw) / 100 : parseFloat(raw);
  const L = num(parts[0]);
  const C = parseFloat(parts[1]);
  const H = parseFloat(parts[2]);
  if ([L, C, H].some((n) => Number.isNaN(n))) return null;
  return [L, C, H];
}

/** Convert an `oklch(L C H)` string to "#rrggbb", clamped into sRGB gamut. */
export function oklchToHex(value: string): string {
  const parsed = parseOklch(value);
  if (!parsed) return "#000000";
  const [L, C, H] = parsed;

  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return `#${toHex2(toGamma(r))}${toHex2(toGamma(g))}${toHex2(toGamma(bl))}`;
}
