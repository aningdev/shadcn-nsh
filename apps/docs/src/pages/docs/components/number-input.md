---
layout: ../../../layouts/Docs.astro
title: Number Input
description: Styled number input wrapping nsh/base NumberInput.
component: true
demo: number-input
---

Styled numeric field on `nsh/base` NumberInput with built-in − / + controls. nsh-only — not part of the shadcn/Radix set.

## Install

```sh
shadcn-nsh add number-input
# monorepo:
shadcn-nsh add number-input -c apps/web
```

## Usage

```tsx
import { NumberInput } from "@workspace/ui/components/ui/number-input";

<NumberInput value={1} min={0} max={99} step={1} onChange={(e) => console.log(e.value)} />;
```

## Examples

### Controlled

```tsx
const [n, setN] = createSignal<number | null>(1);

<NumberInput value={n()} min={0} max={99} onChange={(e) => setN(e.value)} />;
```

### Disabled / readonly

```tsx
<NumberInput value={3} disabled />
<NumberInput value={5} readonly />
```

### Prefix / suffix

```tsx
import { Text } from "nsh";

<NumberInput value={10} prefix={<Text>$</Text>} suffix={<Text>USD</Text>} onChange={(e) => {}} />;
```

## API

| Prop                 | Type                                         | Default | Notes                                                                                     |
| -------------------- | -------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `value`              | `number \| null`                             | —       | Controlled value                                                                          |
| `defaultValue`       | `number \| null`                             | —       |                                                                                           |
| `min`                | `number \| null`                             | —       |                                                                                           |
| `max`                | `number \| null`                             | —       |                                                                                           |
| `step`               | `number`                                     | —       |                                                                                           |
| `invalid`            | `boolean`                                    | —       | Danger edge, including focus. This wrapper's; base has no such flag                       |
| `disabled`           | `boolean`                                    | —       |                                                                                           |
| `readonly`           | `boolean`                                    | —       |                                                                                           |
| `placeholder`        | `string \| null`                             | —       |                                                                                           |
| `accessibilityLabel` | `string \| null`                             | —       |                                                                                           |
| `controlsRight`      | `boolean`                                    | `true`  | Chevrons at the end. `false` splits − / + around the field. Base itself defaults to split |
| `prefix`             | `JSX.Element`                                | —       |                                                                                           |
| `suffix`             | `JSX.Element`                                | —       |                                                                                           |
| `onChange`           | `(event: { value: number \| null }) => void` | —       |                                                                                           |
| `onSubmit`           | `(event: { value: number \| null }) => void` | —       |                                                                                           |

## Differences

nsh-only — no shadcn/Radix counterpart in the usual registry set. Closest shadcn pattern is a plain `Input` with `type="number"`; this package wraps `nsh/base` NumberInput with stepper buttons, `min` / `max` / `step`, and `prefix` / `suffix` slots.

| Topic    | shadcn                | This package                                                                       |
| -------- | --------------------- | ---------------------------------------------------------------------------------- |
| Root     | `Input type="number"` | `nsh/base` `NumberInput` + theme tokens                                            |
| Steppers | none                  | chevrons at the end (`controlsRight`, the default) or − / + split around the field |
| Focus    | browser outline       | 2-point edge on the well while focus is inside it                                  |
| Density  | one size              | 32 high with a pointer, 44 on a touch screen (minimums)                            |
| Invalid  | `aria-invalid`        | `invalid` paints the well's edge in the danger tone                                |

## Not forwarded

None — all `nsh/base` NumberInput props are forwarded. The wrapper applies the well, defaults `controlsRight` to `true`, and supplies text glyphs (▲ / ▼, or − / +) when the button elements are omitted. Consumer styles win per key.
