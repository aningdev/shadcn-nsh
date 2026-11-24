/**
 * Compiles a DTCG 2025.10 `theme.resolver.json` into:
 * 1. `theme.json` (`cssVars: { theme, light, dark }`), preserving `var(--x)` and `color-mix(...)`
 *    so host `setThemeOverrides` flows dynamically;
 * 2. `semantics.json` (compiled DTCG-named runtime semantic contract consumed by `theme.ts`);
 * 3. `light.tokens.json` & `dark.tokens.json` (standalone DTCG 2025.10 Format files resolved per
 *    appearance at the pointer tier with in-file aliases and 6-digit hex fallbacks).
 */
import fs from "node:fs";
import path from "node:path";

import { splitFinishes } from "../theme/tokens";
import { formatColorOpToCss, formatDtcgColor, oklchToHex6, srgbToHex6 } from "./color";
import { loadSourceItem, mergeTokenTrees, resolvePermutation, type ResolverDoc } from "./resolver";
import {
  CONTROL_DIMENSIONS,
  EXT_NS,
  FORMAT_SCHEMA_URL,
  MOTION_ROLES,
  NAMED_CUBIC_BEZIERS,
  RADIUS_KEYS,
  SHAPE_ROLES,
  TYPE_ROLES,
  getExt,
  isRecord,
  type ColorOpExtension,
  type DtcgColor,
  type DtcgGradientStop,
  type DtcgShadowItem,
  type DtcgTransition,
  type DtcgTypography,
} from "./types";

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
  const controlTok = dimRadius?.control;
  if (!controlTok) {
    throw new Error(`Missing required dimension.radius.control in ${resolverPath}`);
  }
  const controlDim = controlTok.$value as { value: number; unit: string };
  // A-layer `radius` stays as a shadcn base slot aliased to `control` (NSH's `theme.rs` parses CSS lengths).
  cssTheme.radius = `${controlDim.value}${controlDim.unit}`;
  for (const { cssVar, dtcg } of RADIUS_KEYS) {
    const tok = dimRadius?.[dtcg];
    if (!tok) {
      throw new Error(`Missing required dimension.radius.${dtcg} in ${resolverPath}`);
    }
    const dim = tok.$value as { value: number; unit: string };
    cssTheme[cssVar] = `${dim.value}${dim.unit}`;
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

/**
 * A finish's `material` as `semantics.json` writes it: the recipe's name, or `null` where the layer
 * asks nothing of the platform (`"none"` in the source, as a `gradient` it does not state is absent).
 */
function compileMaterialValue(material: unknown): string | null {
  if (material === "none") return null;
  if (material === "glass" || material === "acrylic") return material;
  throw new Error(
    `Expected a finish material (none, glass, acrylic), got ${JSON.stringify(material)}`,
  );
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

/** The shadow scale an appearance compiles to: one CSS `boxShadow` per part, or `null` for a part the theme has none of. */
export type CompiledShadows = Record<string, string | null>;

/** A scale part's CSS, resolving `{shadow.edge.surface}` through the appearance's compiled scale. */
function resolveShadowRef(ref: unknown, shadows: CompiledShadows): string | null {
  if (typeof ref !== "string")
    throw new Error(`Expected a {shadow.*} reference, got ${String(ref)}`);
  const m = /^\{shadow\.([a-z0-9.-]+)\}$/.exec(ref);
  if (!m) throw new Error(`Expected a {shadow.*} reference, got ${ref}`);
  const key = m[1]!;
  if (!(key in shadows)) throw new Error(`Unknown shadow part {shadow.${key}}`);
  return shadows[key]!;
}

/** The CSS of one `shadow` composite token, `none` and `null` parts alike. */
function compileShadowValue(token: Record<string, unknown>): string | null {
  const ext = getExt(token);
  if (ext?.none) return null;
  const raw = token.$value;
  const shadows = (Array.isArray(raw) ? raw : [raw]) as DtcgShadowItem[];
  return shadows
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

/**
 * Compile a theme's `shadow` group (below `color`, beside `finish`) to its scale: the levels
 * `sm`/`md`/`lg`/`xl`, the one `inset`, and the two edges, keyed by their dotted names, and
 * `null` where the theme has none (`$extensions[EXT_NS].none`, a flat theme's edge).
 */
export function compileShadowGroup(group: Record<string, unknown>): CompiledShadows {
  const out: CompiledShadows = {};
  const walk = (node: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (!isRecord(v)) continue;
      const name = prefix ? `${prefix}.${k}` : k;
      if ("$value" in v) out[name] = compileShadowValue(v);
      else walk(v, name);
    }
  };
  walk(group, "");
  return out;
}

/** A DTCG gradient token as the CSS `linear-gradient` a finish paints. */
function compileGradientToken(node: Record<string, unknown>): string {
  const ext = getExt(node);
  const angle = (ext?.angle as number | undefined) ?? 180;
  const transparentStops = new Set<number>((ext?.transparentStops as number[] | undefined) ?? []);
  const rawStops = node.$value as DtcgGradientStop[];
  const stops = rawStops.map((s, idx) => {
    const col = transparentStops.has(idx)
      ? "transparent"
      : typeof s.color === "string"
        ? toFlatColorRef(s.color)
        : formatDtcgColor(s.color);
    return `${col} ${Math.round(s.position * 10000) / 100}%`;
  });
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

export function compileFinishGroup(
  finishGroup: Record<string, Record<string, unknown>>,
  shadows: CompiledShadows = {},
): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [role, group] of Object.entries(finishGroup)) {
    if (role.startsWith("$")) continue;
    const item: Record<string, unknown> = {};

    if (isRecord(group.background)) {
      item.background = compileFinishColor(group.background);
    }
    if (isRecord(group.gradient)) {
      item.gradient = compileGradientToken(group.gradient);
    }
    if (isRecord(group.shadow)) {
      const raw = group.shadow.$value;
      const items = Array.isArray(raw) ? raw : [raw];
      if (items.every((i) => typeof i === "string")) {
        // A finish names the shadow scale's parts; the layers join in the order written.
        const parts = items
          .map((ref) => resolveShadowRef(ref, shadows))
          .filter((part): part is string => part !== null);
        item.shadow = parts.length > 0 ? parts.join(", ") : "none";
      } else {
        item.shadow = compileShadowValue(group.shadow) ?? "none";
      }
    }
    if (isRecord(group.foreground)) {
      item.foreground = compileFinishColor(group.foreground);
    }
    if (isRecord(group["border-color"])) {
      item["border-color"] = compileFinishColor(group["border-color"]);
    }
    if (isRecord(group["border-top-color"])) {
      item["border-top-color"] = compileFinishColor(group["border-top-color"]);
    }
    if (isRecord(group["border-bottom-color"])) {
      item["border-bottom-color"] = compileFinishColor(group["border-bottom-color"]);
    }
    if (isRecord(group["pressed-background"])) {
      item["pressed-background"] = compileFinishColor(group["pressed-background"]);
    }
    if (isRecord(group["pressed-foreground"])) {
      item["pressed-foreground"] = compileFinishColor(group["pressed-foreground"]);
    }
    if (isRecord(group["pressed-opacity"])) {
      item["pressed-opacity"] = group["pressed-opacity"].$value;
    }
    if (isRecord(group["checked-background"])) {
      item["checked-background"] = compileFinishColor(group["checked-background"]);
    }
    if (isRecord(group["checked-border-color"])) {
      item["checked-border-color"] = compileFinishColor(group["checked-border-color"]);
    }
    if (isRecord(group["checked-gradient"])) {
      item["checked-gradient"] = compileGradientToken(group["checked-gradient"]);
    }
    // A field the source states as `"none"` in the finish's extensions, and writes no token for,
    // compiles to `null`: no gradient, no pressed swap, no edge colour of its own. The base set
    // states them once for every role, so a compiled finish always carries every field.
    const groupExt = getExt(group);
    for (const field of [
      "gradient",
      "pressed-background",
      "pressed-foreground",
      "border-top-color",
      "border-bottom-color",
    ] as const) {
      if (groupExt?.[field] === "none" && !(field in item)) item[field] = null;
    }
    // A knob's checked gradient stated as `"none"` is a value, not a neutral: the knob is flat while
    // checked. A checked field the theme states nowhere at all stays absent — the unchecked knob's.
    if (groupExt?.["checked-gradient"] === "none" && !("checked-gradient" in item)) {
      item["checked-gradient"] = null;
    }
    if (groupExt && "backdropFilter" in groupExt) {
      item.backdropFilter = groupExt.backdropFilter;
    }
    if (groupExt && "material" in groupExt) {
      item.material = compileMaterialValue(groupExt.material);
    }
    if (groupExt && "elevation" in groupExt) {
      item.elevation = groupExt.elevation;
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
  const shared = compileFinishGroup(
    (sharedTree.finish ?? {}) as Record<string, Record<string, unknown>>,
    compileShadowGroup({
      ...((sharedTree.shadow ?? {}) as Record<string, unknown>),
      ...((lightTree.shadow ?? {}) as Record<string, unknown>),
    }),
  );
  const light = compileFinishGroup(
    (lightTree.finish ?? {}) as Record<string, Record<string, unknown>>,
    compileShadowGroup({
      ...((sharedTree.shadow ?? {}) as Record<string, unknown>),
      ...((lightTree.shadow ?? {}) as Record<string, unknown>),
    }),
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

/** Merge one appearance's finish group over the shared one. Extensions merge rather than replace:
 * the shared group states what a layer always is (a material, say), the appearance what differs. */
function mergeFinishGroup(
  shared: Record<string, unknown>,
  own: Record<string, unknown>,
): Record<string, unknown> {
  const extensions = {
    ...((shared.$extensions as Record<string, Record<string, unknown>> | undefined)?.[EXT_NS] ??
      {}),
    ...((own.$extensions as Record<string, Record<string, unknown>> | undefined)?.[EXT_NS] ?? {}),
  };
  return {
    ...shared,
    ...own,
    ...(Object.keys(extensions).length > 0 ? { $extensions: { [EXT_NS]: extensions } } : {}),
  };
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

  const typographyOut: Record<string, unknown> = {};
  for (const role of TYPE_ROLES) {
    const pTypo = (lpResolved.typography as Record<string, Record<string, unknown>>)[role]!
      .$value as DtcgTypography;
    const tTypo = (ltResolved.typography as Record<string, Record<string, unknown>>)[role]!
      .$value as DtcgTypography;
    const pSize = (pTypo.fontSize as { value: number }).value;
    const tSize = (tTypo.fontSize as { value: number }).value;
    // DTCG's `lineHeight` is a multiple of the font size; the contract states the whole points it works out to.
    const points = (size: number, lineHeight: number) => Math.round(size * lineHeight);
    typographyOut[role] = {
      fontSize: { pointer: pSize, touch: tSize },
      lineHeight: {
        pointer: points(pSize, pTypo.lineHeight as number),
        touch: points(tSize, tTypo.lineHeight as number),
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
  const dimShapeOut: Record<string, unknown> = {};
  for (const role of SHAPE_ROLES) {
    const ref = shapeGroup[role]!.$value as string;
    const m = /^\{dimension\.radius\.([a-z0-9-]+)\}$/.exec(ref);
    if (!m) throw new Error(`Expected {dimension.radius.*} in dimension.shape.${role}, got ${ref}`);
    dimShapeOut[role] = `{radius-${m[1]}}`;
  }
  const shapeExt = getExt(lp.shape)!;

  const lpDim = lp.dimension as Record<string, unknown>;
  const ltDim = lt.dimension as Record<string, unknown>;
  const lpSize = lpDim.size as Record<string, unknown>;
  const ltSize = ltDim.size as Record<string, unknown>;
  const focusExt = getExt(lpDim.focus)!;
  const controlExt = getExt(lpDim.control);
  if (controlExt === undefined) {
    throw new Error(`${absPath}: dimension.control carries none of the four control dimensions`);
  }
  const controlOut: Record<string, string> = {};
  for (const key of CONTROL_DIMENSIONS) {
    const value = controlExt[key];
    if (typeof value !== "string") {
      throw new Error(
        `${absPath}: dimension.control.${key} is ${JSON.stringify(value)}, not one of the four control dimensions`,
      );
    }
    controlOut[key] = value;
  }
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
  for (const role of MOTION_ROLES) {
    const m = motionResolved[role];
    if (m === undefined) continue;
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
        timingFunction: bezierToEasingName(tf, bezierExt?.nshEasing as string | undefined),
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
  const transitionOut = {
    enter: {
      duration: enterVal.duration.value,
      timingFunction: bezierToEasingName(
        enterVal.timingFunction as [number, number, number, number],
        enterBezierExt?.nshEasing as string | undefined,
      ),
    },
  };

  // The base set's finish group comes first: it states the neutral fields every finish has, and a
  // theme's own `finishes.shared` (then each appearance's) overrides the fields it really differs on.
  const sharedFinishesTree = [
    ...(doc.sets?.base?.sources ?? []),
    ...(doc.sets?.theme?.sources ?? []),
  ].reduce<Record<string, unknown>>(
    (acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)),
    {},
  );
  const lightFinishesTree = (doc.modifiers?.appearance?.contexts.light ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});
  const darkFinishesTree = (doc.modifiers?.appearance?.contexts.dark ?? []).reduce<
    Record<string, unknown>
  >((acc, src) => mergeTokenTrees(acc, loadSourceItem(src, dir, doc)), {});

  const shadowsOf = (appearanceTree: Record<string, unknown>): CompiledShadows =>
    compileShadowGroup({
      ...((sharedFinishesTree.shadow ?? {}) as Record<string, unknown>),
      ...((appearanceTree.shadow ?? {}) as Record<string, unknown>),
    });
  const shadowsLight = shadowsOf(lightFinishesTree);
  const shadowsDark = shadowsOf(darkFinishesTree);

  /** One appearance's finishes: what both appearances state, then what this one overrides,
   * resolved against this appearance's shadow scale (a finish names the scale's parts, and the
   * parts are the scale's per appearance). */
  const finishesFor = (
    appearanceTree: Record<string, unknown>,
    shadows: CompiledShadows,
  ): Record<string, Record<string, unknown>> => {
    const shared = (sharedFinishesTree.finish ?? {}) as Record<string, Record<string, unknown>>;
    const own = (appearanceTree.finish ?? {}) as Record<string, Record<string, unknown>>;
    const merged: Record<string, Record<string, unknown>> = {};
    for (const role of new Set([...Object.keys(shared), ...Object.keys(own)])) {
      merged[role] = mergeFinishGroup(shared[role] ?? {}, own[role] ?? {});
    }
    return compileFinishGroup(merged, shadows);
  };

  const mergedLight = finishesFor(lightFinishesTree, shadowsLight);
  const mergedDark = finishesFor(darkFinishesTree, shadowsDark);

  const defaultResolver = path.resolve(dir, "..", "default", "theme.resolver.json");
  const finishesOut =
    absPath !== defaultResolver && fs.existsSync(defaultResolver)
      ? (() => {
          const order = readDefaultFinishFieldOrder(defaultResolver);
          return splitFinishes(
            orderFinishesByDefault(mergedLight, order),
            orderFinishesByDefault(mergedDark, order),
          );
        })()
      : splitFinishes(mergedLight, mergedDark);

  return {
    typography: typographyOut,
    dimension: {
      shape: dimShapeOut,
      size: {
        hit: {
          pointer: ((lpSize.hit as Record<string, unknown>).$value as { value: number }).value,
          touch: ((ltSize.hit as Record<string, unknown>).$value as { value: number }).value,
        },
        density: {
          pointer: readDimMap(lpSize.density as Record<string, Record<string, unknown>>),
          touch: readDimMap(ltSize.density as Record<string, Record<string, unknown>>),
        },
        item: {
          pointer: readDimMap(lpSize.item as Record<string, Record<string, unknown>>),
          touch: readDimMap(ltSize.item as Record<string, Record<string, unknown>>),
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
      icon: {
        pointer: readDimMap(lpDim.icon as Record<string, Record<string, unknown>>),
        touch: readDimMap(ltDim.icon as Record<string, Record<string, unknown>>),
      },
      control: controlOut,
    },
    shape: {
      curve: shapeExt.curve,
      corners: shapeExt.corners,
    },
    state: {
      "press-scale": (stateGroup["press-scale"] as Record<string, unknown>).$value as number,
      overlay: readNumMap(stateGroup.overlay as Record<string, Record<string, unknown>>),
      ripple: stateExt.ripple as boolean,
      "pressed-opacity": (stateGroup["pressed-opacity"] as Record<string, unknown>)
        .$value as number,
      "rest-opacity": (stateGroup["rest-opacity"] as Record<string, unknown>).$value as number,
      disabled: {
        content: (stateGroup.disabled as Record<string, Record<string, unknown>>).content!
          .$value as number,
        fill: getExt(stateGroup.disabled)?.fill as boolean,
      },
    },
    transition: transitionOut,
    motion: motionOut,
    finishes: finishesOut,
    elevation: { light: elevationSet(shadowsLight), dark: elevationSet(shadowsDark) },
  };
}

/** One appearance's shadow scale as `semantics.json` writes it: the four levels, the one inset, the two edges. */
function elevationSet(shadows: CompiledShadows): Record<string, unknown> {
  const part = (key: string) => shadows[key] ?? null;
  const set: Record<string, unknown> = {
    sm: part("sm"),
    md: part("md"),
    lg: part("lg"),
    xl: part("xl"),
    inset: part("inset"),
  };
  const surface = part("edge.surface");
  const accent = part("edge.accent");
  if (surface !== null || accent !== null) set.edge = { surface, accent };
  return set;
}

const HEX6_RE = /^#[0-9a-f]{6}$/i;

function isDtcgColor(val: unknown): val is DtcgColor {
  return (
    isRecord(val) &&
    (val.colorSpace === "oklch" || val.colorSpace === "srgb") &&
    Array.isArray(val.components) &&
    val.components.length === 3 &&
    val.components.every((c) => typeof c === "number")
  );
}

/** Ensure every DTCG color object in a token tree carries a 6-digit hex fallback. */
function ensureHexFallbacks(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(ensureHexFallbacks);
  if (!isRecord(node)) return node;
  if (isDtcgColor(node)) {
    if (typeof node.hex === "string" && HEX6_RE.test(node.hex)) return node;
    const [c0, c1, c2] = node.components;
    const hex = node.colorSpace === "srgb" ? srgbToHex6(c0, c1, c2) : oklchToHex6(c0, c1, c2);
    return { ...node, hex };
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    out[k] = ensureHexFallbacks(v);
  }
  return out;
}

/**
 * Compile a DTCG resolver into a standalone DTCG 2025.10 Format file for one appearance at the
 * `pointer` tier, self-contained with in-file `{...}` aliases and 6-digit hex color fallbacks.
 */
export function compileAppearanceTokensJson(
  resolverPath: string,
  appearance: "light" | "dark",
): Record<string, unknown> {
  const absPath = path.resolve(resolverPath);
  const dir = path.dirname(absPath);
  const doc = JSON.parse(fs.readFileSync(absPath, "utf8")) as ResolverDoc;
  const { merged } = resolvePermutation(absPath, { appearance, input: "pointer" });
  const withHex = ensureHexFallbacks(merged) as Record<string, unknown>;

  const out: Record<string, unknown> = {
    $schema: FORMAT_SCHEMA_URL,
    $description: `${doc.name ?? path.basename(dir)} (${appearance} appearance, pointer tier) — standalone W3C DTCG 2025.10 tokens.`,
  };
  for (const [k, v] of Object.entries(withHex)) {
    if (k === "$schema" || k === "$description") continue;
    out[k] = v;
  }
  return out;
}
