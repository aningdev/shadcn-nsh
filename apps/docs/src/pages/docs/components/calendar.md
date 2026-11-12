---
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

## API

Defaults from `calendarLook` / `CalendarItem`. Every prop of [`nsh/base` Calendar](https://nsh.dev/elements/calendar) passes through.
