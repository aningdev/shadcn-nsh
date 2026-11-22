/**
 * Shared DTCG 2025.10 source emitter for theme generators (`generate-shadcn.ts`,
 * `generate-solid-glass.ts`).
 *
 * Converts a generator's computed `cssVars` (`theme`, `light`, `dark`), `pressScale`, and
 * light/dark `finishes` into the sparse DTCG 2025.10 source tree under
 * `packages/theme/tokens/themes/<id>/` (reading role order and baseline `$description`s from
 * `packages/theme/tokens/themes/default/`), then runs `tokens:build` for that theme so one
 * generator command updates both the DTCG source and the compiled runtime files.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { repo } from "../port/lib";
import { buildThemeTargets } from "../tokens/build";
import { evaluateColorMix, oklchToHex6 } from "../tokens/color";
import {
  EXT_NS,
  FORMAT_SCHEMA_URL,
  RADIUS_KEYS,
  RESOLVER_SCHEMA_URL,
  type DtcgColor,
} from "../tokens/types";
import { toOklchText } from "./oklch";
import { splitFinishes } from "./tokens";

export interface ThemeGeneratorOutput {
  id: string;
  name: string;
  resolverDescription: string;
  themeDescription: string;
  finishesDescription: string;
  lightDescription: string;
  darkDescription: string;
  pressScale: number;
  pressScaleDescription: string;
  radiusGroupDescription?: string;
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
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

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
  value: string,
  colorMap: Record<string, string>,
  description: string,
): Record<string, unknown> {
  const varMatch = /^var\(--([a-z0-9-]+)\)$/.exec(value.trim());
  if (varMatch) {
    return {
      $value: `{color.${varMatch[1]!}}`,
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

  let hasExplicitZeroSpread = false;
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
    if (lengths.length === 4 && lengths[3] === "0") {
      hasExplicitZeroSpread = true;
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
    ...(hasExplicitZeroSpread
      ? {
          $extensions: {
            [EXT_NS]: {
              explicitSpread: true,
            },
          },
        }
      : {}),
  };
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
    if (typeof finish.backgroundColor === "string") {
      group.background = encodeFinishColorToken(finish.backgroundColor, colorMap);
    }
    if (typeof finish.backgroundImage === "string") {
      group.gradient = encodeFinishGradientToken(finish.backgroundImage);
    }
    if (typeof finish.boxShadow === "string") {
      group.shadow = encodeFinishShadowToken(finish.boxShadow);
    }
    if (typeof finish.borderColor === "string") {
      group["border-color"] = encodeFinishColorToken(finish.borderColor, colorMap);
    }

    const ext: Record<string, unknown> = {};
    if ("backdropFilter" in finish) ext.backdropFilter = finish.backdropFilter;
    if ("material" in finish) ext.material = finish.material;
    if (Object.keys(ext).length > 0) {
      group.$extensions = { [EXT_NS]: ext };
    }

    out[role] = group;
  }
  return out;
}

function readDefaultMetadata(repoRoot: string) {
  const defDir = path.join(repoRoot, "packages/theme/tokens/themes/default");
  const defTheme = readJson(path.join(defDir, "theme.tokens.json"));
  const defFinishes = readJson(path.join(defDir, "finishes.shared.tokens.json"));
  const defLight = readJson(path.join(defDir, "light.tokens.json"));
  const defDark = readJson(path.join(defDir, "dark.tokens.json"));

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

  // 1. theme.resolver.json
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
          pointer: [{ $ref: "../../base/style.pointer.tokens.json" }],
          touch: [{ $ref: "../../base/style.touch.tokens.json" }],
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

  // 2. theme.tokens.json
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
        sub === "mono"
          ? "Monospace font family for code blocks and numeric readouts."
          : "Primary sans-serif font family stack.",
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
    themeColors[k] = encodeCssColorToken(output.cssVars.theme[k]!, themeColorLookup, desc);
  }

  const themeTokensDoc: Record<string, unknown> = {
    $schema: FORMAT_SCHEMA_URL,
    $description: output.themeDescription,
    dimension: {
      $type: "dimension",
      $description: "Appearance-invariant base dimensional tokens.",
      radius: radiusEntries,
    },
    font: {
      $description: "Base font family tokens.",
      family: fontFamilyEntries,
    },
    color: themeColors,
    state: {
      $type: "number",
      $description: "Interaction state opacities, press scale, and ripple switch.",
      "press-scale": {
        $value: output.pressScale,
        $description: output.pressScaleDescription,
      },
    },
  };

  // 3. Split finishes into shared, light, and dark. Any field whose static DTCG color evaluation
  // differs between light and dark (e.g. `oklch(from {card} l c h / 0.8)` when `card` flips) must
  // live in `light` and `dark` so each appearance's DTCG tree holds an accurate static `$value`.
  const split = splitFinishes(output.finishes.light, output.finishes.dark);
  const lightColorMap: Record<string, string> = {
    ...output.cssVars.theme,
    ...output.cssVars.light,
  };
  const darkColorMap: Record<string, string> = { ...output.cssVars.theme, ...output.cssVars.dark };

  for (const [role, sharedFinish] of Object.entries(split.shared)) {
    for (const field of ["backgroundColor", "borderColor"] as const) {
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

  const finishesSharedDoc = {
    $schema: FORMAT_SCHEMA_URL,
    $description: output.finishesDescription,
    finish: {
      $description:
        "Appearance-invariant surface finish recipes (background, gradient, border, shadow, blur, material).",
      ...encodeFinishSection(
        split.shared,
        themeColorLookup,
        meta.finishRoles,
        meta.finishDescriptions,
      ),
    },
  };

  // 4. light.tokens.json & dark.tokens.json
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
      colorGroup[k] = encodeCssColorToken(colors[k]!, colorMap, desc);
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
