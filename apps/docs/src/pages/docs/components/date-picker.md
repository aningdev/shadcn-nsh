---
layout: ../../../layouts/Docs.astro
title: Date Picker
description: Styled date picker wrapping nsh/base DatePicker — theme tokens and a Trigger. Composition-only.
component: true
demo: date-picker
demoHeight: 360
---

A date, a range, or a date and time from a calendar in a popup. Composition parts fill `nsh/base` DatePicker's `trigger` slot. The calendar and the time field use the same chrome as `Calendar` and `TimeField`.

## Install

```sh
shadcn-nsh add date-picker
# monorepo:
shadcn-nsh add date-picker -c apps/web
```

## Usage

```tsx
import {
  DatePicker,
  DatePickerTrigger,
  DatePickerValue,
} from "@workspace/ui/components/ui/date-picker";

<DatePicker value={due()} onChange={({ value }) => due.set(value)}>
  <DatePickerTrigger>
    <DatePickerValue placeholder="Pick a date" />
  </DatePickerTrigger>
</DatePicker>;
```

## Composition

```
DatePicker
└── DatePickerTrigger
    └── DatePickerValue
```

The popup, the calendar, presets, and the time field are base's. There is no Content part.

## API

### `DatePicker`

| Prop                                               | Type                         | Notes                                                                         |
| -------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| `value` / `defaultValue`                           | `DatePickerValue`            | ISO date, `[start, end]`, `YYYY-MM-DDTHH:MM` with `timePrecision`, or `null`  |
| `placeholder`                                      | `string`                     | Shown by `DatePickerValue` while nothing is chosen                            |
| `range`                                            | `boolean`                    | A range closes the popup when the end is picked                               |
| `open` / `defaultOpen`                             | `boolean`                    |                                                                               |
| `timePrecision`                                    | `"minute"` \| `"second"`     | A time field under the calendar. Desktop stays open after a day; touch closes |
| `hourCycle`                                        | `"h23"` \| `"h12"`           |                                                                               |
| `cleanable`                                        | `boolean`                    | A clear button after the trigger. The prop matches base                       |
| `presets`                                          | `{ label, value }[]`         | Buttons that set the value and close the popup                                |
| `disabledMatcher` / `numberOfMonths` / `yearRange` | as `Calendar`                | Passed through to the calendar                                                |
| `onChange`                                         | `({ value }) => void`        | A day, a range's end, a preset, the time, or clear                            |
| `onOpenChange`                                     | `({ open, reason }) => void` |                                                                               |

`DatePickerTrigger` accepts `class`, `style`, the state styles, and `testID`. A string child replaces the value label.

`offset` (4) and `margin` (8) stay at the reference values and are not props. `datePickerVariants()` is the trigger chrome; `datePickerPopupChrome()` describes the popup. Read both inside `computed`.

## Differences

| Topic               | shadcn                      | This package / `nsh/base`                                                                                         |
| ------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Shape               | Popover + Calendar + Button | One `DatePicker`. The trigger is the only composition part                                                        |
| Popup               | Radix popover               | Pointer: the shared list popup. Touch: base's bottom sheet (top radius 20, max 70%)                               |
| Open / close motion | Radix animation             | Base exposes `popupClass` / `popupStyle` only. The chevron springs; the sheet uses base's motion                  |
| Trigger             | Button                      | The select row: `secondary` + `finish.control.rest`, field focus ring, `pressSink`. Disabled is 0.5, not 0.4      |
| Time well hover     | —                           | The standalone `TimeField` has a hover edge. Base DatePicker has no hover hook for the time well inside the popup |
| Locale              | `date-fns`                  | Month names are English, as `Calendar`. The trigger shows the ISO value                                           |

## Accessibility

The trigger is a combobox named by `accessibilityLabel`. Return opens or closes it. Escape closes it without a choice. Days are buttons named by their ISO date. The clear button is "Clear date" unless `clearButtonAccessibilityLabel` is set.
