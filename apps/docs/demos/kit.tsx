// Shared chrome for the port demos (not shipped in the registry): the page shell, a
// section card (`sectionSurface`), and a titled row of controls. Keep `<id>.tsx` and
// `<id>.ref.tsx` on the same kit so `port:render` compares equal pixels.
import { colors } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { Scroll, Text, View } from "nsh";

import { density, sectionSurface } from "@/packages/ui/lib/surface";

/**
 * The page: background, padding, a title, then the demo's body. It scrolls when the body is
 * taller than the window (a phone's 844 points, a desktop window's 900): the demo ends at its
 * content, the way the packaged page's frame does (`demo-client.ts` measures it), rather than
 * being cut off.
 */
export function DemoPage(props: {
  title: string;
  children: JSX.Element;
  /**
   * The widest the page gets, centered: a document's 680 points, as the website centers the
   * text view. Unset, the page takes the whole window.
   */
  width?: number;
  /** Quieter line under the body (press counts, last open reason). */
  note?: string | (() => string);
}) {
  return (
    <Scroll
      style={{ flex: 1, backgroundColor: colors.background }}
      contentStyle={{ flexGrow: 1, padding: 20, gap: density.gap + 2 }}
    >
      <View
        style={
          props.width === undefined
            ? { gap: density.gap + 2 }
            : {
                width: "100%",
                maxWidth: props.width,
                alignSelf: "center",
                gap: density.gap + 2,
              }
        }
      >
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{props.title}</Text>
        {props.children}
        <If when={props.note}>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            {typeof props.note === "function" ? props.note() : props.note}
          </Text>
        </If>
      </View>
    </Scroll>
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

/**
 * A titled cluster of controls. `axis="inline"` (the default) is a wrapping row, for controls
 * that take their own width (buttons, badges, switches). `axis="block"` is a column whose items
 * stretch to the card's content width: for controls that fill the line (an accordion, a
 * collapsible, a table, a slider on its own row), which a row would shrink to their content width.
 */
export function DemoSection(props: {
  title: string;
  axis?: "inline" | "block";
  children: JSX.Element;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: density.note, color: colors.muted }}>{props.title}</Text>
      <View
        style={
          props.axis === "block"
            ? { flexDirection: "column", alignItems: "stretch", gap: 8 }
            : { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }
        }
      >
        {props.children}
      </View>
    </View>
  );
}
