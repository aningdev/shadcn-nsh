// Color strings for the picker: format a value and pick ink that reads on it. Kept in lib, apart
// from the picker, so `bun test` checks it without starting NSH.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { ColorFormat } from "nsh/base";

/** `v` to `decimals` places, trailing zeros dropped (as the picker writes its numbers). */
function numberText(v: number, decimals: number): string {
  const text = v.toFixed(decimals);
  const trimmed = text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
  return trimmed === "-0" ? "0" : trimmed;
}

/** The hue of an sRGB color, in degrees: `max` its largest channel, `delta` its largest less its smallest. */
function hue([r, g, b]: number[], max: number, delta: number): number {
  if (delta <= 0) return 0;
  const h =
    max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** A `#rrggbbaa` color's channels, 0 to 1: red, green, blue, and the alpha (1 when it is left out). */
function channels(value: string): [number, number, number, number] {
  const hex = value.replace(/^#/, "");
  const at = (i: number) => parseInt(hex.slice(i, i + 2), 16) / 255;
  return [at(0), at(2), at(4), hex.length >= 8 ? at(6) : 1];
}

/**
 * A color the picker reported (`value`: `#rrggbbaa`) written as `format` writes it, as the picker writes it: for the
 * copy button, the format menu's previews and a trigger's text, which show any format, not only the picker's own.
 */
export function formatColor(value: string, format: ColorFormat): string {
  const hex = value.replace(/^#/, "").toLowerCase();
  const [r, g, b, a] = channels(value);
  const rgb = [r, g, b];
  const opaque = a >= 1;
  const tail = opaque ? "" : ` / ${numberText(a, 2)}`;
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const delta = max - min;
  switch (format) {
    case "hex":
      return `#${hex.slice(0, opaque ? 6 : 8)}`;
    case "rgb":
      return `rgb(${rgb.map((c) => Math.round(c * 255)).join(" ")}${tail})`;
    case "hsl": {
      const l = (max + min) / 2;
      const s = delta <= 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      return `hsl(${numberText(hue(rgb, max, delta), 1)} ${numberText(s * 100, 1)}% ${numberText(l * 100, 1)}%${tail})`;
    }
    case "hsb": {
      const s = max <= 0 ? 0 : delta / max;
      return `hsb(${numberText(hue(rgb, max, delta), 1)} ${numberText(s * 100, 1)}% ${numberText(max * 100, 1)}%${tail})`;
    }
    case "oklch": {
      const [linR, linG, linB] = rgb.map(toLinear);
      const l = Math.cbrt(0.4122214708 * linR + 0.5363325363 * linG + 0.0514459929 * linB);
      const m = Math.cbrt(0.2119034982 * linR + 0.6806995451 * linG + 0.1073969566 * linB);
      const s = Math.cbrt(0.0883024619 * linR + 0.2817188376 * linG + 0.6299787005 * linB);
      const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
      const oa = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
      const ob = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
      const chroma = Math.hypot(oa, ob);
      const h = chroma < 1e-4 ? 0 : ((Math.atan2(ob, oa) * 180) / Math.PI + 360) % 360;
      return `oklch(${numberText(lightness * 100, 1)}% ${numberText(chroma, 3)} ${numberText(h, 1)}${tail})`;
    }
  }
}

/** The relative luminance at which black ink starts to read better than white on a color (sRGB's weights). */
const BLACK_INK_FROM = 0.36;

/** Ink that reads on `value` (a color the user picks, not the theme's): black on a light one, white on a dark one. */
export function inkOn(value: string): string {
  const [r, g, b] = channels(value).slice(0, 3).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > BLACK_INK_FROM ? "black" : "white";
}
