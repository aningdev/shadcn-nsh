# Stat (/dev/docs/components/stat)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add stat
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Stat } from "shadcn-nsh/stat";
```

## Usage [#usage]

```tsx
import { Stat, StatGroup } from "@/components/ui/stat";
```

```tsx
<Stat label="Users" value="12.4k" />
```

## Composition [#composition]

Use the following composition to build a `StatGroup`:

```text
StatGroup
└── Stat
```

## Examples [#examples]

### Tone [#tone]

```tsx
<Stat label="Users" value="12.4k" tone="neutral" />
<Stat label="Latency" value="42 ms" tone="accent" />
<Stat label="Queue" value="3" tone="info" />
<Stat label="Errors" value="0.2%" tone="warn" />
<Stat label="Failures" value="2" tone="destructive" />
<Stat label="Growth" value="+8.1%" tone="up" />
<Stat label="Churn" value="−1.2%" tone="down" />
```

### Truncate [#truncate]

```tsx
<Stat label="Display" value="MacBook Pro 16-inch, 2024" truncate />
```

### Unit and note [#unit-and-note]

`unit` sits beside the value, smaller and muted. `note` is a line under it. shadcn/ui has no stat, so the names follow the figure a chart shows: a value, its unit, and a note.

```tsx
<Stat label="Latency" value="42" unit="ms" note="p95" tone="accent" />
```

### A row [#a-row]

`StatGroup` wraps several stats onto one row. A stat with no `width` shares that row. A hairline above a chart's figures is the group's class, not the default.

```tsx
<StatGroup class="border-line border-t pt-3">
  <Stat label="Open" value="182.40" />
  <Stat label="High" value="184.10" />
</StatGroup>
```

### A trend beside a figure [#a-trend-beside-a-figure]

A figure whose value moves with a series reads better with the series beside it: the `Stat` gives
the name, the value and the change in the same tone as the line, and a `Plot` at 104 × 38 draws the
trend without axes or a pointer — `interactive={false}`.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Stat label="Composite" value="4,182.60" note="+11.80 today" tone="up" />
  <View style={{ width: 104, height: 38 }}>
    <Plot
      data={minutes}
      y="price"
      yScale={{ type: "linear", domain: [lo, hi] }}
      interactive={false}
      style={{ width: 104, height: 38 }}
    >
      <Area curve="natural" backgroundStyle={plotWash(colors.success, 0.2)} />
      <Grid y={[previousClose]} style={plotReference(colors.mutedForeground)} />
      <Line curve="natural" style={{ stroke: colors.success, strokeWidth: 1.75 }} />
    </Plot>
    <View
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}
    >
      <Plot
        data={[minutes[minutes.length - 1]]}
        y="price"
        yScale={{ type: "linear", domain: [lo, hi] }}
        interactive={false}
        style={{ width: 104, height: 38 }}
      >
        <Dot
          value="price"
          r={5.5}
          style={{ fill: "transparent", stroke: alpha(colors.success, 0.4), strokeWidth: 1.5 }}
        />
        <Dot value="price" r={2.5} style={{ fill: colors.success }} />
      </Plot>
    </View>
  </View>
</View>
```

`note` carries the signed move and `tone` the role it and the line share; the previous close is a
dashed `Grid` behind the wash, so the day's direction is read at a glance.

## API [#api]

Gallery atom: no `nsh/base` counterpart. shadcn/ui has no stat either.

| Part        | Props                                                         | Description                                                                                  |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Stat`      | `label`, `value`, `unit`, `note`, `tone`, `width`, `truncate` | A muted label over a larger value; `tone` colors the value, `truncate` keeps it to one line. |
| `StatGroup` | —                                                             | A wrapping row of stats, 12 points apart.                                                    |