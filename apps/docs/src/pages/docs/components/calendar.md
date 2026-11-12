---
layout: ../../../layouts/Docs.astro
title: Calendar
description: A month of days to pick a date or a range, on the shared calendar look.
component: true
demo: calendar
---

## Installation

```sh
npx shadcn-nsh@latest add calendar
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

`value` is an ISO date; with `range` it is `[start, end]`.

### Uncontrolled

Without `value` the calendar keeps its own, starting at `defaultValue`.

```tsx
<Calendar defaultValue="2026-11-11" onChange={({ value }) => save(value)} />
```

## API

Defaults from `calendarLook` / `CalendarItem`. Every prop of [`nsh/base` Calendar](https://nsh.dev/elements/calendar) passes through.
