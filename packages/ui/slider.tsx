// A slider: the look (`sliderLook` and its companions) and the `Slider` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  alpha,
  colors,
  EDGE_WIDTH,
  fillStyle,
  finish,
  outerEdge,
  stroke,
  tier,
  type Tiered,
} from "@shadcn-nsh/theme";
import type { TextStyle, ViewStyle } from "nsh";
import { split, Text } from "nsh";
import { Slider as BaseSlider, type SliderProps as BaseSliderProps } from "nsh/base";

import { joinClass } from "./lib/class-names";
import { painted, sliderLook as sliderSlots, trackLook } from "./lib/look";
import { railFace, railShadow } from "./lib/track";

/** The knob a slider draws: the theme's `slider.*` slots. */
const knob = () => sliderSlots();

/** The groove the knob runs in: the theme's groove slots, under a slider. */
const groove = () => trackLook("slider");

/** Options of `sliderLook`. */
export interface SliderLookOptions {
  /** A vertical slider: rotated rail, and a track band as tall as the knob. */
  vertical?: boolean;
  /** The value column after the track (`children`: a 42-point label). */
  value?: boolean;
}

/** The value column's label (`<Text class={sliderValueClass}
 * style={sliderValueStyle()}>`): 42 points, right aligned, monospaced, its
 * line as tall as its type so it centers on the rail. */
export const sliderValueClass = "w-[42px] text-right font-mono text-[11px] leading-none";

/** The value column label's color: the soft text color (60% of the
 * text's). */
export const sliderValueStyle = (): TextStyle => ({ color: alpha(colors.foreground, 0.6) });

/**
 * A `Slider`'s parts (spread them: `<Slider {...sliderLook()}>`), reading its knob from the
 * theme's `slider.*` slots and its groove from its groove slots: the rail's thickness, the band
 * around it, the knob's size and its pressed size, and whether the groove is graved in with an edge.
 */
export function sliderLook(o: SliderLookOptions = {}) {
  const vertical = !!o.vertical;
  const fade = "transition duration-150 motion-reduce:transition-none";
  /** A number the theme states once, or once per input (a knob's band differs by input). */
  const perTier = (v: Tiered<number> | number) => (typeof v === "number" ? v : v[tier]);
  /** The knob's width: the disc's, which the theme states per input. */
  const knobWidth = (h: ReturnType<typeof knob>) => h.knob[tier];
  return {
    // A vertical value sits above the rail (`flex-col-reverse`: the track is the first child).
    // It does not take `flex-1`: the rail keeps the height its band asks for.
    get class(): string | undefined {
      return o.value
        ? vertical
          ? "flex-col-reverse items-center gap-1"
          : "flex-row items-center gap-2"
        : undefined;
    },
    // The band keeps half a knob free at each end, so the knob stays inside.
    get trackClass(): string {
      const h = knob();
      const pad = knobWidth(h) / 2;
      const length = h.vertical[tier];
      const bandClass = vertical
        ? `w-[${perTier(h.band)}px] h-[${length}px] items-center py-[${pad}px]`
        : `h-[${perTier(h.band)}px] justify-center px-[${pad}px]`;
      return [
        bandClass,
        o.value && !vertical ? "flex-1" : "",
        "cursor-pointer",
        fade,
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ]
        .filter(Boolean)
        .join(" ");
    },
    get indicatorClass(): string {
      const h = knob();
      const rail = vertical ? `w-[${perTier(h.rail)}px] h-full` : `h-[${perTier(h.rail)}px]`;
      return `${rail} rounded-full`;
    },
    get indicatorStyle(): ViewStyle {
      const g = groove();
      const face = railFace(g);
      const shadow = railShadow(g);
      return {
        backgroundColor: face,
        ...(shadow === undefined ? {} : { boxShadow: shadow }),
      };
    },
    rangeClass: "rounded-full",
    // The keyboard's ring on the thumb that has the focus (`focus-visible:`:
    // not after a press or a drag).
    get thumbClass(): string {
      const h = knob();
      const focusRingClass = "focus-visible:outline-3 focus-visible:outline-ring/50";
      if (h.dot > 0) {
        const outer = h.knob[tier] - 2 * EDGE_WIDTH;
        const rim = (outer - h.dot) / 2;
        const hoverRim = (outer - h.dotHover) / 2;
        const pressRim = (outer - h.dotPressed) / 2;
        return `w-[${outer}px] h-[${outer}px] rounded-full border-solid border-popover border-[${rim}px] hover:border-[${hoverRim}px] active:border-[${pressRim}px] ${fade} ${focusRingClass}`;
      }
      const hoverMods = h.brightens
        ? "hover:brightness-105 active:brightness-95 disabled:brightness-100"
        : "";
      // A press swells the knob (a touch screen's 20 points reach 32): as a transform, so the
      // thumb grows around its own middle and nothing re-measures the band.
      const press = Number((h.knobPressed[tier] / h.knob[tier]).toFixed(4));
      const pressMod = press === 1 ? "" : `active:scale-[${press}]`;
      return ["rounded-full", fade, hoverMods, pressMod, focusRingClass].filter(Boolean).join(" ");
    },
    get thumbStyle(): ViewStyle {
      const h = knob();
      if (h.dot > 0) {
        return {
          backgroundColor: colors.primary,
          boxShadow: outerEdge(finish.knob.borderColor, finish.knob.boxShadow, EDGE_WIDTH),
        };
      }
      return {
        width: h.knob[tier],
        height: h.knobHeight[tier],
        borderWidth: stroke.control,
        ...finish.knob,
        backgroundColor: painted(h.knobFace),
      };
    },
  };
}

/**
 * The `fill` finish's color and edge. A vertical rail turns the theme's gradient a quarter turn. A
 * groove that is graved in (`track.sunk`) edges its run, so the run sits in the hollow the rail is.
 */
function accentFill(vertical: boolean): ViewStyle {
  const fill = fillStyle();
  const shade = groove().groove?.shade ?? null;
  return {
    ...(vertical && fill.backgroundImage
      ? { ...fill, backgroundImage: fill.backgroundImage.replace("180deg", "90deg") }
      : fill),
    ...(shade
      ? { borderWidth: stroke.control, borderColor: finish.fill.borderColor }
      : { borderWidth: 0 }),
  };
}

function fillSpan(from: number, to: number, vertical: boolean): ViewStyle {
  const lo = Math.min(Math.max(from, 0), Math.max(to, 0));
  const hi = Math.max(Math.min(from, 1), Math.min(to, 1));
  const start = `${lo * 100}%` as const;
  const end = `${(1 - hi) * 100}%` as const;
  return vertical
    ? { bottom: start, top: end, left: 0, right: 0 }
    : {
        // physical: a horizontal rail measures from the left, not the reading direction.
        left: start,
        right: end,
        top: 0,
        bottom: 0,
      };
}

/**
 * A `Slider`'s fill (`rangeStyle`): the accent's run along the rail, a
 * little lighter at the top, edged a shade deeper. `from` and `to` are the
 * two ends, from 0 to 1.
 *
 * When `from` is at or before the rail's start, only the color comes back.
 * nsh then sizes the run itself — a single value from the start, a range
 * between the thumbs — and an inline edge would freeze that while a thumb
 * is dragged. When `from` is past the start, the fill's own edges are set
 * too (an equalizer lit from the middle). The two arguments are ordered by
 * `min` / `max`, so a span that reaches back to the start still places
 * itself when the farther end is passed first (`sliderFill(0.5, 0, true)`
 * lights the bottom half of a vertical rail).
 */
export function sliderFill(from: number, to: number, vertical = false): ViewStyle {
  const color = accentFill(vertical);
  if (from <= 0) return color;
  return { ...color, ...fillSpan(from, to, vertical) };
}

/**
 * `nsh/base`'s Slider with `sliderLook` and `sliderFill`. Every base prop passes through;
 * look classes / styles are defaults the caller can override.
 */
export type SliderProps = BaseSliderProps & {
  /** Lay the value beside a horizontal rail, or above a vertical one (`children`, or a formatted number). */
  showValue?: boolean;
};

/** A slider on the shared rail and citrus fill. */
export function Slider(props: SliderProps) {
  const [, rest] = split(props, [
    "showValue",
    "axis",
    "class",
    "trackClass",
    "indicatorClass",
    "indicatorStyle",
    "rangeClass",
    "rangeStyle",
    "thumbClass",
    "thumbStyle",
    "children",
  ]);
  const vertical = props.axis === "vertical";
  const look = sliderLook({ vertical, value: props.showValue });
  // The horizontal column keeps its 42-point width. A vertical readout is only as wide as
  // its digits and sits centered over the rail.
  const valueClass = vertical ? "text-center font-mono text-[11px] leading-none" : sliderValueClass;
  const label =
    props.children ??
    (props.showValue ? (
      <Text class={valueClass} style={sliderValueStyle()}>
        {/* Read in the binding, so the label follows a value the app changes. */}
        {() => (typeof props.value === "number" ? String(props.value) : "")}
      </Text>
    ) : undefined);
  return (
    <BaseSlider
      {...rest}
      axis={props.axis}
      class={joinClass(look.class, props.class)}
      trackClass={joinClass(look.trackClass, props.trackClass)}
      indicatorClass={joinClass(look.indicatorClass, props.indicatorClass)}
      indicatorStyle={[look.indicatorStyle, props.indicatorStyle ?? null]}
      rangeClass={joinClass(look.rangeClass, props.rangeClass)}
      // Color only (`from` is 0): nsh sizes the run to the thumb. A caller's `rangeStyle`
      // can place a run that starts later, and it wins where the two name the same edge.
      rangeStyle={[sliderFill(0, 0, vertical), props.rangeStyle ?? null]}
      thumbClass={joinClass(look.thumbClass, props.thumbClass)}
      thumbStyle={[look.thumbStyle, props.thumbStyle ?? null]}
    >
      {label}
    </BaseSlider>
  );
}
