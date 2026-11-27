// A keyboard key, alone or in a group of them, on `nsh`'s own View and Text.

import { colors, font, rounded, shape, stroke, terminal, TERMINAL_ROW } from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewProps, ViewStyle } from "nsh";
import { split, token, View } from "nsh";

import { AsText } from "./lib/utils";

/** A key's props: a string is its name, drawn in the look's type; anything else (an icon) is drawn as given. */
export type KbdProps = Omit<ViewProps, "children"> & {
  /** The key's name (`K`, `Esc`, `⌘`), or an icon. */
  children?: string | JSX.Element;
};

/** A row of keys: `⌘` and `K` as two caps, or one cap holding `Ctrl + B`. */
export type KbdGroupProps = ViewProps;

/**
 * A keyboard key, after shadcn/ui's: a small cap in the muted fill with a hairline edge, for the
 * stroke a shortcut takes. Every `nsh` view prop passes through; `class` and `classList` follow
 * the look, and `style` goes over it. In a terminal the key is its name in the monospaced face,
 * with no cap around it.
 */
export function Kbd(props: KbdProps) {
  const [, rest] = split(props, ["children", "class", "classList", "style"]);
  const look = kbdLook();
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[look.kbd, props.style ?? null]}
    >
      <AsText style={look.text}>{props.children}</AsText>
    </View>
  );
}

/** Keys side by side, a small gap apart: `⌘`, `⇧`, `K`. */
export function KbdGroup(props: KbdGroupProps) {
  const [, rest] = split(props, ["children", "class", "classList", "style"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[kbdLook().group, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

// Private helpers

/** A key's look: the cap itself, the type on it, and a row of them. */
interface KbdLook {
  /** The cap: one line high, at least as wide, a light fill and a hairline edge. */
  readonly kbd: ViewStyle;
  /** The key's name on the cap: small, medium, and a step quieter than the page's text. */
  readonly text: TextStyle;
  /** A row of keys, a gap apart (`⌘ K` as two caps). */
  readonly group: ViewStyle;
}

/** The side of a key: one line of small type with room above and below it. */
const side = 20;

/**
 * A key's look, after shadcn/ui's `Kbd`: one line high (20 points with a pointer, one Cell row in
 * the terminal), as wide as its name with a padding either side and at least a square, the theme's
 * small corners, a hairline edge and the `muted` fill, the name small (12 points), medium and in
 * the muted ink. The terminal draws no fill and no edge, its keys standing in the row as their
 * names in the monospaced face.
 */
function kbdLook(): KbdLook {
  return {
    get kbd(): ViewStyle {
      return terminal ? terminalCap() : cap();
    },
    get text(): TextStyle {
      return terminal ? terminalKeyText() : keyText();
    },
    get group(): ViewStyle {
      return terminal ? terminalGroup() : keyGroup();
    },
  };
}

/** The cap on a pointer or a touch screen: 20 points, a hairline, the muted fill. */
function cap(): ViewStyle {
  return {
    height: side,
    minWidth: side,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    ...rounded(shape.control),
    borderWidth: stroke.control,
    borderColor: colors.line,
    backgroundColor: token("muted"),
  };
}

/** The key's name on that cap. No type role has this size: a key cap's 12. */
function keyText(): TextStyle {
  return {
    fontSize: 12,
    fontWeight: font.weight("label"),
    color: colors.mutedForeground,
    numberOfLines: 1,
  };
}

/** Keys in a row, four points apart. */
function keyGroup(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  };
}

// Terminal

/** A key in the terminal: one Cell row, no fill and no edge. */
function terminalCap(): ViewStyle {
  return {
    height: TERMINAL_ROW,
    minWidth: undefined,
    paddingHorizontal: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 0,
    borderColor: colors.line,
    backgroundColor: "transparent",
  };
}

/** The key's name on the character grid: 14, in the monospaced face. */
function terminalKeyText(): TextStyle {
  return {
    fontSize: 14,
    fontWeight: font.weight("label"),
    color: colors.mutedForeground,
    fontFamily: font.mono,
    numberOfLines: 1,
  };
}

/** Keys in a terminal row sit against each other: the grid is the gap. */
function terminalGroup(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    flexShrink: 0,
  };
}
