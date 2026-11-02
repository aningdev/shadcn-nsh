---
layout: ../../../layouts/Docs.astro
title: Input
description: Styled text input wrapping nsh/base Input — theme tokens; full base prop pass-through.
component: true
demo: input
---

[`nsh/base`](https://nsh.dev/modules/nsh-base) owns text value, keyboard, focus, selection, paste, and the field role for screen readers — unstyled on every platform. This package is the styled layer on top: control chrome and theme tokens, the same role a community library plays above `nsh/base`. [`Input`](https://nsh.dev/elements/input) is a native text field whose look comes from those tokens; behavior and style hooks stay on base and are forwarded. shadcn `bases/base` Input has no `variant` / `size`; this wrapper adds theme defaults only.

## Install

```bash
npx shadcn-nsh@latest add input
bunx shadcn-nsh@latest add input
pnx shadcn-nsh@latest add input
yarn dlx shadcn-nsh@latest add input
```

## Usage

```tsx
import { Input } from "@workspace/ui/components/ui/input";

<Input placeholder="Your name" value={name()} onChange={(value) => setName(value)} />;
```

## Controlled

```tsx
const [value, setValue] = createSignal("");

<Input placeholder="Your name" value={value()} onChange={(v) => setValue(v)} />;
```

## Multiline

```tsx
<Input multiline placeholder="Notes" />
```

## Masked

```tsx
<Input masked placeholder="Password" autoComplete="current-password" />
```

## Disabled

```tsx
<Input placeholder="Disabled" disabled />
```

## Keyboard

Map DOM `type` ideas to nsh field props (`masked`, `keyboardType`, `autoComplete`) — there is no HTML `type` attribute.

```tsx
<Input placeholder="Email" keyboardType="email-address" autoComplete="email" />
<Input placeholder="Phone" keyboardType="phone-pad" autoComplete="tel" />
<Input placeholder="https://example.com" keyboardType="url" />
```

## Style override

Wrapper token chrome, then consumer styles shallow-merge on top (consumer wins per key). `class` concatenates when both are set.

```tsx
<Input
  placeholder="Search"
  style={{ paddingHorizontal: 16 }}
  focusStyle={{ borderColor: colors.primary }}
/>
```

## API

### Props

| Prop                    | Type                              | Default | Notes                                                              |
| ----------------------- | --------------------------------- | ------- | ------------------------------------------------------------------ |
| `value`                 | `string`                          | —       | Controlled text (from base)                                        |
| `defaultValue`          | `string`                          | —       | Uncontrolled initial (from base)                                   |
| `placeholder`           | `string`                          | —       | Forwarded                                                          |
| `disabled`              | `boolean`                         | —       | Forwarded; wrapper merges `{ opacity: 0.5 }` under `disabledStyle` |
| `readonly`              | `boolean`                         | —       | Forwarded                                                          |
| `masked`                | `boolean`                         | —       | Password-style masking (from base)                                 |
| `multiline`             | `boolean`                         | —       | Forwarded; wrapper uses taller min-height + vertical padding       |
| `maxLength`             | `number`                          | —       | Forwarded                                                          |
| `keyboardType`          | `KeyboardType`                    | —       | Forwarded                                                          |
| `returnKeyType`         | `ReturnKeyType`                   | —       | Forwarded                                                          |
| `autoCapitalize`        | `AutoCapitalize`                  | —       | Forwarded                                                          |
| `autoCorrect`           | `boolean`                         | —       | Forwarded                                                          |
| `autoComplete`          | `AutoComplete \| TextContentType` | —       | Forwarded                                                          |
| `submitBehavior`        | `SubmitBehavior`                  | —       | Forwarded                                                          |
| `pasteBehavior`         | `PasteBehavior`                   | —       | Forwarded                                                          |
| `autoFocus`             | `boolean`                         | —       | Forwarded                                                          |
| `caret`                 | `boolean`                         | —       | Forwarded                                                          |
| `selectedRange`         | `{ start; end? }`                 | —       | Forwarded                                                          |
| `allowFontScaling`      | `boolean`                         | —       | Forwarded                                                          |
| `maxFontSizeMultiplier` | `number`                          | —       | Forwarded                                                          |
| `accessibilityLabel`    | `string`                          | —       | Forwarded (`HostProps`)                                            |
| `ios`                   | `IOSInputProps`                   | —       | Forwarded                                                          |
| `class`                 | `string`                          | —       | Forwarded; concatenated after any wrapper class                    |
| `style`                 | `StyleProp<TextStyle>`            | —       | Merged over token chrome (consumer wins per key)                   |
| `hoverStyle`            | `StyleProp<ViewStyle>`            | —       | Forwarded / merge                                                  |
| `activeStyle`           | `StyleProp<ViewStyle>`            | —       | Forwarded / merge                                                  |
| `focusStyle`            | `StyleProp<ViewStyle>`            | —       | Merged over theme focus ring                                       |
| `disabledStyle`         | `StyleProp<ViewStyle>`            | —       | Merged over wrapper `{ opacity: 0.5 }`                             |
| `classList`             | object                            | —       | Forwarded                                                          |
| `testID`                | string                            | —       | Forwarded                                                          |
| `tooltip`               | string                            | —       | Forwarded                                                          |
| `onLayout`              | function                          | —       | Forwarded                                                          |
| `ref`                   | ref                               | —       | Forwarded (`focus` / `blur` / `setSelection`)                      |

Remaining `InputProps` / `CommonProps` from `nsh/base` also pass through.

### Events

| Event                 | Notes                                                           |
| --------------------- | --------------------------------------------------------------- |
| `onChange`            | `(text: string) => void` — store CLI `nsh` 0.3.0 base signature |
| `onSubmit`            | `(e: { text: string }) => void` when return submits             |
| `onFocus` / `onBlur`  | Focus gained / lost                                             |
| `onSelectionChange`   | `{ start, end }`                                                |
| `onPaste`             | Paste payload (before insert `onChange`)                        |
| `onCaretMove`         | Caret bounds                                                    |
| `onKeyPress`          | `{ key }` before the text changes                               |
| `onContentSizeChange` | Text size (grow multiline)                                      |
| `onCompositionChange` | IME composition                                                 |

## Differences

| Topic        | shadcn (`bases/base`)                 | This package                                                                              |
| ------------ | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| Root         | `@base-ui/react/input` + `className`  | `nsh/base` `Input` + theme tokens                                                         |
| HTML `type`  | `type="password" \| "email" \| …`     | `masked` / `keyboardType` / `autoComplete` (no DOM `type`)                                |
| Change event | DOM `onChange` / `event.target.value` | `onChange(text: string)` (store `nsh` 0.3.0; newer nsh website docs may show `{ value }`) |
| Variants     | none on `bases/base` Input            | none — token chrome only                                                                  |
| Class hooks  | `className` / `cn-input`              | `class` + token `style`; consumer `style` / state styles merge over defaults              |
| File input   | `type="file"`                         | **Not in base** — omit                                                                    |

## Not forwarded

None — all `nsh/base` Input props are forwarded. The wrapper only applies token chrome and merges its defaults under consumer style hooks (`class` concatenates).
