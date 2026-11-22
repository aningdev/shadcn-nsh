// A switch: the look (`switchLook`) and the `Switch` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  colors,
  finish,
  follow,
  hitTarget,
  motion,
  type SwitchDim,
  switchGeometry,
  terminal,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
  stroke,
} from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { split } from "nsh";
import { Switch as BaseSwitch, type SwitchProps as BaseSwitchProps } from "nsh/base";

import { PILL_RADIUS } from "./lib/surface";
import { type SwitchGeometry, switchSlop } from "./lib/switch-geometry";

// @port look/switch.ts
/** A switch's size on a touch screen (`sm` 34 × 20); with a pointer both are 28 × 16. */
export type SwitchSize = "sm" | "default";

/** The props `switchLook` gives a `Switch`. */
export interface SwitchLook {
  /** Mirrors the track right to left, so the knob rests at the start there. */
  readonly trackClass: string;
  readonly trackStyle: ViewStyle;
  readonly thumbClass: string;
  readonly thumbStyle: ViewStyle;
}

interface ResolvedSwitchGeometry extends SwitchGeometry {
  onBorder: number;
  onKnob: number;
  knobHover: number;
  knobPressedWidth: number;
  knobPressedHeight: number;
  knobFeedback: SwitchDim["knob-feedback"];
}

/** The track and knob of a size, here (read from the active theme's `dimension.switch`, or the terminal). */
function geometry(size: SwitchSize): ResolvedSwitchGeometry {
  if (terminal)
    return {
      width: 5 * TERMINAL_COLUMN,
      height: TERMINAL_ROW,
      border: 1,
      inset: 0,
      knob: TERMINAL_ROW,
      onBorder: 1,
      onKnob: TERMINAL_ROW,
      knobHover: TERMINAL_ROW,
      knobPressedWidth: TERMINAL_ROW,
      knobPressedHeight: TERMINAL_ROW,
      knobFeedback: "none",
    };
  const g = switchGeometry();
  const sm = size === "sm";
  const width = sm ? g["sm-width"] : g.width;
  const height = sm ? g["sm-height"] : g.height;
  const knob = sm ? g["sm-knob"] : g.knob;
  return {
    width,
    height,
    border: g.border,
    inset: Math.max(0, (height - knob) / 2 - g.border),
    knob,
    onBorder: g["on-border"],
    onKnob: sm ? g["sm-on-knob"] : g["on-knob"],
    knobHover: g["knob-hover"],
    knobPressedWidth: g["knob-pressed-width"],
    knobPressedHeight: g["knob-pressed-height"],
    knobFeedback: g["knob-feedback"],
  };
}

/**
 * The gallery's switch, as the props of `Switch`'s parts (spread them:
 * `<Switch {...switchLook(() => on())}>`): track, knob geometry, border, and
 * hover/press knob feedback come from `dimension.switch[tier]`. `on` is the value
 * the app owns: the knob follows it, from a press or from elsewhere.
 */
export function switchLook(on: () => boolean, size: SwitchSize = "default"): SwitchLook {
  const t = follow(() => (on() ? 1 : 0), motion.move);
  let cachedTravel = geometry(size).width - geometry(size).height;
  let cachedX = t.interpolate({ inputRange: [0, 1], outputRange: [0, cachedTravel] });
  const travelX = () => {
    const g = geometry(size);
    const next = g.width - g.height;
    if (next !== cachedTravel) {
      cachedTravel = next;
      cachedX = t.interpolate({ inputRange: [0, 1], outputRange: [0, cachedTravel] });
    }
    return cachedX;
  };
  return {
    // The knob sits at the track's physical left (`left`, which keeps its
    // side) and travels right; right to left the whole track is mirrored, so
    // it rests at the start and springs toward the end in either direction.
    trackClass: "rtl:-scale-x-100",
    get trackStyle(): ViewStyle {
      const g = geometry(size);
      const checked = on();
      return {
        width: g.width,
        height: g.height,
        borderRadius: g.height / 2,
        padding: g.inset,
        backgroundColor: t.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.track, colors.brandFill],
        }),
        borderWidth: checked ? g.onBorder : g.border,
        borderColor: checked ? finish.fill.borderColor : finish.track.borderColor,
        boxShadow: checked ? finish.fill.boxShadow : finish.track.boxShadow,
        transitionProperty: "border-color, box-shadow",
        transitionDuration: 150,
      };
    },
    get thumbClass(): string {
      const g = geometry(size);
      if (g.knobFeedback === "expand") {
        const offPad = (g.knobPressedWidth - g.knob) / 2;
        const onPad = (g.knobPressedWidth - g.onKnob) / 2;
        return `w-[${g.knob}px] h-[${g.knob}px] checked:w-[${g.onKnob}px] checked:h-[${g.onKnob}px] active:w-[${g.knobPressedWidth}px] active:h-[${g.knobPressedHeight}px] active:-ml-[${offPad}px] active:-mt-[${offPad}px] checked:active:w-[${g.knobPressedWidth}px] checked:active:h-[${g.knobPressedHeight}px] checked:active:-ml-[${onPad}px] checked:active:-mt-[${onPad}px] transition-all duration-150 motion-reduce:transition-none`;
      }
      if (g.knobFeedback === "stretch") {
        const hoverPad = (g.knobHover - g.knob) / 2;
        const pressV = (g.knobPressedHeight - g.knob) / 2;
        const pressOnLeft = g.knobPressedWidth - g.knob - hoverPad;
        return `w-[${g.knob}px] h-[${g.knob}px] hover:w-[${g.knobHover}px] hover:h-[${g.knobHover}px] hover:-ml-[${hoverPad}px] hover:-mt-[${hoverPad}px] active:w-[${g.knobPressedWidth}px] active:h-[${g.knobPressedHeight}px] active:-ml-[${hoverPad}px] active:-mt-[${pressV}px] checked:active:w-[${g.knobPressedWidth}px] checked:active:h-[${g.knobPressedHeight}px] checked:active:-ml-[${pressOnLeft}px] checked:active:-mt-[${pressV}px] transition-all duration-100 motion-reduce:transition-none`;
      }
      return "";
    },
    get thumbStyle(): ViewStyle {
      const g = geometry(size);
      const checked = on();
      const knobNow = checked ? g.onKnob : g.knob;
      const borderNow = checked ? g.onBorder : g.border;
      const offset = g.height / 2 - borderNow - knobNow / 2;
      const sized =
        g.knobFeedback === "none"
          ? { width: knobNow, height: knobNow, borderRadius: knobNow / 2 }
          : { borderRadius: PILL_RADIUS };
      return {
        position: "absolute",
        // physical: the knob's travel is a translateX from the track's left edge, and transforms do not mirror.
        left: offset,
        top: offset,
        ...sized,
        borderWidth: stroke.control,
        ...(checked ? finish.knobOn : finish.knob),
        transform: [{ translateX: travelX() }],
      };
    },
  };
}

/**
 * The hit slop of a switch that stands alone (its track is all of it), so
 * a finger gets 44 points without the track looking bigger: none with a
 * pointer or in the terminal. Leave it off a switch that is a row with its
 * label: the row is the target, and a slop would reach into the rows next
 * to it, which take presses before it where they overlap.
 */
export function switchHitSlop(
  size: SwitchSize = "default",
): { top: number; bottom: number; left: number; right: number } | undefined {
  const hit = hitTarget();
  return terminal || hit <= 0 ? undefined : switchSlop(geometry(size), hit);
}
// @port end

/**
 * `nsh/base`'s Switch in the look of `switchLook`. Every base prop passes through; `trackClass`,
 * `trackStyle` and `thumbStyle` go over the look's.
 */
export type SwitchProps = BaseSwitchProps & {
  /** Its size on a touch screen (default `default`); read once, as `switchLook` does. */
  size?: SwitchSize;
};

/**
 * A switch. Alone (no children) it takes `switchHitSlop`, so a finger gets 44 points; with
 * children it is a row with its label, and the row is the target.
 */
export function Switch(props: SwitchProps) {
  const [, rest] = split(props, [
    "size",
    "trackClass",
    "trackStyle",
    "thumbClass",
    "thumbStyle",
    "hitSlop",
  ]);
  const size = props.size ?? "default";
  const look = switchLook(() => props.checked ?? false, size);
  const resolvedThumbClass = () => {
    const base = look.thumbClass;
    if (base && props.thumbClass) return `${base} ${props.thumbClass}`;
    return props.thumbClass ?? (base || undefined);
  };
  return (
    <BaseSwitch
      {...rest}
      hitSlop={props.hitSlop ?? (props.children == null ? switchHitSlop(size) : undefined)}
      trackClass={props.trackClass ? `${look.trackClass} ${props.trackClass}` : look.trackClass}
      trackStyle={[look.trackStyle, props.trackStyle ?? null]}
      thumbClass={resolvedThumbClass()}
      thumbStyle={[look.thumbStyle, props.thumbStyle ?? null]}
    />
  );
}
