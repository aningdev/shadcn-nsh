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

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Plot } from "shadcn-nsh/plot";
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
<Treemap labelClass="text-foreground data-dark:text-on-media" … />
```

`foreground` stays out of the appearance (dark in light and dark alike); `on-media` is the
white the theme keeps for a dark ground. Keep the scale's midpoint opaque: a fill mixed with the
background reads as a dark cell, and every label then wears the light ink, pale tiles included.

### A sparkline

A row's chart is a `Plot` with `interactive={false}`: no cross line, no hover dot, just the line. The
wash under it is `plotWash`, the previous close a dashed `Grid` at that value with
`plotReference`, and the newest point a second `Plot` over the first — only the last row in it — so
its `Dot` can be a ring around a solid centre.

```tsx
<View style={{ width: 104, height: 38 }}>
  <Plot
    data={rows}
    y="price"
    yScale={{ type: "linear", domain: [lo, hi] }}
    interactive={false}
    style={{ width: 104, height: 38 }}
  >
    <Area curve="natural" backgroundStyle={plotWash(tone, 0.2)} />
    <Grid y={[previousClose]} style={plotReference(colors.mutedForeground)} />
    <Line curve="natural" style={{ stroke: tone, strokeWidth: 1.75 }} />
  </Plot>
  <View
    style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}
  >
    <Plot
      data={[rows[rows.length - 1]]}
      y="price"
      yScale={{ type: "linear", domain: [lo, hi] }}
      interactive={false}
      style={{ width: 104, height: 38 }}
    >
      <Dot
        value="price"
        r={5.5}
        style={{ fill: "transparent", stroke: alpha(tone, 0.4), strokeWidth: 1.5 }}
      />
      <Dot value="price" r={2.5} style={{ fill: tone }} />
    </Plot>
  </View>
</View>
```

The domain is padded by a fifth of the range so the ring is not clipped at the top or the bottom;
`tone` is the theme's `up` or `down`, the same role the figure beside it uses.

### Bars and a donut

A grouped or stacked bar chart keeps its bands on the x scale and its baseline in the theme's
border: `paddingInner` and `paddingOuter` set the gap, `maxBandWidth` stops a wide window from
stretching a bar.

```tsx
<Plot
  data={sales}
  band
  xScale={{ paddingInner: 0.3, paddingOuter: 0.15, maxBandWidth: 56 }}
  yScale={{ type: "linear", domain: [0, 130] }}
  style={{ height: 200 }}
>
  <Grid y={[40, 80, 120]} style={plotGrid()} />
  <Grid y={[0]} style={plotBaseline()} />
  <Bar value="online" stack="sales" />
  <Bar value="store" stack="sales" />
</Plot>
```

A donut is a `Pie` with an `innerRadius` in percent and a small `padAngle`; the figure in its hole
is a view placed over the plot, not a label the plot writes:

```tsx
<View style={{ width: 132, height: 132 }}>
  <Plot data={regions} style={{ width: 132, height: 132 }}>
    <Pie
      value="revenue"
      innerRadius="62%"
      outerRadius={58}
      padAngle={2 / 58}
      cornerRadius={3}
      sliceClass={(_, i) => fills[i % fills.length]}
    />
  </Plot>
  <View
    style={{
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Total</Text>
    <Text style={{ fontSize: 17, fontWeight: "600" }}>{money(total)}</Text>
  </View>
</View>
```

### Candles with volume

A candle is a `Bar` from the open to the close and a `Rule` from the low to the high, both colored
by a `"dir"` category. The volume is a second `Plot` under the price one, sharing its band scale so
the bars line up, with its own right axis:

```tsx
<Plot
  data={days}
  xScale={bands}
  yScale={{ type: "linear", domain: [low, high] }}
  style={{ height: 150, marginRight: 40 }}
>
  <Grid y={[low + (high - low) / 3, low + ((high - low) * 2) / 3]} style={plotGrid()} />
  <Grid y={[low]} style={plotBaseline()} />
  <Rule value="high" base="low" color="dir" />
  <Bar value="close" base="open" color="dir" cornerRadii={1} />
  <PlotAxis placement="right" tickValues={[low, (low + high) / 2, high]} labelStyle={plotAxisText()} />
</Plot>

<Plot
  data={days}
  xScale={bands}
  yScale={{ type: "linear", domain: [0, volumeTop] }}
  style={{ height: 46, marginRight: 40 }}
>
  <Bar value="volume" color="dir" cornerRadii={1} />
  <PlotAxis placement="right" tickValues={[0, volumeTop / 2, volumeTop]} format={(v) => `${v}M`} labelStyle={plotAxisText()} />
  <PlotAxis tickValues={[0, 7, 15, 23]} format={(i) => `Day ${i + 1}`} labelStyle={plotAxisText()} />
</Plot>
```

Give both plots the same `colorScale` (`{ type: "ordinal", domain: ["up", "down"], range: [up, down] }`)
so a day's candle and its volume bar are one color.

## API

Uses `plotCrossLine` and `plotDotClass` by default. Every prop of [`nsh/base/plot` Plot](https://nsh.dev/elements/plot) passes through.

`Plot` does not expose its scales or a canvas the app can paint on. The geometry, including the insets the axis labels take, is computed in `nsh/base` (`references/nsh/crates/nsh-base/src/plot/mod.rs`: the plot around line 800, the y insets around 803–812, the y map around 902–926, and `.child` around 1361; `axis.rs` `label_insets` around line 474). Copying that inset in JavaScript would drift from the line, so this library does not add an overlay hook. A wash over a band is `plotWash`.

Also export `Legend` for a colored square and label beside a chart.

| Part     | Props              | Description                                        |
| -------- | ------------------ | -------------------------------------------------- |
| `Plot`   | `band` (`boolean`) | Uses `plotCrossLine` and `plotDotClass` by default |
| `Legend` |                    | A colored square and label beside a chart          |
