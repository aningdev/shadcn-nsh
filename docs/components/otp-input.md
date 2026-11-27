# OTP Input (/docs/components/otp-input)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add otp-input
```

## Usage [#usage]

```tsx
import { OtpInput } from "@/components/ui/otp-input";
```

```tsx
<OtpInput length={6} value={code()} onChange={({ value }) => code.set(value)} />
```

## Examples [#examples]

### Tone [#tone]

```tsx
<OtpInput length={1} value="7" tone="neutral" />
<OtpInput length={1} value="7" tone="accent" />
<OtpInput length={1} value="7" tone="info" />
<OtpInput length={1} value="7" tone="warn" />
<OtpInput length={1} value="7" tone="destructive" />
<OtpInput length={1} value="7" tone="up" />
<OtpInput length={1} value="7" tone="down" />
```

### Verdict [#verdict]

A verdict tints every cell of the whole code.

```tsx
<OtpInput length={6} value="123456" tone="up" />
<OtpInput length={6} value="000000" tone="destructive" />
```

### A verdict that changes [#a-verdict-that-changes]

```tsx
<OtpInput length={6} tone={() => verdict()} />
```

## API [#api]

Every prop of [`nsh/base` OtpInput](https://nsh.dev/elements/otp-input) passes through. Cell and caret props go over the look's.

| Part       | Props                                                                                                     | Description                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `OtpInput` | `cells` (`string`, default `otpCells`), `tone` (`Tone \| (() => Tone \| undefined)`), `reject` (`number`) | Cell and caret props go over the look's. `reject` shakes the cells each time it becomes a new number; less motion plays nothing |