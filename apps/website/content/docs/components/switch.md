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

`size` is the knob: `default` takes the theme's `icon.md`, `sm` its `icon.sm`, and the track is
that knob plus 2 points of room on every side.

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

With no children the track is all of it; a touch screen raises the target to 44 points, and the track
is already at least that wide, so the hit slop only fills the height.

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

| Part     | Props                                                                                                                    | Description                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Switch` | `checked`, `onChange`, `size`, `disabled`, `children`, `accessibilityLabel`, `hitSlop`, and every `nsh/base` Switch prop | An on / off switch; alone it fills the touch target's height with a hit slop, with children it is a row whose label is the target |

### Where the numbers come from

A switch's knob is a circle on every theme: WinUI's `ring` handle still gives its switch a round
knob, and the family whose numbers it uses is the theme's own — the library's disc (above) or
WinUI's stretching knob, with Material's growing knob wherever the theme tints its track (`tint`).
The look reads `control()` where it draws, so switching the theme redraws the track and the knob on
the next frame.

### Sizes

| Size      | Track                                      | Knob      |
| --------- | ------------------------------------------ | --------- |
| `default` | `icon.md` + 4 high, 2 × `icon.md` + 4 long | `icon.md` |
| `sm`      | `icon.sm` + 4 high, 2 × `icon.sm` + 4 long | `icon.sm` |

In the library's own themes that is 36 × 20 with a 16-point knob under a pointer and 44 × 24 with
20 on a touch screen (`sm`: 28 × 16 with 12, 36 × 20 with 16): 2 points of track above, below and
at each end, so the knob travels its own width — as far from the end on as off. A theme whose
form brings its own switch draws that recipe at either size and on either tier: Material's track
is 52 × 32 with a 16-point knob that grows to 24 when on and 28 under a press, WinUI's is 40 × 20
with a 12-point knob, 14 under a hover and 17 × 14 under a press.

`SwitchSize` is `"sm" | "default"`.

The knob keeps its size on and off: off it is `finish.knob`, and on it takes the accent's own ink
(`finish.accent.foreground`), as the switch's preset (`packages/ui/switch.tsx`, `knobLook`).
