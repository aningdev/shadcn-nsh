// A slider: `Slider`, wearing `sliderLook`, `sliderFill` and `sliderValueStyle`.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { TextStyle, ViewStyle } from "nsh";
import { split, Text } from "nsh";
import { Slider as BaseSlider, type SliderProps as BaseSliderProps } from "nsh/base";

import {
  alpha,
  colors,
  control,
  EDGE_WIDTH,
  fillStyle,
  outerEdge,
  stroke,
  surface,
  tier,
} from "../theme";
import { joinClass } from "./lib/utils";

/** Options of `sliderLook`. */
export interface SliderLookOptions {
  /** A vertical slider: rotated rail, and a track band as tall as the knob. */
  vertical?: boolean;
  /** The value column after the track (`children`: a 42-point label). */
  value?: boolean;
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

// Shared slider primitives. Showcase toolbar spreads `sliderLook`; gallery and showcase read `sliderFill` and `sliderValueStyle`.

/** Default vertical slider rail length per tier. */
const VERTICAL_LENGTH = { pointer: 128, touch: 144 } as const;

/** The knob and the groove a slider draws: the theme's `slider` recipe. */
const slots = () => control("slider");

/**
 * A `Slider`'s parts (spread them: `<Slider {...sliderLook()}>`), reading its knob and its groove
 * from the theme's `slider` recipe: the rail's thickness, the band around it, the knob's size and
 * its pressed size, and whether the groove is graved in with an edge.
 */
export function sliderLook(o: SliderLookOptions = {}) {
  const vertical = !!o.vertical;
  const fade = "transition duration-150 motion-reduce:transition-none";
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
      const h = slots();
      const pad = h.knobWidth / 2;
      const length = VERTICAL_LENGTH[tier];
      const bandClass = vertical
        ? `w-[${h.band}px] h-[${length}px] items-center py-[${pad}px]`
        : `h-[${h.band}px] justify-center px-[${pad}px]`;
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
      const h = slots();
      const rail = vertical ? `w-[${h.rail}px] h-full` : `h-[${h.rail}px]`;
      return `${rail} rounded-full`;
    },
    get indicatorStyle(): ViewStyle {
      const h = slots();
      return {
        backgroundColor: h.grooveColor,
        ...(h.grooveShadow === undefined ? {} : { boxShadow: h.grooveShadow }),
      };
    },
    rangeClass: "rounded-full",
    // The keyboard's ring on the thumb that has the focus (`focus-visible:`:
    // not after a press or a drag).
    get thumbClass(): string {
      const h = slots();
      const focusRingClass = "focus-visible:outline-3 focus-visible:outline-ring/50";
      // A press swells the knob (a touch screen's 20 points reach 32): as a transform, so the
      // thumb grows around its own middle and nothing re-measures the band.
      const press = Number((h.knobPressedWidth / h.knobWidth).toFixed(4));
      const pressMod = press === 1 ? "" : `active:scale-[${press}]`;
      if (h.mark > 0) {
        const outer = h.knobWidth - 2 * EDGE_WIDTH;
        const rim = (outer - h.mark) / 2;
        return [
          `w-[${outer}px] h-[${outer}px] rounded-full border-solid border-popover border-[${rim}px]`,
          fade,
          pressMod,
          focusRingClass,
        ]
          .filter(Boolean)
          .join(" ");
      }
      return ["rounded-full", fade, pressMod, focusRingClass].filter(Boolean).join(" ");
    },
    get thumbStyle(): ViewStyle {
      const h = slots();
      if (h.mark > 0) {
        return {
          backgroundColor: colors.primary,
          boxShadow: outerEdge(h.knobEdgeColor ?? undefined, h.knobShadow, EDGE_WIDTH),
        };
      }
      const width = vertical ? h.knobHeight : h.knobWidth;
      const height = vertical ? h.knobWidth : h.knobHeight;
      return {
        width,
        height,
        ...h.knobStyle,
        ...(h.hasKnobEdge
          ? { borderWidth: stroke.control, borderColor: h.knobEdgeColor ?? "transparent" }
          : { borderWidth: 0 }),
      };
    },
  };
}

/** The value column label's color: the soft text color (60% of the
 * text's). */
export const sliderValueStyle = (): TextStyle => ({ color: alpha(colors.foreground, 0.6) });

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

// Private helpers

/** The value column's label (`<Text class={sliderValueClass}
 * style={sliderValueStyle()}>`): 42 points, right aligned, monospaced, its
 * line as tall as its type so it centers on the rail. */
const sliderValueClass = "w-[42px] text-right font-mono text-[11px] leading-none";

/**
 * The `fill` finish's color and edge. A vertical rail turns the theme's gradient a quarter turn. A
 * groove that is graved in (`slider` recipe's shade) edges its run, so the run sits in the hollow
 * the rail is.
 */
function accentFill(vertical: boolean): ViewStyle {
  const fill = fillStyle();
  const graved = control("slider").hasGrooveShade;
  return {
    ...(vertical && fill.backgroundImage
      ? { ...fill, backgroundImage: fill.backgroundImage.replace("180deg", "90deg") }
      : fill),
    ...(graved
      ? { borderWidth: stroke.control, borderColor: surface("fill").style.borderColor }
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
