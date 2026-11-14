// A small capsule label. From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, terminal, TERMINAL_ROW, toneColor, toneTint, type Tone } from "@shadcn-nsh/theme";
import { token, View, Text } from "nsh";

// @port index.tsx
/**
 * A small label in a capsule (a word on its row in the terminal), after
 * shadcn/ui's secondary badge: 20 points tall, flat, no shadow; a neutral
 * badge on the theme's `muted` fill in the text color, a toned one on its
 * tone's tint in the tone's color, `outline` an edge in the tone's color.
 */
export function Badge(props: { label: string; tone?: Tone; outline?: boolean }) {
  const tone = () => props.tone ?? "neutral";
  return (
    <View
      style={{
        paddingHorizontal: terminal ? 0 : 8,
        height: terminal ? TERMINAL_ROW : 20,
        borderRadius: 10,
        justifyContent: "center",
        backgroundColor: props.outline
          ? "transparent"
          : tone() === "neutral"
            ? token("muted")
            : toneTint(tone()),
        borderWidth: props.outline ? 1 : 0,
        borderColor: props.outline ? toneColor(tone()) : undefined,
        // A change of tone (a window turning active) crosses over.
        transitionProperty: "colors",
        transitionDuration: 160,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "500",
          color: tone() === "neutral" ? colors.text : toneColor(tone()),
          numberOfLines: 1,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}
// @port end
