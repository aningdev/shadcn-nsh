// A quiet state mark (dot + word).
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, terminal, toneColor, type Tone, font } from "@shadcn-nsh/theme";
import { Text, View } from "nsh";

import { type Live, read } from "./lib/live-value";

/** The dot's diameter; half of it is its corner, a full circle. */
const dotSide = 7;

/** The dot's color crosses over as the state changes, rather than snapping. */
const toneTransition = 160;

/** A state mark: its word and the dot's tone. */
export type StatusProps = {
  label: string;
  /** The dot's and the word's tone: the text's quiet colors by default; a function is read where they are drawn. */
  tone?: Live<Tone>;
};

/** A state in a list row or a header, quieter than a `Badge`: a round dot
 * and a word, tinted only for a tone that matters (an active window); the
 * dot's color crosses over as the state changes. The word alone in the
 * terminal. */
export function Status(props: StatusProps) {
  // Read where the dot and the word are drawn, so a function follows a value the app changes.
  // Only a tone that matters tints them: the neutral one stays quiet.
  const tint = (): string | undefined => {
    const tone = read(props.tone);
    return tone != null && tone !== "neutral" ? toneColor(tone) : undefined;
  };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <If when={!terminal}>
        <View
          style={{
            width: dotSide,
            height: dotSide,
            borderRadius: dotSide / 2,
            backgroundColor: tint() ?? colors.faint,
            transitionProperty: "colors",
            transitionDuration: toneTransition,
          }}
        />
      </If>
      <Text
        style={{
          // No type role has this size: a status's 12 in both tiers.
          fontSize: 12,
          fontWeight: tint() ? font.weight("label") : font.weight("body"),
          color: tint() ?? colors.mutedForeground,
          numberOfLines: 1,
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}
