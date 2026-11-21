---
title: Number Input
description: A sunk number field with − / + or stacked chevron steppers.
component: true
demo: number-input
---

## Installation

```npm
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

### A rolling figure

The field draws its own glyphs, and the caret lives in them, so the digits inside the field do not roll. `Roll` (`@/lib/ui/motion`, the `motion` registry item, which `input` installs) is the figure beside it — upstream's ticker. It rolls on the theme's `control` spring. The first value is already there. Less motion replaces it in place.

```tsx
import { Roll } from "@/lib/ui/motion";

<Roll value={total()} style={{ fontVariant: ["tabular-nums"] }}>
  {money(total())}
</Roll>;
```

## API

Every prop of [`nsh/base` NumberInput](https://nsh.dev/elements/number-input) passes through. `class`, `inputStyle` and the step props go over the look's.

| Part          | Props                                           | Description                                         |
| ------------- | ----------------------------------------------- | --------------------------------------------------- |
| `NumberInput` | `steps` (`"split" \| "pair"`, default `"pair"`) | Every prop of `nsh/base` NumberInput passes through |
