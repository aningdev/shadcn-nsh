---
layout: ../../../layouts/Docs.astro
title: Button
description: Styled button wrapping nsh/base Button — variants and sizes on theme tokens; full base prop pass-through.
component: true
demo: button
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, disabled / selected, keyboard focus, and the button role for screen readers — unstyled on every platform. This package is the styled layer on top: brand variants, sizes, and theme tokens, the same role a community library plays above `nsh/base`. [`Button`](https://nsh.dev/elements/button) is a press target whose look comes from those tokens; behavior and style hooks stay on base and are forwarded. Do not put a link look on Button (`variant="link"` is omitted); use a separate Link when the store CLI exports it.

## Install

```bash
npx shadcn-nsh@latest add button
bunx shadcn-nsh@latest add button
pnx shadcn-nsh@latest add button
yarn dlx shadcn-nsh@latest add button
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";

<Button onPress={() => {}}>Default</Button>;
```

## Size

```tsx
<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## Variants

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
```

## Disabled

```tsx
<Button disabled>Disabled</Button>
```

## Selected

```tsx
const [on, setOn] = createSignal(false);

<Button selected={on()} onPress={() => setOn(!on())}>
  Bold
</Button>;
```

## Icon

```tsx
<Button size="icon" accessibilityLabel="Add">
  <Text>+</Text>
</Button>
<Button size="icon-xs" accessibilityLabel="Close">
  <Text>×</Text>
</Button>
<Button size="icon-sm" variant="outline" accessibilityLabel="Settings">
  <Text>⚙</Text>
</Button>
<Button size="icon-lg" variant="secondary" accessibilityLabel="More">
  <Text>⋯</Text>
</Button>
```

## With Icon

```tsx
<Button>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    <Text>+</Text>
    <Text>New project</Text>
  </View>
</Button>
```

## Style override

Wrapper defaults from `variant` / `size`, then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set.

```tsx
<Button style={{ paddingHorizontal: 24 }} hoverStyle={{ opacity: 0.8 }}>
  Wider
</Button>
```

## API

### Variants

| `variant`     | Look                                     |
| ------------- | ---------------------------------------- |
| `default`     | Primary fill                             |
| `secondary`   | Secondary fill                           |
| `outline`     | Border, background fill                  |
| `destructive` | Soft destructive tint + destructive text |
| `ghost`       | No border/fill                           |

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

| Prop                 | Type                    | Default     | Notes                                                     |
| -------------------- | ----------------------- | ----------- | --------------------------------------------------------- |
| `children`           | `string \| JSX.Element` | —           | Arbitrary content; strings get a themed `Text` wrapper    |
| `variant`            | `ButtonVariant`         | `"default"` | Theme layer only (no `link`)                              |
| `size`               | `ButtonSize`            | `"default"` | Theme layer                                               |
| `disabled`           | `boolean`               | —           | Forwarded to base                                         |
| `selected`           | `boolean`               | —           | Forwarded                                                 |
| `accessibilityLabel` | `string \| null`        | —           | Forwarded; defaults to string `children` when omitted     |
| `role`               | `AccessibilityRole`     | —           | Forwarded (base default `"button"`)                       |
| `class`              | `string`                | —           | Forwarded; concatenated after any wrapper class           |
| `style`              | `StyleProp<ViewStyle>`  | —           | Merged over variant/size defaults (consumer wins per key) |
| `hoverStyle`         | `StyleProp<ViewStyle>`  | —           | Merged over variant defaults                              |
| `activeStyle`        | `StyleProp<ViewStyle>`  | —           | Merged over variant defaults                              |
| `focusStyle`         | `StyleProp<ViewStyle>`  | —           | Merged over theme focus ring                              |
| `selectedStyle`      | `StyleProp<ViewStyle>`  | —           | Merged over variant defaults                              |
| `disabledStyle`      | `StyleProp<ViewStyle>`  | —           | Merged over wrapper `{ opacity: 0.5 }`                    |
| `classList`          | object                  | —           | Forwarded (`ComponentHostProps`)                          |
| `testID`             | string                  | —           | Forwarded                                                 |
| `tooltip`            | string                  | —           | Forwarded                                                 |
| `onLayout`           | function                | —           | Forwarded                                                 |
| `ref`                | ref                     | —           | Forwarded                                                 |

### Events

| Event         | Notes                                                          |
| ------------- | -------------------------------------------------------------- |
| `onPress`     | Tap / click / keyboard activate (from base)                    |
| `onPressDown` | Press began (from base); for custom press feedback             |
| `onPressUp`   | Press ended / cancelled (from base); for custom press feedback |

`buttonVariants({ variant, size })` returns token-backed `style` / `label` / hover·active·selected·disabled looks for Button reuse.

## Differences

| Topic           | shadcn (`bases/base`)      | This package                                                                                   |
| --------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| Press event     | DOM `onClick`              | `onPress` / `onPressDown` / `onPressUp`                                                        |
| Children        | arbitrary nodes / Slot     | `string \| JSX.Element`; no `asChild`                                                          |
| Link affordance | `variant="link"` on Button | **Omitted** — Link is a separate component (needs a store `nsh` that exports `nsh/base` Link)  |
| Class hooks     | `className` / CVA          | `class` + theme tokens + `buttonVariants`; consumer `style` / state styles merge over defaults |
| Size matrix     | `default`…`icon-lg`        | same names; token sizes approximate nova scale, not CSS-pixel locked                           |

## Not forwarded

None — all `nsh/base` Button props are forwarded. The wrapper only adds `variant` / `size` and merges its token defaults under consumer style hooks (`class` concatenates).
