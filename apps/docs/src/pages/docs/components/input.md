---
layout: ../../../layouts/Docs.astro
title: Input
description: Styled text input wrapping nsh/base Input.
component: true
demo: input
---

Styled text field on `nsh/base` Input. Event payloads use `{ value }` — not DOM `event.target.value`.

## Install

```sh
shadcn-nsh add input
# monorepo:
shadcn-nsh add input -c apps/web
```

## Usage

```tsx
import { Input } from "@workspace/ui/components/ui/input";

<Input
  placeholder="Your name"
  value={name()}
  onChange={({ value }) => setName(value)}
/>
```

## Examples

### Controlled

```tsx
const [value, setValue] = createSignal("");

<Input
  placeholder="Your name"
  value={value()}
  onChange={({ value: v }) => setValue(v)}
/>
```

### Multiline / masked

```tsx
<Input multiline placeholder="Notes" />
<Input masked placeholder="Password" />
```

### Disabled

```tsx
<Input placeholder="Disabled" disabled />
```

## API

| Prop                 | Type                                      | Default | Notes                                      |
| -------------------- | ----------------------------------------- | ------- | ------------------------------------------ |
| `value`              | `string`                                  | —       | Controlled value                           |
| `defaultValue`       | `string`                                  | —       | Uncontrolled initial                       |
| `placeholder`        | `string`                                  | —       |                                            |
| `disabled`           | `boolean`                                 | —       |                                            |
| `masked`             | `boolean`                                 | —       | Password-style masking                     |
| `multiline`          | `boolean`                                 | —       | Taller field + vertical padding            |
| `maxLength`          | `number`                                  | —       |                                            |
| `accessibilityLabel` | `string`                                  | —       |                                            |
| `style`              | `StyleProp<InputStyle>`                   | —       | Merged after the wrapper’s base styles     |
| `onChange`           | `(event: { value: string }) => void`      | —       |                                            |
| `onSubmit`           | `() => void`                              | —       |                                            |
| `onFocus`            | `() => void`                              | —       |                                            |
| `onBlur`             | `() => void`                              | —       |                                            |

## Differences

| Topic       | shadcn                                   | This package                                           |
| ----------- | ---------------------------------------- | ------------------------------------------------------ |
| Change API  | DOM `onChange` / `onChange(e)`           | `onChange({ value })`                                  |
| Types       | native `<input>` attributes              | NSH field props (`masked`, `multiline`, …)             |
| Styling     | `className`                              | locked chrome + optional merged `style`                |
| Variants    | often size / file input variants         | none — fixed control height (taller when `multiline`)  |

## Not forwarded

From `nsh/base` Input: `focusStyle` (wrapper applies `focusRing()`). Base field chrome is always applied; caller `style` is the only style hook merged on top.
