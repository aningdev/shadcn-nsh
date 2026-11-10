---
layout: ../../../layouts/Docs.astro
title: Toolbar
description: Styled toolbar wrapping nsh/base Toolbar, ToolbarGroup, and ToolbarSeparator.
component: true
demo: toolbar
demoHeight: 280
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns the toolbar semantics and the arrow-key roving. This package is the inset track: `muted` fill, a hairline separator, and no colors of its own on the items. Put `Button`, `Toggle`, and `Link` inside — they are the items, and they keep their own look, including touch hit slop.

## Install

```npx tabs
npx shadcn-nsh@latest add toolbar
```

```bunx tabs
bunx shadcn-nsh@latest add toolbar
```

```pnx tabs
pnx shadcn-nsh@latest add toolbar
```

```yarn tabs
yarn dlx shadcn-nsh@latest add toolbar
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";
import { Link } from "@workspace/ui/components/ui/link";
import { Toggle } from "@workspace/ui/components/ui/toggle";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@workspace/ui/components/ui/toolbar";

<Toolbar accessibilityLabel="Formatting">
  <ToolbarGroup accessibilityLabel="Marks">
    <Button variant="ghost" size="sm" accessibilityLabel="Bold">
      Bold
    </Button>
    <Toggle pressed={italic()} accessibilityLabel="Italic" onChange={setItalic}>
      Italic
    </Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <Link href="https://nsh.dev">Site</Link>
</Toolbar>;
```

`Button`, `Toggle`, and `Link` are their own registry items. `add toolbar` does not install them.

## Composition

```
Toolbar (nsh/base Toolbar)
├── ToolbarGroup (nsh/base ToolbarGroup)
│   └── items: Button, Toggle, Link, …
├── ToolbarSeparator (nsh/base ToolbarSeparator)
└── more items
```

## API

### `Toolbar` Props

| Prop                 | Type                         | Default        | Notes                                       |
| -------------------- | ---------------------------- | -------------- | ------------------------------------------- |
| `axis`               | `"horizontal" \| "vertical"` | `"horizontal"` | Read when the bar is made. Arrows follow it |
| `disabled`           | `boolean`                    | `false`        | Every item disabled. The track dims to 0.5  |
| `accessibilityLabel` | `string`                     | —              | The toolbar's name                          |
| `style`              | `StyleProp<ViewStyle>`       | —              | Merged over the inset track                 |
| `children`           | `JSX.Element`                | —              | Items, groups, separators                   |

### `ToolbarGroup` Props

| Prop                 | Type                   | Default | Notes                           |
| -------------------- | ---------------------- | ------- | ------------------------------- |
| `disabled`           | `boolean`              | `false` | The group's items. The run dims |
| `accessibilityLabel` | `string`               | —       | The group's name                |
| `style`              | `StyleProp<ViewStyle>` | —       | Merged over a row (or column)   |

### `ToolbarSeparator` Props

| Prop    | Type                   | Default | Notes                                      |
| ------- | ---------------------- | ------- | ------------------------------------------ |
| `style` | `StyleProp<ViewStyle>` | —       | Merged over a 1-point rule, 18 points long |

## Differences

| Topic     | shadcn                   | This package                                                                  |
| --------- | ------------------------ | ----------------------------------------------------------------------------- |
| Parts     | often a div with buttons | `Toolbar` / `ToolbarGroup` / `ToolbarSeparator` from `nsh/base`               |
| Items     | whatever you render      | Base items are `Button`, `Toggle`, `Link`, and menu / popover triggers        |
| Track     | border utility classes   | `muted` (reference inset) and `border`. No new token                          |
| Separator | a styled div             | Base separator: not a tab stop. Thickness is fixed (a hairline, not text)     |
| Disabled  | per control              | `disabled` on the bar or the group wins, at the theme's 0.5                   |
| Keyboard  | app-owned                | Base: one Tab stop; arrows, Home, End; Space / Return press. Disabled skipped |

## Accessibility

Role `toolbar`, named by `accessibilityLabel`. A group is role `group`. The separator is not an element. On macOS and the web, Tab enters at the item focus last left (else the first that is not disabled). Left and Right move along a horizontal bar (Up and Down along a vertical one), wrapping, past disabled items, without pressing them.
