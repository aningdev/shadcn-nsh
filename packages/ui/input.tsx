import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { InputStyle, StyleProp } from "nsh";
import { Input as BaseInput, type InputProps as BaseInputProps } from "nsh/base";

/**
 * Theme layer on `nsh/base` Input: token chrome only (shadcn `bases/base` Input
 * has no `variant` / `size`). All base props + style hooks pass through;
 * consumer styles shallow-merge over defaults.
 */
export type InputProps = BaseInputProps;

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
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

/** Default look aligned with shadcn `cn-input` (h-8-ish) + theme tokens. */
function inputChrome(multiline: boolean): InputStyle {
  return {
    height: multiline ? undefined : 32,
    minHeight: multiline ? 80 : 32,
    paddingHorizontal: 10,
    paddingVertical: multiline ? 8 : 0,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
    color: colors.foreground,
    placeholderColor: colors.mutedForeground,
    fontSize: 14,
    transitionProperty: "border-color, background-color, opacity",
    transitionDuration: 120,
  };
}

export function Input(props: InputProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    multiline,
    ...rest
  } = props;

  return (
    <BaseInput
      {...rest}
      multiline={multiline}
      class={mergeClass(undefined, className)}
      style={mergeStyle(inputChrome(!!multiline), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle({ opacity: 0.5 }, disabledStyle)}
    />
  );
}
