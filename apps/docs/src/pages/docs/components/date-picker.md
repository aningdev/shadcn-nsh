---
title: Date Picker
description: A calendar in a popup from a field trigger, on the shared listbox look.
component: true
demo: date-picker
---

## Installation

```sh
npx shadcn-nsh@latest add date-picker
```

## Usage

```tsx
import { DatePicker, DateTrigger } from "@/components/ui/date-picker";
```

```tsx
<DatePicker
  value={value}
  onChange={({ value }) => setValue(value)}
  trigger={<DateTrigger title={label} open={open} />}
/>
```

## API

Defaults from `datePickerLook`. Pass a `DateTrigger` (or `Picker`) as `trigger`. Every prop of [`nsh/base` DatePicker](https://nsh.dev/elements/date-picker) passes through.
