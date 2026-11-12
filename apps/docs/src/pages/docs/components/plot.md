---
title: Plot
description: Chart colors, grid, cross line and tooltip for nsh/base/plot.
component: true
demo: plot
---

## Installation

```sh
npx shadcn-nsh@latest add plot
```

## Usage

```tsx
import { Bar, Grid } from "nsh/base/plot";

import { Plot, seriesColor, plotGrid } from "@/components/ui/plot";
```

```tsx
<Plot data={rows} band style={{ height: 160 }}>
  <Grid y={[0, 50, 100]} style={plotGrid()} />
  <Bar value="online" style={{ fill: seriesColor(0) }} />
</Plot>
```

## API

Uses `plotCrossLine` and `plotDotClass` by default. Every prop of [`nsh/base/plot` Plot](https://nsh.dev/elements/plot) passes through.

Also export `Legend` for a colored square and label beside a chart.

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `band` | `boolean` |         |
