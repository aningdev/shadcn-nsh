---
title: Number Input
description: A sunk number field with − / + or stacked chevron steppers.
component: true
demo: number-input
---

## Installation

```sh
npx shadcn-nsh@latest add number-input
```

## Usage

```tsx
import { NumberInput } from "@/components/ui/number-input";
```

```tsx
<NumberInput value={n()} onChange={({ value }) => n.set(value)} min={0} max={10} />
```

## Examples

### Split steppers

```tsx
<NumberInput steps="split" value={n()} onChange={({ value }) => n.set(value)} />
```

### Pair steppers

```tsx
<NumberInput steps="pair" value={n()} onChange={({ value }) => n.set(value)} />
```

Default `pair`: chevrons stacked at the end. `split`: − before the field and + after it.

### The look alone

```tsx
<NumberInput
  class={numberInputClasses.frame}
  inputStyle={numberInputText()}
  {...numberInputSteps("pair", "w-8", 14)}
/>
```

## API

Every prop of [`nsh/base` NumberInput](https://nsh.dev/elements/number-input) passes through. `class`, `inputStyle` and the step props go over the look's.

| Prop    | Type                | Default  |
| ------- | ------------------- | -------- |
| `steps` | `"split" \| "pair"` | `"pair"` |
