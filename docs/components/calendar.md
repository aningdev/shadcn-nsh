# Calendar (/docs/components/calendar)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add calendar
```

## Usage [#usage]

```tsx
import { Calendar } from "@/components/ui/calendar";
```

```tsx
<Calendar value={value} onChange={({ value }) => setValue(value)} />
```

## Examples [#examples]

### Controlled [#controlled]

```tsx
<Calendar value={day()} onChange={({ value }) => day.set(value)} />
```

`value` is an ISO date; with `range` it is `[start, end]`. While the second end is chosen, the band
previews the range from the first to a later day under the pointer or the keyboard; the pick
commits it. A day before the first starts the range again, so nothing is previewed there.

### Uncontrolled [#uncontrolled]

Without `value` the calendar keeps its own, starting at `defaultValue`.

```tsx
<Calendar defaultValue="2026-11-11" onChange={({ value }) => save(value)} />
```

## API [#api]

Defaults from `calendarLook` / `CalendarItem`. Every prop of [`nsh/base` Calendar](https://nsh.dev/elements/calendar) passes through.

| Part           | Props                                                  | Description                                                                            |
| -------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `Calendar`     | `value`, `defaultValue`, `onChange`, `range`           | A month of days to pick a date or a range, on the shared calendar look.                |
| `CalendarItem` | `item` (a `CalendarEntry`), `months`, `firstDayOfWeek` | One day of the grid (a square in `shape.control`); what `renderItem` draws by default. |