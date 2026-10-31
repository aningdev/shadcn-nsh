---
layout: ../../../layouts/Docs.astro
title: OTP Input
description: Styled OTP input wrapping nsh/base OtpInput.
component: true
demo: otp-input
---

Styled one-time-code field on `nsh/base` OtpInput. Fixed cell chrome; you pass `length` and listen for `onChange` / `onComplete`.

## Install

```sh
shadcn-nsh add otp-input
# monorepo:
shadcn-nsh add otp-input -c apps/web
```

## Usage

```tsx
import { OtpInput } from "@workspace/ui/components/ui/otp-input";

<OtpInput
  length={6}
  onChange={(e) => console.log(e.value)}
  onComplete={(e) => console.log("done", e.value)}
/>;
```

## Examples

### Controlled value

```tsx
const [code, setCode] = createSignal("");

<OtpInput length={6} value={code()} onChange={(e) => setCode(e.value)} />
```

### Masked / grouped

```tsx
<OtpInput length={6} groups={2} masked />
```

### Disabled

```tsx
<OtpInput length={4} value="12" disabled />
```

## API

| Prop                 | Type                                     | Default | Notes              |
| -------------------- | ---------------------------------------- | ------- | ------------------ |
| `length`             | `number`                                 | —       | Required cell count |
| `value`              | `string \| null`                         | —       | Controlled value   |
| `defaultValue`       | `string \| null`                         | —       |                    |
| `masked`             | `boolean`                                | —       | Hide digits        |
| `disabled`           | `boolean`                                | —       |                    |
| `groups`             | `number`                                 | —       | Split into groups  |
| `accessibilityLabel` | `string \| null`                         | —       |                    |
| `onChange`           | `(event: { value: string }) => void`     | —       |                    |
| `onComplete`         | `(event: { value: string }) => void`     | —       | Fires when filled  |

## Differences

| Topic       | shadcn                                              | This package                                      |
| ----------- | --------------------------------------------------- | ------------------------------------------------- |
| Parts       | `InputOTP` / `InputOTPGroup` / `InputOTPSlot` / …   | single `OtpInput`                                 |
| Length      | compose N slots                                     | `length` prop                                     |
| Complete    | app-level                                           | `onComplete` on the control                       |
| Class hooks | `className` / CVA                                   | theme tokens + locked cell/caret styles           |

## Not forwarded

From `nsh/base` OtpInput: style hooks (`style`, `groupStyle`, `cellStyle`, `caretStyle`, …). Cell sizing, borders, focus ring, and caret are fixed by this wrapper. Extend the copied source if you need base knobs.
