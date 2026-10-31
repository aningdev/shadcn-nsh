---
layout: ../../../layouts/Docs.astro
title: Button
description: Styled button wrapping nsh/base Button.
component: true
demo: button
---

Styled button on `nsh/base` Button. Adds brand variants; children are a string label.

## Install

```sh
shadcn-nsh add button
# monorepo:
shadcn-nsh add button -c apps/web
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";

<Button onPress={() => {}}>Default</Button>;
```

## Examples

### Variants

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
```

### Disabled

```tsx
<Button disabled>Disabled</Button>
```

## API

### Variants

| `variant`     | Look                     |
| ------------- | ------------------------ |
| `default`     | Primary fill             |
| `secondary`   | Secondary fill           |
| `outline`     | Border, transparent fill |
| `destructive` | Destructive fill         |
| `ghost`       | No border/fill           |

### Props

| Prop       | Type            | Default     | Notes                                          |
| ---------- | --------------- | ----------- | ---------------------------------------------- |
| `children` | `string`        | —           | Label text (also used as `accessibilityLabel`) |
| `variant`  | `ButtonVariant` | `"default"` | See Variants                                   |
| `disabled` | `boolean`       | —           |                                                |
| `onPress`  | `() => void`    | —           |                                                |

## Differences

| Topic       | shadcn                        | This package                                        |
| ----------- | ----------------------------- | --------------------------------------------------- |
| Press event | `onClick`                     | `onPress`                                           |
| Children    | arbitrary nodes / `asChild`   | `children: string` only (rendered as styled `Text`) |
| Size / icon | `size`, icon slots, `asChild` | fixed height; no size / icon / `asChild` API        |
| Link look   | `variant="link"`              | use the `link` component                            |
| Class hooks | `className` / CVA             | theme tokens + locked styles inside the wrapper     |

## Not forwarded

From `nsh/base` Button: press/selection chrome such as `selected`, `role`, custom children trees, and style hooks (`style` / `hoverStyle` / `activeStyle` / `focusStyle`, `accessibilityLabel`). The wrapper owns look-and-feel and sets `accessibilityLabel` from the string label. Extend the copied source if you need base knobs.
