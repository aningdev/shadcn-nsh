---
title: Icons
description: "Built-in UI icons, plus any lucide IconNode an app passes in."
---

The components draw their own basic UI icons. `lib/ui/icons.tsx` ships those nodes, so a component does not need the `lucide` package at run time. `Icon` strokes a node on a canvas in its 24-unit box.

An icon value from [`lucide`](https://lucide.dev/icons) has the same shape (`[tag, attrs][]`) and assigns to `IconNode`. Pass one anywhere a component takes an icon.

## Installation

```npm
npx shadcn-nsh@latest add icons
```

This copies `lib/ui/icons.tsx` and does not install an npm package. A component that draws icons of its own (`select`, `menu`, `tabs`, `sidebar`…) brings `icons` when it is added. With the TSX `nshm` install the same module is `shadcn-nsh`'s `Icon` export; nothing else is installed.

## Usage

```tsx
import { Icon, Plus } from "@/lib/ui/icons";
import { colors } from "@/lib/ui/theme";
```

```tsx
<Icon icon={Plus} size={16} tint={colors.foreground} />
```

The built-in names are the ones the components draw (`ChevronDown`, `Plus`, `Search`, `X`, and the rest of that set). An icon the set does not include still comes from `lucide`:

```tsx
import { Sparkles } from "lucide";

import { Button } from "@/components/ui/button";

<Button icon={Sparkles}>New</Button>;
```

The color is one of the theme's roles, never a literal.

## Size and color

Inside a component, the component says how large an icon is and what color it takes, so it matches the label beside it in every variant and state. Spread its glyph helper, or use its size constant:

```tsx
import { RotateCw, Trash } from "lucide";

import { Button, buttonGlyph, IconButton, iconButtonGlyph } from "@/components/ui/button";
import { Icon } from "@/lib/ui/icons";

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

## In a native menu

A native menu draws its own items, so it takes an image rather than a view: an item's `icon` is what `<Image>`'s `src` takes, fitted to the menu's icon size. `iconImage` writes a lucide node as that image, stroked in `currentColor`, so the menu draws it in its own text color:

```tsx
import { Copy, Mail, Share2 } from "lucide";
import { Menu } from "nsh/desktop";

import { iconImage } from "@/lib/ui/icons";

const shareMenu = () =>
  Menu.popup([
    { label: "Copy", icon: iconImage(Copy), onSelect: copy },
    {
      label: "Share",
      icon: iconImage(Share2),
      submenu: [{ label: "Mail", icon: iconImage(Mail), onSelect: mail }],
    },
  ]);
```

The application menu's items take it the same way (`Menu.setApplicationMenu`). `iconImage(icon, options?)`:

| Argument         | Type       | Default          | Description                                                                                                                       |
| ---------------- | ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `icon`           | `IconNode` |                  | The icon, as `lucide` exports it.                                                                                                 |
| `options.weight` | `number`   | `2`              | The stroke in the 24-unit box (lucide's own is 2).                                                                                |
| `options.ink`    | `string`   | `"currentColor"` | The stroke's color. A fixed ink makes the image a template image, which `tintColor` recolors instead (`CheckMark` passes `#000`). |

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
import { IconLabel } from "@/lib/ui/icons";

<IconButton accessibilityLabel="Close" onPress={close}>
  <IconLabel icon={X} label="close" {...iconButtonGlyph()} />
</IconButton>;
```

## Changing them

`lib/ui/icons.tsx` is the app's own after `add`. To use another set, keep `Icon`'s props and change what it draws: the components only ever pass an icon, a size, a tint and a weight.
