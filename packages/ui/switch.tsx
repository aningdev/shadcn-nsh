// A switch: the look (`switchLook`) and the `Switch` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  alpha,
  colors,
  dimmed,
  finish,
  focusRing,
  hitTarget,
  motion,
  terminal,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
  stroke,
  tier,
} from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { reduceMotion, split } from "nsh";
import { Switch as BaseSwitch, type SwitchProps as BaseSwitchProps } from "nsh/base";

import { AsText } from "./lib/as-text";
import { joinClass } from "./lib/class-names";
import { type Live, read } from "./lib/live-value";
import { disabledLook, edged, painted, switchLook as switchSlots } from "./lib/look";
import { cssMotion } from "./lib/motion";
import { type SwitchGeometry, knobOffset, knobTravel, switchSlop } from "./lib/switch-geometry";

/**
 * A switch's size: `default` draws the theme's standard knob and track, `sm` draws the compact
 * ones in `switch.small.*` (desktop vs touch scales come from the active input `tier`).
 */
export type SwitchSize = "sm" | "default";

/** Options accepted by {@link switchLook}. */
export interface SwitchLookOptions {
  /** Switch size (`default` or `sm`, reactive or static). */
  size?: Live<SwitchSize | undefined>;
  /** Whether the switch is disabled (either a boolean or reactive getter). */
  disabled?: Live<boolean>;
  /**
   * Whether the theme's `state.disabled.*` surface replaces the track and knob when disabled.
   * Defaults to true; set false when an enclosing row (such as `listRow`) already dims the whole row.
   */
  disabledSurface?: boolean;
}

/** The props `switchLook` gives a `Switch`. */
export interface SwitchLook {
  /** Mirrors the track right to left, so the knob rests at the start there. */
  readonly trackClass: string;
  readonly trackStyle: ViewStyle;
  readonly thumbClass: string;
  readonly thumbStyle: ViewStyle;
  /** Root disabled opacity when the theme dims rather than replacing `state.disabled.face`. */
  readonly disabledStyle: ViewStyle;
}

/** What a press does to a knob (`switch.feedback`): nothing, a grow, or a widening slide. */
type KnobFeedback = "none" | "expand" | "stretch";

/** A switch's geometry with every number its states need, resolved for this tier. */
interface ResolvedSwitchGeometry extends SwitchGeometry {
  /** The knob's height, where a theme states one apart from its width. */
  readonly knobHeight: number;
  readonly onBorder: number;
  readonly onKnobWidth: number;
  readonly onKnobHeight: number;
  readonly knobHover: number;
  readonly knobPressedWidth: number;
  readonly knobPressedHeight: number;
  readonly knobFeedback: KnobFeedback;
}

/**
 * The track and knob of a size: the theme's `switch.*` slots at this tier, or the terminal's own —
 * a shell's switch is its grid's, whatever the theme says. A small switch scales the knob's hover
 * and press by the knob's own shrink, so a theme whose small knob is its knob keeps its feedback.
 */
function geometry(size: SwitchSize): ResolvedSwitchGeometry {
  if (terminal)
    return {
      width: 5 * TERMINAL_COLUMN,
      height: TERMINAL_ROW,
      border: 1,
      inset: 0,
      knob: TERMINAL_ROW,
      knobHeight: TERMINAL_ROW,
      onBorder: 1,
      onKnobWidth: TERMINAL_ROW,
      onKnobHeight: TERMINAL_ROW,
      knobHover: TERMINAL_ROW,
      knobPressedWidth: TERMINAL_ROW,
      knobPressedHeight: TERMINAL_ROW,
      knobFeedback: "none",
    };
  const look = switchSlots();
  const small = size === "sm";
  const knob = small ? look.knobSmall[tier] : look.knob[tier];
  const knobHeight = small ? look.knobSmallHeight[tier] : look.knobHeight[tier];
  const ratioW = knob / look.knob[tier];
  const ratioH = knobHeight / look.knobHeight[tier];
  const border = look.edge.off[tier];
  const height = small ? look.smallHeight[tier] : look.height[tier];
  return {
    width: small ? look.smallWidth[tier] : look.width[tier],
    height,
    border,
    inset: Math.max(0, (height - knobHeight) / 2 - border),
    knob,
    knobHeight,
    onBorder: look.edge.on[tier],
    onKnobWidth: look.knobOn[tier] * ratioW,
    onKnobHeight: look.knobOnHeight[tier] * ratioH,
    knobHover: look.knobHover[tier] * ratioW,
    knobPressedWidth: look.knobPressed[tier] * ratioW,
    knobPressedHeight: look.knobPressedHeight[tier] * ratioH,
    knobFeedback: look.feedback,
  };
}

/**
 * A switch's knob: the `knob` layer, and on an open switch its checked state — the fill, the edge
 * and the gradient the theme states in `checked-*`, which a field it leaves out keeps from the
 * unchecked knob.
 */
function knobLook(on: boolean): ViewStyle {
  const checked: ViewStyle = { ...finish.knob };
  if (!on) return checked;
  const background = finish.knob.checkedBackground;
  if (background !== undefined) checked.backgroundColor = background;
  const border = finish.knob.checkedBorderColor;
  if (border !== undefined) checked.borderColor = border;
  const gradient = finish.knob.checkedGradient;
  if (gradient === null) delete checked.backgroundImage;
  else if (gradient !== undefined) checked.backgroundImage = gradient;
  return checked;
}

/**
 * The knob's size feedback, as transform classes: the knob's box never takes a new size, so a
 * hover, a press and the open state scale it — built from the geometry, so a family that brings a
 * recipe and the library's circle take the same path.
 * A knob that stretches (WinUI) reaches toward the track's centre as it grows: a `shift` past the
 * box it grew from, and `travel - shift` back once it is open — the same pixels as today's box,
 * without moving `transformOrigin`, which a press would jump.
 */
function knobFeedbackClasses(
  g: ResolvedSwitchGeometry,
  travel: number,
  disabled: boolean,
): string[] {
  if (g.knobFeedback === "none") return [];
  /** A size as a scale of the knob's box, to four places (a whole number of points fits). */
  const of = (size: number) => Number((size / g.knob).toFixed(4));
  /** A height as a scale of the knob's box. */
  const ofH = (size: number) => Number((size / g.knobHeight).toFixed(4));
  /** Both axes together as `scale`, apart as `scale-x` and `scale-y`. */
  const scale = (w: number, h: number): string[] =>
    of(w) === ofH(h) ? [`scale-[${of(w)}]`] : [`scale-x-[${of(w)}]`, `scale-y-[${ofH(h)}]`];
  const under = (variant: string, utilities: string[]): string[] =>
    utilities.map((utility) => `${variant}:${utility}`);
  if (g.knobFeedback === "expand") {
    return [
      ...under("checked", scale(g.onKnobWidth, g.onKnobHeight)),
      ...(disabled ? [] : under("active", scale(g.knobPressedWidth, g.knobPressedHeight))),
    ];
  }
  if (disabled) return [];
  const pressed = under("active", scale(g.knobPressedWidth, g.knobPressedHeight));
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
 * hover/press knob feedback come from the theme's `switch.*` slots (`geometry`). `on` is the
 * value the app owns: the knob follows it, from a press or from elsewhere.
 *
 * The knob's box stays one size; its travel and its hover/press growth are CSS classes, so a
 * timing role in the theme paces them and no layout property moves. NSH animates a
 * view's translate and scale as one transform, so one transition carries both: `motion.fast`.
 */
export function switchLook(
  on: () => boolean,
  sizeOrOptions: SwitchSize | SwitchLookOptions = "default",
): SwitchLook {
  const options: SwitchLookOptions =
    typeof sizeOrOptions === "string" ? { size: sizeOrOptions } : sizeOrOptions;
  const resolveSize = (): SwitchSize => read(options.size) ?? "default";
  const isDisabled = () => !!read(options.disabled);
  const disabledSurface = options.disabledSurface ?? true;

  return {
    // The knob sits at the track's physical left (`left`, which keeps its
    // side) and travels right; right to left the whole track is mirrored, so
    // it rests at the start and springs toward the end in either direction.
    trackClass: "rtl:-scale-x-100",
    get trackStyle(): ViewStyle {
      const g = geometry(resolveSize());
      const checked = on();
      const look = switchSlots();
      const off = disabledLook();
      const offSurface = disabledSurface && isDisabled() && off.face !== null;
      const disabledEdge = offSurface
        ? look.edgeColor
          ? alpha(edged(look.edgeColor), dimmed.disabled)
          : edged(off.edge)
        : undefined;
      return {
        width: g.width,
        height: g.height,
        borderRadius: g.height / 2,
        padding: g.inset,
        backgroundColor: offSurface
          ? painted(off.face)
          : checked
            ? finish.accent.backgroundColor
            : colors.track,
        borderWidth: offSurface ? g.border : checked ? g.onBorder : g.border,
        borderColor: offSurface
          ? disabledEdge
          : checked
            ? finish.fill.borderColor
            : edged(look.edgeColor),
        boxShadow: offSurface ? "none" : checked ? finish.fill.boxShadow : finish.inset.boxShadow,
        transitionProperty: reduceMotion() ? "none" : "background-color, border-color, box-shadow",
        ...cssMotion(motion.fast),
      };
    },
    get thumbClass(): string {
      const g = geometry(resolveSize());
      const travel = knobTravel(g);
      return [
        `checked:translate-x-[${travel}px]`,
        ...knobFeedbackClasses(g, travel, isDisabled()),
      ].join(" ");
    },
    get thumbStyle(): ViewStyle {
      const g = geometry(resolveSize());
      const checked = on();
      const off = disabledLook();
      const offSurface = disabledSurface && isDisabled() && off.face !== null;
      const border = offSurface ? g.border : checked ? g.onBorder : g.border;
      const pad = knobOffset(g, border);
      const knob = offSurface
        ? ({
            backgroundColor: off.ink ?? colors.mutedForeground,
            boxShadow: "none",
            borderColor: "transparent",
          } satisfies ViewStyle)
        : knobLook(checked);
      const hasEdge = knob.borderColor !== undefined && knob.borderColor !== "transparent";
      return {
        position: "absolute",
        // physical: the knob's travel is a translateX from the track's left edge, and transforms do not mirror.
        left: pad,
        top: pad,
        width: g.knob,
        height: g.knobHeight,
        borderRadius: Math.min(g.knob, g.knobHeight) / 2,
        ...knob,
        borderWidth: hasEdge ? stroke.control : 0,
        transitionProperty: reduceMotion() ? "none" : "transform",
        ...cssMotion(motion.fast),
      };
    },
    get disabledStyle(): ViewStyle {
      return disabledLook().face === null ? { opacity: dimmed.disabled } : {};
    },
  };
}

/** Capsule focus ring matching the switch track (for a standalone switch). */
export function switchFocusStyle(size: SwitchSize = "default"): ViewStyle {
  return { borderRadius: geometry(size).height / 2, ...focusRing() };
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
 * `trackStyle` and `thumbStyle` go over the look's. A string child is the label.
 */
export type SwitchProps = Omit<BaseSwitchProps, "children"> & {
  /** Compact (`sm`) or standard (`default`) geometry across both pointer and touch tiers. */
  size?: SwitchSize;
  /** A string is the label; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/**
 * A switch. Alone (no children) it takes `switchHitSlop`, so a finger gets 44 points; with
 * children it is a row with its label, and the row is the target.
 */
export function Switch(props: SwitchProps) {
  const [, rest] = split(props, [
    "size",
    "children",
    "trackClass",
    "trackStyle",
    "thumbClass",
    "thumbStyle",
    "hitSlop",
    "focusVisibleStyle",
    "disabledStyle",
  ]);
  const children = props.children;
  const alone = children == null;
  const size = () => props.size ?? "default";
  const look = switchLook(() => props.checked ?? false, {
    size: () => props.size,
    disabled: () => !!props.disabled,
    disabledSurface: props.disabledStyle == null,
  });
  return (
    <BaseSwitch
      {...rest}
      hitSlop={props.hitSlop ?? (alone ? switchHitSlop(size()) : undefined)}
      focusVisibleStyle={[
        alone ? switchFocusStyle(size()) : focusRing(),
        props.focusVisibleStyle ?? null,
      ]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
      trackClass={joinClass(look.trackClass, props.trackClass)}
      trackStyle={[look.trackStyle, props.trackStyle ?? null]}
      thumbClass={joinClass(look.thumbClass, props.thumbClass)}
      thumbStyle={[look.thumbStyle, props.thumbStyle ?? null]}
    >
      {alone ? null : <AsText style={{ color: colors.foreground }}>{children}</AsText>}
    </BaseSwitch>
  );
}
