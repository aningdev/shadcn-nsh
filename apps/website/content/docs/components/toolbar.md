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

### Disabled

`disabled` on a `Toolbar` locks the whole bar: no item takes a press, the arrows skip it and it is
one disabled toolbar to screen readers. `disabled` on a `ToolbarGroup` locks that run alone, the
rest of the bar still reached. Every item the bar knows locks — a `Button`, a `Toggle`, a `Link`,
a menu's or popover's trigger — because the base bar hands its lock down to each
(`nsh-base/src/toolbar.rs`, "items"). A control that is not a bar item keeps its own `disabled`
and its own behavior inside a locked bar: a `Command` palette, a text field.

```tsx
<Toolbar accessibilityLabel="Formatting" disabled>
  <ToolbarGroup>
    <Toggle pressed={bold()}>B</Toggle>
    <Toggle pressed={italic()}>I</Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <Button variant="ghost">Undo</Button>
</Toolbar>
```

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
