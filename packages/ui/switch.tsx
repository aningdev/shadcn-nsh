// A switch: the look (`switchLook`) and the `Switch` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  control,
  finish,
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
import { reduceMotion, split } from "nsh";
import { Switch as BaseSwitch, type SwitchProps as BaseSwitchProps } from "nsh/base";

import { joinClass } from "./lib/class-names";
import { type HandleLook, handleLook } from "./lib/look";
import { cssMotion } from "./lib/motion";
import { type SwitchGeometry, knobTravel, switchSlop } from "./lib/switch-geometry";

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

/** One family's switch, in points: one set for a pointer and, where a touch screen differs, its own. */
interface SwitchShape {
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
const materialSwitch: SwitchShape = {
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
const winuiSwitch: SwitchShape = {
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

/**
 * A switch's numbers, by the form the theme's `handle` names: a switch is always a circle (the
 * library's disc, `docs/specs/theme-contract-v2.md` §11.4), so the form picks the family whose
 * switch the theme is — the base one, Material's growing one, or WinUI's stretching one.
 */
const switchShapes: Record<HandleLook["form"], Tiered<SwitchShape>> = {
  circle: {
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
  bar: { pointer: materialSwitch, touch: materialSwitch },
  ring: { pointer: winuiSwitch, touch: winuiSwitch },
};

interface ResolvedSwitchGeometry extends SwitchGeometry {
  onBorder: number;
  onKnob: number;
  knobHover: number;
  knobPressedWidth: number;
  knobPressedHeight: number;
  knobFeedback: SwitchShape["knobFeedback"];
}

/** The track and knob of a size, here (the shape its theme's `control()` handle names, or the terminal). */
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
  const g = switchShapes[handleLook(control().handle).form][tier];
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
 * A switch's knob: the `knob` layer, and on an open switch the accent's own ink in place of the
 * knob's fill, with no ring of the track's. A switch is one assembly; what its knob wears open is
 * the switch's business.
 */
function knobLook(on: boolean): ViewStyle {
  if (!on) return { ...finish.knob };
  return {
    ...finish.knob,
    backgroundColor: finish.accent.foreground,
    backgroundImage: "none",
    borderColor: "transparent",
  };
}

/**
 * The knob's size feedback, as transform classes: the knob's box never takes a new size, so a
 * hover, a press and the open state scale it — kept off `switchShapes` so the sizes stay points.
 * A knob that stretches (WinUI) reaches toward the track's centre as it grows: a `shift` past the
 * box it grew from, and `travel - shift` back once it is open — the same pixels as today's box,
 * without moving `transformOrigin`, which a press would jump.
 */
function knobFeedbackClasses(g: ResolvedSwitchGeometry, travel: number): string[] {
  if (g.knobFeedback === "none") return [];
  /** A size as a scale of the knob's box, to four places (a whole number of points fits). */
  const of = (size: number) => Number((size / g.knob).toFixed(4));
  /** Both axes together as `scale`, apart as `scale-x` and `scale-y`. */
  const scale = (w: number, h: number): string[] =>
    w === h ? [`scale-[${of(w)}]`] : [`scale-x-[${of(w)}]`, `scale-y-[${of(h)}]`];
  const under = (variant: string, utilities: string[]): string[] =>
    utilities.map((utility) => `${variant}:${utility}`);
  const pressed = under("active", scale(g.knobPressedWidth, g.knobPressedHeight));
  if (g.knobFeedback === "expand") {
    return [...under("checked", scale(g.onKnob, g.onKnob)), ...pressed];
  }
  const shift = (g.knobPressedWidth - g.knobHover) / 2;
  return [
    ...under("hover", scale(g.knobHover, g.knobHover)),
    ...pressed,
    ...under("active", [`translate-x-[${shift}px]`]),
    ...under("checked:active", [`translate-x-[${travel - shift}px]`]),
  ];
}

/**
 * The gallery's switch, as the props of `Switch`'s parts (spread them:
 * `<Switch {...switchLook(() => on())}>`): track, knob geometry, border, and
 * hover/press knob feedback come from the shape the theme's `control()` handle names. `on` is the
 * value the app owns: the knob follows it, from a press or from elsewhere.
 *
 * The knob's box stays one size; its travel and its hover/press growth are CSS classes, so a
 * spring or a timing role in the theme paces them and no layout property moves. NSH animates a
 * view's translate and scale as one transform, so one transition carries both: `motion.fast`.
 */
export function switchLook(on: () => boolean, size: SwitchSize = "default"): SwitchLook {
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
        backgroundColor: checked ? colors.primary : colors.track,
        borderWidth: checked ? g.onBorder : g.border,
        borderColor: checked ? finish.accent.borderColor : finish.inset.borderColor,
        boxShadow: checked ? finish.accent.boxShadow : finish.inset.boxShadow,
        transitionProperty: reduceMotion() ? "none" : "background-color, border-color, box-shadow",
        ...cssMotion(motion.fast),
      };
    },
    get thumbClass(): string {
      const g = geometry(size);
      const travel = knobTravel(g);
      return [`checked:translate-x-[${travel}px]`, ...knobFeedbackClasses(g, travel)].join(" ");
    },
    get thumbStyle(): ViewStyle {
      const g = geometry(size);
      const checked = on();
      const border = checked ? g.onBorder : g.border;
      const offset = g.height / 2 - border - g.knob / 2;
      return {
        position: "absolute",
        // physical: the knob's travel is a translateX from the track's left edge, and transforms do not mirror.
        left: offset,
        top: offset,
        width: g.knob,
        height: g.knob,
        borderRadius: g.knob / 2,
        borderWidth: stroke.control,
        ...knobLook(checked),
        transitionProperty: reduceMotion() ? "none" : "transform",
        ...cssMotion(motion.fast),
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
  return (
    <BaseSwitch
      {...rest}
      hitSlop={props.hitSlop ?? (props.children == null ? switchHitSlop(size) : undefined)}
      trackClass={joinClass(look.trackClass, props.trackClass)}
      trackStyle={[look.trackStyle, props.trackStyle ?? null]}
      thumbClass={joinClass(look.thumbClass, props.thumbClass)}
      thumbStyle={[look.thumbStyle, props.thumbStyle ?? null]}
    />
  );
}
