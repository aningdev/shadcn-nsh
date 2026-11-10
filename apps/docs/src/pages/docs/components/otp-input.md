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

<OtpInput length={6} value={code()} onChange={(e) => setCode(e.value)} />;
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

| Prop                 | Type                                 | Default | Notes                                              |
| -------------------- | ------------------------------------ | ------- | -------------------------------------------------- |
| `length`             | `number`                             | —       | Required cell count                                |
| `value`              | `string \| null`                     | —       | Controlled value                                   |
| `defaultValue`       | `string \| null`                     | —       |                                                    |
| `masked`             | `boolean`                            | —       | Hide digits                                        |
| `invalid`            | `boolean`                            | —       | Danger edge and tint on every cell. This wrapper's |
| `disabled`           | `boolean`                            | —       |                                                    |
| `groups`             | `number`                             | —       | Split into groups                                  |
| `accessibilityLabel` | `string \| null`                     | —       |                                                    |
| `onChange`           | `(event: { value: string }) => void` | —       |                                                    |
| `onComplete`         | `(event: { value: string }) => void` | —       | Fires when filled                                  |

## Differences

| Topic       | shadcn                                            | This package                                                         |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| Parts       | `InputOTP` / `InputOTPGroup` / `InputOTPSlot` / … | single `OtpInput`                                                    |
| Length      | compose N slots                                   | `length` prop                                                        |
| Complete    | app-level                                         | `onComplete` on the control                                          |
| Class hooks | `className` / CVA                                 | theme tokens; consumer `cellStyle` / `cellClass` merge over defaults |
| Density     | one slot size                                     | 36×44 text 18 with a pointer, 44×52 text 20 on a touch screen        |
| Invalid     | `aria-invalid` on the input                       | `invalid` paints every cell in the danger tone                       |

## Not forwarded

None — all `nsh/base` OtpInput props are forwarded. Empty, filled and focused cells are classes (`cellStyle` wins over `cellClass`, so those states stay on the class). `invalid` is a style, so it wins over them. Consumer styles win per key.
