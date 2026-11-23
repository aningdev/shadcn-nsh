/**
 * Source-stage DTCG 2025.10 linter for `packages/theme/tokens/`.
 *
 * Validates:
 * 1. Official 2025.10 JSON Schemas (`format.json` for `.tokens.json`, `resolver.json` for
 *    `theme.resolver.json`);
 * 2. Resolver integrity & alias resolution (all permutations, no dangling or circular aliases);
 * 3. Reference `$type` compatibility across whole-token aliases, composite fields, and
 *    `$extensions` references;
 * 4. `$extensions` namespace (`dev.aning.shadcn-nsh`) and per-location schemas from spec §5,
 *    reusing `scripts/theme/style.ts` whitelists/motion helpers and `scripts/theme/material.ts`
 *    without duplicating rule logic;
 * 5. `colorOp` static `$value` consistency against live evaluation (<= 1e-4 & exact 8-bit sRGB);
 * 6. `$description` coverage on colour roles, finishes, and style groups.
 */
import fs from "node:fs";
import path from "node:path";

import { checkMaterial } from "../theme/material";
import { oklchToRgb } from "../theme/oklch";
import {
  checkSpringSpec,
  checkTimingSpec,
  easingNames,
  isValidPressScale,
  motionRoleNames,
  shapeRadiusRoles,
  whitelists,
} from "../theme/style";
import type { TokenKind } from "../theme/tokens";
import { discoverDtcgThemes } from "./build";
import { evaluateColorMix } from "./color";
import { loadSourceItem, resolvePermutation, type ResolverDoc } from "./resolver";
import { validateResolverDocument, validateTokensDocument } from "./schema-validate";
import {
  COLOR_ROLES,
  CONTROL_DIMENSIONS,
  EXT_NS,
  RADIUS_KEYS,
  TYPE_ROLES,
  getExt,
  isRecord,
  isTokenNode,
  type ColorOpExtension,
  type ColorRole,
  type DtcgColor,
} from "./types";

const defaultRepoRoot = path.resolve(import.meta.dir, "..", "..");
const CURLY_REF = /^\{([^${}.][^{}.]*(?:\.[^${}.][^{}.]*)*)\}$/;

const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

function collectFiles(dir: string, suffix: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(full, suffix);
      return entry.name.endsWith(suffix) ? [full] : [];
    })
    .sort();
}

function collectReferencedFiles(resolverPath: string, doc: ResolverDoc): Set<string> {
  const dir = path.dirname(path.resolve(resolverPath));
  const refs = new Set<string>();
  const addItems = (items: unknown) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (isRecord(item) && typeof item.$ref === "string" && !item.$ref.startsWith("#")) {
        refs.add(path.resolve(dir, item.$ref));
      }
    }
  };
  for (const set of Object.values(doc.sets ?? {})) addItems(set.sources);
  for (const mod of Object.values(doc.modifiers ?? {})) {
    for (const ctx of Object.values(mod.contexts ?? {})) addItems(ctx);
  }
  return refs;
}

/** Collect every token's effective DTCG `$type` (own, inherited from group, or resolved alias). */
function collectTokenTypes(tree: Record<string, unknown>): Map<string, string> {
  const raw = new Map<string, { type?: string; value: unknown }>();
  const walk = (node: Record<string, unknown>, prefix: string, inherited?: string) => {
    const groupType = typeof node.$type === "string" ? node.$type : inherited;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      const p = prefix ? `${prefix}.${k}` : k;
      if (isTokenNode(v)) {
        const own = typeof v.$type === "string" ? v.$type : groupType;
        raw.set(p, { type: own, value: v.$value });
      } else if (isRecord(v)) {
        walk(v, p, groupType);
      }
    }
  };
  walk(tree, "");

  const resolved = new Map<string, string>();
  const resolveType = (p: string, stack = new Set<string>()): string | undefined => {
    if (resolved.has(p)) return resolved.get(p);
    const entry = raw.get(p);
    if (!entry) return undefined;
    if (entry.type) {
      resolved.set(p, entry.type);
      return entry.type;
    }
    if (typeof entry.value === "string") {
      const m = CURLY_REF.exec(entry.value);
      if (m && !stack.has(p)) {
        stack.add(p);
        const target = resolveType(m[1]!, stack);
        if (target) {
          resolved.set(p, target);
          return target;
        }
      }
    }
    return undefined;
  };
  for (const key of raw.keys()) resolveType(key);
  return resolved;
}

function getAtPath(tree: Record<string, unknown>, dotted: string): unknown {
  let cur: unknown = tree;
  for (const seg of dotted.split(".")) {
    if (!isRecord(cur) || !Object.hasOwn(cur, seg)) return undefined;
    cur = cur[seg];
  }
  return cur;
}

/** Validate that a `{group.token}` alias exists and has the expected DTCG `$type`. */
function checkTypedRef(
  label: string,
  refStr: unknown,
  expectedType: string,
  tokenTypes: Map<string, string>,
  problems: string[],
): string | null {
  if (typeof refStr !== "string") {
    problems.push(`${label}: expected a \`{...}\` reference to a ${expectedType} token`);
    return null;
  }
  const m = CURLY_REF.exec(refStr);
  if (!m) {
    problems.push(`${label}: "${refStr}" is not a valid \`{group.token}\` alias`);
    return null;
  }
  const target = m[1]!;
  const actual = tokenTypes.get(target);
  if (actual === undefined) {
    problems.push(`${label}: references unknown token \`{${target}}\``);
    return null;
  }
  if (actual !== expectedType) {
    problems.push(
      `${label}: references \`{${target}}\` of $type "${actual}", expected "${expectedType}"`,
    );
    return null;
  }
  return target;
}

function checkUnknownKeys(
  label: string,
  obj: Record<string, unknown>,
  allowed: readonly string[],
  problems: string[],
): void {
  const allow = new Set(allowed);
  for (const k of Object.keys(obj)) {
    if (!allow.has(k)) {
      problems.push(`${label}: unknown extension key "${k}" (allowed: ${allowed.join(", ")})`);
    }
  }
}

/** Validate `$extensions` namespaces and path schemas on an individual or merged token tree. */
function checkExtensionNodes(
  fileLabel: string,
  tree: Record<string, unknown>,
  problems: string[],
  mode: "source" | "merged",
): void {
  const walk = (node: Record<string, unknown>, p: string) => {
    if ("$extensions" in node) {
      const exts = node.$extensions;
      if (!isRecord(exts)) {
        problems.push(`${fileLabel}: ${p || "#"}.$extensions must be an object`);
      } else {
        for (const ns of Object.keys(exts)) {
          if (ns !== EXT_NS) {
            problems.push(
              `${fileLabel}: ${p || "#"}.$extensions uses disallowed namespace "${ns}" (expected "${EXT_NS}")`,
            );
          }
        }
        const ext = exts[EXT_NS];
        if (ext !== undefined) {
          if (!isRecord(ext)) {
            problems.push(`${fileLabel}: ${p}.$extensions["${EXT_NS}"] must be an object`);
          } else {
            validateExtAtPath(fileLabel, p, node, ext, problems, mode);
          }
        }
      }
    }

    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (isRecord(v)) walk(v, p ? `${p}.${k}` : k);
    }
  };
  walk(tree, "");
}

function validateExtAtPath(
  label: string,
  p: string,
  node: Record<string, unknown>,
  ext: Record<string, unknown>,
  problems: string[],
  mode: "source" | "merged",
): void {
  const where = `${label}: ${p}.$extensions["${EXT_NS}"]`;

  if (p === "shape") {
    checkUnknownKeys(where, ext, ["curve", "corners"], problems);
    if ("curve" in ext) {
      if (!whitelists["shape.curve"]!.includes(ext.curve as string)) {
        problems.push(`${where}.curve: ${JSON.stringify(ext.curve)} is not in whitelist`);
      }
    } else if (mode === "merged") {
      problems.push(`${where}.curve is missing`);
    }
    if ("corners" in ext) {
      if (!isRecord(ext.corners)) {
        problems.push(`${where}.corners must be an object`);
      } else {
        checkUnknownKeys(`${where}.corners`, ext.corners, ["button"], problems);
        if ("button" in ext.corners) {
          if (!whitelists["shape.corners.button"]!.includes(ext.corners.button as string)) {
            problems.push(
              `${where}.corners.button: ${JSON.stringify(ext.corners.button)} is not in whitelist`,
            );
          }
        } else if (mode === "merged") {
          problems.push(`${where}.corners.button is missing`);
        }
      }
    } else if (mode === "merged") {
      problems.push(`${where}.corners is missing`);
    }
    return;
  }

  if (p === "dimension.size.control") {
    checkUnknownKeys(where, ext, ["switch"], problems);
    if (!whitelists["dimension.size.control.*.switch"]!.includes(ext.switch as string)) {
      problems.push(`${where}.switch: ${JSON.stringify(ext.switch)} is not in whitelist`);
    }
    return;
  }

  if (p === "dimension.focus") {
    checkUnknownKeys(where, ext, ["style"], problems);
    if (!whitelists["dimension.focus.style"]!.includes(ext.style as string)) {
      problems.push(`${where}.style: ${JSON.stringify(ext.style)} is not in whitelist`);
    }
    return;
  }

  if (p === "dimension.control") {
    checkUnknownKeys(where, ext, CONTROL_DIMENSIONS, problems);
    for (const key of CONTROL_DIMENSIONS) {
      if (!(key in ext)) {
        if (mode === "merged") problems.push(`${where}.${key} is missing`);
        continue;
      }
      if (!whitelists[`dimension.control.${key}`]!.includes(ext[key] as string)) {
        problems.push(`${where}.${key}: ${JSON.stringify(ext[key])} is not in whitelist`);
      }
    }
    return;
  }

  if (p === "state") {
    checkUnknownKeys(where, ext, ["ripple"], problems);
    if (typeof ext.ripple !== "boolean") {
      problems.push(`${where}.ripple must be a boolean`);
    }
    return;
  }

  if (p === "state.disabled") {
    checkUnknownKeys(where, ext, ["fill"], problems);
    if (typeof ext.fill !== "boolean") {
      problems.push(`${where}.fill must be a boolean`);
    }
    return;
  }

  if (p === "controls") {
    checkUnknownKeys(where, ext, ["preset"], problems);
    if (!("preset" in ext)) {
      if (mode === "merged") problems.push(`${where}.preset is missing`);
    } else if (!whitelists.controls!.includes(ext.preset as string)) {
      problems.push(`${where}.preset: ${JSON.stringify(ext.preset)} is not in whitelist`);
    }
    return;
  }

  if (/^motion\.[a-z0-9-]+$/.test(p)) {
    checkUnknownKeys(where, ext, ["spring"], problems);
    if (!isRecord(ext.spring)) {
      problems.push(`${where}.spring must be an object`);
    } else {
      checkUnknownKeys(`${where}.spring`, ext.spring, ["stiffness", "damping"], problems);
      problems.push(...checkSpringSpec(label, `${p}.spring`, ext.spring));
    }
    return;
  }

  if (/^cubicBezier\.[a-z0-9-]+$/.test(p)) {
    checkUnknownKeys(where, ext, ["nshEasing"], problems);
    if (!easingNames.includes(ext.nshEasing as (typeof easingNames)[number])) {
      problems.push(`${where}.nshEasing: ${JSON.stringify(ext.nshEasing)} is not in easingNames`);
    }
    return;
  }

  if (/^shadow\.[a-z0-9.-]+$/.test(p)) {
    checkUnknownKeys(where, ext, ["none"], problems);
    if ("none" in ext && ext.none !== true) {
      problems.push(`${where}.none must be true`);
    }
    return;
  }

  if (/^finish\.[A-Za-z0-9-]+$/.test(p)) {
    checkUnknownKeys(where, ext, ["backdropFilter", "material", "elevation"], problems);
    if ("backdropFilter" in ext && !isNonEmptyString(ext.backdropFilter)) {
      problems.push(`${where}.backdropFilter must be a non-empty string`);
    }
    if (
      "elevation" in ext &&
      (typeof ext.elevation !== "number" || !Number.isFinite(ext.elevation) || ext.elevation < 0)
    ) {
      problems.push(`${where}.elevation must be a non-negative number`);
    }
    return;
  }

  if (/^finish\.[A-Za-z0-9-]+\.gradient$/.test(p)) {
    checkUnknownKeys(where, ext, ["angle", "transparentStops"], problems);
    if (typeof ext.angle !== "number" || !Number.isFinite(ext.angle)) {
      problems.push(`${where}.angle must be a finite number`);
    }
    if ("transparentStops" in ext) {
      const stopLen = Array.isArray(node.$value) ? node.$value.length : 0;
      if (
        !Array.isArray(ext.transparentStops) ||
        ext.transparentStops.some(
          (i) => !Number.isInteger(i) || i < 0 || (stopLen > 0 && i >= stopLen),
        )
      ) {
        problems.push(`${where}.transparentStops must contain valid gradient stop indices`);
      }
    }
    return;
  }

  if (/^finish\.[A-Za-z0-9-]+\.shadow$/.test(p)) {
    problems.push(
      `${where}: a finish names the shadow scale's parts and writes no shadow of its own`,
    );
    return;
  }

  if (
    /^finish\.[A-Za-z0-9-]+\.(?:background|foreground|border-color|border-top-color|border-bottom-color)$/.test(
      p,
    )
  ) {
    checkUnknownKeys(where, ext, ["transparentKeyword", "colorOp"], problems);
    if ("transparentKeyword" in ext && ext.transparentKeyword !== true) {
      problems.push(`${where}.transparentKeyword must be true`);
    }
    if ("colorOp" in ext) validateColorOpShape(where, ext.colorOp, problems);
    return;
  }

  if (/^color\.[a-z0-9-]+$/.test(p)) {
    checkUnknownKeys(where, ext, ["colorOp", "role"], problems);
    if ("colorOp" in ext) validateColorOpShape(where, ext.colorOp, problems);
    if ("role" in ext) {
      if (!COLOR_ROLES.includes(ext.role as ColorRole)) {
        problems.push(
          `${where}.role: ${JSON.stringify(ext.role)} must be one of ${COLOR_ROLES.join(", ")}`,
        );
      }
    }
    return;
  }

  if (p === "") {
    checkUnknownKeys(where, ext, ["designMd"], problems);
    if ("designMd" in ext) validateDesignMdExt(`${where}.designMd`, ext.designMd, problems);
    return;
  }

  problems.push(`${label}: unexpected $extensions at "${p || "#"}"`);
}

function validateDesignMdExt(where: string, val: unknown, problems: string[]): void {
  if (!isRecord(val)) {
    problems.push(`${where} must be an object`);
    return;
  }
  checkUnknownKeys(
    where,
    val,
    ["overview", "elevation", "dos", "donts", "sharedDos", "sharedDonts", "voiceOmitted"],
    problems,
  );
  for (const strKey of ["overview", "elevation", "voiceOmitted"] as const) {
    if (strKey in val && !isNonEmptyString(val[strKey])) {
      problems.push(`${where}.${strKey} must be a non-empty string`);
    }
  }
  for (const listKey of ["dos", "donts", "sharedDos", "sharedDonts"] as const) {
    if (listKey in val) {
      const arr = val[listKey];
      if (!Array.isArray(arr) || arr.some((item) => !isNonEmptyString(item))) {
        problems.push(`${where}.${listKey} must be an array of non-empty strings`);
      }
    }
  }
}

function validateColorOpShape(where: string, op: unknown, problems: string[]): void {
  if (!isRecord(op)) {
    problems.push(`${where}.colorOp must be an object`);
    return;
  }
  if (op.op === "mix") {
    checkUnknownKeys(`${where}.colorOp`, op, ["op", "space", "a", "percent", "b"], problems);
    if (op.space !== "srgb") {
      problems.push(`${where}.colorOp.space must be "srgb"`);
    }
    if (
      typeof op.percent !== "number" ||
      !Number.isFinite(op.percent) ||
      op.percent < 0 ||
      op.percent > 100
    ) {
      problems.push(`${where}.colorOp.percent must be a number in [0, 100]`);
    }
    if (typeof op.a !== "string" && !isRecord(op.a)) {
      problems.push(`${where}.colorOp.a must be a color ref or DTCG color object`);
    }
    if (typeof op.b !== "string" && !isRecord(op.b)) {
      problems.push(`${where}.colorOp.b must be a color ref, "transparent", or DTCG color object`);
    }
  } else if (op.op === "alpha") {
    checkUnknownKeys(`${where}.colorOp`, op, ["op", "color", "alpha"], problems);
    if (typeof op.color !== "string") {
      problems.push(`${where}.colorOp.color must be a "{color.*}" reference`);
    }
    if (
      typeof op.alpha !== "number" ||
      !Number.isFinite(op.alpha) ||
      op.alpha < 0 ||
      op.alpha > 1
    ) {
      problems.push(`${where}.colorOp.alpha must be a number in [0, 1]`);
    }
  } else {
    problems.push(`${where}.colorOp.op must be "mix" or "alpha"`);
  }
}

function checkColorOpAccuracy(
  label: string,
  merged: Record<string, unknown>,
  resolved: Record<string, unknown>,
  tokenTypes: Map<string, string>,
  problems: string[],
): void {
  const resolveColorOperand = (where: string, operand: unknown): DtcgColor | null => {
    if (typeof operand === "string") {
      const target = checkTypedRef(where, operand, "color", tokenTypes, problems);
      if (!target) return null;
      const tok = getAtPath(resolved, target);
      return isTokenNode(tok) && isRecord(tok.$value) ? (tok.$value as unknown as DtcgColor) : null;
    }
    return isRecord(operand) ? (operand as unknown as DtcgColor) : null;
  };

  const walk = (node: Record<string, unknown>, rNode: Record<string, unknown>, p: string) => {
    if (isTokenNode(node)) {
      const ext = getExt(node);
      if (ext && isRecord(ext.colorOp)) {
        const op = ext.colorOp as unknown as ColorOpExtension;
        const where = `${label}: ${p}`;
        let expected: DtcgColor | null = null;
        if (op.op === "mix") {
          const a = resolveColorOperand(`${where} colorOp.a`, op.a);
          const b =
            op.b === "transparent"
              ? ("transparent" as const)
              : resolveColorOperand(`${where} colorOp.b`, op.b);
          if (a && b) expected = evaluateColorMix(a, op.percent, b);
        } else if (op.op === "alpha") {
          const base = resolveColorOperand(`${where} colorOp.color`, op.color);
          if (base) expected = { ...base, alpha: op.alpha };
        }

        if (expected) {
          const actual = rNode.$value as unknown as DtcgColor;
          if (!isRecord(actual) || !Array.isArray(actual.components)) {
            problems.push(`${where}: colorOp token static $value must be a DTCG color object`);
          } else {
            const maxDelta = Math.max(
              Math.abs(actual.components[0] - expected.components[0]),
              Math.abs(actual.components[1] - expected.components[1]),
              Math.abs(actual.components[2] - expected.components[2]),
              Math.abs((actual.alpha ?? 1) - (expected.alpha ?? 1)),
            );
            const rgbA = oklchToRgb(
              actual.components[0],
              actual.components[1],
              actual.components[2],
              actual.alpha ?? 1,
            );
            const rgbE = oklchToRgb(
              expected.components[0],
              expected.components[1],
              expected.components[2],
              expected.alpha ?? 1,
            );
            if (maxDelta > 1e-4 || rgbA.r !== rgbE.r || rgbA.g !== rgbE.g || rgbA.b !== rgbE.b) {
              problems.push(
                `${where}: static $value differs from live colorOp evaluation (delta=${maxDelta})`,
              );
            }
          }
        }
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (isRecord(v)) {
        const nextR = isRecord(rNode[k]) ? (rNode[k] as Record<string, unknown>) : {};
        walk(v, nextR, p ? `${p}.${k}` : k);
      }
    }
  };
  walk(merged, resolved, "");
}

function checkReferenceTypes(
  label: string,
  merged: Record<string, unknown>,
  tokenTypes: Map<string, string>,
  problems: string[],
): void {
  const checkIfRef = (where: string, val: unknown, expectedType: string) => {
    if (typeof val === "string" && val.startsWith("{")) {
      checkTypedRef(where, val, expectedType, tokenTypes, problems);
    }
  };

  const walk = (node: Record<string, unknown>, p: string) => {
    if (isTokenNode(node)) {
      const ownType = tokenTypes.get(p);
      const val = node.$value;
      if (typeof val === "string") {
        if (val.startsWith("{") && ownType) {
          checkTypedRef(`${label}: ${p}`, val, ownType, tokenTypes, problems);
        }
      } else if (ownType === "typography" && isRecord(val)) {
        checkIfRef(`${label}: ${p}.fontFamily`, val.fontFamily, "fontFamily");
        checkIfRef(`${label}: ${p}.fontSize`, val.fontSize, "dimension");
        checkIfRef(`${label}: ${p}.lineHeight`, val.lineHeight, "number");
      } else if (ownType === "transition" && isRecord(val)) {
        checkIfRef(`${label}: ${p}.duration`, val.duration, "duration");
        checkIfRef(`${label}: ${p}.delay`, val.delay, "duration");
        checkIfRef(`${label}: ${p}.timingFunction`, val.timingFunction, "cubicBezier");
      } else if (ownType === "gradient" && Array.isArray(val)) {
        val.forEach((stop, i) => {
          if (isRecord(stop)) checkIfRef(`${label}: ${p}[${i}].color`, stop.color, "color");
        });
      } else if (ownType === "shadow") {
        const items = Array.isArray(val) ? val : [val];
        items.forEach((item, i) => {
          if (!isRecord(item)) return;
          checkIfRef(`${label}: ${p}[${i}].color`, item.color, "color");
          for (const k of ["offsetX", "offsetY", "blur", "spread"] as const) {
            checkIfRef(`${label}: ${p}[${i}].${k}`, item[k], "dimension");
          }
        });
      } else if (ownType === "border" && isRecord(val)) {
        checkIfRef(`${label}: ${p}.color`, val.color, "color");
        checkIfRef(`${label}: ${p}.width`, val.width, "dimension");
      }
      return;
    }

    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      if (isRecord(v)) walk(v, p ? `${p}.${k}` : k);
    }
  };
  walk(merged, "");
}

/** The parts a theme's shadow scale may hold: four levels, one inset, two edges (7 at most). */
const SHADOW_LEVELS = ["sm", "md", "lg", "xl", "inset"] as const;
const SHADOW_EDGES = ["surface", "accent"] as const;
const FINISH_ROLES_MAX = 12;

function scaleParts(node: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(node).flatMap(([k, v]) => {
    if (k.startsWith("$") || !isRecord(v)) return [];
    const name = prefix ? `${prefix}.${k}` : k;
    return isTokenNode(v) ? [name] : scaleParts(v, name);
  });
}

/**
 * The layers: a theme's `shadow` scale is small and named (`sm`…`xl`, `inset`, up to two `edge`s),
 * every finish names parts of it instead of writing a shadow, and no finish paints a gradient of
 * one colour twice.
 */
function checkFinishLayers(
  label: string,
  merged: Record<string, unknown>,
  problems: string[],
): void {
  const scale = isRecord(merged.shadow) ? merged.shadow : {};
  const parts = scaleParts(scale);
  const allowed = new Set<string>([...SHADOW_LEVELS, ...SHADOW_EDGES.map((e) => `edge.${e}`)]);
  for (const part of parts) {
    if (!allowed.has(part)) {
      problems.push(`${label}: shadow.${part} is not a scale part (${[...allowed].join(", ")})`);
    }
  }
  if (parts.length > 7) {
    problems.push(`${label}: the shadow scale has ${parts.length} parts, more than 7`);
  }

  const finishes = isRecord(merged.finish) ? merged.finish : {};
  const roles = Object.keys(finishes).filter((k) => !k.startsWith("$"));
  if (roles.length > FINISH_ROLES_MAX) {
    problems.push(`${label}: ${roles.length} finishes, more than ${FINISH_ROLES_MAX}`);
  }
  for (const role of roles) {
    const node = finishes[role];
    if (!isRecord(node)) continue;
    const shadow = node.shadow;
    if (!isTokenNode(shadow)) {
      problems.push(`${label}: finish.${role} has no shadow`);
      continue;
    }
    const value = shadow.$value;
    const refs = Array.isArray(value) ? value : [value];
    if (!refs.every((r) => typeof r === "string" && /^\{shadow\.[a-z0-9.-]+\}$/.test(r))) {
      problems.push(
        `${label}: finish.${role}.shadow writes its own shadow; name the scale's parts instead, like ["{shadow.edge.surface}", "{shadow.sm}"]`,
      );
      continue;
    }
    for (const ref of refs as string[]) {
      const part = ref.slice("{shadow.".length, -1);
      if (!parts.includes(part)) {
        problems.push(
          `${label}: finish.${role}.shadow names {shadow.${part}}, which this theme's scale does not define`,
        );
      }
    }

    const gradient = node.gradient;
    if (isTokenNode(gradient) && Array.isArray(gradient.$value)) {
      const stops = gradient.$value.filter(isRecord).map((stop) => JSON.stringify(stop.color));
      if (stops.length > 1 && new Set(stops).size === 1) {
        problems.push(
          `${label}: finish.${role}.gradient is one colour from top to bottom — write a flat fill instead`,
        );
      }
    }
  }
}

function checkMergedSemantics(
  label: string,
  merged: Record<string, unknown>,
  resolved: Record<string, unknown>,
  tokenTypes: Map<string, string>,
  requireDescriptions: boolean,
  problems: string[],
): void {
  // Typography: one family for every role, from `font.family.sans`; and whitelisted weights
  const typoGroup = merged.typography;
  if (isRecord(typoGroup)) {
    const ext = getExt(typoGroup);
    if (ext && "fontFamily" in ext) {
      problems.push(
        `${label}: typography.$extensions.fontFamily is gone — every role's fontFamily is \`{font.family.sans}\``,
      );
    }
    for (const role of TYPE_ROLES) {
      const tok = typoGroup[role];
      if (!isTokenNode(tok) || !isRecord(tok.$value)) continue;
      if (!whitelists["typography.*.fontWeight"]!.includes(tok.$value.fontWeight as number)) {
        problems.push(
          `${label}: typography.${role}.fontWeight is ${JSON.stringify(tok.$value.fontWeight)}, not in whitelist`,
        );
      }
      if (tok.$value.fontFamily !== "{font.family.sans}") {
        problems.push(
          `${label}: typography.${role}.fontFamily is ${JSON.stringify(tok.$value.fontFamily)}, not \`{font.family.sans}\``,
        );
      }
    }
  }

  // Radius tokens (only control, container, and modal must exist and be non-negative dimensions)
  const expectedRadiusKeys = new Set<string>(RADIUS_KEYS.map(({ dtcg }) => dtcg));
  const dimRadius = getAtPath(resolved, "dimension.radius");
  if (!isRecord(dimRadius)) {
    problems.push(`${label}: dimension.radius is missing`);
  } else {
    for (const k of Object.keys(dimRadius)) {
      if (!k.startsWith("$") && !expectedRadiusKeys.has(k)) {
        problems.push(`${label}: dimension.radius has unexpected key "${k}"`);
      }
    }
    for (const { dtcg } of RADIUS_KEYS) {
      const tok = dimRadius[dtcg];
      if (!isTokenNode(tok) || !isRecord(tok.$value)) {
        problems.push(`${label}: dimension.radius.${dtcg} is missing`);
        continue;
      }
      const val = tok.$value.value;
      if (typeof val !== "number" || !Number.isFinite(val) || val < 0) {
        problems.push(
          `${label}: dimension.radius.${dtcg} value ${JSON.stringify(val)} must be >= 0`,
        );
      }
    }
  }

  // Shape references (only control, container, and modal must exist and reference dimension tokens)
  const expectedShapeRoles = new Set<string>(shapeRadiusRoles);
  const dimShape = getAtPath(merged, "dimension.shape");
  if (isRecord(dimShape)) {
    for (const k of Object.keys(dimShape)) {
      if (!k.startsWith("$") && !expectedShapeRoles.has(k)) {
        problems.push(`${label}: dimension.shape has unexpected key "${k}"`);
      }
    }
    for (const role of shapeRadiusRoles) {
      const tok = dimShape[role];
      if (!isTokenNode(tok)) {
        problems.push(`${label}: dimension.shape.${role} is missing`);
        continue;
      }
      const target = checkTypedRef(
        `${label}: dimension.shape.${role}`,
        tok.$value,
        "dimension",
        tokenTypes,
        problems,
      );
      if (target && !target.startsWith("dimension.radius.")) {
        problems.push(
          `${label}: dimension.shape.${role} must reference dimension.radius.*, got {${target}}`,
        );
      }
    }
  }

  // State press-scale, unit-interval opacities, and non-negative numeric dimensions/durations
  const pressScaleTok = getAtPath(resolved, "state.press-scale");
  if (isTokenNode(pressScaleTok) && !isValidPressScale(pressScaleTok.$value)) {
    problems.push(
      `${label}: state.press-scale is ${JSON.stringify(pressScaleTok.$value)}, not in (0, 1]`,
    );
  }
  for (const unitPath of [
    "state.overlay.hover",
    "state.overlay.focus",
    "state.overlay.pressed",
    "state.overlay.dragged",
    "state.pressed-opacity",
    "state.disabled.content",
  ]) {
    const tok = getAtPath(resolved, unitPath);
    if (isTokenNode(tok)) {
      const val = tok.$value;
      if (typeof val !== "number" || !Number.isFinite(val) || val < 0 || val > 1) {
        problems.push(`${label}: ${unitPath} is ${JSON.stringify(val)}, not in [0, 1]`);
      }
    }
  }
  const disabledNode = getAtPath(resolved, "state.disabled") as Record<string, unknown> | undefined;
  const disabledExt = (disabledNode?.$extensions as Record<string, unknown> | undefined)?.[
    EXT_NS
  ] as Record<string, unknown> | undefined;
  if (typeof disabledExt?.fill !== "boolean") {
    problems.push(`${label}: state.disabled.$extensions.${EXT_NS}.fill must be a boolean`);
  }
  for (const dimGroupPath of [
    "dimension.stroke",
    "dimension.focus",
    "dimension.size",
    "dimension.icon",
  ]) {
    const group = getAtPath(resolved, dimGroupPath);
    if (!isRecord(group)) continue;
    const walkDim = (node: Record<string, unknown>, prefix: string) => {
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith("$")) continue;
        const p = `${prefix}.${k}`;
        if (isTokenNode(v) && isRecord(v.$value)) {
          const val = v.$value.value;
          if (typeof val !== "number" || !Number.isFinite(val) || val < 0) {
            problems.push(`${label}: ${p} value ${JSON.stringify(val)} must be >= 0`);
          }
        } else if (isRecord(v)) {
          walkDim(v, p);
        }
      }
    };
    walkDim(group, dimGroupPath);
  }
  // Motion roles: spring OR timing (never mixed, never missing)
  const motionGroup = merged.motion;
  if (isRecord(motionGroup)) {
    for (const role of motionRoleNames) {
      const roleNode = motionGroup[role];
      if (!isRecord(roleNode)) {
        problems.push(`${label}: motion.${role} is missing`);
        continue;
      }
      const ext = getExt(roleNode);
      const hasSpring = ext !== undefined && "spring" in ext;
      const hasTiming = "timing" in roleNode;
      if (hasSpring && hasTiming) {
        problems.push(`${label}: motion.${role} mixes spring extension and timing token`);
      } else if (!hasSpring && !hasTiming) {
        problems.push(
          `${label}: motion.${role} must declare either spring extension or timing token`,
        );
      } else if (hasTiming) {
        const timingResolved = getAtPath(resolved, `motion.${role}.timing`);
        const timingRaw = roleNode.timing;
        if (
          isTokenNode(timingRaw) &&
          isRecord(timingRaw.$value) &&
          isTokenNode(timingResolved) &&
          isRecord(timingResolved.$value)
        ) {
          const tfRef = timingRaw.$value.timingFunction;
          const bezierTarget = checkTypedRef(
            `${label}: motion.${role}.timing.timingFunction`,
            tfRef,
            "cubicBezier",
            tokenTypes,
            problems,
          );
          const durVal = isRecord(timingResolved.$value.duration)
            ? timingResolved.$value.duration.value
            : undefined;
          const easingName = bezierTarget?.replace(/^cubicBezier\./, "");
          problems.push(
            ...checkTimingSpec(label, `motion.${role}.timing`, {
              duration: durVal,
              timingFunction: easingName,
            }),
          );
        }
      }
    }
  }

  // transition.enter
  const enterRaw = getAtPath(merged, "transition.enter");
  const enterResolved = getAtPath(resolved, "transition.enter");
  if (
    isTokenNode(enterRaw) &&
    isRecord(enterRaw.$value) &&
    isTokenNode(enterResolved) &&
    isRecord(enterResolved.$value)
  ) {
    const bezierTarget = checkTypedRef(
      `${label}: transition.enter.timingFunction`,
      enterRaw.$value.timingFunction,
      "cubicBezier",
      tokenTypes,
      problems,
    );
    const durVal = isRecord(enterResolved.$value.duration)
      ? enterResolved.$value.duration.value
      : undefined;
    const easingName = bezierTarget?.replace(/^cubicBezier\./, "");
    problems.push(
      ...checkTimingSpec(label, "transition.enter", {
        duration: durVal,
        timingFunction: easingName,
      }),
    );
  }

  // Finish material (reusing scripts/theme/material.ts)
  const colorKinds = new Map<string, TokenKind>();
  for (const [k, t] of tokenTypes) {
    if (k.startsWith("color.") && t === "color") {
      colorKinds.set(k.slice("color.".length), "color");
    } else if (k.startsWith("dimension.radius.") && t === "dimension") {
      const sub = k.slice("dimension.radius.".length);
      colorKinds.set(`radius-${sub}`, "dimension");
    }
  }
  const finishGroup = merged.finish;
  if (isRecord(finishGroup)) {
    for (const [role, group] of Object.entries(finishGroup)) {
      if (role.startsWith("$") || !isRecord(group)) continue;
      const ext = getExt(group) ?? {};
      problems.push(
        ...checkMaterial(label, role, { material: ext.material, elevation: ext.elevation }),
      );
    }
  }

  // $description coverage
  if (requireDescriptions) {
    const colors = merged.color;
    if (isRecord(colors)) {
      for (const [name, tok] of Object.entries(colors)) {
        if (name.startsWith("$")) continue;
        if (isTokenNode(tok) && !isNonEmptyString(tok.$description)) {
          problems.push(`${label}: color.${name} is missing $description`);
        }
      }
    }
    if (isRecord(finishGroup)) {
      for (const [role, group] of Object.entries(finishGroup)) {
        if (role.startsWith("$") || !isRecord(group)) continue;
        if (!isNonEmptyString(group.$description)) {
          problems.push(`${label}: finish.${role} is missing $description`);
        }
      }
    }
    for (const groupPath of [
      "cubicBezier",
      "typography",
      "dimension.shape",
      "dimension.stroke",
      "dimension.focus",
      "dimension.control",
      "dimension.size",
      "dimension.icon",
      "shape",
      "state",
      "duration",
      "transition",
      "motion",
      "controls",
    ]) {
      const group = getAtPath(merged, groupPath);
      if (isRecord(group) && !isNonEmptyString(group.$description)) {
        problems.push(`${label}: ${groupPath} is missing $description`);
      }
    }
  }
}

/** Lint one theme's DTCG resolver and all of its `(appearance, input)` permutations. */
export function lintDtcgTheme(
  resolverPath: string,
  options: { repoRoot?: string; requireDescriptions?: boolean } = {},
): string[] {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;
  const requireDescriptions = options.requireDescriptions ?? true;
  const relResolver = path.relative(repoRoot, resolverPath) || resolverPath;
  const problems: string[] = [];

  let doc: ResolverDoc;
  try {
    doc = JSON.parse(fs.readFileSync(resolverPath, "utf8")) as ResolverDoc;
  } catch (err) {
    return [
      `${relResolver}: failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`,
    ];
  }

  for (const err of validateResolverDocument(doc)) {
    problems.push(`${relResolver} (${err.path}): ${err.message}`);
  }

  // Verify every $ref in sets and modifiers exists.
  const dir = path.dirname(path.resolve(resolverPath));
  const checkRefsExist = (items: unknown, loc: string) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (isRecord(item) && typeof item.$ref === "string" && !item.$ref.startsWith("#")) {
        const target = path.resolve(dir, item.$ref);
        if (!fs.existsSync(target)) {
          problems.push(`${relResolver}: ${loc} references missing file ${item.$ref}`);
        }
      }
    }
  };
  for (const [name, set] of Object.entries(doc.sets ?? {})) {
    checkRefsExist(set.sources, `sets.${name}`);
  }
  for (const [name, mod] of Object.entries(doc.modifiers ?? {})) {
    for (const [ctx, items] of Object.entries(mod.contexts ?? {})) {
      checkRefsExist(items, `modifiers.${name}.contexts.${ctx}`);
    }
  }

  if (problems.length > 0) return problems;

  const appearances = Object.keys(doc.modifiers?.appearance?.contexts ?? { light: [] });
  const inputs = Object.keys(doc.modifiers?.input?.contexts ?? { pointer: [] });

  for (const appearance of appearances) {
    for (const input of inputs) {
      const label = `${relResolver} (${appearance}, ${input})`;
      let merged: Record<string, unknown>;
      let resolved: Record<string, unknown>;
      try {
        ({ merged, resolved } = resolvePermutation(resolverPath, { appearance, input }));
      } catch (err) {
        problems.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
        continue;
      }

      for (const err of validateTokensDocument(resolved)) {
        problems.push(`${label} resolved (${err.path}): ${err.message}`);
      }

      const tokenTypes = collectTokenTypes(merged);
      checkExtensionNodes(label, merged, problems, "merged");
      checkReferenceTypes(label, merged, tokenTypes, problems);
      checkColorOpAccuracy(label, merged, resolved, tokenTypes, problems);
      checkFinishLayers(label, merged, problems);
      checkMergedSemantics(label, merged, resolved, tokenTypes, requireDescriptions, problems);
    }
  }

  // Also ensure `sets.theme` and `appearance` source files can load cleanly without errors.
  for (const src of doc.sets?.theme?.sources ?? []) {
    loadSourceItem(src, dir, doc);
  }

  return problems;
}

/** Lint every `.tokens.json` and `theme.resolver.json` under `packages/theme/tokens/`. */
export function lintDtcgSources(
  repoRoot = defaultRepoRoot,
  options: { requireDescriptions?: boolean } = {},
): { themes: string[]; tokenFiles: number; problems: string[] } {
  const tokensRoot = path.join(repoRoot, "packages/theme/tokens");
  const problems: string[] = [];
  const themes = discoverDtcgThemes(repoRoot);
  const tokenFiles = collectFiles(tokensRoot, ".tokens.json");

  // 1. Validate every `.tokens.json` file against official Format 2025.10 schema & $extensions rules.
  for (const file of tokenFiles) {
    const rel = path.relative(repoRoot, file);
    let doc: unknown;
    try {
      doc = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (err) {
      problems.push(`${rel}: invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }
    for (const err of validateTokensDocument(doc)) {
      problems.push(`${rel} (${err.path}): ${err.message}`);
    }
    if (isRecord(doc)) {
      checkExtensionNodes(rel, doc, problems, "source");
    }
  }

  // 2. Lint every theme's resolver and permutations, and verify no orphan `.tokens.json` exists.
  const referenced = new Set<string>();
  for (const themeId of themes) {
    const resolverPath = path.join(tokensRoot, "themes", themeId, "theme.resolver.json");
    try {
      const doc = JSON.parse(fs.readFileSync(resolverPath, "utf8")) as ResolverDoc;
      for (const ref of collectReferencedFiles(resolverPath, doc)) referenced.add(ref);
    } catch {
      // Parse error reported by lintDtcgTheme below.
    }
    problems.push(
      ...lintDtcgTheme(resolverPath, {
        repoRoot,
        requireDescriptions: options.requireDescriptions,
      }),
    );
  }

  for (const file of tokenFiles) {
    if (!referenced.has(path.resolve(file))) {
      problems.push(`${path.relative(repoRoot, file)}: not referenced by any theme.resolver.json`);
    }
  }

  return { themes, tokenFiles: tokenFiles.length, problems };
}
