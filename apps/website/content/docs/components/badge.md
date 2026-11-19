---
title: Badge
description: A small capsule label in a neutral, toned, or outline style.
component: true
demo: badge
---

## Installation

```npm
npx shadcn-nsh@latest add badge
```

## Usage

```tsx
import { Badge } from "@/components/ui/badge";
```

```tsx
<Badge tone="accent">Beta</Badge>
```

## Examples

### Tone

`tone` is the theme's `Tone`; a function is read where the badge is drawn, so a value the app changes follows.

```tsx
<Badge tone="neutral">Neutral</Badge>
<Badge tone="accent">Accent</Badge>
<Badge tone="info">Info</Badge>
<Badge tone="warn">Warn</Badge>
<Badge tone="destructive">Danger</Badge>
<Badge tone="up">Up</Badge>
<Badge tone="down">Down</Badge>
```

### Variant

`default` fills the capsule with the tone's tint; `outline` draws its edge in the tone's color instead.

```tsx
<Badge variant="outline">Draft</Badge>
<Badge tone="destructive" variant="outline">
  Failed
</Badge>
```

## Differences from shadcn/ui

- shadcn's `ghost`, `link` and `secondary` variants have no look here: `BadgeVariant` is
  `"default" | "outline"`.

## API

Gallery atom: no `nsh/base` counterpart. The children are the label, and the axes take the vocabulary of [`api-unify.md`](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/api-unify.md).

| Part    | Props                                                                                                                                  | Description                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Badge` | `children` (a string, required); `tone`: `Tone \| (() => Tone)` (default `"neutral"`); `variant`: `BadgeVariant` (default `"default"`) | A small capsule label in a neutral, toned, or outline style. |

`BadgeVariant` is `"default" | "outline"`: the two the capsule's look has.
