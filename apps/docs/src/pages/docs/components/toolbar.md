---
title: Toolbar
description: An inset track of tools, with groups and hairline separators.
component: true
demo: toolbar
---

## Installation

```sh
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
<Toolbar style={toolbarTrack()}>
  <ToolbarSeparator style={toolbarRule()} />
</Toolbar>
```

## API

Every prop of [`nsh/base` Toolbar](https://nsh.dev/elements/toolbar), `ToolbarGroup` and `ToolbarSeparator` passes through. `style` goes over the look's. Items keep their own look (`Button`, `Toggle`, …).
