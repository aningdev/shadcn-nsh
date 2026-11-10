// Source: examples/nsh-gallery-ui/look/field.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, radius } from "@shadcn-nsh/theme";
import type { InputStyle, ViewStyle } from "nsh";

/** What changes a field's edge. `invalid` is this library's; base has no such flag. */
export type FieldChrome = {
  invalid?: boolean;
  readonly?: boolean;
  disabled?: boolean;
};

/** Read-only or disabled: the well lies flat on the quiet line. */
export function fieldFlat(state: FieldChrome): boolean {
  return !!(state.readonly || state.disabled);
}

/** Resting border: danger, the quiet line, or the input edge. */
export function fieldBorder(state: FieldChrome): string {
  if (state.invalid) return colors.destructive;
  if (fieldFlat(state)) return colors.border;
  return colors.input;
}

/**
 * A stronger edge under the pointer. None while invalid, read-only or disabled —
 * the reference drops hover in those states, and focus keeps its own color.
 */
export function fieldHoverStyle(state: FieldChrome): ViewStyle | undefined {
  if (state.invalid || fieldFlat(state)) return undefined;
  // `muted-foreground` stands in for the reference's `faint`: darker than `input`.
  return { borderColor: colors.mutedForeground };
}

/**
 * The 2-point focus edge, on the border (offset −1) so a clipped parent cannot
 * cut it. Danger while invalid. `ring` stands in for the reference's brand edge;
 * `focusRing()` is a 3-point halo and would be clipped.
 */
export function fieldFocusStyle(invalid?: boolean): InputStyle {
  const tone = invalid ? colors.destructive : colors.ring;
  return {
    borderColor: tone,
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: -1,
    outlineColor: tone,
  };
}

/** Recessed while it can be edited; flat when read-only or disabled. */
export function fieldWell(state: FieldChrome): ViewStyle {
  return {
    borderRadius: radius.control,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: fieldBorder(state),
    backgroundColor: colors.background,
    // `finish.field` in the reference; this theme's sunk control is the same recess.
    ...(fieldFlat(state) ? {} : { boxShadow: finish.control.pressed }),
  };
}

/**
 * Color transition on a well's class, so `motion-reduce` can cancel it.
 * An inline `transitionDuration` would beat that class.
 */
export const fieldTransitionClass = "transition-colors duration-150 motion-reduce:transition-none";

/** The one disabled look, on the root. */
export function fieldDisabledStyle(): ViewStyle {
  return { opacity: disabledOpacity() };
}
