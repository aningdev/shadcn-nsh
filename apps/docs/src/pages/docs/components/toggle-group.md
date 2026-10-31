---
layout: ../../../layouts/Docs.astro
title: Toggle Group
description: Styled toggle group wrapping nsh/base ToggleGroup.
component: true
demo: toggle-group
---

Styled muted row shell on `nsh/base` ToggleGroup. Re-exports `Toggle` for convenience — selection state still lives on each `Toggle`.

## Install

```sh
shadcn-nsh add toggle-group
# monorepo:
shadcn-nsh add toggle-group -c apps/web
```

## Usage

```tsx
import { Toggle, ToggleGroup } from "@workspace/ui/components/ui/toggle-group";
import { Text } from "nsh";

<ToggleGroup>
  <Toggle pressed={align() === "left"} onChange={({ pressed }) => pressed && setAlign("left")}>
    <Text>Left</Text>
  </Toggle>
  <Toggle
    pressed={align() === "center"}
    onChange={({ pressed }) => pressed && setAlign("center")}
  >
    <Text>Center</Text>
  </Toggle>
</ToggleGroup>
```

## Composition

```
ToggleGroup
└─ Toggle*
```

## Examples

### Exclusive selection in the app

```tsx
const [align, setAlign] = createSignal("left");

<ToggleGroup>
  <Toggle pressed={align() === "left"} onChange={({ pressed }) => pressed && setAlign("left")}>
    <Text>Left</Text>
  </Toggle>
  <Toggle pressed={align() === "right"} onChange={({ pressed }) => pressed && setAlign("right")}>
    <Text>Right</Text>
  </Toggle>
</ToggleGroup>
```

### Disabled group

```tsx
<ToggleGroup disabled>
  <Toggle pressed>
    <Text>Locked</Text>
  </Toggle>
</ToggleGroup>
```

## API

### `ToggleGroup`

| Prop       | Type           | Default | Notes                    |
| ---------- | -------------- | ------- | ------------------------ |
| `disabled` | `boolean`      | —       |                          |
| `children` | `JSX.Element`  | —       | Usually `Toggle` items   |

### `Toggle`

Re-exported from `./toggle`. See [Toggle](./toggle) for `pressed`, `disabled`, `accessibilityLabel`, `children`, and `onChange`.

## Differences

| Topic       | shadcn                                                | This package                                              |
| ----------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Value API   | `type` / `value` / `onValueChange` on the group       | no group value — each `Toggle` is `pressed` / `onChange`  |
| Orientation | `orientation`                                         | fixed horizontal row shell                                |
| Variants    | `variant` / `size`                                    | none                                                      |
| Exports     | group + item parts                                    | `ToggleGroup` + re-exported `Toggle`                      |

## Not forwarded

From `nsh/base` ToggleGroup: `style` only (muted bordered row). No `type` / `value` / `orientation` props are exposed — extend the copied source if you need base grouping knobs.
