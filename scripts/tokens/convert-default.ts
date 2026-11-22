/**
 * Converts the default theme (`packages/theme/theme.json` + `packages/theme/semantics.json`)
 * into the proposed W3C DTCG 2025.10 source layout under `packages/theme/tokens/`.
 *
 *   bun scripts/tokens/convert-default.ts
 */
import fs from "node:fs";
import path from "node:path";

import { oklchToHex6, parseOklchLiteral, parseThemeColorValue } from "./color";
import {
  EXT_NS,
  FORMAT_SCHEMA_URL,
  NAMED_CUBIC_BEZIERS,
  RADIUS_KEYS,
  RESOLVER_SCHEMA_URL,
  SHAPE_ROLES,
  TYPE_ROLES,
  type ColorOpExtension,
  type DtcgColor,
  type DtcgShadowItem,
} from "./types";

const root = path.join(import.meta.dir, "..", "..");
const readJson = <T>(rel: string): T =>
  JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")) as T;

const writeJson = (rel: string, data: unknown) => {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
};

interface ThemeJson {
  name: string;
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

interface SemanticsJson {
  type: {
    family: string | null;
    [role: string]:
      | string
      | null
      | {
          size: { pointer: number; touch: number };
          line: { pointer: number; touch: number };
          weight: string;
          tracking: number;
        };
  };
  shape: Record<string, unknown> & {
    curve: string;
    corners: { field: string };
  };
  size: {
    hit: { pointer: number; touch: number };
    density: { pointer: Record<string, number>; touch: Record<string, number> };
    control: {
      pointer: Record<string, number | string>;
      touch: Record<string, number | string>;
    };
    height: { pointer: Record<string, number>; touch: Record<string, number> };
  };
  stroke: Record<string, number>;
  focus: { style: string; width: number; offset: number };
  state: {
    pressScale: number;
    overlay: Record<string, number>;
    ripple: boolean;
    pressedOpacity: number;
    disabled: Record<string, number>;
  };
  motion: Record<string, Record<string, unknown>>;
  icon: { size: { pointer: Record<string, number>; touch: Record<string, number> } };
  indicator: Record<string, string>;
  finishes: {
    shared: Record<string, Record<string, unknown>>;
    light: Record<string, Record<string, unknown>>;
    dark: Record<string, Record<string, unknown>>;
  };
}

function parsePx(raw: string): { value: number; unit: "px" } {
  const m = /^(\d+(?:\.\d+)?)px$/.exec(raw.trim());
  if (!m) throw new Error(`Expected px dimension, got: ${raw}`);
  return { value: Number(m[1]), unit: "px" };
}

function buildColorTokens(
  rawMap: Record<string, string>,
  fallbackLookup: Map<string, DtcgColor>,
): Record<string, unknown> {
  const resolved = new Map<string, DtcgColor>(fallbackLookup);

  const resolveOne = (name: string, seen = new Set<string>()): DtcgColor => {
    const cached = resolved.get(name);
    if (cached) return cached;
    if (seen.has(name)) throw new Error(`Circular color reference: ${name}`);
    seen.add(name);
    const raw = rawMap[name];
    if (!raw) throw new Error(`Unknown color token referenced: ${name}`);
    const parsed = parseThemeColorValue(raw, (ref) => resolveOne(ref, seen));
    if (typeof parsed.value === "string") {
      const m = /^\{color\.([a-z0-9-]+)\}$/.exec(parsed.value);
      const val = resolveOne(m![1]!, seen);
      resolved.set(name, val);
      return val;
    }
    resolved.set(name, parsed.value);
    return parsed.value;
  };

  const out: Record<string, unknown> = {};
  for (const [name, raw] of Object.entries(rawMap)) {
    const parsed = parseThemeColorValue(raw, (ref) => resolveOne(ref));
    const token: Record<string, unknown> = { $value: parsed.value };
    if (parsed.colorOp) {
      token.$extensions = { [EXT_NS]: { colorOp: parsed.colorOp } };
    }
    out[name] = token;
  }
  return out;
}

function convertFinishColor(
  raw: string,
  palette: Map<string, DtcgColor>,
): { value: DtcgColor | string; extensions?: Record<string, unknown> } {
  const trimmed = raw.trim();
  if (trimmed === "transparent") {
    return {
      value: { colorSpace: "oklch", components: [0, 0, 0], alpha: 0, hex: "#000000" },
      extensions: { [EXT_NS]: { transparentKeyword: true } },
    };
  }
  const refMatch = /^\{([a-z0-9-]+)\}$/.exec(trimmed);
  if (refMatch) {
    return { value: `{color.${refMatch[1]}}` };
  }
  const relMatch = /^oklch\(from \{([a-z0-9-]+)\} l c h \/ ([\d.]+)\)$/.exec(trimmed);
  if (relMatch) {
    const baseName = relMatch[1]!;
    const alpha = Number(relMatch[2]);
    const base = palette.get(baseName);
    if (!base) throw new Error(`Unknown base token in relative color: ${baseName}`);
    const colorOp: ColorOpExtension = {
      op: "alpha",
      color: `{color.${baseName}}`,
      alpha,
    };
    return {
      value: {
        colorSpace: base.colorSpace,
        components: [...base.components] as [number, number, number],
        alpha,
        hex: base.hex ?? oklchToHex6(base.components[0], base.components[1], base.components[2]),
      },
      extensions: { [EXT_NS]: { colorOp } },
    };
  }
  return { value: parseOklchLiteral(trimmed) };
}

function splitTopLevelCommas(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(input.slice(start).trim());
  return parts;
}

function convertGradient(raw: string, palette: Map<string, DtcgColor>): Record<string, unknown> {
  const match = /^linear-gradient\(\s*([\d.]+)deg\s*,\s*(.+)\s*\)$/.exec(raw.trim());
  if (!match) throw new Error(`Unsupported gradient syntax: ${raw}`);
  const angle = Number(match[1]);
  const stopStrs = splitTopLevelCommas(match[2]!);
  const transparentStops: number[] = [];
  const stops = stopStrs.map((s, idx) => {
    const m = /^(.+?)\s+([\d.]+)%$/.exec(s.trim());
    if (!m) throw new Error(`Unsupported gradient stop: ${s}`);
    const col = convertFinishColor(m[1]!, palette);
    if (
      col.extensions?.[EXT_NS] &&
      (col.extensions[EXT_NS] as Record<string, unknown>).transparentKeyword
    ) {
      transparentStops.push(idx);
    }
    return {
      color: col.value,
      position: Number(m[2]) / 100,
    };
  });
  const ext: Record<string, unknown> = { angle };
  if (transparentStops.length > 0) ext.transparentStops = transparentStops;
  return {
    $type: "gradient",
    $value: stops,
    $extensions: { [EXT_NS]: ext },
  };
}

function convertShadow(raw: string): Record<string, unknown> {
  if (raw.trim() === "none") {
    return {
      $type: "shadow",
      $value: {
        color: { colorSpace: "oklch", components: [0, 0, 0], alpha: 0, hex: "#000000" },
        offsetX: { value: 0, unit: "px" },
        offsetY: { value: 0, unit: "px" },
        blur: { value: 0, unit: "px" },
        spread: { value: 0, unit: "px" },
      },
      $extensions: { [EXT_NS]: { none: true } },
    };
  }
  const items = splitTopLevelCommas(raw);
  const parsed: DtcgShadowItem[] = items.map((item) => {
    const tokens = item.match(/(?:oklch\([^()]+\)|\{[a-z0-9-]+\}|\S+)/g);
    if (!tokens || tokens.length < 4) throw new Error(`Invalid shadow item: ${item}`);
    let idx = 0;
    const inset = tokens[0] === "inset";
    if (inset) idx++;
    const colorRaw = tokens[tokens.length - 1]!;
    const lengths = tokens.slice(idx, tokens.length - 1).map((len) => {
      const m = /^(-?\d+(?:\.\d+)?)(?:px)?$/.exec(len);
      if (!m) throw new Error(`Unsupported shadow length: ${len}`);
      return { value: Number(m[1]), unit: "px" as const };
    });
    if (lengths.length < 3 || lengths.length > 4) {
      throw new Error(`Expected 3 or 4 shadow lengths in: ${item}`);
    }
    const color = parseOklchLiteral(colorRaw);
    return {
      color,
      offsetX: lengths[0]!,
      offsetY: lengths[1]!,
      blur: lengths[2]!,
      spread: lengths[3] ?? { value: 0, unit: "px" },
      ...(inset ? { inset: true } : {}),
    };
  });
  return {
    $type: "shadow",
    $value: parsed.length === 1 ? parsed[0] : parsed,
  };
}

function convertFinishSection(
  section: Record<string, Record<string, unknown>>,
  palette: Map<string, DtcgColor>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [role, fields] of Object.entries(section)) {
    const group: Record<string, unknown> = {};
    const groupExt: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(fields)) {
      if (key === "backgroundColor" && typeof val === "string") {
        const c = convertFinishColor(val, palette);
        group.background = {
          $type: "color",
          $value: c.value,
          ...(c.extensions ? { $extensions: c.extensions } : {}),
        };
      } else if (key === "backgroundImage" && typeof val === "string") {
        group.gradient = convertGradient(val, palette);
      } else if (key === "borderColor" && typeof val === "string") {
        const c = convertFinishColor(val, palette);
        group["border-color"] = {
          $type: "color",
          $value: c.value,
          ...(c.extensions ? { $extensions: c.extensions } : {}),
        };
      } else if (key === "boxShadow" && typeof val === "string") {
        group.shadow = convertShadow(val);
      } else if (key === "backdropFilter" && typeof val === "string") {
        groupExt.backdropFilter = val;
      } else if (key === "material") {
        groupExt.material = val;
      }
    }

    if (Object.keys(groupExt).length > 0) {
      group.$extensions = { [EXT_NS]: groupExt };
    }
    out[role] = group;
  }
  return out;
}

export function convertDefaultThemeToDtcg(): void {
  const themeJson = readJson<ThemeJson>("packages/theme/theme.json");
  const semJson = readJson<SemanticsJson>("packages/theme/semantics.json");

  // Resolve C-layer, light, and dark color lookups for color-mix & relative-color evaluation.
  const makePaletteMap = (appearanceMap: Record<string, string>): Map<string, DtcgColor> => {
    const combined = { ...themeJson.cssVars.theme, ...appearanceMap };
    const map = new Map<string, DtcgColor>();
    const resolve = (name: string): DtcgColor => {
      const hit = map.get(name);
      if (hit) return hit;
      const raw = combined[name];
      if (!raw) throw new Error(`Missing color ${name}`);
      const parsed = parseThemeColorValue(raw, resolve);
      if (typeof parsed.value === "string") {
        const m = /^\{color\.([a-z0-9-]+)\}$/.exec(parsed.value)!;
        const v = resolve(m[1]!);
        map.set(name, v);
        return v;
      }
      map.set(name, parsed.value);
      return parsed.value;
    };
    for (const k of Object.keys(combined)) {
      if (!k.startsWith("radius") && !k.startsWith("font-")) resolve(k);
    }
    return map;
  };

  const lightPalette = makePaletteMap(themeJson.cssVars.light);
  const darkPalette = makePaletteMap(themeJson.cssVars.dark);

  // 1. base/style.shared.tokens.json
  const cubicBezierGroup: Record<string, unknown> = {
    $type: "cubicBezier",
    $description: "Named timing curves shared across themes.",
  };
  for (const [name, spec] of Object.entries(NAMED_CUBIC_BEZIERS)) {
    cubicBezierGroup[name] = {
      $value: spec.value,
      $description: spec.description,
      ...(spec.nshEasing ? { $extensions: { [EXT_NS]: { nshEasing: spec.nshEasing } } } : {}),
    };
  }

  const typographyGroup: Record<string, unknown> = {
    $type: "typography",
    $description:
      "Semantic typography roles referencing tier-specific font.size and font.line-height.",
    $extensions: { [EXT_NS]: { fontFamily: semJson.type.family } },
  };
  for (const role of TYPE_ROLES) {
    const entry = semJson.type[role];
    if (!entry || typeof entry !== "object") throw new Error(`Missing type role: ${role}`);
    typographyGroup[role] = {
      $value: {
        fontFamily:
          semJson.type.family === null
            ? ["system-ui", "sans-serif"]
            : `{font.family.${semJson.type.family.replace(/^\{font-|\}$/g, "")}}`,
        fontSize: `{font.size.${role}}`,
        fontWeight: Number(entry.weight),
        lineHeight: `{font.line-height.${role}}`,
        letterSpacing: { value: entry.tracking, unit: "px" },
      },
    };
  }

  const shapeDimGroup: Record<string, unknown> = {
    $type: "dimension",
    $description: "Semantic corner radius roles referencing base dimension.radius.* tokens.",
  };
  for (const role of SHAPE_ROLES) {
    const raw = String(semJson.shape[role]);
    const ref = /^\{([a-z0-9-]+)\}$/.exec(raw)?.[1];
    if (!ref) throw new Error(`shape.${role} must be a {token} ref, got: ${raw}`);
    const target = ref === "radius" ? "base" : ref.replace(/^radius-/, "");
    shapeDimGroup[role] = { $value: `{dimension.radius.${target}}` };
  }

  const motionGroup: Record<string, unknown> = {
    $description: "Interactive spring and timing physics roles.",
  };
  for (const role of ["press", "settle", "control", "move"] as const) {
    const m = semJson.motion[role]!;
    if ("stiffness" in m) {
      motionGroup[role] = {
        $extensions: { [EXT_NS]: { spring: { stiffness: m.stiffness, damping: m.damping } } },
      };
    } else {
      motionGroup[role] = {
        timing: {
          $type: "transition",
          $value: {
            duration: { value: m.duration as number, unit: "ms" },
            delay: { value: 0, unit: "ms" },
            timingFunction: `{cubicBezier.${m.easing as string}}`,
          },
        },
      };
    }
  }

  const baseShared = {
    $schema: FORMAT_SCHEMA_URL,
    $description: "Cross-theme base semantic tokens and structural defaults.",
    cubicBezier: cubicBezierGroup,
    typography: typographyGroup,
    dimension: {
      $type: "dimension",
      shape: shapeDimGroup,
      stroke: Object.fromEntries(
        Object.entries(semJson.stroke).map(([k, v]) => [k, { $value: { value: v, unit: "px" } }]),
      ),
      focus: {
        $extensions: { [EXT_NS]: { style: semJson.focus.style } },
        width: { $value: { value: semJson.focus.width, unit: "px" } },
        offset: { $value: { value: semJson.focus.offset, unit: "px" } },
      },
    },
    shape: {
      $description: "Non-dimensional corner curve and field corner geometry.",
      $extensions: {
        [EXT_NS]: {
          curve: semJson.shape.curve,
          corners: semJson.shape.corners,
        },
      },
    },
    state: {
      $type: "number",
      $extensions: { [EXT_NS]: { ripple: semJson.state.ripple } },
      "press-scale": { $value: semJson.state.pressScale },
      overlay: Object.fromEntries(
        Object.entries(semJson.state.overlay).map(([k, v]) => [k, { $value: v }]),
      ),
      "pressed-opacity": { $value: semJson.state.pressedOpacity },
      disabled: Object.fromEntries(
        Object.entries(semJson.state.disabled).map(([k, v]) => [k, { $value: v }]),
      ),
    },
    duration: {
      $type: "duration",
      shake: { $value: { value: semJson.motion.shake!.duration as number, unit: "ms" } },
    },
    transition: {
      $type: "transition",
      enter: {
        $value: {
          duration: { value: semJson.motion.enter!.duration as number, unit: "ms" },
          delay: { value: 0, unit: "ms" },
          timingFunction: `{cubicBezier.${semJson.motion.enter!.easing as string}}`,
        },
      },
    },
    motion: motionGroup,
    indicator: {
      $description: "Visual indicator style enums.",
      $extensions: { [EXT_NS]: semJson.indicator },
    },
  };

  // 2. base/style.{pointer,touch}.tokens.json
  const buildTierFile = (tierName: "pointer" | "touch") => {
    const fontSizeGroup: Record<string, unknown> = { $type: "dimension" };
    const lineHeightGroup: Record<string, unknown> = { $type: "number" };
    for (const role of TYPE_ROLES) {
      const entry = semJson.type[role] as {
        size: { pointer: number; touch: number };
        line: { pointer: number; touch: number };
      };
      fontSizeGroup[role] = { $value: { value: entry.size[tierName], unit: "px" } };
      lineHeightGroup[role] = { $value: entry.line[tierName] / entry.size[tierName] };
    }

    const controlDims: Record<string, unknown> = {
      $extensions: { [EXT_NS]: { switch: semJson.size.control[tierName].switch } },
    };
    for (const [k, v] of Object.entries(semJson.size.control[tierName])) {
      if (k === "switch") continue;
      controlDims[k] = { $value: { value: v as number, unit: "px" } };
    }

    return {
      $schema: FORMAT_SCHEMA_URL,
      $description: `Default ${tierName} input-tier metrics.`,
      font: {
        size: fontSizeGroup,
        "line-height": lineHeightGroup,
      },
      dimension: {
        $type: "dimension",
        size: {
          hit: { $value: { value: semJson.size.hit[tierName], unit: "px" } },
          density: Object.fromEntries(
            Object.entries(semJson.size.density[tierName]).map(([k, v]) => [
              k,
              { $value: { value: v, unit: "px" } },
            ]),
          ),
          control: controlDims,
          height: Object.fromEntries(
            Object.entries(semJson.size.height[tierName]).map(([k, v]) => [
              k,
              { $value: { value: v, unit: "px" } },
            ]),
          ),
        },
        icon: Object.fromEntries(
          Object.entries(semJson.icon.size[tierName]).map(([k, v]) => [
            k,
            { $value: { value: v, unit: "px" } },
          ]),
        ),
      },
    };
  };

  // 3. themes/default/theme.tokens.json (appearance-invariant C-layer tokens)
  const radiiGroup: Record<string, unknown> = { $type: "dimension" };
  for (const { cssVar, dtcg } of RADIUS_KEYS) {
    radiiGroup[dtcg] = { $value: parsePx(themeJson.cssVars.theme[cssVar]!) };
  }

  const sharedColorRaw: Record<string, string> = {};
  for (const [k, v] of Object.entries(themeJson.cssVars.theme)) {
    if (k === "radius" || k.startsWith("radius-") || k.startsWith("font-")) continue;
    sharedColorRaw[k] = v;
  }

  const fontFamilyGroup: Record<string, unknown> = { $type: "fontFamily" };
  for (const [k, v] of Object.entries(themeJson.cssVars.theme)) {
    if (!k.startsWith("font-")) continue;
    fontFamilyGroup[k.replace(/^font-/, "")] = { $value: v };
  }

  const themeTokens = {
    $schema: FORMAT_SCHEMA_URL,
    $description: "Appearance-invariant base tokens for the default NSH Gallery UI theme.",
    dimension: {
      $type: "dimension",
      radius: radiiGroup,
    },
    font: {
      family: fontFamilyGroup,
    },
    color: {
      $type: "color",
      ...buildColorTokens(sharedColorRaw, lightPalette),
    },
  };

  // 4. themes/default/finishes.shared.tokens.json
  const finishesShared = {
    $schema: FORMAT_SCHEMA_URL,
    $description: "Appearance-invariant surface finish recipes for the default theme.",
    finish: convertFinishSection(semJson.finishes.shared, lightPalette),
  };

  // 5. themes/default/{light,dark}.tokens.json
  const lightTokens = {
    $schema: FORMAT_SCHEMA_URL,
    $description: "Light appearance colors and finish overrides for the default theme.",
    color: {
      $type: "color",
      ...buildColorTokens(themeJson.cssVars.light, lightPalette),
    },
    finish: convertFinishSection(semJson.finishes.light, lightPalette),
  };

  const darkTokens = {
    $schema: FORMAT_SCHEMA_URL,
    $description: "Dark appearance colors and finish overrides for the default theme.",
    color: {
      $type: "color",
      ...buildColorTokens(themeJson.cssVars.dark, darkPalette),
    },
    finish: convertFinishSection(semJson.finishes.dark, darkPalette),
  };

  // 6. themes/default/theme.resolver.json
  const resolver = {
    $schema: RESOLVER_SCHEMA_URL,
    name: themeJson.name,
    version: "2025.10",
    description: "DTCG 2025.10 resolver for the default NSH Gallery UI theme.",
    sets: {
      base: {
        description: "Cross-theme semantic defaults and shared typography/motion structure.",
        sources: [{ $ref: "../../base/style.shared.tokens.json" }],
      },
      theme: {
        description: "Default theme appearance-invariant base tokens and shared finishes.",
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

  writeJson("packages/theme/tokens/base/style.shared.tokens.json", baseShared);
  writeJson("packages/theme/tokens/base/style.pointer.tokens.json", buildTierFile("pointer"));
  writeJson("packages/theme/tokens/base/style.touch.tokens.json", buildTierFile("touch"));
  writeJson("packages/theme/tokens/themes/default/theme.tokens.json", themeTokens);
  writeJson("packages/theme/tokens/themes/default/finishes.shared.tokens.json", finishesShared);
  writeJson("packages/theme/tokens/themes/default/light.tokens.json", lightTokens);
  writeJson("packages/theme/tokens/themes/default/dark.tokens.json", darkTokens);
  writeJson("packages/theme/tokens/themes/default/theme.resolver.json", resolver);
}

if (import.meta.main) {
  convertDefaultThemeToDtcg();
  console.log("Generated DTCG 2025.10 source files under packages/theme/tokens/");
}
