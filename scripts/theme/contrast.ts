/**
 * The two checks on the colours the themes resolve to, in light and dark, for all six themes:
 *
 * - Contrast: every text role on the surface it is written on, and every finish's ink on the
 *   surface it fills. Text needs 4.5:1 and large text (3:1), per WCAG 2.2 SC 1.4.3, which exempts
 *   text in an inactive control, so `disabled-foreground` is not checked.
 * - Fill separation: `accent` on `background`, `card` and `popover`, and `sidebar-accent` on
 *   `sidebar`, need a gap of at least `fillFloor` in OKLCH lightness, so a selection or hover fill
 *   reads on every ground it is painted on. A token is one colour on four surfaces, and a fill that
 *   is only lighter than a card can vanish on the grouped page.
 *
 *   bun scripts/theme/contrast.ts [--themes <id,...>]
 *
 * A theme waives the pairs its platform keeps below AA in its own `$extensions`, each with its
 * source (`./extensions`); a waiver its theme no longer needs is an error. A fill has no waiver:
 * every theme meets the floor. The pairs are
 * semantic (`foreground` on `background`, `primary-foreground` on `primary`, each finish's
 * own `foreground` on its fill, and the accent's pressed pair where a theme states one), not literal: a component that paints a role pair is what this checks, and a value
 * that fails is a theme decision (`docs/specs/theme-roles.md`), not a component's.
 *
 * Each colour is resolved the way `theme.ts` resolves it: `var(--x)`, `{x}`, `oklch(from {x} …)`
 * and `color-mix(… transparent)` all become the sRGB channels they draw, and a translucent surface
 * is composited over the page (and a translucent fill over its ground) before the ratio or the
 * lightness is taken. `--themes` narrows the run to ids.
 */
import fs from "node:fs";
import path from "node:path";

import { themeExtensions, waiverSource, type ContrastWaiver } from "./extensions";
import { css, over, parseColor, rgbToOklch, type Rgb } from "./oklch";
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
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "card"],
  ["muted-foreground", "raised"],
  ["brand", "background"],
  ["on-media", "media"],
];

/**
 * Finishes that carry no text a reader must read: an inactive control's (SC 1.4.3), and the knobs,
 * a switch's disc and a slider's handle on either side of the track (a selected segment carries its
 * label on `raised`).
 */
const inkless = new Set(["disabled", "knob"]);

const stem = (name: string) => name.slice(0, -"-foreground".length);

/** Foreground roles found by name that are not text a reader must read on their namesake. */
const skipped: Record<string, string> = {
  // SC 1.4.3 exempts text in an inactive control.
  "disabled-foreground": "an inactive control's text",
  // The chart colours are data, chosen apart from each other; a tile's label is a plot's call.
  "chart-foreground": "a label over data colours",
};

/**
 * Pairs a theme keeps below AA because its platform ships them that way. Each theme states its own
 * in its `theme.tokens.json` `$extensions…contrast.waivers` with the platform source; an exception
 * that no longer fails is an error, so the list stays true.
 */
export function exception(result: Pick<Result, "theme" | "fg" | "bg">): string | undefined {
  return waiverSource(result.theme, result.fg, result.bg);
}

/**
 * Every waiver the themes state, so a run can report one that its theme no longer needs: a pair
 * that passes now is a stale exception, not a pass.
 */
function waivers(themes: readonly string[]): ({ theme: string } & ContrastWaiver)[] {
  return themes.flatMap((theme) =>
    (themeExtensions(theme).contrast?.waivers ?? []).map((waiver) => ({ theme, ...waiver })),
  );
}

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

/** The surface a finish field fills, or nothing when it fills none (a transparent `hover`). */
function surface(source: unknown, vars: Record<string, string>) {
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
    .filter(([name]) => name.endsWith("-foreground") && name !== "foreground" && !skipped[name])
    .map(([name]) => [name, stem(name)] as [string, string])) {
    if (tokenKind(vars[bg] ?? "") === "color") {
      add({ fg, bg, required: 4.5, why: "a text role on its surface" }, fg, bg);
    }
  }
  const check = (fg: string, bg: string, ink: string, fill: Rgb, why: string) => {
    const back = colourOf(over(css(fill), css(page))) ?? fill;
    const ratio = on(ink, back);
    if (ratio === undefined) return;
    results.push({ fg, bg, required: 4.5, why, theme: id, mode, ratio, pass: ratio >= 4.5 });
  };
  /** A finish's ink by the role it names (`{foreground}` → `foreground`), else by its field. */
  const inkName = (raw: string, field: string) => /^\{([a-z0-9-]+)\}$/.exec(raw)?.[1] ?? field;
  const finishes = { ...semantics.finishes?.shared, ...semantics.finishes?.[mode] };
  for (const role of Object.keys(finishes).sort()) {
    if (inkless.has(role)) continue;
    const finish = { ...semantics.finishes?.shared?.[role], ...semantics.finishes?.[mode]?.[role] };
    const ink = finish.foreground;
    const fill = surface(finish.background ?? finish.gradient, vars);
    if (typeof ink === "string" && fill)
      check(
        inkName(ink, `finish.${role}.foreground`),
        `finish.${role}`,
        ink,
        fill,
        `text on ${role}`,
      );
    const pressedInk = finish["pressed-foreground"];
    const pressedFill = surface(finish["pressed-background"], vars);
    if (typeof pressedInk === "string" && pressedFill)
      check(
        inkName(pressedInk, `finish.${role}.pressed-foreground`),
        `finish.${role}.pressed-background`,
        pressedInk,
        pressedFill,
        `text on ${role}, pressed`,
      );
  }
  return results;
}

/**
 * The smallest gap in OKLCH lightness a fill needs from the ground it is painted on: below it the
 * fill is there but a reader cannot pick it out. 0.015 is shadcn's light sidebar selection
 * (`sidebar` 0.985, `sidebar-accent` 0.97), the closest a shipped theme comes on purpose.
 */
export const fillFloor = 0.015;

/**
 * The fill roles checked against the ground they are painted on, one token on four surfaces.
 * `accent` is the selection/hover fill (rows, menu items, ghost buttons, toggles); `sidebar-accent`
 * is the same fill in the sidebar.
 */
const fillPairs: [string, string][] = [
  ["accent", "background"],
  ["accent", "card"],
  ["accent", "popover"],
  ["sidebar-accent", "sidebar"],
];

/** One fill check: the fill role, the ground it is painted on, and the gap it must keep. */
export type FillPair = { fill: string; ground: string; floor: number; why: string };

/** A resolved fill check: the lightness of each side, their difference, and the verdict. */
export type FillResult = FillPair & {
  theme: string;
  mode: Mode;
  groundL: number;
  fillL: number;
  deltaL: number;
  pass: boolean;
};

/**
 * A lightness difference read to three decimals. A theme states its L values to about that
 * (`shadcn`'s 0.985 and 0.97 are 0.015 apart), so the floor is met at the precision the theme
 * writes, not only above a round-trip's rounding error.
 */
const readDelta = (value: number) => Math.round(value * 1000) / 1000;

/** An opaque colour's OKLCH lightness, from the 8-bit channels it draws. */
export function lightness(color: Rgb): number {
  return rgbToOklch(color).l;
}

/** The fills one theme's appearance resolves, each composited over its ground, with its gap. */
export function themeFills(
  theme: { cssVars?: ThemeCssVars },
  id: string,
  mode: Mode,
): FillResult[] {
  const vars = varsOf(theme, mode);
  const page = colourOf(resolve(vars.background ?? "#ffffff", vars));
  if (!page) return [];
  const results: FillResult[] = [];
  for (const [fillRole, groundRole] of fillPairs) {
    if (!(fillRole in vars) || !(groundRole in vars)) continue;
    const fill = surface(vars[fillRole], vars);
    const ground = surface(vars[groundRole], vars);
    if (!fill || !ground) continue;
    const base = colourOf(over(css(ground), css(page))) ?? ground;
    const painted = colourOf(over(css(fill), css(base))) ?? fill;
    const [groundL, fillL] = [lightness(base), lightness(painted)];
    const deltaL = readDelta(fillL - groundL);
    results.push({
      fill: fillRole,
      ground: groundRole,
      floor: fillFloor,
      why: "a fill on the surface it is painted on",
      theme: id,
      mode,
      groundL,
      fillL,
      deltaL,
      pass: Math.abs(deltaL) >= fillFloor,
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

/** Every theme's fill checks, read from the built files; `--themes` narrows the ids. */
export function readFills(themes?: string[]): FillResult[] {
  const ids = themes ?? fs.readdirSync(path.join(process.cwd(), themesDir)).sort();
  const fills: FillResult[] = [];
  for (const id of ids) {
    const themeFile = path.join(process.cwd(), themesDir, id, "theme.json");
    if (!fs.existsSync(themeFile)) continue;
    const theme = JSON.parse(fs.readFileSync(themeFile, "utf8"));
    for (const mode of modes) fills.push(...themeFills(theme, id, mode));
  }
  return fills;
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
  let excused = 0;
  for (const result of results.filter(({ pass }) => !pass)) {
    if (exception(result)) {
      excused += 1;
      continue;
    }
    failed += 1;
    console.error(
      `theme:contrast: ${result.theme} ${result.mode}: ${result.fg} on ${result.bg} is ${result.ratio.toFixed(2)}, needs ${result.required} (${result.why})`,
    );
  }
  const fills = readFills(themes);
  let fillFailed = 0;
  for (const fill of fills.filter(({ pass }) => !pass)) {
    fillFailed += 1;
    console.error(
      `theme:contrast: ${fill.theme} ${fill.mode}: ${fill.fill} on ${fill.ground} is ΔL ${fill.deltaL.toFixed(3)}, needs ${fill.floor} (${fill.why})`,
    );
  }
  const byTheme = new Map<
    string,
    { pass: number; total: number; fills: number; fillTotal: number }
  >();
  for (const result of results) {
    const entry = byTheme.get(result.theme) ?? { pass: 0, total: 0, fills: 0, fillTotal: 0 };
    entry.total += 1;
    if (result.pass) entry.pass += 1;
    byTheme.set(result.theme, entry);
  }
  for (const fill of fills) {
    const entry = byTheme.get(fill.theme) ?? { pass: 0, total: 0, fills: 0, fillTotal: 0 };
    entry.fillTotal += 1;
    if (fill.pass) entry.fills += 1;
    byTheme.set(fill.theme, entry);
  }
  for (const [id, { pass, total, fills: fillPass, fillTotal }] of byTheme) {
    console.log(
      `theme:contrast: ${id}: ${pass} of ${total} pairs pass, ${fillPass} of ${fillTotal} fills separate`,
    );
  }
  const stale = waivers(themes ?? fs.readdirSync(path.join(process.cwd(), themesDir))).filter(
    (entry) =>
      !results.some(
        (result) =>
          !result.pass &&
          result.theme === entry.theme &&
          result.fg === entry.fg &&
          result.bg === entry.bg,
      ),
  );
  for (const entry of stale)
    console.error(
      `theme:contrast: ${entry.theme}: ${entry.fg} on ${entry.bg} passes now; drop its exception (${entry.source})`,
    );
  if (failed > 0 || stale.length > 0 || fillFailed > 0) {
    console.error(
      `theme:contrast: ${failed} of ${results.length} pairs below AA, ${fillFailed} of ${fills.length} fills too close, ${stale.length} stale exceptions`,
    );
    process.exit(1);
  }
  console.log(
    `theme:contrast: every pair passes (${results.length}; ${excused} kept below AA by their platform)`,
  );
  console.log(`theme:contrast: every fill separates (${fills.length})`);
}
