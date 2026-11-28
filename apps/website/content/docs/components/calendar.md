---
title: Calendar
description: A month of days to pick a date or a range, on the shared calendar look.
component: true
demo: calendar
---

## Installation

```npm
npx shadcn-nsh@latest add calendar
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Calendar } from "shadcn-nsh/calendar";
```

## Usage

```tsx
import { Calendar } from "@/components/ui/calendar";
```

```tsx
<Calendar value={value} onChange={({ value }) => setValue(value)} />
```

## Examples

### Controlled

```tsx
<Calendar value={day()} onChange={({ value }) => day.set(value)} />
```

`value` is an ISO date; with `range` it is `[start, end]`. While the second end is chosen, the band
previews the range from the first to a later day under the pointer or the keyboard; the pick
commits it. A day before the first starts the range again, so nothing is previewed there.

### Uncontrolled

Without `value` the calendar keeps its own, starting at `defaultValue`.

```tsx
<Calendar defaultValue="2026-11-11" onChange={({ value }) => save(value)} />
```

## API

Defaults from `calendarLook` / `CalendarItem`. Every prop of [`nsh/base` Calendar](https://nsh.dev/elements/calendar) passes through.

| Part           | Props                                                  | Description                                                                            |
| -------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `Calendar`     | `value`, `defaultValue`, `onChange`, `range`           | A month of days to pick a date or a range, on the shared calendar look.                |
| `CalendarItem` | `item` (a `CalendarEntry`), `months`, `firstDayOfWeek` | One day of the grid (a square in `shape.control`); what `renderItem` draws by default. |
