// Source: examples/nsh-gallery-ui/look/switch.ts, switch-geometry.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, focusRing } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, split } from "nsh";
import { Switch as BaseSwitch, type SwitchProps as BaseSwitchProps } from "nsh/base";

import { isPointer, TOUCH_TARGET } from "./lib/density";
import { follow, springs } from "./lib/follow";

/** Aligns with shadcn `bases/base` Switch `size`. */
export type SwitchSize = "default" | "sm";

/**
 * Theme layer on `nsh/base` Switch: a sunk track that fills when on, and a knob that springs
 * across natively. All base props + style hooks pass through; consumer styles win per key.
 */
export type SwitchProps = BaseSwitchProps & {
  size?: SwitchSize;
};

/** A switch's track and knob, in points. */
export type SwitchGeometry = {
  /** The track's outer width. */
  width: number;
  /** The track's outer height. */
  height: number;
  /** The track's border, on every side. */
  border: number;
  /** The track's padding, between its border and the knob, on every side. */
  inset: number;
  /** The knob's diameter. */
  knob: number;
};

/**
 * The sizes: 28 × 16 with a pointer, whichever `size`; on a touch screen 42 × 24 (`sm`: 34 × 20).
 * The track is exactly the knob plus its border and inset on each side, so the knob sits as far
 * from the top and the bottom as from the near end.
 */
export function switchGeometry(size: SwitchSize, pointer: boolean): SwitchGeometry {
  if (pointer) return { width: 28, height: 16, border: 1, inset: 1, knob: 12 };
  if (size === "sm") return { width: 34, height: 20, border: 1, inset: 1, knob: 16 };
  return { width: 42, height: 24, border: 1, inset: 1, knob: 20 };
}

/**
 * How far the knob travels from off to on. Off, it rests `border + inset` from the leading edge;
 * on, it must end the same distance from the trailing edge.
 */
export function knobTravel(g: SwitchGeometry): number {
  return g.width - 2 * (g.border + g.inset) - g.knob;
}

/** How far presses count past a switch that is all track, so a finger gets 44pt on each axis. */
export function switchSlop(g: SwitchGeometry) {
  const v = Math.max(0, (TOUCH_TARGET - g.height) / 2);
  const h = Math.max(0, (TOUCH_TARGET - g.width) / 2);
  return { top: v, bottom: v, left: h, right: h };
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

/** Row around the track + label — aligned with shadcn horizontal Field + switch. */
function rootChrome(): ViewStyle {
  return { flexDirection: "row", alignItems: "center", gap: 8 };
}

/** A switch: a sunk track and a knob that springs across; every base prop passes through. */
export function Switch(props: SwitchProps) {
  // Props are read where used (never destructured) so `checked` / `size` follow signals.
  const [, rest] = split(props, [
    "size",
    "style",
    "focusStyle",
    "disabledStyle",
    "trackStyle",
    "thumbStyle",
    "hitSlop",
  ]);

  const geometry = computed(() => switchGeometry(props.size ?? "default", isPointer()));
  const on = () => !!props.checked;
  const progress = follow(() => (on() ? 1 : 0), springs.move);
  const travel = computed(() =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [0, knobTravel(geometry())] }),
  );

  const track = (): ViewStyle => {
    const g = geometry();
    return {
      width: g.width,
      height: g.height,
      borderRadius: g.height / 2,
      padding: g.inset,
      borderWidth: g.border,
      backgroundColor: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.input, colors.primary],
      }),
      borderColor: on() ? colors.primary : colors.border,
      // Off, a sunk well; on, the filled control's edge.
      boxShadow: on() ? finish.filled : finish.control.pressed,
      transitionProperty: "border-color, box-shadow",
      transitionDuration: 150,
    };
  };

  const thumb = (): ViewStyle => {
    const g = geometry();
    return {
      width: g.knob,
      height: g.knob,
      borderRadius: g.knob / 2,
      borderWidth: 1,
      borderColor: colors.border,
      // On, the knob takes the foreground of the track's fill (the track is `primary`, which is
      // near-white in the dark appearance, so a white knob would vanish on it).
      backgroundColor: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.highlight, colors.primaryForeground],
      }),
      boxShadow: finish.control.flat,
      transform: [{ translateX: travel() }],
    };
  };

  return (
    <BaseSwitch
      {...rest}
      hitSlop={
        props.hitSlop ?? (props.children || isPointer() ? undefined : switchSlop(geometry()))
      }
      style={mergeStyle(rootChrome(), props.style)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      disabledStyle={mergeStyle({ opacity: disabledOpacity() }, props.disabledStyle)}
      trackStyle={mergeStyle(track(), props.trackStyle)}
      thumbStyle={mergeStyle(thumb(), props.thumbStyle)}
    />
  );
}
