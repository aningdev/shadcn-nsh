// Source: examples/nsh-gallery-ui/slider.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, focusRing } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, split } from "nsh";
import { Slider as BaseSlider, type SliderProps as BaseSliderProps } from "nsh/base";

import { isPointer } from "./lib/density";
import { sunkTrack, trackFill } from "./lib/meter";

/**
 * Theme layer on `nsh/base` Slider: a sunk rail, a primary run and a round thumb.
 * shadcn `bases/base` Slider has no `variant` / `size`. Every base prop passes through;
 * consumer styles win per key.
 */
export type SliderProps = BaseSliderProps;

type SliderMetrics = {
  /** Thumb diameter. A circle, so the side is fixed rather than a minimum. */
  thumb: number;
  /** Rail thickness. A fixed stroke, like the progress rail. */
  rail: number;
  /** The press band around the rail. Fixed so the thumb stays centered in it. */
  band: number;
  /** Vertical run, the reference's `h-32` / `h-36`. Fixed so the thumb has a track to travel. */
  run: number;
  /** Half a thumb, kept clear at each end so the thumb stays inside the rail. */
  inset: number;
};

type SliderLook = {
  metrics: SliderMetrics;
  style: ViewStyle;
  trackStyle: ViewStyle;
  indicatorStyle: ViewStyle;
  rangeStyle: ViewStyle;
  thumbStyle: ViewStyle;
  focusWithinStyle: ViewStyle;
  disabledStyle: ViewStyle;
};

/** The thumb eases its brightness. `motion-reduce` drops it. Brightness above 1 does not draw on Apple. */
const THUMB_CLASS =
  "rounded-full transition duration-150 motion-reduce:transition-none hover:brightness-105 active:brightness-95 focus:outline-none disabled:brightness-100";

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
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

/** Pointer: 14 thumb, 6 rail, 20 band. Touch: 20, 8, 32. The vertical run is 128 / 144. */
function metrics(): SliderMetrics {
  const pointer = isPointer();
  const thumb = pointer ? 14 : 20;
  return {
    thumb,
    rail: pointer ? 6 : 8,
    band: pointer ? 20 : 32,
    run: pointer ? 128 : 144,
    inset: thumb / 2,
  };
}

/**
 * The slider's chrome. `axis` `"vertical"` turns the rail upright. `beside` lays a value
 * (`children`) in a row after the track. Call it where those are read.
 */
function look(vertical: boolean, beside: boolean): SliderLook {
  const m = metrics();
  const rail = vertical
    ? { width: m.rail, height: "100%" as const }
    : { height: m.rail, width: "100%" as const };
  return {
    metrics: m,
    style: {
      flexDirection: beside ? "row" : "column",
      alignItems: vertical || beside ? "center" : "stretch",
      gap: beside ? 8 : 0,
      ...(vertical ? { width: m.band, height: m.run } : { minHeight: m.band }),
      transitionProperty: "opacity",
      transitionDuration: 150,
      transitionTimingFunction: "ease-out",
    },
    trackStyle: vertical
      ? {
          width: m.band,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: m.inset,
        }
      : {
          height: m.band,
          minHeight: m.band,
          justifyContent: "center",
          paddingHorizontal: m.inset,
          ...(beside ? { flex: 1 } : { width: "100%" }),
        },
    indicatorStyle: {
      ...rail,
      borderRadius: m.rail / 2,
      ...sunkTrack(),
    },
    rangeStyle: {
      borderRadius: m.rail / 2,
      ...trackFill(),
    },
    thumbStyle: {
      width: m.thumb,
      height: m.thumb,
      borderRadius: m.thumb / 2,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      // The reference's `finish.knob`: a raised disc on the sunk rail.
      boxShadow: finish.control.rest,
    },
    focusWithinStyle: focusRing(),
    disabledStyle: { opacity: disabledOpacity() },
  };
}

/**
 * The slider's chrome and its pointer / touch sizes. `axis` `"vertical"` turns the rail
 * upright. Call it where `axis` is read.
 */
export function sliderVariants(options?: {
  /** The track's direction. Default horizontal, `min` at the start. */
  axis?: "horizontal" | "vertical" | null;
}): SliderLook {
  return look(options?.axis === "vertical", false);
}

/** A value along a sunk rail. A string is not a label: pass `children` for a value beside it. */
export function Slider(props: SliderProps) {
  // Props are read where used (never destructured) so `axis` / `disabled` / `style` follow signals.
  const [, rest] = split(props, [
    "class",
    "style",
    "trackClass",
    "trackStyle",
    "indicatorClass",
    "indicatorStyle",
    "rangeClass",
    "rangeStyle",
    "thumbClass",
    "thumbStyle",
    "focusWithinStyle",
    "disabledStyle",
    "children",
  ]);

  const current = computed(() => look(props.axis === "vertical", props.children != null));

  return (
    <BaseSlider
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(current().style, props.style)}
      trackClass={props.trackClass ?? undefined}
      trackStyle={mergeStyle(current().trackStyle, props.trackStyle)}
      indicatorClass={props.indicatorClass ?? undefined}
      indicatorStyle={mergeStyle(current().indicatorStyle, props.indicatorStyle)}
      rangeClass={props.rangeClass ?? undefined}
      rangeStyle={mergeStyle(current().rangeStyle, props.rangeStyle)}
      thumbClass={mergeClass(THUMB_CLASS, props.thumbClass)}
      thumbStyle={mergeStyle(current().thumbStyle, props.thumbStyle)}
      focusWithinStyle={mergeStyle(current().focusWithinStyle, props.focusWithinStyle)}
      disabledStyle={mergeStyle(current().disabledStyle, props.disabledStyle)}
    >
      {props.children}
    </BaseSlider>
  );
}
