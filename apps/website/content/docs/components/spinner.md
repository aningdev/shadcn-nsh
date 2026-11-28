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

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Spinner } from "shadcn-nsh/spinner";
```

## Usage

```tsx
import { Spinner } from "@/components/ui/spinner";
```

```tsx
<Spinner size="default" tint={colors.brand} />
```

## Examples

### Size

`size` is the theme's icon tier, so the ring follows the pointer: 12, 16 and 20 points with a
pointer, 16, 20 and 24 on a touch screen. `side` takes an exact size in points where the scale's
does not fit.

```tsx
<Spinner size="sm" tint={colors.mutedForeground} />
<Spinner size="default" tint={colors.brand} />
<Spinner size="lg" tint={colors.brand} />
<Spinner side={14} tint={colors.mutedForeground} />
```

### In a button

`Button`'s `busy` state draws the ring before the label and blocks a second press.

```tsx
<Button busy={saving()} onPress={save}>
  Save
</Button>
```

## API

A ring with its top arc in `tint`, turning once every 800 ms; its stroke is an eighth of its side, at least 1.5 points.
A groove behind the arc is the theme's track form to say: under the sunk form the rest of the ring follows
`tint` at a quarter, under the tint and hairline forms there is none.

| Part      | Props                  | Description                                                                                                                                                            |
| --------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Spinner` | `size`, `side`, `tint` | The ring: `size` the icon tier (`sm`, `default`, `lg`) or `side` its side in points; `tint` its arc (under a sunk track form, the rest of it that color at a quarter). |
