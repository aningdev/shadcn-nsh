---
title: Switch
description: An on / off switch whose knob springs across a sunk track.
component: true
demo: switch
---

## Installation

```npm
npx shadcn-nsh@latest add switch
```

## Usage

```tsx
import { Switch } from "@/components/ui/switch";
```

```tsx
<Switch checked={on()} onChange={({ checked }) => on.set(checked)}>
  <Text>Wi-Fi</Text>
</Switch>
```

## Examples

### Size

`size` is read on a touch screen; with a pointer both sizes are 28 × 16.

```tsx
<Switch size="sm" checked={on()} onChange={({ checked }) => on.set(checked)} />
<Switch size="default" checked={on()} onChange={({ checked }) => on.set(checked)} />
```

### Disabled

```tsx
<Switch checked={false} disabled>
  <Text>Ask to join networks</Text>
</Switch>
```

### In a row

A row with its label is the target: put the label in `children` and let `listRow` draw the row.

```tsx
<Switch
  checked={wifi()}
  onChange={({ checked }) => wifi.set(checked)}
  {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
>
  <RowDivider show={false} />
  <RowLabel label="Wi-Fi" />
</Switch>
```

A switch is the whole row here — its children are its label, so a tap anywhere on the row toggles it — and it is read as a switch that is on or off, because `Switch` sets its own role and its own value. Nothing else has to say either.

### A settings row

A `Field` in a row puts a title and its description at the start, `FieldContent` takes the room
the control leaves, and the switch sits after them.

```tsx
<Field orientation="horizontal">
  <FieldContent>
    <FieldLabel>Extract text from images</FieldLabel>
    <FieldDescription>Read the text in a screenshot you paste or open.</FieldDescription>
  </FieldContent>
  <Switch
    accessibilityLabel="Extract text from images"
    checked={extract()}
    onChange={({ checked }) => extract.set(checked)}
  />
</Field>
```

The title is beside the switch, not in it, so the switch carries the row's name in `accessibilityLabel`; it is still read as that switch and its state. A list of them is a `FieldGroup`, and `FieldSeparator` draws the hairline between two rows.

A title beside a switch takes no presses, so the switch is the target — a touch screen gives it the room a finger needs (`hitSlop`) — and a row that should toggle on a tap anywhere is the `listRow` row above.

Nothing in the row names a side: `Field` lays its children out along the writing direction, so a right-to-left app puts the switch first and the text against the other edge, with the row unchanged.

```tsx
<View style={{ direction: "rtl" }}>
  <Field orientation="horizontal">…the same row…</Field>
</View>
```

### Alone

With no children the track is all of it; a touch screen gets a 44-point target from a hit slop.

```tsx
<Switch
  accessibilityLabel="Bluetooth"
  checked={bluetooth()}
  onChange={({ checked }) => bluetooth.set(checked)}
/>
```

### The look alone

`switchLook` gives the track and knob classes to a `nsh/base` switch of your own; `switchHitSlop` gives the touch target.

```tsx
<BaseSwitch
  {...switchLook(() => on(), "default")}
  checked={on()}
  onChange={({ checked }) => on.set(checked)}
/>
```

The settings row's looks are the field family's, for a `nsh/base` view of your own:

```tsx
<View style={fieldFamilyLook().field(true)}>
  <View style={fieldFamilyLook().content}>
    <Text style={fieldFamilyLook().title}>Extract text from images</Text>
    <Text style={fieldFamilyLook().description}>Read the text in a screenshot.</Text>
  </View>
  <BaseSwitch {...switchLook(() => on())} checked={on()} />
</View>
```

Each part of `fieldFamilyLook()` reads the theme when it is drawn, so a look kept in a `const` still follows the scheme.

## API

Every prop of [`nsh/base` Switch](https://nsh.dev/elements/switch) passes through. `trackClass`, `trackStyle` and `thumbStyle` go over the look's.

| Part     | Props                                                                                                                    | Description                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `Switch` | `checked`, `onChange`, `size`, `disabled`, `children`, `accessibilityLabel`, `hitSlop`, and every `nsh/base` Switch prop | An on / off switch; alone it takes a 44-point hit slop, with children it is a row whose label is the target |

### Sizes

| Size      | Pointer | Touch screen |
| --------- | ------- | ------------ |
| `default` | 28 × 16 | 42 × 24      |
| `sm`      | 28 × 16 | 34 × 20      |

`SwitchSize` is `"sm" | "default"`.

The knob keeps its size on and off: off it is `finish.knob`, and on it takes the accent's own ink
(`finish.accent.foreground`), as the switch's preset (`packages/ui/switch.tsx`, `knobLook`).
