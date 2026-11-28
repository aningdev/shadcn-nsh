---
title: Tabs
description: A pill track or underlined row with a traveling indicator.
component: true
demo: tabs
---

## Installation

```npm
npx shadcn-nsh@latest add tabs
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Tabs } from "shadcn-nsh/tabs";
```

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
</Tabs>
```

The pill track is as wide as its tabs, the tabs as wide as their labels; an underline is as wide as
its labels and its rule. A touch screen always spans the row, and `fill` spans it with a pointer.

The chosen tab is a plate on the track — the theme's `plate`, a labelled block inside the well —
and a tab's own box is that plate's box, so the pointer's hover shade covers exactly where the pill
is.

## Composition

Use the following composition to build a `Tabs`:

```text
Tabs
├── TabsList
│   └── TabsTrigger
└── TabsContent
```

## Examples

### Underline

```tsx
<TabsList variant="line">
  <TabsTrigger value="inbox">Inbox</TabsTrigger>
</TabsList>
```

### Spanning the row

```tsx
<TabsList fill>
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="activity">Activity</TabsTrigger>
</TabsList>
```

## API

| Part          | Props                                                       | Description                                                                                                         |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Tabs`        | `value`, `defaultValue`, `onValueChange`, `orientation`     | Holds the selected value and lays its list and panel out                                                            |
| `TabsList`    | `variant`, `fill`, and every `nsh/base` Tabs prop           | The tablist: `default` the pill track of `tabsLook`, `line` the underlined strip; as wide as its tabs unless `fill` |
| `TabsTrigger` | `value`, and every `nsh/base` Tab prop                      | One tab; a string child is its label, drawn with `TabTitle`                                                         |
| `TabsContent` | `value`                                                     | The panel for one value, hidden (not unmounted) while another is selected                                           |
| `TabTitle`    | `name`, `selected`, `count`, `icon`, `underline`, `onWidth` | The label to pair with a tab: the icon's two tints crossing over, a count in a capsule                              |

Every prop of [`nsh/base` Tabs / `Tab`](https://nsh.dev/elements/tabs) passes through on the list and triggers.
