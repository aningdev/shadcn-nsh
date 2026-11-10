import { colors, disabledOpacity, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { Text, View } from "nsh";
import { Checkbox as BaseCheckbox, type CheckboxProps as BaseCheckboxProps } from "nsh/base";

/**
 * Theme layer on `nsh/base` Checkbox: token chrome + default mark
 * (shadcn `bases/base` Checkbox has no `variant` / `size`). All base props
 * + style hooks pass through; consumer styles shallow-merge over defaults.
 */
export type CheckboxProps = BaseCheckboxProps;

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

function CheckMark() {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: colors.primaryForeground,
        lineHeight: 14,
      }}
    >
      ✓
    </Text>
  );
}

function DashMark() {
  return (
    <View
      style={{ width: 10, height: 2, borderRadius: 1, backgroundColor: colors.primaryForeground }}
    />
  );
}

/** Row around the indicator + label — aligned with shadcn horizontal Field + checkbox. */
function rootChrome(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  };
}

/** Indicator box (~size-4) with primary fill while checked / indeterminate. */
function indicatorChrome(on: boolean): ViewStyle {
  return {
    width: 16,
    height: 16,
    borderRadius: Math.min(4, radius.control),
    borderWidth: 1,
    borderColor: on ? colors.primary : colors.input,
    backgroundColor: on ? colors.primary : "transparent",
    alignItems: "center",
    justifyContent: "center",
  };
}

function defaultIndicator(checked?: boolean, indeterminate?: boolean): JSX.Element {
  if (indeterminate) return <DashMark />;
  if (checked) return <CheckMark />;
  return <View style={{ width: 16, height: 16 }} />;
}

export function Checkbox(props: CheckboxProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    checkedStyle,
    indeterminateStyle,
    indicatorClass,
    indicatorStyle,
    indicator,
    checked,
    indeterminate,
    ...rest
  } = props;

  const on = !!checked || !!indeterminate;

  return (
    <BaseCheckbox
      {...rest}
      checked={checked}
      indeterminate={indeterminate}
      class={mergeClass(undefined, className)}
      style={mergeStyle(rootChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle({ opacity: disabledOpacity() }, disabledStyle)}
      checkedStyle={mergeStyle(undefined, checkedStyle)}
      indeterminateStyle={mergeStyle(undefined, indeterminateStyle)}
      indicatorClass={mergeClass(undefined, indicatorClass)}
      indicatorStyle={mergeStyle(indicatorChrome(on), indicatorStyle)}
      indicator={indicator ?? defaultIndicator(checked, indeterminate)}
    />
  );
}
