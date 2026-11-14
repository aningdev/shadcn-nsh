/**
 * OKLCH → sRGB, so the shadcn theme's `oklch()` values can be written as the hex and rgba this
 * library's tokens take (`packages/theme/themes/shadcn/`). Not part of the check pipeline: it is
 * the conversion `docs/specs/theme-shadcn.md` records, kept in code so the palette is not
 * hand-picked.
 *
 *   bun scripts/theme/generate-shadcn.ts     # writes the two JSON files from these values
 *
 * The forward matrices are Björn Ottosson's (oklab → linear sRGB), the transfer function is
 * CSS Color 4's sRGB one; `oklch.test.ts` checks the ends (black, white, a known grey) and the
 * helpers (`mixHex`, `over`, `rgba`).
 */

/** A color as the theme files write it: 8-bit channels, plus alpha when it is not opaque. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  /** 0–1; absent when opaque. */
  a?: number;
}

const gamma = (linear: number) =>
  linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** OKLCH (`l` 0–1, `c` ≥ 0, `h` degrees, `a` 0–1) to 8-bit sRGB channels. */
export function oklchToRgb(l: number, c: number, h: number, a = 1): Rgb {
  const hue = (h * Math.PI) / 180;
  const A = c * Math.cos(hue);
  const B = c * Math.sin(hue);
  const l_ = l + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = l - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = l - 0.0894841775 * A - 1.291485548 * B;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  const channel = (linear: number) => Math.round(clamp(gamma(linear)) * 255);
  return {
    r: channel(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    g: channel(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    b: channel(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
    ...(a < 1 ? { a } : {}),
  };
}

const hex2 = (value: number) => Math.round(value).toString(16).padStart(2, "0");

/** `#rrggbb`, or `rgba(r,g,b,a)` when translucent: the forms `packages/theme` already uses. */
export function css({ r, g, b, a }: Rgb): string {
  if (a === undefined) return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${Number(a.toFixed(3))})`;
}

/** `oklch(l c h)` or `oklch(l c h / a)` (alpha a percentage or 0–1) to `#rrggbb` / `rgba(…)`. */
export function oklch(value: string): string {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/.exec(
    value.trim(),
  );
  if (!match) throw new Error(`not an oklch() color: ${value}`);
  const [l, c, h] = match.slice(1, 4).map(Number) as [number, number, number];
  const [alpha, percent] = match.slice(4);
  const a = alpha === undefined ? 1 : percent ? Number(alpha) / 100 : Number(alpha);
  return css(oklchToRgb(l, c, h, a));
}

/** `#rrggbb` or `rgba(r,g,b,a)` to channels. */
export function parseColor(value: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (hex) {
    const n = Number.parseInt(hex[1]!, 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(
    value.trim(),
  );
  if (!rgba) throw new Error(`not a hex or rgba() color: ${value}`);
  const [r, g, b] = rgba.slice(1, 4).map(Number) as [number, number, number];
  const a = rgba[4] === undefined ? 1 : Number(rgba[4]);
  return { r, g, b, ...(a < 1 ? { a } : {}) };
}

/** `color` at `a` over `background`: what a translucent shadcn token composites to on it. */
export function over(color: string, background: string): string {
  const top = parseColor(color);
  const bottom = parseColor(background);
  const t = top.a ?? 1;
  return css({
    r: top.r * t + bottom.r * (1 - t),
    g: top.g * t + bottom.g * (1 - t),
    b: top.b * t + bottom.b * (1 - t),
  });
}

/** Half way from `from` to `to`, in 8-bit sRGB: the step between two shadcn tones. */
export function mixHex(from: string, to: string, t: number): string {
  const a = parseColor(from);
  const b = parseColor(to);
  if (a.a !== undefined || b.a !== undefined) throw new Error(`mixHex: translucent color`);
  return css({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t });
}

/** `#rrggbb` at opacity `a`, as `rgba(…)`. */
export function rgba(hex: string, a: number): string {
  return css({ ...parseColor(hex), a });
}
