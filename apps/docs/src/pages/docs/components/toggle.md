---
layout: ../../../layouts/Docs.astro
title: Toggle
description: Styled toggle wrapping nsh/base Toggle.
component: true
demo: toggle
---

Styled pressable toggle on `nsh/base` Toggle. Uses `pressed` / `onChange({ pressed })` — not a click boolean.

## Install

```sh
shadcn-nsh add toggle
# monorepo:
shadcn-nsh add toggle -c apps/web
```

## Usage

```tsx
import { Toggle } from "@workspace/ui/components/ui/toggle";
import { Text } from "nsh";

<Toggle pressed={bold()} onChange={({ pressed }) => setBold(pressed)}>
  <Text>Bold</Text>
</Toggle>;
```

## Examples

### Controlled

```tsx
const [bold, setBold] = createSignal(false);

<Toggle pressed={bold()} onChange={({ pressed }) => setBold(pressed)}>
  <Text>Bold</Text>
</Toggle>;
```

### Disabled

```tsx
<Toggle disabled pressed>
  <Text>Disabled</Text>
</Toggle>
```

## API

| Prop                 | Type                                    | Default | Notes        |
| -------------------- | --------------------------------------- | ------- | ------------ |
| `pressed`            | `boolean`                               | —       |              |
| `disabled`           | `boolean`                               | —       |              |
| `accessibilityLabel` | `string \| null`                        | —       |              |
| `children`           | `JSX.Element`                           | —       | Label / icon |
| `onChange`           | `(event: { pressed: boolean }) => void` | —       |              |

## Differences

| Topic       | shadcn                                  | This package                                          |
| ----------- | --------------------------------------- | ----------------------------------------------------- |
| Press event | `onPressedChange` / sometimes `onClick` | `onChange({ pressed })`                               |
| Variants    | `variant` / `size` via CVA              | none — fixed height and accent pressed look           |
| Grouping    | often with `ToggleGroup` value API      | standalone; see `toggle-group` for a visual row shell |
| Class hooks | `className`                             | theme tokens + locked styles                          |

## Not forwarded

From `nsh/base` Toggle: `focusStyle`, `style`, and `pressedStyle`. The wrapper owns the focus ring, border/background, and pressed accent colors.
