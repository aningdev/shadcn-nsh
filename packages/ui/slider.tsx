// A slider: the look (`sliderLook` and its companions) and the `Slider` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, fillStyle, finish, insetEdge } from "@shadcn-nsh/theme";
import type { TextStyle, ViewStyle } from "nsh";
import { platform, split, Text } from "nsh";
import { Slider as BaseSlider, type SliderProps as BaseSliderProps } from "nsh/base";

// @port slider.ts
/** Options of `sliderLook`. */
export interface SliderLookOptions {
  /** A vertical slider: the rail 8 wide, the thumb 8 × 16. */
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
 * A `Slider`'s parts (spread them: `<Slider {...sliderLook()}>`): a rail
 * sunk into the surface and a round thumb on it: a 6-point rail and a
 * 14-point thumb with a pointer (a 20-point band around the rail takes
 * presses), 8 and 20 on a touch screen (a 32-point band). Under the pointer
 * the thumb lightens, the keyboard's focus rings the thumb in the theme's
 * `ring` (not after a press or a drag), a disabled slider fades to 50%
 * (transitions still with reduced motion).
 *
 * Only what never changes is here, so the spread reads no signal: a spread
 * is evaluated where the slider is made, and a signal read there would make
 * the slider again when it changes (in the middle of a drag). The colors are
 * getters, read by the slider's props as the appearance changes; the fill
 * (`rangeStyle={sliderFill(..)}`) and `disabled` are props of their own.
 */
export function sliderLook(o: SliderLookOptions = {}) {
  const vertical = !!o.vertical;
  const pointer = platform.desktop;
  const thumb = pointer ? 14 : 20;
  // The band keeps half a thumb free at each end, so the thumbs stay inside.
  const band = vertical
    ? pointer
      ? "w-5 h-32 items-center py-[7px]"
      : "w-8 h-36 items-center py-[10px]"
    : pointer
      ? "h-5 justify-center px-[7px]"
      : "h-8 justify-center px-[10px]";
  // The rail: 6 points with a pointer, 8 on a touch screen; vertical, it runs the full height.
  const rail = vertical ? (pointer ? "w-1.5 h-full" : "w-2 h-full") : pointer ? "h-1.5" : "h-2";
  const fade = "transition duration-150 motion-reduce:transition-none";
  return {
    // A vertical value sits above the rail (`flex-col-reverse`: the track is the first child).
    // It does not take `flex-1`: the rail keeps the height its band asks for.
    class: o.value
      ? vertical
        ? "flex-col-reverse items-center gap-1"
        : "flex-row items-center gap-2"
      : undefined,
    trackClass: `${band} ${o.value && !vertical ? "flex-1" : ""} cursor-pointer ${fade} disabled:opacity-50 disabled:cursor-not-allowed`,
    indicatorClass: `${rail} rounded-full`,
    get indicatorStyle(): ViewStyle {
      return {
        backgroundColor: colors.track,
        boxShadow: insetEdge(finish.track.borderColor, finish.track.boxShadow),
      };
    },
    rangeClass: "rounded-full",
    // The keyboard's ring on the thumb that has the focus (`focus-visible:`:
    // not after a press or a drag). An outline, which the handle's shadow in
    // `thumbStyle` leaves alone.
    thumbClass: `rounded-full ${fade} hover:brightness-105 active:brightness-95 focus-visible:outline-3 focus-visible:outline-ring/50 disabled:brightness-100`,
    get thumbStyle(): ViewStyle {
      return { width: thumb, height: thumb, borderWidth: 1, ...finish.handle };
    },
  };
}

/** The accent's color and edge. A vertical rail turns the theme's gradient a quarter turn. */
function accentFill(vertical: boolean): ViewStyle {
  const fill = fillStyle();
  return {
    ...(vertical && fill.backgroundImage
      ? { ...fill, backgroundImage: fill.backgroundImage.replace("180deg", "90deg") }
      : fill),
    borderWidth: 1,
    borderColor: finish.fill.borderColor,
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
// @port end

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
      class={props.class ?? look.class}
      trackClass={props.trackClass ?? look.trackClass}
      indicatorClass={props.indicatorClass ?? look.indicatorClass}
      indicatorStyle={[look.indicatorStyle, props.indicatorStyle ?? null]}
      rangeClass={props.rangeClass ?? look.rangeClass}
      // Color only (`from` is 0): nsh sizes the run to the thumb. A caller's `rangeStyle`
      // can place a run that starts later, and it wins where the two name the same edge.
      rangeStyle={[sliderFill(0, 0, vertical), props.rangeStyle ?? null]}
      thumbClass={props.thumbClass ?? look.thumbClass}
      thumbStyle={[look.thumbStyle, props.thumbStyle ?? null]}
    >
      {label}
    </BaseSlider>
  );
}
