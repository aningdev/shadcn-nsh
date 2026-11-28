---
title: Empty
description: A centered block that says there is nothing here yet, and what to do about it.
component: true
demo: empty
---

## Installation

```npm
npx shadcn-nsh@latest add empty
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Empty } from "shadcn-nsh/empty";
```

## Usage

```tsx
import { Inbox } from "lucide";

import {
  Empty,
  EMPTY_ICON,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/lib/ui/icons";
import { colors } from "@/lib/ui/theme";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon icon={Inbox} size={EMPTY_ICON} tint={colors.foreground} />
    </EmptyMedia>
    <EmptyTitle>No messages yet</EmptyTitle>
    <EmptyDescription>Messages you receive will show up here.</EmptyDescription>
  </EmptyHeader>
</Empty>
```

## Composition

Use the following composition to build an `Empty`:

```text
Empty
├── EmptyHeader
│   ├── EmptyMedia
│   ├── EmptyTitle
│   └── EmptyDescription
└── EmptyContent
```

## Examples

### With what the reader can do

`EmptyContent` holds the actions under the words: a button, a field, a link. The block takes the
room its parent leaves it (`flexGrow: 1`), so a list that ends in an empty state fills its pane.

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon icon={Inbox} size={EMPTY_ICON} tint={colors.foreground} />
    </EmptyMedia>
    <EmptyTitle>No messages yet</EmptyTitle>
    <EmptyDescription>Start a conversation to see one.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>New message</Button>
  </EmptyContent>
</Empty>
```

### The app's own art

`variant="default"` is the media as the app draws it — an `Avatar`, an illustration, an `Icon`
drawn large — with no box around it. `variant="icon"` is the square of the muted fill with a
surface's corners, an icon of `EMPTY_ICON` (24 points) in it.

```tsx
<EmptyHeader>
  <EmptyMedia>
    <Icon icon={Search} size={32} tint={colors.faint} />
  </EmptyMedia>
  <EmptyTitle>Nothing matched that search</EmptyTitle>
  <EmptyDescription>Every field is required unless it is marked optional.</EmptyDescription>
</EmptyHeader>
```

### A block that says one thing

The parts are optional: a line on its own is centered in the room the block has.

```tsx
<Empty>
  <EmptyDescription>Nothing has been published to this space yet.</EmptyDescription>
</Empty>
```

### In the terminal

A terminal draws the block as its lines: no padding, one Cell row between the words and the
actions, the title and the description as plain text.

```tsx
<Empty>
  <EmptyHeader>
    <EmptyTitle>No messages yet</EmptyTitle>
  </EmptyHeader>
</Empty>
```

## API

| Part               | Props                            | Description                                      |
| ------------------ | -------------------------------- | ------------------------------------------------ |
| `Empty`            | every `nsh` View prop            | A centered block that takes the room it is given |
| `EmptyHeader`      | every `nsh` View prop            | The media and the words under it                 |
| `EmptyMedia`       | `variant`; every `nsh` View prop | The media's box                                  |
| `EmptyTitle`       | every `nsh` Text prop            | The line that says there is nothing here         |
| `EmptyDescription` | every `nsh` Text prop            | The line under the title, a step quieter         |
| `EmptyContent`     | every `nsh` View prop            | What the reader can do about it                  |

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `Empty`,
`EmptyHeader`, `EmptyMedia` and `EmptyContent`, and every prop of
[`nsh` Text](https://nsh.dev/elements/text) on `EmptyTitle` and `EmptyDescription`; `style` goes
over the look's on each.

| Prop      | Type                  | Default   |
| --------- | --------------------- | --------- |
| `variant` | `"default" \| "icon"` | `default` |

The block is a centered column padded 24, its header a step of 8 apart from its content, the words
and the actions no wider than 384 points. The title is medium at `body + 2` (15 points with a
pointer, 17 on a touch screen), the description the body's size in the muted ink, both centered.
`EMPTY_ICON` is the size an icon takes in the `icon` variant.
