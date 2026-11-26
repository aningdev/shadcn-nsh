/**
 * The control slots (`controls` in `semantics.json`): the one contract between a theme and the
 * components that draw a control (`docs/specs/theme-slots.md`, ADR 0013, ADR 0019).
 *
 * A slot is a value a theme states and a component paints — how thick a field's edge is, what color
 * a chosen box turns, how wide an off switch is. No slot is a look family: a form is what the values
 * add up to, so a value at its edge (`0`, `"none"`, an edge the color of its face) draws that form,
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
 * - `px` — a length in points, or `"none"` where zero means the part is not drawn (`"control"` for `stroke.control`).
 * - `ratio` — unitless: an opacity, or a share.
 * - `boolean` — a switch a theme turns on or off.
 * - `face` — a color a part paints with: `color:<role>` (a palette role in kebab-case),
 *   `tint:<role>` (a tint role), `finish:<role>` (a finish layer's ground),
 *   `finish:<role>:<field>` (one field of a layer: `border-color`, `foreground`, `shadow`), `none`
 *   (paints nothing), optionally at an alpha (`color:input@0.3`); the `disabled.*` and
 *   `field.disabled.face` slots also take `keep` (the component draws its own).
 * - `shade` — the finish whose elevation shadow a part wears, or `none`.
 * - `corner` — a radius: `control` (the theme's `shape.control`), `container` (its `shape.container`), `full` (a capsule), or points.
 * - `size` — a 2D box `[width, height]`, a square scalar `n` (`[n, n]`), or `"same"` (inherit the resting knob's size).
 */
export type SlotKind = "px" | "ratio" | "boolean" | "face" | "shade" | "corner" | "size";

/** A `size` slot's value: square points, `[width, height]`, or `"same"` to inherit the resting knob. */
export type SizeValue = number | readonly number[] | "same";

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
  | readonly number[]
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
 *
 * No slot path may be a `.`-separated prefix of another slot path (both DTCG groups and the
 * compiled nested `controls` object forbid a node from being both leaf and group).
 */
export const SLOTS: Record<string, SlotSpec> = ordered({
  // A button: its corners at each size, its selected state, its shade, and the variants whose look
  // a platform states of its own (the filled one is `finish.accent`, and destructive is `tints.destructive` + `colors.destructive`).
  "button.corner.sm": {
    kind: "corner",
    doc: "A small button's corner: the control radius, `full` for a capsule, or points.",
  },
  "button.corner.md": {
    kind: "corner",
    doc: "A regular button's corner: the control radius, `full` for a capsule, or points.",
  },
  "button.corner.lg": {
    kind: "corner",
    doc: "A large button's corner: the control radius, `full` for a capsule, or points.",
  },
  "button.selected.face": {
    kind: "face",
    doc: "The ground a chosen control turns over to: a toggle that is on, a tool that is picked, a button that is selected.",
  },
  "button.selected.ink": {
    kind: "face",
    doc: "What a chosen control's label and glyph are drawn in.",
  },
  "button.secondary.face": {
    kind: "face",
    doc: "The ground of a secondary button: the ordinary visible action.",
  },
  "button.secondary.ink": {
    kind: "face",
    doc: "What a secondary button's label and glyph are drawn in.",
  },
  "button.secondary.edge": {
    kind: "face",
    doc: "What a secondary button's edge is drawn in, or `none` where it draws none.",
  },
  "button.secondary.hover": {
    kind: "face",
    doc: "The ground a secondary button turns over to under the pointer.",
  },
  "button.outline.edge": {
    kind: "face",
    doc: "What an outline button's edge is drawn in.",
  },
  "button.destructive.edge": {
    kind: "face",
    doc: "What a destructive button's edge is drawn in, or `none` where it draws none.",
  },
  "button.shade": {
    kind: "shade",
    doc: "The finish whose shade a secondary or destructive button wears, or `none` where it stands flat.",
  },
  "badge.corner": {
    kind: "corner",
    doc: "A badge's corner: the control radius, `full` for a capsule, or points.",
  },

  // A field's frame: an input, a select, a combobox, a number input, an OTP cell.
  "field.edge.sides": {
    kind: "boolean",
    doc: "Whether a field draws the sides and top of its edge, or only the line under its text.",
  },
  "field.edge.color": {
    kind: "face",
    doc: "What a field's sides and top are drawn in.",
  },
  "field.edge.bottom": {
    kind: "face",
    doc: "What the line under a field's text is drawn in.",
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
  "field.focus.color": {
    kind: "face",
    doc: "What a field's focus edge and ring are drawn in (`color:brand` for a crisp accent ring, `color:ring` for the theme's `focus.style` halo).",
  },
  "field.disabled.face": {
    kind: "face",
    doc: "The ground and edge a field that cannot be used turns over to, or `keep` where it keeps its own and fades instead.",
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
  "choice.edge.color": {
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
  "choice.radio.checked.face": {
    kind: "face",
    doc: "The layer a chosen radio turns over to, or `none` where it keeps its ground and draws a ring and dot.",
  },
  "choice.radio.checked.edge": {
    kind: "face",
    doc: "What a chosen ring-only radio's border is drawn in, or `none` to keep its resting edge.",
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
  "switch.track": {
    kind: "size",
    doc: "An off switch's track, per input: `[width, height]`.",
  },
  "switch.small.track": {
    kind: "size",
    doc: "A small switch's track, per input: `[width, height]`.",
  },
  "switch.small.knob": {
    kind: "size",
    doc: "A small switch's knob, per input: side or `[width, height]`.",
  },
  "switch.edge.off": {
    kind: "px",
    doc: "How thick an off switch's track edge is.",
  },
  "switch.edge.on": {
    kind: "px",
    doc: "How thick an on switch's track edge is.",
  },
  "switch.edge.color": {
    kind: "face",
    doc: "What an off switch's track edge is drawn in, or `none` where the track has no border.",
  },
  "switch.knob.size": {
    kind: "size",
    doc: "An off switch's knob, per input: diameter or `[width, height]`.",
  },
  "switch.knob.on": {
    kind: "size",
    doc: "An on switch's knob, per input, or `same` to keep the resting knob size.",
  },
  "switch.knob.hover": {
    kind: "size",
    doc: "The knob size under the pointer, or `same` where hovering changes nothing.",
  },
  "switch.knob.pressed": {
    kind: "size",
    doc: "The knob size while pressed, or `same` where pressing changes nothing; widening past its height stretches toward the edge it heads for.",
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
  "slider.face": {
    kind: "face",
    doc: "What a slider's rail is filled with.",
  },
  "slider.shade": {
    kind: "shade",
    doc: "The finish whose shade a slider's rail wears, or `none`.",
  },
  "slider.edge.color": {
    kind: "face",
    doc: "What a slider's rail edge is drawn in, or `none` where it draws none.",
  },
  "slider.edge.width": {
    kind: "px",
    doc: "How thick a slider's rail edge is; `control` is the theme's `stroke.control`.",
  },
  "slider.knob.size": {
    kind: "size",
    doc: "A slider's knob, per input: diameter or `[width, height]` (`0` where the theme draws only a mark).",
  },
  "slider.knob.pressed": {
    kind: "size",
    doc: "The knob size while pressed, per input, or `same` to keep the resting knob size.",
  },
  "slider.knob.face": {
    kind: "face",
    doc: "What a slider's knob is filled with.",
  },
  "slider.knob.edge": {
    kind: "face",
    doc: "What a solid slider knob's border is drawn in, or `none` where it wears only the knob finish's own edge.",
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
  "progress.edge.color": {
    kind: "face",
    doc: "What a progress bar's groove edge is drawn in, or `none`.",
  },
  "progress.edge.width": {
    kind: "px",
    doc: "How thick a progress bar's groove edge is; `control` is the theme's `stroke.control`.",
  },

  // A calendar's today, and a spinner.
  "calendar.today.face": {
    kind: "face",
    doc: "The fill under a calendar's today, or `none` where it draws none.",
  },
  "calendar.today.ink": {
    kind: "face",
    doc: "What a calendar's today number is drawn in (`color:foreground`, `color:brand`).",
  },
  "spinner.opacity": {
    kind: "ratio",
    doc: "How faintly the spinner's groove shows, or `0` where it draws none.",
  },
  "spinner.spokes": {
    kind: "boolean",
    doc: "Whether an indeterminate spinner turns Apple's eight tapered rays instead of a turning arc.",
  },

  // A popup's surface, and the track a strip of tabs sits in.
  "popup.corner": {
    kind: "corner",
    doc: "A popup's surface corner (a menu's, a select's list, a calendar's): `container` is the theme's `shape.container`.",
  },
  "tooltip.face": {
    kind: "face",
    doc: "What a tooltip bubble is filled with.",
  },
  "tooltip.ink": {
    kind: "face",
    doc: "What a tooltip bubble's text is drawn in.",
  },
  "tooltip.edge": {
    kind: "face",
    doc: "What a tooltip bubble's border is drawn in, or `none` where it draws none.",
  },
  "tooltip.shade": {
    kind: "shade",
    doc: "The finish whose elevation shadow a tooltip bubble wears, or `none`.",
  },
  "toast.action.face": {
    kind: "face",
    doc: "The ground a toast's action button wears, or `none` for a borderless text button on the inverse surface.",
  },
  "list.item.highlight": {
    kind: "face",
    doc: "What a listbox or command option's focused background is drawn in (`tint:brand`, `color:accent`).",
  },
  "list.item.edge": {
    kind: "face",
    doc: "What a listbox option's focused border is drawn in (`color:brand@0.3`, `none`).",
  },
  "menubar.bar": {
    kind: "face",
    doc: "The surface a menubar frames its triggers on (`finish:card`, or `none` for a borderless transparent strip).",
  },
  "tabs.track.face": {
    kind: "face",
    doc: "The ground a tab strip's track lies on, or `none` where the surface behind it shows through.",
  },
  "tabs.track.edge": {
    kind: "face",
    doc: "What a tab strip's track edge is drawn in, or `none` where it draws no border.",
  },
  "tabs.track.corner": {
    kind: "corner",
    doc: "A tab strip's track corner: `full` for a capsule, `control`, or points.",
  },

  // A sunk well: the frame a list box, a terminal, an editor or a preview lies in.
  "well.edge": {
    kind: "face",
    doc: "What a sunk well's edge is drawn in, or `none` where it draws no border.",
  },

  // What a control that cannot be used turns into.
  "disabled.face": {
    kind: "face",
    doc: "The ground a disabled control turns over to, or `keep` where it keeps its own and fades instead.",
  },
  "disabled.ink": {
    kind: "face",
    doc: "What a disabled control's label is drawn in, or `keep`.",
  },
  "disabled.edge": {
    kind: "face",
    doc: "What a disabled control's edge is drawn in, or `keep`.",
  },
});

/**
 * The base theme's value for every slot (`docs/specs/theme-slots.md`): the form the library drew
 * before the slots were stated — a boxed field, a sunk well, a sunk groove and a disc.
 */
export const BASE_SLOTS: Record<string, SlotValue> = {
  "button.corner.sm": "control",
  "button.corner.md": "control",
  "button.corner.lg": "control",
  "button.selected.face": "finish:accent",
  "button.selected.ink": "color:primary-foreground",
  "button.secondary.face": "finish:raised",
  "button.secondary.ink": "color:foreground",
  "button.secondary.edge": "finish:raised:border-color",
  "button.secondary.hover": "finish:hover",
  "button.outline.edge": "color:border",
  "button.destructive.edge": "color:destructive@0.32",
  "button.shade": "raised",
  "badge.corner": "control",

  "field.edge.sides": true,
  "field.edge.color": "color:input",
  "field.edge.bottom": "color:input",
  "field.corner.bottom": "control",
  "field.focus.line": false,
  "field.focus.width": 3,
  "field.focus.color": "color:brand",
  "field.disabled.face": "keep",

  "choice.size": { pointer: 16, touch: 22 },
  "choice.box": { pointer: 16, touch: 20 },
  "choice.corner": { pointer: 5, touch: 7 },
  "choice.face": { light: "color:field", dark: "color:input@0.3" },
  "choice.shade": "inset",
  "choice.edge.width": 1,
  "choice.edge.color": { light: "color:input", dark: "color:foreground@0.2" },
  "choice.edge.disabled": { light: "color:input", dark: "color:foreground@0.4" },
  "choice.checked.face": "finish:accent",
  "choice.radio.checked.face": "finish:accent",
  "choice.radio.checked.edge": "none",
  "choice.mark.size": { pointer: 6, touch: 8 },
  "choice.mark.hover": "none",
  "choice.mark.pressed": "none",
  "choice.halo": "none",

  "switch.track": { pointer: [36, 20], touch: [44, 24] },
  "switch.small.track": { pointer: [28, 16], touch: [36, 20] },
  "switch.small.knob": { pointer: 12, touch: 16 },
  "switch.edge.off": 1,
  "switch.edge.on": 1,
  "switch.edge.color": "color:border",
  "switch.knob.size": { pointer: 16, touch: 20 },
  "switch.knob.on": "same",
  "switch.knob.hover": "same",
  "switch.knob.pressed": "same",

  "slider.rail": { pointer: 6, touch: 8 },
  "slider.band": { pointer: 20, touch: 32 },
  "slider.face": "color:track",
  "slider.shade": "inset",
  "slider.edge.color": "color:border",
  "slider.edge.width": "control",
  "slider.knob.size": { pointer: 14, touch: 20 },
  "slider.knob.pressed": { pointer: 14, touch: 32 },
  "slider.knob.face": "finish:knob",
  "slider.knob.edge": "none",
  "slider.mark.size": 0,
  "slider.mark.hover": 0,
  "slider.mark.pressed": 0,
  "slider.brightens": true,

  "progress.height": 6,
  "progress.line": 0,
  "progress.face": "color:track",
  "progress.shade": "inset",
  "progress.edge.color": "color:border",
  "progress.edge.width": "control",

  "calendar.today.face": "color:foreground@0.08",
  "calendar.today.ink": "color:foreground",
  "spinner.opacity": 0.25,
  "spinner.spokes": false,

  "popup.corner": "container",
  "tooltip.face": "finish:inverse",
  "tooltip.ink": "finish:inverse:foreground",
  "tooltip.edge": "finish:inverse:border-color",
  "tooltip.shade": "inverse",
  "toast.action.face": "finish:accent",
  "list.item.highlight": "tint:brand",
  "list.item.edge": "color:brand@0.3",
  "menubar.bar": "finish:card",
  "tabs.track.face": "color:inset",
  "tabs.track.edge": "color:border",
  "tabs.track.corner": "full",

  "well.edge": "color:border",

  "disabled.face": "keep",
  "disabled.ink": "keep",
  "disabled.edge": "keep",
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

const isLeafControl = (value: unknown): boolean => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return true;
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v);
  if (typeof v.color === "string" && keys.every((k) => k === "color" || k === "alpha")) return true;
  if (typeof v.tint === "string" && keys.every((k) => k === "tint" || k === "alpha")) return true;
  if (typeof v.finish === "string" && keys.every((k) => k === "finish" || k === "field"))
    return true;
  return "pointer" in v || "light" in v;
};

/** Flatten the compiled nested `controls` object back into dotted slot paths (`button.secondary.face`). */
export function flattenControls(controls: unknown, prefix = ""): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (controls === null || typeof controls !== "object" || Array.isArray(controls)) return out;
  for (const [key, value] of Object.entries(controls)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    if (isLeafControl(value)) out[path] = value;
    else Object.assign(out, flattenControls(value, path));
  }
  return out;
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
