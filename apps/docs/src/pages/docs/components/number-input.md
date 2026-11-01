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

| Prop                 | Type                                         | Default | Notes                         |
| -------------------- | -------------------------------------------- | ------- | ----------------------------- |
| `value`              | `number \| null`                             | —       | Controlled value              |
| `defaultValue`       | `number \| null`                             | —       |                               |
| `min`                | `number \| null`                             | —       |                               |
| `max`                | `number \| null`                             | —       |                               |
| `step`               | `number`                                     | —       |                               |
| `disabled`           | `boolean`                                    | —       |                               |
| `readonly`           | `boolean`                                    | —       |                               |
| `placeholder`        | `string \| null`                             | —       |                               |
| `accessibilityLabel` | `string \| null`                             | —       |                               |
| `controlsRight`      | `boolean`                                    | `true`  | Place ± controls on the right |
| `prefix`             | `JSX.Element`                                | —       |                               |
| `suffix`             | `JSX.Element`                                | —       |                               |
| `onChange`           | `(event: { value: number \| null }) => void` | —       |                               |
| `onSubmit`           | `(event: { value: number \| null }) => void` | —       |                               |

## Differences

nsh-only — no shadcn/Radix counterpart in the usual registry set. Closest shadcn pattern is a plain `Input` with `type="number"`; this package wraps `nsh/base` NumberInput with stepper buttons, `min` / `max` / `step`, and `prefix` / `suffix` slots.

## Not forwarded

From `nsh/base` NumberInput: style hooks (`style`, `inputStyle`, `decrementButtonStyle`, `incrementButtonStyle`, `controlsStyle`, …) and the decrement/increment button elements. The wrapper owns chrome, defaults `controlsRight` to `true`, and supplies − / + glyphs. Extend the copied source if you need base knobs.
