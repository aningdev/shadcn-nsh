/**
 * A theme value as a renderer paints it (ADR 0012 §7): `var(--name)` looked up in a declaration
 * block, `color-mix(in srgb, …)` mixed in premultiplied sRGB, everything else read by
 * `oklch.ts`'s `parseColor`. `theme:parity` compares two resolutions with it; a test can too.
 */

import { parseColor, type Rgb } from "./oklch";

/** Declarations keyed as CSS names them (`--name`), the way `var()` looks them up. */
export function varsOf(block: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(block).map(([key, value]) => [`--${key}`, value]));
}

/** Split on the commas that are not inside parentheses. */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    else if (character === "," && depth === 0) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim());
}

/** Premultiplied sRGB interpolation (CSS Color 5): `t` of `from`, the rest of `to`. */
function mixSrgb(from: Rgb, to: Rgb, t: number): Rgb {
  const [aFrom, aTo] = [from.a ?? 1, to.a ?? 1];
  const a = t * aFrom + (1 - t) * aTo;
  const channel = (x: number, y: number) => (a === 0 ? 0 : (t * aFrom * x + (1 - t) * aTo * y) / a);
  return {
    r: channel(from.r, to.r),
    g: channel(from.g, to.g),
    b: channel(from.b, to.b),
    ...(a < 1 ? { a } : {}),
  };
}

/** `value` with every `var(--name)` replaced by its value in `vars`; a name that does not resolve is reported and kept. */
function substitute(
  value: string,
  vars: Record<string, string>,
  onMissing: (name: string) => void,
  seen = new Set<string>(),
): string {
  return value.replace(/var\((--[a-z0-9-]+)\)/g, (_, name: string) => {
    const next = vars[name];
    if (next === undefined || seen.has(name)) {
      onMissing(name);
      return `var(${name})`;
    }
    return substitute(next, vars, onMissing, new Set([...seen, name]));
  });
}

/** A colour as the renderer paints it: `var()` against `vars`, `color-mix(in srgb, …)` mixed, or a plain colour. */
export function resolveColour(
  value: string,
  vars: Record<string, string>,
  onMissing: (name: string) => void = () => {},
): Rgb {
  const text = substitute(value, vars, onMissing).trim();
  const mix = /^color-mix\(in srgb,(.*)\)$/i.exec(text);
  if (!mix) return parseColor(text);

  const parts = splitTopLevel(mix[1]!);
  if (parts.length !== 2) throw new Error(`not a two-colour color-mix: ${value}`);
  const read = (part: string) => {
    const percent = /(\d+(?:\.\d+)?)%$/.exec(part);
    return {
      colour: resolveColour(percent ? part.slice(0, -percent[0].length) : part, vars, onMissing),
      weight: percent ? Number(percent[1]) / 100 : undefined,
    };
  };
  const [first, second] = parts.map(read) as [
    { colour: Rgb; weight: number | undefined },
    { colour: Rgb; weight: number | undefined },
  ];
  // A percentage on one colour is the other's remainder; a percentage on both is a ratio; on
  // neither, an even mix.
  const weight =
    first.weight !== undefined && second.weight !== undefined
      ? first.weight / (first.weight + second.weight)
      : first.weight !== undefined
        ? first.weight
        : second.weight !== undefined
          ? 1 - second.weight
          : 0.5;
  return mixSrgb(first.colour, second.colour, Math.min(1, Math.max(0, weight)));
}

/** Whether two resolved colours land on the same pixels (one 8-bit step of slack, and 0.005 of alpha). */
export function sameColour(a: Rgb, b: Rgb): boolean {
  return (
    Math.abs(a.r - b.r) <= 1 &&
    Math.abs(a.g - b.g) <= 1 &&
    Math.abs(a.b - b.b) <= 1 &&
    Math.abs((a.a ?? 1) - (b.a ?? 1)) <= 0.005
  );
}
