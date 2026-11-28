# Message scroller (/dev/docs/components/message-scroller)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add message-scroller
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { MessageScroller } from "shadcn-nsh/message-scroller";
```

## Usage [#usage]

```tsx
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Icon } from "@/lib/ui/icons";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

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

## Composition [#composition]

Use the following composition to build a `MessageScroller`:

```text
MessageScroller
├── MessageScrollerViewport
│   └── MessageScrollerItem
└── MessageScrollerButton

MessageScrollerProvider
└── MessageScroller
```

## Examples [#examples]

### Following [#following]

The scroller opens at the end, on the newest turn, and keeps itself there: when the content grows
— a turn is sent, a stream answers — the list keeps the end in view. Scroll up and it stops
following; the view stays where the reader put it while new turns arrive below. Scroll back to the
end and it follows again.

Give the frame a height (`style={{ height: 320 }}`): it fills what it is in, and its viewport takes
the room left. Four hundred turns cost what four do: the list mounts only the rows near the screen.

### Opening elsewhere [#opening-elsewhere]

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

### Keys [#keys]

`keyExtractor` names a turn's row. The default reads the turn's `key`, then its `id`, then its
index; give it one when the data has nothing to name a turn by. A key does two things: it keeps a
row's cell and its size as rows come and go, and it is the name `scrollToMessage` takes — a turn
with the same id on screen and in the command find each other. Keys must be unique and stable: with
an index, every append that shifts a row makes the list rebuild it.

### Buttons [#buttons]

`MessageScrollerButton` floats 16 points above the newest turn (or below the oldest) in the middle
of the viewport, and shows only while there is somewhere to go that way. It says "Scroll to end" or
"Scroll to start" to screen readers; give it `accessibilityLabel` to say something else.

```tsx
<MessageScrollerButton />

<MessageScrollerButton direction="start">
  <Icon icon={ArrowUp} {...buttonGlyph("secondary", { size: "sm" })} />
</MessageScrollerButton>
```

### A short thread, and an arrival [#a-short-thread-and-an-arrival]

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

### A chat [#a-chat]

A conversation starts with an empty frame: keep the greeting and its suggestions inside the
`MessageScroller` until the first turn arrives, so the frame holds its height and the composer under
it never jumps. `MessageScrollerProvider` shares the scroller with that composer, and the send
button is a `RoundButton` beside an `Input`.

```tsx
const chat = signal<Turn[]>([]);
const draft = signal("");

const send = (prompt?: string) => {
  const text = (prompt ?? draft()).trim();
  if (text === "") return;
  chat.set([...chat(), { id: next(), text, mine: true }]);
  draft.set("");
  reply(text); // the answer arrives a moment later
};

<MessageScrollerProvider>
  <View style={{ gap: 8 }}>
    <MessageScroller initialScroll="end" style={{ height: 380, borderRadius: 10 }}>
      {chat().length === 0 ? (
        <EmptyChat onPick={send} />
      ) : (
        <>
          <MessageScrollerViewport
            each={chat()}
            keyExtractor={(turn) => String(turn.id)}
            estimatedItemSize={68}
          >
            {turnRow}
          </MessageScrollerViewport>
          <MessageScrollerButton direction="start" />
        </>
      )}
    </MessageScroller>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Input
        value={draft()}
        onChange={({ value }) => draft.set(value)}
        placeholder="Message"
        submitBehavior={desktop ? "submit" : "newline"}
        onSubmit={() => send()}
        style={{ flex: 1, height: 40, borderRadius: 20 }}
      />
      <RoundButton
        side={40}
        accessibilityLabel="Send"
        disabled={draft().trim().length === 0}
        onPress={() => send()}
      >
        <Icon icon={ArrowUp} {...roundButtonGlyph("default", { side: 40 })} />
      </RoundButton>
    </View>
  </View>
</MessageScrollerProvider>;
```

`EmptyChat` takes the whole viewport (`flex: 1`, centered) and calls `send` with a starter prompt;
`turnRow` draws a turn with `Message`, `MessageAvatar` and `Bubble`. While the reader is at the end
the viewport follows a new turn; while they are not, it waits where they are.

### Older turns [#older-turns]

`onLoadMoreAtStart` is the list's own, passed through the viewport: while the reader is within
`loadMoreAtStartThreshold` viewports of the first row, the scroller asks for an older page and
prepends it. Rows on screen keep their place, so the reading position does not jump. Guard the call
with a signal — it can fire again while a page is in flight.

```tsx
const loading = signal(false);

const loadOlder = () => {
  if (loading()) return;
  loading.set(true);
  fetchOlderPage().then((page) => {
    history.set([...page, ...history()]);
    loading.set(false);
  });
};

<MessageScrollerViewport
  each={history()}
  keyExtractor={(turn) => String(turn.id)}
  estimatedItemSize={68}
  onLoadMoreAtStart={loadOlder}
>
  {(item) => <MessageScrollerItem>{turnRow(item)}</MessageScrollerItem>}
</MessageScrollerViewport>;
```

The trigger fires on the frame's start side — the top of a normal list — so the same call also
works over an inverted list, where older turns sit at the top.

### Selecting across turns [#selecting-across-turns]

`MessageScroller` is a `View`, so `selectable` passes straight through: a drag over the frame is one
selection over the rows that are mounted, instead of one per bubble.

```tsx
<MessageScroller selectable initialScroll="end" style={{ height: 200 }}>
  <MessageScrollerViewport each={excerpt} keyExtractor={(turn) => String(turn.id)}>
    {(item) => <MessageScrollerItem>{turnRow(item)}</MessageScrollerItem>}
  </MessageScrollerViewport>
</MessageScroller>
```

### Commands [#commands]

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

### Turns [#turns]

`MessageScrollerItem` is the box one turn sits in, sized by what is in it; `MessageScrollerViewport`
is the list the turns are in, 32 points apart. What a turn is, is `Message`'s business.

## API [#api]

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `MessageScroller` and
`MessageScrollerItem`; `MessageScrollerViewport` takes a [`List`](https://nsh.dev/elements/list)'s
(`keyExtractor`, `estimatedItemSize`, `onViewableItemsChange`, `scrollbar`, …) less the state the
scroller keeps (`inverted`, `initialScrollIndex`, `initialScrollAtEnd`,
`maintainVisibleContentPosition`, …), plus `each`, `alignment` and `onLoadMoreAtStart` (all passed to
the list — the last one loads older turns) and the child that renders a row; and `MessageScrollerButton` takes this library's
[`Button`](https://nsh.dev/elements/button) props (`variant` defaults to `secondary`, `size` to
`sm`). `alignment="bottom"` pins a short conversation to the bottom of the viewport. `indicator`
is a mark at the button's top-end corner (an arrival dot); the arrow stays.

| Part                      | Props                                                                       | Description                                                       |
| ------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `MessageScroller`         | `initialScroll`                                                             | Renders `View`: a column that fills its parent and clips          |
| `MessageScrollerViewport` | `each`, `children`, `keyExtractor`, `alignment`, `onLoadMoreAtStart`, `ref` | Renders `List`; `ref` is a `ListRef`                              |
| `MessageScrollerItem`     |                                                                             | Renders `View`: the box one turn sits in                          |
| `MessageScrollerButton`   | `direction`, `variant`, `size`, `indicator`                                 | Renders `Button`, floating 16 points from the edge it points past |

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
content is 32 points apart; a button floats 16 points from its edge.