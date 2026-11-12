---
layout: ../../../layouts/Docs.astro
title: Time Field
description: A sunk well for a time of day, one segment at a time.
component: true
demo: time-field
---

## Installation

```sh
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
<TimeField class={timeFieldClass} value={time()} />
```

## API

Every prop of [`nsh/base` TimeField](https://nsh.dev/elements/time-field) passes through. `class` goes over the look's. Segment chrome lands with the listbox / date-picker family.
