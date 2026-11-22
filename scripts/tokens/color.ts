/**
 * Color formatting and `color-mix()` evaluation for DTCG 2025.10 tokens.
 */
import { oklchToRgb, rgbToOklch } from "../theme/oklch";
import type { ColorOpExtension, DtcgColor } from "./types";

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

/** 6-digit CSS hex fallback as required by DTCG Color Module 2025.10 §4.1. */
export function oklchToHex6(l: number, c: number, h: number): string {
  const { r, g, b } = oklchToRgb(l, c, h, 1);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

/** Format a DTCG Color object back to canonical NSH `oklch(...)` string. */
export function formatDtcgColor(color: DtcgColor): string {
  if (color.colorSpace === "srgb") {
    const [r, g, b] = color.components.map((v) => Math.round(v * 255)) as [number, number, number];
    const { l, c, h } = rgbToOklch({ r, g, b });
    const round5 = (n: number) => Number(n.toFixed(5));
    const round3 = (n: number) => Number(n.toFixed(3));
    const base = `oklch(${round5(l)} ${round5(c)} ${round3(h)})`;
    return color.alpha !== undefined && color.alpha < 1
      ? `oklch(${round5(l)} ${round5(c)} ${round3(h)} / ${color.alpha})`
      : base;
  }
  const [l, c, h] = color.components;
  const args = `${l} ${c} ${h}`;
  return color.alpha !== undefined && color.alpha < 1
    ? `oklch(${args} / ${color.alpha})`
    : `oklch(${args})`;
}

/** Evaluate `color-mix(in srgb, A percent%, B)` per CSS Color 4 premultiplied sRGB mixing. */
export function evaluateColorMix(
  a: DtcgColor,
  percent: number,
  b: DtcgColor | "transparent",
): DtcgColor {
  const p = percent / 100;
  const toRgba = (c: DtcgColor) => {
    if (c.colorSpace === "srgb") {
      return {
        r: c.components[0] * 255,
        g: c.components[1] * 255,
        b: c.components[2] * 255,
        a: c.alpha ?? 1,
      };
    }
    const rgb = oklchToRgb(c.components[0], c.components[1], c.components[2], c.alpha ?? 1);
    return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a ?? 1 };
  };

  const ca = toRgba(a);
  if (b === "transparent") {
    const alphaOut = Number((ca.a * p).toFixed(4));
    // Mixing with transparent preserves the source coordinates and scales alpha.
    return {
      colorSpace: a.colorSpace,
      components: [...a.components] as [number, number, number],
      alpha: alphaOut,
      hex: oklchToHex6(a.components[0], a.components[1], a.components[2]),
    };
  }

  const cb = toRgba(b);
  const alphaOut = p * ca.a + (1 - p) * cb.a;
  const r = alphaOut === 0 ? 0 : (p * ca.a * ca.r + (1 - p) * cb.a * cb.r) / alphaOut;
  const g = alphaOut === 0 ? 0 : (p * ca.a * ca.g + (1 - p) * cb.a * cb.g) / alphaOut;
  const bCh = alphaOut === 0 ? 0 : (p * ca.a * ca.b + (1 - p) * cb.a * cb.b) / alphaOut;
  const { l, c, h } = rgbToOklch({ r, g, b: bCh });
  const round5 = (n: number) => Number(n.toFixed(5));
  const round3 = (n: number) => Number(n.toFixed(3));
  const l5 = round5(l);
  const c5 = round5(c);
  const h3 = round3(h);
  return {
    colorSpace: "oklch",
    components: [l5, c5, h3],
    ...(alphaOut < 1 ? { alpha: Number(alphaOut.toFixed(4)) } : {}),
    hex: oklchToHex6(l5, c5, h3),
  };
}

/** Format a DTCG `colorOp` (`mix` or `alpha`) into its runtime CSS string. */
export function formatColorOpToCss(op: ColorOpExtension): string {
  const formatRefOrColor = (item: DtcgColor | string): string => {
    if (typeof item === "string") {
      const m = /^\{color\.([a-z0-9-]+)\}$/.exec(item);
      if (m) return `var(--${m[1]})`;
      return item;
    }
    return formatDtcgColor(item);
  };

  if (op.op === "mix") {
    const a = formatRefOrColor(op.a);
    const b = op.b === "transparent" ? "transparent" : formatRefOrColor(op.b);
    return `color-mix(in srgb, ${a} ${op.percent}%, ${b})`;
  }
  const m = /^\{color\.([a-z0-9-]+)\}$/.exec(op.color);
  if (!m) throw new Error(`Invalid alpha colorOp target: ${op.color}`);
  return `oklch(from {${m[1]}} l c h / ${op.alpha})`;
}
