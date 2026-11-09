---
layout: ../../../layouts/Docs.astro
title: Button
description: Styled button wrapping nsh/base Button — variants and sizes on theme tokens; full base prop pass-through.
component: true
demo: button
demoHeight: 420
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, disabled / selected, keyboard focus, and the button role for screen readers — unstyled on every platform. This package is the styled layer on top: brand variants, sizes, theme tokens, and surface `finish` depth, the same role a community library plays above `nsh/base`. [`Button`](https://nsh.dev/elements/button) is a press target whose look comes from those tokens; behavior and style hooks stay on base and are forwarded. Do not put a link look on Button (`variant="link"` is omitted); use a separate Link when the store CLI exports it.

## Install

```npx tabs
npx shadcn-nsh@latest add button
```

```bunx tabs
bunx shadcn-nsh@latest add button
```

```pnx tabs
pnx shadcn-nsh@latest add button
```

```yarn tabs
yarn dlx shadcn-nsh@latest add button
```

## Usage

```tsx
import { Button } from "@workspace/ui/components/ui/button";

<Button onPress={() => {}}>Default</Button>;
```

## Variants

Primary actions, quiet secondary work, outline / ghost chrome, and destructive.

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

## Size

Text sizes and square icon targets (same names as shadcn; heights are theme points, not CSS-pixel locked).

```tsx
<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

## Icon

Icon-only controls: use `size="icon"` (or `icon-xs` / `icon-sm` / `icon-lg`) and set `accessibilityLabel`.

```tsx
<Button size="icon" accessibilityLabel="Add">
  <Text>+</Text>
</Button>
```

## With Icon

Compose icon + label as children — there is no `icon` prop.

```tsx
<Button>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    <Text>+</Text>
    <Text>New project</Text>
  </View>
</Button>
```

## Loading

Show in-flight work by composing children and setting `disabled` so presses stop. This dims via `disabledStyle` (unlike Gallery’s `busy`, which stays full opacity).

```tsx
const saving = signal(false);

<Button
  disabled={saving()}
  onPress={() => {
    saving.set(true);
    /* …then saving.set(false) */
  }}
>
  <Text>{() => (saving() ? "Saving…" : "Save")}</Text>
</Button>;
```

## Selected

Use base `selected` for a pressed-in / current tool look (menu open, format toggled).

```tsx
const on = signal(false);

<Button selected={on()} onPress={() => on.set(!on())} variant="outline">
  Bold
</Button>;
```

## Disabled

Forward `disabled` to base. Pair with copy or a control that explains why when the action is locked.

```tsx
<Button disabled>Disabled</Button>

<Button disabled={!ready()} accessibilityLabel="Publish unavailable until ready">
  Publish
</Button>
```

## Style override

Wrapper defaults from `variant` / `size` / `finish`, then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set.

```tsx
<Button style={{ paddingHorizontal: 24 }} hoverStyle={{ opacity: 0.8 }}>
  Wider
</Button>
```

## As a trigger

Composite overlays keep their own Trigger parts; a styled Button is a valid press child when you compose by hand. See [Menu](/docs/components/menu) and [Dialog](/docs/components/dialog) for the family APIs.

```tsx
<Menu>
  <MenuTrigger>
    <Button variant="outline">Open</Button>
  </MenuTrigger>
  <MenuContent>{/* … */}</MenuContent>
</Menu>
```

## API

### Variants

| `variant`     | Look                                               |
| ------------- | -------------------------------------------------- |
| `default`     | Primary fill + `finish.accent` depth               |
| `secondary`   | Secondary fill + raised / hover / pressed `finish` |
| `outline`     | Border, background fill + light depth              |
| `destructive` | Soft destructive tint + destructive text           |
| `ghost`       | No border/fill; muted hover                        |

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
| `hitSlop`            | `number \| Edges`       | touch 44pt  | Forwarded; wrapper defaults a touch slop off desktop      |
| `class`              | `string`                | —           | Forwarded; concatenated after any wrapper class           |
| `style`              | `StyleProp<ViewStyle>`  | —           | Merged over variant/size defaults (consumer wins per key) |
| `hoverStyle`         | `StyleProp<ViewStyle>`  | —           | Merged over variant defaults                              |
| `activeStyle`        | `StyleProp<ViewStyle>`  | —           | Merged over variant defaults (includes press sink)        |
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

`buttonVariants({ variant, size })` returns token-backed `style` / `label` / hover·active·selected·disabled looks (and default `hitSlop`) for Button reuse.

## Differences

| Topic           | shadcn (`bases/base`)      | This package                                                                                  |
| --------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| Press event     | DOM `onClick`              | `onPress` / `onPressDown` / `onPressUp`                                                       |
| Children        | arbitrary nodes / Slot     | `string \| JSX.Element`; no `asChild`                                                         |
| Link affordance | `variant="link"` on Button | **Omitted** — Link is a separate component (needs a store `nsh` that exports `nsh/base` Link) |
| Class hooks     | `className` / CVA          | `class` + theme tokens + `buttonVariants` / `finish`; consumer styles merge over defaults     |
| Size matrix     | `default`…`icon-lg`        | same names; token sizes approximate nova scale, not CSS-pixel locked                          |
| Loading         | often a Spinner slot       | compose children + `disabled` (dims); no Gallery-style undimmed `busy` prop                   |
| Touch target    | CSS / size                 | non-desktop default `hitSlop` toward 44pt                                                     |
| Press motion    | CSS                        | `pressSink` scale on `activeStyle` (honors reduced motion)                                    |

## Not forwarded

None — all `nsh/base` Button props are forwarded. The wrapper only adds `variant` / `size` and merges its token / `finish` defaults under consumer style hooks (`class` concatenates; default `hitSlop` applies when the consumer omits it).
