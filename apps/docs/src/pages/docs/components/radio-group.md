---
layout: ../../../layouts/Docs.astro
title: Radio Group
description: A sunk ring that fills in citrus, with a dot growing in — alone or as a choice tile.
component: true
demo: radio-group
---

## Installation

```sh
npx shadcn-nsh@latest add radio-group
```

## Usage

```tsx
import { Radio, RadioGroup } from "@/components/ui/radio-group";
```

```tsx
<RadioGroup>
  <Radio checked={plan() === "pro"} onChange={() => plan.set("pro")}>
    Pro
  </Radio>
</RadioGroup>
```

## Examples

### Size

```tsx
<Radio size="sm">Small</Radio>
<Radio size="default">Regular</Radio>
<Radio size="lg">Large</Radio>
```

`size` is `ChoiceSize` (`"sm" | "default" | "lg"`: 0.8, 1 or 1.25 times the page's control size), shared with `Checkbox`.

### Tile

```tsx
<Radio variant="tile" checked={on()} onChange={() => on.set(true)}>
  Option A
</Radio>
```

### Disabled

```tsx
<Radio checked disabled>
  Team
</Radio>
```

### The look alone

```tsx
<Radio class="group" checked={on()} {...choiceTileLook(() => on())}>
  <RadioRing on={on()} />
  Option A
</Radio>
```

## API

Every prop of [`nsh/base` Radio](https://nsh.dev/elements/radio) and [`RadioGroup`](https://nsh.dev/elements/radio-group) passes through. Style props go over the look's. The row is the `group` the ring sinks with while pressed. `RadioGroupItem` is an alias of `Radio`.

| Prop        | Type                    | Default     |
| ----------- | ----------------------- | ----------- |
| `variant`   | `RadioVariant`          | `"default"` |
| `indicator` | `boolean`               | `true`      |
| `size`      | `ChoiceSize`            | `"default"` |
| `children`  | `string \| JSX.Element` |             |

`RadioVariant` is `"default"` (the sunk ring) or `"tile"` (the whole surface is the control, this library's own value).
