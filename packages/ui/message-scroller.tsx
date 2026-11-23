// A conversation that scrolls, and keeps up with it: new turns follow the newest message while the
// reader is at the end, and stay where they are when the reader has scrolled up. The viewport is
// `nsh`'s virtualized `List`, so only the turns near the screen exist however long the conversation
// grows; the frame, the row and the button are drawn on `View`, the button on `Button`. This
// library's own, so there is no port region. Yours to change.
import { follow, motion } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp } from "lucide";
import type {
  JSX,
  ListContentStyle,
  ListProps,
  ListRef,
  ScrollEvent,
  Signal,
  StyleProp,
  ViewProps,
  ViewStyle,
} from "nsh";
import { cleanup, context, List, signal, split, View } from "nsh";

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

/** A row's key the way the list names it: its `key`, its `id`, or its index. */
function defaultKey(item: unknown, index: number): string {
  if (typeof item === "object" && item !== null) {
    const key = "key" in item ? item.key : "id" in item ? item.id : undefined;
    if (typeof key === "string" || typeof key === "number") return String(key);
  }
  return String(index);
}

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

/** What a scroller keeps: where the viewport is, the list it sends to the ends, and the rows it can
 * jump to by their key. */
interface Scroller {
  /** The viewport is at the end of the content (and follows what comes next). */
  atEnd: () => boolean;
  /** The viewport is at the start of the content. */
  atStart: () => boolean;
  /** Where the scroller opens. */
  initialScroll: () => MessageScrollerInitialScroll;
  /** Reads a scroll event: where the viewport is now. */
  settle(e: ScrollEvent): void;
  /** Reads which rows the list has on screen: one where every row is visible holds no scroll, so it
   * lies at both edges, and its buttons stay away. A list at rest reports no scroll at all, so this
   * is the only word on a conversation that fits before the reader moves it. */
  seeViewable(visible: number, total: number): void;
  /** Keeps the list's ref, for the commands that move it. */
  attachViewport(view: ListRef): void;
  /** Forgets the list's ref if it is still the one given. */
  detachViewport(view: ListRef): void;
  /** Tells the scroller where a row is, by the key `scrollToMessage` names (`-1` when it is not
   * in the list). The viewport sets it from its items, so the rows that are mounted do not
   * matter. */
  setIndexer(indexOf: (messageId: string) => number): void;
  /** Scrolls to the start of the list's content. */
  scrollToStart: (options?: MessageScrollerScrollOptions) => void;
  /** Scrolls to the end of the list's content. */
  scrollToEnd: (options?: MessageScrollerScrollOptions) => void;
  /** Scrolls a row into the viewport. */
  scrollToMessage: (messageId: string, options?: MessageScrollerScrollOptions) => void;
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
  const initial = initialScroll ?? "end";
  // Before the list has said anything, nothing is known to scroll: both edges, and no button.
  const fits = signal(true);
  const atEndEdge = signal(initial !== "start");
  const atStartEdge = signal(initial !== "end");
  const viewport = signal<ListRef | undefined>(undefined);
  let indexOf = (_messageId: string) => -1;
  return {
    atEnd: () => fits() || atEndEdge(),
    atStart: () => fits() || atStartEdge(),
    initialScroll: () => initial,
    settle: (e: ScrollEvent) => {
      const bottom = e.contentSize.height - e.offset.y - e.size.height;
      atEndEdge.set(bottom <= edge);
      atStartEdge.set(e.offset.y <= edge);
    },
    seeViewable: (visible: number, total: number) => fits.set(visible >= total),
    attachViewport: (view: ListRef) => viewport.set(view),
    detachViewport: (view: ListRef) => {
      if (viewport() === view) viewport.set(undefined);
    },
    setIndexer: (next: (messageId: string) => number) => {
      indexOf = next;
    },
    scrollToStart: ({ animated = true }: MessageScrollerScrollOptions = {}) =>
      viewport()?.scrollToOffset({ offset: 0, animated }),
    scrollToEnd: ({ animated = true }: MessageScrollerScrollOptions = {}) =>
      viewport()?.scrollToEnd({ animated }),
    scrollToMessage: (
      messageId: string,
      { align = "start", animated = true }: MessageScrollerScrollOptions = {},
    ) => {
      const index = indexOf(messageId);
      if (index < 0) return;
      const viewPosition = align === "start" ? 0 : align === "center" ? 0.5 : 1;
      viewport()?.scrollToIndex({ index, viewPosition, animated });
    },
  };
}

/** The commands and edge state of a message scroller (`useMessageScroller()`). */
export interface MessageScrollerApi {
  /** Scrolls the row with `messageId` into the viewport; a row that is not there does nothing. */
  scrollToMessage: (messageId: string, options?: MessageScrollerScrollOptions) => void;
  /** Scrolls to the oldest content. */
  scrollToStart: (options?: MessageScrollerScrollOptions) => void;
  /** Scrolls to the newest content (and, once there, follows what comes next). */
  scrollToEnd: (options?: MessageScrollerScrollOptions) => void;
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
  /** The viewport (`MessageScrollerViewport`): the room left by the frame, the list's own. */
  readonly viewport: ViewStyle;
  /** The content (`MessageScrollerViewport`): rows 32 points apart. */
  readonly content: ListContentStyle;
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
 * clips, a viewport that takes the room left, rows 32 points apart, and a raised button floating
 * 16 points above the newest message (or below the oldest), in the middle of the viewport.
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
    get content(): ListContentStyle {
      return { gap: itemGap };
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

/**
 * The viewport's props: a list's, less the direction and the state the scroller keeps itself.
 * `each` and `children` are the turns and the row that renders one; `keyExtractor` names each
 * turn, so a row keeps its cell as others come and go and `scrollToMessage` can find it.
 */
export type MessageScrollerViewportProps<T> = Omit<
  ListProps<T>,
  | "each"
  | "children"
  | "ref"
  | "inverted"
  | "horizontal"
  | "numColumns"
  | "viewport"
  | "stickyHeaderIndices"
  | "initialScrollIndex"
  | "initialScrollAtEnd"
  | "maintainVisibleContentPosition"
  | "onScroll"
  | "style"
> & {
  /** The turns, in reading order (the oldest first). */
  each: readonly T[];
  /** Renders one row. Called once per recycled cell; `item` and `index` change when the cell is
   * reused for another turn. */
  children: (item: () => T, index: () => number) => JSX.Element;
  /** Called on every scroll, after the scroller has read it. */
  onScroll?: (e: ScrollEvent) => void;
  /** The style of the list. */
  style?: StyleProp<ViewStyle>;
  /** The list's ref: called with the `ListRef` once the list exists. */
  ref?: (node: ListRef) => void;
};

/** A turn's props: a view's. */
export type MessageScrollerItemProps = ViewProps;

/** The button's props: a button's, with the direction it points and what it says. */
export type MessageScrollerButtonProps = Omit<ButtonProps, "children"> & {
  /** Default `end`: above the newest message, pointing down. `start` goes to the oldest. */
  direction?: MessageScrollerDirection;
  /** Default: an arrow, and the button's name for screen readers ("Scroll to end"). */
  children?: ButtonProps["children"];
  /**
   * A mark at the button's top-end corner, over the arrow (an arrival dot while a reply is still
   * coming in). The arrow stays; the mark takes no presses.
   */
  indicator?: JSX.Element;
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
 * The room the turns scroll in: a virtualized list that opens where the scroller says and follows
 * its end while the reader is there — what lets a new message arrive without stealing a reader's
 * place once they have scrolled up. Only the rows near the screen exist, so a conversation of a
 * thousand turns costs what one of twenty does.
 */
export function MessageScrollerViewport<T>(props: MessageScrollerViewportProps<T>) {
  const scroller = MessageScrollerContext();
  const node = signal<ListRef | undefined>(undefined);
  cleanup(() => {
    const view = node();
    if (view) scroller?.detachViewport(view);
  });
  const keyOf = (item: T, index: number) =>
    props.keyExtractor?.(item, index) ?? defaultKey(item, index);
  scroller?.setIndexer((messageId) => {
    const items = props.each;
    for (let i = 0; i < items.length; i++) {
      if (keyOf(items[i]!, i) === messageId) return i;
    }
    return -1;
  });
  const [, rest] = split(props, [
    "onScroll",
    "onViewableItemsChange",
    "children",
    "style",
    "contentStyle",
    "ref",
  ]);
  return (
    <List
      {...rest}
      each={props.each}
      keyExtractor={props.keyExtractor}
      ref={(view) => {
        node.set(view);
        scroller?.attachViewport(view);
        if (typeof props.ref === "function") props.ref(view);
      }}
      role="group"
      initialScrollAtEnd={scroller?.initialScroll() !== "start"}
      maintainVisibleContentPosition={{ autoscrollToBottomThreshold: edge }}
      onScroll={(e: ScrollEvent) => {
        scroller?.settle(e);
        props.onScroll?.(e);
      }}
      onViewableItemsChange={(info) => {
        scroller?.seeViewable(info.viewableItems.length, props.each.length);
        props.onViewableItemsChange?.(info);
      }}
      style={[messageScrollerLook().viewport, props.style ?? null]}
      contentStyle={{ ...messageScrollerLook().content, ...props.contentStyle }}
    >
      {props.children}
    </List>
  );
}

/**
 * One turn of the conversation: the box a row's content sits in, sized by what is in it. Its key
 * (`keyExtractor`) is what `scrollToMessage` names, so an id on the data is enough — no id on the
 * row.
 */
export function MessageScrollerItem(props: MessageScrollerItemProps) {
  const [, rest] = split(props, ["children", "style"]);
  return (
    <View {...rest} style={[messageScrollerLook().item, props.style ?? null]}>
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
  const slide = follow(() => (away() ? 1 : 0), motion.default);
  const [, rest] = split(props, [
    "direction",
    "children",
    "style",
    "onPress",
    "indicator",
    "variant",
    "size",
    "accessibilityLabel",
  ]);
  const variant = () => props.variant ?? "secondary";
  const size = () => props.size ?? "sm";
  const label =
    props.accessibilityLabel ?? (direction() === "end" ? "Scroll to end" : "Scroll to start");
  return (
    <View
      accessibilityElementsHidden={!away()}
      importantForAccessibility={away() ? "auto" : "no-hide-descendants"}
      style={messageScrollerLook().slot(direction())}
    >
      <View style={{ pointerEvents: "box-none", opacity: slide }}>
        <Button
          {...rest}
          variant={variant()}
          size={size()}
          accessibilityLabel={label}
          onPress={() => {
            if (direction() === "end") scroller?.scrollToEnd({ animated: true });
            else scroller?.scrollToStart({ animated: true });
            props.onPress?.();
          }}
          style={[
            messageScrollerLook().button,
            { pointerEvents: away() ? "auto" : "none" },
            props.style ?? null,
          ]}
        >
          {props.children ?? (
            <Icon
              icon={direction() === "end" ? ArrowDown : ArrowUp}
              {...buttonGlyph(variant, { size })}
            />
          )}
        </Button>
        <View style={{ position: "absolute", top: 0, end: 0, pointerEvents: "none" }}>
          {props.indicator}
        </View>
      </View>
    </View>
  );
}
