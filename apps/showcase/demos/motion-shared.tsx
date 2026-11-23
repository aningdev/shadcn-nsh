// Shared pieces of the Motion demos (this batch's files alone). The gallery's section, chip row,
// legend, icon tile and entrance are not components of this library: `Card` is the section's
// surface, and the rest are drawn here. Colors come from the theme only.
import {
  alpha,
  colors,
  finish,
  isDark,
  mono,
  motion,
  terminal,
  TERMINAL_GAP,
  shape,
} from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { createAnimatedValue, platform, Scroll, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card";
import { density } from "@/packages/ui/lib/surface";
import { Toggle, ToggleGroup } from "@/packages/ui/toggle";

/** The device's input: `touch` on phones and tablets, `pointer` on desktops. */
export const hint = (touch: string, pointerText: string) =>
  platform.desktop ? pointerText : touch;

/** A pointer (desktops) rather than a finger. The platform does not change while a demo shows. */
export const pointer = platform.desktop;

/** The five tones a demo's dots and tiles cycle through. Call it where the color is drawn. */
export const tones = () =>
  [colors.brand, colors.info, colors.warn, colors.destructive, colors.up] as const;

/**
 * Ink on a saturated tone fill. Light, the knob (white); dark, the ink that sits on the brand
 * fill. There is no role for ink on an arbitrary tone — the gallery uses `#ffffff` in the light.
 */
export const onTone = () => (isDark() ? colors.primaryForeground : colors.knob);

/** A tone's raised fill: the color, a soft top light (the knob, the lightest neutral) and the knob's drop. */
export function toneFill(color: string): ViewStyle {
  return {
    backgroundColor: color,
    backgroundImage: `linear-gradient(180deg, ${alpha(colors.knob, 0.22)} 0%, ${alpha(colors.knob, 0)} 100%)`,
    boxShadow: finish.knob.boxShadow,
  };
}

/** The darker surface a gesture plays on. Call it where the style is applied. */
export function stage(): ViewStyle {
  return {
    borderRadius: shape.control,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    ...finish.track,
  };
}

/** The drop under a small colored knob: a switch knob's, its fill left to the knob's own color. */
export function knobDrop(): ViewStyle {
  return { boxShadow: finish.knob.boxShadow };
}

/**
 * A section: this library's `Card` (title, description and a trailing action inside the surface).
 * The gallery draws the title above the surface; `DemoCard` has no trailing slot.
 */
export function Scene(props: {
  title: string;
  subtitle?: string;
  right?: JSX.Element;
  /** The body meets the card's side and bottom edges (`CardContent` `flush`). */
  flush?: boolean;
  children: JSX.Element;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <If when={props.subtitle}>
          <CardDescription>{props.subtitle}</CardDescription>
        </If>
        <If when={props.right}>
          <CardAction>{props.right}</CardAction>
        </If>
      </CardHeader>
      <CardContent flush={props.flush}>{props.children}</CardContent>
    </Card>
  );
}

/** A label and the API it uses, the API in code type. */
export function Api(props: { label: string; api: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: 8,
        rowGap: 2,
      }}
    >
      <Text
        style={{
          flexGrow: 1,
          flexShrink: 1,
          minWidth: 140,
          fontSize: density.body,
          color: colors.mutedForeground,
        }}
      >
        {props.label}
      </Text>
      <Text
        style={{
          flexShrink: 1,
          minWidth: 0,
          textAlign: "right",
          fontSize: density.note,
          fontFamily: mono(),
          color: colors.faint,
        }}
      >
        {props.api}
      </Text>
    </View>
  );
}

/** A colored square and a label, for a plot's legend (the label alone in the terminal). */
export function Legend(props: { color: string; label: string; value?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <If when={!terminal}>
        <View style={{ width: 9, height: 9, borderRadius: 2.5, backgroundColor: props.color }} />
      </If>
      <Text style={{ fontSize: density.body, color: colors.mutedForeground }}>
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

/**
 * Fades and lifts its content in once mounted. `index` staggers siblings 40 ms apart. The kit's
 * `DemoPage` does not, and the library has no entrance.
 */
export function Appear(props: { index?: number; flex?: boolean; children: JSX.Element }) {
  const t = createAnimatedValue(0);
  void t.timing(1, {
    duration: motion.enter.duration,
    easing: motion.enter.timingFunction,
    delay: Math.min(8, props.index ?? 0) * 40,
  });
  return (
    <View
      style={{
        flex: props.flex ? 1 : undefined,
        opacity: t,
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {props.children}
    </View>
  );
}

/** A status capsule in the card's trailing slot. */
export function StatusBadge(props: {
  label: string;
  tone?: "neutral" | "accent" | "info" | "warn" | "up";
}) {
  return <Badge tone={props.tone ?? "neutral"}>{props.label}</Badge>;
}

/**
 * One capsule of a single-select row: the library's `Toggle` with the capsule recipe (`toggle`'s
 * page, "Chips"). A press on the chosen chip keeps it chosen.
 */
export function Chip(props: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Toggle
      variant="outline"
      size="lg"
      pressed={props.active}
      style={{ borderRadius: 999 }}
      onChange={props.onPress}
    >
      {props.label}
    </Toggle>
  );
}

/** A row of chips: scrolled sideways, or wrapped in a terminal, whose columns would cut the last off. */
export function ChipRow(props: { children: JSX.Element }) {
  if (terminal) {
    return (
      <ToggleGroup inset={false} style={{ flexWrap: "wrap", columnGap: TERMINAL_GAP }}>
        {props.children}
      </ToggleGroup>
    );
  }
  return (
    <Scroll horizontal scrollbar={false} style={{ height: 40, flexGrow: 0 }}>
      <ToggleGroup inset={false} style={{ gap: 8 }}>
        {props.children}
      </ToggleGroup>
    </Scroll>
  );
}
