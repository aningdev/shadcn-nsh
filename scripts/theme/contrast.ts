/**
 * WCAG 2.2 contrast & fill-separation checks across all Theme v5 themes (`light` and `dark`).
 *
 *   bun scripts/theme/contrast.ts [--themes <id,...>]
 */
import type {
  AppTheme,
  ColorExpr,
  Mode,
  SurfaceLayer,
  SurfaceRole,
} from "../../packages/theme/schema";
import { ALL_THEMES } from "../../packages/theme/themes";
import { resolveColour, varsOf } from "./css-colour";
import { css, over, parseColor, rgbToOklch, type Rgb } from "./oklch";

export type { Mode };
const modes: Mode[] = ["light", "dark"];

export type Pair = { fg: string; bg: string; required: number; why: string };
export type Result = Pair & { theme: string; mode: Mode; ratio: number; pass: boolean };

const roles: [string, string][] = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["foreground", "surface"],
  ["foreground", "popover"],
  ["foreground", "secondary"],
  ["foreground", "accent"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["muted-foreground", "card"],
  ["muted-foreground", "surface"],
  ["primary-foreground", "primary"],
  ["brand", "background"],
  ["on-media", "media"],
];

const SURFACE_ROLES: readonly SurfaceRole[] = [
  "card",
  "raised",
  "inset",
  "channel",
  "plate",
  "overlay",
  "modal",
  "inverse",
  "glass",
  "accent",
  "fill",
];

function varsFor(entry: AppTheme, mode: Mode): Record<string, string> {
  return { ...entry.theme.cssVars.theme, ...entry.theme.cssVars[mode] };
}

function resolveCssValue(value: string, vars: Record<string, string>): Rgb | undefined {
  const text = value.trim();
  if (/^transparent$|^none$/i.test(text)) return undefined;
  const rel = /^oklch\(from \{([a-z0-9-]+)\} l c h \/ ([\d.]+)\)$/.exec(text);
  if (rel) {
    const base = resolveColour(vars[rel[1]!] ?? text, varsOf(vars));
    return { ...base, a: Number(rel[2]) };
  }
  const normalized = text.replace(/\{([a-z0-9-]+)\}/g, (_, ref: string) => `var(--${ref})`);
  return resolveColour(normalized, varsOf(vars));
}

function resolveExprColor(
  expr: ColorExpr | null | undefined,
  entry: AppTheme,
  mode: Mode,
  vars: Record<string, string>,
): Rgb | undefined {
  if (expr === undefined || expr === null || expr === "none" || expr === "transparent") {
    return undefined;
  }
  if (typeof expr === "string") {
    if (expr in vars) return resolveCssValue(vars[expr]!, vars);
    return resolveCssValue(expr, vars);
  }
  if ("tint" in expr) {
    const custom = entry.spec.tokens.tints?.[mode]?.[expr.tint];
    if (custom) return resolveCssValue(custom, vars);
    const base = resolveCssValue(vars[expr.tint] ?? vars.primary!, vars);
    return base ? { ...base, a: expr.alpha ?? entry.spec.tokens.tintAlpha[mode] } : undefined;
  }
  if ("color" in expr) {
    const base =
      expr.color in vars
        ? resolveCssValue(vars[expr.color]!, vars)
        : resolveCssValue(expr.color, vars);
    return base ? { ...base, a: expr.alpha } : undefined;
  }
  return undefined;
}

export function luminance({ r, g, b }: Rgb): number {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
}

export function exception(
  result: Pick<Result, "theme" | "fg" | "bg">,
  pool: readonly AppTheme[] = ALL_THEMES,
): string | undefined {
  const found = pool.find((t) => t.id === result.theme);
  return found?.spec.meta?.contrastWaivers?.find((w) => w.fg === result.fg && w.bg === result.bg)
    ?.source;
}

export function themePairs(entry: AppTheme, mode: Mode): Result[] {
  const vars = varsFor(entry, mode);
  const page = resolveCssValue(vars.background ?? "#ffffff", vars);
  if (!page) return [];

  const ratioOn = (ink: Rgb, bg: Rgb) => contrastRatio(parseColor(over(css(ink), css(bg))), bg);
  const results: Result[] = [];
  const seen = new Set<string>();

  for (const [fg, bg] of roles) {
    const key = `${fg}/${bg}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const fgRgb = fg in vars ? resolveCssValue(vars[fg]!, vars) : undefined;
    const bgRgb = bg in vars ? resolveCssValue(vars[bg]!, vars) : undefined;
    if (!fgRgb || !bgRgb) continue;
    const filled = parseColor(over(css(bgRgb), css(page)));
    const ratio = ratioOn(fgRgb, filled);
    results.push({
      fg,
      bg,
      required: 4.5,
      why: "a text role on its surface",
      theme: entry.id,
      mode,
      ratio,
      pass: ratio >= 4.5,
    });
  }

  for (const role of SURFACE_ROLES) {
    const s = entry.spec.surfaces[role];
    const merged: SurfaceLayer = { ...s, ...s[mode] };
    const fillRgb = resolveExprColor(merged.background, entry, mode, vars);
    if (!fillRgb) continue;
    const fgExpr = merged.foreground ?? "foreground";
    const inkRgb = resolveExprColor(fgExpr, entry, mode, vars);
    if (!inkRgb) continue;
    const back = parseColor(over(css(fillRgb), css(page)));
    const ratio = ratioOn(inkRgb, back);
    const fgName = typeof fgExpr === "string" ? fgExpr : `surface.${role}.foreground`;
    results.push({
      fg: fgName,
      bg: `surface.${role}`,
      required: 4.5,
      why: `text on ${role}`,
      theme: entry.id,
      mode,
      ratio,
      pass: ratio >= 4.5,
    });
  }

  // Also check pressed accent text contrast when a theme overrides press.accent fill/ink.
  const pressedAcc = entry.spec.feedback.press.accent;
  if (pressedAcc.background && pressedAcc.foreground) {
    const pBgExpr =
      typeof pressedAcc.background === "object" && "light" in pressedAcc.background
        ? pressedAcc.background[mode]
        : (pressedAcc.background as ColorExpr);
    const pFgExpr =
      typeof pressedAcc.foreground === "object" && "light" in pressedAcc.foreground
        ? pressedAcc.foreground[mode]
        : (pressedAcc.foreground as ColorExpr);
    const fillRgb = resolveExprColor(pBgExpr, entry, mode, vars);
    const inkRgb = resolveExprColor(pFgExpr, entry, mode, vars);
    if (fillRgb && inkRgb) {
      const back = parseColor(over(css(fillRgb), css(page)));
      const ratio = ratioOn(inkRgb, back);
      results.push({
        fg: "feedback.press.accent.foreground",
        bg: "feedback.press.accent.background",
        required: 4.5,
        why: "text on accent, pressed",
        theme: entry.id,
        mode,
        ratio,
        pass: ratio >= 4.5,
      });
    }
  }

  return results;
}

export const fillFloor = 0.015;
const fillPairs: [string, string][] = [
  ["accent", "background"],
  ["accent", "card"],
  ["accent", "popover"],
];

export type FillPair = { fill: string; ground: string; floor: number; why: string };
export type FillResult = FillPair & {
  theme: string;
  mode: Mode;
  groundL: number;
  fillL: number;
  deltaL: number;
  pass: boolean;
};

const readDelta = (value: number) => Math.round(value * 1000) / 1000;
export const lightness = (color: Rgb): number => rgbToOklch(color).l;

export function themeFills(entry: AppTheme, mode: Mode): FillResult[] {
  const vars = varsFor(entry, mode);
  const page = resolveCssValue(vars.background ?? "#ffffff", vars);
  if (!page) return [];
  const results: FillResult[] = [];
  for (const [fillRole, groundRole] of fillPairs) {
    if (!(fillRole in vars) || !(groundRole in vars)) continue;
    const fill = resolveCssValue(vars[fillRole]!, vars);
    const ground = resolveCssValue(vars[groundRole]!, vars);
    if (!fill || !ground) continue;
    const base = parseColor(over(css(ground), css(page)));
    const painted = parseColor(over(css(fill), css(base)));
    const [groundL, fillL] = [lightness(base), lightness(painted)];
    const deltaL = readDelta(fillL - groundL);
    results.push({
      fill: fillRole,
      ground: groundRole,
      floor: fillFloor,
      why: "a fill on the surface it is painted on",
      theme: entry.id,
      mode,
      groundL,
      fillL,
      deltaL,
      pass: Math.abs(deltaL) >= fillFloor,
    });
  }
  return results;
}

export function readResults(themes?: readonly string[]): Result[] {
  const pool = themes ? ALL_THEMES.filter((t) => themes.includes(t.id)) : ALL_THEMES;
  return pool.flatMap((entry) => modes.flatMap((mode) => themePairs(entry, mode)));
}

export function readFills(themes?: readonly string[]): FillResult[] {
  const pool = themes ? ALL_THEMES.filter((t) => themes.includes(t.id)) : ALL_THEMES;
  return pool.flatMap((entry) => modes.flatMap((mode) => themeFills(entry, mode)));
}

if (import.meta.main) {
  const at = process.argv.indexOf("--themes");
  const value = at >= 0 ? process.argv[at + 1] : undefined;
  const themes = value
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);
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
    const e = byTheme.get(result.theme) ?? { pass: 0, total: 0, fills: 0, fillTotal: 0 };
    e.total += 1;
    if (result.pass) e.pass += 1;
    byTheme.set(result.theme, e);
  }
  for (const fill of fills) {
    const e = byTheme.get(fill.theme) ?? { pass: 0, total: 0, fills: 0, fillTotal: 0 };
    e.fillTotal += 1;
    if (fill.pass) e.fills += 1;
    byTheme.set(fill.theme, e);
  }
  for (const [id, { pass, total, fills: fp, fillTotal }] of byTheme) {
    console.log(
      `theme:contrast: ${id}: ${pass} of ${total} pairs pass, ${fp} of ${fillTotal} fills separate`,
    );
  }
  const pool = themes ? ALL_THEMES.filter((t) => themes.includes(t.id)) : ALL_THEMES;
  const stale = pool.flatMap((t) =>
    (t.spec.meta?.contrastWaivers ?? [])
      .map((w) => ({ theme: t.id, ...w }))
      .filter(
        (w) =>
          !results.some((r) => !r.pass && r.theme === w.theme && r.fg === w.fg && r.bg === w.bg),
      ),
  );
  for (const entry of stale) {
    console.error(
      `theme:contrast: ${entry.theme}: ${entry.fg} on ${entry.bg} passes now; drop its exception (${entry.source})`,
    );
  }
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
