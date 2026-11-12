---
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

### Scale

```tsx
<Checkbox scale={0.8}>Small</Checkbox>
<Checkbox>Regular</Checkbox>
<Checkbox scale={1.25}>Large</Checkbox>
```

`scale` times the page's control size (default 1): 0.8 small, 1.25 large.

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

| Prop       | Type                    | Default |
| ---------- | ----------------------- | ------- |
| `scale`    | `number`                | `1`     |
| `round`    | `boolean`               |         |
| `children` | `string \| JSX.Element` |         |
