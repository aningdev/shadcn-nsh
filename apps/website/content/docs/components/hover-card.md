---
title: Hover Card
description: A preview card that grows from its trigger, on the shared popover surface.
component: true
demo: hover-card
---

## Installation

```npm
npx shadcn-nsh@latest add hover-card
```

## Usage

```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
```

```tsx
<HoverCard>
  <HoverCardTrigger>@nsh</HoverCardTrigger>
  <HoverCardContent width={240}>
    <Text>Native Shell</Text>
  </HoverCardContent>
</HoverCard>
```

## Composition

Use the following composition to build a `HoverCard`:

```text
HoverCard
├── HoverCardTrigger
└── HoverCardContent
```

## Examples

### Compact

A line or two: 12 points of padding and 4 between rows.

```tsx
<HoverCardContent compact>A short note</HoverCardContent>
```

### Placement and delays

The base defaults are 600 ms before it opens and 300 ms before it closes.

```tsx
<HoverCard>
  <HoverCardTrigger>@nsh</HoverCardTrigger>
  <HoverCardContent placement="top" offset={8} openDelay={200} closeDelay={500}>
    …
  </HoverCardContent>
</HoverCard>
```

### A trigger of your own, or a disabled one

A string child is a `Button` (`variant`, `secondary` by default). A single element child is
the trigger itself: its look, `testID`, name and own press and hover styles stay, and
`nsh/base` adds the open state (`expandedStyle`) to it. `variant` and `disabled` shape a
string child; an element brings its own `disabled`, and the root's `disabled` still keeps
the card closed.

```tsx
<HoverCardTrigger variant="ghost">@nsh</HoverCardTrigger>
<HoverCardTrigger disabled>@nsh</HoverCardTrigger>
<HoverCardTrigger>
  <Text class="underline">@nsh</Text>
</HoverCardTrigger>
```

## API

| Part               | Props                                                                                  | Description                                       |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `HoverCard`        | `open` / `defaultOpen`, `openDelay`, `closeDelay`, `onOpenChange`, `onOpen`, `onClose` | Open state, the delays and the trigger slot       |
| `HoverCardTrigger` | `children`, `variant` (a string child's `Button`), `disabled`, `style`                 | What the card previews; an element is the trigger |
| `HoverCardContent` | `compact`, `width`, and base's `placement`, `align`, `offset`, `margin`                | The preview card                                  |

The root owns the open flag and the two delays (`openDelay`, 600 ms by default; `closeDelay`, 300):
`Infinity` in either makes the card wait for the app, which is how a card a press opens keeps still
under the pointer. `HoverCardContent` mounts
[`nsh/base` HoverCard](https://nsh.dev/elements/hover-card) and every base prop passes through
except the open state, the delays and the lifecycle callbacks, which the root owns. Its children
come in on a `PopIn` with `popoverLook`.
