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

A least height of your own is how the box starts taller than one line, since `style` goes over the look's — 64 points, as shadcn's starts:

```tsx
<Input multiline value={notes()} style={{ minHeight: 64 }} />
```

### The look alone

```tsx
<Input {...inputLook({ invalid: true })} />
<Input {...inputLook({ variant: "ghost" })} />
```

## Differences from shadcn/ui

- Adds `variant` (`default` | `ghost`) and `invalid`; shadcn styles those with classes and `aria-invalid`.
- `multiline` turns the same component into a text area; shadcn's is a separate `Textarea`, whose box grows with its content (`field-sizing-content`) and starts at `min-h-16` (64 points). Ours starts at one line. `grow` makes it as tall as its text, up to five lines; a `style` `height` still wins.

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
