// The showcase demos' shared layout (not shipped anywhere): the page a demo draws in, a card of
// its sections, and a wrap row. Every demo file (`demos/<kebab-name>.tsx`) draws through this, so
// the scenes differ only in what they show. Colors come from the theme only — `colors` of
// `@shadcn-nsh/theme` — and follow the palette and appearance the app has chosen.
import { colors } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { Scroll, Text, View } from "nsh";

import { density, sectionSurface } from "@/packages/ui/lib/surface";

/** The page a demo draws in: the app's background, padding, a title and the demo's body. It
 * scrolls when the body is taller than the window. */
export function DemoPage(props: {
  title: string;
  children: JSX.Element;
  /** A quieter line under the body (the last event, read live when it is a function). */
  note?: string | (() => string);
}) {
  return (
    <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexGrow: 1,
          padding: 20,
          gap: density.gap + 4,
          maxWidth: 880,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground }}>
          {props.title}
        </Text>
        {props.children}
        <If when={props.note}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            {typeof props.note === "function" ? props.note() : props.note}
          </Text>
        </If>
      </View>
    </Scroll>
  );
}

/** A card the demo's sections sit on: `sectionSurface` with a title and a quieter subtitle. */
export function DemoCard(props: {
  title: string;
  subtitle?: string;
  children: JSX.Element;
  style?: ViewStyle;
}) {
  return (
    <View style={[sectionSurface({ padded: true }), { gap: density.gap + 4 }, props.style ?? null]}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
          {props.title}
        </Text>
        <If when={props.subtitle}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.subtitle}</Text>
        </If>
      </View>
      {props.children}
    </View>
  );
}

/** A row of small controls that wraps when it does not fit (`axis="block"` for a column). */
export function DemoRow(props: { axis?: "inline" | "block"; children: JSX.Element }) {
  return (
    <View
      style={
        props.axis === "block"
          ? { flexDirection: "column", gap: 10, alignItems: "flex-start" }
          : { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }
      }
    >
      {props.children}
    </View>
  );
}

/** A small title over a row of controls (`axis="block"` for a column). */
export function DemoSection(props: {
  title: string;
  axis?: "inline" | "block";
  children: JSX.Element;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>
        {props.title}
      </Text>
      <DemoRow axis={props.axis}>{props.children}</DemoRow>
    </View>
  );
}

/** A caption over a cluster of controls. */
export function Caption(props: { children: string }) {
  return <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.children}</Text>;
}

/** A size's name beside its controls, one row. */
export function SizeRow(props: { label: string; children: JSX.Element }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
      <Text style={{ width: 64, fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      {props.children}
    </View>
  );
}
