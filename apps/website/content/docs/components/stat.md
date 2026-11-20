---
title: Stat
description: A label above a value for metric grids.
component: true
demo: stat
---

## Installation

```npm
npx shadcn-nsh@latest add stat
```

## Usage

```tsx
import { Stat, StatGroup } from "@/components/ui/stat";
```

```tsx
<Stat label="Users" value="12.4k" />
```

## Examples

### Tone

```tsx
<Stat label="Users" value="12.4k" tone="neutral" />
<Stat label="Latency" value="42 ms" tone="accent" />
<Stat label="Queue" value="3" tone="info" />
<Stat label="Errors" value="0.2%" tone="warn" />
<Stat label="Failures" value="2" tone="destructive" />
<Stat label="Growth" value="+8.1%" tone="up" />
<Stat label="Churn" value="−1.2%" tone="down" />
```

### Truncate

```tsx
<Stat label="Display" value="MacBook Pro 16-inch, 2024" truncate />
```

### Unit and note

`unit` sits beside the value, smaller and muted. `note` is a line under it. shadcn/ui has no stat, so the names follow the figure a chart shows: a value, its unit, and a note.

```tsx
<Stat label="Latency" value="42" unit="ms" note="p95" tone="accent" />
```

### A row

`StatGroup` wraps several stats onto one row. A stat with no `width` shares that row. A hairline above a chart's figures is the group's class, not the default.

```tsx
<StatGroup class="border-line border-t pt-3">
  <Stat label="Open" value="182.40" />
  <Stat label="High" value="184.10" />
</StatGroup>
```

## API

Gallery atom: no `nsh/base` counterpart. shadcn/ui has no stat either.

| Part        | Props                                                         | Description                                                                                  |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Stat`      | `label`, `value`, `unit`, `note`, `tone`, `width`, `truncate` | A muted label over a larger value; `tone` colors the value, `truncate` keeps it to one line. |
| `StatGroup` | —                                                             | A wrapping row of stats, 12 points apart.                                                    |
