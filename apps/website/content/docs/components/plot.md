---
title: Plot
description: Chart colors, grid, cross line and tooltip for nsh/base/plot.
component: true
demo: plot
---

## Installation

```npm
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

### A label on a tile

A `Treemap` or `Bar` tile filled with a chart role takes two inks: a light tile reads a dark
label, a dark one a light label. `nsh/base/plot` sets `data-dark` on a label whose cell's colour
is dark, so `labelClass` names both:

```tsx
<Treemap labelClass="text-chart-foreground data-dark:text-on-media" … />
```

`chart-foreground` stays out of the appearance (dark in light and dark alike); `on-media` is the
white the theme keeps for a dark ground. Keep the scale's midpoint opaque: a fill mixed with the
background reads as a dark cell, and every label then wears the light ink, pale tiles included.

## API

Uses `plotCrossLine` and `plotDotClass` by default. Every prop of [`nsh/base/plot` Plot](https://nsh.dev/elements/plot) passes through.

`Plot` does not expose its scales or a canvas the app can paint on. The geometry, including the insets the axis labels take, is computed in `nsh/base` (`references/nsh/crates/nsh-base/src/plot/mod.rs`: the plot around line 800, the y insets around 803–812, the y map around 902–926, and `.child` around 1361; `axis.rs` `label_insets` around line 474). Copying that inset in JavaScript would drift from the line, so this library does not add an overlay hook. A wash over a band is `plotWash`.

Also export `Legend` for a colored square and label beside a chart.

| Part     | Props              | Description                                        |
| -------- | ------------------ | -------------------------------------------------- |
| `Plot`   | `band` (`boolean`) | Uses `plotCrossLine` and `plotDotClass` by default |
| `Legend` |                    | A colored square and label beside a chart          |
