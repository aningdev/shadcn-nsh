// How a field draws its frame: one place that turns a theme's `field.*` slots (`fieldLook`) into the
// styles and classes every field control draws with, so an input, a select and an editor read the
// same value the same way.

import { alpha, cornerCurve, shape, style, terminal, stroke } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

import { type FieldLook, painted } from "./look";

/**
 * The frame a field draws, as the platform reads it: the theme's, or the terminal's box — a shell's
 * fields are its own grid's, whatever the theme says.
 */
export function fieldDrawn(field: FieldLook): FieldLook {
  if (!terminal) return field;
  return {
    ...field,
    edges: "all",
    width: stroke.control,
    radius: shape.control,
    bottomRadius: shape.control,
    side: { kind: "colour", role: "input" },
    bottom: { kind: "colour", role: "input" },
  };
}

/**
 * A field's corners: the sides' corner and the bottom's, which differ where the theme draws a line
 * (an underline keeps its bottom square).
 */
export function fieldCorners(field: FieldLook): ViewStyle {
  const look = fieldDrawn(field);
  if (look.radius === look.bottomRadius) {
    return { borderRadius: look.radius, ...cornerCurve };
  }
  return {
    borderTopLeftRadius: look.radius,
    borderTopRightRadius: look.radius,
    borderBottomLeftRadius: look.bottomRadius,
    borderBottomRightRadius: look.bottomRadius,
    ...cornerCurve,
  };
}

/**
 * `fieldCorners` for a frame drawn in classes: `rounded-(--radius-control)` names the control radius
 * every theme's field corner names, and a class's corner is a circular one, the curve those frames
 * already draw. The bottom stays square where the theme draws a line under the text.
 */
export function fieldCornerClass(field: FieldLook): string {
  return fieldDrawn(field).bottomRadius === 0
    ? "rounded-t-(--radius-control)"
    : "rounded-(--radius-control)";
}

/** A field's edge widths: every side, or its bottom edge alone for a line. */
export function fieldEdgeWidths(field: FieldLook): ViewStyle {
  const look = fieldDrawn(field);
  const width = look.width;
  return look.edges === "bottom"
    ? { borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: width }
    : { borderWidth: width };
}

/** `fieldEdgeWidths` for a frame drawn in classes: `border` all round, or `border-b` for a line. */
export function fieldEdgeClass(field: FieldLook): string {
  return fieldDrawn(field).edges === "bottom" ? "border-b" : "border";
}

/**
 * A field's edge at rest, in `style`: the sides in the theme's colour where it draws them, and the
 * bottom edge in its own (a box carrying an underline reads the input colour there).
 */
export function fieldRestEdge(field: FieldLook): ViewStyle {
  const look = fieldDrawn(field);
  const bottom = { borderBottomColor: painted(look.bottom) };
  return look.side
    ? { borderColor: painted(look.side), ...bottom }
    : { borderColor: painted(look.bottom) };
}

/**
 * A field's ring, invisible until a state lights it (`fieldFocusEdge`): the two numbers its class
 * form draws (`outline-2 -outline-offset-1`), which are not `focusRing`'s scale.
 */
export function fieldRing(tone: string): ViewStyle {
  return {
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: -1,
    outlineColor: alpha(tone, 0),
  };
}

/** A field's states whose edge a class can say (`edgeClass`'s `focus`). */
export type FieldState = "focus" | "focus-within" | "focus-visible";

/**
 * The line a field draws with the keys, `focus.width` wide, as classes: each size written whole, so
 * no class is ever assembled from a number. The scales state 3; WinUI's 2 is the only other step.
 */
const focusLine = {
  focus: { 2: "focus:border-b-[2px]", 3: "focus:border-b-[3px]" },
  "focus-within": { 2: "focus-within:border-b-[2px]", 3: "focus-within:border-b-[3px]" },
  "focus-visible": { 2: "focus-visible:border-b-[2px]", 3: "focus-visible:border-b-[3px]" },
} as const;

/** The line class a state draws (`edgeClass` adds it): `focus.width` wide, never assembled. */
export function fieldFocusLine(state: FieldState): string {
  return focusLine[state][style().dimension.focus.width === 2 ? 2 : 3];
}

/**
 * A field's edge with the keys, in `style`, in `tone`: the border and the ring together, or for a
 * field whose focus is a line, its bottom edge alone, `focus.width` wide, and no ring.
 */
export function fieldFocusEdge(field: FieldLook, tone: string): ViewStyle {
  const look = fieldDrawn(field);
  const ring = { ...fieldRing(tone), outlineColor: tone };
  if (!look.focusLine) return { ...ring, borderColor: tone };
  return {
    ...ring,
    borderBottomColor: tone,
    borderBottomWidth: style().dimension.focus.width,
    outlineColor: alpha(tone, 0),
  };
}
