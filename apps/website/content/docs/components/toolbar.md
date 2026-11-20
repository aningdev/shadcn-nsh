---
title: Toolbar
description: An inset track of tools, with groups and hairline separators.
component: true
demo: toolbar
---

## Installation

```npm
npx shadcn-nsh@latest add toolbar
```

## Usage

```tsx
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
```

```tsx
<Toolbar accessibilityLabel="Formatting">
  <ToolbarGroup>
    <Toggle pressed={bold()}>B</Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <Toggle pressed={align() === "left"}>L</Toggle>
  </ToolbarGroup>
</Toolbar>
```

## Examples

### Vertical

```tsx
<Toolbar axis="vertical" accessibilityLabel="Tools">
  <Toggle pressed={tool() === "pen"}>✎</Toggle>
</Toolbar>
```

### The look alone

```tsx
import { Toolbar, ToolbarSeparator, toolbarRule } from "@/components/ui/toolbar";
import { toolbarTrack } from "@/lib/tool";

<Toolbar style={toolbarTrack()}>
  <ToolbarSeparator style={toolbarRule()} />
</Toolbar>;
```

## API

Every prop of [`nsh/base` Toolbar](https://nsh.dev/elements/toolbar), `ToolbarGroup` and `ToolbarSeparator` passes through. `style` goes over the look's. Items keep their own look (`Button`, `Toggle`, …).

| Part               | Props                                     | Description                                                                    |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `Toolbar`          | `axis`, and every `nsh/base` Toolbar prop | The bar: one toolbar for screen readers, arrow keys along `axis`, on the track |
| `ToolbarGroup`     | every `nsh/base` ToolbarGroup prop        | A named run of items; its direction follows the bar                            |
| `ToolbarSeparator` | every `nsh/base` ToolbarSeparator prop    | The hairline between runs, never a tab stop                                    |

`toolbarTrack({ vertical })` (`@/lib/tool`) and `toolbarRule(vertical)` are the look, for a bar of your own.
