import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { View } from "nsh";
import {
  Radio as BaseRadio,
  RadioGroup as BaseRadioGroup,
  type RadioGroupProps as BaseRadioGroupProps,
  type RadioProps as BaseRadioProps,
} from "nsh/base";

/**
 * Theme layer on `nsh/base` RadioGroup: default column gap only
 * (shadcn `bases/base` RadioGroup has no `variant` / `size`). All base props
 * + style hooks pass through; consumer styles shallow-merge over defaults.
 */
export type RadioGroupProps = BaseRadioGroupProps;

/**
 * Theme layer on `nsh/base` Radio: token circle + label row
 * (shadcn `bases/base` Item has no `variant` / `size`). All base props
 * + style hooks pass through; consumer styles shallow-merge over defaults.
 * shadcn name: `RadioGroupItem`; `Radio` is the nsh/base-aligned alias.
 */
export type RadioProps = BaseRadioProps;
export type RadioGroupItemProps = RadioProps;

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/** Group column gap — aligned with shadcn `cn-radio-group` stack spacing. */
function groupChrome(): ViewStyle {
  return { gap: 8 };
}

/** Row around the indicator + label — aligned with shadcn horizontal Field + item. */
function rootChrome(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  };
}

/** Outer ring (~size-4) with primary border while checked. */
function indicatorChrome(on: boolean): ViewStyle {
  return {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: on ? colors.primary : colors.input,
    alignItems: "center",
    justifyContent: "center",
  };
}

/** Inner dot shown while checked. */
function dotChrome(): ViewStyle {
  return {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  };
}

function defaultIndicator(checked?: boolean): JSX.Element {
  return (
    <View style={indicatorChrome(!!checked)}>{checked ? <View style={dotChrome()} /> : null}</View>
  );
}

export function RadioGroup(props: RadioGroupProps) {
  const { class: className, style, ...rest } = props;

  return (
    <BaseRadioGroup
      {...rest}
      class={mergeClass(undefined, className)}
      style={mergeStyle(groupChrome(), style)}
    />
  );
}

/**
 * One option in a `RadioGroup` (shadcn `RadioGroupItem`).
 * Composes a default circle indicator ahead of label `children` — base has no
 * `indicator` prop; the look is children content.
 */
export function RadioGroupItem(props: RadioGroupItemProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    checkedStyle,
    checked,
    children,
    ...rest
  } = props;

  return (
    <BaseRadio
      {...rest}
      checked={checked}
      class={mergeClass(undefined, className)}
      style={mergeStyle(rootChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle({ opacity: 0.5 }, disabledStyle)}
      checkedStyle={mergeStyle(undefined, checkedStyle)}
    >
      {defaultIndicator(checked)}
      {children}
    </BaseRadio>
  );
}

/** nsh/base-aligned alias for {@link RadioGroupItem}. */
export const Radio = RadioGroupItem;
