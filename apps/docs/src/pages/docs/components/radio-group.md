---
layout: ../../../layouts/Docs.astro
title: Radio Group
description: Styled radio group wrapping nsh/base RadioGroup / Radio — theme tokens + default circle; full base prop pass-through.
component: true
demo: radio-group
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns presses, keyboard activation (including arrow keys in a group), the disabled state, and the radio / radiogroup roles for screen readers — unstyled on every platform. This package is the styled layer on top: a default circle indicator, row / group chrome, and theme tokens, the same role a community library plays above `nsh/base`. [`Radio`](https://nsh.dev/elements/radio) is one option of a set the user picks exactly one of; the group holds no value — each item is told `checked` and reports `onChange`. shadcn `bases/base` RadioGroup has no `variant` / `size`; this wrapper adds theme defaults only.

## Install

```npx tabs
npx shadcn-nsh@latest add radio-group
```

```bunx tabs
bunx shadcn-nsh@latest add radio-group
```

```pnx tabs
pnx shadcn-nsh@latest add radio-group
```

```yarn tabs
yarn dlx shadcn-nsh@latest add radio-group
```

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/ui/radio-group";
import { Text } from "nsh";

<RadioGroup>
  <RadioGroupItem checked={value() === "a"} onChange={() => setValue("a")}>
    <Text>Option A</Text>
  </RadioGroupItem>
  <RadioGroupItem checked={value() === "b"} onChange={() => setValue("b")}>
    <Text>Option B</Text>
  </RadioGroupItem>
</RadioGroup>;
```

## Composition

```
RadioGroup
└─ RadioGroupItem* (alias: Radio)
   ├─ (default circle indicator)
   └─ children (label)
```

## Controlled

```tsx
const [plan, setPlan] = createSignal("a");

<RadioGroup>
  <RadioGroupItem checked={plan() === "a"} onChange={() => setPlan("a")}>
    <Text>Option A</Text>
  </RadioGroupItem>
  <RadioGroupItem checked={plan() === "b"} onChange={() => setPlan("b")}>
    <Text>Option B</Text>
  </RadioGroupItem>
</RadioGroup>;
```

## Disabled

```tsx
<RadioGroupItem disabled checked={false}>
  <Text>Unavailable</Text>
</RadioGroupItem>
```

## Orientation

```tsx
<RadioGroup style={{ flexDirection: "row", gap: 16 }}>
  <RadioGroupItem checked={plan() === "a"} onChange={() => setPlan("a")}>
    <Text>A</Text>
  </RadioGroupItem>
  <RadioGroupItem checked={plan() === "b"} onChange={() => setPlan("b")}>
    <Text>B</Text>
  </RadioGroupItem>
</RadioGroup>
```

## Style override

Wrapper token chrome and default circle, then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set. Label content stays in `children`; the circle is composed ahead of it (base has no `indicator` prop).

```tsx
<RadioGroup style={{ gap: 16 }}>
  <RadioGroupItem
    checked={plan() === "a"}
    onChange={() => setPlan("a")}
    style={{ gap: 12 }}
    focusStyle={{ borderColor: colors.primary }}
  >
    <Text>Spaced</Text>
  </RadioGroupItem>
</RadioGroup>
```

## API

### `RadioGroup` Props

| Prop        | Type                   | Default | Notes                                            |
| ----------- | ---------------------- | ------- | ------------------------------------------------ |
| `children`  | `JSX.Element`          | —       | Usually `RadioGroupItem` / `Radio` children      |
| `class`     | `string`               | —       | Forwarded; concatenated after any wrapper class  |
| `style`     | `StyleProp<ViewStyle>` | —       | Merged over default `{ gap: 8 }` (consumer wins) |
| `classList` | object                 | —       | Forwarded                                        |
| `testID`    | string                 | —       | Forwarded                                        |
| `tooltip`   | string                 | —       | Forwarded                                        |
| `onLayout`  | function               | —       | Forwarded                                        |
| `ref`       | ref                    | —       | Forwarded                                        |

Remaining `RadioGroupProps` / `ComponentHostProps` from `nsh/base` also pass through.

### `RadioGroupItem` / `Radio` Props

| Prop                 | Type                   | Default | Notes                                                              |
| -------------------- | ---------------------- | ------- | ------------------------------------------------------------------ |
| `checked`            | `boolean`              | —       | Controlled value (from base); app owns exclusive selection         |
| `disabled`           | `boolean`              | —       | Forwarded; wrapper merges `{ opacity: 0.5 }` under `disabledStyle` |
| `accessibilityLabel` | `string \| null`       | —       | Forwarded                                                          |
| `children`           | `JSX.Element`          | —       | Label / adjacent content after the default circle                  |
| `class`              | `string`               | —       | Forwarded; concatenated after any wrapper class                    |
| `style`              | `StyleProp<ViewStyle>` | —       | Merged over row chrome (`flexDirection` / `gap`)                   |
| `hoverStyle`         | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `activeStyle`        | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `focusStyle`         | `StyleProp<ViewStyle>` | —       | Merged over theme focus ring                                       |
| `disabledStyle`      | `StyleProp<ViewStyle>` | —       | Merged over wrapper `{ opacity: 0.5 }`                             |
| `checkedStyle`       | `StyleProp<ViewStyle>` | —       | Forwarded / merge                                                  |
| `classList`          | object                 | —       | Forwarded                                                          |
| `testID`             | string                 | —       | Forwarded                                                          |
| `tooltip`            | string                 | —       | Forwarded                                                          |
| `onLayout`           | function               | —       | Forwarded                                                          |
| `ref`                | ref                    | —       | Forwarded                                                          |

Remaining `RadioProps` / `ComponentHostProps` from `nsh/base` also pass through. `Radio` is an alias of `RadioGroupItem`.

### Events

| Event      | Notes                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `onChange` | `(checked: boolean) => void` on the item — store CLI `nsh` 0.3.0; fires with `true` when asking to be checked |

## Differences

| Topic        | shadcn (`bases/base`)                       | This package                                                                                             |
| ------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Value API    | `RadioGroup` `value` / `onValueChange`      | no group value — each item is `checked` / `onChange` (nsh/base model)                                    |
| Parts        | `RadioGroup` / `RadioGroupItem` + Indicator | same part names; `Radio` alias; default circle composed as children (base has no Indicator slot)         |
| Label        | sibling `Label` / `FieldLabel` + `htmlFor`  | put label `Text` in `children`                                                                           |
| Change event | string value on the group                   | `onChange(checked: boolean)` per item (store `nsh` 0.3.0; newer nsh website docs may show `{ checked }`) |
| Variants     | none on `bases/base` RadioGroup             | none — token chrome + default circle only                                                                |
| Class hooks  | `className` / `cn-radio-group*`             | `class` + token `style`; consumer styles merge over defaults                                             |

## Not forwarded

None — all `nsh/base` RadioGroup / Radio props are forwarded. The wrapper only applies token chrome, a default circle composed ahead of label `children` (base has no `indicator` prop), and merges its defaults under consumer style hooks (`class` concatenates).
