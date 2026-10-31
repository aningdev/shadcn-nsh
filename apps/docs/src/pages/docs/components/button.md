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

<Button onPress={() => {}}>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
<Button disabled>Disabled</Button>
```

## Variants

| `variant`     | Look                     |
| ------------- | ------------------------ |
| `default`     | Primary fill             |
| `secondary`   | Secondary fill           |
| `outline`     | Border, transparent fill |
| `destructive` | Destructive fill         |
| `ghost`       | No border/fill           |

## API

| Prop       | Type            | Default     | Notes                                          |
| ---------- | --------------- | ----------- | ---------------------------------------------- |
| `children` | `string`        | —           | Label text (also used as `accessibilityLabel`) |
| `variant`  | `ButtonVariant` | `"default"` | See Variants                                   |
| `disabled` | `boolean`       | —           |                                                |
| `onPress`  | `() => void`    | —           |                                                |

<div class="callout">

**Not forwarded** from `nsh/base` Button: press/selection chrome such as `selected`, `role`, custom children trees, and style hooks (`style` / `hoverStyle` / `activeStyle` / `focusStyle`, etc.). This wrapper owns look-and-feel; extend the copied source if you need base knobs.

</div>
