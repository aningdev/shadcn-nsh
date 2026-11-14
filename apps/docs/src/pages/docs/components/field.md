---
layout: ../../../layouts/Docs.astro
title: Field
description: A set of fields under a legend: a label, its control, a description and errors that are read out.
component: true
demo: field
---

## Installation

```sh
npx shadcn-nsh@latest add field
```

## Usage

```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
```

```tsx
<FieldSet>
  <FieldLegend>Payment method</FieldLegend>
  <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
  <FieldGroup>
    <Field>
      <FieldLabel>Name on card</FieldLabel>
      <Input placeholder="Evil Rabbit" />
    </Field>
  </FieldGroup>
</FieldSet>
```

`FieldSet` holds a legend and the fields under it; `FieldGroup` holds the fields themselves, 16
points apart. `Field` is one label and its control. A control that carries its own label (a
`Checkbox` with children, a `Switch` with children) needs no `Field`: put it in the group as it is.

## Examples

### Vertical and horizontal

`orientation` defaults to `vertical`: the label over the control. `horizontal` puts them on one
row, the label as wide as its text and the control taking the rest.

```tsx
<Field>
  <FieldLabel>Name on card</FieldLabel>
  <Input placeholder="Evil Rabbit" />
</Field>

<Field orientation="horizontal">
  <FieldLabel>Email</FieldLabel>
  <FieldContent>
    <Input invalid />
    <FieldError errors={[{ message: "Enter an email address like name@example.com." }]} />
  </FieldContent>
</Field>
```

`FieldContent` stacks a label and its description (or an input and its error) beside the control
of a horizontal field. A label inside `FieldContent` keeps the label's width rather than the
room left by the control, whatever the field's orientation.

### Responsive

`orientation="responsive"` is `vertical` in a narrow window — a phone, or a narrow desktop
window, under 600 points — and `horizontal` above it (`narrowWindow`).

```tsx
<Field orientation="responsive">
  <FieldContent>
    <FieldTitle>Full name</FieldTitle>
    <FieldDescription>Provide your full name for identification.</FieldDescription>
  </FieldContent>
  <Input placeholder="Evil Rabbit" />
</Field>
```

### A group of choices

A legend one step smaller over a group of checkboxes or switches: `variant="label"`.

```tsx
<FieldSet>
  <FieldLegend variant="label">Show these items on the desktop</FieldLegend>
  <FieldDescription>Select the items you want to see there.</FieldDescription>
  <FieldGroup>
    <Checkbox>Hard disks</Checkbox>
    <Checkbox checked>External disks</Checkbox>
  </FieldGroup>
</FieldSet>
```

### Separators

A `FieldSeparator` is a hairline between fields; with children it is a hairline broken by its word.

```tsx
<FieldSeparator />
<FieldSeparator>Billing address</FieldSeparator>
```

### Errors

`FieldError` shows `errors`' messages — as many as there are, each distinct message once — or its
`children` when they say more. With neither it draws nothing.

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <Input value={email()} onChange={({ value }) => email.set(value)} invalid={!valid()} />
  <FieldError errors={[{ message: "Enter an email address like name@example.com." }]} />
</Field>
```

## Accessibility

- **A label is not associated with its control.** NSH has no `<label for>`: a screen reader hears
  the control's own `accessibilityLabel`, then the `FieldLabel` as separate text. Give the control
  the same words: `<Input accessibilityLabel="Email" />` beside `<FieldLabel>Email</FieldLabel>`.
  A control that carries its own label (`<Checkbox>Hard disks</Checkbox>`) needs neither.
- **An error is announced where the platform does it by itself.** `FieldError` is a view with
  `role="alert"` (macOS and the web read it when it appears) and TalkBack's live region
  (`accessibilityLiveRegion: "assertive"` on Android). iOS has no live region: `UIAccessibility`'s
  announcement is the app's call, and NSH does not expose it — put the message in the control's
  `accessibilityHint` there as well if it must be heard the moment it appears.
- **Mark the control invalid, not just the field.** Pass `invalid` to the control (an `Input`, a
  `Select`'s trigger): `role="alert"` tells a reader that something is wrong, not which field.
- A `Field` and a `FieldSet` are `role="group"`: a reader can move by group, and a legend names it.

## API

Every view prop passes through the parts drawn as views, and every text prop the parts drawn as
texts. `style` goes over the look's, so a width or a gap on a part wins.

| Part               | Renders | Adds                                                          |
| ------------------ | ------- | ------------------------------------------------------------- |
| `FieldSet`         | `View`  | `role="group"`                                                |
| `FieldLegend`      | `Text`  | `variant`: `"legend"` (default) or `"label"`                  |
| `FieldGroup`       | `View`  | a column, 16 points apart                                     |
| `Field`            | `View`  | `orientation`: `"vertical"`, `"horizontal"` or `"responsive"` |
| `FieldContent`     | `View`  | a column that takes the room left                             |
| `FieldLabel`       | `Text`  | in a row, as wide as its text                                 |
| `FieldTitle`       | `Text`  | a label over a group of choices                               |
| `FieldDescription` | `Text`  | `density.note`, muted                                         |
| `FieldSeparator`   | `View`  | `children`: the word between the hairlines                    |
| `FieldError`       | `View`  | `errors`, `role="alert"`                                      |

`FieldError`'s `errors` is `Array<{ message?: string } | undefined>`, as a form library reports them
(a field may collect several). `fieldFamilyLook()` is exported for a field the app draws itself —
the same look without the parts; it is not `fieldLook()`, which is the input's well.
