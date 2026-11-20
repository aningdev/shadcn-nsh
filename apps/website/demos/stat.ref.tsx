// The reference of `stat.tsx`: the same page. The figure is upstream's own component (`Stat` in
// `packages/ui/stat.tsx`), so this page draws it too: the case declares itself a self-reference.
import { alpha, colors, type Tone } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { Area, Dot, Grid, Line, Plot, plotReference, plotWash } from "@/packages/ui/plot";
import { Stat, StatGroup } from "@/packages/ui/stat";

import { DemoPage } from "./kit";
import { Log, Panel, Segmented, Split } from "./stage";

const PERIODS = ["today", "7 days", "30 days"] as const;

type Period = (typeof PERIODS)[number];

/** The figures by period; the others hold whatever the period. */
const FIGURES: { label: string; tone: Tone; value: string | Record<Period, string> }[] = [
  {
    label: "Users",
    tone: "neutral",
    value: { today: "1.8k", "7 days": "12.4k", "30 days": "51.2k" },
  },
  { label: "Latency", tone: "accent", value: "42 ms" },
  { label: "Queue", tone: "info", value: "3" },
  { label: "Errors", tone: "warn", value: "0.2%" },
  { label: "Failures", tone: "destructive", value: "2" },
  {
    label: "Growth",
    tone: "up",
    value: { today: "+2.4%", "7 days": "+8.1%", "30 days": "+22.6%" },
  },
  { label: "Churn", tone: "down", value: "−1.2%" },
];

const valueOf = (value: string | Record<Period, string>, period: Period) =>
  typeof value === "string" ? value : value[period];

/** Today on the composite: 24 minute closes, and yesterday's close beside them. */
const INDEX_PREV = 4170.8;
const INDEX_TODAY = (() => {
  let s = 29;
  let price = 4176.2;
  return Array.from({ length: 24 }, (_, minute) => {
    s = (s * 16807) % 2147483647;
    price += ((s % 1000) / 1000 - 0.45) * 3.2;
    return { minute, price: Math.round(price * 100) / 100 };
  });
})();
const INDEX_NOW = INDEX_TODAY[INDEX_TODAY.length - 1].price;
const INDEX_CHANGE = ((INDEX_NOW - INDEX_PREV) / INDEX_PREV) * 100;
const INDEX_TONE: Tone = INDEX_CHANGE >= 0 ? "up" : "down";
const INDEX_SIGNED = `${INDEX_CHANGE >= 0 ? "+" : "−"}${Math.abs(INDEX_CHANGE).toFixed(2)}%`;

/** Today in 104 × 38: the line, a wash under it, yesterday's close dotted and the newest point
 * ringed. A sparkline is read, not picked: the plot takes no pointer. */
function IndexSparkline() {
  const color = () => (INDEX_CHANGE >= 0 ? colors.up : colors.down);
  const values = [INDEX_PREV, ...INDEX_TODAY.map((row) => row.price)];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const air = Math.max(0.2, (hi - lo) * 0.16);
  const yScale = { type: "linear" as const, domain: [lo - air, hi + air] as [number, number] };
  const xScale = {
    type: "linear" as const,
    domain: [-1.5, INDEX_TODAY.length + 1.5] as [number, number],
  };
  return (
    <View
      style={{ width: 104, height: 38 }}
      accessibilityLabel={`Today on the composite, ${INDEX_NOW.toFixed(2)}, ${INDEX_SIGNED}`}
    >
      <Plot
        data={INDEX_TODAY}
        y="price"
        xScale={xScale}
        yScale={yScale}
        interactive={false}
        style={{ flex: 1 }}
      >
        <Area curve="natural" backgroundStyle={plotWash(color(), 0.2)} />
        <Grid y={[INDEX_PREV]} style={plotReference(colors.mutedForeground)} />
        <Line curve="natural" style={{ stroke: color(), strokeWidth: 1.75 }} />
      </Plot>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        <Plot
          data={[INDEX_TODAY[INDEX_TODAY.length - 1]]}
          y="price"
          xScale={xScale}
          yScale={yScale}
          interactive={false}
          style={{ flex: 1 }}
        >
          <Dot
            value="price"
            r={5.5}
            style={{ fill: "transparent", stroke: alpha(color(), 0.4), strokeWidth: 1.5 }}
          />
          <Dot value="price" r={2.5} style={{ fill: color() }} />
        </Plot>
      </View>
    </View>
  );
}

function App() {
  const period = signal<Period>("7 days");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  return (
    <DemoPage title="Stat">
      <Text style={{ color: colors.mutedForeground }}>
        {"A label above a figure, for grids of them; a long value ends in an ellipsis."}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="period">
              <Segmented
                options={PERIODS}
                value={period()}
                onChange={(value) => (period.set(value), log(`period → ${value}`))}
              />
            </Panel>
            <Panel title="value">
              <Text
                style={{ fontSize: 13, color: colors.foreground, fontVariant: ["tabular-nums"] }}
              >
                {`Users ${valueOf(FIGURES[0].value, period())} · Growth ${valueOf(FIGURES[5].value, period())}`}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
              This month
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{period()}</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {FIGURES.map((figure) => (
              <Stat
                label={figure.label}
                value={valueOf(figure.value, period())}
                tone={figure.tone}
                width="31%"
              />
            ))}
          </View>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <StatGroup>
            <Stat label="Revenue" value="4.2" unit="M" note="vs last month" tone="up" />
            <Stat label="Latency" value="42" unit="ms" note="p95" tone="accent" />
          </StatGroup>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              The widest display in the fleet
            </Text>
            <View style={{ width: 180 }}>
              <Stat label="Display" value="MacBook Pro 16-inch, 2024" truncate />
            </View>
          </View>
        </View>
        <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
          <View class="flex-row items-baseline gap-3">
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
                Composite
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                NSH 100 · 24 stocks
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Today</Text>
          </View>
          <View class="flex-row items-center gap-4">
            <Stat
              label="Composite"
              value={INDEX_NOW.toFixed(2)}
              note={`${INDEX_SIGNED} today`}
              tone={INDEX_TONE}
            />
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <IndexSparkline />
            </View>
          </View>
          <Text class="text-faint" style={{ fontSize: 11 }}>
            Yesterday's close dotted · the newest minute ringed
          </Text>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
