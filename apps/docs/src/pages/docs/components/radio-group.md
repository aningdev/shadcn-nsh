---
layout: ../../../layouts/Docs.astro
title: Radio Group
description: Styled radio group wrapping nsh/base RadioGroup.
component: true
demo: radio-group
---

Styled radio list on `nsh/base` RadioGroup / Radio. The group is a layout shell — each `Radio` owns its `checked` / `onChange`.

## Install

```sh
shadcn-nsh add radio-group
# monorepo:
shadcn-nsh add radio-group -c apps/web
```

## Usage

```tsx
import { Radio, RadioGroup } from "@workspace/ui/components/ui/radio-group";
import { Text } from "nsh";

<RadioGroup>
  <Radio checked={value() === "a"} onChange={({ checked }) => checked && setValue("a")}>
    <Text>Option A</Text>
  </Radio>
  <Radio checked={value() === "b"} onChange={({ checked }) => checked && setValue("b")}>
    <Text>Option B</Text>
  </Radio>
</RadioGroup>;
```

## Composition

```
RadioGroup
└─ Radio*
   ├─ (built-in circle indicator)
   └─ children (label)
```

## Examples

### Controlled selection

```tsx
const [radio, setRadio] = createSignal("a");

<RadioGroup>
  <Radio checked={radio() === "a"} onChange={({ checked: v }) => v && setRadio("a")}>
    <Text>Option A</Text>
  </Radio>
  <Radio checked={radio() === "b"} onChange={({ checked: v }) => v && setRadio("b")}>
    <Text>Option B</Text>
  </Radio>
</RadioGroup>;
```

### Disabled option

```tsx
<Radio disabled checked={false}>
  <Text>Unavailable</Text>
</Radio>
```

### Group gap override

```tsx
<RadioGroup style={{ gap: 16 }}>
  <Radio checked onChange={() => {}}>
    <Text>Spaced</Text>
  </Radio>
</RadioGroup>
```

## API

### `RadioGroup`

| Prop       | Type          | Default | Notes                         |
| ---------- | ------------- | ------- | ----------------------------- |
| `children` | `JSX.Element` | —       | Usually `Radio` children      |
| `style`    | `object`      | —       | Merged after default `gap: 8` |

### `Radio`

| Prop                 | Type                                    | Default | Notes         |
| -------------------- | --------------------------------------- | ------- | ------------- |
| `checked`            | `boolean`                               | —       |               |
| `disabled`           | `boolean`                               | —       |               |
| `accessibilityLabel` | `string \| null`                        | —       |               |
| `children`           | `JSX.Element`                           | —       | Label content |
| `onChange`           | `(event: { checked: boolean }) => void` | —       |               |

## Differences

| Topic      | shadcn                                 | This package                                            |
| ---------- | -------------------------------------- | ------------------------------------------------------- |
| Value API  | `RadioGroup` `value` / `onValueChange` | no group value — each `Radio` is `checked` / `onChange` |
| Item API   | `RadioGroupItem` + external `Label`    | `Radio` with built-in indicator + label `children`      |
| Change API | string value on the group              | `onChange({ checked })` per radio                       |
| Parts      | Root / Item                            | `RadioGroup` + `Radio`                                  |

## Not forwarded

From `nsh/base` Radio: `focusStyle` and row `style` (wrapper owns focus ring and layout). The circle indicator is composed as children `View`s, not Base `indicator` / `indicatorStyle` props. `RadioGroup` only merges optional caller `style` onto a default gap.
