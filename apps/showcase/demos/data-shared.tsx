// What the Data group's demos share (not shipped anywhere): the gallery's card header over a
// `sectionSurface`, the segmented choice and its toggle, and the number and axis formatting the
// charts read. A chart's figures are `Stat` (`plot.tsx`). The gallery's `Card` puts a title and its one line
// above a padded surface; our `Card` is header/content, so this draws the gallery's arrangement
// from the same `sectionSurface` and `density`.
import { alpha, colors } from "@shadcn-nsh/theme";
import { Text, View, type ViewStyle } from "nsh";
import type { JSX } from "nsh";

import { density, sectionSurface } from "@/packages/ui/lib/surface";
import { plotAxisText } from "@/packages/ui/plot";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { toggleLabel, Toggle } from "@/packages/ui/toggle";

/** The type of an axis' labels (d3's default family and size). */
export const axis = plotAxisText;

/** The room under a plot for its x axis' labels: a gap, then a line of `axis` text. */
export const below = () => ({ ...axis(), lineHeight: 13, paddingTop: 8 });

/** How much taller a plot is than its drawing, for the x axis under it. */
export const BELOW = 8 + 13;

/** A number at a fixed number of decimals. */
export const fixed = (n: number, digits = 2) => n.toFixed(digits);

/** A whole number with thousands grouped. */
export const count = (n: number) => Math.round(n).toLocaleString("en-US");

/** A difference, with a true minus: `+1.24`, `−0.4%`. */
export const signed = (n: number, digits = 2, unit = "") =>
  `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)}${unit}`;

/** Nice round steps strictly inside `lo`–`hi`, about `want` of them (d3's `ticks`). */
export function ticks(lo: number, hi: number, want = 4) {
  const span = hi - lo;
  if (!(span > 0)) return [lo];
  const raw = span / Math.max(1, want);
  const power = 10 ** Math.floor(Math.log10(raw));
  const scale = raw / power;
  const step = (scale > 5 ? 10 : scale > 2 ? 5 : scale > 1 ? 2 : 1) * power;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v < hi; v += step)
    out.push(Math.round(v / step) * step);
  return out;
}

/** A repeatable walk: the gallery's `random(seed)`, a number in `[0, 1)` per call. */
export function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * A chart's card, as the gallery draws one: the title and its one line above the padded flat
 * surface its content sits on, with an optional trailing action in the title's row.
 */
export function ChartCard(props: {
  title: string;
  subtitle?: string | (() => string);
  action?: JSX.Element;
  children: JSX.Element;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ flexDirection: "column", gap: 8 }, props.style ?? null]}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 2 }}>
        <View style={{ flex: 1, flexDirection: "column", gap: 2 }}>
          <Text style={{ fontSize: density.title, fontWeight: "600", color: colors.foreground }}>
            {props.title}
          </Text>
          <If when={props.subtitle}>
            <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
              {typeof props.subtitle === "function" ? props.subtitle() : props.subtitle}
            </Text>
          </If>
        </View>
        {props.action}
      </View>
      <View
        style={{
          ...sectionSurface(),
          overflow: "hidden",
          flexDirection: "column",
          gap: density.gap,
          padding: density.pad,
        }}
      >
        {props.children}
      </View>
    </View>
  );
}

/** A segmented choice of the gallery's (`{value, label}` options), with the width a card gives it. */
export function Choice<T extends string>(props: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  size?: "small" | "regular";
  width?: number;
}) {
  return (
    <View style={{ alignSelf: "flex-start", width: props.width }}>
      <Segmented value={props.value} onValueChange={(next) => props.onChange(next as T)}>
        <SegmentedList size={props.size === "small" ? "sm" : "default"}>
          <Each of={props.options}>
            {(option) => <SegmentedItem value={option().value}>{option().label}</SegmentedItem>}
          </Each>
        </SegmentedList>
      </Segmented>
    </View>
  );
}

/** The gallery's `ToggleButton`: a small segmented-looking press with a dot that fills when on. */
export function ToggleButton(props: {
  label: string;
  accessibilityLabel?: string;
  on: boolean;
  onPress: () => void;
}) {
  const pressed = () => props.on;
  return (
    <Toggle
      size="sm"
      variant="outline"
      text
      pressed={props.on}
      onChange={() => props.onPress()}
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      style={{ gap: 6 }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: props.on ? colors.brand : colors.faint,
        }}
      />
      <Text style={toggleLabel(pressed)}>{props.label}</Text>
    </Toggle>
  );
}

/** A legend's key: a small square of the series' color and its name. */
export function Key(props: { color: string; label: string; value?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: props.color }} />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      <If when={props.value}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.foreground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {props.value}
        </Text>
      </If>
    </View>
  );
}

/** A legend's key for a line: a short rule of its color, dashed for a reference series. */
export function LineKey(props: {
  color: string;
  label: string;
  value?: string;
  dashed?: boolean;
  width?: number;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: props.width ?? 14,
          height: props.dashed ? 0 : 2,
          borderRadius: 1,
          borderTopWidth: props.dashed ? 1 : 0,
          borderStyle: props.dashed ? "dashed" : "solid",
          borderColor: props.color,
          backgroundColor: props.dashed ? undefined : props.color,
        }}
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      <If when={props.value}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.foreground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {props.value}
        </Text>
      </If>
    </View>
  );
}

/** A track and its fill, for the small shares a chart reads under its plot. */
export function ShareBar(props: {
  left: number;
  right: number;
  leftColor: string;
  rightColor: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 3, height: 4 }}>
      <View style={{ flex: props.left, borderRadius: 2, backgroundColor: props.leftColor }} />
      <View style={{ flex: props.right, borderRadius: 2, backgroundColor: props.rightColor }} />
    </View>
  );
}

/** A faint hairline between a chart's blocks. */
export const hairline = alpha(colors.line, 0.8);
