/**
 * The control slots: the one contract between a theme and the components that draw a control
 * (`docs/specs/theme-slots.md`, ADR 0013).
 *
 * A slot is a value a theme states and a component paints — how thick a field's edge is, what colour
 * a chosen box turns, how wide an off switch is. No slot is a look family: a form is what the values
 * add up to, so a value at its edge (`0`, `"none"`, an edge the colour of its face) draws that form,
 * and no theme names one (`docs/decisions/0013-one-contract-value-slots.md`).
 *
 * This module is the list: every slot, what it measures, and the base theme's value for it. A theme
 * states the slots it answers differently and inherits the rest; `bun run check:theme` holds every
 * theme to carrying every slot, and `packages/ui/lib/look.ts` is the one place they are drawn.
 *
 * Pure: no `node:fs`, so the lint and its unit test both read it.
 */

/**
 * What a slot measures.
 *
 * - `px` — a length in points, or `"none"` where zero means the part is not drawn.
 * - `ratio` — unitless: an opacity, or a share.
 * - `boolean` — a switch a theme turns on or off.
 * - `face` — a colour a part paints with: `color:<role>` (a palette role), `finish:<role>` (a finish
 *   layer's ground), `finish:<role>:<field>` (one field of a layer: `border-color`, `foreground`,
 *   `shadow`), `none` (paints nothing), optionally at an alpha (`color:input@0.3`); the disabled
 *   group's three also take `keep` (the component draws its own).
 * - `shade` — the finish whose elevation shadow a part wears, or `none`.
 * - `corner` — a radius: `control` (the theme's `shape.control`), `container` (its `shape.container`), `full` (a capsule), or points.
 * - `text` — a name the component matches: the switch's knob feedback (`none`, `expand`, `stretch`).
 */
export type SlotKind = "px" | "ratio" | "boolean" | "face" | "shade" | "corner" | "text";

/** One slot: what it measures, and what it is for. */
export interface SlotSpec {
  readonly kind: SlotKind;
  readonly doc: string;
}

/**
 * A slot's value, as a theme author states it: the value itself, or one per tier or appearance.
 *
 * A pair is one level deep — a slot either varies by input or by appearance, never by both — so a
 * theme's file stays a plain mirror of the slot list.
 */
export type SlotValue =
  | string
  | number
  | boolean
  | { readonly pointer: SlotValue; readonly touch: SlotValue }
  | { readonly light: SlotValue; readonly dark: SlotValue };

/** A tier or appearance pair, as both the author and the compiler write it. */
export const isPair = (value: unknown): value is Record<string, SlotValue> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  (Object.hasOwn(value, "pointer") || Object.hasOwn(value, "light"));

/** A tiered value, the shape a slot takes when it states one per input. */
export type TieredSlot = { readonly pointer: SlotValue; readonly touch: SlotValue };

/** An appearance pair: a slot stated per appearance. */
export type AppearanceSlot = { readonly light: SlotValue; readonly dark: SlotValue };

/**
 * Every slot, by dotted path, with the base theme's value and what it measures. A theme inherits
 * every value it does not state (`docs/specs/theme-slots.md`).
 */
export const SLOTS: Record<string, SlotSpec> = ordered({
  // A field's frame: an input, a select, a combobox, a number input, an OTP cell.
  "field.face": {
    kind: "face",
    doc: "The ground a field lies on.",
  },
  "field.shade": {
    kind: "shade",
    doc: "The finish whose inner shade a field wears, or `none` where it lies flat.",
  },
  "field.edge.width": {
    kind: "px",
    doc: "How thick a field's edge is, on every side it draws; `control` is the theme's `stroke.control`.",
  },
  "field.edge.sides": {
    kind: "boolean",
    doc: "Whether a field draws the sides and top of its edge, or only the line under its text.",
  },
  "field.edge.colour": {
    kind: "face",
    doc: "What a field's sides and top are drawn in.",
  },
  "field.edge.bottom": {
    kind: "face",
    doc: "What the line under a field's text is drawn in.",
  },
  "field.corner.top": {
    kind: "corner",
    doc: "A field's top corners.",
  },
  "field.corner.bottom": {
    kind: "corner",
    doc: "A field's bottom corners: `0` where the line under it is its edge.",
  },
  "field.focus.line": {
    kind: "boolean",
    doc: "Whether focus lights the bottom line alone (a field whose edge is that line), or the whole edge inside a ring.",
  },
  "field.focus.width": {
    kind: "px",
    doc: "How thick the line under a field's text is where focus lights it (`field.focus.line`), or the edge of a field whose focus is a ring.",
  },

  // A choice: a checkbox's box, a radio's ring.
  "choice.size": {
    kind: "px",
    doc: "A radio's box, per input: its diameter.",
  },
  "choice.box": {
    kind: "px",
    doc: "A checkbox's box, per input: the side of its square (`choice.size` is a radio's across).",
  },
  "choice.corner": {
    kind: "corner",
    doc: "A choice's corner, per input: a quarter of its box where it is a square, half of it where it is a circle.",
  },
  "choice.face": {
    kind: "face",
    doc: "The ground an unchosen box lies on.",
  },
  "choice.shade": {
    kind: "shade",
    doc: "The finish whose shade an unchosen box wears, or `none`.",
  },
  "choice.edge.width": {
    kind: "px",
    doc: "How thick a box's edge is.",
  },
  "choice.edge.colour": {
    kind: "face",
    doc: "What a box's edge is drawn in.",
  },
  "choice.edge.disabled": {
    kind: "face",
    doc: "What a disabled box's edge is drawn in, where it is drawn stronger than an enabled one.",
  },
  "choice.checked.face": {
    kind: "face",
    doc: "The layer a chosen box turns over to, or `none` where it keeps its ground and draws a mark alone.",
  },
  "choice.mark.size": {
    kind: "px",
    doc: "A radio's dot, per input.",
  },
  "choice.mark.hover": {
    kind: "px",
    doc: "The dot's diameter under the pointer, where it grows (`none` where it does not).",
  },
  "choice.mark.pressed": {
    kind: "px",
    doc: "The dot's diameter while pressed, where it shrinks (`none` where it does not).",
  },
  "choice.halo": {
    kind: "px",
    doc: "The state layer's diameter round a box, or `none` where the form draws none.",
  },

  // A switch.
  "switch.width": {
    kind: "px",
    doc: "An off switch's track, per input: its width.",
  },
  "switch.height": {
    kind: "px",
    doc: "An off switch's track, per input: its height.",
  },
  "switch.small.width": {
    kind: "px",
    doc: "A small switch's track, per input: its width.",
  },
  "switch.small.height": {
    kind: "px",
    doc: "A small switch's track, per input: its height.",
  },
  "switch.small.knob.width": {
    kind: "px",
    doc: "A small switch's knob, per input: its width.",
  },
  "switch.small.knob.height": {
    kind: "px",
    doc: "A small switch's knob, per input: its height.",
  },
  "switch.edge.off": {
    kind: "px",
    doc: "How thick an off switch's track edge is.",
  },
  "switch.edge.on": {
    kind: "px",
    doc: "How thick an on switch's track edge is.",
  },
  "switch.knob.width": {
    kind: "px",
    doc: "An off switch's knob, per input: its width.",
  },
  "switch.knob.height": {
    kind: "px",
    doc: "An off switch's knob, per input: its height.",
  },
  "switch.knob.on.width": {
    kind: "px",
    doc: "An on switch's knob, per input: its width.",
  },
  "switch.knob.on.height": {
    kind: "px",
    doc: "An on switch's knob, per input: its height.",
  },
  "switch.knob.hover": {
    kind: "px",
    doc: "The side a knob grows to under the pointer, where hovering changes nothing.",
  },
  "switch.knob.pressed.width": {
    kind: "px",
    doc: "The knob's width while pressed.",
  },
  "switch.knob.pressed.height": {
    kind: "px",
    doc: "The knob's height while pressed.",
  },
  "switch.feedback": {
    kind: "text",
    doc: "What pressing a knob does: `none`, `expand` (it grows) or `stretch` (it widens toward the edge it heads for).",
  },

  // A slider.
  "slider.rail": {
    kind: "px",
    doc: "A slider's rail, per input: its thickness.",
  },
  "slider.band": {
    kind: "px",
    doc: "The band a slider keeps around its rail, per input.",
  },
  "slider.vertical": {
    kind: "px",
    doc: "How long a vertical slider's rail is, per input.",
  },
  "slider.face": {
    kind: "face",
    doc: "What a slider's rail is filled with.",
  },
  "slider.shade": {
    kind: "shade",
    doc: "The finish whose shade a slider's rail wears, or `none`.",
  },
  "slider.edge.colour": {
    kind: "face",
    doc: "What a slider's rail edge is drawn in, or `none` where it draws none.",
  },
  "slider.edge.width": {
    kind: "px",
    doc: "How thick a slider's rail edge is; `control` is the theme's `stroke.control`.",
  },
  "slider.knob.size": {
    kind: "px",
    doc: "A slider's knob, per input: its diameter.",
  },
  "slider.knob.pressed.size": {
    kind: "px",
    doc: "The knob's diameter while pressed, per input.",
  },
  "slider.knob.face": {
    kind: "face",
    doc: "What a slider's knob is filled with.",
  },
  "slider.mark.size": {
    kind: "px",
    doc: "The knob's inner dot, per input: `0` where the knob is a solid disc.",
  },
  "slider.mark.hover": {
    kind: "px",
    doc: "The inner dot's diameter under the pointer, where the knob is a ring.",
  },
  "slider.mark.pressed": {
    kind: "px",
    doc: "The inner dot's diameter while pressed, where the knob is a ring.",
  },
  "slider.brightens": {
    kind: "boolean",
    doc: "Whether a solid knob brightens under the pointer and dims while pressed, rather than rescaling.",
  },

  // A progress bar.
  "progress.height": {
    kind: "px",
    doc: "A progress bar's height.",
  },
  "progress.line": {
    kind: "px",
    doc: "The run's height inside the groove, or `0` where the run fills it.",
  },
  "progress.face": {
    kind: "face",
    doc: "What a progress bar's groove is filled with.",
  },
  "progress.shade": {
    kind: "shade",
    doc: "The finish whose shade a progress bar's groove wears, or `none`.",
  },
  "progress.edge.colour": {
    kind: "face",
    doc: "What a progress bar's groove edge is drawn in, or `none`.",
  },
  "progress.edge.width": {
    kind: "px",
    doc: "How thick a progress bar's groove edge is; `control` is the theme's `stroke.control`.",
  },

  // A spinner.
  "spinner.opacity": {
    kind: "ratio",
    doc: "How faintly the spinner's groove shows, or `0` where it draws none.",
  },

  // A popup's surface, and the track a strip of tabs sits in.
  "popup.corner": {
    kind: "corner",
    doc: "A popup's surface corner (a menu's, a select's list, a calendar's): `container` is the theme's `shape.container`.",
  },
  "tabs.track.face": {
    kind: "face",
    doc: "The ground a tab strip's track lies on, or `none` where the surface behind it shows through.",
  },

  // A sunk well: the frame a list box, a terminal, an editor or a preview lies in.
  "well.edge": {
    kind: "face",
    doc: "What a sunk well's edge is drawn in, or `none` where it draws no edge and its ground alone marks it.",
  },

  // What a control that cannot be used turns into.
  "state.disabled.face": {
    kind: "face",
    doc: "The ground a disabled control turns over to, or `keep` where it keeps its own and fades instead.",
  },
  "state.disabled.ink": {
    kind: "face",
    doc: "What a disabled control's label is drawn in, or `keep`.",
  },
  "state.disabled.edge": {
    kind: "face",
    doc: "What a disabled control's edge is drawn in, or `keep`.",
  },
});

/**
 * The base theme's value for every slot (`docs/specs/theme-slots.md`): the form the library drew
 * before the slots were stated — a boxed field, a sunk well, a sunk groove and a disc.
 */
export const BASE_SLOTS: Record<string, SlotValue> = {
  "field.face": "color:field",
  "field.shade": "inset",
  "field.edge.width": "control",
  "field.edge.sides": true,
  "field.edge.colour": "color:input",
  "field.edge.bottom": "color:input",
  "field.corner.top": "control",
  "field.corner.bottom": "control",
  "field.focus.line": false,
  "field.focus.width": 3,

  "choice.size": { pointer: 16, touch: 22 },
  "choice.box": { pointer: 16, touch: 20 },
  "choice.corner": { pointer: 5, touch: 7 },
  "choice.face": { light: "color:field", dark: "color:input@0.3" },
  "choice.shade": "inset",
  "choice.edge.width": 1,
  "choice.edge.colour": { light: "color:input", dark: "color:foreground@0.2" },
  "choice.edge.disabled": { light: "color:input", dark: "color:foreground@0.4" },
  "choice.checked.face": "finish:accent",
  "choice.mark.size": { pointer: 6, touch: 8 },
  "choice.mark.hover": "none",
  "choice.mark.pressed": "none",
  "choice.halo": "none",

  "switch.width": { pointer: 36, touch: 44 },
  "switch.height": { pointer: 20, touch: 24 },
  "switch.small.width": { pointer: 28, touch: 36 },
  "switch.small.height": { pointer: 16, touch: 20 },
  "switch.small.knob.width": { pointer: 12, touch: 16 },
  "switch.small.knob.height": { pointer: 12, touch: 16 },
  "switch.edge.off": 1,
  "switch.edge.on": 1,
  "switch.knob.width": { pointer: 16, touch: 20 },
  "switch.knob.height": { pointer: 16, touch: 20 },
  "switch.knob.on.width": { pointer: 16, touch: 20 },
  "switch.knob.on.height": { pointer: 16, touch: 20 },
  "switch.knob.hover": { pointer: 16, touch: 20 },
  "switch.knob.pressed.width": { pointer: 16, touch: 20 },
  "switch.knob.pressed.height": { pointer: 16, touch: 20 },
  "switch.feedback": "none",

  "slider.rail": { pointer: 6, touch: 8 },
  "slider.band": { pointer: 20, touch: 32 },
  "slider.vertical": { pointer: 128, touch: 144 },
  "slider.face": "color:track",
  "slider.shade": "inset",
  "slider.edge.colour": "color:border",
  "slider.edge.width": "control",
  "slider.knob.size": { pointer: 14, touch: 20 },
  "slider.knob.pressed.size": { pointer: 14, touch: 32 },
  "slider.knob.face": "finish:knob",
  "slider.mark.size": 0,
  "slider.mark.hover": 0,
  "slider.mark.pressed": 0,
  "slider.brightens": true,

  "progress.height": 6,
  "progress.line": 0,
  "progress.face": "color:track",
  "progress.shade": "inset",
  "progress.edge.colour": "color:border",
  "progress.edge.width": "control",

  "spinner.opacity": 0.25,

  "popup.corner": "container",
  "tabs.track.face": "color:inset",

  "well.edge": "color:border",

  "state.disabled.face": "keep",
  "state.disabled.ink": "keep",
  "state.disabled.edge": "keep",
};

/** A slot path: one of the list above. */
export type SlotPath = keyof typeof SLOTS;

/** The slots that differ from the base theme's, by path: what a theme states of its own. */
export function slotOverrides(
  values: Readonly<Record<string, SlotValue>>,
  base: Readonly<Record<string, SlotValue>> = BASE_SLOTS,
): Record<string, SlotValue> {
  const overrides: Record<string, SlotValue> = {};
  for (const [path, value] of Object.entries(values)) {
    if (JSON.stringify(value) !== JSON.stringify(base[path])) overrides[path] = value;
  }
  return overrides;
}

/** Every slot a theme states that the list has no row for. */
export function unknownSlots(values: Readonly<Record<string, SlotValue>>): string[] {
  return Object.keys(values).filter((path) => !Object.hasOwn(SLOTS, path));
}

/** A slot path's dotted form split into its DTCG groups: `choice.mark.size` → ["choice","mark","size"]. */
export function slotGroups(path: string): string[] {
  return path.split(".");
}

/** The DTCG token this module is read from, under `slot`: the base's value, at the base's path. */
export const SLOT_GROUP = "slot";

/**
 * The list in the order the spec states it, so a theme's file and the lint read it the same way and
 * a diff between two themes lines up (`docs/specs/theme-slots.md`'s groups, in order).
 */
function ordered(slots: Record<string, SlotSpec>): Record<string, SlotSpec> {
  return slots;
}
