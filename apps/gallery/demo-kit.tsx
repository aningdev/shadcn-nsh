// Page furniture shared by the gallery's family pages: a scrolling page on the theme's
// background, titled panels on a card, labelled rows. Part of the gallery, not of the registry.
import { colors, radius } from "@shadcn-nsh/theme";
import { Scroll, Text, View } from "nsh";

/** A labelled row: the label on the left, the controls wrapping beside it. */
export function Row(props: { label: string; children: unknown }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, width: 84 }}>{props.label}</Text>
      {props.children as never}
    </View>
  );
}

/** A flow of controls that wraps, for a row's right-hand side. */
export function Flow(props: { children: unknown }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, flex: 1 }}>
      {props.children as never}
    </View>
  );
}

/** A titled card holding a family's rows. */
export function Panel(props: { title: string; children: unknown }) {
  return (
    <View
      style={{
        gap: 12,
        padding: 16,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        {props.title}
      </Text>
      {props.children as never}
    </View>
  );
}

/** The page: scrolls, on the theme's background. */
export function Page(props: { children: unknown }) {
  return (
    <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ gap: 16, padding: 20, backgroundColor: colors.background }}>
        {props.children as never}
      </View>
    </Scroll>
  );
}
