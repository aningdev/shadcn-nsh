---
title: Time Field
description: A sunk well for a time of day, one segment at a time.
component: true
demo: time-field
---

## Installation

```npm
npx shadcn-nsh@latest add time-field
```

## Usage

```tsx
import { TimeField } from "@/components/ui/time-field";
```

```tsx
<TimeField value={time()} onChange={({ value }) => value && time.set(value)} />
```

## Examples

### The look alone

```tsx
<TimeField class={timeFieldClass()} value={time()} />
```

## API

Every prop of [`nsh/base` TimeField](https://nsh.dev/elements/time-field) passes through; `class`, `segmentClass`, `separatorStyle` and `renderSegment` go over the look's.

| Part             | Props                                                    | Description                                                                           |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `TimeField`      | `value`, `onChange`, and every `nsh/base` TimeField prop | A time of day, one segment at a time, in the input's well and the calendar's segments |
| `timeFieldClass` | —                                                        | The well, shared with `Input` so a field on a page and one in a popup read alike      |

Segment chrome lands with the listbox / date-picker family.
