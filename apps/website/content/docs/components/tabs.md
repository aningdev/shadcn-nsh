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

## API

| Part          | Props                                                       | Description                                                                            |
| ------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Tabs`        | `value`, `defaultValue`, `onValueChange`, `orientation`     | Holds the selected value and lays its list and panel out                               |
| `TabsList`    | `variant`, and every `nsh/base` Tabs prop                   | The tablist: `default` the pill track of `tabsLook`, `line` the underlined strip       |
| `TabsTrigger` | `value`, and every `nsh/base` Tab prop                      | One tab; a string child is its label, drawn with `TabTitle`                            |
| `TabsContent` | `value`                                                     | The panel for one value, hidden (not unmounted) while another is selected              |
| `Tab`         | every `nsh/base` Tab prop                                   | A tab with the same chrome, for an app that owns `selected` itself                     |
| `TabTitle`    | `name`, `selected`, `count`, `icon`, `underline`, `onWidth` | The label to pair with a tab: the icon's two tints crossing over, a count in a capsule |

Every prop of [`nsh/base` Tabs / `Tab`](https://nsh.dev/elements/tabs) passes through on the list and triggers.
