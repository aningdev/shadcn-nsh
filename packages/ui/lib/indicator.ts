// How a control preset marks a focused or editable field (`indicator`, `corners`): one place for
// the shared logic, so every field control reads the preset the same way.
import {
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

/** Preset options controlling how form fields draw their resting frame and corners. */
export interface FieldPreset {
  indicator: "box" | "underline";
  corners: "all" | "top";
}

/** Field frame presets keyed by the active theme's `controls()` family. */
export const fieldPresets: Record<Controls, FieldPreset> = {
  base: { indicator: "box", corners: "all" },
  material: { indicator: "underline", corners: "top" },
  winui: { indicator: "underline", corners: "all" },
};

/** The active preset draws a field as a line under its text (`indicator: "underline"`), not a box. */
export function fieldUnderline(): boolean {
  return !terminal && fieldPresets[controls()].indicator === "underline";
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

/** A field's edge widths: `stroke.control` all round, or its bottom edge alone for an underline. */
export function fieldEdgeWidths(): ViewStyle {
  return fieldUnderline()
    ? {
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: stroke.control,
      }
    : { borderWidth: stroke.control };
}

/** A field's edge colour at rest: the input line, or for an underline the muted foreground. */
export function fieldRestColor(input: string): string {
  return fieldUnderline() ? colors.mutedForeground : input;
}

/** The class a field's edge takes at rest and its focus, for an underline: the focus edge is `focus.width` of the accent, in place of the ring. */
export function underlineFocusClass(focus: string): string {
  const w = style().dimension.focus.width;
  return `${focus}:border-b-[${w}px]`;
}
