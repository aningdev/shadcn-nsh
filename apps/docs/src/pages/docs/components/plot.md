---
layout: ../../../layouts/Docs.astro
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

## Examples

### Legend

```tsx
<Legend color={seriesColor(0)} label="Revenue" value="42%" />
<Legend color={seriesColor(1)} label="Costs" />
```

### Line and area

`Plot` takes the rows and the axis; `Area`, `Line` and `Grid` are the marks.

```tsx
<Plot data={rows} y="price" yScale={{ type: "linear", domain: [40, 55] }}>
  <Grid style={plotGrid()} />
  <Grid style={plotBaseline()} />
  <Area backgroundStyle={plotWash(seriesColor(0))} style={{ fill: "transparent" }} />
  <Line
    style={{ stroke: seriesColor(0), strokeWidth: 2 }}
    hoverDotStyle={plotHoverDot(seriesColor(0))}
  />
</Plot>
```

### Cross line

```tsx
<Plot data={rows} y="price" {...plotCrossLine()} dotClass={plotDotClass}>
  <Line />
</Plot>
```

### Axis labels

```tsx
<PlotAxis placement="right" tickValues={[40, 48, 55]} labelStyle={plotAxisText()} />
```

## API

Uses `plotCrossLine` and `plotDotClass` by default. Every prop of [`nsh/base/plot` Plot](https://nsh.dev/elements/plot) passes through.

Also export `Legend` for a colored square and label beside a chart.

| Prop   | Type      | Default |
| ------ | --------- | ------- |
| `band` | `boolean` |         |
