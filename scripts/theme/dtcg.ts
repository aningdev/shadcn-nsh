/**
 * Shared DTCG 2025.10 source emitter for theme generators (`generate-shadcn.ts`,
 * `generate-solid-glass.ts`, `generate-apple.ts`, `generate-material.ts`, `generate-winui.ts`).
 *
 * Converts a generator's computed `cssVars` (`theme`, `light`, `dark`), optional `style` overrides
 * (shared and pointer/touch tiers, diffed sparsely against `packages/theme/tokens/base/*`), and
 * light/dark `finishes` into the sparse DTCG 2025.10 source tree under
 * `packages/theme/tokens/themes/<id>/` (reading role order and baseline `$description`s from
 * `packages/theme/tokens/themes/default/` and `packages/theme/tokens/base/*`), then runs
 * `tokens:build` for that theme so one generator command updates both the DTCG source and the
 * compiled runtime files.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { buildThemeTargets } from "../tokens/build";
import { evaluateColorMix, oklchToHex6 } from "../tokens/color";
import {
  COLOR_ROLE_BY_NAME,
  EXT_NS,
  FORMAT_SCHEMA_URL,
  RADIUS_KEYS,
  RESOLVER_SCHEMA_URL,
  TYPE_ROLES,
  type ColorRole,
  type DesignMdExtension,
  type DtcgColor,
} from "../tokens/types";
import { toOklchText } from "./oklch";
import { splitFinishes } from "./tokens";

export interface ThemeTypeRoleStyle {
  fontSize: { pointer: number; touch: number };
  lineHeight: { pointer: number; touch: number };
  fontWeight: number;
  letterSpacing: number;
}

export type ThemeMotionRoleStyle =
  | { stiffness: number; damping: number }
  | { duration: number; timingFunction: string };

export interface ThemeStyleInput {
  typography: {
    fontFamily: string | null;
    caption: ThemeTypeRoleStyle;
    detail: ThemeTypeRoleStyle;
    body: ThemeTypeRoleStyle;
    label: ThemeTypeRoleStyle;
    title: ThemeTypeRoleStyle;
    headline: ThemeTypeRoleStyle;
    display: ThemeTypeRoleStyle;
  };
  dimension: {
    shape: {
      control: string;
      container: string;
      modal: string;
    };
    size: {
      hit: { pointer: number; touch: number };
      density: {
        pointer: { row: number; pad: number; gap: number; surface: number };
        touch: { row: number; pad: number; gap: number; surface: number };
      };
      control: {
        pointer: Record<string, number | string>;
        touch: Record<string, number | string>;
      };
      height: {
        pointer: { sm: number; md: number; lg: number };
        touch: { sm: number; md: number; lg: number };
      };
    };
    stroke: { hairline: number; surface: number; control: number };
    focus: { style: string; width: number; offset: number };
    icon: {
      pointer: { sm: number; md: number; lg: number };
      touch: { sm: number; md: number; lg: number };
    };
  };
  shape: {
    curve: string;
    corners: {
      button: "full" | "radius";
    };
  };
  state: {
    "press-scale": number;
    overlay: { hover: number; focus: number; pressed: number; dragged: number };
    ripple: boolean;
    "pressed-opacity": number;
    "rest-opacity": number;
    disabled: { content: number; fill: boolean };
  };
  duration: { shake: number };
  transition: { enter: { duration: number; timingFunction: string } };
  motion: {
    press: ThemeMotionRoleStyle;
    settle: ThemeMotionRoleStyle;
    control: ThemeMotionRoleStyle;
    move: ThemeMotionRoleStyle;
  };
  controls?: "base" | "material" | "winui";
}

export interface ThemeGeneratorOutput {
  id: string;
  name: string;
  resolverDescription: string;
  themeDescription: string;
  finishesDescription: string;
  lightDescription: string;
  darkDescription: string;
  pointerDescription?: string;
  touchDescription?: string;
  "press-scale"?: number;
  radiusGroupDescription?: string;
  style?: ThemeStyleInput;
  designMd?: Pick<DesignMdExtension, "overview" | "elevation" | "dos" | "donts">;
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  finishes: {
    light: Record<string, Record<string, unknown>>;
    dark: Record<string, Record<string, unknown>>;
  };
  descriptions?: {
    sharedColors?: Record<string, string>;
    lightColors?: Record<string, string>;
    darkColors?: Record<string, string>;
    finishes?: Record<string, string>;
    style?: Record<string, string>;
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const deepEqual = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

function readJson(absPath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(absPath, "utf8")) as Record<string, unknown>;
}

/** Parse a canonical `oklch(L C H [/ A])` string into a DTCG color object with hex fallback. */
function parseOklchToDtcg(raw: string): DtcgColor {
  const text = toOklchText(raw.trim());
  const match = /^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+)\s*)?\)$/.exec(
    text,
  );
  if (!match) throw new Error(`Expected oklch() color, got: ${raw}`);
  const l = Number(match[1]);
  const c = Number(match[2]);
  const h = Number(match[3]);
  const alpha = match[4] !== undefined ? Number(match[4]) : undefined;
  return {
    colorSpace: "oklch",
    components: [l, c, h],
    ...(alpha !== undefined && alpha < 1 ? { alpha } : {}),
    hex: oklchToHex6(l, c, h),
  };
}

/** Resolve a `var(--x)` or `{x}` or `oklch(...)` operand to a static `DtcgColor` against `colorMap`. */
function resolveStaticColor(
  operand: string,
  colorMap: Record<string, string>,
  stack = new Set<string>(),
): DtcgColor {
  const varMatch = /^var\(--([a-z0-9-]+)\)$/.exec(operand.trim());
  if (varMatch) {
    const key = varMatch[1]!;
    if (stack.has(key)) throw new Error(`Circular color reference: ${key}`);
    const target = colorMap[key];
    if (target === undefined) throw new Error(`Unknown color token var(--${key})`);
    const next = new Set(stack);
    next.add(key);
    return resolveStaticColor(target, colorMap, next);
  }
  const refMatch = /^\{([a-z0-9-]+)\}$/.exec(operand.trim());
  if (refMatch) {
    const key = refMatch[1]!;
    if (stack.has(key)) throw new Error(`Circular color reference: ${key}`);
    const target = colorMap[key];
    if (target === undefined) throw new Error(`Unknown color token {${key}}`);
    const next = new Set(stack);
    next.add(key);
    return resolveStaticColor(target, colorMap, next);
  }
  const mixMatch = /^\s*color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([0-9.]+)%\s*,\s*(.+?)\s*\)\s*$/.exec(
    operand,
  );
  if (mixMatch) {
    const a = resolveStaticColor(mixMatch[1]!, colorMap, stack);
    const pct = Number(mixMatch[2]);
    const bRaw = mixMatch[3]!.trim();
    const b = bRaw === "transparent" ? "transparent" : resolveStaticColor(bRaw, colorMap, stack);
    return evaluateColorMix(a, pct, b);
  }
  return parseOklchToDtcg(operand);
}

/** Convert a `cssVars` color value (`oklch(...)`, `var(--x)`, or `color-mix(...)`) to a DTCG color token. */
function encodeCssColorToken(
  name: string,
  value: string,
  colorMap: Record<string, string>,
  description: string,
): Record<string, unknown> {
  const role: ColorRole | undefined = COLOR_ROLE_BY_NAME[name];
  const extFields: Record<string, unknown> = {};
  if (role) extFields.role = role;

  const varMatch = /^var\(--([a-z0-9-]+)\)$/.exec(value.trim());
  if (varMatch) {
    return {
      $value: `{color.${varMatch[1]!}}`,
      ...(Object.keys(extFields).length > 0 ? { $extensions: { [EXT_NS]: extFields } } : {}),
      $description: description,
    };
  }

  const mixMatch = /^\s*color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([0-9.]+)%\s*,\s*(.+?)\s*\)\s*$/.exec(
    value,
  );
  if (mixMatch) {
    const rawA = mixMatch[1]!.trim();
    const percent = Number(mixMatch[2]);
    const rawB = mixMatch[3]!.trim();

    const encodeOperand = (op: string): DtcgColor | string => {
      const m = /^var\(--([a-z0-9-]+)\)$/.exec(op);
      if (m) return `{color.${m[1]!}}`;
      return parseOklchToDtcg(op);
    };

    const aResolved = resolveStaticColor(rawA, colorMap);
    const bResolved = rawB === "transparent" ? "transparent" : resolveStaticColor(rawB, colorMap);
    const staticVal = evaluateColorMix(aResolved, percent, bResolved);

    return {
      $value: staticVal,
      $extensions: {
        [EXT_NS]: {
          ...extFields,
          colorOp: {
            op: "mix",
            space: "srgb",
            a: encodeOperand(rawA),
            percent,
            b: rawB === "transparent" ? "transparent" : encodeOperand(rawB),
          },
        },
      },
      $description: description,
    };
  }

  return {
    $value: parseOklchToDtcg(value),
    ...(Object.keys(extFields).length > 0 ? { $extensions: { [EXT_NS]: extFields } } : {}),
    $description: description,
  };
}

/** Split a CSS list by top-level commas (outside parentheses). */
function splitTopLevelCommas(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

/** Split a string by top-level whitespace (outside parentheses). */
function splitTopLevelSpaces(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (/\s/.test(ch!) && depth === 0) {
      if (start !== -1) {
        parts.push(text.slice(start, i));
        start = -1;
      }
    } else if (start === -1) {
      start = i;
    }
  }
  if (start !== -1) parts.push(text.slice(start));
  return parts;
}

const zeroPlaceholderColor: DtcgColor = {
  colorSpace: "oklch",
  components: [0, 0, 0],
  alpha: 0,
  hex: "#000000",
};

function parseDimToken(raw: string): { value: number; unit: "px" | "rem" } {
  if (raw === "0") return { value: 0, unit: "px" };
  const m = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(px|rem)$/.exec(raw);
  if (!m) throw new Error(`Expected dimension length, got: ${raw}`);
  return { value: Number(m[1]), unit: m[2] as "px" | "rem" };
}

/** Convert a finish colour field (`{token}`, `transparent`, `oklch(from ...)`, or `oklch(...)`). */
function encodeFinishColorToken(
  value: string,
  colorMap: Record<string, string>,
): Record<string, unknown> {
  const trimmed = value.trim();
  if (trimmed === "transparent") {
    return {
      $type: "color",
      $value: structuredClone(zeroPlaceholderColor),
      $extensions: {
        [EXT_NS]: {
          transparentKeyword: true,
        },
      },
    };
  }

  const refMatch = /^\{([a-z0-9-]+)\}$/.exec(trimmed);
  if (refMatch) {
    return {
      $type: "color",
      $value: `{color.${refMatch[1]!}}`,
    };
  }

  const relMatch = /^oklch\(\s*from\s+\{([a-z0-9-]+)\}\s+l\s+c\s+h\s*\/\s*([0-9.]+)\s*\)$/.exec(
    trimmed,
  );
  if (relMatch) {
    const tokenName = relMatch[1]!;
    const alpha = Number(relMatch[2]);
    const base = resolveStaticColor(`{${tokenName}}`, colorMap);
    return {
      $type: "color",
      $value: {
        colorSpace: "oklch",
        components: [...base.components] as [number, number, number],
        ...(alpha < 1 ? { alpha } : {}),
        hex: oklchToHex6(base.components[0], base.components[1], base.components[2]),
      },
      $extensions: {
        [EXT_NS]: {
          colorOp: {
            op: "alpha",
            color: `{color.${tokenName}}`,
            alpha,
          },
        },
      },
    };
  }

  return {
    $type: "color",
    $value: parseOklchToDtcg(trimmed),
  };
}

/** Convert a CSS `linear-gradient(...)` string to a DTCG `gradient` token. */
function encodeFinishGradientToken(raw: string): Record<string, unknown> {
  const normalized = toOklchText(raw.trim());
  const match = /^linear-gradient\((.+)\)$/.exec(normalized);
  if (!match) throw new Error(`Expected linear-gradient(...), got: ${raw}`);
  const parts = splitTopLevelCommas(match[1]!);
  const angleMatch = /^([0-9.]+)deg$/.exec(parts[0]!);
  if (!angleMatch) throw new Error(`Expected gradient angle in deg, got: ${parts[0]}`);
  const angle = Number(angleMatch[1]);

  const transparentStops: number[] = [];
  const stops = parts.slice(1).map((stopText, idx) => {
    const tokens = splitTopLevelSpaces(stopText);
    const posStr = tokens.pop()!;
    const posMatch = /^([0-9.]+)%$/.exec(posStr);
    if (!posMatch) throw new Error(`Expected gradient stop percentage, got: ${posStr}`);
    const position = Number(posMatch[1]) / 100;
    const colorText = tokens.join(" ");

    let color: DtcgColor | string;
    if (colorText === "transparent") {
      transparentStops.push(idx);
      color = structuredClone(zeroPlaceholderColor);
    } else if (/^\{[a-z0-9-]+\}$/.test(colorText)) {
      color = `{color.${colorText.slice(1, -1)}}`;
    } else {
      color = parseOklchToDtcg(colorText);
    }
    return { color, position };
  });

  return {
    $type: "gradient",
    $value: stops,
    $extensions: {
      [EXT_NS]: {
        angle,
        ...(transparentStops.length > 0 ? { transparentStops } : {}),
      },
    },
  };
}

/** Convert a CSS `boxShadow` string (`"none"` or shadow layers) to a DTCG `shadow` token. */
function encodeFinishShadowToken(raw: string): Record<string, unknown> {
  const trimmed = toOklchText(raw.trim());
  if (trimmed === "none") {
    return {
      $type: "shadow",
      $value: {
        color: structuredClone(zeroPlaceholderColor),
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 0, unit: "px" },
        blur: { value: 0, unit: "px" },
        spread: { value: 0, unit: "px" },
      },
      $extensions: {
        [EXT_NS]: {
          none: true,
        },
      },
    };
  }

  const items = splitTopLevelCommas(trimmed).map((layer) => {
    const tokens = splitTopLevelSpaces(layer);
    let idx = 0;
    let inset = false;
    if (tokens[idx] === "inset") {
      inset = true;
      idx++;
    }
    const lenPattern = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem)?$/;
    const lengths: string[] = [];
    while (idx < tokens.length && lengths.length < 4 && lenPattern.test(tokens[idx]!)) {
      lengths.push(tokens[idx]!);
      idx++;
    }
    if (lengths.length < 3 || lengths.length > 4) {
      throw new Error(`Expected 3 or 4 shadow lengths in "${layer}"`);
    }
    const offsetX = parseDimToken(lengths[0]!);
    const offsetY = parseDimToken(lengths[1]!);
    const blur = parseDimToken(lengths[2]!);
    const spread =
      lengths[3] !== undefined ? parseDimToken(lengths[3]) : { value: 0, unit: "px" as const };
    const colorRaw = tokens.slice(idx).join(" ");
    const color = /^\{[a-z0-9-]+\}$/.test(colorRaw)
      ? `{color.${colorRaw.slice(1, -1)}}`
      : parseOklchToDtcg(colorRaw);

    return {
      color,
      offsetX,
      offsetY,
      blur,
      spread,
      ...(inset ? { inset: true } : {}),
    };
  });

  return {
    $type: "shadow",
    $value: items.length === 1 ? items[0] : items,
  };
}

function encodeMaterial(material: unknown): unknown {
  if (!isRecord(material)) return material;
  const out = structuredClone(material);
  if (isRecord(out.apple) && typeof out.apple.tint === "string") {
    const m = /^\{([a-z0-9-]+)\}$/.exec(out.apple.tint);
    if (m) out.apple.tint = `{color.${m[1]!}}`;
  }
  if (
    isRecord(out.android) &&
    isRecord(out.android.ripple) &&
    typeof out.android.ripple.color === "string"
  ) {
    const m = /^\{([a-z0-9-]+)\}$/.exec(out.android.ripple.color);
    if (m) out.android.ripple.color = `{color.${m[1]!}}`;
  }
  return out;
}

/** Encode a `shared`, `light`, or `dark` finishes map into a DTCG `finish` group. */
function encodeFinishSection(
  finishes: Record<string, Record<string, unknown>>,
  colorMap: Record<string, string>,
  roleOrder: readonly string[],
  roleDescriptions?: Record<string, string>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  const orderedRoles = [
    ...roleOrder.filter((r) => r in finishes),
    ...Object.keys(finishes).filter((r) => !roleOrder.includes(r)),
  ];

  for (const role of orderedRoles) {
    const finish = finishes[role]!;
    if (Object.keys(finish).length === 0 && !roleDescriptions?.[role]) continue;

    const group: Record<string, unknown> = {};
    if (roleDescriptions?.[role]) {
      group.$description = roleDescriptions[role];
    }
    if (typeof finish.background === "string") {
      group.background = encodeFinishColorToken(finish.background, colorMap);
    }
    if (typeof finish.gradient === "string") {
      group.gradient = encodeFinishGradientToken(finish.gradient);
    }
    if (typeof finish.shadow === "string") {
      group.shadow = encodeFinishShadowToken(finish.shadow);
    }
    if (typeof finish.foreground === "string") {
      group.foreground = encodeFinishColorToken(finish.foreground, colorMap);
    }
    if (typeof finish["border-color"] === "string") {
      group["border-color"] = encodeFinishColorToken(finish["border-color"], colorMap);
    }
    if (typeof finish["border-top-color"] === "string") {
      group["border-top-color"] = encodeFinishColorToken(finish["border-top-color"], colorMap);
    }
    if (typeof finish["border-bottom-color"] === "string") {
      group["border-bottom-color"] = encodeFinishColorToken(
        finish["border-bottom-color"],
        colorMap,
      );
    }

    const ext: Record<string, unknown> = {};
    if ("backdropFilter" in finish) ext.backdropFilter = finish.backdropFilter;
    if ("material" in finish) ext.material = encodeMaterial(finish.material);
    if (Object.keys(ext).length > 0) {
      group.$extensions = { [EXT_NS]: ext };
    }

    out[role] = group;
  }
  return out;
}

function readDefaultMetadata(repoRoot: string) {
  const defDir = path.join(repoRoot, "packages/theme/tokens/themes/default");
  const baseDir = path.join(repoRoot, "packages/theme/tokens/base");
  const defTheme = readJson(path.join(defDir, "theme.tokens.json"));
  const defFinishes = readJson(path.join(defDir, "finishes.shared.tokens.json"));
  const defLight = readJson(path.join(defDir, "light.tokens.json"));
  const defDark = readJson(path.join(defDir, "dark.tokens.json"));
  const baseShared = readJson(path.join(baseDir, "style.shared.tokens.json"));
  const basePointer = readJson(path.join(baseDir, "style.pointer.tokens.json"));
  const baseTouch = readJson(path.join(baseDir, "style.touch.tokens.json"));

  const getDescriptions = (group: unknown): Record<string, string> => {
    if (!isRecord(group)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(group)) {
      if (k.startsWith("$") || !isRecord(v)) continue;
      if (typeof v.$description === "string") out[k] = v.$description;
    }
    return out;
  };

  const getKeys = (group: unknown): string[] =>
    isRecord(group) ? Object.keys(group).filter((k) => !k.startsWith("$")) : [];

  const radiusGroup = (defTheme.dimension as Record<string, unknown>).radius as Record<
    string,
    unknown
  >;

  return {
    radiusDescriptions: getDescriptions(radiusGroup),
    sharedColorKeys: getKeys(defTheme.color),
    sharedColorDescriptions: getDescriptions(defTheme.color),
    lightColorKeys: getKeys(defLight.color),
    lightColorDescriptions: getDescriptions(defLight.color),
    darkColorKeys: getKeys(defDark.color),
    darkColorDescriptions: getDescriptions(defDark.color),
    finishRoles: getKeys(defFinishes.finish),
    finishDescriptions: getDescriptions(defFinishes.finish),
    baseShared,
    basePointer,
    baseTouch,
  };
}

function getAt(root: Record<string, unknown>, ...keys: string[]): Record<string, unknown> {
  let cur: unknown = root;
  for (const k of keys) {
    if (!isRecord(cur) || !isRecord(cur[k])) {
      throw new Error(`Missing base style path: ${keys.join(".")}`);
    }
    cur = cur[k];
  }
  return cur as Record<string, unknown>;
}

function getExtNs(node: Record<string, unknown>): Record<string, unknown> {
  const exts = node.$extensions;
  if (!isRecord(exts) || !isRecord(exts[EXT_NS])) return {};
  return exts[EXT_NS];
}

function toDtcgFontFamilyRef(raw: string | null): string | null {
  if (raw === null) return null;
  const m = /^\{font-([a-z0-9-]+)\}$/.exec(raw);
  return m ? `{font.family.${m[1]!}}` : raw;
}

function encodeSharedStyleOverrides(
  style: ThemeStyleInput,
  baseShared: Record<string, unknown>,
  styleDescs: Record<string, string> | undefined,
): {
  dimensionExtras: Record<string, unknown>;
  typography?: Record<string, unknown>;
  shape?: Record<string, unknown>;
  state: Record<string, unknown>;
  duration?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  motion?: Record<string, unknown>;
  controls?: Record<string, unknown>;
} {
  const desc = (key: string, fallback: unknown): string =>
    styleDescs?.[key] ?? (typeof fallback === "string" ? fallback : key);

  // 1. typography
  const baseTypoGroup = getAt(baseShared, "typography");
  const baseFontFamilyExt = (getExtNs(baseTypoGroup).fontFamily as string | null) ?? null;
  const themeFontFamilyExt = toDtcgFontFamilyRef(style.typography.fontFamily);
  const roleFontFamily: string | string[] = themeFontFamilyExt ?? ["system-ui", "sans-serif"];
  const typoOverrides: Record<string, unknown> = {};
  for (const role of TYPE_ROLES) {
    const spec = style.typography[role];
    const baseTok = getAt(baseTypoGroup, role);
    const baseVal = baseTok.$value as Record<string, unknown>;
    const nextWeight = spec.fontWeight;
    const nextTracking = { value: spec.letterSpacing, unit: "px" };
    if (
      !deepEqual(roleFontFamily, baseVal.fontFamily) ||
      nextWeight !== baseVal.fontWeight ||
      !deepEqual(nextTracking, baseVal.letterSpacing)
    ) {
      typoOverrides[role] = {
        $value: {
          fontFamily: roleFontFamily,
          fontSize: `{font.size.${role}}`,
          fontWeight: nextWeight,
          lineHeight: `{font.line-height.${role}}`,
          letterSpacing: nextTracking,
        },
        $description: desc(`typography.${role}`, baseTok.$description),
      };
    }
  }
  const typography =
    themeFontFamilyExt !== baseFontFamilyExt || Object.keys(typoOverrides).length > 0
      ? {
          $type: "typography",
          $description: desc("typography", baseTypoGroup.$description),
          ...(themeFontFamilyExt !== baseFontFamilyExt
            ? { $extensions: { [EXT_NS]: { fontFamily: themeFontFamilyExt } } }
            : {}),
          ...typoOverrides,
        }
      : undefined;

  // 2. dimension.stroke & dimension.focus
  const dimensionExtras: Record<string, unknown> = {};
  const baseStroke = getAt(baseShared, "dimension", "stroke");
  const strokeOverrides: Record<string, unknown> = {};
  for (const key of ["hairline", "surface", "control"] as const) {
    const baseTok = getAt(baseStroke, key);
    const baseVal = (baseTok.$value as { value: number }).value;
    if (style.dimension.stroke[key] !== baseVal) {
      strokeOverrides[key] = {
        $value: { value: style.dimension.stroke[key], unit: "px" },
        $description: desc(`dimension.stroke.${key}`, baseTok.$description),
      };
    }
  }
  if (Object.keys(strokeOverrides).length > 0) {
    dimensionExtras.stroke = {
      $description: desc("dimension.stroke", baseStroke.$description),
      ...strokeOverrides,
    };
  }

  const baseFocus = getAt(baseShared, "dimension", "focus");
  const baseFocusStyle = getExtNs(baseFocus).style as string;
  const focusOverrides: Record<string, unknown> = {};
  for (const key of ["width", "offset"] as const) {
    const baseTok = getAt(baseFocus, key);
    const baseVal = (baseTok.$value as { value: number }).value;
    if (style.dimension.focus[key] !== baseVal) {
      focusOverrides[key] = {
        $value: { value: style.dimension.focus[key], unit: "px" },
        $description: desc(`dimension.focus.${key}`, baseTok.$description),
      };
    }
  }
  if (style.dimension.focus.style !== baseFocusStyle || Object.keys(focusOverrides).length > 0) {
    dimensionExtras.focus = {
      ...(style.dimension.focus.style !== baseFocusStyle
        ? { $extensions: { [EXT_NS]: { style: style.dimension.focus.style } } }
        : {}),
      $description: desc("dimension.focus", baseFocus.$description),
      ...focusOverrides,
    };
  }

  // 3. shape ($extensions)
  const baseShape = getAt(baseShared, "shape");
  const baseShapeExt = getExtNs(baseShape);
  const baseCorners = (baseShapeExt.corners as Record<string, unknown> | undefined) ?? {};
  const shapeExtOut: Record<string, unknown> = {};
  if (style.shape.curve !== baseShapeExt.curve) shapeExtOut.curve = style.shape.curve;
  if (style.shape.corners.button !== baseCorners.button) {
    shapeExtOut.corners = { button: style.shape.corners.button };
  }
  const shape =
    Object.keys(shapeExtOut).length > 0
      ? {
          $description: desc("shape", baseShape.$description),
          $extensions: { [EXT_NS]: shapeExtOut },
        }
      : undefined;

  // 4. state
  const baseState = getAt(baseShared, "state");
  const baseRipple = getExtNs(baseState).ripple as boolean;
  const stateOut: Record<string, unknown> = {
    $type: "number",
    ...(style.state.ripple !== baseRipple
      ? { $extensions: { [EXT_NS]: { ripple: style.state.ripple } } }
      : {}),
    $description: desc("state", baseState.$description),
  };

  const basePressScale = getAt(baseState, "press-scale");
  if (style.state["press-scale"] !== basePressScale.$value) {
    stateOut["press-scale"] = {
      $value: style.state["press-scale"],
      $description: desc("state.press-scale", basePressScale.$description),
    };
  }

  const baseOverlay = getAt(baseState, "overlay");
  const overlayOverrides: Record<string, unknown> = {};
  for (const key of ["hover", "focus", "pressed", "dragged"] as const) {
    const baseTok = getAt(baseOverlay, key);
    if (style.state.overlay[key] !== baseTok.$value) {
      overlayOverrides[key] = { $value: style.state.overlay[key] };
    }
  }
  if (Object.keys(overlayOverrides).length > 0) {
    stateOut.overlay = {
      $description: desc("state.overlay", baseOverlay.$description),
      ...overlayOverrides,
    };
  }

  const basePressedOpacity = getAt(baseState, "pressed-opacity");
  if (style.state["pressed-opacity"] !== basePressedOpacity.$value) {
    stateOut["pressed-opacity"] = {
      $value: style.state["pressed-opacity"],
      $description: desc("state.pressed-opacity", basePressedOpacity.$description),
    };
  }

  const baseRestOpacity = getAt(baseState, "rest-opacity");
  if (style.state["rest-opacity"] !== baseRestOpacity.$value) {
    stateOut["rest-opacity"] = {
      $value: style.state["rest-opacity"],
      $description: desc("state.rest-opacity", baseRestOpacity.$description),
    };
  }

  const baseDisabled = getAt(baseState, "disabled");
  const baseDisabledContent = getAt(baseDisabled, "content");
  const baseDisabledFill = (
    (baseDisabled.$extensions as Record<string, Record<string, unknown>> | undefined)?.[EXT_NS] as
      | Record<string, unknown>
      | undefined
  )?.fill;
  const disabledOverrides: Record<string, unknown> = {};
  if (style.state.disabled.content !== baseDisabledContent.$value) {
    disabledOverrides.content = { $value: style.state.disabled.content };
  }
  if (style.state.disabled.fill !== baseDisabledFill) {
    disabledOverrides.$extensions = {
      [EXT_NS]: { fill: style.state.disabled.fill },
    };
  }
  if (Object.keys(disabledOverrides).length > 0) {
    stateOut.disabled = {
      $description: desc("state.disabled", baseDisabled.$description),
      ...disabledOverrides,
    };
  }

  // 5. duration.shake
  const baseDuration = getAt(baseShared, "duration");
  const baseShake = getAt(baseDuration, "shake");
  const baseShakeVal = (baseShake.$value as { value: number }).value;
  const duration =
    style.duration.shake !== baseShakeVal
      ? {
          $type: "duration",
          $description: desc("duration", baseDuration.$description),
          shake: {
            $value: { value: style.duration.shake, unit: "ms" },
            $description: desc("duration.shake", baseShake.$description),
          },
        }
      : undefined;

  // 6. transition.enter
  const baseTransition = getAt(baseShared, "transition");
  const baseEnter = getAt(baseTransition, "enter");
  const baseEnterVal = baseEnter.$value as {
    duration: { value: number };
    timingFunction: string;
  };
  const nextEnterTf = `{cubicBezier.${style.transition.enter.timingFunction}}`;
  const transition =
    style.transition.enter.duration !== baseEnterVal.duration.value ||
    nextEnterTf !== baseEnterVal.timingFunction
      ? {
          $type: "transition",
          $description: desc("transition", baseTransition.$description),
          enter: {
            $value: {
              duration: { value: style.transition.enter.duration, unit: "ms" },
              delay: { value: 0, unit: "ms" },
              timingFunction: nextEnterTf,
            },
            $description: desc("transition.enter", baseEnter.$description),
          },
        }
      : undefined;

  // 7. motion.{press,settle,control,move}
  const baseMotion = getAt(baseShared, "motion");
  const motionOverrides: Record<string, unknown> = {};
  for (const role of ["press", "settle", "control", "move"] as const) {
    const spec = style.motion[role];
    const baseRole = getAt(baseMotion, role);
    if ("duration" in spec) {
      motionOverrides[role] = {
        $description: desc(`motion.${role}`, baseRole.$description),
        timing: {
          $type: "transition",
          $value: {
            duration: { value: spec.duration, unit: "ms" },
            delay: { value: 0, unit: "ms" },
            timingFunction: `{cubicBezier.${spec.timingFunction}}`,
          },
          $description: desc(`motion.${role}.timing`, `Timing curve and duration for ${role}.`),
        },
      };
    } else {
      const baseSpring = getExtNs(baseRole).spring as { stiffness: number; damping: number };
      if (spec.stiffness !== baseSpring.stiffness || spec.damping !== baseSpring.damping) {
        motionOverrides[role] = {
          $extensions: {
            [EXT_NS]: {
              spring: { stiffness: spec.stiffness, damping: spec.damping },
            },
          },
          $description: desc(`motion.${role}`, baseRole.$description),
        };
      }
    }
  }
  const motion =
    Object.keys(motionOverrides).length > 0
      ? {
          $description: desc("motion", baseMotion.$description),
          ...motionOverrides,
        }
      : undefined;

  // 8. controls
  const baseControls = getAt(baseShared, "controls");
  const baseControlsPreset = getExtNs(baseControls).preset as string;
  const preset = style.controls ?? baseControlsPreset;
  const controls =
    preset !== baseControlsPreset
      ? {
          $description: desc("controls", baseControls.$description),
          $extensions: { [EXT_NS]: { preset } },
        }
      : undefined;

  return {
    dimensionExtras,
    ...(typography ? { typography } : {}),
    ...(shape ? { shape } : {}),
    state: stateOut,
    ...(duration ? { duration } : {}),
    ...(transition ? { transition } : {}),
    ...(motion ? { motion } : {}),
    ...(controls ? { controls } : {}),
  };
}

function encodeInputTierOverrides(
  tier: "pointer" | "touch",
  style: ThemeStyleInput,
  baseTier: Record<string, unknown>,
  docDescription: string,
  styleDescs: Record<string, string> | undefined,
): Record<string, unknown> | null {
  const desc = (key: string, fallback: unknown): string =>
    styleDescs?.[`${tier}.${key}`] ??
    styleDescs?.[key] ??
    (typeof fallback === "string" ? fallback : key);

  // font.size & font.line-height
  const baseFont = getAt(baseTier, "font");
  const baseFontSize = getAt(baseFont, "size");
  const baseLineHeight = getAt(baseFont, "line-height");
  const fontSizeDiff: Record<string, unknown> = {};
  const lineHeightDiff: Record<string, unknown> = {};

  for (const role of TYPE_ROLES) {
    const sizeVal = style.typography[role].fontSize[tier];
    const ratio = style.typography[role].lineHeight[tier];
    const baseSize = (getAt(baseFontSize, role).$value as { value: number }).value;
    const baseRatio = getAt(baseLineHeight, role).$value as number;
    if (sizeVal !== baseSize) {
      fontSizeDiff[role] = { $value: { value: sizeVal, unit: "px" } };
    }
    if (ratio !== baseRatio) {
      lineHeightDiff[role] = { $value: ratio };
    }
  }

  const fontGroup: Record<string, unknown> = {};
  if (Object.keys(fontSizeDiff).length > 0) {
    fontGroup.size = {
      $type: "dimension",
      $description: desc("font.size", baseFontSize.$description),
      ...fontSizeDiff,
    };
  }
  if (Object.keys(lineHeightDiff).length > 0) {
    fontGroup["line-height"] = {
      $type: "number",
      $description: desc("font.line-height", baseLineHeight.$description),
      ...lineHeightDiff,
    };
  }

  // dimension.size.* & dimension.icon.*
  const baseDim = getAt(baseTier, "dimension");
  const baseSizeGroup = getAt(baseDim, "size");
  const sizeGroupOut: Record<string, unknown> = {};

  const baseHit = getAt(baseSizeGroup, "hit");
  if (style.dimension.size.hit[tier] !== (baseHit.$value as { value: number }).value) {
    sizeGroupOut.hit = {
      $value: { value: style.dimension.size.hit[tier], unit: "px" },
      $description: desc("dimension.size.hit", baseHit.$description),
    };
  }

  const diffDimSubgroup = (
    subKey: string,
    values: Record<string, number>,
    baseGroup: Record<string, unknown>,
  ): Record<string, unknown> | undefined => {
    const diffs: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      const baseTok = getAt(baseGroup, k);
      const baseV = (baseTok.$value as { value: number }).value;
      if (v !== baseV) {
        diffs[k] = { $value: { value: v, unit: "px" } };
      }
    }
    if (Object.keys(diffs).length === 0) return undefined;
    return {
      $description: desc(subKey, baseGroup.$description),
      ...diffs,
    };
  };

  const densityOut = diffDimSubgroup(
    "dimension.size.density",
    style.dimension.size.density[tier],
    getAt(baseSizeGroup, "density"),
  );
  if (densityOut) sizeGroupOut.density = densityOut;

  const baseControl = getAt(baseSizeGroup, "control");
  const baseSwitch = getExtNs(baseControl).switch as string;
  const controlVals = style.dimension.size.control[tier];
  const controlDiff: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(controlVals)) {
    if (k === "switch") continue;
    const baseTok = getAt(baseControl, k);
    const baseV = (baseTok.$value as { value: number }).value;
    if (v !== baseV) {
      controlDiff[k] = { $value: { value: v as number, unit: "px" } };
    }
  }
  const switchDiff = controlVals.switch !== baseSwitch;
  if (switchDiff || Object.keys(controlDiff).length > 0) {
    sizeGroupOut.control = {
      ...(switchDiff ? { $extensions: { [EXT_NS]: { switch: controlVals.switch } } } : {}),
      $description: desc("dimension.size.control", baseControl.$description),
      ...controlDiff,
    };
  }

  const heightOut = diffDimSubgroup(
    "dimension.size.height",
    style.dimension.size.height[tier],
    getAt(baseSizeGroup, "height"),
  );
  if (heightOut) sizeGroupOut.height = heightOut;

  const baseIcon = getAt(baseDim, "icon");
  const iconOut = diffDimSubgroup("dimension.icon", style.dimension.icon[tier], baseIcon);

  const dimGroup: Record<string, unknown> = {};
  if (Object.keys(sizeGroupOut).length > 0) {
    dimGroup.size = {
      $description: desc("dimension.size", baseSizeGroup.$description),
      ...sizeGroupOut,
    };
  }
  if (iconOut) {
    dimGroup.icon = iconOut;
  }

  if (Object.keys(fontGroup).length === 0 && Object.keys(dimGroup).length === 0) {
    return null;
  }

  return {
    $schema: FORMAT_SCHEMA_URL,
    $description: docDescription,
    ...(Object.keys(fontGroup).length > 0
      ? {
          font: {
            $description: desc("font", baseFont.$description),
            ...fontGroup,
          },
        }
      : {}),
    ...(Object.keys(dimGroup).length > 0
      ? {
          dimension: {
            $type: "dimension",
            $description: desc("dimension", baseDim.$description),
            ...dimGroup,
          },
        }
      : {}),
  };
}

/**
 * Write all DTCG 2025.10 source files for `output.id` under `packages/theme/tokens/themes/<id>/`
 * and compile its shipped `packages/theme/themes/<id>/{theme,semantics}.json`.
 */
export function emitDtcgTheme(
  output: ThemeGeneratorOutput,
  repoRoot = repo,
): { sourceFiles: string[]; builtFiles: string[] } {
  const meta = readDefaultMetadata(repoRoot);
  const outDir = path.join(repoRoot, "packages/theme/tokens/themes", output.id);
  fs.mkdirSync(outDir, { recursive: true });

  const writeFile = (name: string, doc: unknown): string => {
    const abs = path.join(outDir, name);
    fs.writeFileSync(abs, `${JSON.stringify(doc, null, 2)}\n`);
    return path.relative(repoRoot, abs);
  };

  // 1. Style overrides (shared + pointer/touch tiers)
  const sharedStyle = output.style
    ? encodeSharedStyleOverrides(output.style, meta.baseShared, output.descriptions?.style)
    : null;
  const pointerDoc = output.style
    ? encodeInputTierOverrides(
        "pointer",
        output.style,
        meta.basePointer,
        output.pointerDescription ?? `${output.name} pointer input-tier overrides.`,
        output.descriptions?.style,
      )
    : null;
  const touchDoc = output.style
    ? encodeInputTierOverrides(
        "touch",
        output.style,
        meta.baseTouch,
        output.touchDescription ?? `${output.name} touch input-tier overrides.`,
        output.descriptions?.style,
      )
    : null;

  // 2. theme.resolver.json
  const pointerSources = [{ $ref: "../../base/style.pointer.tokens.json" }];
  if (pointerDoc) pointerSources.push({ $ref: "./pointer.tokens.json" });
  const touchSources = [{ $ref: "../../base/style.touch.tokens.json" }];
  if (touchDoc) touchSources.push({ $ref: "./touch.tokens.json" });

  const resolverDoc = {
    $schema: RESOLVER_SCHEMA_URL,
    name: output.name,
    version: "2025.10",
    description: output.resolverDescription,
    sets: {
      base: {
        description: "Cross-theme semantic defaults and shared typography/motion structure.",
        sources: [{ $ref: "../../base/style.shared.tokens.json" }],
      },
      theme: {
        description: `${output.name} appearance-invariant base tokens, shared finishes, and state overrides.`,
        sources: [{ $ref: "./theme.tokens.json" }, { $ref: "./finishes.shared.tokens.json" }],
      },
    },
    modifiers: {
      appearance: {
        description: "Color appearance mode.",
        default: "light",
        contexts: {
          light: [{ $ref: "./light.tokens.json" }],
          dark: [{ $ref: "./dark.tokens.json" }],
        },
      },
      input: {
        description: "Pointer vs touch ergonomic sizing tier.",
        default: "pointer",
        contexts: {
          pointer: pointerSources,
          touch: touchSources,
        },
      },
    },
    resolutionOrder: [
      { $ref: "#/sets/base" },
      { $ref: "#/sets/theme" },
      { $ref: "#/modifiers/appearance" },
      { $ref: "#/modifiers/input" },
    ],
  };

  // 3. theme.tokens.json
  const radiusEntries: Record<string, unknown> = {
    $type: "dimension",
    $description:
      output.radiusGroupDescription ??
      "Base corner radius scale referenced by semantic shape roles.",
  };
  for (const { cssVar, dtcg } of RADIUS_KEYS) {
    const raw = output.cssVars.theme[cssVar];
    if (!raw) throw new Error(`${output.id}: missing ${cssVar}`);
    radiusEntries[dtcg] = {
      $value: parseDimToken(raw),
      $description: meta.radiusDescriptions[dtcg],
    };
  }

  const fontFamilyEntries: Record<string, unknown> = {
    $type: "fontFamily",
    $description: "Font family stacks.",
  };
  for (const [k, v] of Object.entries(output.cssVars.theme)) {
    if (!k.startsWith("font-")) continue;
    const sub = k.slice("font-".length);
    const items = v.includes(",") ? v.split(",").map((s) => s.trim()) : v;
    fontFamilyEntries[sub] = {
      $value: items,
      $description:
        output.descriptions?.style?.[`font.family.${sub}`] ??
        (sub === "mono"
          ? "Monospace font family for code blocks and numeric readouts."
          : "Primary sans-serif font family stack."),
    };
  }

  const themeColors: Record<string, unknown> = {
    $type: "color",
    $description: "Appearance-invariant C-layer color roles shared by light and dark modes.",
  };
  const sharedColorKeys = [
    ...meta.sharedColorKeys.filter((k) => k in output.cssVars.theme),
    ...Object.keys(output.cssVars.theme).filter(
      (k) =>
        !k.startsWith("font-") &&
        k !== "radius" &&
        !k.startsWith("radius-") &&
        !meta.sharedColorKeys.includes(k),
    ),
  ];
  const themeColorLookup: Record<string, string> = {
    ...output.cssVars.light,
    ...output.cssVars.theme,
  };
  for (const k of sharedColorKeys) {
    const desc = output.descriptions?.sharedColors?.[k] ?? meta.sharedColorDescriptions[k] ?? k;
    themeColors[k] = encodeCssColorToken(k, output.cssVars.theme[k]!, themeColorLookup, desc);
  }

  const pressScale = output["press-scale"] ?? output.style?.state["press-scale"];
  if (pressScale === undefined) {
    throw new Error(
      `${output.id}: either "press-scale" or style.state["press-scale"] must be provided`,
    );
  }

  const themeTokensDoc: Record<string, unknown> = {
    $schema: FORMAT_SCHEMA_URL,
    $description: output.themeDescription,
    ...(output.designMd
      ? {
          $extensions: {
            [EXT_NS]: {
              designMd: output.designMd,
            },
          },
        }
      : {}),
    dimension: {
      $type: "dimension",
      $description: "Appearance-invariant base dimensional tokens.",
      radius: radiusEntries,
      ...(sharedStyle?.dimensionExtras ?? {}),
    },
    font: {
      $description: "Base font family tokens.",
      family: fontFamilyEntries,
    },
    ...(sharedStyle?.typography ? { typography: sharedStyle.typography } : {}),
    ...(sharedStyle?.shape ? { shape: sharedStyle.shape } : {}),
    color: themeColors,
    state: sharedStyle
      ? sharedStyle.state
      : {
          $type: "number",
          $description: "Interaction state opacities, press scale, and ripple switch.",
          "press-scale": {
            $value: pressScale,
            $description:
              output.descriptions?.style?.["state.press-scale"] ??
              "Scale factor applied while a pressable control is pressed.",
          },
        },
    ...(sharedStyle?.duration ? { duration: sharedStyle.duration } : {}),
    ...(sharedStyle?.transition ? { transition: sharedStyle.transition } : {}),
    ...(sharedStyle?.motion ? { motion: sharedStyle.motion } : {}),
    ...(sharedStyle?.controls ? { controls: sharedStyle.controls } : {}),
  };

  // 4. Split finishes into shared, light, and dark. Any field whose static DTCG color evaluation
  // differs between light and dark (e.g. `oklch(from {card} l c h / 0.8)` when `card` flips) must
  // live in `light` and `dark` so each appearance's DTCG tree holds an accurate static `$value`.
  const split = splitFinishes(output.finishes.light, output.finishes.dark);
  const lightColorMap: Record<string, string> = {
    ...output.cssVars.theme,
    ...output.cssVars.light,
  };
  const darkColorMap: Record<string, string> = { ...output.cssVars.theme, ...output.cssVars.dark };

  for (const [role, sharedFinish] of Object.entries(split.shared)) {
    for (const field of [
      "background",
      "foreground",
      "border-color",
      "border-top-color",
      "border-bottom-color",
    ] as const) {
      const val = sharedFinish[field];
      if (typeof val !== "string" || !/^oklch\(\s*from\b/i.test(val.trim())) continue;
      const lightEncoded = JSON.stringify(encodeFinishColorToken(val, lightColorMap));
      const darkEncoded = JSON.stringify(encodeFinishColorToken(val, darkColorMap));
      if (lightEncoded !== darkEncoded) {
        delete sharedFinish[field];
        (split.light[role] ??= {})[field] = val;
        (split.dark[role] ??= {})[field] = val;
      }
    }
  }

  const finishDescs = {
    ...meta.finishDescriptions,
    ...(output.descriptions?.finishes ?? {}),
  };

  const finishesSharedDoc = {
    $schema: FORMAT_SCHEMA_URL,
    $description: output.finishesDescription,
    finish: {
      $description:
        "Appearance-invariant surface finish recipes (background, gradient, border, shadow, blur, material).",
      ...encodeFinishSection(split.shared, themeColorLookup, meta.finishRoles, finishDescs),
    },
  };

  // 5. light.tokens.json & dark.tokens.json
  const buildAppearanceDoc = (
    appearance: "light" | "dark",
    description: string,
    colors: Record<string, string>,
    keyOrder: string[],
    fallbackDescs: Record<string, string>,
    overrideDescs: Record<string, string> | undefined,
    sparseFinishes: Record<string, Record<string, unknown>>,
  ) => {
    const colorMap: Record<string, string> = { ...output.cssVars.theme, ...colors };
    const colorGroup: Record<string, unknown> = {
      $type: "color",
      $description: `Adaptive A-layer and B-layer color roles for ${appearance} appearance.`,
    };
    const orderedKeys = [
      ...keyOrder.filter((k) => k in colors),
      ...Object.keys(colors).filter((k) => !keyOrder.includes(k)),
    ];
    for (const k of orderedKeys) {
      const desc = overrideDescs?.[k] ?? fallbackDescs[k] ?? meta.lightColorDescriptions[k] ?? k;
      colorGroup[k] = encodeCssColorToken(k, colors[k]!, colorMap, desc);
    }

    const encodedFinishes = encodeFinishSection(sparseFinishes, colorMap, meta.finishRoles);
    return {
      $schema: FORMAT_SCHEMA_URL,
      $description: description,
      color: colorGroup,
      ...(Object.keys(encodedFinishes).length > 0
        ? {
            finish: {
              $description: `Sparse ${appearance}-mode surface finish overrides.`,
              ...encodedFinishes,
            },
          }
        : {}),
    };
  };

  const lightDoc = buildAppearanceDoc(
    "light",
    output.lightDescription,
    output.cssVars.light,
    meta.lightColorKeys,
    meta.lightColorDescriptions,
    output.descriptions?.lightColors,
    split.light,
  );
  const darkDoc = buildAppearanceDoc(
    "dark",
    output.darkDescription,
    output.cssVars.dark,
    meta.darkColorKeys,
    meta.darkColorDescriptions,
    output.descriptions?.darkColors,
    split.dark,
  );

  const sourceFiles = [
    writeFile("theme.resolver.json", resolverDoc),
    writeFile("theme.tokens.json", themeTokensDoc),
    writeFile("finishes.shared.tokens.json", finishesSharedDoc),
    writeFile("light.tokens.json", lightDoc),
    writeFile("dark.tokens.json", darkDoc),
  ];
  for (const [name, tierDoc] of [
    ["pointer.tokens.json", pointerDoc],
    ["touch.tokens.json", touchDoc],
  ] as const) {
    const abs = path.join(outDir, name);
    if (tierDoc) {
      sourceFiles.push(writeFile(name, tierDoc));
    } else if (fs.existsSync(abs)) {
      fs.rmSync(abs);
    }
  }

  const vpBin = path.join(repoRoot, "node_modules/.bin/vp");
  if (fs.existsSync(vpBin)) {
    const fmt = spawnSync(vpBin, ["fmt", outDir], { cwd: repoRoot, stdio: "inherit" });
    if (fmt.error) throw fmt.error;
    if (fmt.status !== 0) throw new Error(`vp fmt ${outDir} exited ${fmt.status}`);
  }

  const builtFiles: string[] = [];
  for (const target of buildThemeTargets(output.id, repoRoot)) {
    const abs = path.join(repoRoot, target.relPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, target.content);
    builtFiles.push(target.relPath);
  }

  return { sourceFiles, builtFiles };
}
