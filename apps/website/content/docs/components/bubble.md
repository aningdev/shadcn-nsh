---
title: Bubble
description: "The framed surface of one turn of a conversation, and the reactions that hang off it."
component: true
demo: bubble
---

## Installation

```npm
npx shadcn-nsh@latest add bubble
```

## Usage

```tsx
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  BubbleText,
} from "@/components/ui/bubble";
```

```tsx
<Bubble variant="muted">
  <BubbleContent>I checked the registry output and removed the stale route.</BubbleContent>
  <BubbleReactions accessibilityLabel="Reaction: thumbs up">👍</BubbleReactions>
</Bubble>
```

## Composition

Use the following composition to build a `Bubble`:

```text
Bubble
├── BubbleContent
│   └── BubbleText
└── BubbleReactions

BubbleGroup
├── Bubble
└── Bubble
```

## Examples

### Fills

`variant` changes the frame. `default` is the accent's fill and ink — what you send; `secondary`
the raised neutral; `muted` a quieter fill; `tinted` the accent as a soft wash; `outline` a
hairline around the page's fill; `ghost` no frame at all, for assistant text that takes the whole
width; `destructive` for a turn that failed. Every fill keeps a 1-point edge, transparent where it
has no color, so the box is the same size.

```tsx
<Bubble variant="tinted" align="end">
  <BubbleContent>Tinted: the accent as a soft wash.</BubbleContent>
</Bubble>
```

### Alignment

`align="end"` puts the bubble on the side of what you sent; `align="start"` (the default) on the
side of what came in. A bubble is as wide as what it holds, up to 80% of its column; a `ghost` one
uses the whole width.

```tsx
<Bubble align="end">
  <BubbleContent>Sure. Hit me with your best demo.</BubbleContent>
</Bubble>
```

### Group

`BubbleGroup` stacks consecutive bubbles from one sender 8 points apart. Each `Bubble` keeps its
own `align`.

```tsx
<BubbleGroup>
  <Bubble variant="muted">
    <BubbleContent>Hey! Want to see chat bubbles?</BubbleContent>
  </Bubble>
  <Bubble variant="muted">
    <BubbleContent>I can group messages too.</BubbleContent>
  </Bubble>
</BubbleGroup>
```

### Rich content

`BubbleText` is a `Text` in the bubble's type and the ink of the variant around it. NSH has no text
inheritance — the web gives a bubble's ink to whatever its content holds, NSH does not — so content
that is not a single string (a list of paragraphs, markdown rendered into text) wears `BubbleText`
rather than knowing the variant itself. `BubbleContent` draws a string child the same way.

```tsx
<Bubble variant="default" align="end">
  <BubbleContent>
    <View style={{ gap: 6 }}>
      <BubbleText>Here is a reply in more than one paragraph.</BubbleText>
      <BubbleText>Each paragraph wears the variant's ink.</BubbleText>
    </View>
  </BubbleContent>
</Bubble>
```

### Reactions

`BubbleReactions` is a pill in the muted fill that hangs three quarters of its height off the
bubble's `side` edge (`bottom` by default, or `top`), 12 points in from its `align` end. The
bubble keeps the room the row hangs out on that side, so the next bubble never covers it. Name the
row for screen readers: NSH reads each glyph without context otherwise.

```tsx
<Bubble variant="muted" align="end">
  <BubbleContent>I don't need tests, I know my code works.</BubbleContent>
  <BubbleReactions
    side="top"
    align="start"
    role="image"
    accessibilityLabel="Reactions: thumbs up, surprised"
  >
    👍 😮
  </BubbleReactions>
</Bubble>
```

### A tail

The sender's bottom corner is squarer than the rest. It is a recipe, not a prop — a `style` on
`BubbleContent` that reads the theme's `shape`. Use the logical corner (`borderBottomEndRadius` for
what you send, `borderBottomStartRadius` for what came in) so it follows the reading direction.

```tsx
import { shape } from "@shadcn-nsh/theme";

<Bubble variant="default" align="end">
  <BubbleContent style={{ borderBottomEndRadius: shape.control / 2 }}>On my way.</BubbleContent>
</Bubble>;
```

### A turn that acts

Give `BubbleContent` `onPress` for a quick reply or a suggestion: the pointer over it is a hand.
The frame itself takes the press.

```tsx
<Bubble variant="muted" align="end">
  <BubbleContent onPress={() => reply("I forgot my password")}>I forgot my password</BubbleContent>
</Bubble>
```

## API

Every prop of [`nsh` View](https://nsh.dev/elements/view) passes through on `BubbleGroup`,
`Bubble` and `BubbleContent`; `BubbleText` takes every prop of
[`nsh` Text](https://nsh.dev/elements/text), and `BubbleContent` draws a string child as a
`BubbleText`. Style props go over the look's.

| Part              | Props              | Description                                                                                                |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `BubbleGroup`     | —                  | Consecutive bubbles from one sender, 8 points apart.                                                       |
| `Bubble`          | `variant`, `align` | One turn's frame, as wide as what it holds up to 80% of its column.                                        |
| `BubbleContent`   | `children`         | The frame and the turn, a string drawn as `BubbleText`.                                                    |
| `BubbleText`      | —                  | A paragraph in the turn's type and the variant's ink.                                                      |
| `BubbleReactions` | `side`, `align`    | The pill hung three quarters of its height off the bubble's edge; the bubble keeps that room on that side. |

| Prop       | On                | Type                                                                                       | Default   |
| ---------- | ----------------- | ------------------------------------------------------------------------------------------ | --------- |
| `variant`  | `Bubble`          | `"default" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" \| "destructive"` | `default` |
| `align`    | `Bubble`          | `"start" \| "end"`                                                                         | `start`   |
| `side`     | `BubbleReactions` | `"top" \| "bottom"`                                                                        | `bottom`  |
| `align`    | `BubbleReactions` | `"start" \| "end"`                                                                         | `end`     |
| `children` | `BubbleContent`   | `string \| JSX.Element`                                                                    |           |
| `children` | `BubbleText`      | `JSX.Element`                                                                              |           |

The frame is `shape.container` (12 points) with 12 points of room either side and 8 above and below;
the turn's type is the body's size (13 points with a pointer, 15 on a touch screen) with a step of
leading, in the ink the fill carries — `primary-foreground` on `default`, the page's text color on
the neutral fills, `destructive` on `destructive`. Reactions are 6 points either side, 3 above and
below, 4 apart, ringed 3 points in the card's color.
