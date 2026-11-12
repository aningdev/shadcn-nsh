---
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
<Stat label="Latency" value="42 ms" tone="accent" />
```

## API

Gallery atom: no `nsh/base` counterpart.

| Prop       | Type                    | Default    |
| ---------- | ----------------------- | ---------- |
| `label`    | `string`                | (required) |
| `value`    | `string`                | (required) |
| `tone`     | `Tone`                  |            |
| `width`    | percentage width string |            |
| `truncate` | `boolean`               |            |
