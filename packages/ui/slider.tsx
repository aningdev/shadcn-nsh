// A slider: the look (`sliderLook` and its companions) and the `Slider` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  alpha,
  colors,
  controls,
  type Controls,
  EDGE_WIDTH,
  fillStyle,
  finish,
  insetEdge,
  outerEdge,
  stroke,
  tier,
  type Tiered,
} from "@shadcn-nsh/theme";
import type { TextStyle, ViewStyle } from "nsh";
import { split, Text, token } from "nsh";
import { Slider as BaseSlider, type SliderProps as BaseSliderProps } from "nsh/base";

interface SliderPreset {
  band: number;
  rail: number;
  thumbWidth: number;
  thumbHeight: number;
  thumbPressedWidth: number;
  innerDot: number;
  innerDotHover: number;
  innerDotPressed: number;
  verticalLength: number;
  handleShape: "circle" | "bar" | "ring";
  outlined: boolean;
  hoverBrightness: boolean;
  trackRole: "track" | "brand-tint" | "input";
}

// M3 Expressive Slider: 16dp track, 4x44dp bar handle (2dp pressed) (Compose SliderTokens.kt 1.5.0).
const m3SliderBase: SliderPreset = {
  band: 44,
  rail: 16,
  thumbWidth: 4,
  thumbHeight: 44,
  thumbPressedWidth: 2,
  innerDot: 0,
  innerDotHover: 0,
  innerDotPressed: 0,
  verticalLength: 128,
  handleShape: "bar",
  outlined: false,
  hoverBrightness: false,
  trackRole: "brand-tint",
};

// WinUI 3 Slider: 18px thumb with 12px inner dot (14px hover, 10px pressed) on 4px track inside 32px band (Slider_themeresources.xaml:6,166-173,221,233 in winui3/release/2.7.0).
const winuiSliderBase: SliderPreset = {
  band: 32,
  rail: 4,
  thumbWidth: 18,
  thumbHeight: 18,
  thumbPressedWidth: 18,
  innerDot: 12,
  innerDotHover: 14,
  innerDotPressed: 10,
  verticalLength: 128,
  handleShape: "ring",
  outlined: false,
  hoverBrightness: false,
  trackRole: "input",
};

const sliderPresets: Record<Controls, Tiered<SliderPreset>> = {
  base: {
    pointer: {
      band: 20,
      rail: 6,
      thumbWidth: 14,
      thumbHeight: 14,
      thumbPressedWidth: 14,
      innerDot: 0,
      innerDotHover: 0,
      innerDotPressed: 0,
      verticalLength: 128,
      handleShape: "circle",
      outlined: true,
      hoverBrightness: true,
      trackRole: "track",
    },
    touch: {
      band: 32,
      rail: 8,
      thumbWidth: 20,
      thumbHeight: 20,
      thumbPressedWidth: 20,
      innerDot: 0,
      innerDotHover: 0,
      innerDotPressed: 0,
      verticalLength: 144,
      handleShape: "circle",
      outlined: true,
      hoverBrightness: true,
      trackRole: "track",
    },
  },
  material: { pointer: m3SliderBase, touch: { ...m3SliderBase, verticalLength: 144 } },
  winui: { pointer: winuiSliderBase, touch: { ...winuiSliderBase, verticalLength: 144 } },
};

// @port slider.ts
/** Options of `sliderLook`. */
export interface SliderLookOptions {
  /** A vertical slider: rotated rail, bar handle, and track band. */
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
 * A `Slider`'s parts (spread them: `<Slider {...sliderLook()}>`), reading track thickness,
 * hit-band size, border presence, and handle geometry/states from `sliderPresets[controls()][tier]`
 * and the preset's `trackRole`.
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
    // The band keeps half a thumb free at each end, so the thumbs stay inside.
    get trackClass(): string {
      const s = sliderPresets[controls()][tier];
      const pad = s.thumbWidth / 2;
      const band = vertical
        ? `w-[${s.band}px] h-[${s.verticalLength}px] items-center py-[${pad}px]`
        : `h-[${s.band}px] justify-center px-[${pad}px]`;
      return `${band} ${o.value && !vertical ? "flex-1" : ""} cursor-pointer ${fade} disabled:opacity-50 disabled:cursor-not-allowed`;
    },
    get indicatorClass(): string {
      const s = sliderPresets[controls()][tier];
      const rail = vertical ? `w-[${s.rail}px] h-full` : `h-[${s.rail}px]`;
      return `${rail} rounded-full`;
    },
    get indicatorStyle(): ViewStyle {
      const s = sliderPresets[controls()][tier];
      return {
        backgroundColor: token(s.trackRole),
        ...(s.outlined
          ? { boxShadow: insetEdge(finish.track.borderColor, finish.track.boxShadow) }
          : {}),
      };
    },
    rangeClass: "rounded-full",
    // The keyboard's ring on the thumb that has the focus (`focus-visible:`:
    // not after a press or a drag).
    get thumbClass(): string {
      const s = sliderPresets[controls()][tier];
      const hoverMods = s.hoverBrightness
        ? "hover:brightness-105 active:brightness-95 disabled:brightness-100"
        : "";
      const focusRingClass = "focus-visible:outline-3 focus-visible:outline-ring/50";
      if (s.handleShape === "bar") {
        const w = vertical ? s.thumbHeight : s.thumbWidth;
        const h = vertical ? s.thumbWidth : s.thumbHeight;
        const pressMod = vertical
          ? `active:h-[${s.thumbPressedWidth}px]`
          : `active:w-[${s.thumbPressedWidth}px]`;
        return `w-[${w}px] h-[${h}px] ${pressMod} rounded-full ${fade} ${focusRingClass}`;
      }
      if (s.handleShape === "ring") {
        const outer = s.thumbWidth - 2 * EDGE_WIDTH;
        const rim = (outer - s.innerDot) / 2;
        const hoverRim = (outer - s.innerDotHover) / 2;
        const pressRim = (outer - s.innerDotPressed) / 2;
        return `w-[${outer}px] h-[${outer}px] rounded-full border-solid border-popover border-[${rim}px] hover:border-[${hoverRim}px] active:border-[${pressRim}px] ${fade} ${focusRingClass}`;
      }
      return `rounded-full ${fade} ${hoverMods} ${focusRingClass}`.trim();
    },
    get thumbStyle(): ViewStyle {
      const s = sliderPresets[controls()][tier];
      if (s.handleShape === "bar") {
        return {
          backgroundColor: finish.handle.backgroundColor,
          borderWidth: 0,
        };
      }
      if (s.handleShape === "ring") {
        return {
          backgroundColor: colors.brandFill,
          boxShadow: outerEdge(finish.handle.borderColor, finish.handle.boxShadow, EDGE_WIDTH),
        };
      }
      return {
        width: s.thumbWidth,
        height: s.thumbHeight,
        borderWidth: stroke.control,
        ...finish.handle,
      };
    },
  };
}

/** The accent's color and edge. A vertical rail turns the theme's gradient a quarter turn. */
function accentFill(vertical: boolean): ViewStyle {
  const fill = fillStyle();
  const s = sliderPresets[controls()][tier];
  return {
    ...(vertical && fill.backgroundImage
      ? { ...fill, backgroundImage: fill.backgroundImage.replace("180deg", "90deg") }
      : fill),
    ...(s.outlined
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
