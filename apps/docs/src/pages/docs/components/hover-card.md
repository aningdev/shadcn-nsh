---
layout: ../../../layouts/Docs.astro
title: Hover Card
description: A preview card that grows from its trigger, on the shared popover surface.
component: true
demo: hover-card
---

## Installation

```sh
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

A string child is a `Button`; a disabled trigger keeps the card closed.

```tsx
<HoverCardTrigger variant="ghost">@nsh</HoverCardTrigger>
<HoverCardTrigger disabled>@nsh</HoverCardTrigger>
```

## API

The root owns the open flag; `HoverCardContent` mounts [`nsh/base` HoverCard](https://nsh.dev/elements/hover-card) and every base prop passes through except those. Its children come in on a `PopIn` with `popoverLook`.

| Part               | Notes                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `HoverCard`        | `open` / `defaultOpen`, `onOpenChange`, `onOpen`, `onClose`                                        |
| `HoverCardTrigger` | `variant` (a string child's `Button`), `disabled`, `style`                                         |
| `HoverCardContent` | `compact`, `width`, and base's `placement`, `align`, `offset`, `margin`, `openDelay`, `closeDelay` |
