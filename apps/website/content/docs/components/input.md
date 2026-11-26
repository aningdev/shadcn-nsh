---
title: Input
description: A text field — sunk, ghost, multiline, masked, or invalid.
component: true
demo: input
---

## Installation

```npm
npx shadcn-nsh@latest add input
```

## Usage

```tsx
import { Input } from "@/components/ui/input";
```

```tsx
<Input value={name()} onChange={({ value }) => name.set(value)} placeholder="Ada Lovelace" />
```

## Examples

### Variant

No fill and no edge until the keys are in it, with the text, the placeholder and the focus ring as they are: a search field, a title that turns into a field. Disabled still dims, and invalid still shows the danger edge.

```tsx
<Input variant="ghost" placeholder="Search" accessibilityLabel="Search" />
<Input variant="ghost" value="Untitled note" style={{ fontSize: 17, fontWeight: "600" }} />
```

A ghost input is the field itself: it keeps its own focus edge and ring, so it is not what a frame you draw around it wants. For an input in a frame of your own — a search field with a magnifier, a composer with a send button — use [`InputGroup`](./input-group) instead: the group draws the frame and the input in it draws nothing, so the focus ring follows the group's radius.

### Invalid

```tsx
<Input invalid value={email()} />
```

### Read-only and disabled

```tsx
<Input value="Ada" readonly />
<Input value="Ada" disabled />
```

### Multiline

`multiline` makes the same field several lines: the content starts at the top, the box is at least one line tall, and Return writes a line break.

```tsx
<Input multiline value={notes()} onChange={({ value }) => notes.set(value)} />
```

`invalid`, `readonly` and `disabled` are the single-line field's, and a multiline one takes them the same way. A composer that sends on Return takes `submitBehavior="submit"` and keeps Shift + Return for a break:

```tsx
<Input multiline submitBehavior="submit" onSubmit={() => send()} />
```

The box grows only as the app sizes it: [`nsh/base`'s multi-line input](https://nsh.dev/elements/input) reports the size of its text (`onContentSizeChange`) rather than sizing itself to it, and the look keeps only a least height — one line's, so a multiline field sits as tall as a one-line input until the app says otherwise. Keep the reported height plus the room the look keeps inside the box:

```tsx
import { signal } from "nsh";

import { fieldText, Input } from "@/components/ui/input";

const note = signal("");
const content = signal(0);
/** The room inside the box: its two edges and the padding above and below. */
const room = () => {
  const text = fieldText({ multiline: true });
  return (text.paddingTop as number) + (text.paddingBottom as number) + 2;
};

<Input
  multiline
  value={note()}
  onChange={({ value }) => note.set(value)}
  onContentSizeChange={({ size }) => content.set(size.height)}
  style={{ height: content() === 0 ? undefined : content() + room() }}
/>;
```

A least height of your own is how the box starts taller than one line, since `style` goes over the look's — 64 points:

```tsx
<Input multiline value={notes()} style={{ minHeight: 64 }} />
```

### A password with a strength meter

A password field that says what it asks for and how far the reader has got: four segments, one for
each rule the password meets, the word for the score, and the rules under the field — a dot until
it is met, a tick on the tone that says it is. Score the field as it is typed, and score nothing as
nothing: an empty field asks for a password rather than calling it weak.

```tsx
const PASSWORD_RULES = [
  { label: "8 or more characters", test: (value: string) => value.length >= 8 },
  {
    label: "Upper and lower case",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: "A number", test: (value: string) => /\d/.test(value) },
  { label: "A symbol", test: (value: string) => /[^\w\s]/.test(value) },
];
const WORDS = ["Empty", "Weak", "Fair", "Good", "Strong"];

const score = (value: string) =>
  value === "" ? 0 : PASSWORD_RULES.filter((rule) => rule.test(value)).length;
const tones = [colors.faint, colors.destructive, colors.warning, colors.info, colors.success];

const strength = score(password());

<View style={{ gap: 6 }}>
  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Password</Text>
  <Input masked value={password()} onChange={({ value }) => password.set(value)} />
  <View style={{ gap: 8, paddingTop: 2 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
        <Each of={[0, 1, 2, 3]}>
          {(step) => (
            <View
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  step() < strength ? tones[strength] : alpha(colors.foreground, 0.1),
              }}
            />
          )}
        </Each>
      </View>
      <Text
        style={{
          width: 52,
          textAlign: "right",
          fontSize: 13,
          fontWeight: "500",
          color: tones[strength],
        }}
      >
        {WORDS[strength]}
      </Text>
    </View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 6 }}>
      <Each of={PASSWORD_RULES}>
        {(rule) => {
          const met = rule().test(password());
          return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, minWidth: 140 }}>
              {met ? (
                <Icon icon={Check} size={12} tint={colors.success} />
              ) : (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.faint,
                  }}
                />
              )}
              <Text
                style={{ fontSize: 12, color: met ? colors.foreground : colors.mutedForeground }}
              >
                {rule().label}
              </Text>
            </View>
          );
        }}
      </Each>
    </View>
  </View>
</View>;
```

The segments keep the field's own width — a bar of four parts, each a share of it — and the word
keeps a column at the end, so the meter does not reflow as the word changes from `Empty` to
`Strong`.

### The look alone

```tsx
<Input {...inputLook({ invalid: true })} />
<Input {...inputLook({ variant: "ghost" })} />
```

## API

| Part    | Props                                                                                                                                                                                    | Description                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `Input` | `variant`: `"default" \| "ghost"` (default `"default"`), `invalid`: `boolean`, `multiline`: `boolean`; every `nsh/base` Input prop; `class`, `style` and `disabledStyle` over the look's | A text field — `default` or `ghost`, single-line or multiline |

Every prop of [`nsh/base` Input](https://nsh.dev/elements/input) passes through. `class`, `style` and `disabledStyle` go over the look's. Focus and hover edges are classes on the look.

| Prop        | Type                | Default     | What it does                                                                                                               |
| ----------- | ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `variant`   | `InputVariant`      | `"default"` | `ghost` draws no fill and no edge until the keys are in it; the text, the placeholder and the focus ring stay.             |
| `invalid`   | `boolean`           |             | Edged in the danger tone, its focus edge too.                                                                              |
| `multiline` | `boolean`           | `false`     | Several lines: the content starts at the top, the box is at least one line tall, and Return writes a line break.           |
| `grow`      | `boolean \| number` |             | Multiline only. `true` grows with the text up to five lines; a number is that cap. No transition. A `style` `height` wins. |
| `reject`    | `number`            |             | Shakes the field each time this becomes a new number. `invalid` only recolours the edge. Less motion plays nothing.        |
