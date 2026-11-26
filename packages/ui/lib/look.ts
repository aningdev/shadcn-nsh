// A theme's control slots drawn out (`controls` in `semantics.json`, `docs/specs/theme-slots.md`,
// ADR 0013, ADR 0019). No value here names a form: a slot at its edge — a `0` width, a `none`
// face, a bottom corner of `0` — is what makes an underline, an outline or a capsule, so this
// module asks the theme's values and never a theme's name.
//
// Reactive: every reader below calls `controls()` (or `style()`), so a part drawn in JSX follows
// `selectTheme`. What comes back is a role a part paints (`painted`, `edged`, `inked`) and the
// numbers it lays out with.

import {
  CAPSULE_RADIUS,
  alpha,
  colors,
  controls,
  finish,
  isDark,
  shape,
  stroke,
  style,
  tints,
  type FaceRole,
  type FinishRole,
  type Palette,
  type Slot,
  type SlotCorner,
  type SlotFace,
  type SlotLength,
  type SlotSize,
  type Tiered,
} from "@shadcn-nsh/theme";
import { platform } from "nsh";

/** A palette role a part reads: `colors[role]`. */
export type ColorRole = keyof Palette;

/** A tint a part reads: `tints[role]`. */
export type TintRole = keyof typeof tints;

/** The property of a finish layer a part paints: a fill's background, an edge's line, a glyph's ink. */
export type FillField = "backgroundColor" | "borderColor" | "foreground";

/** What fills a part: a finish layer, a palette role, or a tint. */
export type Fill =
  | { readonly kind: "finish"; readonly role: FaceRole; readonly field?: FillField }
  | { readonly kind: "color"; readonly role: ColorRole; readonly alpha?: number }
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

/** Read one named property off a finish layer directly, including non-enumerable `foreground`. */
const fieldOf = (role: FaceRole, key: FillField): string | undefined => {
  if (key === "foreground") return finish[role].foreground;
  return ({ ...finish[role] } as unknown as Record<string, string | undefined>)[key];
};

/** What a face paints as a color (`transparent` where it paints none), for a part that spreads a ground. */
export function ground(fill: Fill | null): string {
  return fill === null ? "transparent" : painted(fill);
}

/**
 * A face's whole layer, where a part wears all of it: a finish's background, edges, shade,
 * gradient and the ink its text inherits (`foreground`).
 */
export function fillOf(fill: Fill): import("nsh").ViewStyle {
  switch (fill.kind) {
    case "finish":
      return { ...layer(fill.role) } as unknown as import("nsh").ViewStyle;
    case "color":
    case "tint":
      return { backgroundColor: painted(fill) };
  }
}

/** A palette role as the class that paints it: `mutedForeground` → `muted-foreground`. */
const kebab = (role: string): string => role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** A kebab-case color name from a slot (`primary-foreground`) as a `Palette` key (`primaryForeground`). */
const toColorRole = (name: string): ColorRole =>
  name.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase()) as ColorRole;

/**
 * A frame's edge as the class that paints it, for the wells drawn in classes (a number input, a time
 * field): the palette role the theme names, which its own tokens resolve, so the class follows
 * `selectTheme`. A frame's edge is a role, never a finish or an alpha.
 */
export function borderClass(fill: Fill | null, edge: "border" | "border-b" = "border"): string {
  if (fill === null) return `${edge}-transparent`;
  if (fill.kind !== "color" || fill.alpha !== undefined) {
    throw new Error(`a field's edge names a palette color, not ${JSON.stringify(fill)}`);
  }
  return `${edge}-${kebab(fill.role)}`;
}

/** Whether two fills paint the same color, so a box's sides and its bottom edge read as one. */
export function sameFill(a: Fill | null, b: Fill | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** What a part fills with: a finish's background, a color, or a tint (`transparent` where it has none). */
export function painted(fill: Fill | null): string {
  if (fill === null) return "transparent";
  switch (fill.kind) {
    case "finish":
      return fieldOf(fill.role, fill.field ?? "backgroundColor") ?? "transparent";
    case "color":
      return fill.alpha === undefined ? colors[fill.role] : alpha(colors[fill.role], fill.alpha);
    case "tint":
      return fill.alpha === undefined ? tints[fill.role] : alpha(tints[fill.role], fill.alpha);
  }
}

/** What a part's edge is drawn in: a finish's line, a color, or a tint (the `border` role where a finish has no line). */
export function edged(fill: Fill | null): string {
  if (fill === null) return "transparent";
  switch (fill.kind) {
    case "finish": {
      const line = fieldOf(fill.role, fill.field ?? "borderColor");
      return line ?? (fill.field === undefined ? colors.border : "transparent");
    }
    case "color":
      return fill.alpha === undefined ? colors[fill.role] : alpha(colors[fill.role], fill.alpha);
    case "tint":
      return fill.alpha === undefined ? tints[fill.role] : alpha(tints[fill.role], fill.alpha);
  }
}

/** What a part's ink is: a finish's `foreground`, or the color itself (`null` where it has none). */
export function inked(fill: Fill | null): string | null {
  if (fill === null) return null;
  if (fill.kind !== "finish") return painted(fill);
  const ink = fieldOf(fill.role, fill.field ?? "foreground");
  return ink ?? null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTiered = <T>(slot: Slot<T>): slot is Tiered<T> =>
  isRecord(slot) && "pointer" in slot && "touch" in slot;

const isAppearance = <T>(slot: Slot<T>): slot is { readonly light: T; readonly dark: T } =>
  isRecord(slot) && "light" in slot && "dark" in slot;

/** Unwrap a typed slot for the active input tier and appearance. */
function readSlot<T>(slot: Slot<T>): T {
  if (isTiered(slot)) return platform.desktop ? slot.pointer : slot.touch;
  if (isAppearance(slot)) return isDark() ? slot.dark : slot.light;
  return slot;
}

/** Unwrap a typed slot into its pointer and touch pair (duplicating scalar values). */
function readTiered<T>(slot: Slot<T>): Tiered<T> {
  if (isTiered(slot)) return slot;
  const val = isAppearance(slot) ? (isDark() ? slot.dark : slot.light) : slot;
  return { pointer: val, touch: val };
}

function lengthValue(raw: SlotLength): number {
  if (raw === "control") return style().dimension.stroke.control;
  if (raw === "none") return 0;
  return raw;
}

function resolveLength(slot: Slot<SlotLength>): number {
  return lengthValue(readSlot(slot));
}

function resolveLengthPerInput(slot: Slot<SlotLength>): Tiered<number> {
  const pair = readTiered(slot);
  return { pointer: lengthValue(pair.pointer), touch: lengthValue(pair.touch) };
}

function optionalPoints(slot: Slot<number | "none">): number | null {
  const raw = readSlot(slot);
  return raw === "none" ? null : raw;
}

function cornerOf(raw: SlotCorner): number {
  if (raw === "full") return CAPSULE_RADIUS;
  if (raw === "container") return shape.container;
  if (raw === "control") return shape.control;
  return raw;
}

function cornerPerTier(slot: Slot<SlotCorner>): Tiered<number> {
  const pair = readTiered(slot);
  return { pointer: cornerOf(pair.pointer), touch: cornerOf(pair.touch) };
}

function paintedFace(face: SlotFace): Fill | null {
  if (face === "none" || face === "keep") return null;
  if ("finish" in face) {
    return {
      kind: "finish",
      role: face.finish as FaceRole,
      field: face.field as FillField | undefined,
    };
  }
  if ("tint" in face) {
    return { kind: "tint", role: face.tint as TintRole, alpha: face.alpha };
  }
  return { kind: "color", role: toColorRole(face.color), alpha: face.alpha };
}

function resolveFace(slot: Slot<SlotFace>): Fill | null {
  return paintedFace(readSlot(slot));
}

function resolveShade(slot: Slot<FinishRole | "none">): FinishRole | null {
  const found = readSlot(slot);
  return found === "none" ? null : found;
}

function boxPair(raw: SlotSize, fallback?: readonly [number, number]): readonly [number, number] {
  if (raw === "same") {
    if (!fallback) throw new Error("`same` size slot requires a resting knob size");
    return fallback;
  }
  return typeof raw === "number" ? [raw, raw] : [raw[0]!, raw[1]!];
}

function resolveSizePerTier(
  slot: Slot<SlotSize>,
  fallback?: Tiered<readonly [number, number]>,
): Tiered<readonly [number, number]> {
  const pair = readTiered(slot);
  return {
    pointer: boxPair(pair.pointer, fallback?.pointer),
    touch: boxPair(pair.touch, fallback?.touch),
  };
}

/** Derive switch press feedback (`"none" | "expand" | "stretch"`) from resting vs pressed box sizes. */
function deriveKnobFeedback(
  base: Tiered<readonly [number, number]>,
  pressed: Tiered<readonly [number, number]>,
): "none" | "expand" | "stretch" {
  const [bw, bh] = base.pointer;
  const [pw, ph] = pressed.pointer;
  if (
    pw === bw &&
    ph === bh &&
    pressed.touch[0] === base.touch[0] &&
    pressed.touch[1] === base.touch[1]
  ) {
    return "none";
  }
  return pw / bw > ph / bh || pressed.touch[0] / base.touch[0] > pressed.touch[1] / base.touch[1]
    ? "stretch"
    : "expand";
}

/** The box a checkbox draws, per input: the theme's `controls().choice.box`. */
export function choiceBox(): Tiered<number> {
  return readTiered(controls().choice.box);
}

/** A sunk well's edge, as `controls().well.edge` states it (`null` where it draws none). */
export function wellEdge(): Fill | null {
  return resolveFace(controls().well.edge);
}

/** A popup's surface corner, in points (`controls().popup.corner`). */
export function popupCorner(): number {
  return cornerOf(readSlot(controls().popup.corner));
}

/** A badge's corner, in points (`controls().badge.corner`). */
export function badgeCorner(): number {
  return cornerOf(readSlot(controls().badge.corner));
}

/** A tooltip bubble's look (`controls().tooltip`): its background, text ink, border edge and shade finish. */
export function tooltipSlotLook(): {
  readonly face: Fill | null;
  readonly ink: string | null;
  readonly edge: Fill | null;
  readonly shade: FinishRole | null;
} {
  const t = controls().tooltip;
  return {
    face: resolveFace(t.face),
    ink: inked(resolveFace(t.ink)),
    edge: resolveFace(t.edge),
    shade: resolveShade(t.shade),
  };
}

/** What a toast's action button fills with (`controls().toast.action.face`), or `null` for a borderless text action. */
export function toastActionFace(): Fill | null {
  return resolveFace(controls().toast.action.face);
}

/** A fill as a class (`bg-foreground/8`, `bg-brand-tint`, `text-brand`, `border-brand/30`). */
export function backgroundClass(fill: Fill | null, edge: string = "bg"): string {
  if (fill === null) return `${edge}-transparent`;
  if (fill.kind === "finish") {
    throw new Error(
      `a class-drawn fill names a palette color or tint, not ${JSON.stringify(fill)}`,
    );
  }
  const role = fill.kind === "tint" ? `${kebab(fill.role)}-tint` : kebab(fill.role);
  return fill.alpha === undefined
    ? `${edge}-${role}`
    : `${edge}-${role}/${String(Math.round(fill.alpha * 100))}`;
}

const FOCUS_BG_CLASS: Record<string, string> = {
  "bg-brand-tint": "focus:bg-brand-tint",
  "bg-accent": "focus:bg-accent",
};

const FOCUS_BORDER_CLASS: Record<string, string> = {
  "border-brand/30": "focus:border-brand/30",
};

/**
 * Focused/highlighted option classes derived from `controls().list.item`:
 * e.g. `"focus:border-brand/30 focus:bg-brand-tint"` or `"focus:bg-accent"`.
 * Pass `withEdge = false` when rows have no border slot (e.g. `Command`).
 */
export function listItemHighlightClass(withEdge = true): string {
  const item = controls().list.item;
  const bg = FOCUS_BG_CLASS[backgroundClass(resolveFace(item.highlight), "bg")];
  const edgeFill = withEdge ? resolveFace(item.edge) : null;
  const edge =
    edgeFill === null ? undefined : FOCUS_BORDER_CLASS[backgroundClass(edgeFill, "border")];
  if (!bg) {
    throw new Error(
      `unsupported list.item.highlight class: ${JSON.stringify(resolveFace(item.highlight))}`,
    );
  }
  return [edge, bg].filter(Boolean).join(" ");
}

/** What a menubar frames its row of triggers on (`controls().menubar.bar`), or `null` for plain strip. */
export function menubarFace(): Fill | null {
  return resolveFace(controls().menubar.bar);
}

/** The ground a tab strip's track lies on (`controls().tabs.track.face`), `null` where the surface shows through. */
export function trackGround(): Fill | null {
  return resolveFace(controls().tabs.track.face);
}

/** A tab strip's track look (`controls().tabs.track`): its ground, border edge, and corner radius. */
export function tabsTrackLook(): {
  readonly face: Fill | null;
  readonly edge: Fill | null;
  readonly corner: number;
} {
  const track = controls().tabs.track;
  return {
    face: resolveFace(track.face),
    edge: resolveFace(track.edge),
    corner: cornerOf(readSlot(track.corner)),
  };
}

/** How thick the line under a field's text is where focus lights it (`controls().field.focus.width`). */
export function fieldFocusWidth(): number {
  return resolveLength(controls().field.focus.width);
}

/** A part painted from a group of slots: its ground, its ink, its edge and the shade it wears. */
export interface VariantLook {
  /** What the part fills with (`null` where it paints none). */
  readonly face: Fill | null;
  /** What its label and glyph are drawn in (`null` where the slot names no ink). */
  readonly ink: string | null;
  /** What its edge is drawn in (`null` where it draws none). */
  readonly edge: Fill | null;
  /** The finish whose shade it wears (`null` where it stands flat). */
  readonly shade: FinishRole | null;
}

/** A secondary button's look (`controls().button.secondary` + `button.shade`): the ordinary visible action. */
export function secondaryLook(): VariantLook {
  const b = controls().button;
  return {
    face: resolveFace(b.secondary.face),
    ink: inked(resolveFace(b.secondary.ink)),
    edge: resolveFace(b.secondary.edge),
    shade: resolveShade(b.shade),
  };
}

/** The ground a secondary button turns over to under the pointer (`controls().button.secondary.hover`). */
export function secondaryHover(): Fill | null {
  return resolveFace(controls().button.secondary.hover);
}

/** An outline button's edge (`controls().button.outline.edge`). */
export function outlineEdge(): Fill | null {
  return resolveFace(controls().button.outline.edge);
}

/** A destructive button's look (`tints.destructive`, `colors.destructive`, `button.shade`, `button.destructive.edge`). */
export function destructiveLook(): VariantLook {
  const b = controls().button;
  return {
    face: { kind: "tint", role: "destructive" },
    ink: colors.destructive,
    edge: resolveFace(b.destructive.edge),
    shade: resolveShade(b.shade),
  };
}

/**
 * A calendar's today (`controls().calendar.today`): the fill and ink classes — both classes, so
 * the selected day's `primary` and `primary-foreground` still outrank it.
 */
export function calendarTodayLook(): { readonly face: string; readonly ink: string } {
  const today = controls().calendar.today;
  return {
    face: backgroundClass(resolveFace(today.face), "bg"),
    ink: backgroundClass(resolveFace(today.ink), "text"),
  };
}

/** A chosen control's look (`controls().button.selected`): a toggle that is on, a tool that is picked. */
export function selectedLook(): { readonly face: Fill | null; readonly ink: string | null } {
  const s = controls().button.selected;
  return { face: resolveFace(s.face), ink: inked(resolveFace(s.ink)) };
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
  /** The face of the box itself (`color:field`). */
  readonly ground: Fill | null;
  /** The finish whose shade sinks the field (`inset`). */
  readonly shade: FinishRole | null;
  /** Where the theme draws the focus as a line under the text rather than a changed edge. */
  readonly focusLine: boolean;
  /** Whether the field's focus edge/ring uses the theme's `ring` halo instead of crisp `brand`. */
  readonly focusUsesRing: boolean;
  /**
   * The ground a field that cannot be used turns over to, where the theme states one: the box is
   * drawn in it, edge and all, instead of fading (`null` where the control keeps its own and fades).
   */
  readonly disabled: Fill | null;
}

/** The field's frame, as `controls().field` states it. */
export function fieldLook(): FieldLook {
  const f = controls().field;
  const edges = readSlot(f.edge.sides) ? "all" : "bottom";
  const focusColor = resolveFace(f.focus.color);
  return {
    edges,
    width: stroke.control,
    radius: shape.control,
    bottomRadius: cornerOf(readSlot(f.corner.bottom)),
    side: edges === "all" ? resolveFace(f.edge.color) : null,
    bottom: resolveFace(f.edge.bottom) ?? { kind: "color", role: "input" },
    ground: { kind: "color", role: "field" },
    shade: "inset",
    focusLine: readSlot(f.focus.line),
    focusUsesRing: sameFill(focusColor, { kind: "color", role: "ring" }),
    disabled: resolveFace(f.disabled.face),
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
  /** The face once chosen for a radio, or `null` where the radio stays a ring + dot. */
  readonly radioChecked: Fill | null;
  /** The border color of a chosen ring-only radio, or `null` to keep its resting edge. */
  readonly radioCheckedEdge: Fill | null;
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
  /** A checkbox's box, per input: the side of its square. */
  readonly box: Tiered<number>;
  /** The state layer's diameter, where the theme asks for one. */
  readonly halo: number | null;
}

/** The parts a choice draws, as `controls().choice` states them. */
export function choiceLook(): ChoiceLook {
  const c = controls().choice;
  const thickness = resolveLength(c.edge.width);
  const edgeFill = resolveFace(c.edge.color);
  const disabledFill = resolveFace(c.edge.disabled);
  return {
    face: resolveFace(c.face),
    shade: resolveShade(c.shade),
    checked: resolveFace(c.checked.face),
    radioChecked: resolveFace(c.radio.checked.face),
    radioCheckedEdge: resolveFace(c.radio.checked.edge),
    edge: thickness === 0 || edgeFill === null ? null : { width: thickness, fill: edgeFill },
    edgeDisabled:
      thickness === 0 || disabledFill === null ? null : { width: thickness, fill: disabledFill },
    corner: cornerPerTier(c.corner),
    dot: readTiered(c.mark.size),
    dotHover: optionalPoints(c.mark.hover),
    dotPressed: optionalPoints(c.mark.pressed),
    size: readTiered(c.size),
    box: readTiered(c.box),
    halo: optionalPoints(c.halo),
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
  /** A spinner: how faintly its arc's groove shows (`null` where it draws none), and whether it
   * turns Apple's eight rays instead of an arc. */
  readonly spinner: { readonly opacity: number | null; readonly spokes: boolean };
}

/** The groove a track's controls sit in, as `controls().progress` and `controls().slider` state it. */
export function trackLook(part: "progress" | "slider"): TrackLook {
  const c = controls();
  const group = part === "progress" ? c.progress : c.slider;
  const thickness = resolveLength(group.edge.width);
  const edgeFill = resolveFace(group.edge.color);
  const groove = resolveFace(group.face);
  const opacity = readSlot(c.spinner.opacity);
  return {
    groove: groove === null ? null : { fill: groove, shade: resolveShade(group.shade) },
    edge: thickness === 0 || edgeFill === null ? null : { width: thickness, fill: edgeFill },
    progress: {
      height: readSlot(c.progress.height),
      // A line's height is a measurement, so 0 is how a theme says it draws none.
      line: readSlot(c.progress.line) || null,
    },
    spinner: {
      opacity: opacity === 0 ? null : opacity,
      spokes: readSlot(c.spinner.spokes),
    },
  };
}

/** The parts a slider draws: its knob, the rail it runs on, and the band it keeps around it. */
export interface SliderLook {
  /** The rail's thickness, per input. */
  readonly rail: Tiered<number>;
  /** The band around the rail, per input. */
  readonly band: Tiered<number>;
  /** The knob's width and height, per input: a disc has them equal, a capsule has them apart. */
  readonly knob: Tiered<number>;
  readonly knobHeight: Tiered<number>;
  /** The knob's width and height while pressed, per input. */
  readonly knobPressed: Tiered<number>;
  readonly knobPressedHeight: Tiered<number>;
  /** What a solid knob is filled with. */
  readonly knobFace: Fill | null;
  /** What a solid knob's border is drawn in (`null` where it wears only the knob finish's edge). */
  readonly knobEdge: Fill | null;
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

/** The parts a slider draws, as `controls().slider` states them. */
export function sliderLook(): SliderLook {
  const s = controls().slider;
  const knob = resolveSizePerTier(s.knob.size);
  const pressed = resolveSizePerTier(s.knob.pressed, knob);
  return {
    rail: readTiered(s.rail),
    band: readTiered(s.band),
    knob: { pointer: knob.pointer[0], touch: knob.touch[0] },
    knobHeight: { pointer: knob.pointer[1], touch: knob.touch[1] },
    knobPressed: { pointer: pressed.pointer[0], touch: pressed.touch[0] },
    knobPressedHeight: { pointer: pressed.pointer[1], touch: pressed.touch[1] },
    knobFace: resolveFace(s.knob.face),
    knobEdge: resolveFace(s.knob.edge),
    dot: readSlot(s.mark.size),
    dotHover: readSlot(s.mark.hover),
    dotPressed: readSlot(s.mark.pressed),
    brightens: readSlot(s.brightens),
  };
}

/** The numbers a switch draws with, as `controls().switch` states them. */
export interface SwitchLook {
  /** The track's width and height, per input. */
  readonly width: Tiered<number>;
  readonly height: Tiered<number>;
  /** A small switch's track, per input. */
  readonly smallWidth: Tiered<number>;
  readonly smallHeight: Tiered<number>;
  /** The track's edge width: off and on, per input. */
  readonly edge: { readonly off: Tiered<number>; readonly on: Tiered<number> };
  /** What an off switch's track edge is drawn in (`null` where it draws none). */
  readonly edgeColor: Fill | null;
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
  /** What a press does to the knob: derived from resting vs pressed sizes. */
  readonly feedback: "none" | "expand" | "stretch";
}

/** The numbers a switch draws with, as `controls().switch` states them. */
export function switchLook(): SwitchLook {
  const sw = controls().switch;
  const track = resolveSizePerTier(sw.track);
  const smallTrack = resolveSizePerTier(sw.small.track);
  const smallKnob = resolveSizePerTier(sw.small.knob);
  const knob = resolveSizePerTier(sw.knob.size);
  const knobOn = resolveSizePerTier(sw.knob.on, knob);
  const knobHover = resolveSizePerTier(sw.knob.hover, knob);
  const knobPressed = resolveSizePerTier(sw.knob.pressed, knob);
  return {
    width: { pointer: track.pointer[0], touch: track.touch[0] },
    height: { pointer: track.pointer[1], touch: track.touch[1] },
    smallWidth: { pointer: smallTrack.pointer[0], touch: smallTrack.touch[0] },
    smallHeight: { pointer: smallTrack.pointer[1], touch: smallTrack.touch[1] },
    edge: { off: resolveLengthPerInput(sw.edge.off), on: resolveLengthPerInput(sw.edge.on) },
    edgeColor: resolveFace(sw.edge.color),
    knob: { pointer: knob.pointer[0], touch: knob.touch[0] },
    knobHeight: { pointer: knob.pointer[1], touch: knob.touch[1] },
    knobSmall: { pointer: smallKnob.pointer[0], touch: smallKnob.touch[0] },
    knobSmallHeight: { pointer: smallKnob.pointer[1], touch: smallKnob.touch[1] },
    knobOn: { pointer: knobOn.pointer[0], touch: knobOn.touch[0] },
    knobOnHeight: { pointer: knobOn.pointer[1], touch: knobOn.touch[1] },
    knobHover: { pointer: knobHover.pointer[0], touch: knobHover.touch[0] },
    knobPressed: { pointer: knobPressed.pointer[0], touch: knobPressed.touch[0] },
    knobPressedHeight: { pointer: knobPressed.pointer[1], touch: knobPressed.touch[1] },
    feedback: deriveKnobFeedback(knob, knobPressed),
  };
}

/** What a control that cannot be used turns over to, as `controls().disabled` states it. */
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
  const d = controls().disabled;
  return {
    face: resolveFace(d.face),
    ink: inked(resolveFace(d.ink)),
    edge: resolveFace(d.edge),
  };
}

/** Zero when a surface finish draws no border (`"transparent"`), otherwise a hairline stroke. */
export function surfaceBorderWidth(borderColor: string | undefined): number {
  return borderColor === "transparent" ? 0 : stroke.hairline;
}
