---
title: Icons
description: "lucide's icons, drawn by `Icon` in the size and color a component gives them."
---

The icons are [lucide](https://lucide.dev/icons)'s, drawn by `Icon` from `lib/icons.tsx`: an icon is a lucide node, stroked on a canvas in its 24-unit box, so it reads at the same size and weight as lucide anywhere else.

## Installation

```npm
npx shadcn-nsh@latest add icons
```

This copies `lib/icons.tsx` and `lib/icon-canvas.ts` and installs `lucide`. A component that draws icons of its own (`select`, `menu`, `tabs`, `sidebar`…) brings them when it is added. `button`, `alert`, `empty` and the other components that take an icon as a child do not: add `icons` once before writing the examples on their pages.

## Usage

```tsx
import { Plus } from "lucide";

import { Icon } from "@/lib/icons";
import { colors } from "@/lib/theme";
```

```tsx
<Icon icon={Plus} size={16} tint={colors.foreground} />
```

Import each icon by name from `lucide`, as a front end does: the [icon list](https://lucide.dev/icons) gives the names (`ChevronDown`, `Trash`, `CircleX`). The color is one of the theme's roles, never a literal.

## Size and color

Inside a component, the component says how large an icon is and what color it takes, so it matches the label beside it in every variant and state. Spread its glyph helper, or use its size constant:

```tsx
import { RotateCw, Trash } from "lucide";

import { Button, buttonGlyph, IconButton, iconButtonGlyph } from "@/components/ui/button";
import { Icon } from "@/lib/icons";

<Button accessibilityLabel="Retry the upload" onPress={retry}>
  <Icon icon={RotateCw} {...buttonGlyph("secondary")} />
</Button>

<IconButton variant="destructive" accessibilityLabel="Delete" onPress={remove}>
  <Icon icon={Trash} {...iconButtonGlyph({ variant: "destructive" })} />
</IconButton>
```

| Component    | Helper                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| `button`     | `buttonGlyph`, `iconButtonGlyph`, `roundButtonGlyph`                    |
| `toggle`     | `toggleGlyph`                                                           |
| `menu`       | `menuItemGlyph`                                                         |
| `attachment` | `attachmentGlyph`                                                       |
| `alert`      | `ALERT_ICON` (the size; the color is `colors.foreground` or the tone's) |
| `empty`      | `EMPTY_ICON`                                                            |

A part that takes an icon as a prop, such as `SelectTrigger`'s `icon` or `MarkerIcon`'s, takes the lucide node itself (`icon={Calendar}`) and draws it in its own size and color.

## Props

| Prop     | Type       | Default | Description                                             |
| -------- | ---------- | ------- | ------------------------------------------------------- |
| `icon`   | `IconNode` |         | The icon, as `lucide` exports it.                       |
| `size`   | `number`   | `20`    | The side of its square, in points.                      |
| `tint`   | `string`   |         | The stroke color, and the fill with `fill`.             |
| `weight` | `number`   | `2`     | The stroke in the 24-unit box (lucide's own is 2).      |
| `fill`   | `boolean`  | `false` | Fill the shape instead of stroking it (a solid `Play`). |

The arrows and chevrons that point along the line (`ChevronLeft`, `ChevronRight`, `ArrowLeft`, `ArrowRight`) are mirrored in a right-to-left layout.

## In the terminal

The terminal draws no icons: `Icon` shows nothing there, except `Check`, which is the mark `✓`. An icon-only control uses `IconLabel` instead, which shows a short word in the icon's place:

```tsx
import { IconLabel } from "@/lib/icons";

<IconButton accessibilityLabel="Close" onPress={close}>
  <IconLabel icon={X} label="close" {...iconButtonGlyph()} />
</IconButton>;
```

## Changing them

`lib/icons.tsx` is the app's own after `add`. To use another set, keep `Icon`'s props and change what it draws: the components only ever pass an icon, a size, a tint and a weight.
