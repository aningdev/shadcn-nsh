// Source: examples/nsh-gallery-ui/look/field.tsx @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors } from "@shadcn-nsh/theme";
import type { InputStyle, StyleProp, ViewStyle } from "nsh";
import { computed, split, Text } from "nsh";
import {
  NumberInput as BaseNumberInput,
  type NumberInputProps as BaseNumberInputProps,
} from "nsh/base";

import { isPointer } from "./lib/density";
import {
  fieldDisabledStyle,
  fieldFocusStyle,
  fieldHoverStyle,
  fieldTransitionClass,
  fieldWell,
  type FieldChrome,
} from "./lib/field";

/**
 * Theme layer on `nsh/base` NumberInput. No `variant` / `size`. `invalid` is this
 * wrapper's. `controlsRight` defaults to `true` (a pair at the end); base itself
 * defaults to a split. Every base prop passes through; consumer styles win per key.
 */
export type NumberInputProps = BaseNumberInputProps & {
  /** Danger edge on the well, including the focus edge. */
  invalid?: boolean;
};

type NumberLook = {
  style: ViewStyle;
  hoverStyle?: ViewStyle;
  focusWithinStyle: ViewStyle;
  disabledStyle: ViewStyle;
  inputStyle: InputStyle;
  decrementButtonStyle: ViewStyle;
  incrementButtonStyle: ViewStyle;
  controlsStyle?: ViewStyle;
  /** − / + size. Chevrons in the pair are two points smaller. */
  glyph: number;
};

/** Step buttons: lit under the pointer, darker while pressed, faded where a step does nothing. */
const STEP_PRESS =
  "items-center justify-center transition-colors duration-100 motion-reduce:transition-none enabled:hover:bg-accent active:bg-muted disabled:opacity-50";

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<S>(
  base?: StyleProp<S> | null,
  consumer?: StyleProp<S> | null,
): StyleProp<S> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * The number well: 32 high with a pointer, 44 on a touch screen (the reference's
 * `h-8` / `h-11`), text 14 / 15. A pair of chevrons at the end, or − / + split
 * around the field. Glyphs are text: this package does not ship the gallery's icons.
 */
function look(state: FieldChrome & { controlsRight?: boolean }): NumberLook {
  const pointer = isPointer();
  const min = pointer ? 32 : 44;
  const pair = state.controlsRight ?? true;
  const step = min;
  return {
    style: {
      flexDirection: "row",
      alignItems: "stretch",
      overflow: "hidden",
      minHeight: min,
      ...fieldWell(state),
    },
    hoverStyle: fieldHoverStyle(state),
    focusWithinStyle: fieldFocusStyle(state.invalid),
    disabledStyle: fieldDisabledStyle(),
    inputStyle: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: 8,
      fontSize: pointer ? 14 : 15,
      color: state.readonly ? colors.mutedForeground : colors.foreground,
      placeholderColor: alpha(colors.mutedForeground, 0.7),
      fontVariant: ["tabular-nums"],
      backgroundColor: "transparent",
    },
    decrementButtonStyle: pair
      ? { flex: 1 }
      : { width: step, borderRightWidth: 1, borderRightColor: colors.border },
    incrementButtonStyle: pair
      ? { flex: 1, borderBottomWidth: 1, borderBottomColor: colors.border }
      : { width: step, borderLeftWidth: 1, borderLeftColor: colors.border },
    controlsStyle: pair
      ? { width: step, borderLeftWidth: 1, borderLeftColor: colors.border }
      : undefined,
    glyph: pointer ? 16 : 18,
  };
}

/** The number well's chrome. Call it where the props are read. */
export function numberInputVariants(
  options?: FieldChrome & { controlsRight?: boolean },
): NumberLook {
  return look({
    invalid: !!options?.invalid,
    readonly: !!options?.readonly,
    disabled: !!options?.disabled,
    controlsRight: options?.controlsRight,
  });
}

/** A number with step buttons. Glyphs are text: this package does not ship the gallery's icons. */
export function NumberInput(props: NumberInputProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "focusWithinStyle",
    "disabledStyle",
    "inputStyle",
    "decrementButtonClass",
    "decrementButtonStyle",
    "decrementButton",
    "incrementButtonClass",
    "incrementButtonStyle",
    "incrementButton",
    "controlsStyle",
    "invalid",
    "controlsRight",
  ]);

  const current = computed(() =>
    numberInputVariants({
      invalid: props.invalid,
      readonly: props.readonly,
      disabled: props.disabled,
      controlsRight: props.controlsRight,
    }),
  );

  const pair = () => props.controlsRight ?? true;
  const glyphStyle = () => {
    const size = pair() ? current().glyph - 2 : current().glyph;
    return {
      fontSize: size,
      lineHeight: size + 2,
      color: colors.mutedForeground,
    };
  };

  return (
    <BaseNumberInput
      {...rest}
      controlsRight={props.controlsRight ?? true}
      class={mergeClass(fieldTransitionClass, props.class)}
      style={mergeStyle(current().style, props.style)}
      hoverStyle={
        current().hoverStyle != null
          ? mergeStyle(current().hoverStyle, props.hoverStyle)
          : props.hoverStyle
      }
      focusWithinStyle={mergeStyle(current().focusWithinStyle, props.focusWithinStyle)}
      disabledStyle={mergeStyle(current().disabledStyle, props.disabledStyle)}
      inputStyle={mergeStyle(current().inputStyle, props.inputStyle)}
      decrementButtonClass={mergeClass(STEP_PRESS, props.decrementButtonClass)}
      incrementButtonClass={mergeClass(STEP_PRESS, props.incrementButtonClass)}
      decrementButtonStyle={mergeStyle(current().decrementButtonStyle, props.decrementButtonStyle)}
      incrementButtonStyle={mergeStyle(current().incrementButtonStyle, props.incrementButtonStyle)}
      controlsStyle={
        current().controlsStyle != null
          ? mergeStyle(current().controlsStyle, props.controlsStyle)
          : props.controlsStyle
      }
      decrementButton={
        props.decrementButton ?? <Text style={glyphStyle()}>{pair() ? "▼" : "−"}</Text>
      }
      incrementButton={
        props.incrementButton ?? <Text style={glyphStyle()}>{pair() ? "▲" : "+"}</Text>
      }
    />
  );
}
