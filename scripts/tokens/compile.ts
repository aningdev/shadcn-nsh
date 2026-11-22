/**
 * Compiles a DTCG 2025.10 `theme.resolver.json` into the runtime artifacts consumed by NSH and
 * `packages/theme/theme.ts`:
 * 1. `theme.json` (`cssVars: { theme, light, dark }`), preserving `var(--x)` and `color-mix(...)`
 *    so host `setThemeOverrides` flows dynamically;
 * 2. `semantics.json` (the current runtime semantic contract; batch 5 moves this artifact and
 *    `theme.ts` together to DTCG field names).
 */
import fs from "node:fs";
import path from "node:path";

import { mergeFinishes, splitFinishes } from "../theme/tokens";
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

  const baseSetTree = (doc.sets?.base?.sources ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );
  const themeSetTree = (doc.sets?.theme?.sources ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );
  const sharedTree = mergeTokenTrees(structuredClone(baseSetTree), themeSetTree);
  const lightTree = (doc.modifiers?.appearance?.contexts.light ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});
  const darkTree = (doc.modifiers?.appearance?.contexts.dark ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );

  const cssTheme: Record<string, string> = {};
  const dimRadius = (sharedTree.dimension as Record<string, unknown> | undefined)?.radius as
    | Record<string, Record<string, unknown>>
    | undefined;
  for (const { cssVar, dtcg } of RADIUS_KEYS) {
    const tok = dimRadius?.[dtcg];
    if (!tok) {
      throw new Error(`Missing required dimension.radius.${dtcg} in ${resolverPath}`);
    }
    const dim = tok.$value as { value: number; unit: string };
    cssTheme[cssVar] = `${dim.value}${dim.unit}`;
  }

  const fontFamilies = ((sharedTree.font as Record<string, unknown> | undefined)?.family ??
    {}) as Record<string, Record<string, unknown>>;
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

function bezierToEasingName(tf: [number, number, number, number], nshEasing?: string): string {
  if (nshEasing) return nshEasing;
  for (const [name, spec] of Object.entries(NAMED_CUBIC_BEZIERS)) {
    if (spec.value.every((v, i) => Math.abs(v - tf[i]!) < 1e-6)) {
      return name;
    }
  }
  throw new Error(`Unknown cubicBezier array: ${JSON.stringify(tf)}`);
}

function toFlatColorRef(val: string): string {
  const m = /^\{color\.([a-z0-9-]+)\}$/.exec(val);
  return m ? `{${m[1]}}` : val;
}

function compileFinishColor(tok: Record<string, unknown>): string {
  const ext = getExt(tok);
  if (ext?.transparentKeyword) return "transparent";
  if (ext?.colorOp) {
    return formatColorOpToCss(ext.colorOp as ColorOpExtension);
  }
  const val = tok.$value;
  if (typeof val === "string") return toFlatColorRef(val);
  return formatDtcgColor(val as DtcgColor);
}

function compileMaterialValue(material: unknown): unknown {
  if (!isRecord(material)) return material;
  const out = structuredClone(material);
  if (isRecord(out.apple) && typeof out.apple.tint === "string") {
    out.apple.tint = toFlatColorRef(out.apple.tint);
  }
  if (
    isRecord(out.android) &&
    isRecord(out.android.ripple) &&
    typeof out.android.ripple.color === "string"
  ) {
    out.android.ripple.color = toFlatColorRef(out.android.ripple.color);
  }
  return out;
}

function orderFinishFields(
  item: Record<string, unknown>,
  order: readonly string[] | undefined,
): Record<string, unknown> {
  if (!order) return item;
  const out: Record<string, unknown> = {};
  for (const key of order) {
    if (key in item) out[key] = item[key];
  }
  for (const [key, val] of Object.entries(item)) {
    if (!(key in out)) out[key] = val;
  }
  return out;
}

function compileFinishSection(
  finishGroup: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [role, group] of Object.entries(finishGroup)) {
    if (role.startsWith("$")) continue;
    const item: Record<string, unknown> = {};

    if (isRecord(group.background)) {
      item.backgroundColor = compileFinishColor(group.background);
    }
    if (isRecord(group.gradient)) {
      const ext = getExt(group.gradient);
      const angle = (ext?.angle as number | undefined) ?? 180;
      const transparentStops = new Set<number>(
        (ext?.transparentStops as number[] | undefined) ?? [],
      );
      const rawStops = group.gradient.$value as DtcgGradientStop[];
      const stops = rawStops.map((s, idx) => {
        const col = transparentStops.has(idx)
          ? "transparent"
          : typeof s.color === "string"
            ? toFlatColorRef(s.color)
            : formatDtcgColor(s.color);
        return `${col} ${Math.round(s.position * 10000) / 100}%`;
      });
      item.backgroundImage = `linear-gradient(${angle}deg, ${stops.join(", ")})`;
    }
    if (isRecord(group.shadow)) {
      const ext = getExt(group.shadow);
      if (ext?.none) {
        item.boxShadow = "none";
      } else {
        const raw = group.shadow.$value;
        const shadows = (Array.isArray(raw) ? raw : [raw]) as DtcgShadowItem[];
        item.boxShadow = shadows
          .map((s) => {
            const parts: string[] = [];
            if (s.inset) parts.push("inset");
            const fmtLen = (d: { value: number; unit: string }) =>
              d.value === 0 ? "0" : `${d.value}${d.unit}`;
            parts.push(fmtLen(s.offsetX), fmtLen(s.offsetY), fmtLen(s.blur));
            if (s.spread.value !== 0) parts.push(fmtLen(s.spread));
            const colorStr =
              typeof s.color === "string" ? toFlatColorRef(s.color) : formatDtcgColor(s.color);
            parts.push(colorStr);
            return parts.join(" ");
          })
          .join(", ");
      }
    }
    if (isRecord(group["border-color"])) {
      item.borderColor = compileFinishColor(group["border-color"]);
    }
    const groupExt = getExt(group);
    if (groupExt && "backdropFilter" in groupExt) {
      item.backdropFilter = groupExt.backdropFilter;
    }
    if (groupExt && "material" in groupExt) {
      item.material = compileMaterialValue(groupExt.material);
    }

    out[role] = item;
  }
  return out;
}

/**
 * Derive each finish role's canonical merged field order from the sibling `default` theme's
 * DTCG source so non-default themes emit fields in the exact same order (`scripts/theme/order.ts`).
 */
function readDefaultFinishFieldOrder(defaultResolverPath: string): Map<string, string[]> {
  const dir = path.dirname(defaultResolverPath);
  const doc = JSON.parse(fs.readFileSync(defaultResolverPath, "utf8")) as ResolverDoc;
  const sharedTree = (doc.sets?.theme?.sources ?? []).reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );
  const lightTree = (doc.modifiers?.appearance?.contexts.light ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});
  const shared = compileFinishSection(
    (sharedTree.finish ?? {}) as Record<string, Record<string, unknown>>,
  );
  const light = compileFinishSection(
    (lightTree.finish ?? {}) as Record<string, Record<string, unknown>>,
  );
  const order = new Map<string, string[]>();
  for (const role of Object.keys(shared)) {
    order.set(role, Object.keys({ ...shared[role], ...(light[role] ?? {}) }));
  }
  return order;
}

function orderFinishesByDefault(
  finishes: Record<string, Record<string, unknown>>,
  fieldOrderByRole: Map<string, string[]>,
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const role of fieldOrderByRole.keys()) {
    if (role in finishes) {
      out[role] = orderFinishFields(finishes[role]!, fieldOrderByRole.get(role));
    }
  }
  for (const [role, val] of Object.entries(finishes)) {
    if (!(role in out)) out[role] = val;
  }
  return out;
}

/** Compile a DTCG resolver into the runtime `semantics.json` artifact. */
export function compileSemanticsJson(resolverPath: string): Record<string, unknown> {
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
  const rawFontFamily = (getExt(typoGroup)?.fontFamily as string | null | undefined) ?? null;
  const fontMatch =
    typeof rawFontFamily === "string"
      ? /^\{font\.family\.([a-z0-9-]+)\}$/.exec(rawFontFamily)
      : null;
  const fontFamily = fontMatch ? `{font-${fontMatch[1]}}` : rawFontFamily;

  const typeOut: Record<string, unknown> = { family: fontFamily };
  for (const role of TYPE_ROLES) {
    const pTypo = (lpResolved.typography as Record<string, Record<string, unknown>>)[role]!
      .$value as DtcgTypography;
    const tTypo = (ltResolved.typography as Record<string, Record<string, unknown>>)[role]!
      .$value as DtcgTypography;
    const pSize = (pTypo.fontSize as { value: number }).value;
    const tSize = (tTypo.fontSize as { value: number }).value;
    typeOut[role] = {
      size: { pointer: pSize, touch: tSize },
      line: {
        pointer: Math.round(pSize * (pTypo.lineHeight as number)),
        touch: Math.round(tSize * (tTypo.lineHeight as number)),
      },
      weight: String(pTypo.fontWeight),
      tracking: pTypo.letterSpacing.value,
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
  const shapeOut: Record<string, unknown> = {};
  for (const role of SHAPE_ROLES) {
    const ref = shapeGroup[role]!.$value as string;
    const m = /^\{dimension\.radius\.([a-z0-9-]+)\}$/.exec(ref);
    if (!m) throw new Error(`Expected {dimension.radius.*} in dimension.shape.${role}, got ${ref}`);
    shapeOut[role] = m[1] === "base" ? "{radius}" : `{radius-${m[1]}}`;
  }
  const shapeExt = getExt(lp.shape)!;
  shapeOut.curve = shapeExt.curve;
  shapeOut.corners = shapeExt.corners;

  const lpDim = lp.dimension as Record<string, unknown>;
  const ltDim = lt.dimension as Record<string, unknown>;
  const lpSize = lpDim.size as Record<string, unknown>;
  const ltSize = ltDim.size as Record<string, unknown>;
  const focusExt = getExt(lpDim.focus)!;
  const stateGroup = lp.state as Record<string, unknown>;
  const stateExt = getExt(stateGroup)!;

  const readNumMap = (group: Record<string, Record<string, unknown>>) =>
    Object.fromEntries(
      Object.entries(group)
        .filter(([k]) => !k.startsWith("$"))
        .map(([k, tok]) => [k, tok.$value as number]),
    );

  const motionResolved = lpResolved.motion as Record<string, Record<string, unknown>>;
  const motionMerged = lp.motion as Record<string, Record<string, unknown>>;
  const motionOut: Record<string, unknown> = {};
  for (const role of ["press", "settle", "control", "move"] as const) {
    const m = motionResolved[role]!;
    const ext = getExt(m);
    if (ext?.spring) {
      motionOut[role] = ext.spring;
    } else if (isRecord(m.timing)) {
      const val = m.timing.$value as DtcgTransition;
      const tf = val.timingFunction as [number, number, number, number];
      const timingRaw = motionMerged[role]!.timing as Record<string, unknown>;
      const ref = (timingRaw.$value as DtcgTransition).timingFunction as string;
      const bezierName = /^\{cubicBezier\.([a-z0-9-]+)\}$/.exec(ref)?.[1];
      const bezierExt = bezierName
        ? getExt((lp.cubicBezier as Record<string, unknown>)[bezierName])
        : undefined;
      motionOut[role] = {
        duration: val.duration.value,
        easing: bezierToEasingName(tf, bezierExt?.nshEasing as string | undefined),
      };
    }
  }

  const enterVal = (lpResolved.transition as Record<string, Record<string, unknown>>).enter!
    .$value as DtcgTransition;
  const enterRef = (
    (lp.transition as Record<string, Record<string, unknown>>).enter!.$value as DtcgTransition
  ).timingFunction as string;
  const enterBezierName = /^\{cubicBezier\.([a-z0-9-]+)\}$/.exec(enterRef)?.[1];
  const enterBezierExt = enterBezierName
    ? getExt((lp.cubicBezier as Record<string, unknown>)[enterBezierName])
    : undefined;
  motionOut.enter = {
    duration: enterVal.duration.value,
    easing: bezierToEasingName(
      enterVal.timingFunction as [number, number, number, number],
      enterBezierExt?.nshEasing as string | undefined,
    ),
  };

  const shakeDur = (
    (lpResolved.duration as Record<string, Record<string, unknown>>).shake!.$value as {
      value: number;
    }
  ).value;
  motionOut.shake = { duration: shakeDur };

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

  const rawShared = compileFinishSection(
    (sharedFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>,
  );
  const rawLight = compileFinishSection(
    (lightFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>,
  );
  const rawDark = compileFinishSection(
    (darkFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>,
  );

  const defaultResolver = path.resolve(dir, "..", "default", "theme.resolver.json");
  const finishesOut =
    absPath !== defaultResolver && fs.existsSync(defaultResolver)
      ? (() => {
          const order = readDefaultFinishFieldOrder(defaultResolver);
          const rawSplit = { shared: rawShared, light: rawLight, dark: rawDark };
          const mergedLight = orderFinishesByDefault(mergeFinishes(rawSplit, "light"), order);
          const mergedDark = orderFinishesByDefault(mergeFinishes(rawSplit, "dark"), order);
          return splitFinishes(mergedLight, mergedDark);
        })()
      : { shared: rawShared, light: rawLight, dark: rawDark };

  return {
    type: typeOut,
    shape: shapeOut,
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
        pointer: {
          ...readDimMap(lpSize.control as Record<string, Record<string, unknown>>),
          switch: getExt(lpSize.control)!.switch,
        },
        touch: {
          ...readDimMap(ltSize.control as Record<string, Record<string, unknown>>),
          switch: getExt(ltSize.control)!.switch,
        },
      },
      height: {
        pointer: readDimMap(lpSize.height as Record<string, Record<string, unknown>>),
        touch: readDimMap(ltSize.height as Record<string, Record<string, unknown>>),
      },
    },
    stroke: readDimMap(lpDim.stroke as Record<string, Record<string, unknown>>),
    focus: {
      style: focusExt.style,
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
    state: {
      pressScale: (stateGroup["press-scale"] as Record<string, unknown>).$value as number,
      overlay: readNumMap(stateGroup.overlay as Record<string, Record<string, unknown>>),
      ripple: stateExt.ripple as boolean,
      pressedOpacity: (stateGroup["pressed-opacity"] as Record<string, unknown>).$value as number,
      disabled: readNumMap(stateGroup.disabled as Record<string, Record<string, unknown>>),
    },
    motion: motionOut,
    icon: {
      size: {
        pointer: readDimMap(lpDim.icon as Record<string, Record<string, unknown>>),
        touch: readDimMap(ltDim.icon as Record<string, Record<string, unknown>>),
      },
    },
    indicator: getExt(lp.indicator) as Record<string, string>,
    finishes: finishesOut,
  };
}
