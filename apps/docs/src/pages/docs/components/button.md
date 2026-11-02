---
layout: ../../../layouts/Docs.astro
title: Button
description: Styled button wrapping nsh/base Button — variants and sizes on theme tokens.
component: true
demo: button
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, disabled / selected, keyboard focus, and the button role for screen readers — unstyled on every platform. This package is the styled layer on top: brand variants, sizes, and theme tokens, the same role a community library plays above `nsh/base`. [`Button`](https://nsh.dev/elements/button) is a press target whose look comes from those tokens; behavior stays on base.

## Install

```bash
npx shadcn-nsh@latest add button
bunx shadcn-nsh@latest add button
pnpm dlx shadcn-nsh@latest add button
yarn dlx shadcn-nsh@latest add button
```

Monorepo (point at the app that owns `components.json`):

```bash
bunx shadcn-nsh@latest add button -c apps/web
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
<Button variant="link">Link</Button>
```

### Size

```tsx
<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon" accessibilityLabel="Add">
  <Text>+</Text>
</Button>
```

### Disabled

```tsx
<Button disabled>Disabled</Button>
```

## API

### Variants

| `variant`     | Look                                   |
| ------------- | -------------------------------------- |
| `default`     | Primary fill                           |
| `secondary`   | Secondary fill                         |
| `outline`     | Border, transparent fill               |
| `destructive` | Destructive fill                       |
| `ghost`       | No border/fill                         |
| `link`        | Primary text, underline (still Button) |

### Sizes

| `size`    | Notes                       |
| --------- | --------------------------- |
| `default` | Text button, default height |
| `xs`      | Compact text                |
| `sm`      | Small text                  |
| `lg`      | Large text                  |
| `icon`    | Square icon hit target      |
| `icon-xs` | Compact square              |
| `icon-sm` | Small square                |
| `icon-lg` | Large square                |

### Props

| Prop                 | Type                    | Default     | Notes                                                  |
| -------------------- | ----------------------- | ----------- | ------------------------------------------------------ |
| `children`           | `string \| JSX.Element` | —           | Arbitrary content; strings get a themed `Text` wrapper |
| `variant`            | `ButtonVariant`         | `"default"` | See Variants                                           |
| `size`               | `ButtonSize`            | `"default"` | See Sizes                                              |
| `disabled`           | `boolean`               | —           | Forwarded to base                                      |
| `selected`           | `boolean`               | —           | Forwarded; wrapper applies `selectedStyle`             |
| `accessibilityLabel` | `string \| null`        | —           | Forwarded; defaults to string `children` when omitted  |
| `role`               | `string \| null`        | —           | Forwarded (base default `"button"`)                    |
| `onPress`            | `() => void`            | —           |                                                        |

### Events

| Event     | Notes                                       |
| --------- | ------------------------------------------- |
| `onPress` | Tap / click / keyboard activate (from base) |

`buttonVariants({ variant, size })` returns token-backed `style` / `label` / hover·active·selected looks for reuse outside the component.

## Differences

| Topic           | shadcn (`bases/base`)       | This package                                                         |
| --------------- | --------------------------- | -------------------------------------------------------------------- |
| Press event     | DOM `onClick`               | `onPress`                                                            |
| Children        | arbitrary nodes / `asChild` | `string \| JSX.Element`; no `asChild`                                |
| Link affordance | `variant="link"` on Button  | same `variant="link"` (still `nsh/base` Button; LinkButton deferred) |
| Class hooks     | `className` / CVA           | theme tokens + `buttonVariants` style helper                         |
| Size matrix     | `default`…`icon-lg`         | same size names; token sizes approximate, not CSS-pixel locked       |

## Not forwarded

From `nsh/base` Button: `onPressDown` / `onPressUp`, and style hooks (`style` / `hoverStyle` / `activeStyle` / `focusStyle` / `selectedStyle` / `disabledStyle`, `class`). The wrapper owns look-and-feel. Extend the copied source if you need those knobs.
