---
title: Date Picker
description: A calendar in a popup from a field trigger, on the shared listbox look.
component: true
demo: date-picker
---

## Installation

```npm
npx shadcn-nsh@latest add date-picker
```

## Usage

```tsx
import { DatePicker, DatePickerContent, DatePickerTrigger } from "@/components/ui/date-picker";
```

```tsx
<DatePicker value={value} onChange={({ value }) => setValue(value)}>
  <DatePickerTrigger />
  <DatePickerContent />
</DatePicker>
```

## Composition

Use the following composition to build a `DatePicker`:

```text
DatePicker
├── DatePickerTrigger
└── DatePickerContent
```

## Examples

### A range

`range` on the content; the trigger shows both ends.

```tsx
<DatePicker value={range} onChange={({ value }) => setRange(value)}>
  <DatePickerTrigger />
  <DatePickerContent range />
</DatePicker>
```

### The time of day

```tsx
<DatePickerContent timePrecision="minute" />
```

### Presets

```tsx
<DatePickerContent
  presets={[
    { label: "Today", value: today },
    { label: "Last 7 days", value: lastWeek },
  ]}
/>
```

### Two months

```tsx
<DatePickerContent numberOfMonths={2} />
```

### Clearable, and a placeholder

Without a value the trigger shows `placeholder` (default "Pick a date") muted.

```tsx
<DatePicker cleanable placeholder="Due date">
  <DatePickerTrigger />
  <DatePickerContent />
</DatePicker>
```

## API

| Part                | Props                                                                                                                                                 | Description                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `DatePicker`        | `value` / `defaultValue`, `open` / `defaultOpen`, `disabled`, `cleanable`, `placeholder`, `onChange`, `onOpenChange`, `onOpen`, `onClose`, `onCancel` | Open state and the value                                   |
| `DatePickerTrigger` | `title` (default the value), `placeholder`, `invalid`, `clearable`, `style`, `testID`, `accessibilityLabel`                                           | A `DateTrigger`, the pressed field that opens the calendar |
| `DatePickerContent` | `range`, `timePrecision`, `presets`, `numberOfMonths`, `firstDayOfWeek`, …                                                                            | The calendar in the popup                                  |

`testID` finds the trigger in UI tests, and `accessibilityLabel` names it when the
content does not name the field. The root owns the open flag and the value;
`DatePickerContent` mounts [`nsh/base` DatePicker](https://nsh.dev/elements/date-picker)
and every base prop passes through except those. `datePickerLook` fills the popup, the scrim, the calendar and the time's row by default.
