/**
 * The color codec the theme files are written with: sRGB ⇄ OKLCH, and the canonical `oklch()`
 * text a theme value carries (`packages/theme/theme.json`, `finishes.json`,
 * `packages/theme/themes/<name>/*.json`). NSH reads `oklch()` everywhere a color is a string, next to
 * hex and `rgb()` (references/nsh/website/docs/styling.md#colors), so a theme stores its colors
 * in one space instead of sRGB's three channels.
 *
 *   bun scripts/theme/to-oklch.ts            # rewrites the default theme files (idempotent)
 *   bun scripts/theme/generate-shadcn.ts     # writes themes/shadcn/* from shadcn's palette
 *
 * The matrices are Björn Ottosson's (linear sRGB ⇄ oklab), the transfer function is CSS Color
 * 4's sRGB one. `oklch.test.ts` sweeps the 8-bit cube and asserts every color lands back on its
 * own channels: the text's precision (L 5 decimals, C 5, H 3, alpha 3) is pinned to that, so a
 * theme value is lossless and a round trip through the file changes no pixel.
 */

/** A color as 8-bit sRGB channels (possibly fractional, before they are written), plus alpha 0–1 when it is not opaque. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
  /** 0–1; absent when opaque. */
  a?: number;
}

/** A color in OKLCH: `l` 0–1, `c` ≥ 0, `h` in degrees. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const gamma = (linear: number) =>
  linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;

const linear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

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
  const channel = (x: number) => Math.round(clamp(gamma(x)) * 255);
  return {
    r: channel(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    g: channel(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    b: channel(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
    ...(a < 1 ? { a } : {}),
  };
}

/** 8-bit sRGB channels to OKLCH; a grey (chroma under a millionth) has no hue and is written `0`. */
export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const [R, G, B] = [r, g, b].map((channel) => linear(clamp(channel / 255)));
  const l_ = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m_ = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s_ = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B2);
  const h = c < 1e-6 ? 0 : ((Math.atan2(B2, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

/** `value` to `places` decimals, trailing zeros dropped and `-0` written `0` (as the theme writes numbers). */
function fixed(value: number, places: number): string {
  const text = (value === 0 ? 0 : value).toFixed(places);
  const trimmed = text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
  return trimmed === "-0" ? "0" : trimmed;
}

/**
 * `oklch(l c h)` or `oklch(l c h / a)`: the form the theme files write a color in. L and C keep
 * five decimals, H three, alpha three; a round trip through these lands on the same 8-bit
 * channels for every sRGB color (`oklch.test.ts`).
 */
export function oklchColor(l: number, c: number, h: number, a = 1): string {
  const args = `${fixed(l, 5)} ${fixed(c, 5)} ${fixed(h, 3)}`;
  return a >= 1 ? `oklch(${args})` : `oklch(${args} / ${fixed(a, 3)})`;
}

/** A color the codec holds (8-bit sRGB channels) as the theme files write it: canonical `oklch()`. */
export function oklchText(rgb: Rgb): string {
  const { l, c, h } = rgbToOklch(rgb);
  return oklchColor(l, c, h, rgb.a ?? 1);
}

const hex2 = (value: number) => Math.round(value).toString(16).padStart(2, "0");

/** `#rrggbb`, or `rgba(r,g,b,a)` when translucent: the sRGB form, for a report or a test. */
export function css({ r, g, b, a }: Rgb): string {
  if (a === undefined) return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${Number(a.toFixed(3))})`;
}

/** The names the theme files write instead of a color with channels. */
const NAMED: Record<string, [number, number, number, number]> = {
  transparent: [0, 0, 0, 0],
  black: [0, 0, 0, 1],
  white: [255, 255, 255, 1],
};

/** `<number>`, `<number>%` (as a fraction) or, for a hue, `<number>` with an angle's unit. */
function amount(text: string): number | undefined {
  const percent = /^([\d.]+)%$/.exec(text);
  if (percent) return Number(percent[1]) / 100;
  return /^-?[\d.]+$/.test(text) ? Number(text) : undefined;
}

const DEGREES: Record<string, number> = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };

function angle(text: string): number | undefined {
  const unit = /^(-?[\d.]+)(deg|grad|rad|turn)$/.exec(text);
  if (unit) return Number(unit[1]) * DEGREES[unit[2]!]!;
  return /^-?[\d.]+$/.test(text) ? Number(text) : undefined;
}

/** The `c1 c2 c3 / a` of a color function: comma or space separated, alpha after a slash or as a fourth. */
function channels(args: string): { parts: string[]; a: number } | undefined {
  const slash = args.split("/");
  if (slash.length > 2) return undefined;
  const [main, after] = [slash[0]!, slash[1]];
  const parts = main.includes(",")
    ? main.split(",").map((part) => part.trim())
    : main.trim().split(/\s+/);
  if (parts.length < 3 || parts.length > 4) return undefined;
  const alphaText = after?.trim() || (parts.length === 4 ? parts[3] : undefined);
  const a = alphaText === undefined ? 1 : amount(alphaText);
  if (a === undefined) return undefined;
  return { parts: parts.slice(0, 3), a: Math.min(1, Math.max(0, a)) };
}

/** An `oklch()` color's coordinates, before they are packed to 8 bits. */
function parseOklch(value: string): (Oklch & { a: number }) | undefined {
  const match = /^oklch\(([^()]*)\)$/i.exec(value.trim());
  if (!match) return undefined;
  const read = channels(match[1]!);
  if (!read) return undefined;
  const l = amount(read.parts[0]!);
  const c = amount(read.parts[1]!);
  const h = angle(read.parts[2]!);
  if (l === undefined || c === undefined || h === undefined) return undefined;
  return { l, c, h, a: read.a };
}

/** `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` / `rgba()` (comma or space), `oklch()`, and the three names above. */
export function parseColor(value: string): Rgb {
  const text = value.trim();
  const named = NAMED[text.toLowerCase()];
  if (named) {
    const [r, g, b, a] = named;
    return { r, g, b, ...(a < 1 ? { a } : {}) };
  }
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
  if (hex) {
    const digits = hex[1]!;
    const wide =
      digits.length <= 4
        ? digits.split("").map((digit) => digit + digit)
        : Array.from({ length: digits.length / 2 }, (_, i) => digits.slice(i * 2, i * 2 + 2));
    const [r, g, b, a] = wide.map((part) => Number.parseInt(part, 16)) as [
      number,
      number,
      number,
      number | undefined,
    ];
    return { r, g, b, ...(a !== undefined && a !== 255 ? { a: a / 255 } : {}) };
  }
  const fn = /^([a-z-]+)\(([^()]*)\)$/i.exec(text);
  if (fn) {
    const name = fn[1]!.toLowerCase();
    const args = fn[2]!;
    if (name === "oklch") {
      const color = parseOklch(text);
      if (!color) throw new Error(`not an oklch() color: ${value}`);
      return oklchToRgb(color.l, color.c, color.h, color.a);
    }
    if (name === "rgb" || name === "rgba") {
      const read = channels(args);
      if (!read) throw new Error(`not an rgb() color: ${value}`);
      const [r, g, b] = read.parts.map((part) => {
        const n = amount(part);
        if (n === undefined) throw new Error(`not an rgb() color: ${value}`);
        return part.endsWith("%") ? Math.round(n * 255) : n;
      }) as [number, number, number];
      return { r, g, b, ...(read.a < 1 ? { a: read.a } : {}) };
    }
  }
  throw new Error(`not a color: ${value} (hex, rgb(), oklch(), ${Object.keys(NAMED).join(", ")})`);
}

/** The color literals of a theme value: hex, `rgb()` / `rgba()`, `oklch()`, and the named colors. */
const LITERAL = new RegExp(
  [
    String.raw`#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![\w-])`,
    String.raw`\b(?:rgba?|oklch)\([^()]*\)`,
    String.raw`\b(?:transparent|black|white)\b`,
  ].join("|"),
  "gi",
);

/**
 * Every color in `text` as canonical `oklch()`: what a theme value holds once converted, so a
 * gradient, a shadow, a `color-mix()` and a plain token all carry the same form. `transparent`
 * (a keyword, not a color with channels) and `var()` stay as they are, and an `oklch()` already
 * written is normalized (not quantized to 8 bits): the same numbers, the same order.
 */
export function toOklchText(text: string): string {
  return text.replace(LITERAL, (literal) => {
    if (literal.toLowerCase() === "transparent") return literal;
    const parsed = parseOklch(literal);
    if (parsed) return oklchColor(parsed.l, parsed.c, parsed.h, parsed.a);
    return oklchText(parseColor(literal));
  });
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

/** `color` at `a` over `background`: what a translucent token composites to on it. */
export function over(color: string, background: string): string {
  const top = parseColor(color);
  const bottom = parseColor(background);
  const t = top.a ?? 1;
  const at = (from: number, to: number) => Math.round(from * t + to * (1 - t));
  return oklchText({ r: at(top.r, bottom.r), g: at(top.g, bottom.g), b: at(top.b, bottom.b) });
}

/** Half way from `from` to `to`, in 8-bit sRGB: the step between two tones. */
export function mix(from: string, to: string, t: number): string {
  const a = parseColor(from);
  const b = parseColor(to);
  if (a.a !== undefined || b.a !== undefined) throw new Error(`mix: a translucent color`);
  const at = (x: number, y: number) => Math.round(x + (y - x) * t);
  return oklchText({ r: at(a.r, b.r), g: at(a.g, b.g), b: at(a.b, b.b) });
}

/** `color` at opacity `a`, as `oklch(… / a)`. */
export function withAlpha(color: string, a: number): string {
  return oklchText({ ...parseColor(color), a });
}
