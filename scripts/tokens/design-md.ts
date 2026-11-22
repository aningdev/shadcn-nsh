/**
 * Generates a Google Labs DESIGN.md (version `alpha`) per theme from the DTCG 2025.10 source and
 * its compiled per-appearance pointer-tier resolution (`compileAppearanceTokensJson`).
 */
import fs from "node:fs";
import path from "node:path";

import { oklchToHex6 } from "./color";
import { compileAppearanceTokensJson } from "./compile";
import { loadSourceItem, mergeTokenTrees, resolveAliases, type ResolverDoc } from "./resolver";
import {
  COLOR_ROLES,
  EXT_NS,
  SHAPE_ROLES,
  TYPE_ROLES,
  type ColorRole,
  type DesignMdExtension,
  type DtcgColor,
  type DtcgDimension,
  type DtcgGradientStop,
  type DtcgTransition,
  type DtcgTypography,
} from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isTokenNode = (v: unknown): v is Record<string, unknown> =>
  isRecord(v) && Object.hasOwn(v, "$value");

function getExt(node: unknown): Record<string, unknown> | undefined {
  if (!isRecord(node) || !isRecord(node.$extensions)) return undefined;
  const ns = node.$extensions[EXT_NS];
  return isRecord(ns) ? ns : undefined;
}

function getDesc(node: unknown): string | undefined {
  return isRecord(node) && typeof node.$description === "string" && node.$description.trim()
    ? node.$description.trim()
    : undefined;
}

function srgbToHex6(r: number, g: number, b: number): string {
  const hex2 = (n: number) =>
    Math.round(Math.max(0, Math.min(1, n)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

/** Convert a DTCG Color object into `#rrggbb` or `#rrggbbaa` when `alpha < 1`. */
export function dtcgColorToHex(color: DtcgColor): string {
  const hex6 =
    typeof color.hex === "string" && /^#[0-9a-f]{6}$/i.test(color.hex)
      ? color.hex.toLowerCase()
      : color.colorSpace === "srgb"
        ? srgbToHex6(color.components[0], color.components[1], color.components[2])
        : oklchToHex6(color.components[0], color.components[1], color.components[2]);
  if (color.alpha !== undefined && color.alpha < 1) {
    const alphaHex = Math.round(Math.max(0, Math.min(1, color.alpha)) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex6}${alphaHex}`;
  }
  return hex6;
}

const fmtDim = (d: DtcgDimension): string => `${d.value}${d.unit}`;

const ROLE_TITLES: Record<ColorRole, string> = {
  surface: "Surface",
  ink: "Ink",
  brand: "Brand",
  status: "Status",
  chrome: "Chrome",
};

function formatYamlScalar(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const str = String(value);
  if (/^[a-zA-Z0-9._-]+$/.test(str) && !/^(true|false|null|yes|no|on|off)$/i.test(str)) {
    return str;
  }
  return JSON.stringify(str);
}

function serializeYaml(obj: Record<string, unknown>, indent = 0): string[] {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    const safeKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
    if (Array.isArray(val)) {
      lines.push(`${pad}${safeKey}:`);
      for (const item of val) {
        if (isRecord(item)) {
          const entries = Object.entries(item).filter(([, v]) => v !== undefined);
          if (entries.length === 0) continue;
          const [firstK, firstV] = entries[0]!;
          lines.push(`${pad}  - ${firstK}: ${formatYamlScalar(firstV)}`);
          for (const [subK, subV] of entries.slice(1)) {
            lines.push(`${pad}    ${subK}: ${formatYamlScalar(subV)}`);
          }
        } else {
          lines.push(`${pad}  - ${formatYamlScalar(item)}`);
        }
      }
    } else if (isRecord(val)) {
      lines.push(`${pad}${safeKey}:`);
      lines.push(...serializeYaml(val, indent + 1));
    } else {
      lines.push(`${pad}${safeKey}: ${formatYamlScalar(val)}`);
    }
  }
  return lines;
}

/**
 * Compile a theme's `theme.resolver.json` and its pointer-tier light/dark DTCG trees into a
 * complete DESIGN.md document (YAML front matter + structured prose sections).
 */
export function compileDesignMd(resolverPath: string): string {
  const absPath = path.resolve(resolverPath);
  const dir = path.dirname(absPath);
  const resolver = JSON.parse(fs.readFileSync(absPath, "utf8")) as ResolverDoc;

  const lightRaw = compileAppearanceTokensJson(absPath, "light");
  const darkRaw = compileAppearanceTokensJson(absPath, "dark");
  const lightResolved = resolveAliases(lightRaw);
  const darkResolved = resolveAliases(darkRaw);

  const themeSetTree = (resolver.sets?.theme?.sources ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, resolver)),
    {},
  );
  const cLayerNames = new Set(
    Object.keys((themeSetTree.color as Record<string, unknown> | undefined) ?? {}).filter(
      (k) => !k.startsWith("$"),
    ),
  );

  const lightColorsRaw = (lightRaw.color ?? {}) as Record<string, Record<string, unknown>>;
  const darkColorsRaw = (darkRaw.color ?? {}) as Record<string, Record<string, unknown>>;
  const lightColorsRes = (lightResolved.color ?? {}) as Record<string, Record<string, unknown>>;
  const darkColorsRes = (darkResolved.color ?? {}) as Record<string, Record<string, unknown>>;

  const colorKeys = Object.keys(lightColorsRaw).filter((k) => !k.startsWith("$"));
  const sharedColorsYaml: Record<string, string> = {};
  const lightColorsYaml: Record<string, string> = {};
  const darkColorsYaml: Record<string, string> = {};
  const colorYamlPathByName = new Map<string, string>();

  for (const name of colorKeys) {
    const lHex = dtcgColorToHex(lightColorsRes[name]!.$value as DtcgColor);
    const dHex = dtcgColorToHex(darkColorsRes[name]!.$value as DtcgColor);
    const isC = cLayerNames.has(name);
    const lVal = lightColorsRaw[name]!.$value;
    const dVal = darkColorsRaw[name]!.$value;
    const isModeInvariant =
      isC && lHex === dHex && typeof lVal !== "string" && typeof dVal !== "string";

    if (isModeInvariant) {
      sharedColorsYaml[name] = lHex;
      colorYamlPathByName.set(name, `colors.${name}`);
    } else {
      lightColorsYaml[name] = lHex;
      darkColorsYaml[name] = dHex;
      colorYamlPathByName.set(name, `colors.light.${name}`);
    }
  }

  const colorsYaml: Record<string, unknown> = {
    ...sharedColorsYaml,
    light: lightColorsYaml,
    dark: darkColorsYaml,
  };

  // Typography (pointer tier)
  const typoResolved = (lightResolved.typography ?? {}) as Record<string, Record<string, unknown>>;
  const typographyYaml: Record<
    string,
    {
      fontFamily: string;
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
      letterSpacing: string;
    }
  > = {};
  for (const role of TYPE_ROLES) {
    const val = typoResolved[role]!.$value as DtcgTypography;
    const fontFamily = Array.isArray(val.fontFamily)
      ? val.fontFamily.join(", ")
      : String(val.fontFamily);
    const fontSize = val.fontSize as DtcgDimension;
    typographyYaml[role] = {
      fontFamily,
      fontSize: fmtDim(fontSize),
      fontWeight: val.fontWeight,
      lineHeight: val.lineHeight as number,
      letterSpacing: fmtDim(val.letterSpacing),
    };
  }

  // Rounded (8 semantic shape roles from resolved pointer tier)
  const dimResolved = (lightResolved.dimension ?? {}) as Record<string, unknown>;
  const shapeDimResolved = (dimResolved.shape ?? {}) as Record<string, Record<string, unknown>>;
  const roundedYaml: Record<string, string> = {};
  for (const role of SHAPE_ROLES) {
    roundedYaml[role] = fmtDim(shapeDimResolved[role]!.$value as DtcgDimension);
  }

  // Spacing (pointer tier dimension.size, stroke, focus, icon)
  const sizeResolved = (dimResolved.size ?? {}) as Record<string, unknown>;
  const readDimLeaves = (group: Record<string, unknown>): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(group)) {
      if (k.startsWith("$") || !isTokenNode(v)) continue;
      out[k] = fmtDim(v.$value as DtcgDimension);
    }
    return out;
  };
  const spacingYaml: Record<string, unknown> = {
    hit: fmtDim((sizeResolved.hit as Record<string, unknown>).$value as DtcgDimension),
    density: readDimLeaves(sizeResolved.density as Record<string, unknown>),
    control: readDimLeaves(sizeResolved.control as Record<string, unknown>),
    height: readDimLeaves(sizeResolved.height as Record<string, unknown>),
    stroke: readDimLeaves(dimResolved.stroke as Record<string, unknown>),
    focus: readDimLeaves(dimResolved.focus as Record<string, unknown>),
    icon: readDimLeaves(dimResolved.icon as Record<string, unknown>),
  };

  // Motion (timing transitions and shake duration; springs have no DESIGN.md field and are documented in prose)
  const motionYaml: Record<string, Record<string, string>> = {};
  const enterVal = (lightResolved.transition as Record<string, Record<string, unknown>>).enter!
    .$value as DtcgTransition;
  motionYaml.enter = {
    duration: `${enterVal.duration.value}${enterVal.duration.unit}`,
    delay: `${enterVal.delay.value}${enterVal.delay.unit}`,
    timingFunction: `cubic-bezier(${(enterVal.timingFunction as number[]).join(", ")})`,
  };
  const shakeDur = (lightResolved.duration as Record<string, Record<string, unknown>>).shake!
    .$value as { value: number; unit: string };
  motionYaml.shake = {
    duration: `${shakeDur.value}${shakeDur.unit}`,
  };
  const motionRes = (lightResolved.motion ?? {}) as Record<string, Record<string, unknown>>;
  for (const role of ["press", "settle", "control", "move"] as const) {
    const timingNode = motionRes[role]?.timing;
    if (isTokenNode(timingNode)) {
      const val = timingNode.$value as DtcgTransition;
      motionYaml[role] = {
        duration: `${val.duration.value}${val.duration.unit}`,
        delay: `${val.delay.value}${val.delay.unit}`,
        timingFunction: `cubic-bezier(${(val.timingFunction as number[]).join(", ")})`,
      };
    }
  }

  // Components (derived from finish recipes at light/default appearance + semantic role references)
  const finishesRaw = (lightRaw.finish ?? {}) as Record<string, Record<string, unknown>>;
  const finishesRes = (lightResolved.finish ?? {}) as Record<string, Record<string, unknown>>;

  const colorRefOf = (name: string): string => {
    const target = colorYamlPathByName.get(name);
    if (!target) throw new Error(`Unknown color role referenced in component mapping: ${name}`);
    return `{${target}}`;
  };

  const resolveColorField = (
    rawTok: Record<string, unknown> | undefined,
    resTok: Record<string, unknown> | undefined,
  ): string | undefined => {
    if (!rawTok || !resTok) return undefined;
    const ext = getExt(rawTok);
    if (ext?.transparentKeyword) return undefined;
    if (!ext?.colorOp && typeof rawTok.$value === "string") {
      const m = /^\{color\.([a-z0-9-]+)\}$/.exec(rawTok.$value);
      if (m) return colorRefOf(m[1]!);
    }
    return dtcgColorToHex(resTok.$value as DtcgColor);
  };

  const resolveFinishBg = (role: string, fallbackColor?: string): string | undefined => {
    const rawGroup = finishesRaw[role];
    const resGroup = finishesRes[role];
    if (rawGroup && resGroup) {
      const bg = resolveColorField(
        rawGroup.background as Record<string, unknown> | undefined,
        resGroup.background as Record<string, unknown> | undefined,
      );
      if (bg !== undefined) return bg;

      const rawGrad = rawGroup.gradient as Record<string, unknown> | undefined;
      const resGrad = resGroup.gradient as Record<string, unknown> | undefined;
      if (isTokenNode(rawGrad) && isTokenNode(resGrad)) {
        const gExt = getExt(rawGrad);
        const tStops = new Set<number>((gExt?.transparentStops as number[] | undefined) ?? []);
        const rawStops = rawGrad.$value as DtcgGradientStop[];
        const resStops = resGrad.$value as DtcgGradientStop[];
        const nonTransparent = rawStops
          .map((s, idx) => ({ raw: s, res: resStops[idx]!, idx }))
          .filter((item) => !tStops.has(item.idx));
        if (nonTransparent.length > 0) {
          const allRefs = nonTransparent.map((s) =>
            typeof s.raw.color === "string"
              ? /^\{color\.([a-z0-9-]+)\}$/.exec(s.raw.color)?.[1]
              : undefined,
          );
          if (allRefs.every((r) => r && r === allRefs[0])) {
            return colorRefOf(allRefs[0]!);
          }
          const first = nonTransparent[0]!;
          if (typeof first.raw.color === "string") {
            const m = /^\{color\.([a-z0-9-]+)\}$/.exec(first.raw.color);
            if (m) return colorRefOf(m[1]!);
          }
          return dtcgColorToHex(first.res.color as DtcgColor);
        }
      }
    }
    return fallbackColor ? colorRefOf(fallbackColor) : undefined;
  };

  const componentsYaml: Record<string, Record<string, string>> = {
    "button-primary": {
      ...(resolveFinishBg("light", "primary")
        ? { backgroundColor: resolveFinishBg("light", "primary")! }
        : {}),
      textColor: colorRefOf("primary-foreground"),
      typography: "{typography.label}",
      rounded: "{rounded.control}",
      height: "{spacing.height.md}",
      padding: "{spacing.density.gap}",
    },
    "button-secondary": {
      ...(resolveFinishBg("raised", "raised")
        ? { backgroundColor: resolveFinishBg("raised", "raised")! }
        : {}),
      textColor: colorRefOf("foreground"),
      typography: "{typography.label}",
      rounded: "{rounded.control}",
      height: "{spacing.height.md}",
      padding: "{spacing.density.gap}",
    },
    ...(resolveFinishBg("hover")
      ? { "button-secondary-hover": { backgroundColor: resolveFinishBg("hover")! } }
      : {}),
    ...(resolveFinishBg("pressed")
      ? { "button-secondary-pressed": { backgroundColor: resolveFinishBg("pressed")! } }
      : {}),
    card: {
      ...(resolveFinishBg("card", "card")
        ? { backgroundColor: resolveFinishBg("card", "card")! }
        : {}),
      textColor: colorRefOf("card-foreground"),
      typography: "{typography.body}",
      rounded: "{rounded.card}",
      padding: "{spacing.density.pad}",
    },
    "card-inset": {
      ...(resolveFinishBg("inset", "inset")
        ? { backgroundColor: resolveFinishBg("inset", "inset")! }
        : {}),
      textColor: colorRefOf("foreground"),
      rounded: "{rounded.inset}",
      padding: "{spacing.density.surface}",
    },
    "input-field": {
      ...(resolveFinishBg("field", "field")
        ? { backgroundColor: resolveFinishBg("field", "field")! }
        : {}),
      textColor: colorRefOf("foreground"),
      typography: "{typography.label}",
      rounded: "{rounded.field}",
      height: "{spacing.height.md}",
      padding: "{spacing.control.padding}",
    },
    "badge-chip": {
      ...(resolveFinishBg("chip", "secondary")
        ? { backgroundColor: resolveFinishBg("chip", "secondary")! }
        : {}),
      textColor: colorRefOf("secondary-foreground"),
      typography: "{typography.caption}",
      rounded: "{rounded.chip}",
    },
    "menu-popover": {
      ...(resolveFinishBg("menu", "popover")
        ? { backgroundColor: resolveFinishBg("menu", "popover")! }
        : {}),
      textColor: colorRefOf("popover-foreground"),
      typography: "{typography.body}",
      rounded: "{rounded.overlay}",
      padding: "{spacing.control.padding}",
    },
    dialog: {
      ...(resolveFinishBg("dialog", "card")
        ? { backgroundColor: resolveFinishBg("dialog", "card")! }
        : {}),
      textColor: colorRefOf("card-foreground"),
      typography: "{typography.body}",
      rounded: "{rounded.dialog}",
      padding: "{spacing.density.pad}",
    },
    tooltip: {
      ...(resolveFinishBg("tooltip", "inverse")
        ? { backgroundColor: resolveFinishBg("tooltip", "inverse")! }
        : {}),
      textColor: colorRefOf("inverse-foreground"),
      typography: "{typography.detail}",
      rounded: "{rounded.overlay}",
    },
    "toast-inverse": {
      ...(resolveFinishBg("inverse", "inverse")
        ? { backgroundColor: resolveFinishBg("inverse", "inverse")! }
        : {}),
      textColor: colorRefOf("inverse-foreground"),
      typography: "{typography.body}",
      rounded: "{rounded.overlay}",
    },
    "switch-track": {
      ...(resolveFinishBg("track", "track")
        ? { backgroundColor: resolveFinishBg("track", "track")! }
        : {}),
      rounded: "{rounded.control}",
    },
    ...(resolveFinishBg("fill", "primary")
      ? { "switch-track-on": { backgroundColor: resolveFinishBg("fill", "primary")! } }
      : {}),
    "switch-knob": {
      ...(resolveFinishBg("knob", "knob")
        ? { backgroundColor: resolveFinishBg("knob", "knob")! }
        : {}),
    },
    ...(resolveFinishBg("knobOn", "knob")
      ? { "switch-knob-on": { backgroundColor: resolveFinishBg("knobOn", "knob")! } }
      : {}),
    "slider-handle": {
      ...(resolveFinishBg("handle", "knob")
        ? { backgroundColor: resolveFinishBg("handle", "knob")! }
        : {}),
    },
    "tabs-thumb": {
      ...(resolveFinishBg("thumb", "raised")
        ? { backgroundColor: resolveFinishBg("thumb", "raised")! }
        : {}),
      textColor: colorRefOf("foreground"),
      typography: "{typography.label}",
      rounded: "{rounded.control}",
    },
    "toggle-on": {
      ...(resolveFinishBg("on", "accent")
        ? { backgroundColor: resolveFinishBg("on", "accent")! }
        : {}),
      textColor: colorRefOf("foreground"),
      rounded: "{rounded.control}",
    },
    "glass-overlay": {
      ...(resolveFinishBg("glass", "popover")
        ? { backgroundColor: resolveFinishBg("glass", "popover")! }
        : {}),
      textColor: colorRefOf("popover-foreground"),
      rounded: "{rounded.overlay}",
    },
  };

  const themeName = resolver.name ?? path.basename(dir);
  const frontmatter: Record<string, unknown> = {
    version: "alpha",
    name: themeName,
    description: resolver.description ?? "",
    colors: colorsYaml,
    typography: typographyYaml,
    rounded: roundedYaml,
    spacing: spacingYaml,
    motion: motionYaml,
    components: componentsYaml,
  };

  // Prose sections (sourced from resolver, DTCG $descriptions, and $extensions.designMd)
  const designExt = (getExt(lightRaw)?.designMd ?? {}) as DesignMdExtension;
  const lightMerged = lightRaw as Record<string, unknown>;
  const darkMerged = darkRaw as Record<string, unknown>;
  const dimGroup = (lightMerged.dimension ?? {}) as Record<string, unknown>;
  const radiusGroup = (dimGroup.radius ?? {}) as Record<string, Record<string, unknown>>;
  const shapeDimGroup = (dimGroup.shape ?? {}) as Record<string, Record<string, unknown>>;
  const sizeGroup = (dimGroup.size ?? {}) as Record<string, unknown>;
  const strokeGroup = (dimGroup.stroke ?? {}) as Record<string, Record<string, unknown>>;
  const focusGroup = (dimGroup.focus ?? {}) as Record<string, Record<string, unknown>>;
  const iconGroup = (dimGroup.icon ?? {}) as Record<string, Record<string, unknown>>;
  const fontGroup = (lightMerged.font ?? {}) as Record<string, Record<string, unknown>>;
  const fontFamilyGroup = (fontGroup.family ?? {}) as Record<string, Record<string, unknown>>;
  const typoGroup = (lightMerged.typography ?? {}) as Record<string, Record<string, unknown>>;
  const stateGroup = (lightMerged.state ?? {}) as Record<string, Record<string, unknown>>;
  const motionGroup = (lightMerged.motion ?? {}) as Record<string, Record<string, unknown>>;
  const transitionGroup = (lightMerged.transition ?? {}) as Record<string, Record<string, unknown>>;
  const durationGroup = (lightMerged.duration ?? {}) as Record<string, Record<string, unknown>>;
  const cubicBezierGroup = (lightMerged.cubicBezier ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  const shapeExt = getExt(lightMerged.shape) ?? {};
  const focusExt = getExt(focusGroup) ?? {};
  const stateExt = getExt(stateGroup) ?? {};
  const controlSizeExt = getExt(sizeGroup.control) ?? {};

  const pointerRaw = resolvePermutationDescriptions(absPath, "pointer");
  const touchRaw = resolvePermutationDescriptions(absPath, "touch");
  const sharedColorDesc = getDesc(themeSetTree.color);
  const sharedFinishDesc = getDesc(themeSetTree.finish);

  const lines: string[] = [];
  lines.push("---");
  lines.push(...serializeYaml(frontmatter));
  lines.push("---");
  lines.push("");
  lines.push(`# ${themeName}`);
  lines.push("");

  // 1. Overview
  lines.push("## Overview");
  lines.push("");
  if (resolver.description) lines.push(resolver.description);
  if (designExt.overview) {
    if (resolver.description) lines.push("");
    lines.push(designExt.overview);
  }
  lines.push("");

  // 2. Colors
  lines.push("## Colors");
  lines.push("");
  const colorGroupDesc = getDesc(lightMerged.color);
  const darkColorGroupDesc = getDesc(darkMerged.color);
  if (sharedColorDesc) lines.push(`- **Shared (C-layer):** ${sharedColorDesc}`);
  if (colorGroupDesc) lines.push(`- **Light:** ${colorGroupDesc}`);
  if (darkColorGroupDesc && darkColorGroupDesc !== colorGroupDesc) {
    lines.push(`- **Dark:** ${darkColorGroupDesc}`);
  }
  lines.push("");

  const byRole = new Map<ColorRole, string[]>();
  for (const r of COLOR_ROLES) byRole.set(r, []);
  for (const name of colorKeys) {
    const tokExt = getExt(lightColorsRaw[name]);
    const role = tokExt?.role as ColorRole | undefined;
    if (!role) {
      throw new Error(
        `${resolverPath}: color.${name} has no $extensions["dev.aning.shadcn-nsh"].role`,
      );
    }
    byRole.get(role)!.push(name);
  }

  for (const role of COLOR_ROLES) {
    const names = byRole.get(role)!;
    if (names.length === 0) continue;
    lines.push(`### ${ROLE_TITLES[role]}`);
    lines.push("");
    for (const name of names) {
      const desc = getDesc(lightColorsRaw[name]) ?? getDesc(darkColorsRaw[name]) ?? "";
      const lHex = dtcgColorToHex(lightColorsRes[name]!.$value as DtcgColor);
      const dHex = dtcgColorToHex(darkColorsRes[name]!.$value as DtcgColor);
      const swatch = lHex === dHex ? `\`${lHex}\`` : `light \`${lHex}\`, dark \`${dHex}\``;
      lines.push(`- **\`${name}\`** (${swatch}): ${desc}`);
    }
    lines.push("");
  }

  // 3. Typography
  lines.push("## Typography");
  lines.push("");
  const typoDesc = getDesc(typoGroup);
  if (typoDesc) lines.push(typoDesc);
  const fontFamDesc = getDesc(fontFamilyGroup);
  if (fontFamDesc) {
    if (typoDesc) lines.push("");
    lines.push(`- **Font stacks:** ${fontFamDesc}`);
    for (const [k, tok] of Object.entries(fontFamilyGroup)) {
      if (k.startsWith("$") || !isTokenNode(tok)) continue;
      const val = Array.isArray(tok.$value) ? tok.$value.join(", ") : String(tok.$value);
      lines.push(`  - \`${k}\` (\`${val}\`): ${getDesc(tok) ?? ""}`);
    }
    const semanticFam = getExt(typoGroup)?.fontFamily;
    const semanticFamLabel =
      semanticFam === null || semanticFam === undefined
        ? "`null` (system UI default)"
        : `\`${typeof semanticFam === "string" ? semanticFam : JSON.stringify(semanticFam)}\``;
    lines.push(`  - Semantic body \`fontFamily\`: ${semanticFamLabel}.`);
  }
  lines.push("");
  for (const role of TYPE_ROLES) {
    const t = typographyYaml[role]!;
    const touchTypo = (touchRaw.typography?.[role]?.$value ?? {}) as Record<string, unknown>;
    const touchFontSize = isRecord(touchTypo.fontSize)
      ? fmtDim(touchTypo.fontSize as unknown as DtcgDimension)
      : t.fontSize;
    const touchNote = touchFontSize !== t.fontSize ? ` (touch: ${touchFontSize})` : "";
    const roleDesc = getDesc(typoGroup[role]) ?? "";
    lines.push(
      `- **\`${role}\`** (${t.fontSize}${touchNote}, weight ${t.fontWeight}, line-height ${t.lineHeight.toFixed(2)}, letter-spacing ${t.letterSpacing}): ${roleDesc}`,
    );
  }
  lines.push("");

  // 4. Layout
  lines.push("## Layout");
  lines.push("");
  const sizeDesc = getDesc(sizeGroup);
  if (sizeDesc) {
    lines.push(sizeDesc);
    lines.push("");
  }
  for (const [label, key] of [
    ["Hit target", "hit"],
    ["Density", "density"],
    ["Control geometry", "control"],
    ["Control heights", "height"],
  ] as const) {
    const node = sizeGroup[key];
    const d = getDesc(node);
    if (d) lines.push(`- **${label}:** ${d}`);
  }
  if (typeof controlSizeExt.switch === "string") {
    lines.push(`- **Switch size tier (pointer):** \`${controlSizeExt.switch}\`.`);
  }
  const iconDesc = getDesc(iconGroup);
  if (iconDesc) lines.push(`- **Icons:** ${iconDesc}`);
  const pointerDocDesc = pointerRaw.docDescription ?? getDesc(lightMerged.font);
  const touchSizeDesc = touchRaw.docDescription;
  if (pointerDocDesc || touchSizeDesc) {
    lines.push("");
    if (pointerDocDesc) lines.push(`- **Pointer tier:** ${pointerDocDesc}`);
    if (touchSizeDesc) lines.push(`- **Touch tier:** ${touchSizeDesc}`);
  }
  lines.push("");

  // 5. Elevation & Depth
  lines.push("## Elevation & Depth");
  lines.push("");
  if (designExt.elevation) {
    lines.push(designExt.elevation);
    lines.push("");
  }
  const strokeDesc = getDesc(strokeGroup);
  if (strokeDesc) {
    lines.push(`- **Strokes:** ${strokeDesc}`);
    for (const k of ["hairline", "surface", "control"] as const) {
      const tok = strokeGroup[k];
      if (isTokenNode(tok)) {
        const d = fmtDim(tok.$value as DtcgDimension);
        lines.push(`  - \`stroke.${k}\` (${d}): ${getDesc(tok) ?? ""}`);
      }
    }
  }
  const focusDesc = getDesc(focusGroup);
  if (focusDesc) {
    lines.push(`- **Focus indicator (\`style: "${String(focusExt.style)}"\`):** ${focusDesc}`);
    for (const k of ["width", "offset"] as const) {
      const tok = focusGroup[k];
      if (isTokenNode(tok)) {
        lines.push(
          `  - \`focus.${k}\` (${fmtDim(tok.$value as DtcgDimension)}): ${getDesc(tok) ?? ""}`,
        );
      }
    }
  }
  const overlayDesc = getDesc(stateGroup.overlay);
  if (overlayDesc) {
    const ov = (stateGroup.overlay ?? {}) as Record<string, Record<string, unknown>>;
    const vals = ["hover", "focus", "pressed", "dragged"]
      .map((k) => {
        const v = ov[k]?.$value;
        return `${k}=${typeof v === "number" ? v : 0}`;
      })
      .join(", ");
    lines.push(`- **State overlays (${vals}):** ${overlayDesc}`);
  }
  lines.push("");

  // 6. Shapes
  lines.push("## Shapes");
  lines.push("");
  const radiusGroupDesc = getDesc(radiusGroup);
  const shapeDimDesc = getDesc(shapeDimGroup);
  const shapeExtDesc = getDesc(lightMerged.shape);
  if (radiusGroupDesc) lines.push(radiusGroupDesc);
  if (shapeExtDesc) {
    if (radiusGroupDesc) lines.push("");
    lines.push(`${shapeExtDesc} (\`curve: "${String(shapeExt.curve)}"\`).`);
  }
  if (shapeDimDesc) {
    lines.push("");
    lines.push(shapeDimDesc);
  }
  lines.push("");
  for (const role of SHAPE_ROLES) {
    const radKey = role === "inset" ? "base" : role;
    const desc = getDesc(shapeDimGroup[role]) ?? getDesc(radiusGroup[radKey]) ?? "";
    lines.push(`- **\`${role}\`** (${roundedYaml[role]}): ${desc}`);
  }
  lines.push("");

  // 7. Motion & Micro-interaction
  lines.push("## Motion & Micro-interaction");
  lines.push("");
  const motionGroupDesc = getDesc(motionGroup);
  if (motionGroupDesc) lines.push(motionGroupDesc);
  lines.push("");
  const enterNode = transitionGroup.enter;
  if (enterNode) {
    lines.push(
      `- **\`enter\`** (${motionYaml.enter!.duration}, \`${motionYaml.enter!.timingFunction}\`): ${getDesc(enterNode) ?? ""}`,
    );
  }
  const shakeNode = durationGroup.shake;
  if (shakeNode) {
    lines.push(`- **\`shake\`** (${motionYaml.shake!.duration}): ${getDesc(shakeNode) ?? ""}`);
  }
  for (const role of ["press", "settle", "control", "move"] as const) {
    const roleNode = motionGroup[role];
    const roleExt = getExt(roleNode);
    const desc = getDesc(roleNode) ?? "";
    if (roleExt?.spring) {
      const sp = roleExt.spring as { stiffness: number; damping: number };
      lines.push(
        `- **\`${role}\`** (spring: stiffness=${sp.stiffness}, damping=${sp.damping} — omitted from YAML \`motion\` because DESIGN.md \`Motion\` only accepts \`duration\`/\`delay\`/\`timingFunction\`): ${desc}`,
      );
    } else if (motionYaml[role]) {
      lines.push(
        `- **\`${role}\`** (${motionYaml[role]!.duration}, \`${motionYaml[role]!.timingFunction}\`): ${desc}`,
      );
    }
  }
  const stateDesc = getDesc(stateGroup);
  if (stateDesc) {
    const pressScale = (stateGroup["press-scale"] as Record<string, unknown> | undefined)?.$value;
    const pressedOpacity = (stateGroup["pressed-opacity"] as Record<string, unknown> | undefined)
      ?.$value;
    lines.push(
      `- **Press & ripple** (\`press-scale: ${String(pressScale)}\`, \`pressed-opacity: ${String(pressedOpacity)}\`, \`ripple: ${String(stateExt.ripple)}\`): ${stateDesc}`,
    );
  }
  const curveDesc = getDesc(cubicBezierGroup);
  if (curveDesc) {
    lines.push(`- **Timing curves:** ${curveDesc}`);
  }
  lines.push("");

  // 8. Voice & Content Strategy
  lines.push("## Voice & Content Strategy");
  lines.push("");
  lines.push(
    designExt.voiceOmitted ??
      "Voice & Content Strategy is intentionally omitted; product copy and tone belong to the host application.",
  );
  lines.push("");

  // 9. Components
  lines.push("## Components");
  lines.push("");
  const finishGroupDesc = sharedFinishDesc ?? getDesc(finishesRaw);
  if (finishGroupDesc) {
    lines.push(finishGroupDesc);
    lines.push("");
  }
  for (const [role, group] of Object.entries(finishesRaw)) {
    if (role.startsWith("$") || !isRecord(group)) continue;
    const roleDesc = getDesc(group);
    const darkRoleGroup = (darkRaw.finish as Record<string, unknown> | undefined)?.[role];
    const extL = getExt(group);
    const extD = getExt(darkRoleGroup);
    const notes: string[] = [];
    if (typeof extL?.backdropFilter === "string") {
      notes.push(`backdropFilter: \`${extL.backdropFilter}\``);
    }
    if (extL?.material || extD?.material) {
      notes.push(`material: \`${JSON.stringify(extL?.material ?? extD?.material)}\``);
    }
    const suffix = notes.length > 0 ? ` (${notes.join("; ")})` : "";
    lines.push(`- **\`finish.${role}\`**${suffix}: ${roleDesc ?? ""}`);
  }
  const disabledDesc = getDesc(stateGroup.disabled);
  if (disabledDesc) {
    const dis = (stateGroup.disabled ?? {}) as Record<string, Record<string, unknown>>;
    const disExt = (dis.$extensions?.[EXT_NS] ?? {}) as Record<string, unknown>;
    lines.push(
      `- **Disabled handling** (content=${String(dis.content?.$value)}, fill=${String(disExt.fill)}): ${disabledDesc}`,
    );
  }
  lines.push("");

  // 10. Do's and Don'ts
  lines.push("## Do's and Don'ts");
  lines.push("");
  for (const item of [...(designExt.sharedDos ?? []), ...(designExt.dos ?? [])]) {
    lines.push(`- **Do:** ${item}`);
  }
  for (const item of [...(designExt.sharedDonts ?? []), ...(designExt.donts ?? [])]) {
    lines.push(`- **Don't:** ${item}`);
  }
  lines.push("");

  return lines.join("\n");
}

function resolvePermutationDescriptions(
  resolverPath: string,
  input: "pointer" | "touch",
): {
  docDescription?: string;
  typography?: Record<string, Record<string, unknown>>;
} {
  const absPath = path.resolve(resolverPath);
  const dir = path.dirname(absPath);
  const doc = JSON.parse(fs.readFileSync(absPath, "utf8")) as ResolverDoc;
  const sources = doc.modifiers?.input?.contexts[input] ?? [];
  let tierDesc: string | undefined;
  let merged: Record<string, unknown> = {};
  for (const src of sources) {
    const loaded = loadSourceItem(src, dir, doc);
    if (typeof loaded.$description === "string") tierDesc = loaded.$description;
    merged = mergeTokenTrees(merged, loaded);
  }
  const full = compileAppearanceTokensJson(absPath, "light");
  const withTier = resolveAliases(mergeTokenTrees(structuredClone(full), merged));
  return {
    docDescription: tierDesc,
    typography: withTier.typography as Record<string, Record<string, unknown>> | undefined,
  };
}
