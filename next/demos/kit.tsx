// Shared chrome for the port demos (not shipped in the registry): the page shell, a
// section card (`sectionSurface`), and a titled row of controls. Keep `<id>.tsx` and
// `<id>.ref.tsx` on the same kit so `port:render` compares equal pixels.
import { colors } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { Text, View } from "nsh";

import { density, sectionSurface } from "../ui/lib/surface";

/** The page: background, padding, a title, then the demo's body. */
export function DemoPage(props: {
  title: string;
  children: JSX.Element;
  /** Quieter line under the body (press counts, last open reason). */
  note?: string | (() => string);
}) {
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: density.gap + 2 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{props.title}</Text>
      {props.children}
      <If when={props.note}>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {typeof props.note === "function" ? props.note() : props.note}
        </Text>
      </If>
    </View>
  );
}

/** A card of `sectionSurface({ padded })`: the flat surface demos sit their controls on. */
export function DemoCard(props: {
  children: JSX.Element;
  /** Default true: padding so `listRow` hover fills can bleed into it. */
  padded?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        sectionSurface({ padded: props.padded ?? true }),
        { gap: density.gap + 4 },
        props.style ?? null,
      ]}
    >
      {props.children}
    </View>
  );
}

/** A titled cluster of controls in a wrapping row (variants, sizes, states). */
export function DemoSection(props: { title: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: density.note, color: colors.muted }}>{props.title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {props.children}
      </View>
    </View>
  );
}
