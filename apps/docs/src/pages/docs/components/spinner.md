---
layout: ../../../layouts/Docs.astro
title: Spinner
description: "A turning ring: work going on."
component: true
demo: spinner
---

## Installation

```sh
npx shadcn-nsh@latest add spinner
```

## Usage

```tsx
import { Spinner } from "@/components/ui/spinner";
```

```tsx
<Spinner size={16} tint={colors.accent} />
```

## Examples

### Size

```tsx
<Spinner size={12} tint={colors.muted} />
<Spinner size={16} tint={colors.accent} />
<Spinner size={24} tint={colors.accent} />
```

### In a button

`Button`'s `busy` state draws the ring before the label and blocks a second press.

```tsx
<Button busy={saving()} onPress={save}>
  Save
</Button>
```

## API

A ring with its top arc in `tint`, turning once every 800 ms; its stroke is an eighth of `size`, at least 1.5 points.

| Prop   | Type     | Default |
| ------ | -------- | ------- |
| `size` | `number` |         |
| `tint` | `string` |         |
