import { colors, disabledOpacity, focusRing } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { Switch as BaseSwitch, type SwitchProps as BaseSwitchProps } from "nsh/base";

/** Aligns with shadcn `bases/base` Switch `size`. */
export type SwitchSize = "default" | "sm";

/**
 * Theme layer on `nsh/base` Switch: token track / thumb chrome + `size`
 * (shadcn `bases/base` Switch). All base props + style hooks pass through;
 * consumer styles shallow-merge over defaults.
 */
export type SwitchProps = BaseSwitchProps & {
  size?: SwitchSize;
};

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

type SizeLook = {
  trackWidth: number;
  trackHeight: number;
  trackRadius: number;
  trackPadding: number;
  thumbSize: number;
  thumbTranslateClass: string;
};

/** Sizes aligned with shadcn `bases/base` + nova token scale (not CSS-pixel locked). */
function sizeLook(size: SwitchSize): SizeLook {
  switch (size) {
    case "sm":
      // travel = 28 − 2×2 − 12 = 12 → translate-x-3
      return {
        trackWidth: 28,
        trackHeight: 16,
        trackRadius: 8,
        trackPadding: 2,
        thumbSize: 12,
        thumbTranslateClass: "checked:translate-x-3",
      };
    default:
      // travel = 36 − 2×2 − 16 = 16 → translate-x-4
      return {
        trackWidth: 36,
        trackHeight: 20,
        trackRadius: 10,
        trackPadding: 2,
        thumbSize: 16,
        thumbTranslateClass: "checked:translate-x-4",
      };
  }
}

/** Row around the track + label — aligned with shadcn horizontal Field + switch. */
function rootChrome(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  };
}

/** Track pill with primary fill while checked. */
function trackChrome(on: boolean, look: SizeLook): ViewStyle {
  return {
    width: look.trackWidth,
    height: look.trackHeight,
    borderRadius: look.trackRadius,
    padding: look.trackPadding,
    backgroundColor: on ? colors.primary : colors.input,
    justifyContent: "center",
  };
}

/** Thumb circle inside the track. */
function thumbChrome(look: SizeLook): ViewStyle {
  return {
    width: look.thumbSize,
    height: look.thumbSize,
    borderRadius: look.thumbSize / 2,
    backgroundColor: colors.background,
  };
}

export function Switch(props: SwitchProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    checkedStyle,
    trackClass,
    trackStyle,
    thumbClass,
    thumbStyle,
    checked,
    size = "default",
    ...rest
  } = props;

  const look = sizeLook(size);
  const on = !!checked;

  return (
    <BaseSwitch
      {...rest}
      checked={checked}
      class={mergeClass(undefined, className)}
      style={mergeStyle(rootChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle({ opacity: disabledOpacity() }, disabledStyle)}
      checkedStyle={mergeStyle(undefined, checkedStyle)}
      trackClass={mergeClass(undefined, trackClass)}
      trackStyle={mergeStyle(trackChrome(on, look), trackStyle)}
      thumbClass={mergeClass(look.thumbTranslateClass, thumbClass)}
      thumbStyle={mergeStyle(thumbChrome(look), thumbStyle)}
    />
  );
}
