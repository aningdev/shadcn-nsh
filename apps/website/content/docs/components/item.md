---
title: Item
description: "A row of a list: what sits before its content, a title with a note, and controls after it."
component: true
demo: item
---

## Installation

```npm
npx shadcn-nsh@latest add item
```

## Usage

```tsx
import { Bell } from "lucide";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Icon } from "@/lib/icons";
import { colors } from "@/lib/theme";
```

The examples draw icons with `Icon` from `lib/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<ItemGroup>
  <Item>
    <ItemMedia variant="icon">
      <Icon icon={Bell} tint={colors.mutedForeground} />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>New comment</ItemTitle>
      <ItemDescription>Mira replied to your post in #design.</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button size="sm">Open</Button>
    </ItemActions>
  </Item>
  <ItemSeparator />
  <Item>…</Item>
</ItemGroup>
```

`ItemGroup` is a `role="list"` column of rows, `density.gap` apart; `ItemSeparator` is the hairline
between them. `Item` is the row: `ItemMedia` before its content, `ItemContent` for the title and
the note, `ItemActions` for its controls. `ItemHeader` and `ItemFooter` are lines across the whole
row — a header above the content, a footer under it.

## Composition

Use the following composition to build an `Item`:

```text
ItemGroup
├── Item
│   ├── ItemHeader
│   ├── ItemMedia
│   ├── ItemContent
│   │   ├── ItemTitle
│   │   └── ItemDescription
│   ├── ItemActions
│   └── ItemFooter
└── ItemSeparator
```

## Examples

### Variant

`default` draws no surface, for rows split by a separator. `outline` edges the row, for one that
stands alone. `muted` puts it on a muted fill (`token("muted")`, shadcn's `bg-muted`): a well
that reads on a card and on the page, in either appearance, and is still lighter than an edge.

```tsx
<Item variant="outline">
  <ItemHeader>
    <ItemTitle>Outline</ItemTitle>
    <Badge variant="outline">variant</Badge>
  </ItemHeader>
  <ItemContent>
    <ItemDescription>A hairline edge, for a row that stands alone.</ItemDescription>
  </ItemContent>
  <ItemFooter>
    <ItemDescription>Updated 2 hours ago</ItemDescription>
    <Button size="sm" variant="ghost">
      Details
    </Button>
  </ItemFooter>
</Item>
```

### Size

`size="default"` has room for a title, a note and a control; `size="sm"` takes four points off each
side for a single line.

```tsx
<Item size="sm">
  <ItemContent>
    <ItemTitle>Small</ItemTitle>
    <ItemDescription>One line tighter: a title and a note.</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Badge variant="outline">size</Badge>
  </ItemActions>
</Item>
```

### Media

`ItemMedia` holds what comes before the content: `default` the app's own (an avatar), `icon` a
square tile with a surface's edge for an icon, `image` a square frame that clips what is put in it.
An `Avatar` names its person; an `Icon` is a canvas a reader does not stop at, so the title must
say what the icon means.

```tsx
<ItemMedia>
  <Avatar name="Mira Lund" style={{ width: 36, height: 36 }} />
</ItemMedia>
<ItemMedia variant="icon">
  <Icon icon={Bell} tint={colors.mutedForeground} />
</ItemMedia>
<ItemMedia variant="image">
  <Image source={cover} style={{ width: "100%", height: "100%" }} />
</ItemMedia>
```

### A row that takes presses

An `Item` is layout only: it draws a row and takes no presses, so the container decides what a row
does. For a row that is a control — hover fill, keyboard focus, disabled — use the same content on
`listRow` instead, or wrap it in a view with `onPress` and `role="button"`. `ItemGroup` is
`role="list"`, but NSH has no `listitem` role, so an `Item` is a plain view and a reader moves
through its text element by element: when the rows can be pressed, mark the pressable view
`role="button"` and give it an `accessibilityLabel` that says the whole row (or use `listRow`,
which does).

```tsx
<View role="button" onPress={() => open(item)} {...listRow()}>
  <ItemMedia variant="icon">
    <Icon icon={Bell} tint={colors.mutedForeground} />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>{item.title}</ItemTitle>
    <ItemDescription>{item.note}</ItemDescription>
  </ItemContent>
</View>
```

## API

| Part              | Props                                                                           | Description                                                                             |
| ----------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `ItemGroup`       | every view prop                                                                 | `role="list"`, a column `density.gap` apart                                             |
| `ItemSeparator`   | every view prop                                                                 | A hairline, 4 points above and below                                                    |
| `Item`            | `variant`: `"default"`, `"outline"` or `"muted"`; `size`: `"default"` or `"sm"` | The row                                                                                 |
| `ItemMedia`       | `variant`: `"default"`, `"icon"` or `"image"`                                   | What sits before the content                                                            |
| `ItemContent`     | every view prop                                                                 | A column that takes the room the row leaves                                             |
| `ItemTitle`       | every text prop                                                                 | The label's size, medium, in the text colour                                            |
| `ItemDescription` | every text prop                                                                 | A step quieter, muted, two lines (`numberOfLines: 2`); a reader hears the text it shows |
| `ItemActions`     | every view prop                                                                 | A row, 8 points apart                                                                   |
| `ItemHeader`      | every view prop                                                                 | A line across the row, above the content                                                |
| `ItemFooter`      | every view prop                                                                 | A line across the row, under the content                                                |

Every view prop passes through the parts drawn as views, and every text prop the parts drawn as
texts. `style` goes over the look's.

An icon's tile is `controlSize.control + 12` square and an image's frame `controlSize.row - 8`,
both of the theme's control corners, so both grow on a touch screen. `itemLook()` is exported for a
row the app draws itself: the same look without the parts. `muted`'s fill is the theme's `muted`
token (`token("muted")`); `default` and `outline` draw what they always did.
