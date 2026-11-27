---
title: InputGroup
description: A field's frame around an input and what sits beside it — an icon, a unit, a button.
component: true
demo: input-group
---

## Installation

```npm
npx shadcn-nsh@latest add input-group
```

## Usage

```tsx
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Icon } from "@/lib/ui/icons";
```

The examples draw icons with `Icon` from `lib/ui/icons`; see [Icons](../icons) for adding it and picking a size and color.

```tsx
<InputGroup>
  <InputGroupInput placeholder="Search" accessibilityLabel="Search" />
</InputGroup>
```

The group draws the field: its fill, its edge and, while the input inside has the keys, the focus edge and its ring. The input inside draws none of that, so a group has one frame, not two.

## Composition

Use the following composition to build an `InputGroup`:

```text
InputGroup
├── InputGroupInput
├── InputGroupTextarea
└── InputGroupAddon
    ├── InputGroupText
    └── InputGroupButton
```

## Examples

### Invalid and disabled

```tsx
<InputGroup invalid>
  <InputGroupInput value={email()} placeholder="you@example.com" />
</InputGroup>
<InputGroup disabled>
  <InputGroupInput value="ada@example.com" />
</InputGroup>
```

A disabled group disables what it holds and dims it.

### An addon before and after the input

`InputGroupAddon` holds an icon, a word or a button at the start or at the end of the group's line (`align`: `inline-start`, `inline-end`). A press on an addon puts the keys in the input, so the magnifier works as part of the field; a press on a button in it is the button's alone.

```tsx
<InputGroup>
  <InputGroupAddon align="inline-start">
    <InputGroupText>
      <Icon icon={Search} size={16} tint={colors.mutedForeground} />
    </InputGroupText>
  </InputGroupAddon>
  <InputGroupInput
    value={query()}
    onChange={({ value }) => query.set(value)}
    placeholder="Search plugins"
  />
  <InputGroupAddon align="inline-end">
    <InputGroupButton
      size="icon-xs"
      accessibilityLabel="Clear"
      disabled={!query()}
      onPress={() => query.set("")}
    >
      <Icon icon={CircleX} {...buttonGlyph("ghost", { size: "sm" })} />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

### A unit after the control

```tsx
<InputGroup>
  <InputGroupInput
    value={amount()}
    onChange={({ value }) => amount.set(value)}
    placeholder="0.00"
  />
  <InputGroupAddon align="inline-end">
    <InputGroupText>USD</InputGroupText>
  </InputGroupAddon>
</InputGroup>
```

### A radius of your own

Write the radius and the padding on the group. The focus ring is drawn on the group's edge, so it follows the radius: a composer on 22 points lights a 22-point ring, with the input and its button inside it.

```tsx
<InputGroup style={{ borderRadius: 22, padding: 6 }}>
  <InputGroupTextarea
    value={message()}
    onChange={({ value }) => message.set(value)}
    placeholder="Ask anything"
  />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-sm" variant="default" accessibilityLabel="Send" onPress={send}>
      <Icon icon={Send} {...buttonGlyph("default")} />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

### Addons over and under the control

`block-start` and `block-end` take a line of their own, above or below the input's: a word over a note, a count under it.

```tsx
<InputGroup>
  <InputGroupAddon align="block-start">
    <InputGroupText>Release note</InputGroupText>
  </InputGroupAddon>
  <InputGroupTextarea value={note()} onChange={({ value }) => note.set(value)} />
  <InputGroupAddon align="block-end">
    <InputGroupText>{`${note().length} / 200`}</InputGroupText>
  </InputGroupAddon>
</InputGroup>
```

### Buttons in a group

`InputGroupButton` sizes a button inside a group: `xs` is a `sm` button (24 points high with a
pointer), `sm` a `default` one (28), and `icon-xs` / `icon-sm` a square of that height. `variant`
is a button's, `ghost` unless set.

```tsx
<InputGroup>
  <InputGroupInput placeholder="Filter the list" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="xs" accessibilityLabel="Apply the filter">
      <Icon icon={Search} {...buttonGlyph("ghost", { size: "sm" })} />
    </InputGroupButton>
    <InputGroupButton size="sm" accessibilityLabel="Clear the filter">
      <Icon icon={X} {...buttonGlyph("ghost", { size: "default" })} />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

### A search field

A magnifier before the control, the work after it: a spinner while the query settles, then a button
that clears it. Search on what the field settles on, not on every key — 300 ms after the last one
is enough, and the spinner says the search is under way. Put the matches under the field, with the
letters that matched in the accent, so the answer reads as the field's.

```tsx
const query = signal("");
const settled = signal("");
const pending = signal(false);
let wait: ReturnType<typeof setTimeout> | undefined;

const search = (value: string) => {
  query.set(value);
  if (wait !== undefined) clearTimeout(wait);
  if (value.trim() === "") {
    pending.set(false);
    settled.set("");
    return;
  }
  pending.set(true);
  wait = setTimeout(() => {
    settled.set(value);
    pending.set(false);
  }, 300);
};
cleanup(() => {
  if (wait !== undefined) clearTimeout(wait);
});

<View style={{ gap: 8 }}>
  <InputGroup>
    <InputGroupAddon align="inline-start">
      <InputGroupText>
        <Icon icon={Search} size={16} tint={colors.mutedForeground} />
      </InputGroupText>
    </InputGroupAddon>
    <InputGroupInput
      value={query()}
      onChange={({ value }) => search(value)}
      placeholder="Search cities"
      returnKeyType="search"
      autoCapitalize="none"
    />
    <InputGroupAddon align="inline-end">
      {pending() ? <Spinner side={14} tint={colors.faint} /> : null}
      {query().length > 0 ? (
        <InputGroupButton
          size="icon-xs"
          accessibilityLabel="Clear the search"
          onPress={() => search("")}
        >
          <Icon icon={CircleX} {...buttonGlyph("ghost", { size: "sm" })} />
        </InputGroupButton>
      ) : null}
    </InputGroupAddon>
  </InputGroup>
  {/* The panel of matches is the app's, not the group's: Pressable rows, or a List. */}
  <View style={{ ...sectionSurface(), overflow: "hidden" }}>
    <Each of={matches()}>
      {(city) => <Pressable onPress={() => search(city().name)}>{city().name}</Pressable>}
    </Each>
  </View>
</View>;
```

### A message composer

The composer of a chat: a `block-end` addon under the textarea holds a round button that opens
what can be added, the key hint, and the send button. Give the group the composer's radius and
padding (`borderRadius: 22`, `padding: 6`), and let the textarea grow to five lines with
`grownFieldHeight` — an `Input` takes the lines' height from `onContentSizeChange`. Return sends
and Shift-Return breaks the line under a keyboard (`submitBehavior="submit"` on desktop); on a
touch screen Return breaks the line, and the button sends.

```tsx
import { grownFieldHeight } from "@/components/ui/lib/field-look";

const message = signal("");
const grown = signal(0);
const replying = signal(false);
const attaching = signal(false);

<InputGroup style={{ borderRadius: 22, padding: 6 }}>
  <InputGroupTextarea
    value={message()}
    onChange={({ value }) => message.set(value)}
    onContentSizeChange={({ size }) => grown.set(size.height)}
    style={grown() > 0 ? { height: grownFieldHeight(grown(), 5) } : undefined}
    placeholder="Ask anything"
    submitBehavior={desktop ? "submit" : "newline"}
    onSubmit={send}
  />
  <InputGroupAddon align="block-end" style={{ paddingHorizontal: 0, paddingBottom: 0, gap: 8 }}>
    <RoundButton
      variant="secondary"
      size="sm"
      accessibilityLabel="Add an attachment"
      style={attaching() ? { transform: "rotate(45deg)" } : undefined}
    >
      <Icon icon={Plus} {...roundButtonGlyph("secondary", { size: "sm" })} />
    </RoundButton>
    <View style={{ flex: 1 }} />
    <Text style={{ fontSize: 11, color: colors.faint }}>
      {desktop ? "Return sends · Shift-Return breaks the line" : "Return breaks the line"}
    </Text>
    {replying() ? (
      <RoundButton size="sm" accessibilityLabel="Stop the reply" onPress={stop}>
        <Icon icon={Square} {...roundButtonGlyph("default", { size: "sm" })} />
      </RoundButton>
    ) : (
      <RoundButton
        size="sm"
        accessibilityLabel="Send"
        disabled={message().trim().length === 0}
        onPress={send}
      >
        <Icon icon={Send} {...roundButtonGlyph("default", { size: "sm" })} />
      </RoundButton>
    )}
  </InputGroupAddon>
</InputGroup>;
```

While a reply streams, the send button becomes a stop: the same press that sent the message stops
the answer. The plus turns a quarter as the menu under it opens, so the same button shows it can be
closed.

### When to use a group, and when an `Input`

A frame of your own around an input is a group. Do not wrap a `variant="ghost"` `Input` in a `View` with a border: the ghost input keeps its own focus edge and ring, so the frame ends up with a second edge inside it that does not follow the frame's radius.

```tsx
{
  /* Not this: the ghost input draws its own focus edge inside your frame. */
}
<View style={{ borderRadius: 22, padding: 6, borderWidth: 1 }}>
  <Input variant="ghost" placeholder="Search" />
</View>;

{
  /* This: the group draws the frame, and the input draws nothing. */
}
<InputGroup style={{ borderRadius: 22, padding: 6 }}>
  <InputGroupInput placeholder="Search" />
</InputGroup>;
```

### Focus from code

A ref on the control focuses it from code — a shortcut, a request to focus a draft. The ref is the control's, not the group's.

```tsx
let search: InputRef | undefined;

<InputGroup>
  <InputGroupInput ref={search} placeholder="Search" />
</InputGroup>
<Button onPress={() => search?.focus()}>Find</Button>
```

### The look alone

`inputGroupLook` is the frame's props and `inputGroupControlLook` the control's, for a `nsh/base` control of your own; `inputGroupAddonLook` and `inputGroupTextLook` are the addon's and its text's. This is what the reference page draws, and what `InputGroup` wraps.

```tsx
<View {...inputGroupLook({ invalid: true, style: { borderRadius: 22, padding: 6 } })}>
  <BaseInput {...inputGroupControlLook()} placeholder="Search" />
</View>
```

## API

| Part                 | Props                                                                                                                                                                         | Description                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `InputGroup`         | `invalid`; every `View` prop; `class`, `style` and `disabledStyle` over the look's                                                                                            | The field's frame around its parts             |
| `InputGroupAddon`    | `align`: `"inline-start" \| "inline-end" \| "block-start" \| "block-end"` (default `"inline-start"`); every `View` prop                                                       | An icon, a word or a button beside the control |
| `InputGroupText`     | `children`; every `View` prop                                                                                                                                                 | A word or an icon in the field's type          |
| `InputGroupButton`   | `size`: `"xs" \| "sm" \| "icon-xs" \| "icon-sm"` (default `"xs"`), `variant`: `"default" \| "secondary" \| "ghost" \| "destructive"` (default `"ghost"`); every `Button` prop | A button sized for a group                     |
| `InputGroupInput`    | every `nsh/base` Input prop, `ref` included                                                                                                                                   | The group's single-line control                |
| `InputGroupTextarea` | every `nsh/base` Input prop, `ref` included                                                                                                                                   | The group's multiline control                  |

`InputGroup` is a view: every `View` prop passes through. `class`, `style` and `disabledStyle` go over its look's.

| Prop      | Type        | Default | What it does                                                         |
| --------- | ----------- | ------- | -------------------------------------------------------------------- |
| `invalid` | `boolean`   |         | Edged in the danger tone, its focus edge too.                        |
| `style`   | `ViewStyle` |         | Over the look's: the radius, the padding and the width of the group. |

`InputGroupInput` and `InputGroupTextarea` take every prop of [`nsh/base` Input](https://nsh.dev/elements/input), `ref` included: `value`, `onChange`, `placeholder`, `keyboardType`, `maxLength`, `readonly`, `disabled` and the rest. `InputGroupTextarea` is the multiline one. Their `style` goes over the look's. A `ref` is the control's `InputRef`: `ref.focus()` puts the keys in it from code (a shortcut, a request to focus a draft).
