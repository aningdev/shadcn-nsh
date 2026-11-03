---
layout: ../../../layouts/Docs.astro
title: Switch
description: Styled switch wrapping nsh/base Switch — theme tokens + size; full base prop pass-through.
component: true
demo: switch
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, keyboard activation, the disabled state, and the switch role and value for screen readers — unstyled on every platform. This package is the styled layer on top: track / thumb chrome, `size`, and theme tokens, the same role a community library plays above `nsh/base`. [`Switch`](https://nsh.dev/elements/switch) is an on / off control whose look comes from those tokens; behavior and style hooks stay on base and are forwarded. shadcn `bases/base` Switch adds `size` (`sm` / `default`); this wrapper mirrors that and otherwise adds theme defaults only.

## Install

```npx tabs
npx shadcn-nsh@latest add switch
```

```bunx tabs
bunx shadcn-nsh@latest add switch
```

```pnx tabs
pnx shadcn-nsh@latest add switch
```

```yarn tabs
yarn dlx shadcn-nsh@latest add switch
```

## Usage

```tsx
import { Switch } from "@workspace/ui/components/ui/switch";
import { Text } from "nsh";

<Switch checked onChange={(checked) => console.log(checked)}>
  <Text>Notifications</Text>
</Switch>;
```

## Controlled

```tsx
const [on, setOn] = createSignal(true);

<Switch checked={on()} onChange={(v) => setOn(v)}>
  <Text>Notifications</Text>
</Switch>;
```

## Size

```tsx
<Switch size="sm" checked={on()} onChange={setOn}>
  <Text>Small</Text>
</Switch>
<Switch size="default" checked={on()} onChange={setOn}>
  <Text>Default</Text>
</Switch>
```

## Disabled

```tsx
<Switch disabled checked>
  <Text>Disabled</Text>
</Switch>
```

## Style override

Wrapper token chrome and default thumb travel class, then consumer styles shallow-merge on top (consumer wins per key). `class` / `trackClass` / `thumbClass` concatenate when both are set.

```tsx
<Switch
  checked={on()}
  onChange={setOn}
  style={{ gap: 12 }}
  trackStyle={{ width: 44 }}
  thumbClass="checked:translate-x-5"
  focusStyle={{ borderColor: colors.primary }}
>
  <Text>Larger track</Text>
</Switch>
```

## API

### Props

| Prop                 | Type                   | Default     | Notes                                                              |
| -------------------- | ---------------------- | ----------- | ------------------------------------------------------------------ |
| `checked`            | `boolean`              | —           | Controlled value (from base)                                       |
| `disabled`           | `boolean`              | —           | Forwarded; wrapper merges `{ opacity: 0.5 }` under `disabledStyle` |
| `size`               | `"default" \| "sm"`    | `"default"` | Wrapper-only; track / thumb dimensions + thumb travel class        |
| `accessibilityLabel` | `string \| null`       | —           | Forwarded                                                          |
| `children`           | `JSX.Element`          | —           | Label / adjacent content after the track                           |
| `trackClass`         | `string`               | —           | Forwarded; concatenated after any wrapper class                    |
| `trackStyle`         | `StyleProp<ViewStyle>` | —           | Merged over token track chrome (consumer wins per key)             |
| `thumbClass`         | `string`               | —           | Merged after wrapper `checked:translate-x-*` travel class          |
| `thumbStyle`         | `StyleProp<ViewStyle>` | —           | Merged over token thumb chrome                                     |
| `class`              | `string`               | —           | Forwarded; concatenated after any wrapper class                    |
| `style`              | `StyleProp<ViewStyle>` | —           | Merged over row chrome (`flexDirection` / `gap`)                   |
| `hoverStyle`         | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                                  |
| `activeStyle`        | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                                  |
| `focusStyle`         | `StyleProp<ViewStyle>` | —           | Merged over theme focus ring                                       |
| `disabledStyle`      | `StyleProp<ViewStyle>` | —           | Merged over wrapper `{ opacity: 0.5 }`                             |
| `checkedStyle`       | `StyleProp<ViewStyle>` | —           | Forwarded / merge                                                  |
| `classList`          | object                 | —           | Forwarded                                                          |
| `testID`             | string                 | —           | Forwarded                                                          |
| `tooltip`            | string                 | —           | Forwarded                                                          |
| `onLayout`           | function               | —           | Forwarded                                                          |
| `ref`                | ref                    | —           | Forwarded                                                          |

Remaining `SwitchProps` / `ComponentHostProps` from `nsh/base` also pass through.

### Events

| Event      | Notes                                                               |
| ---------- | ------------------------------------------------------------------- |
| `onChange` | `(checked: boolean) => void` — store CLI `nsh` 0.3.0 base signature |

### Sizes

| Size      | Notes                                   |
| --------- | --------------------------------------- |
| `default` | Track ~36×20, thumb 16, `translate-x-4` |
| `sm`      | Track ~28×16, thumb 12, `translate-x-3` |

## Differences

| Topic        | shadcn (`bases/base`)                      | This package                                                                                    |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Root         | `@base-ui/react/switch` Root + Thumb       | `nsh/base` `Switch` + theme tokens; single export                                               |
| Label        | sibling `Label` / `FieldLabel` + `htmlFor` | put label `Text` in `children`                                                                  |
| Change event | `onCheckedChange`                          | `onChange(checked: boolean)` (store `nsh` 0.3.0; newer nsh website docs may show `{ checked }`) |
| Sizes        | `sm` / `default` via `data-size` + CSS     | same size names; token `trackStyle` / `thumbStyle` + travel `thumbClass`                        |
| Class hooks  | `className` / `cn-switch*`                 | `class` + token `style` / `trackStyle` / `thumbStyle`; consumer styles merge over defaults      |

## Not forwarded

None — all `nsh/base` Switch props are forwarded. The wrapper only applies token track / thumb chrome, a default thumb travel class for `size`, and merges its defaults under consumer style hooks (`class` / `trackClass` / `thumbClass` concatenate).
