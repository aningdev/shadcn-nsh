---
title: OTP Input
description: One-time code cells that lift out of sunk wells as digits fill in.
component: true
demo: otp-input
---

## Installation

```sh
npx shadcn-nsh@latest add otp-input
```

## Usage

```tsx
import { OtpInput } from "@/components/ui/otp-input";
```

```tsx
<OtpInput length={6} value={code()} onChange={({ value }) => code.set(value)} />
```

## Examples

### Tone

```tsx
<OtpInput length={6} value="123456" tone="up" />
<OtpInput length={6} value="000000" tone="danger" />
```

### The look alone

```tsx
<OtpInput length={6} {...otpCellLook({ tone: () => verdict() })} />
```

## API

Every prop of [`nsh/base` OtpInput](https://nsh.dev/elements/otp-input) passes through. Cell and caret props go over the look's.

| Prop    | Type                                | Default    |
| ------- | ----------------------------------- | ---------- |
| `cells` | `string`                            | `otpCells` |
| `tone`  | `Tone \| (() => Tone \| undefined)` |            |
