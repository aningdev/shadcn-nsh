/**
 * WCAG 2 AA contrast for the colours the themes resolve to: every text role on the surface it is
 * written on, and every finish's ink on the surface it fills, in light and dark, for all six themes.
 *
 *   bun scripts/theme/contrast.ts [--themes <id,...>]
 *
 * Text needs 4.5:1 and large text (3:1), per WCAG 2.2 SC 1.4.3, which exempts text in an inactive
 * control: `finish.disabled` is checked for its surface's shape elsewhere, not here. The pairs are
 * semantic (`foreground` on `background`, `primary-foreground` on `primary`, the menu's ink on the
 * menu's fill), not literal: a component that paints a role pair is what this checks, and a value
 * that fails is a theme decision (`docs/specs/theme-roles.md`), not a component's.
 *
 * Each colour is resolved the way `theme.ts` resolves it: `var(--x)`, `{x}`, `oklch(from {x} …)`
 * and `color-mix(… transparent)` all become the sRGB channels they draw, and a translucent surface
 * is composited over the page before the ratio is taken. `--themes` narrows the run to ids.
 */
import fs from "node:fs";
import path from "node:path";

import { css, over, parseColor, type Rgb } from "./oklch";
import { tokenKind, type ThemeCssVars } from "./tokens";

export type Mode = "light" | "dark";
const modes: Mode[] = ["light", "dark"];

/** One check: a foreground role and the surface it is written on, at a required ratio. */
export type Pair = { fg: string; bg: string; required: number; why: string };

/** A resolved check: its colours, ratio and verdict. */
export type Result = Pair & { theme: string; mode: Mode; ratio: number; pass: boolean };

const roles: [string, string][] = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["foreground", "raised"],
  ["foreground", "popover"],
  ["foreground", "dialog"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "card"],
  ["muted-foreground", "raised"],
  ["inverse-muted", "inverse"],
  ["on-brand", "brand"],
  ["on-brand-tint", "brand-tint"],
  ["on-media", "media"],
  ["on-accent-pressed", "accent-pressed"],
  ...Array.from({ length: 5 }, (_, i): [string, string] => ["chart-foreground", `chart-${i + 1}`]),
];

/** The finishes whose surface carries text, and the ink a component writes on it. */
const finishes: [role: string, ink: string, required: number, why: string][] = [
  ["section", "foreground", 4.5, "text on a section"],
  ["raised", "foreground", 4.5, "text on a raised surface"],
  ["pressed", "foreground", 4.5, "text on a pressed surface"],
  ["pill", "foreground", 4.5, "a segmented control's label"],
  ["chip", "muted-foreground", 4.5, "a chip's label"],
  ["menu", "popover-foreground", 4.5, "a menu's label"],
  ["glass", "popover-foreground", 4.5, "a glass panel's label"],
  ["dialog", "foreground", 4.5, "a dialog's text"],
  ["tooltip", "inverse-foreground", 4.5, "a tooltip's label"],
  ["inverse", "inverse-foreground", 4.5, "text on an inverse surface"],
  ["on", "selected-foreground", 4.5, "text on a selected chip"],
  ["light", "primary-foreground", 3, "display-size text and icons on a light accent"],
  ["accent", "primary-foreground", 4.5, "text on an accent surface"],
  ["accentPressed", "on-accent-pressed", 4.5, "text on a pressed accent"],
];

const stem = (name: string) => name.slice(0, -"-foreground".length);

/** Resolve a theme value to the text it draws, following aliases and relative colours. */
function resolve(value: string, vars: Record<string, string>, depth = 0): string {
  if (depth > 8) return value;
  const text = value.trim();
  const relative = /^oklch\(from \{([a-z0-9-]+)\} l c h \/ ([\d.]+)\)$/.exec(text);
  if (relative) {
    const base = resolve(vars[relative[1]!] ?? text, vars, depth + 1);
    return css({ ...parseColor(base), a: Number(relative[2]) });
  }
  const mix = /^color-mix\(in srgb, (.+) ([\d.]+)%, transparent\)$/.exec(text);
  if (mix) {
    const base = resolve(mix[1]!, vars, depth + 1);
    return css({ ...parseColor(base), a: Number(mix[2]) / 100 });
  }
  const whole = /^(?:\{([a-z0-9-]+)\}|var\(--([a-z0-9-]+)\))$/.exec(text);
  const name = whole?.[1] ?? whole?.[2];
  if (name && vars[name] !== undefined) return resolve(vars[name]!, vars, depth + 1);
  return text
    .replace(/var\(--([a-z0-9-]+)\)/g, (all, ref: string) =>
      vars[ref] === undefined ? all : resolve(vars[ref]!, vars, depth + 1),
    )
    .replace(/\{([a-z0-9-]+)\}/g, (all, ref: string) =>
      vars[ref] === undefined ? all : resolve(vars[ref]!, vars, depth + 1),
    );
}

/** The first colour a resolved value draws: a plain token, or a gradient's first stop. */
function colourOf(value: string): Rgb | undefined {
  const literal = /(oklch\([^()]*\)|rgba?\([^()]*\)|#[0-9a-fA-F]{3,8})/.exec(value)?.[0];
  return literal ? parseColor(literal) : undefined;
}

/** `theme.json`'s CSS variables for one appearance, as `theme.ts` reads them. */
function varsOf(theme: { cssVars?: ThemeCssVars }, mode: Mode): Record<string, string> {
  const vars = theme.cssVars;
  return { ...vars?.theme, ...vars?.[mode] };
}

/** The surface a finish fills, or nothing when it fills none (`inset`, `track`, `groove`). */
function surface(finish: Record<string, unknown> | undefined, vars: Record<string, string>) {
  if (!finish) return undefined;
  const source = finish.background ?? finish.gradient;
  if (typeof source !== "string") return undefined;
  const value = resolve(source, vars);
  if (/^transparent$|^none$/i.test(value)) return undefined;
  return colourOf(value);
}

/** WCAG 2.2's relative luminance, on 8-bit sRGB. */
export function luminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2.2's contrast ratio between two opaque colours: 1 to 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
}

/** The pairs one theme's appearance resolves, with their ratios. */
export function themePairs(
  theme: { cssVars?: ThemeCssVars },
  semantics: {
    finishes?: {
      shared?: Record<string, Record<string, unknown>>;
      light?: Record<string, Record<string, unknown>>;
      dark?: Record<string, Record<string, unknown>>;
    };
  },
  id: string,
  mode: Mode,
): Result[] {
  const vars = varsOf(theme, mode);
  const page = colourOf(resolve(vars.background ?? "#ffffff", vars));
  if (!page) return [];
  const on = (raw: string, bg: Rgb) => {
    const ink = colourOf(resolve(raw, vars));
    return ink ? contrastRatio(parseColor(over(css(ink), css(bg))), bg) : undefined;
  };
  const results: Result[] = [];
  const seen = new Set<string>();
  const add = (pair: Pair, fg: string, bg: string) => {
    const key = `${fg}/${bg}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!(fg in vars) || !(bg in vars)) return;
    const fill = colourOf(resolve(vars[bg]!, vars));
    if (!fill) return;
    const filled = colourOf(over(css(fill), css(page))) ?? fill;
    const ratio = on(vars[fg]!, filled);
    if (ratio === undefined) return;
    results.push({ ...pair, theme: id, mode, ratio, pass: ratio >= pair.required });
  };
  for (const [fg, bg] of roles)
    add({ fg, bg, required: 4.5, why: "a text role on its surface" }, fg, bg);
  for (const [fg, bg] of Object.entries(vars)
    .filter(([name]) => name.endsWith("-foreground") && name !== "foreground")
    .map(([name]) => [name, stem(name)] as [string, string])) {
    if (tokenKind(bg, vars[bg] ?? "") === "color") {
      add({ fg, bg, required: 4.5, why: "a text role on its surface" }, fg, bg);
    }
  }
  const shared = semantics.finishes?.shared ?? {};
  const sparse = semantics.finishes?.[mode] ?? {};
  for (const [role, ink, required, why] of finishes) {
    const finish = { ...shared[role], ...sparse[role] };
    const filled = surface(finish, vars);
    if (!filled || !(ink in vars)) continue;
    const bg = colourOf(over(css(filled), css(page))) ?? filled;
    const ratio = on(vars[ink]!, bg);
    if (ratio === undefined) continue;
    results.push({
      fg: ink,
      bg: `finish.${role}`,
      required,
      why,
      theme: id,
      mode,
      ratio,
      pass: ratio >= required,
    });
  }
  return results;
}

const themesDir = "packages/theme/themes";

/** Every theme's results, read from the built files; `--themes` narrows the ids. */
export function readResults(themes?: string[]): Result[] {
  const ids = themes ?? fs.readdirSync(path.join(process.cwd(), themesDir)).sort();
  const results: Result[] = [];
  for (const id of ids) {
    const dir = path.join(process.cwd(), themesDir, id);
    const themeFile = path.join(dir, "theme.json");
    if (!fs.existsSync(themeFile)) continue;
    const theme = JSON.parse(fs.readFileSync(themeFile, "utf8"));
    const semanticsFile = path.join(dir, "semantics.json");
    const semantics = fs.existsSync(semanticsFile)
      ? JSON.parse(fs.readFileSync(semanticsFile, "utf8"))
      : {};
    for (const mode of modes) results.push(...themePairs(theme, semantics, id, mode));
  }
  return results;
}

if (import.meta.main) {
  const at = process.argv.indexOf("--themes");
  const value = at >= 0 ? process.argv[at + 1] : undefined;
  const themes = value
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (value !== undefined && (!themes || themes.length === 0)) {
    console.error("theme:contrast: --themes takes a comma-separated list of ids");
    process.exit(1);
  }
  if (themes) {
    const known = fs.readdirSync(path.join(process.cwd(), themesDir));
    const unknown = themes.filter((id) => !known.includes(id));
    if (unknown.length > 0) {
      console.error(`theme:contrast: no theme is called ${unknown.join(", ")}`);
      process.exit(1);
    }
  }
  const results = readResults(themes);
  let failed = 0;
  for (const result of results.filter(({ pass }) => !pass)) {
    failed += 1;
    console.error(
      `theme:contrast: ${result.theme} ${result.mode}: ${result.fg} on ${result.bg} is ${result.ratio.toFixed(2)}, needs ${result.required} (${result.why})`,
    );
  }
  const byTheme = new Map<string, { pass: number; total: number }>();
  for (const result of results) {
    const entry = byTheme.get(result.theme) ?? { pass: 0, total: 0 };
    entry.total += 1;
    if (result.pass) entry.pass += 1;
    byTheme.set(result.theme, entry);
  }
  for (const [id, { pass, total }] of byTheme) {
    console.log(`theme:contrast: ${id}: ${pass} of ${total} pairs pass`);
  }
  if (failed > 0) {
    console.error(`theme:contrast: ${failed} of ${results.length} pairs below AA`);
    process.exit(1);
  }
  console.log(`theme:contrast: every pair passes (${results.length})`);
}
