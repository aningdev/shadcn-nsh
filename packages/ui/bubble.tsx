// A bubble: the framed surface of one turn of a conversation, and the row of reactions that
// hangs off its edge. This library's own (drawn on `nsh`'s View and Text), so there is no port
// region. Yours to change.
import { colors, radius, rounded, tints } from "@shadcn-nsh/theme";
import type { JSX, TextProps, TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, effect, platform, signal, split, Text, token, View } from "nsh";

import { AsText } from "./lib/as-text";
import { density, PILL_RADIUS } from "./lib/surface";

/**
 * A bubble's fill: `default`, the accent's fill (what you send); `secondary`, the raised neutral
 * of a page's own content; `muted`, a quieter fill; `tinted`, the accent as a soft wash;
 * `outline`, a hairline around the page's fill; `ghost`, no frame at all (assistant text that
 * runs the full width); `destructive`, a failed or dangerous turn.
 */
export type BubbleVariant =
  | "default"
  | "secondary"
  | "muted"
  | "tinted"
  | "outline"
  | "ghost"
  | "destructive";

/** Which side of the conversation a bubble sits on: `start` (what came in), `end` (what you send). */
export type BubbleAlign = "start" | "end";

/** Which edge a bubble's reactions hang off: `bottom`, overlapping the bubble's lower edge, or
 * `top`, its upper one. */
export type BubbleSide = "top" | "bottom";

/** The widest a framed bubble gets in its column: shadcn/ui's `max-w-[80%]`. A `ghost` one takes
 * the whole width. */
const maxWidth = "80%";

/** The room inside a framed bubble: 12 points either side, 8 above and below (shadcn/ui's
 * `px-3 py-2`). */
const padX = 12;
const padY = 8;

/** How far a row of reactions hangs off its bubble: three quarters of its own height. */
const reactionsOverlap = "75%";

/** How far a row of reactions sits inside the bubble's edge: 12 points. */
const reactionsInset = 12;

/** The ring a row of reactions wears where it crosses the bubble: 3 points in the card's color. */
const reactionsRing = 3;

/** The reactions' line: the body's size at 1.25, so the pill's height is known. */
const reactionsLine = (): number => Math.round(density.body * 1.25);

/**
 * The room a row of reactions takes past its bubble's edge: the three quarters of the pill (its
 * line and 3 points above and below) that hang out, and its ring.
 */
const reactionsHang = (): number => Math.ceil((reactionsLine() + 6) * 0.75) + reactionsRing;

/** What the parts under a `Bubble` read: the variant, and where to say a row of reactions hangs. */
interface BubbleState {
  variant: () => BubbleVariant;
  /** A `BubbleReactions` hangs off `side`; the bubble keeps the room. Returns the undo. */
  hang: (side: BubbleSide) => () => void;
}

const BubbleContext = context<BubbleState | null>(null);

/** A bubble's parts as the styles they wear: spread each one onto the part that matches its name. */
export interface BubbleLook {
  /** A group of bubbles from one sender (`BubbleGroup`): a column 8 points apart. */
  readonly group: ViewStyle;
  /** The bubble (`Bubble`): a column at the width of what it holds, at most 80% of the column it
   * is in, on `align`'s side of it. A `ghost` bubble takes the whole width. */
  root(variant: BubbleVariant, align: BubbleAlign): ViewStyle;
  /** What a bubble that holds something pressable shows: the hand over it. */
  readonly pressable: ViewStyle;
  /** The bubble's frame (`BubbleContent`): the variant's fill, its ink, a hairline edge on every
   * variant (transparent where there is none, so the box is the same size), corners of a card. A
   * `ghost` bubble has no frame and no padding: its content stands on the page. */
  content(variant: BubbleVariant): ViewStyle;
  /** The type on a bubble: the body's size, a step of leading, the variant's ink. */
  text(variant: BubbleVariant): TextStyle;
  /** The row of reactions (`BubbleReactions`): a small pill in the muted fill, its edge ringing it
   * where it crosses the bubble, hung off the bubble's `side` edge at `align`'s end. */
  reactions(side: BubbleSide, align: BubbleAlign): ViewStyle;
  /** The room a bubble keeps on `side` for the reactions hung there, so the next bubble does not
   * cover them. */
  reactionsRoom(side: BubbleSide): ViewStyle;
  /** What a reaction is drawn in: the body's size, the page's ink. */
  readonly reactionText: TextStyle;
}

/** The ink on a bubble's fill. */
function ink(variant: BubbleVariant): string {
  switch (variant) {
    case "default":
      return colors.primaryForeground;
    case "destructive":
      return colors.destructive;
    case "secondary":
    case "muted":
    case "tinted":
    case "outline":
    case "ghost":
      return colors.foreground;
  }
}

/** The fill a bubble's frame takes, before its edge (none but `outline` has one). */
function fill(variant: BubbleVariant): string {
  switch (variant) {
    case "default":
      return token("primary");
    case "secondary":
      return token("secondary");
    case "muted":
      return token("muted");
    case "tinted":
      return tints.brand;
    case "outline":
      return token("background");
    case "ghost":
      return "transparent";
    case "destructive":
      return tints.destructive;
  }
}

/**
 * A bubble's look, after shadcn/ui's: what it holds at its own width, up to 80% of the column
 * (all of it for `ghost`), on the sender's side; the frame a card's corners, 12 points of room
 * either side and 8 above and below, in the variant's fill and ink — the accent's fill and ink for
 * `default`, the raised neutral for `secondary`, the muted fill for `muted`, the accent's wash for
 * `tinted`, a hairline on the page's fill for `outline`, and the danger's wash for `destructive`.
 * A `ghost` bubble has no frame and no room of its own: the content stands on the page. Reactions
 * are a pill 6 points either side and 3 above and below in the muted fill, 4 points apart, ringed
 * 3 points in the card's color where they cross the bubble, hung three quarters of their height off
 * its `side` edge, 12 points in from its `align` end; the bubble keeps that room on that side.
 */
export function bubbleLook(): BubbleLook {
  return {
    get group(): ViewStyle {
      return {
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
        width: "100%",
      };
    },
    root: (variant: BubbleVariant, align: BubbleAlign): ViewStyle => ({
      flexDirection: "column",
      alignItems: align === "end" ? "flex-end" : "flex-start",
      // `end` is the sender's side, the column's end; unset (`start`) follows the column it is in,
      // so a bubble inside a mirrored `Message` stays on that side too.
      alignSelf: align === "end" ? "flex-end" : "auto",
      width: variant === "ghost" ? "100%" : "fit-content",
      minWidth: 0,
      maxWidth: variant === "ghost" ? "100%" : maxWidth,
    }),
    get pressable(): ViewStyle {
      return { cursor: platform.desktop ? "pointer" : undefined };
    },
    content: (variant: BubbleVariant): ViewStyle => ({
      minWidth: 0,
      maxWidth: "100%",
      ...rounded(variant === "ghost" ? 0 : radius.card),
      borderWidth: 1,
      borderColor: variant === "outline" ? colors.border : "transparent",
      backgroundColor: fill(variant),
      ...(variant === "ghost" ? {} : { paddingHorizontal: padX, paddingVertical: padY }),
    }),
    text: (variant: BubbleVariant): TextStyle => ({
      fontSize: density.body,
      lineHeight: Math.round(density.body * 1.5),
      color: ink(variant),
    }),
    reactions: (side: BubbleSide, align: BubbleAlign): ViewStyle => ({
      position: "absolute",
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: PILL_RADIUS,
      backgroundColor: token("muted"),
      boxShadow: `0 0 0 ${reactionsRing}px ${colors.card}`,
      ...(side === "bottom" ? { bottom: 0 } : { top: 0 }),
      translate: [0, side === "bottom" ? reactionsOverlap : `-${reactionsOverlap}`],
      ...(align === "end" ? { end: reactionsInset } : { start: reactionsInset }),
    }),
    reactionsRoom: (side: BubbleSide): ViewStyle =>
      side === "bottom" ? { marginBottom: reactionsHang() } : { marginTop: reactionsHang() },
    get reactionText(): TextStyle {
      return { fontSize: density.body, lineHeight: reactionsLine(), color: colors.foreground };
    },
  };
}

/** A group of bubbles from one sender. Every `nsh` view prop passes through. */
export type BubbleGroupProps = ViewProps;

/**
 * A bubble's props. Every `nsh` view prop passes through; `style` goes over the look's.
 * `align="end"` puts it on the side of what you sent, `align="start"` (the default) on the side of
 * what came in.
 */
export type BubbleProps = ViewProps & {
  /** Default `default`. See `BubbleVariant`. */
  variant?: BubbleVariant;
  /** Default `start`. */
  align?: BubbleAlign;
};

/** A bubble's content. A string is drawn as a `BubbleText`, in the look's type and the variant's
 * ink; anything else is drawn as given. */
export type BubbleContentProps = Omit<ViewProps, "children"> & {
  /** The turn: a sentence, a paragraph, a quoted reply, or a rich block of your own. */
  children?: string | JSX.Element;
};

/** A paragraph on a bubble, in the turn's type and the bubble variant's ink. */
export type BubbleTextProps = TextProps;

/** A bubble's reactions. */
export type BubbleReactionsProps = ViewProps & {
  /** Default `bottom`: the row hangs off the bubble's lower edge. `top` hangs it off the upper one. */
  side?: BubbleSide;
  /** Default `end`: the row sits 12 points in from the bubble's aligned end. */
  align?: BubbleAlign;
};

/**
 * A bubble, after shadcn/ui's: the framed surface of one turn, as wide as what it holds and at
 * most 80% of its column, on the sender's side. It holds a `BubbleContent` and, hanging off its
 * edge, a `BubbleReactions`. Avatars, names, times and actions belong to `Message`, not here.
 */
export function Bubble(props: BubbleProps) {
  const variant = () => props.variant ?? "default";
  const align = () => props.align ?? "start";
  const [, rest] = split(props, ["variant", "align", "children", "style"]);
  // How many rows of reactions hang off each edge: the bubble keeps the room while any does.
  const hung = { top: signal(0), bottom: signal(0) };
  const hang = (side: BubbleSide) => {
    hung[side].update((n) => n + 1);
    return () => hung[side].update((n) => n - 1);
  };
  return (
    <BubbleContext.Provider value={{ variant, hang }}>
      <View
        {...rest}
        style={[
          bubbleLook().root(variant(), align()),
          hung.top() > 0 ? bubbleLook().reactionsRoom("top") : null,
          hung.bottom() > 0 ? bubbleLook().reactionsRoom("bottom") : null,
          props.style ?? null,
        ]}
      >
        {props.children}
      </View>
    </BubbleContext.Provider>
  );
}

/** Bubbles from one sender, one under another, 8 points apart. */
export function BubbleGroup(props: BubbleGroupProps) {
  const [, rest] = split(props, ["children", "style"]);
  return (
    <View {...rest} style={[bubbleLook().group, props.style ?? null]}>
      {props.children}
    </View>
  );
}

/**
 * The frame of a bubble. A string child is drawn as a `BubbleText`; anything else as given. Give it
 * `onPress` to make it act (a quick reply, a command): the hand is over it. shadcn/ui's `asChild`,
 * which renders the content as a link or a button, has no equivalent here; the frame itself takes
 * the press.
 */
export function BubbleContent(props: BubbleContentProps) {
  const variant = (): BubbleVariant => BubbleContext()?.variant() ?? "default";
  const [, rest] = split(props, ["children", "style"]);
  return (
    <View
      {...rest}
      style={[
        bubbleLook().content(variant()),
        props.onPress === undefined ? null : bubbleLook().pressable,
        props.style ?? null,
      ]}
    >
      {(() => {
        // Read once, here where the bubble's words are drawn (`marker.tsx` reads in the same
        // shape): a string is a `BubbleText`, which takes the variant from the `Bubble` around
        // it, and anything else is drawn as given.
        const kids = props.children;
        return typeof kids === "string" ? <BubbleText>{kids}</BubbleText> : kids;
      })()}
    </View>
  );
}

/**
 * A paragraph on a bubble: a `Text` in the turn's type and the variant's ink. NSH has no text
 * inheritance, so content that is not a single string — a list of paragraphs, markdown rendered
 * into `Text`s — would otherwise have to know the variant itself; this reads it from the `Bubble`
 * around it. Every `nsh` text prop passes through; `style` goes over the look's.
 */
export function BubbleText(props: BubbleTextProps) {
  const variant = (): BubbleVariant => BubbleContext()?.variant() ?? "default";
  const [, rest] = split(props, ["style"]);
  return (
    <Text {...rest} style={[bubbleLook().text(variant()), props.style ?? null]}>
      {props.children}
    </Text>
  );
}

/**
 * The reactions on a bubble: emoji, a count, or a quick-reply button. They overlap the bubble's
 * edge, and the bubble keeps the room they hang out, so the next one does not cover them. Name the row for screen readers (`accessibilityLabel`, with
 * `role="image"` or `"group"`): NSH reads each glyph without context otherwise.
 */
export function BubbleReactions(props: BubbleReactionsProps) {
  const side = () => props.side ?? "bottom";
  const align = () => props.align ?? "end";
  const [, rest] = split(props, ["side", "align", "children", "style"]);
  // Tell the bubble which edge the row hangs off, again whenever `side` changes.
  const bubble = BubbleContext();
  effect(() => bubble?.hang(side()));
  return (
    <View {...rest} style={[bubbleLook().reactions(side(), align()), props.style ?? null]}>
      <AsText style={bubbleLook().reactionText}>{props.children}</AsText>
    </View>
  );
}
