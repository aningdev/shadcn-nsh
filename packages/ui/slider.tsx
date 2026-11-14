// A slider: the look (`sliderLook` and its companions) and the `Slider` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { alpha, colors, finish } from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewStyle } from "nsh";
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
export const sliderValueStyle = (): TextStyle => ({ color: alpha(colors.text, 0.6) });

/**
 * A `Slider`'s parts (spread them: `<Slider {...sliderLook()}>`): a rail
 * sunk into the surface and a round thumb on it: a 6-point rail and a
 * 14-point thumb with a pointer (a 20-point band around the rail takes
 * presses), 8 and 20 on a touch screen (a 32-point band). Under the pointer the thumb lightens, the
 * keyboard's focus rings the thumb in the theme's `ring` (not after a press
 * or a drag), a disabled slider fades to 50% (transitions still with reduced
 * motion).
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
    ? `${pointer ? "w-5" : "w-8"} ${pointer ? "h-32" : "h-36"} items-center ${pointer ? "py-[7px]" : "py-[10px]"}`
    : `${pointer ? "h-5" : "h-8"} justify-center ${pointer ? "px-[7px]" : "px-[10px]"}`;
  const fade = "transition duration-150 motion-reduce:transition-none";
  return {
    class: o.value ? "flex-row items-center gap-2" : undefined,
    trackClass: `${band} ${o.value ? "flex-1" : ""} cursor-pointer ${fade} disabled:opacity-50 disabled:cursor-not-allowed`,
    indicatorClass: `${vertical ? (pointer ? "w-1.5" : "w-2") + " h-full" : pointer ? "h-1.5" : "h-2"} rounded-full`,
    get indicatorStyle(): ViewStyle {
      return {
        backgroundColor: colors.track,
        boxShadow: `inset 0 0 0 1px ${finish.track.borderColor}, ${finish.track.boxShadow}`,
      };
    },
    rangeClass: "rounded-full",
    // The keyboard's ring on the thumb that has the focus (`focus-visible:`:
    // not after a press or a drag). An outline, which the knob's shadow in
    // `thumbStyle` leaves alone.
    thumbClass: `rounded-full ${fade} hover:brightness-105 active:brightness-95 focus-visible:outline-3 focus-visible:outline-ring/50 disabled:brightness-100`,
    get thumbStyle(): ViewStyle {
      return { width: thumb, height: thumb, borderWidth: 1, ...finish.knob };
    },
  };
}

/**
 * A `Slider`'s fill (`rangeStyle`): the accent's run along the rail, a
 * little lighter at the top, edged a shade deeper. `from` and `to` are where
 * the fill starts and ends along the track, from 0 to 1 (unused: the run is
 * one color along its length, kept for the callers).
 */
export function sliderFill(_from: number, _to: number, vertical = false): ViewStyle {
  return {
    backgroundImage: vertical
      ? finish.fill.backgroundImage?.replace("180deg", "90deg")
      : finish.fill.backgroundImage,
    borderWidth: 1,
    borderColor: finish.fill.borderColor,
  };
}
// @port end

/**
 * `nsh/base`'s Slider with `sliderLook` and `sliderFill`. Every base prop passes through;
 * look classes / styles are defaults the caller can override.
 */
export type SliderProps = BaseSliderProps & {
  /** Lay a value column after the track (`children`, or a formatted number). */
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
  const value = props.value;
  const fillTo =
    typeof value === "number"
      ? (value - (props.min ?? 0)) / ((props.max ?? 100) - (props.min ?? 0) || 1)
      : Array.isArray(value)
        ? (value[1] - (props.min ?? 0)) / ((props.max ?? 100) - (props.min ?? 0) || 1)
        : 0;
  const label =
    props.children ??
    (props.showValue ? (
      <Text class={sliderValueClass} style={sliderValueStyle()}>
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
      rangeStyle={[sliderFill(0, fillTo, vertical), props.rangeStyle ?? null]}
      thumbClass={props.thumbClass ?? look.thumbClass}
      thumbStyle={[look.thumbStyle, props.thumbStyle ?? null]}
    >
      {label as JSX.Element | undefined}
    </BaseSlider>
  );
}
