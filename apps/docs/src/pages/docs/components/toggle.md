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

| Prop                 | Type                                    | Default     | Notes                                                          |
| -------------------- | --------------------------------------- | ----------- | -------------------------------------------------------------- |
| `variant`            | `"default" \| "outline"`                | `"default"` | Bare while off, or on an edge while off                        |
| `size`               | `"default" \| "sm" \| "lg"`             | `"default"` | A pointer: 24 / 28 / 34; a touch screen: 32 / 38 / 44          |
| `pressed`            | `boolean`                               | —           | Controlled value (from base)                                   |
| `disabled`           | `boolean`                               | —           | Forwarded; dims to the one disabled opacity                    |
| `children`           | `string \| JSX.Element`                 | —           | A string gets a themed `Text`: muted while off, text colour on |
| `pressedStyle`       | `StyleProp<ViewStyle>`                  | —           | Merged over the on look (consumer wins per key)                |
| `hitSlop`            | `number \| Partial<Edges>`              | —           | Default: makes the target 44 points on a touch screen          |
| `accessibilityLabel` | `string \| null`                        | —           | Forwarded                                                      |
| `onChange`           | `(event: { pressed: boolean }) => void` | —           |                                                                |

Every other base prop and style hook (`class`, `style`, `hoverStyle`, `activeStyle`, `focusStyle`, `disabledStyle`) is forwarded; wrapper defaults sit under the consumer's.

## Differences

| Topic       | shadcn                                  | This package                                                                                                         |
| ----------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Press event | `onPressedChange` / sometimes `onClick` | `onChange({ pressed })`                                                                                              |
| Variants    | `variant` / `size` via CVA              | `variant` (`default` / `outline`) and `size` (`default` / `sm` / `lg`)                                               |
| Density     | CSS sizes                               | a pointer gets the compact sizes, a touch screen the roomier ones with a hit slop to 44 points; heights are minimums |
| Grouping    | often with `ToggleGroup` value API      | standalone; see `toggle-group` for a visual row shell                                                                |
| Class hooks | `className`                             | theme tokens + locked styles                                                                                         |

## Not forwarded

None — all `nsh/base` Toggle props are forwarded.
