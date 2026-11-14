// A quiet state mark (dot + word). From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, terminal, toneColor, type Tone } from "@shadcn-nsh/theme";
import { Text, View } from "nsh";

// @port index.tsx
/** A state in a list row or a header, quieter than a `Badge`: a round dot
 * and a word, tinted only for a tone that matters (an active window); the
 * dot's color crosses over as the state changes. The word alone in the
 * terminal. */
export function Status(props: { label: string; tone?: Tone }) {
  const tinted = () => props.tone != null && props.tone !== "neutral";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <If when={!terminal}>
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: tinted() ? toneColor(props.tone!) : colors.faint,
            transitionProperty: "colors",
            transitionDuration: 160,
          }}
        />
      </If>
      <Text
        style={{
          fontSize: 12,
          fontWeight: tinted() ? "500" : "400",
          color: tinted() ? toneColor(props.tone!) : colors.muted,
          numberOfLines: 1,
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}
// @port end
