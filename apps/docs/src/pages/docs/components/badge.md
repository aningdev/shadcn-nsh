---
layout: ../../../layouts/Docs.astro
title: Badge
description: A small capsule label in a neutral, toned, or outline style.
component: true
demo: badge
---

## Installation

```sh
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
<Badge tone="danger">Danger</Badge>
<Badge tone="up">Up</Badge>
<Badge tone="down">Down</Badge>
```

### Variant

`default` fills the capsule with the tone's tint; `outline` draws its edge in the tone's color instead.

```tsx
<Badge variant="outline">Draft</Badge>
<Badge tone="danger" variant="outline">
  Failed
</Badge>
```

## API

Gallery atom: no `nsh/base` counterpart. The children are the label, and the axes take the vocabulary of [`api-unify.md`](../../../../specs/api-unify.md).

| Prop       | Type                   | Default     |
| ---------- | ---------------------- | ----------- |
| `children` | `string`               | (required)  |
| `tone`     | `Tone \| (() => Tone)` | `"neutral"` |
| `variant`  | `BadgeVariant`         | `"default"` |

`BadgeVariant` is `"default" | "outline"`: the two the capsule's look has (shadcn's `ghost`, `link` and `secondary` have no look here).
