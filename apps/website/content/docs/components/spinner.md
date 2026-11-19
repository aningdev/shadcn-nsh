---
title: Spinner
description: "A turning ring: work going on."
component: true
demo: spinner
---

## Installation

```npm
npx shadcn-nsh@latest add spinner
```

## Usage

```tsx
import { Spinner } from "@/components/ui/spinner";
```

```tsx
<Spinner size={16} tint={colors.brand} />
```

## Examples

### Size

```tsx
<Spinner size={12} tint={colors.mutedForeground} />
<Spinner size={16} tint={colors.brand} />
<Spinner size={24} tint={colors.brand} />
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

| Part      | Props          | Description                                                                                   |
| --------- | -------------- | --------------------------------------------------------------------------------------------- |
| `Spinner` | `size`, `tint` | The ring: `size` its side in points, `tint` its arc (the rest of it that color at a quarter). |
