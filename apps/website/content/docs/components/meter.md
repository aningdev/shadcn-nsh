---
title: Meter
description: A horizontal meter with an optional limit marker.
component: true
demo: meter
---

## Installation

```npm
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

### Tone

```tsx
<Meter value={0.62} tone="neutral" />
<Meter value={0.62} tone="accent" />
<Meter value={0.62} tone="info" />
<Meter value={0.62} tone="warn" />
<Meter value={0.62} tone="destructive" />
<Meter value={0.62} tone="up" />
<Meter value={0.62} tone="down" />
```

### Marker

```tsx
<Meter value={0.55} marker={0.8} style={{ width: 240 }} />
```

## API

Uses `progressRail` / `progressFill` from `progress`. No `nsh/base` wrapper.

| Part    | Props                                                                              | Description                                          |
| ------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `Meter` | `value` (`number`, required), `tone` (`Tone \| (() => Tone)`), `marker` (`number`) | Uses `progressRail` / `progressFill` from `progress` |
