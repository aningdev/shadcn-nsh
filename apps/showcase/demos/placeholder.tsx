import { colors, radius, rounded } from "@shadcn-nsh/theme";
// The one screen every demo not built yet points at (the showcase arrives in batches, and a later
// batch replaces this entry's screen with the demo's own). Neutral about why: the name and what
// the demo will show, on the page, nothing else.
import { Text, View } from "nsh";

/** What a demo still waiting for its batch shows: its name, and that it is not built yet. */
export function Placeholder(props: { name: string; detail: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <View
        style={{
          alignItems: "center",
          gap: 8,
          padding: 24,
          ...rounded(radius.card),
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
          {props.name}
        </Text>
        <Text
          style={{
            numberOfLines: 2,
            textAlign: "center",
            fontSize: 13,
            color: colors.mutedForeground,
          }}
        >
          {props.detail}
        </Text>
        <Text style={{ fontSize: 13, color: colors.faint }}>Not built yet</Text>
      </View>
    </View>
  );
}
