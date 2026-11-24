/**
 * The slot list (`slots.ts`) as DTCG 2025.10 tokens, and back.
 *
 * A slot token states its value the way a theme's author does: a length as a `dimension`, a share as
 * a `number`, a switch as `yes` or `no`, and everything a name — a colour role, a finish field, a
 * corner keyword — as text in the slot grammar (`docs/specs/theme-slots.md`), because the format
 * has no type for either. A value that
 * depends on the input tier or on the appearance is one token whose `$extensions[EXT_NS]` carries the
 * other side (`touch`, `dark`): both sides stay in one place, so a theme that overrides a slot
 * overrides it once, and a theme that states nothing inherits both.
 *
 * Pure: no `node:fs`, so the tokens' lint and its unit test read the same code the build does.
 */
import { EXT_NS, isRecord, type DtcgDimension } from "../tokens/types";
import { SLOTS, type SlotKind, type SlotValue, type SlotSpec, isPair } from "./slots";

/** A colour a slot paints: a palette role, one field of a finish layer, nothing, or `keep` as it is. */
export type SlotFace =
  | { readonly colour: string; readonly alpha?: number }
  | { readonly tint: string; readonly alpha?: number }
  | { readonly finish: string; readonly field?: FinishField }
  | "none"
  | "keep";

/** The finish fields a slot may name, in the runtime's spelling (`finish.<role>.<field>`). */
export const FINISH_FIELDS = {
  background: "backgroundColor",
  "border-color": "borderColor",
  foreground: "foreground",
  shadow: "boxShadow",
} as const;
export type FinishField = (typeof FINISH_FIELDS)[keyof typeof FINISH_FIELDS];

/** A corner: the theme's control radius, a capsule, or points. */
export type SlotCorner = number | "control" | "full";

/** A face that paints something: the three object forms, without the two names. */
type PaintedFace = Exclude<SlotFace, "none" | "keep">;

/** What a slot compiles to: the value a component draws. */
export type CompiledSlot =
  | number
  | boolean
  | string
  | PaintedFace
  | null
  | { readonly pointer: CompiledSlot; readonly touch: CompiledSlot }
  | { readonly light: CompiledSlot; readonly dark: CompiledSlot };

/** A face as the slot grammar states it: `color:input@0.3`, `finish:fill`, `finish:inset:border-color`. */
export function parseFace(value: string): SlotFace {
  if (value === "none" || value === "keep") return value;
  const [scheme, role, field] = value.split(":");
  const [name, alpha] = (role ?? "").split("@");
  if (name === undefined || name === "") throw new Error(`a face is ${JSON.stringify(value)}`);
  if (scheme === "tint") {
    return alpha === undefined ? { tint: name } : { tint: name, alpha: Number.parseFloat(alpha) };
  }
  if (scheme === "color") {
    return alpha === undefined
      ? { colour: name }
      : { colour: name, alpha: Number.parseFloat(alpha) };
  }
  if (scheme === "finish") {
    if (field === undefined) return { finish: name };
    const runtime = FINISH_FIELDS[field as keyof typeof FINISH_FIELDS];
    if (runtime === undefined) {
      throw new Error(
        `a finish field is ${JSON.stringify(field)}, not one of ${Object.keys(FINISH_FIELDS).join(", ")}`,
      );
    }
    return { finish: name, field: runtime };
  }
  throw new Error(`${JSON.stringify(value)} is not a face: it starts color:, tint:, or finish:`);
}

/** The face a value compiles to, per appearance, read from one token's `$value` and `dark` extension. */
function faceValue(spec: SlotSpec, value: SlotValue): CompiledSlot {
  if (isPair(value)) {
    const pair = value as Record<string, SlotValue>;
    return {
      light: faceValue(spec, pair.light!),
      dark: faceValue(spec, pair.dark!),
    };
  }
  if (typeof value !== "string") throw new Error(`${JSON.stringify(value)} is not a face`);
  if (spec.kind === "face") return parseFace(value);
  if (spec.kind === "shade") return value === "none" ? "none" : value.replace(/^shade:/, "").trim();
  if (spec.kind === "corner") {
    if (value === "control" || value === "full") return value;
    return Number.parseFloat(value);
  }
  return value;
}

/** One side of a value, in the form its token's `$value` takes. */
function encodeSide(spec: SlotSpec, value: string | number | boolean): unknown {
  switch (spec.kind) {
    case "px":
    case "corner":
      return typeof value === "number" ? { value, unit: "px" } : value;
    case "ratio":
      return typeof value === "number" ? value : Number.parseFloat(String(value));
    case "shade":
      return value === null || value === "none" ? "none" : `shade:${String(value)}`;
    case "boolean":
      // The format has no boolean: a switch reads `yes` or `no`, as `docs/specs/theme-slots.md` says.
      return value === true || value === "yes" ? "yes" : "no";
    default:
      return value;
  }
}

/** The `$type` a slot's token states: a length or a corner states points, every other name is a string. */
/**
 * The DTCG type a slot's value is stated in, where the format has one: `dimension` for points and
 * `number` for a ratio. A face, a shade, a corner name, text, and a boolean state no type — the
 * format has none for them, and `SLOTS` is their type.
 */
function slotType(kind: SlotKind, value: unknown): string | null {
  if (kind === "ratio") return "number";
  if (kind === "px" || kind === "corner") return typeof value === "number" ? "dimension" : null;
  return null;
}

/** A value and the other side of the pair it is stated as (or none). */
function sidesOf(value: SlotValue): {
  main: string | number | boolean;
  rest?: string | number | boolean;
  axis: "touch" | "dark";
} {
  if (!isPair(value)) {
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      throw new Error(`${JSON.stringify(value)} is not a slot value`);
    }
    return { main: value, axis: "dark" };
  }
  const pair = value as Record<string, SlotValue>;
  const tiered = Object.hasOwn(pair, "pointer");
  const [main, rest] = tiered ? [pair.pointer, pair.touch] : [pair.light, pair.dark];
  if (main === undefined || rest === undefined || isPair(main) || isPair(rest)) {
    throw new Error(`${JSON.stringify(value)} states a pair inside a pair`);
  }
  return {
    main: main as string | number | boolean,
    rest: rest as string | number | boolean,
    axis: tiered ? "touch" : "dark",
  };
}

/** The token a slot states: its value, its type, and the other side of a tier or appearance pair. */
export function encodeSlotToken(path: string, value: SlotValue): Record<string, unknown> {
  const spec = SLOTS[path];
  if (spec === undefined) throw new Error(`${path} is not a slot`);
  const { main, rest, axis } = sidesOf(value);
  const type = slotType(spec.kind, main);
  const node: Record<string, unknown> = {
    ...(type === null ? {} : { $type: type }),
    $value: encodeSide(spec, main),
    $description: spec.doc,
  };
  if (rest !== undefined) {
    node.$extensions = { [EXT_NS]: { [axis]: encodeSide(spec, rest) } };
  }
  return node;
}

/** Every slot as one nested `slot` group: the base source every theme inherits. */
export function slotsDoc(values: Readonly<Record<string, SlotValue>>): Record<string, unknown> {
  return {
    slot: {
      $description:
        "Control slots: the values every component draws its control from (docs/specs/theme-slots.md). A theme overrides the ones it answers differently.",
      ...nestTokens(values),
    },
  };
}

/** Slot tokens by dotted path, nested the way DTCG groups them. */
function nestTokens(values: Readonly<Record<string, SlotValue>>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(values)) {
    const groups = path.split(".");
    let node = out;
    for (const group of groups.slice(0, -1)) {
      const next = (node[group] ??= {}) as Record<string, unknown>;
      node = next;
    }
    node[groups.at(-1)!] = encodeSlotToken(path, value);
  }
  return out;
}

/** Only the slots a theme answers differently from the base, as a nested `slot` group. */
export function slotOverridesDoc(
  values: Readonly<Record<string, SlotValue>>,
  base: Readonly<Record<string, SlotValue>>,
): Record<string, unknown> | null {
  const overrides: Record<string, SlotValue> = {};
  for (const [path, value] of Object.entries(values)) {
    if (JSON.stringify(value) !== JSON.stringify(base[path])) overrides[path] = value;
  }
  const keys = Object.keys(overrides);
  if (keys.length === 0) return null;
  return nestTokens(overrides);
}

/** The sides a slot token states, read back: `[value, other]`, where `other` is the touch or dark side. */
function decodeSides(
  node: Record<string, unknown>,
): [unknown, { touch?: unknown; dark?: unknown }] {
  const ext = isRecord(node.$extensions)
    ? (node.$extensions as Record<string, Record<string, unknown>>)[EXT_NS]
    : undefined;
  const other: { touch?: unknown; dark?: unknown } = {};
  if (isRecord(ext)) {
    if (ext.touch !== undefined) other.touch = ext.touch;
    if (ext.dark !== undefined) other.dark = ext.dark;
  }
  return [node.$value, other];
}

/** A length side, as a number (`"none"` stays the name a part reads as "not drawn"). */
function length(side: unknown): number | "none" {
  if (typeof side === "number") return side;
  if (side === "none") return "none";
  if (isRecord(side) && typeof side.value === "number") return side.value;
  throw new Error(`${JSON.stringify(side)} is not a length`);
}

/** A share, as a number. */
function share(side: unknown): number {
  if (typeof side === "number") return side;
  if (isRecord(side) && typeof side.value === "number") return side.value;
  throw new Error(`${JSON.stringify(side)} is not a number`);
}

/** One side of a slot as the runtime draws it. */
function decodeSide(spec: SlotSpec, side: unknown): CompiledSlot {
  switch (spec.kind) {
    case "px":
      // `control` is the theme's own control stroke, so a host that reshapes `stroke.control` moves
      // the edge with it (HEAD's `width: "stroke.control"`).
      return side === "control" ? "control" : length(side);
    case "ratio":
      return share(side);
    case "boolean":
      return side === true || side === "yes";
    case "corner":
      return typeof side === "string" ? side : share(side);
    case "text":
      return String(side);
    default:
      return faceValue(spec, side as SlotValue);
  }
}

/** A slot token as the runtime draws it: one value, or one per tier or appearance. */
export function decodeSlotToken(path: string, node: Record<string, unknown>): CompiledSlot {
  const spec = SLOTS[path];
  if (spec === undefined) throw new Error(`${path} is not a slot`);
  const [value, other] = decodeSides(node);
  if (other.touch !== undefined) {
    return {
      pointer: decodeSide(spec, value),
      touch: decodeSide(spec, other.touch),
    };
  }
  if (other.dark !== undefined) {
    return {
      light: decodeSide(spec, value),
      dark: decodeSide(spec, other.dark),
    };
  }
  return decodeSide(spec, value);
}

/** The `slot` group of a merged token tree, as runtime values by dotted path. */
export function readSlots(tree: Record<string, unknown>): Record<string, CompiledSlot> {
  const group = tree.slot;
  if (!isRecord(group)) throw new Error("the token tree states no slot group");
  const out: Record<string, CompiledSlot> = {};
  const walk = (node: Record<string, unknown>, prefix: string): void => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith("$")) continue;
      const path = prefix === "" ? key : `${prefix}.${key}`;
      if (isRecord(child) && "$value" in child) out[path] = decodeSlotToken(path, child);
      else if (isRecord(child)) walk(child, path);
    }
  };
  walk(group as Record<string, unknown>, "");
  return out;
}

/** Every slot a tree states that the list has no row for. */
export function unknownSlotPaths(flat: Readonly<Record<string, unknown>>): string[] {
  return Object.keys(flat).filter((path) => !Object.hasOwn(SLOTS, path));
}

/** A dimension token's points. */
export function points(value: unknown): number {
  const dim = value as DtcgDimension | undefined;
  if (isRecord(dim) && typeof dim.value === "number") return dim.value;
  if (typeof value === "number") return value;
  throw new Error(`${JSON.stringify(value)} is not a dimension`);
}
