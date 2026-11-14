---
layout: ../../../layouts/Docs.astro
title: Stat
description: A label above a value for metric grids.
component: true
demo: stat
---

## Installation

```sh
npx shadcn-nsh@latest add stat
```

## Usage

```tsx
import { Stat } from "@/components/ui/stat";
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
<Stat label="Failures" value="2" tone="danger" />
<Stat label="Growth" value="+8.1%" tone="up" />
<Stat label="Churn" value="−1.2%" tone="down" />
```

### Truncate

```tsx
<Stat label="Display" value="MacBook Pro 16-inch, 2024" truncate />
```

## API

Gallery atom: no `nsh/base` counterpart.

| Prop       | Type                    | Default    |
| ---------- | ----------------------- | ---------- |
| `label`    | `string`                | (required) |
| `value`    | `string`                | (required) |
| `tone`     | `Tone \| (() => Tone)`  |            |
| `width`    | percentage width string |            |
| `truncate` | `boolean`               |            |
