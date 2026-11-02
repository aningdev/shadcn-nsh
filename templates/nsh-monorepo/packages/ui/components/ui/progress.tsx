import type { StyleProp, ViewStyle } from "nsh";
import { Progress as BaseProgress, type ProgressProps as BaseProgressProps } from "nsh/base";

import { colors } from "../../lib/theme";

/**
 * Theme layer on `nsh/base` Progress: token track / indicator chrome
 * (shadcn `bases/base` Progress has no `variant` / `size`). All base props
 * + style hooks pass through; consumer styles shallow-merge over defaults.
 * Base owns determinate indicator width from `value`; indeterminate uses a
 * default `w-1/3` indicator class (overridable).
 */
export type ProgressProps = BaseProgressProps;

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

/** Column around the track + label — aligned with shadcn root `gap`. */
function rootChrome(): ViewStyle {
  return {
    gap: 12,
    alignItems: "stretch",
  };
}

/** Track rail (~h-1 / rounded-full) with muted fill — shadcn `bases/base` nova. */
function trackChrome(): ViewStyle {
  return {
    height: 4,
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: colors.muted,
  };
}

/**
 * Indicator fill. Width is omitted while determinate — `nsh/base` sets it from
 * `value`. Indeterminate width comes from `indicatorClass` (`w-1/3` default).
 */
function indicatorChrome(): ViewStyle {
  return {
    height: "100%",
    borderRadius: 9999,
    backgroundColor: colors.primary,
  };
}

export function Progress(props: ProgressProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    trackClass,
    trackStyle,
    indicatorClass,
    indicatorStyle,
    indeterminate,
    ...rest
  } = props;

  return (
    <BaseProgress
      {...rest}
      indeterminate={indeterminate}
      class={mergeClass(undefined, className)}
      style={mergeStyle(rootChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
      trackClass={mergeClass(undefined, trackClass)}
      trackStyle={mergeStyle(trackChrome(), trackStyle)}
      indicatorClass={mergeClass(indeterminate ? "w-1/3" : undefined, indicatorClass)}
      indicatorStyle={mergeStyle(indicatorChrome(), indicatorStyle)}
    />
  );
}
