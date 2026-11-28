---
title: Message
description: "One row of a conversation: the sender's avatar, who they are, the turn, and what is under it."
component: true
demo: message
---

## Installation

```npm
npx shadcn-nsh@latest add message
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Message } from "shadcn-nsh/message";
```

## Usage

```tsx
import { Bot } from "lucide";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Icon } from "@/lib/ui/icons";
import { colors } from "@/lib/ui/theme";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<Message>
  <MessageAvatar name="Oliver Reed" />
  <MessageContent>
    <Bubble variant="muted">
      <BubbleContent>How can I help you today?</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
```

## Composition

Use the following composition to build a `Message`:

```text
Message
├── MessageAvatar
└── MessageContent
    ├── MessageHeader
    └── MessageFooter

MessageGroup
├── Message
└── Message
```

## Examples

### Alignment

`align="end"` mirrors the row for what you sent: the avatar moves to the end and the column with
it, so the bubbles inside follow the message — a `Bubble` takes its place from the column unless
you give it an `align` of its own.

```tsx
<Message align="end">
  <MessageAvatar name="Mia Chen" />
  <MessageContent>
    <Bubble variant="default">
      <BubbleContent>Deploying to prod real quick.</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
```

### Avatar

`MessageAvatar` is 32 points round (36 on a touch screen), at the bottom of the row. With no
`children` it is this library's `Avatar`: `name` gives it initials on an identity hue, `src` a
picture. An avatar with neither keeps the muted circle that holds the row's alignment.

```tsx
<Message>
  <MessageAvatar name="Jason Lee" />
  <MessageContent>
    <Bubble variant="muted">
      <BubbleContent>The build failed during dependency installation.</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
```

Give it `children` and it is that same circle as a muted slot — a bot's glyph, or an `Avatar` of
your own — centered and clipped to the round. `name` and `src` are not used then. The glyph here
is 16 points, in the muted ink.

```tsx
<Message>
  <MessageAvatar accessibilityLabel="Assistant">
    <Icon icon={Bot} size={16} tint={colors.mutedForeground} />
  </MessageAvatar>
  <MessageContent>
    <Bubble variant="muted">
      <BubbleContent>The build failed during dependency installation.</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
```

### Group

`MessageGroup` stacks messages from one sender 8 points apart. Render an empty `MessageAvatar` on
the earlier ones to keep them aligned with the avatar on the last.

```tsx
<MessageGroup>
  <Message>
    <MessageAvatar />
    <MessageContent>
      <MessageHeader>Olivia</MessageHeader>
      <Bubble variant="muted">
        <BubbleContent>I checked the registry addresses.</BubbleContent>
      </Bubble>
    </MessageContent>
  </Message>
  <Message>
    <MessageAvatar name="Oliver Reed" />
    <MessageContent>
      <Bubble variant="muted">
        <BubbleContent>They now live under the UI registry.</BubbleContent>
      </Bubble>
    </MessageContent>
  </Message>
</MessageGroup>
```

### Header and footer

`MessageHeader` names the sender above the turn, at the start of the row; `MessageFooter` carries
what is under it — a delivery status — on the message's side. A string child is drawn in the look's
type.

```tsx
<Message align="end">
  <MessageAvatar name="Mia Chen" />
  <MessageContent>
    <Bubble variant="default">
      <BubbleContent>It's a one-line change.</BubbleContent>
    </Bubble>
    <MessageFooter>Delivered</MessageFooter>
  </MessageContent>
</Message>
```

### A reply that is still arriving

A reply arrives a few characters at a time. While it does, `TextView` takes
`options={{ streaming: true }}` and a `streamingCaret` — a `View` with `textViewCaretClass`, the
theme's brand-colored block that pulses — where the next word will land. Before the first word
there is no text to hang the caret on, so draw the caret alone in a line as tall as the reply's
text and leave the view out.

Stopping is the app's: it keeps the words already received, replaces the `Assistant` name in the
header with `Stopped` (a warn `Badge`) and adds a faint row saying what happened. `Resume` streams
the rest through the same signals.

```tsx
<Message>
  <MessageAvatar accessibilityLabel="Assistant">
    <Icon icon={Bot} size={16} tint={colors.mutedForeground} />
  </MessageAvatar>
  <MessageContent>
    <If when={phase() === "stopped"} else={<MessageHeader>Assistant</MessageHeader>}>
      <MessageHeader>
        <Badge tone="warn" size="sm">
          Stopped
        </Badge>
      </MessageHeader>
    </If>
    <If
      when={phase() === "waiting"}
      else={
        <TextView
          markdown={reply()}
          options={{ streaming: phase() === "streaming" }}
          streamingCaret={phase() === "streaming" ? <View class={textViewCaretClass} /> : undefined}
          styles={{ root: { fontSize: 15, lineHeight: 22 } }}
        />
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", height: 22 }}>
        <View class={textViewCaretClass} />
      </View>
    </If>
    <If when={phase() === "stopped"}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Icon icon={Square} size={12} tint={colors.faint} />
        <Text style={{ fontSize: 13, color: colors.faint }}>You stopped this reply</Text>
      </View>
    </If>
    <MessageFooter>
      <If when={phase() === "waiting" || phase() === "streaming"}>
        <Button variant="secondary" size="sm" onPress={stop}>
          Stop
        </Button>
      </If>
      <If when={phase() === "done" || phase() === "stopped"}>
        <Button variant="secondary" size="sm" onPress={phase() === "done" ? restart : resume}>
          {phase() === "done" ? "Stream it again" : "Resume"}
        </Button>
      </If>
    </MessageFooter>
  </MessageContent>
</Message>
```

### A failed turn

A turn that fails leaves two marks. The sent turn keeps its place, with a `Spinner` and
`Waiting for a connection` in its footer while the app retries. The assistant's turn holds a
destructive `Alert`: an `AlertCircle`, `AlertTitle` naming the failure, and an `AlertDescription`
whose `Retry` button asks for the turn again.

```tsx
<Message align="end">
  <MessageAvatar name="Mia Chen" />
  <MessageContent>
    <Bubble variant="default">
      <BubbleContent>Run the migration on staging.</BubbleContent>
    </Bubble>
    <If when={turn() === "waiting"}>
      <MessageFooter>
        <Spinner size="sm" tint={colors.warning} />
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
          Waiting for a connection
        </Text>
      </MessageFooter>
    </If>
  </MessageContent>
</Message>

<Message>
  <MessageAvatar accessibilityLabel="Assistant">
    <Icon icon={Bot} size={16} tint={colors.mutedForeground} />
  </MessageAvatar>
  <MessageContent>
    <MessageHeader>Assistant</MessageHeader>
    <If when={turn() === "failed"}>
      <Alert variant="destructive">
        <Icon icon={AlertCircle} size={ALERT_ICON} tint={colors.destructive} />
        <AlertTitle>The reply failed</AlertTitle>
        <AlertDescription>
          <View style={{ alignItems: "flex-start", gap: 10 }}>
            <Text style={{ fontSize: 14, color: colors.destructive }}>
              The connection dropped before the first word. Your turn is safe.
            </Text>
            <Button variant="secondary" size="sm" onPress={retry}>
              Retry
            </Button>
          </View>
        </AlertDescription>
      </Alert>
    </If>
    <If when={turn() === "answered"}>
      <TextView markdown={answer()} />
    </If>
  </MessageContent>
</Message>
```

### Rating a reply

What a reply carries under it is the app's: a copy that flips to a check for a moment, and two
thumbs. `IconButton` takes `selected`, so a pressed thumb shows the brand ink and reports
`accessibilityState={{ selected: true }}`; the rating itself is only the app's state until the app
sends it.

```tsx
const copied = signal(false);
const rating = signal<"up" | "down" | null>(null);

const copy = () => {
  void Clipboard.writeText(reply);
  copied.set(true);
  setTimeout(() => copied.set(false), 1600);
};

<MessageFooter>
  <IconButton
    variant="ghost"
    size="sm"
    selected={copied()}
    accessibilityLabel={copied() ? "Copied" : "Copy reply"}
    onPress={copy}
  >
    <Icon
      icon={copied() ? Check : Copy}
      {...iconButtonGlyph({ variant: "ghost", size: "sm", selected: copied() })}
    />
  </IconButton>
  <IconButton
    variant="ghost"
    size="sm"
    selected={rating() === "up"}
    accessibilityLabel="Good reply"
    onPress={() => rating.set(rating() === "up" ? null : "up")}
  >
    <Icon
      icon={ThumbsUp}
      {...iconButtonGlyph({ variant: "ghost", size: "sm", selected: rating() === "up" })}
    />
  </IconButton>
  <IconButton
    variant="ghost"
    size="sm"
    selected={rating() === "down"}
    accessibilityLabel="Bad reply"
    onPress={() => rating.set(rating() === "down" ? null : "down")}
  >
    <Icon
      icon={ThumbsDown}
      {...iconButtonGlyph({ variant: "ghost", size: "sm", selected: rating() === "down" })}
    />
  </IconButton>
</MessageFooter>;
```

### Actions

Anything else in `MessageFooter` is drawn as given: a row of `IconButton`s, a retry, an error.

```tsx
<MessageFooter>
  <IconButton variant="ghost" size="sm" accessibilityLabel="Copy" onPress={copy}>
    <Icon icon={Copy} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
  </IconButton>
  <IconButton variant="ghost" size="sm" accessibilityLabel="Like" onPress={like}>
    <Icon icon={ThumbsUp} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
  </IconButton>
</MessageFooter>
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `MessageGroup`,
`Message` and `MessageContent` (`role`, `accessibilityLabel`, `style`, …). With no `children`,
`MessageAvatar` is this library's [`Avatar`](https://nsh.dev/elements/avatar): `name`, `src`,
`fallback`, `onStatusChange` and the rest of its props pass through. With `children` it renders a
`View` (`style`, `accessibilityLabel` and the other host props still pass through; `name`, `src`
and the image props are not used). A string child of `MessageFooter` and of `MessageHeader` is
drawn as [`nsh` Text](https://nsh.dev/elements/text).

| Part             | Props                     | Description                                                                |
| ---------------- | ------------------------- | -------------------------------------------------------------------------- |
| `MessageGroup`   |                           | Renders `View`: a column, 8 points apart                                   |
| `Message`        | `align`                   | Renders `View`: the avatar and the content, mirrored when `align` is `end` |
| `MessageAvatar`  | `name`, `src`, `children` | Renders `Avatar`, or a round `View` with `children`                        |
| `MessageContent` |                           | Renders `View`: the header, the turn and the footer, on the message's side |
| `MessageHeader`  | `children`                | Renders `View`: who sent it, at the start of the row                       |
| `MessageFooter`  | `children`                | Renders `View`: what is under the turn, on the message's side              |

| Prop       | On              | Type                    | Default |
| ---------- | --------------- | ----------------------- | ------- |
| `align`    | `Message`       | `"start" \| "end"`      | `start` |
| `name`     | `MessageAvatar` | `string`                |         |
| `src`      | `MessageAvatar` | `string`                |         |
| `children` | `MessageAvatar` | `JSX.Element`           |         |
| `children` | `MessageHeader` | `string \| JSX.Element` |         |
| `children` | `MessageFooter` | `string \| JSX.Element` |         |

The row is its avatar and its content 8 points apart, the content a column 10 points apart in the
body's size; the header and the footer are small (12 with a pointer, 13 on a touch screen), medium
and in the muted ink, 12 points in from the turn's edge.
