/**
 * Compiles a DTCG 2025.10 `theme.resolver.json` back into:
 * 1. NSH's `theme.json` runtime contract (`cssVars: { theme, light, dark }`), preserving `var(--x)`
 *    and `color-mix(...)` so host `setThemeOverrides` continues to flow dynamically;
 * 2. Option (b) DTCG-named runtime semantics artifact; and
 * 3. A documented `toLegacySemantics()` projection to verify exact round-trip parity with
 *    `packages/theme/semantics.json`.
 */
import fs from "node:fs";
import path from "node:path";

import { formatColorOpToCss, formatDtcgColor } from "./color";
import { loadSourceItem, mergeTokenTrees, resolvePermutation, type ResolverDoc } from "./resolver";
import {
  EXT_NS,
  NAMED_CUBIC_BEZIERS,
  RADIUS_KEYS,
  SHAPE_ROLES,
  TYPE_ROLES,
  type ColorOpExtension,
  type DtcgColor,
  type DtcgGradientStop,
  type DtcgShadowItem,
  type DtcgTransition,
  type DtcgTypography,
} from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

function getExt(node: unknown): Record<string, unknown> | undefined {
  if (!isRecord(node) || !isRecord(node.$extensions)) return undefined;
  const ns = node.$extensions[EXT_NS];
  return isRecord(ns) ? ns : undefined;
}

function compileColorTokenToCss(token: Record<string, unknown>): string {
  const ext = getExt(token);
  if (ext?.colorOp) {
    return formatColorOpToCss(ext.colorOp as ColorOpExtension);
  }
  const val = token.$value;
  if (typeof val === "string") {
    const m = /^\{color\.([a-z0-9-]+)\}$/.exec(val);
    if (m) return `var(--${m[1]})`;
    return val;
  }
  return formatDtcgColor(val as DtcgColor);
}

/** Compile a DTCG resolver into NSH `theme.json` (`cssVars: { theme, light, dark }`). */
export function compileThemeJson(resolverPath: string): {
  name: string;
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
} {
  const absPath = path.resolve(resolverPath);
  const dir = path.dirname(absPath);
  const doc = JSON.parse(fs.readFileSync(absPath, "utf8")) as ResolverDoc;

  const themeSetTree = (doc.sets?.theme?.sources ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );
  const lightTree = (doc.modifiers?.appearance?.contexts.light ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});
  const darkTree = (doc.modifiers?.appearance?.contexts.dark ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );

  const cssTheme: Record<string, string> = {};
  const dimRadius = (themeSetTree.dimension as Record<string, unknown>)?.radius as Record<
    string,
    Record<string, unknown>
  >;
  for (const { cssVar, dtcg } of RADIUS_KEYS) {
    const dim = dimRadius[dtcg]!.$value as { value: number; unit: string };
    cssTheme[cssVar] = `${dim.value}${dim.unit}`;
  }

  const fontFamilies = ((themeSetTree.font as Record<string, unknown>)?.family ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  for (const [k, tok] of Object.entries(fontFamilies)) {
    if (k.startsWith("$")) continue;
    const v = tok.$value;
    cssTheme[`font-${k}`] = Array.isArray(v) ? v.join(", ") : String(v);
  }

  const sharedColors = (themeSetTree.color ?? {}) as Record<string, Record<string, unknown>>;
  for (const [k, tok] of Object.entries(sharedColors)) {
    if (k.startsWith("$")) continue;
    cssTheme[k] = compileColorTokenToCss(tok);
  }

  const compileAppearanceColors = (tree: Record<string, unknown>) => {
    const out: Record<string, string> = {};
    const colors = (tree.color ?? {}) as Record<string, Record<string, unknown>>;
    for (const [k, tok] of Object.entries(colors)) {
      if (k.startsWith("$")) continue;
      out[k] = compileColorTokenToCss(tok);
    }
    return out;
  };

  return {
    name: doc.name ?? path.basename(dir),
    cssVars: {
      theme: cssTheme,
      light: compileAppearanceColors(lightTree),
      dark: compileAppearanceColors(darkTree),
    },
  };
}

/** Option (b) runtime semantic artifact using DTCG 2025.10 field names. */
export interface RuntimeSemanticsDtcg {
  typography: {
    fontFamily: string | null;
    roles: Record<
      string,
      {
        fontSize: { pointer: number; touch: number };
        lineHeight: { pointer: number; touch: number };
        fontWeight: number;
        letterSpacing: number;
      }
    >;
  };
  dimension: {
    shape: Record<string, string>;
    size: {
      hit: { pointer: number; touch: number };
      density: { pointer: Record<string, number>; touch: Record<string, number> };
      control: { pointer: Record<string, number>; touch: Record<string, number> };
      height: { pointer: Record<string, number>; touch: Record<string, number> };
    };
    stroke: Record<string, number>;
    focus: { width: number; offset: number };
    icon: { pointer: Record<string, number>; touch: Record<string, number> };
  };
  shape: {
    curve: string;
    corners: { field: string };
  };
  controlSwitch: { pointer: string; touch: string };
  focus: { style: string };
  state: {
    pressScale: number;
    overlay: Record<string, number>;
    ripple: boolean;
    pressedOpacity: number;
    disabled: Record<string, number>;
  };
  motion: Record<
    string,
    | { stiffness: number; damping: number }
    | {
        duration: number;
        delay: number;
        timingFunction: [number, number, number, number];
        nshEasing?: string;
      }
    | { duration: number }
  >;
  indicator: Record<string, string>;
  finishes: {
    shared: Record<string, DtcgFinishFields>;
    light: Record<string, DtcgFinishFields>;
    dark: Record<string, DtcgFinishFields>;
  };
}

export interface DtcgFinishFields {
  background?:
    | DtcgColor
    | string
    | { op: "alpha"; color: string; alpha: number; fallback: DtcgColor };
  gradient?: {
    angle: number;
    stops: Array<{ color: DtcgColor | string; position: number; transparentKeyword?: boolean }>;
  };
  borderColor?:
    | DtcgColor
    | string
    | { op: "alpha"; color: string; alpha: number; fallback: DtcgColor };
  shadow?: { none?: boolean; items: DtcgShadowItem[] };
  backdropFilter?: string;
  material?: unknown;
}

function compileFinishMap(
  finishGroup: Record<string, Record<string, unknown>>,
): Record<string, DtcgFinishFields> {
  const out: Record<string, DtcgFinishFields> = {};
  for (const [role, group] of Object.entries(finishGroup)) {
    if (role.startsWith("$")) continue;
    const entry: DtcgFinishFields = {};

    const compileColorLeaf = (tok: Record<string, unknown>) => {
      const ext = getExt(tok);
      if (ext?.transparentKeyword) return "transparent";
      if (ext?.colorOp) {
        const op = ext.colorOp as ColorOpExtension;
        if (op.op === "alpha") {
          return {
            op: "alpha" as const,
            color: op.color,
            alpha: op.alpha,
            fallback: tok.$value as DtcgColor,
          };
        }
      }
      return tok.$value as DtcgColor | string;
    };

    if (isRecord(group.background)) {
      entry.background = compileColorLeaf(group.background);
    }
    if (isRecord(group.gradient)) {
      const ext = getExt(group.gradient);
      const angle = (ext?.angle as number | undefined) ?? 180;
      const transparentStops = new Set<number>(
        (ext?.transparentStops as number[] | undefined) ?? [],
      );
      const rawStops = group.gradient.$value as DtcgGradientStop[];
      entry.gradient = {
        angle,
        stops: rawStops.map((s, idx) => ({
          color: s.color,
          position: s.position,
          ...(transparentStops.has(idx) ? { transparentKeyword: true } : {}),
        })),
      };
    }
    if (isRecord(group.shadow)) {
      const ext = getExt(group.shadow);
      const raw = group.shadow.$value;
      entry.shadow = {
        ...(ext?.none ? { none: true } : {}),
        items: (Array.isArray(raw) ? raw : [raw]) as DtcgShadowItem[],
      };
    }
    if (isRecord(group["border-color"])) {
      entry.borderColor = compileColorLeaf(group["border-color"]);
    }
    const groupExt = getExt(group);
    if (groupExt && "backdropFilter" in groupExt) {
      entry.backdropFilter = groupExt.backdropFilter as string;
    }
    if (groupExt && "material" in groupExt) {
      entry.material = groupExt.material;
    }

    out[role] = entry;
  }
  return out;
}

/** Compile a resolver into the Option (b) DTCG-named runtime semantic structure. */
export function compileOptionBSemantics(resolverPath: string): RuntimeSemanticsDtcg {
  const absPath = path.resolve(resolverPath);
  const dir = path.dirname(absPath);
  const doc = JSON.parse(fs.readFileSync(absPath, "utf8")) as ResolverDoc;

  const { merged: lp, resolved: lpResolved } = resolvePermutation(absPath, {
    appearance: "light",
    input: "pointer",
  });
  const { merged: lt, resolved: ltResolved } = resolvePermutation(absPath, {
    appearance: "light",
    input: "touch",
  });

  const typoGroup = lp.typography as Record<string, unknown>;
  const typoExt = getExt(typoGroup);
  const fontFamily = (typoExt?.fontFamily as string | null | undefined) ?? null;

  const roles: RuntimeSemanticsDtcg["typography"]["roles"] = {};
  for (const role of TYPE_ROLES) {
    const pTypo = (lpResolved.typography as Record<string, Record<string, unknown>>)[role]!
      .$value as DtcgTypography;
    const tTypo = (ltResolved.typography as Record<string, Record<string, unknown>>)[role]!
      .$value as DtcgTypography;
    roles[role] = {
      fontSize: {
        pointer: (pTypo.fontSize as { value: number }).value,
        touch: (tTypo.fontSize as { value: number }).value,
      },
      lineHeight: {
        pointer: pTypo.lineHeight as number,
        touch: tTypo.lineHeight as number,
      },
      fontWeight: pTypo.fontWeight,
      letterSpacing: pTypo.letterSpacing.value,
    };
  }

  const readDimMap = (group: Record<string, Record<string, unknown>>) =>
    Object.fromEntries(
      Object.entries(group)
        .filter(([k]) => !k.startsWith("$"))
        .map(([k, tok]) => [k, (tok.$value as { value: number }).value]),
    );

  const shapeGroup = (lp.dimension as Record<string, unknown>).shape as Record<
    string,
    Record<string, unknown>
  >;
  const dimShape: Record<string, string> = {};
  for (const role of SHAPE_ROLES) {
    const ref = shapeGroup[role]!.$value as string;
    const m = /^\{dimension\.radius\.([a-z0-9-]+)\}$/.exec(ref);
    if (!m) throw new Error(`Expected {dimension.radius.*} in dimension.shape.${role}, got ${ref}`);
    dimShape[role] = m[1] === "base" ? "{radius}" : `{radius-${m[1]}}`;
  }

  const lpDim = lp.dimension as Record<string, unknown>;
  const ltDim = lt.dimension as Record<string, unknown>;
  const lpSize = lpDim.size as Record<string, unknown>;
  const ltSize = ltDim.size as Record<string, unknown>;

  const shapeExt = getExt(lp.shape)!;
  const focusExt = getExt(lpDim.focus)!;
  const stateGroup = lp.state as Record<string, unknown>;
  const stateExt = getExt(stateGroup)!;

  const readNumMap = (group: Record<string, Record<string, unknown>>) =>
    Object.fromEntries(
      Object.entries(group)
        .filter(([k]) => !k.startsWith("$"))
        .map(([k, tok]) => [k, tok.$value as number]),
    );

  const motionGroup = lpResolved.motion as Record<string, Record<string, unknown>>;
  const motion: RuntimeSemanticsDtcg["motion"] = {};
  for (const role of ["press", "settle", "control", "move"] as const) {
    const m = motionGroup[role]!;
    const ext = getExt(m);
    if (ext?.spring) {
      motion[role] = ext.spring as { stiffness: number; damping: number };
    } else if (isRecord(m.timing)) {
      const val = m.timing.$value as DtcgTransition;
      const tf = val.timingFunction as [number, number, number, number];
      motion[role] = {
        duration: val.duration.value,
        delay: val.delay.value,
        timingFunction: tf,
      };
    }
  }
  const enterVal = (lpResolved.transition as Record<string, Record<string, unknown>>).enter!
    .$value as DtcgTransition;
  // Preserve exact NSH easing name when declared on the source bezier token.
  const enterRef = (
    (lp.transition as Record<string, Record<string, unknown>>).enter!.$value as DtcgTransition
  ).timingFunction as string;
  const bezierName = /^\{cubicBezier\.([a-z0-9-]+)\}$/.exec(enterRef)?.[1];
  const bezierExt = bezierName
    ? getExt((lp.cubicBezier as Record<string, unknown>)[bezierName])
    : undefined;
  motion.enter = {
    duration: enterVal.duration.value,
    delay: enterVal.delay.value,
    timingFunction: enterVal.timingFunction as [number, number, number, number],
    ...(bezierExt?.nshEasing ? { nshEasing: bezierExt.nshEasing as string } : {}),
  };
  const shakeDur = (
    (lpResolved.duration as Record<string, Record<string, unknown>>).shake!.$value as {
      value: number;
    }
  ).value;
  motion.shake = { duration: shakeDur };

  // Keep split shared / light / dark finish maps directly from their DTCG sources.
  const sharedFinishesTree = (doc.sets?.theme?.sources ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );
  const lightFinishesTree = (doc.modifiers?.appearance?.contexts.light ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});
  const darkFinishesTree = (doc.modifiers?.appearance?.contexts.dark ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});

  return {
    typography: { fontFamily, roles },
    dimension: {
      shape: dimShape,
      size: {
        hit: {
          pointer: ((lpSize.hit as Record<string, unknown>).$value as { value: number }).value,
          touch: ((ltSize.hit as Record<string, unknown>).$value as { value: number }).value,
        },
        density: {
          pointer: readDimMap(lpSize.density as Record<string, Record<string, unknown>>),
          touch: readDimMap(ltSize.density as Record<string, Record<string, unknown>>),
        },
        control: {
          pointer: readDimMap(lpSize.control as Record<string, Record<string, unknown>>),
          touch: readDimMap(ltSize.control as Record<string, Record<string, unknown>>),
        },
        height: {
          pointer: readDimMap(lpSize.height as Record<string, Record<string, unknown>>),
          touch: readDimMap(ltSize.height as Record<string, Record<string, unknown>>),
        },
      },
      stroke: readDimMap(lpDim.stroke as Record<string, Record<string, unknown>>),
      focus: {
        width: (
          (lpDim.focus as Record<string, Record<string, unknown>>).width!.$value as {
            value: number;
          }
        ).value,
        offset: (
          (lpDim.focus as Record<string, Record<string, unknown>>).offset!.$value as {
            value: number;
          }
        ).value,
      },
      icon: {
        pointer: readDimMap(lpDim.icon as Record<string, Record<string, unknown>>),
        touch: readDimMap(ltDim.icon as Record<string, Record<string, unknown>>),
      },
    },
    shape: {
      curve: shapeExt.curve as string,
      corners: shapeExt.corners as { field: string },
    },
    controlSwitch: {
      pointer: getExt(lpSize.control)!.switch as string,
      touch: getExt(ltSize.control)!.switch as string,
    },
    focus: { style: focusExt.style as string },
    state: {
      pressScale: (stateGroup["press-scale"] as Record<string, unknown>).$value as number,
      overlay: readNumMap(stateGroup.overlay as Record<string, Record<string, unknown>>),
      ripple: stateExt.ripple as boolean,
      pressedOpacity: (stateGroup["pressed-opacity"] as Record<string, unknown>).$value as number,
      disabled: readNumMap(stateGroup.disabled as Record<string, Record<string, unknown>>),
    },
    motion,
    indicator: getExt(lp.indicator) as Record<string, string>,
    finishes: {
      shared: compileFinishMap(
        (sharedFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>,
      ),
      light: compileFinishMap(
        (lightFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>,
      ),
      dark: compileFinishMap(
        (darkFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>,
      ),
    },
  };
}

function bezierToEasingName(tf: [number, number, number, number], nshEasing?: string): string {
  if (nshEasing) return nshEasing;
  for (const [name, spec] of Object.entries(NAMED_CUBIC_BEZIERS)) {
    if (spec.value.every((v, i) => Math.abs(v - tf[i]!) < 1e-6)) {
      return name;
    }
  }
  throw new Error(`Unknown cubicBezier array: ${JSON.stringify(tf)}`);
}

/**
 * Documented key-renaming / shape projection from Option (b) DTCG runtime semantics back to
 * `packages/theme/semantics.json` for proving lossless round-trip in the spike test.
 */
export function toLegacySemantics(dtcg: RuntimeSemanticsDtcg): Record<string, unknown> {
  const typeOut: Record<string, unknown> = { family: dtcg.typography.fontFamily };
  for (const role of TYPE_ROLES) {
    const r = dtcg.typography.roles[role]!;
    typeOut[role] = {
      size: r.fontSize,
      line: {
        pointer: Math.round(r.fontSize.pointer * r.lineHeight.pointer),
        touch: Math.round(r.fontSize.touch * r.lineHeight.touch),
      },
      weight: String(r.fontWeight),
      tracking: r.letterSpacing,
    };
  }

  const formatColorLeaf = (
    val: DtcgColor | string | { op: "alpha"; color: string; alpha: number; fallback: DtcgColor },
  ): string => {
    if (typeof val === "string") {
      const m = /^\{color\.([a-z0-9-]+)\}$/.exec(val);
      return m ? `{${m[1]}}` : val;
    }
    if ("op" in val) {
      const m = /^\{color\.([a-z0-9-]+)\}$/.exec(val.color)!;
      return `oklch(from {${m[1]}} l c h / ${val.alpha})`;
    }
    return formatDtcgColor(val);
  };

  const formatFinishSection = (section: Record<string, DtcgFinishFields>) => {
    const out: Record<string, Record<string, unknown>> = {};
    for (const [role, f] of Object.entries(section)) {
      const item: Record<string, unknown> = {};
      if (f.background !== undefined) item.backgroundColor = formatColorLeaf(f.background);
      if (f.gradient !== undefined) {
        const stops = f.gradient.stops.map((s) => {
          const col = s.transparentKeyword ? "transparent" : formatColorLeaf(s.color);
          return `${col} ${Math.round(s.position * 10000) / 100}%`;
        });
        item.backgroundImage = `linear-gradient(${f.gradient.angle}deg, ${stops.join(", ")})`;
      }
      if (f.shadow !== undefined) {
        if (f.shadow.none) {
          item.boxShadow = "none";
        } else {
          item.boxShadow = f.shadow.items
            .map((s) => {
              const parts: string[] = [];
              if (s.inset) parts.push("inset");
              const fmtLen = (d: { value: number; unit: string }) =>
                d.value === 0 ? "0" : `${d.value}${d.unit}`;
              parts.push(fmtLen(s.offsetX), fmtLen(s.offsetY), fmtLen(s.blur));
              if (s.spread.value !== 0) parts.push(fmtLen(s.spread));
              parts.push(formatColorLeaf(s.color));
              return parts.join(" ");
            })
            .join(", ");
        }
      }
      if (f.borderColor !== undefined) item.borderColor = formatColorLeaf(f.borderColor);
      if (f.backdropFilter !== undefined) item.backdropFilter = f.backdropFilter;
      if ("material" in f) item.material = f.material;
      out[role] = item;
    }
    return out;
  };

  const motionOut: Record<string, unknown> = {};
  for (const [role, m] of Object.entries(dtcg.motion)) {
    if ("stiffness" in m) {
      motionOut[role] = m;
    } else if ("timingFunction" in m) {
      motionOut[role] = {
        duration: m.duration,
        easing: bezierToEasingName(m.timingFunction, m.nshEasing),
      };
    } else {
      motionOut[role] = m;
    }
  }

  return {
    type: typeOut,
    shape: {
      ...dtcg.dimension.shape,
      curve: dtcg.shape.curve,
      corners: dtcg.shape.corners,
    },
    size: {
      hit: dtcg.dimension.size.hit,
      density: dtcg.dimension.size.density,
      control: {
        pointer: { ...dtcg.dimension.size.control.pointer, switch: dtcg.controlSwitch.pointer },
        touch: { ...dtcg.dimension.size.control.touch, switch: dtcg.controlSwitch.touch },
      },
      height: dtcg.dimension.size.height,
    },
    stroke: dtcg.dimension.stroke,
    focus: {
      style: dtcg.focus.style,
      ...dtcg.dimension.focus,
    },
    state: dtcg.state,
    motion: motionOut,
    icon: { size: dtcg.dimension.icon },
    indicator: dtcg.indicator,
    finishes: {
      shared: formatFinishSection(dtcg.finishes.shared),
      light: formatFinishSection(dtcg.finishes.light),
      dark: formatFinishSection(dtcg.finishes.dark),
    },
  };
}
