// How a theme marks what is selected, focused or editable (`indicator.nav`, `indicator.field`,
// `shape.corners.field`): one place for the shared logic, so every control reads the keys the same way.
import { colors, cornerCurve, rounded, stroke, style, terminal } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

/** The theme marks the selected navigation item with a bar (`indicator.nav: "bar"`) instead of a fill. */
export function navBar(): boolean {
  return style().indicator.nav === "bar";
}

/**
 * The selected item's bar: a short vertical pill, `stroke.indicator` wide, in the accent at the
 * item's leading edge. Draw it as a child of the item, over its content.
 */
export function navBarStyle(): ViewStyle {
  return {
    pointerEvents: "none",
    position: "absolute",
    start: 0,
    top: 8,
    bottom: 8,
    width: stroke.indicator,
    borderRadius: stroke.indicator / 2,
    backgroundColor: colors.brand,
  };
}

/** The theme draws a field as a line under its text (`indicator.field: "underline"`), not a box. */
export function fieldUnderline(): boolean {
  return !terminal && style().indicator.field === "underline";
}

/** A field's corners: all four at `radius`, or the top two only (`shape.corners.field: "top"`). */
export function fieldCorners(radius: number): ViewStyle {
  if (style().shape.corners.field !== "top") return rounded(radius);
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
