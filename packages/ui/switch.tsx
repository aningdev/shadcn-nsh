// A switch: the look (`switchLook`) and the `Switch` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  colors,
  controls,
  type Controls,
  finish,
  follow,
  hitTarget,
  motion,
  terminal,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
  stroke,
  tier,
  type Tiered,
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

interface SwitchPreset {
  width: number;
  height: number;
  smWidth: number;
  smHeight: number;
  border: number;
  onBorder: number;
  knob: number;
  onKnob: number;
  smKnob: number;
  smOnKnob: number;
  knobHover: number;
  knobPressedWidth: number;
  knobPressedHeight: number;
  knobFeedback: "none" | "expand" | "stretch";
}

// M3 Switch 52x32dp track, 2dp off / 0dp on outline, 16/24/28dp handle growth (_md-comp-switch.scss:47-65 v34.0.21 / SwitchTokens.kt).
const materialSwitchPreset: SwitchPreset = {
  width: 52,
  height: 32,
  smWidth: 52,
  smHeight: 32,
  border: 2,
  onBorder: 0,
  knob: 16,
  onKnob: 24,
  smKnob: 16,
  smOnKnob: 24,
  knobHover: 16,
  knobPressedWidth: 28,
  knobPressedHeight: 28,
  knobFeedback: "expand",
};

// WinUI 3 ToggleSwitch 40x20 track, 1px off / 0px on stroke, 12px knob scaling to 14px hover & 17x14 pressed (ToggleSwitch_themeresources.xaml:5,6,130,269,312,315 in winui3/release/2.7.0).
const winuiSwitchPreset: SwitchPreset = {
  width: 40,
  height: 20,
  smWidth: 40,
  smHeight: 20,
  border: 1,
  onBorder: 0,
  knob: 12,
  onKnob: 12,
  smKnob: 12,
  smOnKnob: 12,
  knobHover: 14,
  knobPressedWidth: 17,
  knobPressedHeight: 14,
  knobFeedback: "stretch",
};

const switchPresets: Record<Controls, Tiered<SwitchPreset>> = {
  base: {
    pointer: {
      width: 28,
      height: 16,
      smWidth: 28,
      smHeight: 16,
      border: 1,
      onBorder: 1,
      knob: 12,
      onKnob: 12,
      smKnob: 12,
      smOnKnob: 12,
      knobHover: 12,
      knobPressedWidth: 12,
      knobPressedHeight: 12,
      knobFeedback: "none",
    },
    touch: {
      width: 42,
      height: 24,
      smWidth: 34,
      smHeight: 20,
      border: 1,
      onBorder: 1,
      knob: 20,
      onKnob: 20,
      smKnob: 16,
      smOnKnob: 16,
      knobHover: 20,
      knobPressedWidth: 20,
      knobPressedHeight: 20,
      knobFeedback: "none",
    },
  },
  material: { pointer: materialSwitchPreset, touch: materialSwitchPreset },
  winui: { pointer: winuiSwitchPreset, touch: winuiSwitchPreset },
};

interface ResolvedSwitchGeometry extends SwitchGeometry {
  onBorder: number;
  onKnob: number;
  knobHover: number;
  knobPressedWidth: number;
  knobPressedHeight: number;
  knobFeedback: SwitchPreset["knobFeedback"];
}

/** The track and knob of a size, here (read from the active theme's `controls()` preset, or the terminal). */
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
  const g = switchPresets[controls()][tier];
  const sm = size === "sm";
  const width = sm ? g.smWidth : g.width;
  const height = sm ? g.smHeight : g.height;
  const knob = sm ? g.smKnob : g.knob;
  return {
    width,
    height,
    border: g.border,
    inset: Math.max(0, (height - knob) / 2 - g.border),
    knob,
    onBorder: g.onBorder,
    onKnob: sm ? g.smOnKnob : g.onKnob,
    knobHover: g.knobHover,
    knobPressedWidth: g.knobPressedWidth,
    knobPressedHeight: g.knobPressedHeight,
    knobFeedback: g.knobFeedback,
  };
}

/**
 * The gallery's switch, as the props of `Switch`'s parts (spread them:
 * `<Switch {...switchLook(() => on())}>`): track, knob geometry, border, and
 * hover/press knob feedback come from `switchPresets[controls()][tier]`. `on` is the value
 * the app owns: the knob follows it, from a press or from elsewhere.
 */
export function switchLook(on: () => boolean, size: SwitchSize = "default"): SwitchLook {
  const t = follow(() => (on() ? 1 : 0), motion.default);
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
          outputRange: [colors.track, colors.primary],
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
