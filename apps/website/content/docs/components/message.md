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

## Usage

```tsx
import { Bot } from "lucide";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Icon } from "@/lib/icons";
import { colors } from "@/lib/theme";
```

The examples draw icons with `Icon` from `lib/icons`; see [Icons](../icons) for adding it and picking a size and color.

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
    <Icon icon={Bot} size={16} tint={colors.muted} />
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

## Differences from shadcn/ui

shadcn/ui's message differs here in three places:

- **`name` and `src` stay.** shadcn/ui's `MessageAvatar` is only the slot; the app puts an `Avatar`
  inside it. Here `name` and `src` still draw this library's `Avatar`, and `children` is the slot
  when a mark should sit there instead.
- **The avatar does not step up for a footer.** shadcn/ui lifts it by the footer's height when a
  message has one (`group-has-data-[slot=message-footer]`); NSH has no `:has()`, so the avatar
  sits at the bottom of the whole row, beside the footer rather than the turn.
- **The `role` shortcut is not there.** shadcn/ui's `Message` reads `role="user"` to mirror the
  row; here `align` is the only axis, so the app says `align="end"` for what it sent.

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `MessageGroup`,
`Message` and `MessageContent` (`role`, `accessibilityLabel`, `style`, …). With no `children`,
`MessageAvatar` is this library's [`Avatar`](https://nsh.dev/elements/avatar): `name`, `src`,
`fallback`, `onStatusChange` and the rest of its props pass through. With `children` it renders a
`View` (`style`, `accessibilityLabel` and the other host props still pass through; `name`, `src`
and the image props are not used). A string child of `MessageFooter` and of `MessageHeader` is
drawn as [`nsh` Text](https://nsh.dev/elements/text).

| Part             | Props                     | Description                                                                                         |
| ---------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| `MessageGroup`   |                           | Renders `View` (`messageLook().group`)                                                              |
| `Message`        | `align`                   | Renders `View` (`messageLook().row(align)`)                                                         |
| `MessageAvatar`  | `name`, `src`, `children` | Renders `Avatar` (`messageLook().avatar`), or a `View` (`messageLook().avatarSlot`) with `children` |
| `MessageContent` |                           | Renders `View` (`messageLook().content(align)`)                                                     |
| `MessageHeader`  | `children`                | Renders `View` (`messageLook().header`)                                                             |
| `MessageFooter`  | `children`                | Renders `View` (`messageLook().footer(align)`)                                                      |

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
and in the muted ink, 12 points in from the turn's edge. `messageLook()` is exported for a row an
app draws itself.
