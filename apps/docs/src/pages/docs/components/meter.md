---
title: Meter
description: A horizontal meter with an optional limit marker.
component: true
demo: meter
---

## Installation

```sh
npx shadcn-nsh@latest add meter
```

## Usage

```tsx
import { Meter } from "@/components/ui/meter";
```

```tsx
<Meter value={0.65} />
```

## Examples

### Marker

```tsx
<Meter value={0.55} marker={0.8} style={{ width: 240 }} />
```

## API

Uses `progressRail` / `progressFill` from `progress`. No `nsh/base` wrapper.

| Prop     | Type     | Default    |
| -------- | -------- | ---------- |
| `value`  | `number` | (required) |
| `tone`   | `Tone`   |            |
| `marker` | `number` |            |
