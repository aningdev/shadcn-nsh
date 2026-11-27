// A small capsule label.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { split, View, Text, type ViewProps } from "nsh";

import {
  colors,
  control,
  terminal,
  TERMINAL_ROW,
  toneColor,
  toneTint,
  type Tone,
  rounded,
  font,
  stroke,
} from "../theme";
import { type Live, read } from "./lib/utils";

/** A badge's variants: `default`, the tone's fill; `outline`, an edge in the tone's color. */
export type BadgeVariant = "default" | "outline";

/** A badge's size: `sm` 18 points tall, `default` 20. */
export type BadgeSize = "sm" | "default";

/**
 * The props of `Badge`: the label and the tone, plus every view prop (`style`,
 * `class`, `testID`, the accessibility ones), spread on the capsule after
 * the badge's own.
 */
export type BadgeProps = Omit<ViewProps, "children"> & {
  /** The label: a word, a state, a count. */
  children: string;
  /** The tone of the word and its fill, `neutral` unless set; a function is read where the badge is drawn. */
  tone?: Live<Tone>;
  /** `default`: the tone's fill; `outline`: an edge in the tone's color under the word. */
  variant?: BadgeVariant;
  /** `default`: 20 points tall; `sm`: 18, to sit beside a smaller row (a tool card's 32 pt tile). */
  size?: BadgeSize;
};

/**
 * A small label in a capsule (a word on its row in the terminal), after
 * shadcn/ui's secondary badge: 20 points tall, flat, no shadow; a neutral
 * badge on the theme's `muted` fill in the text color, a toned one on its
 * tone's tint in the tone's color, and as `variant="outline"` an edge in
 * the tone's color. `size` is the bar's height: 20, or 18 at `sm`. The
 * children are the label; `tone` is read where it is drawn, so a function
 * follows a value the app changes.
 */
export function Badge(props: BadgeProps) {
  const [, rest] = split(props, ["children", "tone", "variant", "size", "style"]);
  const tone = () => read(props.tone) ?? "neutral";
  const outline = props.variant === "outline";
  const size = badgeSizes[props.size ?? "default"];
  return (
    <View
      {...rest}
      style={[
        {
          paddingHorizontal: terminal ? 0 : size.pad,
          height: terminal ? TERMINAL_ROW : size.height,
          ...rounded(control("badge").corner),
          justifyContent: "center",
          backgroundColor: outline
            ? "transparent"
            : tone() === "neutral"
              ? colors.muted
              : toneTint(tone()),
          borderWidth: outline ? stroke.control : 0,
          borderColor: outline ? toneColor(tone()) : undefined,
          // A change of tone (a window turning active) crosses over.
          transitionProperty: "colors",
          transitionDuration: 160,
        },
        props.style ?? null,
      ]}
    >
      <Text
        // The pill is a fixed height: the text follows the system size, but only so far.
        maxFontSizeMultiplier={1.2}
        style={{
          fontSize: size.font,
          fontWeight: font.weight("label"),
          color: tone() === "neutral" ? colors.foreground : toneColor(tone()),
          numberOfLines: 1,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.children}
      </Text>
    </View>
  );
}

// Private helpers

/** A badge's height, label size and horizontal padding, by size. */
const badgeSizes: Record<BadgeSize, { height: number; font: number; pad: number }> = {
  sm: { height: 18, font: 11, pad: 6 },
  default: { height: 20, font: 12, pad: 8 },
};
