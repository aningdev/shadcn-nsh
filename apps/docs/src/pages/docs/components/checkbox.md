---
layout: ../../../layouts/Docs.astro
title: Checkbox
description: A sunk box that fills in citrus, with a check or a dash springing in.
component: true
demo: checkbox
---

## Installation

```sh
npx shadcn-nsh@latest add checkbox
```

## Usage

```tsx
import { Checkbox } from "@/components/ui/checkbox";
```

```tsx
<Checkbox checked={on()} onChange={({ checked }) => on.set(checked)}>
  Photos
</Checkbox>
```

## Examples

### Size

```tsx
<Checkbox size="sm">Small</Checkbox>
<Checkbox size="default">Regular</Checkbox>
<Checkbox size="lg">Large</Checkbox>
```

`size` multiplies the page's control size: `sm` 0.8, `default` 1, `lg` 1.25 (`ChoiceSize`).

### Round

```tsx
<Checkbox round checked>
  Round
</Checkbox>
```

### Checked and indeterminate

```tsx
<Checkbox checked={all()} indeterminate={some()} onChange={({ checked }) => selectAll(checked)}>
  Back up everything
</Checkbox>
```

### Disabled

```tsx
<Checkbox checked disabled>
  System settings
</Checkbox>
```

### The look alone

The look is a function, for a checkbox of your own.

```tsx
<Checkbox
  class="group"
  checked={on()}
  {...checkboxLook()}
  indicator={<CheckboxMark mark={on() ? "check" : null} />}
>
  Photos
</Checkbox>
```

## API

Every prop of [`nsh/base` Checkbox](https://nsh.dev/elements/checkbox) passes through. `indicatorClass` and `indicatorStyle` go over the look's. The row is the `group` the box sinks with while pressed.

| Prop       | Type                    | Default     |
| ---------- | ----------------------- | ----------- |
| `size`     | `ChoiceSize`            | `"default"` |
| `round`    | `boolean`               | `false`     |
| `children` | `string \| JSX.Element` |             |

`ChoiceSize` is `"sm" | "default" | "lg"`: 0.8, 1 or 1.25 times the page's control size, shared with `Radio` (`choiceScales` is the table).
