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
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Icon } from "@/lib/icons";
```

The examples draw icons with `Icon` from `lib/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<MessageScroller style={{ height: 320 }}>
  <MessageScrollerViewport each={turns()} keyExtractor={(turn) => String(turn.id)}>
    {(item) => (
      <MessageScrollerItem>
        <Message align={item().mine ? "end" : "start"}>
          <MessageAvatar name={item().from} />
          <MessageContent>
            <Bubble variant={item().mine ? "default" : "muted"}>
              <BubbleContent>{item().text}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </MessageScrollerItem>
    )}
  </MessageScrollerViewport>
  <MessageScrollerButton />
</MessageScroller>
```

The viewport is `nsh`'s [`List`](https://nsh.dev/elements/list): `each` is the conversation in reading
order, oldest first, and the child renders one row. It is called once per cell, not once per turn —
read `item()` where the turn is used (`item().text`), because the cell is reused for another turn as
the reader scrolls.

## Examples

### Following

The scroller opens at the end, on the newest turn, and keeps itself there: when the content grows
— a turn is sent, a stream answers — the list keeps the end in view. Scroll up and it stops
following; the view stays where the reader put it while new turns arrive below. Scroll back to the
end and it follows again.

Give the frame a height (`style={{ height: 320 }}`): it fills what it is in, and its viewport takes
the room left. Four hundred turns cost what four do: the list mounts only the rows near the screen.

### Opening elsewhere

`initialScroll="start"` opens at the oldest turn and does not follow, for a thread read from the
top. Anything else (the default, `end`) opens on the newest.

```tsx
<MessageScroller initialScroll="start" style={{ height: 220 }}>
  <MessageScrollerViewport each={turns()} keyExtractor={(turn) => String(turn.id)}>
    {(item) => <MessageScrollerItem>{item().content}</MessageScrollerItem>}
  </MessageScrollerViewport>
  <MessageScrollerButton direction="end" />
</MessageScroller>
```

### Keys

`keyExtractor` names a turn's row. The default reads the turn's `key`, then its `id`, then its
index; give it one when the data has nothing to name a turn by. A key does two things: it keeps a
row's cell and its size as rows come and go, and it is the name `scrollToMessage` takes — a turn
with the same id on screen and in the command find each other. Keys must be unique and stable: with
an index, every append that shifts a row makes the list rebuild it.

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

### A short thread, and an arrival

`alignment="bottom"` on the viewport passes through to the list, so a conversation shorter than the frame sits at the bottom. `indicator` is a mark at the button's top-end corner; `variant` and `size` are the button's (default `secondary` and `sm`).

```tsx
<MessageScrollerViewport each={turns()} alignment="bottom" keyExtractor={(turn) => turn.id}>
  {(item) => <MessageScrollerItem>{item().content}</MessageScrollerItem>}
</MessageScrollerViewport>
<MessageScrollerButton
  indicator={
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.brand,
        borderWidth: 2,
        borderColor: colors.background,
      }}
    />
  }
/>
```

### Commands

`MessageScrollerProvider` shares the scroller with controls outside the frame, such as a list of
message titles: under it, `useMessageScroller()` returns `scrollToMessage`, `scrollToStart` and
`scrollToEnd`, plus `atStart` and `atEnd` (read those in a binding, like any signal). The turn
targeted by `scrollToMessage` is the one whose key is that name; without a matching row the call
does nothing. `MessageScroller` works without the provider, with the hook reading the scroller it is
inside.

```tsx
import type { ListRef } from "nsh";
import { View } from "nsh";

import { Button } from "@/components/ui/button";
import {
  MessageScroller,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";

let scroller: ListRef | undefined;

<MessageScrollerProvider>
  <View style={{ gap: 8 }}>
    <MessageScroller style={{ height: 320 }}>
      <MessageScrollerViewport
        ref={(node) => (scroller = node)}
        each={turns()}
        keyExtractor={(turn) => String(turn.id)}
      >
        {(item) => <MessageScrollerItem>{item().content}</MessageScrollerItem>}
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

`MessageScrollerViewport` calls its `ref` with the [`ListRef`](https://nsh.dev/elements/list) beside
the one the scroller keeps, so the app can reach the list directly — `scroller?.scrollToIndex({ index: 0 })`,
for example.

### Turns

`MessageScrollerItem` is the box one turn sits in, sized by what is in it; `MessageScrollerViewport`
is the list the turns are in, 32 points apart. What a turn is, is `Message`'s business.

## Differences from shadcn/ui

shadcn/ui's message scroller is a wrapper over `@shadcn/react/message-scroller`, a React library of
state and hooks. This one draws the frame and keeps the behaviour on `nsh`'s `List`, and differs
in five places:

- **A smaller provider.** `MessageScrollerProvider` only shares one scroller with controls outside
  it. shadcn/ui's provider also owns opening position, anchoring and visibility, with
  `autoScroll`, `defaultScrollPosition`, `scrollPreviousItemPeek`, `scrollMargin` and
  `scrollEdgeThreshold`; there are no counterparts, and `useMessageScrollerScrollable` and
  `useMessageScrollerVisibility` have none either (the hook's `atStart` / `atEnd` are the edge
  state).
- **Anchoring is the list's.** shadcn/ui anchors per item (`scrollAnchor`) so a row holds its place
  while older turns load above it. Here the list keeps the visible rows still as content changes
  above and below them, and `onLoadMoreAtStart` loads older turns; there is no per-row anchor.
- **Virtualized, not `content-visibility`.** shadcn/ui lets the browser skip the layout of turns off
  screen (`content-visibility: auto`, `contain-intrinsic-size`); here the viewport is a `List`,
  which mounts only the rows near the screen and recycles their cells.
- **The button animates its opacity only.** shadcn/ui slides and scales it away as well; NSH's
  springs animate the opacity (`follow`).
- **No scrollbar gutter or faded edge.** shadcn/ui reserves the scrollbar's room and fades the
  content at the top edge (`scroll-fade-b`); the platform's scrollbar is the one you get.

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `MessageScroller` and
`MessageScrollerItem`; `MessageScrollerViewport` takes a [`List`](https://nsh.dev/elements/list)'s
(`keyExtractor`, `estimatedItemSize`, `onViewableItemsChange`, `scrollbar`, …) less the state the
scroller keeps (`inverted`, `initialScrollIndex`, `initialScrollAtEnd`,
`maintainVisibleContentPosition`, …), plus `each`, `alignment` (passed to the list) and the child
that renders a row; and `MessageScrollerButton` takes this library's
[`Button`](https://nsh.dev/elements/button) props (`variant` defaults to `secondary`, `size` to
`sm`). `alignment="bottom"` pins a short conversation to the bottom of the viewport. `indicator`
is a mark at the button's top-end corner (an arrival dot); the arrow stays.

| Part                      | Props                                                  | Description                                                             |
| ------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `MessageScroller`         | `initialScroll`                                        | Renders `View` (`messageScrollerLook().root`)                           |
| `MessageScrollerViewport` | `each`, `children`, `keyExtractor`, `alignment`, `ref` | Renders `List` (`messageScrollerLook().viewport`); `ref` is a `ListRef` |
| `MessageScrollerItem`     |                                                        | Renders `View` (`messageScrollerLook().item`)                           |
| `MessageScrollerButton`   | `direction`, `variant`, `size`, `indicator`            | Renders `Button` (`messageScrollerLook().slot(direction)`)              |

| Prop            | On                        | Type                                                  | Default       |
| --------------- | ------------------------- | ----------------------------------------------------- | ------------- |
| `initialScroll` | `MessageScroller`         | `"start" \| "end"`                                    | `end`         |
| `each`          | `MessageScrollerViewport` | `readonly T[]`                                        |               |
| `alignment`     | `MessageScrollerViewport` | `"top" \| "bottom"`                                   | the list's    |
| `children`      | `MessageScrollerViewport` | `(item: () => T, index: () => number) => JSX.Element` |               |
| `keyExtractor`  | `MessageScrollerViewport` | `(item: T, index: number) => string`                  | the item's id |
| `direction`     | `MessageScrollerButton`   | `"start" \| "end"`                                    | `end`         |
| `variant`       | `MessageScrollerButton`   | `Button` variant                                      | `secondary`   |
| `size`          | `MessageScrollerButton`   | `"sm" \| "default" \| "lg"`                           | `sm`          |
| `indicator`     | `MessageScrollerButton`   | `JSX.Element`                                         |               |

| Export                    | Props / returns                                          | Description                                                       |
| ------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `MessageScrollerProvider` | `children`                                               | Shares the `MessageScroller` inside it; one provider per scroller |
| `useMessageScroller()`    | `scrollToMessage`, `scrollToStart`, `scrollToEnd`, edges | The commands and edge state (`atStart`, `atEnd`) of that scroller |

| Command option | Type                           | Default |
| -------------- | ------------------------------ | ------- |
| `align`        | `"start" \| "center" \| "end"` | `start` |
| `animated`     | `boolean`                      | `true`  |

The frame fills its parent, clips what is in it, and holds its viewport and its buttons; the list's
content is 32 points apart; a button floats 16 points from its edge. `messageScrollerLook()` is
exported for a frame an app draws itself.
