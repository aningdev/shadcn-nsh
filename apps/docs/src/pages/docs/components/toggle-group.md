---
title: Toggle Group
description: A row or column of toggles on the inset toolbar track.
component: true
demo: toggle-group
---

## Installation

```sh
npx shadcn-nsh@latest add toggle-group
```

## Usage

```tsx
import { Toggle, ToggleGroup } from "@/components/ui/toggle-group";
```

```tsx
<ToggleGroup accessibilityLabel="Style">
  <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
    Bold
  </Toggle>
</ToggleGroup>
```

## Examples

### Vertical

```tsx
<ToggleGroup vertical accessibilityLabel="Style">
  <Toggle pressed={bold()}>Bold</Toggle>
</ToggleGroup>
```

### Inside a Toolbar

```tsx
<Toolbar>
  <ToggleGroup inset={false} accessibilityLabel="Style">
    <Toggle pressed={bold()}>B</Toggle>
  </ToggleGroup>
</Toolbar>
```

`inset={false}` skips the track when a parent `Toolbar` already wears it.

## API

Every prop of [`nsh/base` ToggleGroup](https://nsh.dev/elements/toggle-group) passes through. `style` goes over the look's. `Toggle` is re-exported from the toggle package.

| Prop       | Type      | Default |
| ---------- | --------- | ------- |
| `vertical` | `boolean` |         |
| `inset`    | `boolean` | `true`  |
