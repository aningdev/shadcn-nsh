---
layout: ../../../layouts/Docs.astro
title: Hover Card
description: Styled hover card wrapping nsh/base HoverCard — theme tokens + Trigger / Content.
component: true
demo: hover-card
demoHeight: 360
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns the rest delay, keyboard focus, Escape, and press-outside — unstyled. This package is the styled layer: `HoverCard` / `HoverCardTrigger` / `HoverCardContent`, the same popup surface as a popover, and a 150 ms scale from 95%. Delays stay on base (600 ms open, 300 ms close).

## Install

```npx tabs
npx shadcn-nsh@latest add hover-card
```

```bunx tabs
bunx shadcn-nsh@latest add hover-card
```

```pnx tabs
pnx shadcn-nsh@latest add hover-card
```

```yarn tabs
yarn dlx shadcn-nsh@latest add hover-card
```

## Usage

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardTrigger,
} from "@workspace/ui/components/ui/hover-card";

<HoverCard>
  <HoverCardTrigger>@ada</HoverCardTrigger>
  <HoverCardContent>
    <HoverCardHeader>
      <HoverCardTitle>Ada Lovelace</HoverCardTitle>
      <HoverCardDescription>First programmer.</HoverCardDescription>
    </HoverCardHeader>
  </HoverCardContent>
</HoverCard>;
```

## Composition

```
HoverCard
├── HoverCardTrigger
└── HoverCardContent (nsh/base HoverCard)
    └── HoverCardHeader (app)
        ├── HoverCardTitle (app)
        └── HoverCardDescription (app)
```

## API

### `HoverCard` Props

| Prop          | Type              | Default | Notes                     |
| ------------- | ----------------- | ------- | ------------------------- |
| `open`        | `boolean \| null` | —       | Controlled open           |
| `defaultOpen` | `boolean`         | `false` | Uncontrolled initial open |
| `children`    | `JSX.Element`     | —       | Composition parts         |

`openDelay`, `closeDelay`, `placement`, `align`, and `offset` are not root props. Set them on `HoverCardContent`.

### Events

| Event          | Notes                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| `onOpenChange` | `(event: { open: boolean; reason: OpenChangeReason }) => void` — hover, focus, cancel, … |
| `onOpen`       | The card is shown                                                                        |
| `onClose`      | The card is gone, after its exit                                                         |

### `HoverCardContent` Props

| Prop         | Type                                     | Default    | Notes                                                  |
| ------------ | ---------------------------------------- | ---------- | ------------------------------------------------------ |
| `openDelay`  | `number`                                 | `600`      | Base. `Infinity` never opens by itself                 |
| `closeDelay` | `number`                                 | `300`      | Base. Time to cross onto the card                      |
| `placement`  | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Forwarded                                              |
| `align`      | `"start" \| "center" \| "end"`           | `"center"` | Forwarded                                              |
| `offset`     | `number`                                 | `4`        | Base default is `0`                                    |
| `compact`    | `boolean`                                | `false`    | 12-point padding, rows 4 apart                         |
| `popupStyle` | `StyleProp<ViewStyle>`                   | —          | Merged over `popupSurface()` and the 150 ms transition |

Remaining HoverCard props pass through (`margin`, `onPosition`, starting and ending class hooks). A phase you set (`popupStartingStyle` or `popupStartingClass`, including `null`) replaces the default entrance.

## Differences

| Topic   | shadcn                   | This package                                                                         |
| ------- | ------------------------ | ------------------------------------------------------------------------------------ |
| Parts   | Root / Trigger / Content | Same names, plus Header / Title / Description                                        |
| Trigger | asChild                  | String child is a `Button`; other children are a focusable view                      |
| Surface | popover tokens           | `popupSurface()` — neutral `card`, not inverted text                                 |
| Motion  | CSS zoom                 | 150 ms opacity and scale 95%, from hover-card.md. Base skips it under reduced motion |
| Delays  | often 700 / 300          | Base 600 / 300, not overridden                                                       |
| Offset  | a few pixels             | `4`, matching Popover. Base is `0`                                                   |

## Accessibility

The trigger keeps its role. Keyboard focus on it opens the card; Escape closes it. The card takes no focus of its own. Links and buttons inside it do, and the card stays open while one of them is focused. On a touch screen a press toggles the card (base).
