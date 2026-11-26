// A terminal: the look (`terminalLook`) and the `Terminal` that wears it.

import {
  alpha,
  colors,
  finish,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
  terminal as terminalIdiom,
  stroke,
  tier,
} from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { split } from "nsh";
import { Terminal as BaseTerminal, type TerminalProps as BaseTerminalProps } from "nsh/base";

import { fieldCorners, fieldEdgeWidths, fieldRestEdge } from "./lib/indicator";
import { type Live, read } from "./lib/live-value";
import { fieldLook, fillOf } from "./lib/look";

/**
 * A terminal's variants: `default` is a well — the field's fill and edge, the theme's inner corners,
 * a padding — so a terminal sits in a page beside the other controls. `ghost` draws no surface at
 * all: no fill, no edge, no padding, no corners. An app whose window is the terminal (a shell, a
 * build log, a remote session filling the frame) gives the surface itself and must not have a box
 * drawn inside it.
 */
export type TerminalVariant = "default" | "ghost";

/** Options of `terminalLook`. */
export interface TerminalLookOptions {
  /** `default` (the well) unless `ghost` (the app's own surface). */
  variant?: Live<TerminalVariant | undefined>;
  /** More style (a height, a margin), over the look's. */
  style?: Live<ViewStyle | undefined>;
}

/**
 * A well's padding: the text of a program starts a little inside its edge. A well's own room — the
 * theme's control padding leaves a line of type against the edge — compact with a pointer, roomier
 * on a touch screen.
 */
const wellPad = (): { x: number; y: number } =>
  tier === "pointer" ? { x: 12, y: 10 } : { x: 14, y: 12 };

/**
 * A terminal's look: the well a program's output is drawn in, and its cursor. The well takes an
 * input's face — the field's fill, its finish and its edge, so a terminal reads as something written
 * into rather than a card — with the inner tier's corners and a padding around the text. `ghost`
 * takes none of it. The cursor is half the text's color: a block a cell wide, the glyph under it
 * still readable.
 * In the terminal idiom a well is a one-point border whose rows and columns the padding fills out,
 * as every surface there is; the colors a program asks for are NSH's own and never this library's.
 */
export function terminalLook(o?: TerminalLookOptions) {
  return {
    get style(): ViewStyle {
      if (read(o?.variant) === "ghost") return { ...read(o?.style) };
      if (terminalIdiom) {
        return {
          backgroundColor: colors.field,
          borderWidth: stroke.hairline,
          borderColor: colors.border,
          paddingVertical: TERMINAL_ROW - 1,
          paddingHorizontal: 2 * TERMINAL_COLUMN - 1,
          ...read(o?.style),
        };
      }
      // A well outside the terminal idiom is a field's: the recipe decides the fill, how many sides
      // carry an edge and in which colour, and the corners — so a terminal matches the fields and
      // selects beside it in every theme, and only its padding is the terminal's own.
      const field = fieldLook();
      return {
        ...(field.ground ? fillOf(field.ground) : {}),
        ...fieldEdgeWidths(field),
        ...fieldRestEdge(field),
        ...fieldCorners(field),
        boxShadow: finish.inset.boxShadow,
        paddingHorizontal: wellPad().x,
        paddingVertical: wellPad().y,
        ...read(o?.style),
      };
    },
    get cursorStyle(): ViewStyle {
      return { backgroundColor: alpha(colors.foreground, 0.5), borderRadius: 1 };
    },
  };
}

/** Every prop of `nsh/base` Terminal, plus the look's `variant`. */
export type TerminalProps = BaseTerminalProps & {
  /** `default` (the well) unless `ghost` (the app's own surface). */
  variant?: TerminalVariant;
};

/**
 * A program's output on a themed surface, the keys typed back to it. The emulator, the scrollback,
 * the keys and the size in cells stay in base; the program is the app's (`write` on the ref,
 * `onData` and `onResize` on events). The text is the theme's monospaced family (base's default),
 * and what a program colors comes from its own escape sequences.
 */
export function Terminal(props: TerminalProps) {
  const [, rest] = split(props, ["variant", "style", "cursorStyle"]);
  const look = terminalLook({ variant: () => props.variant });
  return (
    <BaseTerminal
      {...rest}
      style={[look.style, props.style ?? null]}
      cursorStyle={[look.cursorStyle, props.cursorStyle ?? null]}
    />
  );
}

/** A terminal's ref — `write`, `reset`, `text`, `focus` — from `nsh/base`. */
export type { TerminalRef } from "nsh/base";
