---
title: Message scroller
description: "A conversation that keeps up with itself: new turns follow the newest message while you are at the end, and wait when you are not."
component: true
demo: message-scroller
---

## Installation

```npm
npx shadcn-nsh@latest add message-scroller
```

## Usage

```tsx
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Icon } from "@/lib/icons";
```

The examples draw icons with `Icon` from `lib/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<MessageScroller style={{ height: 320 }}>
  <MessageScrollerViewport>
    <MessageScrollerContent>
      {turns().map((turn) => (
        <MessageScrollerItem messageId={String(turn.id)}>
          <Message align={turn.mine ? "end" : "start"}>
            <MessageAvatar name={turn.from} />
            <MessageContent>
              <Bubble variant={turn.mine ? "default" : "muted"}>
                <BubbleContent>{turn.text}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </MessageScrollerItem>
      ))}
    </MessageScrollerContent>
  </MessageScrollerViewport>
  <MessageScrollerButton />
</MessageScroller>
```

## Examples

### Following

The scroller opens at the end, on the newest turn, and keeps itself there: when the content grows
— a turn is sent, a stream answers — it scrolls to the new end. Scroll up and it stops following;
the view stays where the reader put it while new turns arrive below. Scroll back to the end and it
follows again.

Give the frame a height (`style={{ height: 320 }}`): it fills what it is in, and its viewport takes
the room left.

### Opening elsewhere

`initialScroll="start"` opens at the oldest turn and does not follow, for a thread read from the
top. Anything else (the default, `end`) opens on the newest.

```tsx
<MessageScroller initialScroll="start" style={{ height: 220 }}>
  <MessageScrollerViewport>
    <MessageScrollerContent>{turns().map(turn)}</MessageScrollerContent>
  </MessageScrollerViewport>
  <MessageScrollerButton direction="end" />
</MessageScroller>
```

### Buttons

`MessageScrollerButton` floats 16 points above the newest turn (or below the oldest) in the middle
of the viewport, and shows only while there is somewhere to go that way. It says "Scroll to end" or
"Scroll to start" to screen readers; give it `accessibilityLabel` to say something else.

```tsx
<MessageScrollerButton />

<MessageScrollerButton direction="start">
  <Icon icon={ArrowUp} {...buttonGlyph("secondary", { size: "sm" })} />
</MessageScrollerButton>
```

### Commands

`MessageScrollerProvider` shares the scroller with controls outside the frame, such as a list of
message titles: under it, `useMessageScroller()` returns `scrollToMessage`, `scrollToStart` and
`scrollToEnd`, plus `atStart` and `atEnd` (read those in a binding, like any signal). The row
targeted by `scrollToMessage` names its `messageId`; without a matching row the call does nothing.
`MessageScroller` works without the provider, with the hook reading the scroller it is inside.

```tsx
import type { ScrollRef } from "nsh";
import { View } from "nsh";

import { Button } from "@/components/ui/button";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";

let scroller: ScrollRef | undefined;

<MessageScrollerProvider>
  <View style={{ gap: 8 }}>
    <MessageScroller style={{ height: 320 }}>
      <MessageScrollerViewport ref={scroller}>
        <MessageScrollerContent>
          {turns().map((turn) => (
            <MessageScrollerItem messageId={String(turn.id)}>{turn.content}</MessageScrollerItem>
          ))}
        </MessageScrollerContent>
      </MessageScrollerViewport>
    </MessageScroller>
    <CommandBar />
  </View>
</MessageScrollerProvider>;

function CommandBar() {
  const { scrollToMessage, scrollToStart, scrollToEnd } = useMessageScroller();
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Button variant="secondary" onPress={() => scrollToStart()}>
        Oldest
      </Button>
      <Button
        variant="secondary"
        onPress={() => scrollToMessage("3", { align: "center", animated: true })}
      >
        Turn 3
      </Button>
      <Button variant="secondary" onPress={() => scrollToEnd()}>
        Newest
      </Button>
    </View>
  );
}
```

`MessageScrollerViewport` forwards its `ref` (a `ScrollRef`) beside the scroller's own, so the app
can reach the scroll view directly — `scroller?.scrollTo({ y: 0 })`, for example.

### Turns

`MessageScrollerContent` is the column the turns are in, 32 points apart and at least as tall as
the viewport; `MessageScrollerItem` wraps one turn. What a turn is, is `Message`'s business.

## Differences from shadcn/ui

shadcn/ui's message scroller is a wrapper over `@shadcn/react/message-scroller`, a React library of
state and hooks. This one is the frame and the behaviour on `nsh`'s `Scroll`, and differs in five
places:

- **A smaller provider.** `MessageScrollerProvider` only shares one scroller with controls outside
  it. shadcn/ui's provider also owns opening position, anchoring and visibility, with
  `autoScroll`, `defaultScrollPosition`, `scrollPreviousItemPeek`, `scrollMargin` and
  `scrollEdgeThreshold`; there are no counterparts, and `useMessageScrollerScrollable` and
  `useMessageScrollerVisibility` have none either (the hook's `atStart` / `atEnd` are the edge
  state).
- **No scroll anchoring.** An item's `scrollAnchor` holds the reader's place while older turns load
  above it; NSH has no anchoring. Read the position with `ViewRef.measure()` before the load and
  scroll back with `Scroll`'s ref after it.
- **No `content-visibility`.** shadcn/ui lets the browser skip the layout of turns off screen
  (`content-visibility: auto`, `contain-intrinsic-size`); NSH lays out what it draws.
- **The button animates its opacity only.** shadcn/ui slides and scales it away as well; NSH's
  springs animate the opacity (`follow`).
- **No scrollbar gutter or faded edge.** shadcn/ui reserves the scrollbar's room and fades the
  content at the top edge (`scroll-fade-b`); the platform's scrollbar is the one you get.

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `MessageScroller`,
`MessageScrollerContent` and `MessageScrollerItem`; `MessageScrollerViewport` takes a
[`Scroll`](https://nsh.dev/elements/scroll)'s (`scrollbar`, `contentInset`, `onScroll`, …) less the
direction it keeps (a conversation scrolls up and down), and `MessageScrollerButton` takes this
library's [`Button`](https://nsh.dev/elements/button) props.

| Part                      | Props           | Description                                                                 |
| ------------------------- | --------------- | --------------------------------------------------------------------------- |
| `MessageScroller`         | `initialScroll` | Renders `View` (`messageScrollerLook().root`)                               |
| `MessageScrollerViewport` | `ref`           | Renders `Scroll` (`messageScrollerLook().viewport`); `ref` is a `ScrollRef` |
| `MessageScrollerContent`  |                 | Renders `View` (`messageScrollerLook().content`)                            |
| `MessageScrollerItem`     | `messageId`     | Renders `View` (`messageScrollerLook().item`)                               |
| `MessageScrollerButton`   | `direction`     | Renders `Button` (`messageScrollerLook().slot(direction)`)                  |

| Prop            | On                      | Type               | Default |
| --------------- | ----------------------- | ------------------ | ------- |
| `initialScroll` | `MessageScroller`       | `"start" \| "end"` | `end`   |
| `messageId`     | `MessageScrollerItem`   | `string`           |         |
| `direction`     | `MessageScrollerButton` | `"start" \| "end"` | `end`   |

| Export                    | Props / returns                                          | Description                                                       |
| ------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `MessageScrollerProvider` | `children`                                               | Shares the `MessageScroller` inside it; one provider per scroller |
| `useMessageScroller()`    | `scrollToMessage`, `scrollToStart`, `scrollToEnd`, edges | The commands and edge state (`atStart`, `atEnd`) of that scroller |

| Command option | Type                           | Default |
| -------------- | ------------------------------ | ------- |
| `align`        | `"start" \| "center" \| "end"` | `start` |
| `animated`     | `boolean`                      | `true`  |

The frame fills its parent, clips what is in it, and holds its viewport and its buttons; the
content column is 32 points apart; a button floats 16 points from its edge. `messageScrollerLook()`
is exported for a frame an app draws itself.
