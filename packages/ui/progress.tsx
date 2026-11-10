// Source: examples/nsh-gallery-ui/look/meter.ts @ 64ab8a1d (baseline), see NOTICE.
import type { StyleProp, ViewStyle } from "nsh";
import { cleanup, computed, createAnimatedValue, createMotion, effect, Easing, split } from "nsh";
import { Progress as BaseProgress, type ProgressProps as BaseProgressProps } from "nsh/base";

import { sunkTrack, trackFill } from "./lib/meter";

/**
 * Theme layer on `nsh/base` Progress. shadcn `bases/base` Progress has no `variant` / `size`.
 * Every base prop passes through; consumer styles win per key.
 */
export type ProgressProps = BaseProgressProps;

type ProgressLook = {
  style: ViewStyle;
  trackStyle: ViewStyle;
  indicatorClass: string;
  indicatorStyle: ViewStyle;
};

/**
 * Determinate glide: the fill is the whole track, slid back by what is left
 * (`translate`), on the 180 ms move curve. `motion-reduce` drops the glide.
 * `duration-180` is the documented move duration.
 */
const GLIDE =
  "w-full transition duration-180 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

/** The rail's weight, in points. A fixed stroke: the fill's percentage height needs a definite parent. */
const RAIL = 6;

/** A determinate fill's `translate` for `value` percent (0 to 100): off to the left by what is left. */
function remaining(value: number): string {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return `${clamped - 100}% 0`;
}

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

/**
 * The bar's chrome. `value` (0 to 100) places the determinate fill; `indeterminate` selects
 * the sweeping third instead of the glide. Call it where those are read.
 */
export function progressVariants(options?: {
  /** Determinate percent, 0 to 100. */
  value?: number;
  /** Unknown extent: the indicator is a third of the track, not the gliding fill. */
  indeterminate?: boolean;
}): ProgressLook {
  const indeterminate = !!options?.indeterminate;
  return {
    style: { gap: 8, alignItems: "stretch" },
    trackStyle: {
      height: RAIL,
      minHeight: RAIL,
      borderRadius: RAIL / 2,
      overflow: "hidden",
      ...sunkTrack(),
    },
    indicatorClass: indeterminate ? "w-1/3" : GLIDE,
    indicatorStyle: {
      height: "100%",
      borderRadius: RAIL / 2,
      ...trackFill(),
      ...(indeterminate ? {} : { translate: remaining(options?.value ?? 0) }),
    },
  };
}

/** A linear progress bar: the sunk rail and the primary run, gliding to each value. */
export function Progress(props: ProgressProps) {
  // Props are read where used (never destructured) so `value` / `indeterminate` follow signals.
  const [, rest] = split(props, [
    "class",
    "style",
    "trackClass",
    "trackStyle",
    "indicatorClass",
    "indicatorStyle",
    "onLayout",
  ]);

  // A third of the track crossing it and back. `translateX` runs 0 to 1; `travel` is two
  // thirds of the laid-out width, so the third starts at the left and ends flush right.
  // The loop keeps playing when the user asks for less motion (`ignoreReduceMotion`):
  // the sweep is the "still working" signal, not decoration. The reference rests at the middle.
  const sweep = createMotion();
  const travel = createAnimatedValue(0);
  const shift = sweep.translateX.mul(travel);
  effect(() => {
    if (!props.indeterminate) {
      sweep.stop();
      return;
    }
    void sweep.play({
      keyframes: { translateX: [0, 1] },
      duration: 800,
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      iterations: "infinite",
      direction: "alternate",
      ignoreReduceMotion: true,
    });
  });
  cleanup(() => sweep.stop());

  const current = computed(() =>
    progressVariants({ value: props.value, indeterminate: props.indeterminate }),
  );
  const indicatorStyle = computed(() => {
    const base = current().indicatorStyle;
    if (!props.indeterminate) return base;
    return { ...base, transform: [{ translateX: shift }] };
  });

  return (
    <BaseProgress
      {...rest}
      class={props.class ?? undefined}
      style={mergeStyle(current().style, props.style)}
      trackClass={props.trackClass ?? undefined}
      trackStyle={mergeStyle(current().trackStyle, props.trackStyle)}
      indicatorClass={mergeClass(current().indicatorClass, props.indicatorClass)}
      indicatorStyle={mergeStyle(indicatorStyle(), props.indicatorStyle)}
      onLayout={(event) => {
        travel.set((event.bounds.size.width * 2) / 3);
        props.onLayout?.(event);
      }}
    />
  );
}
