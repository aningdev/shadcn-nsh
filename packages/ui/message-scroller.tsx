// A conversation that scrolls, and keeps up with it: new turns follow the newest message while the
// reader is at the end, and stay where they are when the reader has scrolled up. This library's own
// (drawn on `nsh`'s Scroll, View and Text, the button on `Button`), so there is no port region.
// Yours to change.
import { follow, motion } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp } from "lucide";
import type {
  Bounds,
  ScrollEvent,
  ScrollProps,
  ScrollRef,
  Signal,
  StyleProp,
  ViewProps,
  ViewRef,
  ViewStyle,
} from "nsh";
import { cleanup, context, Scroll, signal, split, View } from "nsh";

import { Button, buttonGlyph, type ButtonProps } from "./button";
import { Icon } from "./lib/icons";
import { PILL_RADIUS } from "./lib/surface";

/** Which way a scroller's button sends the viewport: `end`, the newest message; `start`, the
 * oldest. */
export type MessageScrollerDirection = "start" | "end";

/** Where a scroller starts: at the end (the newest message, and it follows new ones) or at the
 * start (the oldest, and it stays put). */
export type MessageScrollerInitialScroll = "start" | "end";

/** How close to an edge still counts as being there: 16 points. */
const edge = 16;

/** How far apart the messages of a conversation sit: 32 points, shadcn/ui's `gap-8`. */
const itemGap = 32;

/** How far a scroller's button sits from the edge it points past: 16 points. */
const buttonInset = 16;

/** A point of slack in the overflow test, so a height rounded under a viewport's is not an overflow. */
const slack = 1;

/** Where a message sits in the viewport after `scrollToMessage`: its top at the top (`start`), its
 * middle in the middle (`center`), or its bottom at the bottom (`end`). */
export type MessageScrollerScrollAlign = "start" | "center" | "end";

/** How a scroller moves: where a message goes, and whether the move animates. */
export interface MessageScrollerScrollOptions {
  /** Default `start`. */
  align?: MessageScrollerScrollAlign;
  /** Default `true`. */
  animated?: boolean;
}

/** What a scroller keeps: where the viewport is, how tall it and its content are, and the view
 * it sends to the ends, plus the message rows it can jump to. */
interface Scroller {
  /** The viewport is at the end of the content (and follows what comes next). */
  atEnd: () => boolean;
  /** The viewport is at the start of the content. */
  atStart: () => boolean;
  /** The content is taller than the viewport. */
  overflows: () => boolean;
  /** Reads a scroll event: where the viewport is now. */
  settle(e: ScrollEvent): void;
  /** Says the content's height, and whether it overflows. */
  measureContent(height: number): void;
  /** Says the viewport's height. */
  measureViewport(height: number): void;
  /** Keeps the scroll view's ref, for the commands that move it. */
  attachViewport(view: ScrollRef): void;
  /** Forgets the scroll view's ref if it is still the one given. */
  detachViewport(view: ScrollRef): void;
  /** Scrolls to the start of the scroll view's content. */
  scrollToStart(options?: MessageScrollerScrollOptions): void;
  /** Scrolls to the end of the scroll view's content. */
  scrollToEnd(options?: MessageScrollerScrollOptions): void;
  /** Scrolls a row into the viewport. */
  scrollToMessage(messageId: string, options?: MessageScrollerScrollOptions): void;
  /** Keeps a row's view under its `messageId`, for `scrollToMessage`. */
  registerMessage(messageId: string, view: ViewRef): void;
  /** Forgets a row's view if it is still the one under its `messageId`. */
  unregisterMessage(messageId: string, view: ViewRef): void;
}

/** What the parts of a message scroller wear between them. */
const MessageScrollerContext = context<Scroller | null>(null);

/** What an app's controls share with a scroller outside `MessageScroller`: the scroller the
 * provider hears from once a `MessageScroller` inside it has one. */
interface MessageScrollerHost {
  current: Signal<Scroller | null>;
}

const MessageScrollerHostContext = context<MessageScrollerHost | null>(null);

/** A scroller's state: one per `MessageScroller`, or one shared through `MessageScrollerProvider`. */
function createScroller(initialScroll: MessageScrollerInitialScroll | undefined): Scroller {
  const atEnd = signal(initialScroll !== "start");
  const atStart = signal(initialScroll !== "end");
  const viewportHeight = signal(0);
  const contentHeight = signal(0);
  const viewport = signal<ScrollRef | undefined>(undefined);
  const messages = new Map<string, ViewRef>();
  return {
    atEnd,
    atStart,
    overflows: () => contentHeight() > viewportHeight() + slack,
    settle: (e: ScrollEvent) => {
      const bottom = e.contentSize.height - e.offset.y - e.size.height;
      atEnd.set(bottom <= edge);
      atStart.set(e.offset.y <= edge);
    },
    measureContent: (height: number) => contentHeight.set(height),
    measureViewport: (height: number) => viewportHeight.set(height),
    attachViewport: (view: ScrollRef) => viewport.set(view),
    detachViewport: (view: ScrollRef) => {
      if (viewport() === view) viewport.set(undefined);
    },
    scrollToStart: ({ animated = true }: MessageScrollerScrollOptions = {}) =>
      viewport()?.scrollTo({ y: 0, animated }),
    scrollToEnd: ({ animated = true }: MessageScrollerScrollOptions = {}) =>
      viewport()?.scrollToEnd({ animated }),
    scrollToMessage: (
      messageId: string,
      { align = "start", animated = true }: MessageScrollerScrollOptions = {},
    ) => messages.get(messageId)?.reveal({ vertical: align, animated }),
    registerMessage: (messageId: string, view: ViewRef) => {
      messages.set(messageId, view);
    },
    unregisterMessage: (messageId: string, view: ViewRef) => {
      if (messages.get(messageId) === view) messages.delete(messageId);
    },
  };
}

/** The commands and edge state of a message scroller (`useMessageScroller()`). */
export interface MessageScrollerApi {
  /** Scrolls the row with `messageId` into the viewport; a row that is not there does nothing. */
  scrollToMessage(messageId: string, options?: MessageScrollerScrollOptions): void;
  /** Scrolls to the oldest content. */
  scrollToStart(options?: MessageScrollerScrollOptions): void;
  /** Scrolls to the newest content (and, once there, follows what comes next). */
  scrollToEnd(options?: MessageScrollerScrollOptions): void;
  /** The viewport is at the start (live when read in a binding). */
  readonly atStart: boolean;
  /** The viewport is at the end (live when read in a binding). */
  readonly atEnd: boolean;
}

/**
 * A scroller's commands and edge state, for a control beside the transcript: under
 * `MessageScrollerProvider` it reaches the `MessageScroller` inside the provider; used inside a
 * `MessageScroller` it reaches that one.
 */
export function useMessageScroller(): MessageScrollerApi {
  const local = MessageScrollerContext();
  const host = MessageScrollerHostContext();
  if (!local && !host) {
    throw new Error(
      "useMessageScroller must be used within a <MessageScroller> or a <MessageScrollerProvider>",
    );
  }
  const scroller = () => local ?? host?.current() ?? null;
  return {
    scrollToMessage(messageId, options) {
      scroller()?.scrollToMessage(messageId, options);
    },
    scrollToStart(options) {
      scroller()?.scrollToStart(options);
    },
    scrollToEnd(options) {
      scroller()?.scrollToEnd(options);
    },
    get atStart() {
      return scroller()?.atStart() ?? true;
    },
    get atEnd() {
      return scroller()?.atEnd() ?? true;
    },
  };
}

/** A message scroller's parts as the styles they wear: spread each one onto the part that matches
 * its name. */
export interface MessageScrollerLook {
  /** The frame (`MessageScroller`): a column that fills its parent and clips what is in it. */
  readonly root: ViewStyle;
  /** The viewport (`MessageScrollerViewport`): the room left by the frame, a scroll view's own. */
  readonly viewport: ViewStyle;
  /** The content (`MessageScrollerContent`): a column 32 points apart, at least as tall as the
   * viewport. */
  readonly content: ViewStyle;
  /** A turn (`MessageScrollerItem`): never narrower nor shorter than what is in it. */
  readonly item: ViewStyle;
  /** The room a button floats in (`MessageScrollerButton`): the width of the viewport, 16 points
   * from the edge it points past, its child in the middle. It takes no presses of its own. */
  slot(direction: MessageScrollerDirection): ViewStyle;
  /** The button itself: raised, hidden until there is somewhere to go. */
  readonly button: ViewStyle;
}

/**
 * A conversation's look, after shadcn/ui's message scroller: a frame that fills its parent and
 * clips, a viewport that takes the room left, a content column 32 points apart at least as tall as
 * the viewport, and a raised button floating 16 points above the newest message (or below the
 * oldest), in the middle of the viewport.
 */
export function messageScrollerLook(): MessageScrollerLook {
  return {
    get root(): ViewStyle {
      return {
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
        width: "100%",
        position: "relative",
        overflow: "hidden",
      };
    },
    get viewport(): ViewStyle {
      return { flexGrow: 1, flexShrink: 1, minHeight: 0, width: "100%" };
    },
    get content(): ViewStyle {
      return { flexDirection: "column", gap: itemGap, minHeight: "100%" };
    },
    get item(): ViewStyle {
      return { minWidth: 0, flexShrink: 0 };
    },
    slot: (direction: MessageScrollerDirection): ViewStyle => ({
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
      pointerEvents: "box-none",
      zIndex: 10,
      ...(direction === "end" ? { bottom: buttonInset } : { top: buttonInset }),
    }),
    get button(): ViewStyle {
      return { borderRadius: PILL_RADIUS };
    },
  };
}

/** A message scroller's props. Every `nsh` view prop passes through. */
export type MessageScrollerProps = ViewProps & {
  /** Default `end`: the viewport opens at the newest message and follows new ones. `start` opens
   * at the oldest and stays there until a button sends it. */
  initialScroll?: MessageScrollerInitialScroll;
};

/** The provider's props: what it wraps. */
export interface MessageScrollerProviderProps {
  /** A `MessageScroller` and the controls that share its commands. */
  children?: ViewProps["children"];
}

/**
 * Shares a `MessageScroller` inside it with controls outside it, such as a list of message
 * titles: `useMessageScroller()` under the provider calls the same `scrollToMessage`,
 * `scrollToStart` and `scrollToEnd` as the scroller's own parts. One provider around one
 * `MessageScroller`; without a provider the scroller works on its own, as before.
 */
export function MessageScrollerProvider(props: MessageScrollerProviderProps) {
  const host: MessageScrollerHost = { current: signal<Scroller | null>(null) };
  return (
    <MessageScrollerHostContext.Provider value={host}>
      {props.children}
    </MessageScrollerHostContext.Provider>
  );
}

/** The viewport's props: a scroll view's, less the direction and the state it keeps itself. */
export type MessageScrollerViewportProps = Omit<
  ScrollProps,
  "horizontal" | "onScroll" | "children"
> & {
  /** What is in the viewport: a `MessageScrollerContent`. */
  children?: ViewProps["children"];
  /** Called on every scroll, after the scroller has read it. */
  onScroll?: (e: ScrollEvent) => void;
  /** Called on every layout, after the scroller has read it. */
  onLayout?: (e: { bounds: Bounds }) => void;
  /** The style of the scroll view. */
  style?: StyleProp<ViewStyle>;
  /** The scroll view's ref (`ScrollRef`), composed with the one the scroller keeps. */
  ref?: ScrollProps["ref"];
};

/** The content's props: a view's. */
export type MessageScrollerContentProps = ViewProps;

/** A turn's props: a view's. */
export type MessageScrollerItemProps = ViewProps & {
  /** The row's id, for `scrollToMessage` from a control beside the transcript. */
  messageId?: string;
};

/** The button's props: a button's, with the direction it points and what it says. */
export type MessageScrollerButtonProps = Omit<ButtonProps, "children"> & {
  /** Default `end`: above the newest message, pointing down. `start` goes to the oldest. */
  direction?: MessageScrollerDirection;
  /** Default: an arrow, and the button's name for screen readers ("Scroll to end"). */
  children?: ButtonProps["children"];
};

/**
 * A conversation that scrolls, after shadcn/ui's message scroller: a frame whose viewport holds the
 * turns, and that keeps itself at the newest one while the reader is there — and where the reader
 * left it when they are not. `initialScroll` says where it opens; `MessageScrollerButton` takes the
 * reader back to either end.
 */
export function MessageScroller(props: MessageScrollerProps) {
  const host = MessageScrollerHostContext();
  const scroller = createScroller(props.initialScroll);
  if (host) {
    host.current.set(scroller);
    cleanup(() => {
      if (host.current() === scroller) host.current.set(null);
    });
  }
  const [, rest] = split(props, ["initialScroll", "children", "style"]);
  return (
    <MessageScrollerContext.Provider value={scroller}>
      <View {...rest} style={[messageScrollerLook().root, props.style ?? null]}>
        {props.children}
      </View>
    </MessageScrollerContext.Provider>
  );
}

/**
 * The room the turns scroll in. It keeps the scroller's word on where it is: at the end, at the
 * start, or in between — what lets a new message follow the reader without stealing their place.
 */
export function MessageScrollerViewport(props: MessageScrollerViewportProps) {
  const scroller = MessageScrollerContext();
  const node = signal<ScrollRef | undefined>(undefined);
  cleanup(() => {
    const view = node();
    if (view) scroller?.detachViewport(view);
  });
  const [, rest] = split(props, [
    "onScroll",
    "onLayout",
    "children",
    "style",
    "contentStyle",
    "ref",
  ]);
  return (
    <Scroll
      {...rest}
      ref={(view) => {
        node.set(view);
        scroller?.attachViewport(view);
        if (typeof props.ref === "function") props.ref(view);
      }}
      role="group"
      onScroll={(e: ScrollEvent) => {
        scroller?.settle(e);
        props.onScroll?.(e);
      }}
      onLayout={(e) => {
        scroller?.measureViewport(e.bounds.size.height);
        props.onLayout?.(e);
      }}
      style={[messageScrollerLook().viewport, props.style ?? null]}
      contentStyle={props.contentStyle}
    >
      {props.children}
    </Scroll>
  );
}

/**
 * What the turns are in: a column 32 points apart, at least as tall as the viewport. When it grows
 * while the reader is at the end, it follows the growth; when the reader has scrolled up, it leaves
 * them where they are.
 */
export function MessageScrollerContent(props: MessageScrollerContentProps) {
  const scroller = MessageScrollerContext();
  const [, rest] = split(props, ["children", "style", "onLayout"]);
  return (
    <View
      {...rest}
      onLayout={(e) => {
        scroller?.measureContent(e.bounds.size.height);
        props.onLayout?.(e);
        if (scroller?.atEnd()) scroller.scrollToEnd({ animated: false });
      }}
      style={[messageScrollerLook().content, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/**
 * One turn of the conversation. shadcn/ui anchors one item so that the reader's place holds while
 * older turns load above; NSH has no scroll anchoring, so this is a plain view and the place is
 * the app's to keep.
 */
export function MessageScrollerItem(props: MessageScrollerItemProps) {
  const scroller = MessageScrollerContext();
  const node = signal<ViewRef | undefined>(undefined);
  cleanup(() => {
    const view = node();
    if (props.messageId && view) scroller?.unregisterMessage(props.messageId, view);
  });
  const [, rest] = split(props, ["children", "style", "messageId", "ref"]);
  return (
    <View
      {...rest}
      ref={(view) => {
        node.set(view);
        if (props.messageId) scroller?.registerMessage(props.messageId, view);
        if (typeof props.ref === "function") props.ref(view);
      }}
      style={[messageScrollerLook().item, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/**
 * A button that takes the reader back to an end of the conversation, floating 16 points above the
 * newest turn (or below the oldest). It shows only while there is somewhere to go that way, and
 * says "Scroll to end" or "Scroll to start" to screen readers.
 */
export function MessageScrollerButton(props: MessageScrollerButtonProps) {
  const scroller = MessageScrollerContext();
  const direction = (): MessageScrollerDirection => props.direction ?? "end";
  const away = () =>
    direction() === "end" ? !(scroller?.atEnd() ?? true) : !(scroller?.atStart() ?? true);
  const shown = () => (scroller?.overflows() ?? false) && away();
  const slide = follow(() => (shown() ? 1 : 0), motion.move);
  const [, rest] = split(props, ["direction", "children", "style", "onPress"]);
  const label =
    props.accessibilityLabel ?? (direction() === "end" ? "Scroll to end" : "Scroll to start");
  return (
    <View
      accessibilityElementsHidden={!shown()}
      importantForAccessibility={shown() ? "auto" : "no-hide-descendants"}
      style={messageScrollerLook().slot(direction())}
    >
      <Button
        {...rest}
        variant="secondary"
        size="sm"
        accessibilityLabel={label}
        onPress={() => {
          if (direction() === "end") scroller?.scrollToEnd({ animated: true });
          else scroller?.scrollToStart({ animated: true });
          props.onPress?.();
        }}
        style={[
          messageScrollerLook().button,
          { opacity: slide, pointerEvents: shown() ? "auto" : "none" },
          props.style ?? null,
        ]}
      >
        {props.children ?? (
          <Icon
            icon={direction() === "end" ? ArrowDown : ArrowUp}
            {...buttonGlyph("secondary", { size: "sm" })}
          />
        )}
      </Button>
    </View>
  );
}
