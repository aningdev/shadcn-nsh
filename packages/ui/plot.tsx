// A plot: every mark of `nsh/base/plot` re-exported with the look this library gives them (series
// and category colors, grid, baseline, cross line, hover dot, wash, axis text, tooltip), plus `Legend`.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { split, Text, View } from "nsh";
import type { StyleProp, TextStyle, ViewStyle } from "nsh";

import {
  alpha,
  chart,
  colors,
  control,
  rounded,
  surface,
  surfaceBorderWidth,
  terminal,
  font,
} from "../theme";

// Every mark, so a chart asks one module for its parts and their look.
export {
  Arc,
  Area,
  Bar,
  Cell,
  Dot,
  Grid,
  Line,
  Pie,
  Plot,
  PlotAppearScope,
  PlotAxis,
  PlotLabel,
  RadialGrid,
  RadialLine,
  Rule,
  Sankey,
  Treemap,
  type PlotProps,
} from "nsh/base/plot";

/**
 * A colored square and a label, for chart legends (the label alone in the
 * terminal, which draws no charts).
 */
export function Legend(props: {
  color: string;
  label: string;
  value?: string;
  /** Tailwind classes on the row, after its look. */
  class?: string;
  /** Tailwind classes toggled on the row. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over the row. `style` wins over `class`. */
  style?: StyleProp<ViewStyle>;
}) {
  const [, rest] = split(props, ["color", "label", "value", "class", "classList", "style"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[{ flexDirection: "row", alignItems: "center", gap: 6 }, props.style ?? null]}
    >
      <If when={!terminal}>
        <View style={{ width: 9, height: 9, borderRadius: 2.5, backgroundColor: props.color }} />
      </If>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {props.label}
        <If when={props.value}>
          <Text style={{ color: colors.foreground, fontVariant: ["tabular-nums"] }}>
            {" "}
            {props.value}
          </Text>
        </If>
      </Text>
    </View>
  );
}

// Shared plot primitives
// Demos, the showcase and gallery read the series colors and the chart marks' look.

/** The series' colors, in order (`theme.json`'s `chart-1` to `chart-5`):
 * the brand's citrus first, then graphite from dark to light, so one series
 * leads and the rest stay as quiet as the interface. Rises and falls take
 * `colors.success` / `colors.destructive`. */
export const seriesColors = (): string[] => [
  chart.chart1,
  chart.chart2,
  chart.chart3,
  chart.chart4,
  chart.chart5,
];

/** The `i`th series' color, cycling through the five. */
export const seriesColor = (i: number): string => {
  const palette = seriesColors();
  return palette[i % palette.length];
};

/** Colors for categories that must read apart at a glance (sectors,
 * regions, platforms), in order: the citrus lead, then the theme's info,
 * warn and up, and a graphite. */
export const categoryColors = (): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of [
    chart.chart1,
    colors.info,
    colors.warning,
    colors.success,
    chart.chart3,
    chart.chart2,
    chart.chart4,
    chart.chart5,
    colors.destructive,
  ]) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
      if (out.length === 5) break;
    }
  }
  return out;
};

/** A grid's hairlines (`<Grid style={plotGrid()}>`): the theme's line. */
export const plotGrid = () => ({ stroke: colors.line });

/** A baseline, the grid's zero or its foot: firmer than the grid, the border's color. */
export const plotBaseline = () => ({ stroke: colors.border });

/** A reference (an open, a target): a dashed line of `color` (default the
 * text's) at 28%, quieter than the marks. */
export const plotReference = (color?: string) => ({
  stroke: alpha(color ?? colors.foreground, 0.28),
  strokeDasharray: "2 4",
});

/**
 * The cross line under the pointer (spread it on the `Plot`): a hairline of
 * the text color at 22% over a line or an area; `band`, a faint band (5%)
 * the width of a bar's band, over bars.
 */
export function plotCrossLine(o?: { band?: boolean }) {
  return {
    crossLineClass: o?.band ? "w-full h-full" : "w-px h-full",
    get crossLineStyle(): ViewStyle {
      return { backgroundColor: alpha(colors.foreground, o?.band ? 0.05 : 0.22) };
    },
  };
}

/** The hover's dot (a `Plot`'s `dotClass`): 10 points, ringed. */
export const plotDotClass = "size-2.5 rounded-full border-2";

/** The hover's dot on a line (`hoverDotStyle`): its series' color, ringed in
 * the inset's, so it cuts out of the line. */
export const plotHoverDot = (color: string): ViewStyle => ({
  backgroundColor: color,
  borderColor: surface("inset").style.backgroundColor,
});

/** A wash under a line (an `Area`'s `backgroundStyle`): `color` at `top`
 * opacity (default 18%) fading out to the baseline. */
export const plotWash = (color: string, top = 0.18): ViewStyle => ({
  backgroundImage: `linear-gradient(to bottom, ${alpha(color, top)}, ${alpha(color, 0)})`,
});

/** The values on the axes (a `PlotAxis`'s `labelStyle`): small, monospaced,
 * tabular and faint, so the marks lead. */
export const plotAxisText = (): TextStyle => ({
  // No type role has this size: an axis value's 10.5.
  fontSize: 10.5,
  fontFamily: font.mono,
  color: colors.faint,
  fontVariant: ["tabular-nums"],
});

/** A floating tooltip's card: the inverse surface's ink, the popup corner radius. */
export const plotTooltip = (): ViewStyle => {
  const face = surface("overlay").style;
  const edge = face.borderColor;
  return {
    ...face,
    borderWidth: surfaceBorderWidth(typeof edge === "string" ? edge : undefined),
    ...rounded(control("popup").corner),
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  };
};

/** A tooltip's title over its values: a small, monospaced, muted label. */
export const plotTooltipTitle = (): TextStyle => ({
  // No type role has this size: a tooltip title's 10, tracked out.
  fontSize: 10,
  fontFamily: font.mono,
  letterSpacing: 0.8,
  color: colors.mutedForeground,
});
