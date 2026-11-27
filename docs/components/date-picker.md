# Date Picker (/docs/components/date-picker)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add date-picker
```

## Usage [#usage]

```tsx
import { DatePicker, DatePickerContent, DatePickerTrigger } from "@/components/ui/date-picker";
```

```tsx
<DatePicker value={value} onChange={({ value }) => setValue(value)}>
  <DatePickerTrigger />
  <DatePickerContent />
</DatePicker>
```

## Composition [#composition]

Use the following composition to build a `DatePicker`:

```text
DatePicker
├── DatePickerTrigger
└── DatePickerContent
```

## Examples [#examples]

### A range [#a-range]

`range` on the content; the trigger shows both ends. After the first pick the band previews the
range to the day under the pointer or the keyboard, as the calendar's does.

```tsx
<DatePicker value={range} onChange={({ value }) => setRange(value)}>
  <DatePickerTrigger />
  <DatePickerContent range />
</DatePicker>
```

### The time of day [#the-time-of-day]

```tsx
<DatePickerContent timePrecision="minute" />
```

### Presets [#presets]

```tsx
<DatePickerContent
  presets={[
    { label: "Today", value: today },
    { label: "Last 7 days", value: lastWeek },
  ]}
/>
```

### Two months [#two-months]

```tsx
<DatePickerContent numberOfMonths={2} />
```

### Clearable, and a placeholder [#clearable-and-a-placeholder]

Without a value the trigger shows `placeholder` (default "Pick a date") muted.

```tsx
<DatePicker cleanable placeholder="Due date">
  <DatePickerTrigger />
  <DatePickerContent />
</DatePicker>
```

## API [#api]

| Part                | Props                                                                                                                                                 | Description                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `DatePicker`        | `value` / `defaultValue`, `open` / `defaultOpen`, `disabled`, `cleanable`, `placeholder`, `onChange`, `onOpenChange`, `onOpen`, `onClose`, `onCancel` | Open state and the value                                   |
| `DatePickerTrigger` | `title` (default the value), `placeholder`, `invalid`, `clearable`, `style`, `testID`, `accessibilityLabel`                                           | A `DateTrigger`, the pressed field that opens the calendar |
| `DatePickerContent` | `range`, `timePrecision`, `presets`, `numberOfMonths`, `firstDayOfWeek`, …                                                                            | The calendar in the popup                                  |

`testID` finds the trigger in UI tests, and `accessibilityLabel` names it when the
content does not name the field. The root owns the open flag and the value;
`DatePickerContent` mounts [`nsh/base` DatePicker](https://nsh.dev/elements/date-picker)
and every base prop passes through except those. The date picker's look fills the popup, the scrim, the calendar and the time's row by default.