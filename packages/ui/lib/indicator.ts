// How a control preset marks a focused or editable field (`indicator`, `corners`): one place for
// the shared logic, so every field control reads the preset the same way.
import {
  alpha,
  colors,
  controls,
  cornerCurve,
  rounded,
  stroke,
  style,
  terminal,
  type Controls,
} from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

/**
 * How a preset draws a field's frame: `box` all round in the input color, `underline` a line under
 * the text, or `box-underline` a box in the hairline `border` color whose bottom edge is the input color.
 */
export type FieldIndicator = "box" | "underline" | "box-underline";

/** Preset options controlling how form fields draw their resting frame and corners. */
export interface FieldPreset {
  indicator: FieldIndicator;
  corners: "all" | "top";
}

/** Field frame presets keyed by the active theme's `controls()` family. */
export const fieldPresets: Record<Controls, FieldPreset> = {
  base: { indicator: "box", corners: "all" },
  material: { indicator: "underline", corners: "top" },
  winui: { indicator: "box-underline", corners: "all" },
};

/**
 * How the active preset draws a field's frame. The terminal keeps its own box whatever the preset:
 * a shell's fields are its own grid's.
 */
export function fieldIndicator(): FieldIndicator {
  return terminal ? "box" : fieldPresets[controls()].indicator;
}

/** A field's corners: all four at `radius`, or the top two only (`corners: "top"`). */
export function fieldCorners(radius: number): ViewStyle {
  if (fieldPresets[controls()].corners !== "top") return rounded(radius);
  const top = rounded(radius).borderRadius as number;
  return {
    borderTopLeftRadius: top,
    borderTopRightRadius: top,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...cornerCurve,
  };
}

/**
 * `fieldCorners` for a frame drawn in classes: `rounded-(--radius-control)` names the same token,
 * and a class's corner is a circular one, the curve those frames already draw.
 */
export function fieldCornerClass(): string {
  return fieldPresets[controls()].corners === "top"
    ? "rounded-t-(--radius-control)"
    : "rounded-(--radius-control)";
}

/** A field's edge widths: `stroke.control` all round, or its bottom edge alone for an underline. */
export function fieldEdgeWidths(): ViewStyle {
  return fieldIndicator() === "underline"
    ? {
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: stroke.control,
      }
    : { borderWidth: stroke.control };
}

/** `fieldEdgeWidths` for a frame drawn in classes: `border` all round, or `border-b` for an underline. */
export function fieldEdgeClass(): string {
  return fieldIndicator() === "underline" ? "border-b" : "border";
}

/**
 * A field's edge at rest, in `style`: a box in the input color, a line in the muted foreground, or
 * a box in `border` whose bottom edge is the input color (WinUI's `TextBox`: `ControlStrokeColorDefault`
 * on three sides, `ControlStrongStrokeColorDefault` below).
 */
export function fieldRestEdge(input: string): ViewStyle {
  switch (fieldIndicator()) {
    case "underline":
      return { borderColor: colors.mutedForeground };
    case "box-underline":
      return { borderColor: colors.border, borderBottomColor: input };
    default:
      return { borderColor: input };
  }
}

/**
 * The class a field's line takes with the keys: `focus.width` of the accent, in place of the ring.
 */
export function fieldFocusClass(focus: string): string {
  const w = style().dimension.focus.width;
  return `${focus}:border-b-[${w}px]`;
}

/**
 * A field's edge with the keys, in `style`, in `tone`: the border and the outline together, or for a
 * box-underline its bottom edge alone, `focus.width` wide, and no ring.
 */
export function fieldFocusEdge(tone: string): ViewStyle {
  if (fieldIndicator() !== "box-underline") return { borderColor: tone, outlineColor: tone };
  return {
    borderBottomColor: tone,
    borderBottomWidth: style().dimension.focus.width,
    outlineColor: alpha(tone, 0),
  };
}
