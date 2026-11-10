// Source: examples/nsh-gallery-ui/look/field.tsx @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors } from "@shadcn-nsh/theme";
import type { InputStyle, StyleProp } from "nsh";
import { computed, split } from "nsh";
import { Input as BaseInput, type InputProps as BaseInputProps } from "nsh/base";

import { isPointer, touchHitSlop } from "./lib/density";
import {
  fieldDisabledStyle,
  fieldFocusStyle,
  fieldHoverStyle,
  fieldTransitionClass,
  fieldWell,
  type FieldChrome,
} from "./lib/field";

/**
 * Theme layer on `nsh/base` Input. shadcn `bases/base` Input has no `variant` / `size`.
 * `invalid` is this wrapper's (base has no such flag). Every base prop passes through;
 * consumer styles win per key.
 */
export type InputProps = BaseInputProps & {
  /** Danger edge, including the focus edge. */
  invalid?: boolean;
};

type InputLook = {
  style: InputStyle;
  hoverStyle?: InputStyle;
  focusStyle: InputStyle;
  disabledStyle: InputStyle;
  hitSlop?: number;
};

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<InputStyle> | null,
  consumer?: StyleProp<InputStyle> | null,
): StyleProp<InputStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * The lone field. Pointer: 28 high, text 13, 8 points of padding. Touch: 46, text 15,
 * 14 points of padding. Heights are minimums (R5). One line is 28 or 46; several lines reserve three (72 or 108).
 * Placeholder is fainter than read-only text (both `muted-foreground`; the reference
 * has separate `faint` and `muted`).
 */
function look(state: FieldChrome & { multiline?: boolean }): InputLook {
  const pointer = isPointer();
  const min = pointer ? 28 : 46;
  const box = state.multiline
    ? {
        minHeight: pointer ? 72 : 108,
        paddingTop: pointer ? 6 : 13,
        paddingBottom: pointer ? 6 : 13,
        alignItems: "flex-start" as const,
      }
    : { minHeight: min };
  return {
    style: {
      paddingHorizontal: pointer ? 8 : 14,
      fontSize: pointer ? 13 : 15,
      color: state.readonly ? colors.mutedForeground : colors.foreground,
      placeholderColor: alpha(colors.mutedForeground, 0.7),
      caretColor: colors.ring,
      selectionColor: colors.ring,
      ...box,
      ...fieldWell(state),
    },
    hoverStyle: fieldHoverStyle(state),
    focusStyle: fieldFocusStyle(state.invalid),
    disabledStyle: fieldDisabledStyle(),
    hitSlop: touchHitSlop(min),
  };
}

/** The lone field's chrome. Call it where the props are read. */
export function inputVariants(options?: FieldChrome & { multiline?: boolean }): InputLook {
  return look({
    invalid: !!options?.invalid,
    readonly: !!options?.readonly,
    disabled: !!options?.disabled,
    multiline: !!options?.multiline,
  });
}

/** A text field: the field well on `nsh/base` Input. Every base prop passes through. */
export function Input(props: InputProps) {
  // Props are read where used (never destructured) so `invalid` / `style` follow signals.
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "focusStyle",
    "disabledStyle",
    "hitSlop",
    "invalid",
  ]);

  const current = computed(() =>
    inputVariants({
      invalid: props.invalid,
      readonly: props.readonly,
      disabled: props.disabled,
      multiline: props.multiline,
    }),
  );

  return (
    <BaseInput
      {...rest}
      hitSlop={props.hitSlop ?? current().hitSlop}
      class={mergeClass(fieldTransitionClass, props.class)}
      style={mergeStyle(current().style, props.style)}
      hoverStyle={
        current().hoverStyle != null
          ? mergeStyle(current().hoverStyle, props.hoverStyle)
          : props.hoverStyle
      }
      focusStyle={mergeStyle(current().focusStyle, props.focusStyle)}
      disabledStyle={mergeStyle(current().disabledStyle, props.disabledStyle)}
    />
  );
}
