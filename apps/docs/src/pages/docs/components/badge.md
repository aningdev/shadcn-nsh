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
<Badge label="Beta" tone="accent" />
```

## Examples

### Outline

```tsx
<Badge label="Draft" outline />
```

## API

Gallery atom: no `nsh/base` counterpart. Props match the upstream `Badge`.

| Prop      | Type      | Default     |
| --------- | --------- | ----------- |
| `label`   | `string`  | (required)  |
| `tone`    | `Tone`    | `"neutral"` |
| `outline` | `boolean` | `false`     |
