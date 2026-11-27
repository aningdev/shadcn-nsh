// A quiet state mark (dot + word).
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { StyleProp, TextStyle, ViewStyle } from "nsh";
import { split, Text, View } from "nsh";

import { colors, font, terminal, toneColor, type Tone } from "../theme";
import { type Live, read } from "./lib/utils";

/** A state mark: its word and the dot's tone. */
export type StatusProps = {
  label: string;
  /** The dot's and the word's tone: the text's quiet colors by default; a function is read where they are drawn. */
  tone?: Live<Tone>;
  /** Tailwind classes on the row, after its look. */
  class?: string;
  /** Tailwind classes toggled on the row. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over the row. `style` wins over `class`. */
  style?: StyleProp<ViewStyle>;
};

/** A state in a list row or a header, quieter than a `Badge`: a round dot
 * and a word, tinted only for a tone that matters (an active window); the
 * dot's color crosses over as the state changes. The word alone in the
 * terminal. */
export function Status(props: StatusProps) {
  const [, rest] = split(props, ["label", "tone", "class", "classList", "style"]);
  // Read where the dot and the word are drawn, so a function follows a value the app changes.
  // Only a tone that matters tints them: the neutral one stays quiet.
  const tint = (): string | undefined => {
    const tone = read(props.tone);
    return tone != null && tone !== "neutral" ? toneColor(tone) : undefined;
  };
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[statusRow(), props.style ?? null]}
    >
      <If when={statusShowsDot()}>
        <View style={statusDot(tint())} />
      </If>
      <Text style={statusLabel(tint())}>{props.label}</Text>
    </View>
  );
}

// Private helpers & looks

/** The dot's diameter; half of it is its corner, a full circle. */
const dotSide = 7;

/** The dot's color crosses over as the state changes, rather than snapping. */
const toneTransition = 160;

/** The row: a dot and its word, 6 points apart. */
function statusRow(): ViewStyle {
  return { flexDirection: "row", alignItems: "center", gap: 6 };
}

/** The dot, in the tone when one matters, else the faint ink. */
function statusDot(tint: string | undefined): ViewStyle {
  return {
    width: dotSide,
    height: dotSide,
    borderRadius: dotSide / 2,
    backgroundColor: tint ?? colors.faint,
    transitionProperty: "colors",
    transitionDuration: toneTransition,
  };
}

/** The word: 12 points, medium when a tone tints it, else the body's weight in the muted ink. */
function statusLabel(tint: string | undefined): TextStyle {
  return {
    // No type role has this size: a status's 12 in both tiers.
    fontSize: 12,
    fontWeight: tint ? font.weight("label") : font.weight("body"),
    color: tint ?? colors.mutedForeground,
    numberOfLines: 1,
  };
}

// Terminal

/** The terminal draws the word alone: no dot. */
function statusShowsDot(): boolean {
  return !terminal;
}
