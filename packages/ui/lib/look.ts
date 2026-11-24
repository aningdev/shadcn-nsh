// A theme's control slots drawn out: the parts a field, a choice, a slider and a groove have
// (`docs/specs/theme-slots.md`, ADR 0013). No value here names a form: a slot at its edge — a `0`
// width, a `none` face, a bottom corner of `0` — is what makes an underline, an outline or a
// capsule, so this module asks the theme's values and never a theme's name.
//
// Reactive: every reader below calls `slots()` (or `style()`), so a part drawn in JSX follows
// `selectTheme`. What comes back is a role a part paints (`painted`, `edged`, `inked`) and the
// numbers it lays out with.

import {
  CAPSULE_RADIUS,
  type FaceRole,
  type FinishRole,
  type Palette,
  type SlotFace,
  type SlotValue,
  type Tiered,
  alpha,
  colors,
  finish,
  isDark,
  shape,
  slots,
  style,
  tints,
} from "@shadcn-nsh/theme";

/** A palette role a part reads: `colors[role]`. */
export type ColourRole = keyof Palette;

/** A tint a part reads: `tints[role]`. */
export type TintRole = "brand";

/** The property of a finish layer a part paints: a fill's background, an edge's line, a glyph's ink. */
export type FillField = "backgroundColor" | "borderColor" | "foreground";

/** What fills a part: a finish layer, a palette role, or a tint. */
export type Fill =
  | { readonly kind: "finish"; readonly role: FaceRole; readonly field?: FillField }
  | { readonly kind: "colour"; readonly role: ColourRole; readonly alpha?: number }
  | { readonly kind: "tint"; readonly role: TintRole; readonly alpha?: number };

/** A part's edge: how wide it is and what it is drawn in. */
export interface Edge {
  readonly width: number;
  readonly fill: Fill;
}

/**
 * One layer of a finish as a plain record, so a field the type does not name reads as undefined.
 * Copied, never the shared object the theme hands out.
 */
const layer = (role: FaceRole): Record<string, string | undefined> =>
  ({ ...finish[role] }) as unknown as Record<string, string | undefined>;

/** A face's whole layer, where a part wears all of it: a finish's background, edge, shade and gradient. */
export function fillOf(fill: Fill): import("nsh").ViewStyle {
  switch (fill.kind) {
    case "finish":
      return { ...layer(fill.role) } as unknown as import("nsh").ViewStyle;
    case "colour":
      return { backgroundColor: painted(fill) };
    case "tint":
      return { backgroundColor: painted(fill) };
  }
}

/** A palette role as the class that paints it: `mutedForeground` → `muted-foreground`. */
const kebab = (role: string): string => role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * A frame's edge as the class that paints it, for the wells drawn in classes (a number input, a time
 * field): the palette role the theme names, which its own tokens resolve, so the class follows
 * `selectTheme`. A frame's edge is a role, never a finish or an alpha.
 */
export function borderClass(fill: Fill | null, edge: "border" | "border-b" = "border"): string {
  if (fill === null) return `${edge}-transparent`;
  if (fill.kind !== "colour" || fill.alpha !== undefined) {
    throw new Error(`a field's edge names a palette colour, not ${JSON.stringify(fill)}`);
  }
  return `${edge}-${kebab(fill.role)}`;
}

/** Whether two fills paint the same colour, so a box's sides and its bottom edge read as one. */
export function sameFill(a: Fill | null, b: Fill | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** What a part fills with: a finish's background, a colour, or a tint (`transparent` where it has none). */
export function painted(fill: Fill | null): string {
  if (fill === null) return "transparent";
  switch (fill.kind) {
    case "finish":
      return layer(fill.role)[fill.field ?? "backgroundColor"] ?? "transparent";
    case "colour":
      return fill.alpha === undefined ? colors[fill.role] : alpha(colors[fill.role], fill.alpha);
    case "tint":
      return fill.alpha === undefined ? tints[fill.role] : alpha(tints[fill.role], fill.alpha);
  }
}

/** What a part's edge is drawn in: a finish's line, a colour, or a tint (the `border` role where a finish has no line). */
export function edged(fill: Fill | null): string {
  if (fill === null) return "transparent";
  switch (fill.kind) {
    case "finish": {
      const line = layer(fill.role)[fill.field ?? "borderColor"];
      return line ?? (fill.field === undefined ? colors.border : "transparent");
    }
    case "colour":
      return fill.alpha === undefined ? colors[fill.role] : alpha(colors[fill.role], fill.alpha);
    case "tint":
      return fill.alpha === undefined ? tints[fill.role] : alpha(tints[fill.role], fill.alpha);
  }
}

/** What a part's ink is: a finish's `foreground`, or the colour itself (`null` where it has none). */
export function inked(fill: Fill | null): string | null {
  if (fill === null) return null;
  if (fill.kind !== "finish") return painted(fill);
  const ink = layer(fill.role)[fill.field ?? "foreground"];
  return ink ?? null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** A slot's value, as this theme states it: a slot every theme states, so a missing one is a theme bug. */
function value(path: string): SlotValue {
  const found = slots()[path];
  if (found === undefined) throw new Error(`the theme states no \`${path}\` slot`);
  return found;
}

/** A slot's points. */
function points(path: string): number {
  const found = value(path);
  if (typeof found !== "number") {
    throw new Error(`the theme's \`${path}\` slot is not in points: ${JSON.stringify(found)}`);
  }
  return found;
}

/** A slot's points, where `control` names the theme's own control stroke. */
function width(path: string): number {
  return value(path) === "control" ? style().dimension.stroke.control : points(path);
}

/** A slot's points, per input tier. */
function pointsPerTier(path: string): Tiered<number> {
  const found = value(path);
  const record = isRecord(found) ? (found as Record<string, unknown>) : undefined;
  if (
    record === undefined ||
    typeof record.pointer !== "number" ||
    typeof record.touch !== "number"
  ) {
    throw new Error(`the theme's \`${path}\` slot is not per input: ${JSON.stringify(found)}`);
  }
  return { pointer: record.pointer, touch: record.touch };
}

/** A slot's points per input, where the theme may state one value for both (a width that does not change). */
function pointsPerInput(path: string): Tiered<number> {
  const found = value(path);
  if (typeof found === "number") return { pointer: found, touch: found };
  return pointsPerTier(path);
}

/** A slot's points per input, or 0 where the theme states none: 0 is the contract's "not drawn". */
function tieredPointsOrNone(path: string): Tiered<number> {
  const found = value(path);
  if (found === "none") return { pointer: 0, touch: 0 };
  return pointsPerTier(path);
}

/** A slot's points, or `null` where the theme states `none`. */
function optionalPoints(path: string): number | null {
  const found = value(path);
  if (found === "none") return null;
  return points(path);
}

/** A slot's ratio. */
function ratio(path: string): number {
  return points(path);
}

/** A slot's flag. */
function flag(path: string): boolean {
  const found = value(path);
  if (typeof found !== "boolean") {
    throw new Error(`the theme's \`${path}\` slot is not a flag: ${JSON.stringify(found)}`);
  }
  return found;
}

/** The side a value names `full`, or the points it names. */
function cornerOf(face: SlotValue): number {
  if (face === "full") return CAPSULE_RADIUS;
  if (face === "control") return shape.control;
  if (typeof face === "number") return face;
  throw new Error(`the theme states no corner: ${JSON.stringify(face)}`);
}

/** A slot's corner, as points. */
function corner(path: string): number {
  return cornerOf(value(path));
}

/** A slot's corner, per input tier. */
function cornerPerTier(path: string): Tiered<number> {
  const found = value(path);
  if (!isRecord(found)) throw new Error(`the theme's \`${path}\` slot is not per input`);
  const { pointer, touch } = found as Record<string, SlotValue>;
  return { pointer: cornerOf(pointer), touch: cornerOf(touch) };
}

/** What a slot's face paints, per appearance where the theme states it per appearance. */
function paintedFace(face: SlotFace): Fill | null {
  if (face === "none" || face === "keep") return null;
  if ("finish" in face) return { kind: "finish", role: face.finish as FaceRole };
  if ("tint" in face) return { kind: "tint", role: face.tint as TintRole, alpha: face.alpha };
  return { kind: "colour", role: face.colour as ColourRole, alpha: face.alpha };
}

/** A slot's face: `null` where the theme paints none. */
function face(path: string): Fill | null {
  const found = value(path);
  if (isRecord(found) && ("light" in found || "dark" in found)) {
    const pair = found as Record<"light" | "dark", SlotFace>;
    return paintedFace(isDark() ? pair.dark : pair.light);
  }
  return paintedFace(found as SlotFace);
}

/** A slot's shade: the finish whose shadow a part wears, or `null`. */
function shade(path: string): FinishRole | null {
  const found = value(path);
  return found === "none" ? null : (found as FinishRole);
}

/** The frame a field draws: the edges it paints, their corners, and what each reads. */
export interface FieldLook {
  /** `bottom` where the theme draws one edge alone (an underline). */
  readonly edges: "all" | "bottom";
  /** The width of the edges it draws. */
  readonly width: number;
  /** The corner its sides cut, in points. */
  readonly radius: number;
  /** The corner its bottom cuts, in points (`0` where the bottom stays square). */
  readonly bottomRadius: number;
  /** What the sides read, where they are drawn (`null` where only the bottom edge is). */
  readonly side: Fill | null;
  /** What the bottom edge reads. */
  readonly bottom: Fill;
  /** The face of the box itself, where the consumer paints one (`null` where the control owns it). */
  readonly ground: Fill | null;
  /** The finish whose shade sinks the field, where it wears one. */
  readonly shade: FinishRole | null;
  /** Where the theme draws the focus as a line under the text rather than a changed edge. */
  readonly focusLine: boolean;
}

/** The field's frame, as the theme's `field.*` slots state it. */
export function fieldLook(): FieldLook {
  const edges = flag("field.edge.sides") ? "all" : "bottom";
  return {
    edges,
    width: width("field.edge.width"),
    radius: corner("field.corner.top"),
    bottomRadius: corner("field.corner.bottom"),
    side: edges === "all" ? face("field.edge.colour") : null,
    bottom: face("field.edge.bottom") ?? { kind: "colour", role: "input" },
    ground: face("field.face"),
    shade: shade("field.shade"),
    focusLine: flag("field.focus.line"),
  };
}

/** The parts a choice draws: a radio's well or a checkbox's box. */
export interface ChoiceLook {
  /** The face at rest, where the theme paints one. */
  readonly face: Fill | null;
  /** The finish whose shade the face wears, where it reads one it does not paint. */
  readonly shade: FinishRole | null;
  /** The face once chosen, where the theme turns the box over to a fill. */
  readonly checked: Fill | null;
  /** The edge, where the theme draws one. */
  readonly edge: Edge | null;
  /** The edge of a choice that cannot be used, where the theme states one. */
  readonly edgeDisabled: Edge | null;
  /** The box's corner, per input. */
  readonly corner: Tiered<number>;
  /** The chosen mark's inner disc, per input (a radio's dot); `0` where the theme draws none. */
  readonly dot: Tiered<number>;
  /** The disc's diameter under the pointer, where it grows. */
  readonly dotHover: number | null;
  /** The disc's diameter while pressed, where it shrinks. */
  readonly dotPressed: number | null;
  /** The box's diameter, per input. */
  readonly size: Tiered<number>;
  /** The state layer's diameter, where the theme asks for one. */
  readonly halo: number | null;
}

/** The parts a choice draws, as the theme's `choice.*` slots state them. */
export function choiceLook(): ChoiceLook {
  const thickness = width("choice.edge.width");
  const edgeFill = face("choice.edge.colour");
  const disabledFill = face("choice.edge.disabled");
  return {
    face: face("choice.face"),
    shade: shade("choice.shade"),
    checked: face("choice.checked.face"),
    edge: thickness === 0 || edgeFill === null ? null : { width: thickness, fill: edgeFill },
    edgeDisabled:
      thickness === 0 || disabledFill === null ? null : { width: thickness, fill: disabledFill },
    corner: cornerPerTier("choice.corner"),
    dot: tieredPointsOrNone("choice.mark.size"),
    dotHover: optionalPoints("choice.mark.hover"),
    dotPressed: optionalPoints("choice.mark.pressed"),
    size: pointsPerTier("choice.size"),
    halo: optionalPoints("choice.halo"),
  };
}

/** A groove or band a track's controls sit in: its face and the shade it wears. */
export interface Groove {
  readonly fill: Fill;
  /** The finish whose shade sinks or lifts the part, where two readers make its face. */
  readonly shade: FinishRole | null;
}

/** The parts a track draws: a progress bar's, a slider's and a spinner's shared track. */
export interface TrackLook {
  /** The groove, where the theme paints one. */
  readonly groove: Groove | null;
  /** The groove's own edge, where it draws one. */
  readonly edge: Edge | null;
  /** A progress bar: its run's height, and the line's height where it draws one inside it (`0` names none). */
  readonly progress: { readonly height: number; readonly line: number | null };
  /** A spinner: how faintly its arc's groove shows (`null` where it draws none). */
  readonly spinner: { readonly opacity: number | null };
}

/** The groove a track's controls sit in, as the theme's `progress.*` and `slider.*` slots state it. */
export function trackLook(part: "progress" | "slider"): TrackLook {
  const thickness = width(`${part}.edge.width`);
  const edgeFill = face(`${part}.edge.colour`);
  const groove = face(`${part}.face`);
  const opacity = optionalPoints("spinner.opacity");
  return {
    groove: groove === null ? null : { fill: groove, shade: shade(`${part}.shade`) },
    edge: thickness === 0 || edgeFill === null ? null : { width: thickness, fill: edgeFill },
    progress: {
      height: points("progress.height"),
      // A line's height is a measurement, so 0 is how a theme says it draws none.
      line: points("progress.line") || null,
    },
    spinner: { opacity: opacity === 0 ? null : ratio("spinner.opacity") },
  };
}

/** The parts a slider draws: its knob, the rail it runs on, and the band it keeps around it. */
export interface SliderLook {
  /** The rail's thickness, per input. */
  readonly rail: Tiered<number>;
  /** The band around the rail, per input. */
  readonly band: Tiered<number>;
  /** How long a vertical slider's rail is, per input. */
  readonly vertical: Tiered<number>;
  /** The knob's diameter, per input. */
  readonly knob: Tiered<number>;
  /** The knob's diameter while pressed, per input. */
  readonly knobPressed: Tiered<number>;
  /**
   * The mark inside the knob, where the theme has one: `0` is a solid knob, so a knob with a disc
   * is a ring around it and a knob without one is a disc.
   */
  readonly dot: number;
  /** The disc's diameter under the pointer, where it grows. */
  readonly dotHover: number;
  /** The disc's diameter while pressed, where it shrinks. */
  readonly dotPressed: number;
  /** Whether the knob brightens under the pointer and dims while pressed. */
  readonly brightens: boolean;
}

/** The parts a slider draws, as the theme's `slider.*` slots state them. */
export function sliderLook(): SliderLook {
  return {
    rail: pointsPerTier("slider.rail"),
    band: pointsPerTier("slider.band"),
    vertical: pointsPerTier("slider.vertical"),
    knob: pointsPerTier("slider.knob.size"),
    knobPressed: pointsPerTier("slider.knob.pressed.size"),
    dot: points("slider.mark.size"),
    dotHover: optionalPoints("slider.mark.hover") ?? 0,
    dotPressed: optionalPoints("slider.mark.pressed") ?? 0,
    brightens: flag("slider.brightens"),
  };
}

/** The numbers a switch draws with, as the theme's `switch.*` slots state them. */
export interface SwitchLook {
  /** The track's width and height, per input. */
  readonly width: Tiered<number>;
  readonly height: Tiered<number>;
  /** A small switch's track, per input. */
  readonly smallWidth: Tiered<number>;
  readonly smallHeight: Tiered<number>;
  /** The track's edge width: off and on, per input. */
  readonly edge: { readonly off: Tiered<number>; readonly on: Tiered<number> };
  /** The knob's width and height: off and on. */
  readonly knob: Tiered<number>;
  readonly knobHeight: Tiered<number>;
  /** A small switch's knob, per input. */
  readonly knobSmall: Tiered<number>;
  readonly knobSmallHeight: Tiered<number>;
  readonly knobOn: Tiered<number>;
  readonly knobOnHeight: Tiered<number>;
  /** The side the knob grows to under the pointer. */
  readonly knobHover: Tiered<number>;
  /** The knob's width and height while pressed. */
  readonly knobPressed: Tiered<number>;
  readonly knobPressedHeight: Tiered<number>;
  /** What a press does to the knob: nothing, a grow, or a widening slide. */
  readonly feedback: "none" | "expand" | "stretch";
}

/** The numbers a switch draws with, as the theme's `switch.*` slots state them. */
export function switchLook(): SwitchLook {
  const feedback = value("switch.feedback");
  if (feedback !== "none" && feedback !== "expand" && feedback !== "stretch") {
    throw new Error(`the theme's \`switch.feedback\` is ${JSON.stringify(feedback)}`);
  }
  return {
    width: pointsPerTier("switch.width"),
    height: pointsPerTier("switch.height"),
    smallWidth: pointsPerTier("switch.small.width"),
    smallHeight: pointsPerTier("switch.small.height"),
    edge: { off: pointsPerInput("switch.edge.off"), on: pointsPerInput("switch.edge.on") },
    knob: pointsPerTier("switch.knob.width"),
    knobHeight: pointsPerTier("switch.knob.height"),
    knobSmall: pointsPerTier("switch.small.knob.width"),
    knobSmallHeight: pointsPerTier("switch.small.knob.height"),
    knobOn: pointsPerTier("switch.knob.on.width"),
    knobOnHeight: pointsPerTier("switch.knob.on.height"),
    knobHover: pointsPerTier("switch.knob.hover"),
    knobPressed: pointsPerTier("switch.knob.pressed.width"),
    knobPressedHeight: pointsPerTier("switch.knob.pressed.height"),
    feedback,
  };
}

/** What a control that cannot be used turns over to, as the theme's `state.disabled.*` slots state it. */
export interface DisabledLook {
  /** The ground it takes over, where the theme restates one (`null` where it keeps its own). */
  readonly face: Fill | null;
  /** The ink it takes over, where the theme restates one. */
  readonly ink: string | null;
  /** The edge it takes over, where the theme restates one. */
  readonly edge: Fill | null;
}

/** What a disabled control draws with: its own values, or the theme's disabled finish. */
export function disabledLook(): DisabledLook {
  return {
    face: face("state.disabled.face"),
    ink: inked(face("state.disabled.ink")),
    edge: face("state.disabled.edge"),
  };
}
