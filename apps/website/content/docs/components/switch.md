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

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Switch } from "shadcn-nsh/switch";
```

## Usage

```tsx
import { Switch } from "@/components/ui/switch";
```

```tsx
<Switch checked={on()} onChange={({ checked }) => on.set(checked)}>
  Wi-Fi
</Switch>
```

## Examples

### Size

`size` switches between the theme's standard (`default`) and compact (`sm`) switch geometry in `switch.*` and `switch.small.*` (with pointer vs touch scales applied automatically via the active input `tier`; WinUI 3 uses `44 × 22` / `sm 36 × 18` on touch).

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

## API

Every prop of [`nsh/base` Switch](https://nsh.dev/elements/switch) passes through. `trackClass`, `trackStyle` and `thumbStyle` go over the look's.

| Part     | Props                                                                                                                    | Description                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `Switch` | `checked`, `onChange`, `size`, `disabled`, `children`, `accessibilityLabel`, `hitSlop`, and every `nsh/base` Switch prop | An on / off switch; alone it fills the touch target's height with a hit slop, with children it is a row whose label is the target |

### Where the numbers come from

The track, border (`switch.edge.off`, `switch.edge.on`, `switch.edge.color`), knob dimensions (`switch.track`, `switch.knob.*`), and derived press feedback all read `control("switch")` (`@shadcn-nsh/theme`) so switching themes updates geometry and motion on the next frame:

- **Apple** draws an oval knob on a borderless pill track (`54 × 24` with `31 × 20` knob on pointer; `63 × 28` with `37 × 24` on touch; `sm`: `40 × 18` with `23 × 14` on pointer).
- **shadcn** draws a borderless pill track (`32 × 18` on pointer, `sm`: `24 × 14`; `44 × 24` / `36 × 20` on touch) with `--input` off track.
- **Material 3** draws a `40 × 24` (`52 × 32` touch; `sm`: `32 × 20` / `40 × 24`) track with an `outline` border when off and an expanding circle knob (`16 → 20 / 24` on, `22 / 28` pressed; `sm`: `12pt` rest).
- **WinUI 3** draws a `40 × 20` (`44 × 22` touch; `sm`: `32 × 16` / `36 × 18` touch) track with a strong off border (`ControlStrongStrokeColorDefault`) and a `12pt` (`14pt` touch; `sm`: `10pt` / `12pt`) circle knob that enlarges on hover and stretches while pressed.

A standalone switch adds `focusRing()` shaped to the capsule track and handles disabled appearance directly (dimming via `dimmed.disabled` when `controls.disabled.face` is `keep`, or switching to `disabled.*` surface/ink/edge on Material 3 and WinUI 3).

### Sizes

| Size      | Track (`nsh-gallery` / `solid-glass`)      | Knob      |
| --------- | ------------------------------------------ | --------- |
| `default` | `icon.md` + 4 high, 2 × `icon.md` + 4 long | `icon.md` |
| `sm`      | `icon.sm` + 4 high, 2 × `icon.sm` + 4 long | `icon.sm` |

In `nsh-gallery` and `solid-glass`, that is 36 × 20 with a 16-point knob under a pointer and 44 × 24 with 20 on a touch screen (`sm`: 28 × 16 with 12, 36 × 20 with 16): 2 points of track above, below and at each end, so the knob travels its own width — as far from the end on as off.

`SwitchSize` is `"sm" | "default"`.

Off and on, the knob wears `control("switch").knobStyle(checked)` (`packages/ui/switch.tsx`, `knobLook`): the theme states its size, face, gradient and edge per state, and how it grows when pressed.
