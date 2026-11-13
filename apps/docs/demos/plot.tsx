// The official plot scenes with this library's plot look. `el-plot` is the price chart and the
// sales bars; the other six are its parts drawn on their own: a heatmap of cells, dots and
// bubbles, two y scales, a donut, candlesticks and a bridge, and a treemap. Each keeps the
// example's data, its header read out from the row or the mark under the pointer, its options and
// its log.
import { alpha } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { controlSize, sectionSurface } from "@/packages/ui/lib/surface";
import {
  Arc,
  Area,
  Bar,
  Cell,
  Dot,
  Grid,
  Line,
  Pie,
  Plot,
  PlotAxis,
  Rule,
  Treemap,
  categoryColors,
  plotAxisText,
  plotBaseline,
  plotCrossLine,
  plotDotClass,
  plotGrid,
  plotHoverDot,
  plotReference,
  plotWash,
  seriesColor,
} from "@/packages/ui/plot";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui, wide } from "./stage";

/** The label and detail sizes the demos read under `size`. */
const size = {
  label: controlSize.label,
  detail: controlSize.detail,
  rowSm: desktop ? 32 : controlSize.row,
};
/** Figures are tabular; the y axis' sit at the trailing edge. */
const num = { fontVariant: ["tabular-nums" as const], textAlign: "right" as const };
/** The room under a plot for its x axis' labels: their 12 above a line of 14. */
const AXIS_BELOW = 12 + 14;

/** One official chart example: its heading, the example's own line about it, then its stage and
 * inspector. */
function Scene(props: {
  title: string;
  hint?: string | (() => string);
  width?: number;
  inspector: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text class="text-foreground" style={{ fontSize: 15, fontWeight: 600 }}>
        {props.title}
      </Text>
      <If when={props.hint}>
        <Text class="text-muted-foreground">
          {typeof props.hint === "function" ? props.hint() : props.hint}
        </Text>
      </If>
      <Split width={props.width ?? 560} inspector={props.inspector}>
        {props.children}
      </Split>
    </View>
  );
}

// --- A price chart and sales bars (el-plot) -----------------------------------------------

type Row = { minute: number; price: number };
type Range = "1D" | "1W" | "1M";
type Curve = "natural" | "linear" | "stepAfter";

/** A repeatable walk, so every visit shows the same chart. */
const walk = (count: number, seed: number, start: number, step: number): Row[] => {
  let price = start;
  let s = seed;
  return Array.from({ length: count }, (_, minute) => {
    s = (s * 16807) % 2147483647;
    price += ((s % 1000) / 1000 - 0.47) * step;
    return { minute, price: Math.round(price * 100) / 100 };
  });
};
const clock = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const OCTOBER = Array.from({ length: 31 }, (_, d) => d + 1).filter(
  (d) => (d + 3) % 7 !== 0 && (d + 3) % 7 !== 6,
);
const RANGES: Record<
  Range,
  { rows: Row[]; ticks: string[]; period: string; time: (row: number) => string }
> = {
  "1D": {
    rows: walk(78, 7, 188, 1.2),
    ticks: ["9:30", "12:45", "16:00"],
    period: "Today",
    time: (i) => clock(570 + i * 5),
  },
  "1W": {
    rows: walk(35, 11, 181, 2.4),
    ticks: ["Mon", "Wed", "Fri"],
    period: "Past week",
    time: (i) => `${DAYS[Math.floor(i / 7)]} ${clock(600 + (i % 7) * 60)}`,
  },
  "1M": {
    rows: walk(22, 5, 172, 3.6),
    ticks: ["Oct 1", "Oct 15", "Oct 30"],
    period: "Past month",
    time: (i) => `Oct ${OCTOBER[i]}`,
  },
};

type Sale = { month: string; online: number; store: number };
type Mode = "grouped" | "stacked";
/** Sales per month, in thousands. */
const SALES: Sale[] = [
  [42, 31],
  [51, 28],
  [48, 36],
  [63, 33],
  [58, 40],
  [71, 38],
  [66, 44],
].map(([online, store], i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][i],
  online,
  store,
}));
const total = (d: Sale) => d.online + d.store;
/** The top of the sales' y scale: room above the highest stack for its label. */
const SALES_TOP = 130;

/** The y domain: the rows' extent, rounded out to whole steps of 5. */
const domain = (rows: Row[]): [number, number] => {
  const prices = rows.map((r) => r.price);
  return [Math.floor(Math.min(...prices) / 5) * 5, Math.ceil(Math.max(...prices) / 5) * 5];
};

/** A series' key: a swatch in its color, its name and the shown month's value. */
function Key(props: { color: string; label: string; value: string }) {
  return (
    <View class="flex-row items-center gap-1.5">
      <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: props.color }} />
      <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
        {props.label}
      </Text>
      <Text class="text-foreground" style={{ fontSize: size.detail, ...num }}>
        {props.value}
      </Text>
    </View>
  );
}

/** Sales per month as bars, side by side or stacked. */
function SalesCard(props: { mode: Mode; onHover: (index: number | null) => void }) {
  const hovered = signal<number | null>(null);
  const shown = () => SALES[hovered() ?? SALES.length - 1];
  const stacked = () => props.mode === "stacked";
  const height = desktop ? 200 : 180;
  // Tips rounded, bases square; a stack only at its top.
  const tip = { topLeft: 3, topRight: 3 };
  const labelStyle = () => ({
    fontSize: 11,
    paddingBottom: 3,
    color: ui().muted,
    fontVariant: ["tabular-nums" as const],
  });
  return (
    <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
      <View class="flex-row items-baseline gap-3">
        <View style={{ flex: 1, gap: 2 }}>
          <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
            Sales
          </Text>
          <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
            {`${shown().month} · thousands`}
          </Text>
        </View>
        <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
          {`${total(shown())}k`}
        </Text>
      </View>
      <View class="flex-row gap-4">
        <Key color={seriesColor(0)} label="Online" value={`${shown().online}k`} />
        <Key color={seriesColor(1)} label="In store" value={`${shown().store}k`} />
      </View>
      <View>
        <Plot
          data={SALES}
          // Half the inner gap at the ends: the bands' middles divide the width evenly.
          xScale={{
            type: "band",
            paddingInner: 0.3,
            paddingOuter: 0.15,
            maxBandWidth: 56,
            groupPadding: 0.12,
          }}
          yScale={{ type: "linear", domain: [0, SALES_TOP] }}
          accessibilityLabel={`Sales per month, online and in store, highest in Jul at ${total(SALES[6])}k`}
          accessibilityValue={{
            text:
              hovered() == null
                ? undefined
                : `${shown().month}: ${shown().online}k online, ${shown().store}k in store`,
          }}
          appearGeneration={stacked() ? 1 : 0}
          motion={{
            appear: { duration: 600, easing: "easeOut" },
            enter: { duration: 150 },
            exit: { duration: 180 },
            pointer: { stiffness: 320, damping: 32 },
          }}
          // The month under the pointer: a faint band over its bars.
          {...plotCrossLine({ band: true })}
          onHoverChange={({ index }) => {
            hovered.set(index);
            props.onHover(index);
          }}
          style={{ height, marginRight: 36, marginBottom: AXIS_BELOW }}
        >
          <Grid y={[40, 80, 120]} style={plotGrid()} />
          <Grid y={[0]} style={plotBaseline()} />
          <Bar
            value="online"
            stack={stacked() ? "sales" : undefined}
            cornerRadii={stacked() ? 0 : tip}
            stagger={0.4}
            inactiveOpacity={0.45}
            label={stacked() ? undefined : "online"}
            labelStyle={labelStyle()}
            style={{ fill: seriesColor(0) }}
          />
          <Bar
            value="store"
            stack={stacked() ? "sales" : undefined}
            cornerRadii={tip}
            stagger={0.4}
            inactiveOpacity={0.45}
            // Stacked, the top bar's label is the month's total.
            label={stacked() ? (d: Sale) => String(total(d)) : "store"}
            labelStyle={labelStyle()}
            style={{ fill: seriesColor(1) }}
          />
          {/* The grid's values right of the plot, a month centered under each band. */}
          <PlotAxis
            placement="right"
            tickValues={[0, 40, 80, 120]}
            labelStyle={{ ...plotAxisText(), width: 36, paddingLeft: 8, textAlign: "right" }}
          />
          <PlotAxis
            format={(i) => SALES[i].month}
            labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
          />
        </Plot>
      </View>
    </View>
  );
}

function PriceScene() {
  const chart = signal<"price" | "sales">("price");
  const mode = signal<Mode>("grouped");
  const range = signal<Range>("1D");
  const curve = signal<Curve>("natural");
  const hovered = signal<number | null>(null);
  // The last row hovered: the tooltip keeps it while it fades out.
  const tipRow = signal(0);
  const events = signal<string[]>([]);
  const rows = () => RANGES[range()].rows;
  const [lo, hi] = [() => domain(rows())[0], () => domain(rows())[1]];
  // The hovered row, or the last one; a row of the range before a switch reads as the last one of
  // the new range.
  const shown = () => {
    const all = rows();
    const at = hovered();
    return all[at != null && at < all.length ? at : all.length - 1];
  };
  const open = () => rows()[0].price;
  const change = () => shown().price - open();
  const color = () => (change() >= 0 ? ui().up : ui().down);
  // Signed figures: an explicit plus and a true minus.
  const signed = (v: number, digits: number) =>
    `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(digits)}`;
  const label = (v: number) => v.toFixed(0);
  const height = desktop ? 200 : 180;
  return (
    <Scene
      title="Price and sales (el-plot)"
      hint={() =>
        desktop
          ? "Move the pointer over the chart to read a row"
          : chart() === "price"
            ? "Pick a range to draw other rows"
            : "Stack the bars to read each month's total"
      }
      inspector={
        <>
          <Panel title="chart">
            <Segmented
              options={["price", "sales"] as const}
              value={chart()}
              onChange={(value) => {
                chart.set(value);
                hovered.set(null);
              }}
            />
          </Panel>
          <If
            when={chart() === "price"}
            else={
              <Panel title="bars">
                <Segmented
                  options={["grouped", "stacked"] as const}
                  value={mode()}
                  onChange={(value) => mode.set(value)}
                />
                <Text class="text-foreground" style={{ fontSize: 13, ...num, textAlign: "left" }}>
                  {`${SALES.length} bands · ${mode() === "stacked" ? "one stack" : "two bars"} each`}
                </Text>
              </Panel>
            }
          >
            <Panel title="data · curve">
              <Segmented
                options={["1D", "1W", "1M"] as const}
                value={range()}
                onChange={(value) => {
                  range.set(value);
                  hovered.set(null);
                }}
              />
              <Segmented
                options={["natural", "linear", "stepAfter"] as const}
                value={curve()}
                onChange={(value) => curve.set(value)}
              />
              <Text class="text-foreground" style={{ fontSize: 13, ...num, textAlign: "left" }}>
                {`${rows().length} rows · domain ${lo()} to ${hi()}`}
              </Text>
            </Panel>
          </If>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <If
        when={chart() === "price"}
        else={
          <SalesCard
            mode={mode()}
            onHover={(index) => {
              const line =
                index == null
                  ? "null: left the chart"
                  : `${index}: ${SALES[index].month}, ${total(SALES[index])}k`;
              events.set([line, ...events()].slice(0, 5));
            }}
          />
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
          <View class="flex-row items-baseline gap-3">
            <View style={{ flex: 1, gap: 2 }}>
              <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                NSH Labs
              </Text>
              <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
                {`${RANGES[range()].period} · open ${open().toFixed(2)}`}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 2 }}>
              <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
                {shown().price.toFixed(2)}
              </Text>
              <Text style={{ fontSize: size.detail, color: color(), ...num }}>
                {`${signed(change(), 2)} (${signed((change() / open()) * 100, 2)}%)`}
              </Text>
            </View>
          </View>

          <View>
            <Plot
              data={rows()}
              y="price"
              yScale={{ type: "linear", domain: [lo(), hi()] }}
              accessibilityLabel={`NSH Labs, ${range()}: from ${rows()[0].price.toFixed(2)} to ${rows()[rows().length - 1].price.toFixed(2)}`}
              accessibilityValue={{
                text:
                  hovered() == null
                    ? undefined
                    : `${RANGES[range()].time(hovered()!)}: ${shown().price.toFixed(2)}`,
              }}
              // Motion of the app's: the marks draw in for each range, the hover fades and glides;
              // reduced motion shows it all at once.
              appearGeneration={["1D", "1W", "1M"].indexOf(range())}
              motion={{
                appear: { duration: 700, easing: "easeOut" },
                enter: { duration: 120 },
                exit: { duration: 180 },
                pointer: { stiffness: 300, damping: 30 },
              }}
              {...plotCrossLine()}
              dotClass={plotDotClass}
              // The time of the row, at the foot of the cross line, kept within the plot's width.
              tooltipOffset={height + 9}
              tooltipContent={
                <View
                  style={{
                    backgroundColor: ui().raised.backgroundColor,
                    borderWidth: 1,
                    borderColor: ui().border,
                    height: 20,
                    paddingHorizontal: 6,
                    borderRadius: 6,
                    justifyContent: "center",
                  }}
                >
                  <Text class="text-foreground" style={{ fontSize: 11, ...num }}>
                    {RANGES[range()].time(Math.min(tipRow(), rows().length - 1))}
                  </Text>
                </View>
              }
              onHoverChange={({ index }) => {
                hovered.set(index);
                if (index != null) tipRow.set(index);
                const line =
                  index == null
                    ? "null: left the chart"
                    : `${index}: ${rows()[index].price.toFixed(2)}`;
                events.set([line, ...events()].slice(0, 5));
              }}
              style={{ height, marginRight: 36, marginBottom: AXIS_BELOW }}
            >
              <Grid y={[(lo() + hi()) / 2, hi()]} style={plotGrid()} />
              {/* A wash that fades out toward the baseline; the line has the dot. */}
              <Area
                curve={curve()}
                backgroundStyle={plotWash(color(), 0.16)}
                hoverDotClass="hidden"
              />
              <Grid y={[lo()]} style={plotBaseline()} />
              <Grid y={[open()]} style={plotReference()} />
              {/* Its dot in its color, ringed: it cuts out of the line. */}
              <Line
                curve={curve()}
                style={{ stroke: color(), strokeWidth: 2 }}
                hoverDotStyle={plotHoverDot(color())}
              />
              {/* The grid's values right of the plot, the range's times under it. */}
              <PlotAxis
                placement="right"
                tickValues={[lo(), (lo() + hi()) / 2, hi()]}
                format={label}
                labelStyle={{ ...plotAxisText(), paddingLeft: 8 }}
              />
              <PlotAxis
                ticks={RANGES[range()].ticks.length}
                format={(_, i) => RANGES[range()].ticks[i]}
                labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
              />
            </Plot>
          </View>
        </View>
      </If>
    </Scene>
  );
}

// --- Heatmaps (el-plot-cells) --------------------------------------------------------------

type Month = { year: string; month: string; ret: number };
type Hour = { day: string; hour: string; trades: number };

/** A repeatable stream of numbers in [0, 1), so every visit shows the same chart. */
const random = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s % 10000) / 10000;
  };
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Four years of a stock's monthly returns in percent, this year's up to October. */
const RETURNS: Month[] = (() => {
  const r = random(41);
  const drift: Record<string, number> = { "2023": 2.4, "2024": 1.9, "2025": 0.6, "2026": 1.2 };
  return Object.keys(drift).flatMap((year) =>
    MONTHS.slice(0, year === "2026" ? 10 : 12).map((month) => ({
      year,
      month,
      ret: Math.round((drift[year] + (r() - 0.5) * 12) * 10) / 10,
    })),
  );
})();
const HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];
/** A week of a market's trades per hour, in thousands: busy at the open and the close, closed from
 * 12:00 to 13:00. */
const ACTIVITY: Hour[] = (() => {
  const r = random(17);
  const shape = [1, 0.62, 0.5, null, 0.58, 0.55, 0.86];
  return WEEK.flatMap((day, d) =>
    HOURS.flatMap((hour, h) =>
      shape[h] == null
        ? []
        : [
            {
              day,
              hour,
              trades: Math.round(40 * shape[h]! * (0.92 + d * 0.04) * (0.9 + r() * 0.2) * 10) / 10,
            },
          ],
    ),
  );
})();

const signedPct = (v: number) => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(1)}%`;
/** The largest move either way: the ends of the diverging scale's own domain. */
const REACH = Math.max(...RETURNS.map((m) => Math.abs(m.ret)));
const CHART_MOTION = {
  appear: { duration: 900, easing: "easeOut" },
  enter: { duration: 120 },
  exit: { duration: 180 },
  pointer: { stiffness: 380, damping: 34 },
} as const;

function CellsScene() {
  const chart = signal<"returns" | "activity">("returns");
  const hovered = signal<number | null>(null);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const month = () =>
    hovered() == null || chart() !== "returns" ? undefined : RETURNS[hovered()!];
  const hour = () =>
    hovered() == null || chart() !== "activity" ? undefined : ACTIVITY[hovered()!];
  // A ring around the cell under the pointer, in the text's color, a little out from its edge.
  const ring = () => ({ outlineWidth: 1.5, outlineOffset: 1.5, outlineColor: ui().text });
  const returnsRamp = () => [ui().down, ui().line, ui().up];
  const activityRamp = () => [ui().line, seriesColor(0)];
  const key = (ramp: string[], labels: string[]) => (
    <View style={{ gap: 4 }}>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundImage: `linear-gradient(to right, ${ramp.join(", ")})`,
        }}
      />
      <View class="flex-row justify-between">
        {labels.map((l) => (
          <Text class="text-muted-foreground" style={{ fontSize: 11, ...num }}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
  return (
    <Scene
      title="Heatmaps (el-plot-cells)"
      hint={() =>
        desktop
          ? "Move the pointer over a cell to read it"
          : chart() === "returns"
            ? "Each cell is a month's return"
            : "Each cell is an hour's trades"
      }
      inspector={
        <>
          <Panel title="chart">
            <Segmented
              options={["returns", "activity"] as const}
              value={chart()}
              onChange={(value) => {
                chart.set(value);
                hovered.set(null);
              }}
            />
            <Text class="text-foreground" style={{ fontSize: 13, ...num }}>
              {chart() === "returns"
                ? `colorScale diverging · ${RETURNS.length} rows`
                : `colorScale sequential · ${ACTIVITY.length} rows`}
            </Text>
          </Panel>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
        <If
          when={chart() === "returns"}
          else={
            <>
              <View class="flex-row items-baseline gap-3">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                    {hour() ? `${hour()!.day} ${hour()!.hour}` : "Trades per hour"}
                  </Text>
                  <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
                    {hour() ? "thousand trades" : "A week, closed from 12:00 to 13:00"}
                  </Text>
                </View>
                <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
                  {hour() ? `${hour()!.trades.toFixed(1)}k` : ""}
                </Text>
              </View>
              {key(activityRamp(), ["Fewer", "More"])}
              <Plot
                data={ACTIVITY}
                xScale={{ type: "band", domain: HOURS, paddingInner: 0.12 }}
                yScale={{ type: "band", domain: WEEK, paddingInner: 0.12 }}
                colorScale={{ type: "sequential", range: activityRamp() }}
                accessibilityLabel="Trades per hour over a week, busiest at the open"
                accessibilityValue={{
                  text:
                    hour() && `${hour()!.day} ${hour()!.hour}: ${hour()!.trades} thousand trades`,
                }}
                appearGeneration="activity"
                motion={CHART_MOTION}
                onHoverChange={({ index }) => {
                  hovered.set(index);
                  const h = index == null ? undefined : ACTIVITY[index];
                  log(
                    h == null
                      ? "null: left the chart"
                      : `${index}: ${h.day} ${h.hour}, ${h.trades}k`,
                  );
                }}
                style={{ height: WEEK.length * 30, marginLeft: 36, marginTop: 20 }}
              >
                <Cell
                  x="hour"
                  y="day"
                  value="trades"
                  cornerRadii={4}
                  stagger={0.6}
                  inactiveOpacity={0.4}
                  hoverCellClass="rounded-[5px]"
                  hoverCellStyle={ring()}
                />
                <PlotAxis
                  placement="top"
                  labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingBottom: 6 }}
                />
                <PlotAxis
                  placement="left"
                  labelStyle={{ ...plotAxisText(), width: 36, paddingRight: 8, textAlign: "right" }}
                />
              </Plot>
            </>
          }
        >
          <View class="flex-row items-baseline gap-3">
            <View style={{ flex: 1, gap: 2 }}>
              <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                {month() ? `${month()!.month} ${month()!.year}` : "Monthly returns"}
              </Text>
              <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
                {month() ? "the month's return" : "Red for a loss, green for a gain"}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: month() ? (month()!.ret < 0 ? ui().down : ui().up) : ui().text,
                ...num,
              }}
            >
              {month() ? signedPct(month()!.ret) : ""}
            </Text>
          </View>
          {key(returnsRamp(), [signedPct(-REACH), "0", signedPct(REACH)])}
          <Plot
            data={RETURNS}
            xScale={{ type: "band", domain: MONTHS, paddingInner: 0.1 }}
            yScale={{ type: "band", paddingInner: 0.12 }}
            colorScale={{ type: "diverging", range: returnsRamp() }}
            accessibilityLabel={`Monthly returns since 2023, ${RETURNS.filter((m) => m.ret > 0).length} of ${RETURNS.length} months up`}
            accessibilityValue={{
              text: month() && `${month()!.month} ${month()!.year}: ${signedPct(month()!.ret)}`,
            }}
            appearGeneration="returns"
            motion={CHART_MOTION}
            onHoverChange={({ index }) => {
              hovered.set(index);
              const m = index == null ? undefined : RETURNS[index];
              log(
                m == null
                  ? "null: left the chart"
                  : `${index}: ${m.month} ${m.year}, ${signedPct(m.ret)}`,
              );
            }}
            style={{ height: 4 * 30, marginLeft: 36, marginTop: 20 }}
          >
            <Cell
              x="month"
              y="year"
              value="ret"
              cornerRadii={3}
              stagger={0.6}
              inactiveOpacity={0.4}
              label={(d: Month) => (d.ret < 0 ? `−${(-d.ret).toFixed(1)}` : d.ret.toFixed(1))}
              labelClass="text-black/70 data-dark:text-white/90"
              labelStyle={{ fontSize: 10, ...num }}
              hoverCellClass="rounded-[4px]"
              hoverCellStyle={ring()}
            />
            <PlotAxis
              placement="top"
              labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingBottom: 6 }}
            />
            <PlotAxis
              placement="left"
              labelStyle={{ ...plotAxisText(), width: 36, paddingRight: 8, textAlign: "right" }}
            />
          </Plot>
          <Text class="text-muted-foreground" style={{ fontSize: 12 }}>
            Each return shows where its cell has room for it.
          </Text>
        </If>
      </View>
    </Scene>
  );
}

// --- Dots and bubbles (el-plot-dots) -------------------------------------------------------

type Platform = "iOS" | "Android" | "Web";
type Session = { minutes: number; trades: number; platform: Platform };
type Region = "Asia" | "Africa" | "Americas" | "Europe" | "Oceania";
type Country = { name: string; gdp: number; life: number; pop: number; region: Region };

const PLATFORMS: Platform[] = ["iOS", "Android", "Web"];
/** Fifteen sessions per platform around its own habits, in the order of their length. */
const SESSIONS: Session[] = (() => {
  const r = random(23);
  const centers = { iOS: [14, 6], Android: [9, 4], Web: [24, 10] } as const;
  return PLATFORMS.flatMap((platform) =>
    Array.from({ length: 15 }, () => {
      const [m, t] = centers[platform];
      const minutes = Math.max(1, Math.round(m + (r() - 0.5) * m * 1.1));
      const trades = Math.max(0, Math.round(t * (minutes / m) + (r() - 0.5) * 5));
      return { minutes, trades, platform };
    }),
  ).sort((a, b) => a.minutes - b.minutes);
})();

/** Countries' GDP per person (thousands of dollars), life expectancy (years) and population
 * (millions), in the order of income. */
const COUNTRIES: Country[] = (
  [
    ["Ethiopia", 1.3, 66.6, 127, "Africa"],
    ["Nigeria", 1.6, 53.6, 224, "Africa"],
    ["India", 2.5, 70.8, 1430, "Asia"],
    ["Egypt", 3.5, 70.4, 113, "Africa"],
    ["Vietnam", 4.3, 74.6, 99, "Asia"],
    ["Indonesia", 4.9, 71.3, 278, "Asia"],
    ["South Africa", 6.0, 63.2, 60, "Africa"],
    ["Brazil", 10.0, 75.8, 216, "Americas"],
    ["China", 12.6, 78.6, 1410, "Asia"],
    ["Mexico", 13.9, 74.8, 129, "Americas"],
    ["South Korea", 33.1, 83.7, 52, "Asia"],
    ["Japan", 33.8, 84.7, 124, "Asia"],
    ["France", 44.5, 82.8, 68, "Europe"],
    ["United Kingdom", 48.9, 81.3, 68, "Europe"],
    ["Germany", 52.7, 81.4, 84, "Europe"],
    ["Australia", 64.7, 83.5, 27, "Oceania"],
    ["United States", 80.4, 77.5, 335, "Americas"],
  ] as const
).map(([name, gdp, life, pop, region]) => ({ name, gdp, life, pop, region }));
const REGIONS: Region[] = ["Asia", "Africa", "Americas", "Europe", "Oceania"];

function DotsScene() {
  const chart = signal<"scatter" | "bubbles">("scatter");
  const hovered = signal<number | null>(null);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const height = desktop ? 220 : 200;
  // Categories that read apart at a glance: the shared plot look's.
  const platformColors = () => categoryColors().slice(0, 3);
  const regionColors = categoryColors;
  const session = () =>
    hovered() == null || chart() !== "scatter" ? undefined : SESSIONS[hovered()!];
  const country = () =>
    hovered() == null || chart() !== "bubbles" ? undefined : COUNTRIES[hovered()!];
  // A ring around the dot under the pointer, in the text's color, a little out from its edge.
  const ring = () => ({ outlineWidth: 1.5, outlineOffset: 1.5, outlineColor: ui().text });
  const key = (color: string, label: string) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: color }} />
      <Text class="text-muted-foreground" style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
  return (
    <Scene
      title="Dots and bubbles (el-plot-dots)"
      hint={() =>
        desktop
          ? "Move the pointer over a dot to read it"
          : chart() === "scatter"
            ? "Each dot is a session, colored by platform"
            : "Each bubble's area is a country's population"
      }
      inspector={
        <>
          <Panel title="chart">
            <Segmented
              options={["scatter", "bubbles"] as const}
              value={chart()}
              onChange={(value) => {
                chart.set(value);
                hovered.set(null);
              }}
            />
            <Text class="text-foreground" style={{ fontSize: 13, ...num }}>
              {chart() === "scatter"
                ? `Dot x minutes · value trades · ${SESSIONS.length} rows`
                : `Dot r pop · rScale sqrt · ${COUNTRIES.length} rows`}
            </Text>
          </Panel>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
        <If
          when={chart() === "scatter"}
          else={
            <>
              <View class="flex-row items-baseline gap-3">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                    {country()?.name ?? "Income and lifespan"}
                  </Text>
                  <Text class="text-muted-foreground" style={{ fontSize: size.detail, ...num }}>
                    {country()
                      ? `${country()!.region} · ${country()!.pop.toLocaleString("en-US")}M people`
                      : "GDP per person against life expectancy"}
                  </Text>
                </View>
                <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
                  {country() ? `${country()!.life.toFixed(1)} yrs` : ""}
                </Text>
              </View>
              <View class="flex-row flex-wrap gap-x-3 gap-y-1">
                {REGIONS.map((r, i) => key(regionColors()[i], r))}
              </View>
              <Plot
                data={COUNTRIES}
                x="gdp"
                xScale={{ type: "linear", domain: [-10, 95] }}
                yScale={{ type: "linear", domain: [48, 90] }}
                colorScale={{
                  type: "ordinal",
                  domain: REGIONS,
                  range: regionColors().map((c) => alpha(c, 0.78)),
                }}
                accessibilityLabel={`${COUNTRIES.length} countries by GDP per person and life expectancy, sized by population`}
                accessibilityValue={{
                  text:
                    country() &&
                    `${country()!.name}: $${country()!.gdp}k per person, ${country()!.life} years`,
                }}
                appearGeneration="bubbles"
                motion={CHART_MOTION}
                onHoverChange={({ index }) => {
                  hovered.set(index);
                  const c = index == null ? undefined : COUNTRIES[index];
                  log(
                    c == null
                      ? "null: left the chart"
                      : `${index}: ${c.name}, $${c.gdp}k, ${c.life} yrs, ${c.pop}M`,
                  );
                }}
                style={{ height, marginRight: 36, marginBottom: AXIS_BELOW }}
              >
                <Grid x={[20, 40, 60, 80]} y={[60, 70, 80]} style={plotGrid()} />
                {/* A bubble's area is its population: radii from 3 to the largest's, over 0 to the
                    most people. */}
                <Dot
                  value="life"
                  r="pop"
                  rScale={{ type: "sqrt", range: [3, desktop ? 26 : 18] }}
                  color="region"
                  stagger={0.5}
                  inactiveOpacity={0.25}
                  style={{ stroke: ui().card.backgroundColor, strokeWidth: 1 }}
                  hoverDotClass="rounded-full"
                  hoverDotStyle={ring()}
                />
                <PlotAxis
                  placement="right"
                  tickValues={[60, 70, 80]}
                  format={(v) => `${v}`}
                  labelStyle={{ ...plotAxisText(), width: 36, paddingLeft: 8, textAlign: "right" }}
                />
                <PlotAxis
                  tickValues={[0, 20, 40, 60, 80]}
                  format={(v) => `$${v}k`}
                  labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
                />
              </Plot>
            </>
          }
        >
          <View class="flex-row items-baseline gap-3">
            <View style={{ flex: 1, gap: 2 }}>
              <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                {session() ? `${session()!.platform} session` : "Sessions"}
              </Text>
              <Text class="text-muted-foreground" style={{ fontSize: size.detail, ...num }}>
                {session()
                  ? `${session()!.minutes} minutes in the app`
                  : `${SESSIONS.length} sessions · minutes against trades`}
              </Text>
            </View>
            <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
              {session() ? `${session()!.trades} trades` : ""}
            </Text>
          </View>
          <View class="flex-row flex-wrap gap-x-3 gap-y-1">
            {PLATFORMS.map((p, i) => key(platformColors()[i], p))}
          </View>
          <Plot
            data={SESSIONS}
            x="minutes"
            xScale={{ type: "linear", domain: [0, 42] }}
            yScale={{ type: "linear", domain: [0, 22] }}
            colorScale={{ type: "ordinal", domain: [...PLATFORMS], range: platformColors() }}
            accessibilityLabel={`${SESSIONS.length} sessions by minutes in the app and trades placed, longest on the web`}
            accessibilityValue={{
              text:
                session() &&
                `${session()!.platform}: ${session()!.minutes} minutes, ${session()!.trades} trades`,
            }}
            appearGeneration="scatter"
            motion={CHART_MOTION}
            onHoverChange={({ index }) => {
              hovered.set(index);
              const s = index == null ? undefined : SESSIONS[index];
              log(
                s == null
                  ? "null: left the chart"
                  : `${index}: ${s.platform}, ${s.minutes} min, ${s.trades} trades`,
              );
            }}
            style={{ height, marginRight: 36, marginBottom: AXIS_BELOW }}
          >
            <Grid x={[10, 20, 30, 40]} y={[5, 10, 15, 20]} style={plotGrid()} />
            <Grid y={[0]} style={plotBaseline()} />
            <Dot
              value="trades"
              r={desktop ? 4 : 4.5}
              color="platform"
              stagger={0.6}
              inactiveOpacity={0.3}
              style={{ stroke: ui().card.backgroundColor, strokeWidth: 1.5 }}
              hoverDotClass="rounded-full"
              hoverDotStyle={ring()}
            />
            <PlotAxis
              placement="right"
              tickValues={[5, 10, 15, 20]}
              labelStyle={{ ...plotAxisText(), width: 36, paddingLeft: 8, textAlign: "right" }}
            />
            <PlotAxis
              tickValues={[0, 10, 20, 30, 40]}
              format={(v) => `${v} min`}
              labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
            />
          </Plot>
        </If>
      </View>
    </Scene>
  );
}

// --- Two y scales (el-plot-dual) -----------------------------------------------------------

type Day = { day: number; volume: number; close: number; dir: "up" | "down" };

/** A repeatable walk of a stock's days: its close and its volume in millions of shares, heavier on
 * the days that move more. */
function walkCandles(seed: number, start: number, volume: number): Day[] {
  let s = seed;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s % 1000) / 1000;
  };
  let close = start;
  return Array.from({ length: 20 }, (_, day) => {
    const before = close;
    close = Math.round(close * (1 + (next() - 0.47) * 0.04) * 100) / 100;
    const move = Math.abs(close / before - 1);
    return {
      day,
      close,
      volume: Math.round(volume * (0.7 + next() * 0.5) * (1 + move * 18) * 10) / 10,
      dir: close >= before ? ("up" as const) : ("down" as const),
    };
  });
}

const SYMBOLS = {
  ORBX: walkCandles(23, 184, 42),
  QBIT: walkCandles(71, 36.5, 160),
} as const;
type Symbol = keyof typeof SYMBOLS;
const SIDE = 40;
const shares = (m: number) =>
  m === 0 ? "0" : m >= 1000 ? `${(m / 1000).toFixed(1)}B` : `${m.toFixed(0)}M`;

function DualScene() {
  const symbol = signal<Symbol>("ORBX");
  const aligned = signal(true);
  const hovered = signal<number | null>(null);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const height = desktop ? 200 : 180;
  const rows = () => SYMBOLS[symbol()];
  const day = () => rows()[hovered() ?? rows().length - 1];
  const tone = (dir: string) => (dir === "down" ? ui().down : ui().up);
  return (
    <Scene
      title="Two y scales (el-plot-dual)"
      hint={
        desktop
          ? "Move the pointer over the chart to read both values"
          : "Volume on the left scale, the close on the right"
      }
      inspector={
        <>
          <Panel title="symbol">
            <Segmented
              options={["ORBX", "QBIT"] as const}
              value={symbol()}
              onChange={(value) => symbol.set(value)}
            />
          </Panel>
          <Panel title="alignTicks">
            <Segmented
              options={["on", "off"] as const}
              value={aligned() ? "on" : "off"}
              onChange={(value) => aligned.set(value === "on")}
            />
            <Text class="text-foreground" style={{ fontSize: 13, ...num }}>
              {aligned() ? "Both scales in the same steps" : "Each scale its own extent"}
            </Text>
          </Panel>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
        <View class="flex-row items-baseline gap-3">
          <View style={{ flex: 1, gap: 2 }}>
            <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
              {symbol()}
            </Text>
            <Text class="text-muted-foreground" style={{ fontSize: size.detail, ...num }}>
              {`Day ${day().day + 1} · ${shares(day().volume)} shares`}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: 600, color: tone(day().dir), ...num }}>
            {`$${day().close.toFixed(2)}`}
          </Text>
        </View>
        <View class="flex-row justify-between">
          <Text class="text-faint" style={{ ...plotAxisText(), fontSize: 10, letterSpacing: 0.8 }}>
            SHARES
          </Text>
          <Text class="text-faint" style={{ ...plotAxisText(), fontSize: 10, letterSpacing: 0.8 }}>
            USD
          </Text>
        </View>
        <Plot
          data={rows()}
          xScale={{ type: "band", paddingInner: 0.3, paddingOuter: 0.15 }}
          alignTicks={aligned()}
          colorScale={{
            type: "ordinal",
            domain: ["up", "down"],
            range: [alpha(ui().up, 0.5), alpha(ui().down, 0.5)],
          }}
          accessibilityLabel={`${symbol()}, ${rows().length} days: volume and close`}
          accessibilityValue={{
            text:
              hovered() == null
                ? undefined
                : `Day ${day().day + 1}: close ${day().close}, ${shares(day().volume)} shares`,
          }}
          appearGeneration="dual"
          motion={{
            appear: { duration: 800, easing: "easeOut" },
            update: { duration: 600, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
          }}
          {...plotCrossLine({ band: true })}
          dotStyle={{
            width: 9,
            height: 9,
            borderRadius: 4.5,
            borderWidth: 2,
            borderColor: seriesColor(0),
            backgroundColor: ui().card.backgroundColor,
          }}
          onHoverChange={({ index }) => {
            hovered.set(index);
            const d = index == null ? undefined : rows()[index];
            log(d == null ? "null: left the chart" : `${index}: $${d.close} · ${shares(d.volume)}`);
          }}
          style={{ height, marginLeft: SIDE, marginRight: SIDE, marginBottom: AXIS_BELOW }}
        >
          {/* No values: lines at the ticks of the y scale, which the right axis' share. */}
          <Grid style={plotGrid()} />
          <Bar
            value="volume"
            color="dir"
            cornerRadii={{ topLeft: 1.5, topRight: 1.5 }}
            stagger={0.5}
            inactiveOpacity={0.4}
          />
          <Line
            y="close"
            scale="y2"
            curve="linear"
            style={{ stroke: seriesColor(0), strokeWidth: 2 }}
          />
          <PlotAxis
            placement="left"
            format={shares}
            labelStyle={{ ...plotAxisText(), width: SIDE, paddingRight: 8, textAlign: "right" }}
          />
          <PlotAxis
            placement="right"
            scale="y2"
            format={(v) => v.toFixed(0)}
            labelStyle={{ ...plotAxisText(), width: SIDE, paddingLeft: 8 }}
          />
          <PlotAxis
            tickValues={[0, 9, 19]}
            format={(i) => `Day ${i + 1}`}
            labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
          />
        </Plot>
      </View>
    </Scene>
  );
}

// --- A donut (el-plot-pie) -----------------------------------------------------------------

type Part = { name: string; revenue: number };
type Breakdown = "Region" | "Channel" | "None";
type Shape = "donut" | "pie";

const BREAKDOWNS: Record<Breakdown, Part[]> = {
  Region: [
    { name: "North America", revenue: 482 },
    { name: "EMEA", revenue: 312 },
    { name: "APAC", revenue: 268 },
    { name: "Latin America", revenue: 104 },
    { name: "Other", revenue: 74 },
  ],
  Channel: [
    { name: "Direct", revenue: 540 },
    { name: "Partners", revenue: 330 },
    { name: "Marketplace", revenue: 250 },
    { name: "Resellers", revenue: 120 },
  ],
  None: [
    { name: "North America", revenue: 0 },
    { name: "EMEA", revenue: 0 },
  ],
};

/** The theme's series colors, as a slice's fill and a legend key's background. */
const FILLS = ["fill-chart-1", "fill-chart-2", "fill-chart-3", "fill-chart-4", "fill-chart-5"];
const KEYS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(2)}M` : `$${k}k`);
const percent = (share: number) => `${(share * 100).toFixed(1)}%`;

function PieScene() {
  const breakdown = signal<Breakdown>("Region");
  const shape = signal<Shape>("donut");
  const hovered = signal<number | null>(null);
  const events = signal<string[]>([]);
  const parts = () => BREAKDOWNS[breakdown()];
  const totalRevenue = () => parts().reduce((sum, p) => sum + p.revenue, 0);
  const shown = () => {
    const at = hovered();
    return at == null ? undefined : parts()[at];
  };
  const share = (p: Part) => (totalRevenue() > 0 ? p.revenue / totalRevenue() : 0);
  // The ring's size: its rim is half of it, the gaps 2 points wide there.
  const ring = desktop ? 200 : 184;
  const donut = () => shape() === "donut";
  return (
    <Scene
      title="A donut (el-plot-pie)"
      hint={
        desktop
          ? "Move the pointer over a slice to read it"
          : "Pick a breakdown to draw other slices"
      }
      width={520}
      inspector={
        <>
          <Panel title="shape · data">
            <Segmented
              options={["donut", "pie"] as const}
              value={shape()}
              onChange={(value) => shape.set(value)}
            />
            <Segmented
              options={["Region", "Channel", "None"] as const}
              value={breakdown()}
              onChange={(value) => {
                breakdown.set(value);
                hovered.set(null);
              }}
            />
            <Text class="text-foreground" style={{ fontSize: 13 }}>
              {`${parts().filter((p) => p.revenue > 0).length} slices · ${money(totalRevenue())} in all`}
            </Text>
          </Panel>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <View style={{ ...sectionSurface({ padded: true }), gap: 16 }}>
        <View class="flex-row items-baseline gap-3">
          <View style={{ flex: 1, gap: 2 }}>
            <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
              Revenue
            </Text>
            <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
              {`Q3 2026 · by ${breakdown() === "Channel" ? "channel" : "region"}`}
            </Text>
          </View>
          <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
            {money(totalRevenue())}
          </Text>
        </View>

        <View
          style={{
            flexDirection: wide() ? "row" : "column",
            alignItems: "center",
            gap: wide() ? 28 : 18,
          }}
        >
          <Plot
            data={parts()}
            accessibilityLabel={
              totalRevenue() > 0
                ? `Revenue by ${breakdown().toLowerCase()}, ${money(totalRevenue())} in all; largest ${parts()[0].name} at ${percent(share(parts()[0]))}`
                : "Revenue: nothing this quarter"
            }
            accessibilityValue={{
              text:
                shown() &&
                `${shown()!.name}: ${money(shown()!.revenue)}, ${percent(share(shown()!))}`,
            }}
            // Motion of the app's: the ring sweeps in for each breakdown, the hole opens and closes
            // between donut and pie, the slice under the pointer lifts on the spring; reduced motion
            // shows it all at once.
            appearGeneration={["Region", "Channel", "None"].indexOf(breakdown())}
            motion={{
              appear: { duration: 900, easing: "easeOut" },
              update: { duration: 450, easing: "easeInOut" },
              enter: { duration: 120 },
              exit: { duration: 180 },
              pointer: { stiffness: 420, damping: 40 },
            }}
            onHoverChange={({ index }) => {
              hovered.set(index);
              const p = index == null ? undefined : parts()[index];
              const line = p
                ? `${index}: ${p.name}, ${money(p.revenue)} (${percent(share(p))})`
                : "null: off the slices";
              events.set([line, ...events()].slice(0, 5));
            }}
            style={{ width: ring, height: ring }}
          >
            {/* Nothing to split: a faint ring keeps the chart's shape. */}
            <If when={totalRevenue() === 0}>
              <Arc
                innerRadius={donut() ? "62%" : 0}
                outerRadius={ring / 2 - 8}
                style={{ fill: alpha(ui().text, 0.06) }}
              />
            </If>
            <Pie
              value="revenue"
              innerRadius={donut() ? "62%" : 0}
              // The rim 8 points in, room for the lift.
              outerRadius={ring / 2 - 8}
              padAngle={2 / (ring / 2 - 8)}
              sliceClass={(_, i) => FILLS[i % FILLS.length]}
              hoverLift={6}
              hoverDim={0.64}
            />
            {/* The hovered part, or the total, in the hole: it fades with the hole opening and
                closing. */}
            <View
              class="transition-opacity duration-300 motion-reduce:transition-none"
              style={{
                pointerEvents: "none",
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                opacity: donut() ? 1 : 0,
              }}
            >
              <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
                {shown()?.name ?? "Total"}
              </Text>
              <Text
                class="text-foreground"
                style={{ fontSize: 22, fontWeight: 600, ...num, textAlign: "center" }}
              >
                {money(shown()?.revenue ?? totalRevenue())}
              </Text>
              <Text
                class="text-muted-foreground"
                style={{ fontSize: size.detail, ...num, textAlign: "center" }}
              >
                {shown()
                  ? percent(share(shown()!))
                  : `${parts().filter((p) => p.revenue > 0).length} parts`}
              </Text>
            </View>
          </Plot>

          {/* The legend: a key in each slice's color, the value and the share at the trailing edge;
              the hovered part's row stands out. */}
          <View style={{ alignSelf: "stretch", flex: wide() ? 1 : undefined, gap: 2 }}>
            <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 8, paddingBottom: 4 }}>
              <View style={{ width: 8 }} />
              <Text class="text-faint" style={{ flex: 1, fontSize: 11 }}>
                {breakdown() === "Channel" ? "Channel" : "Region"}
              </Text>
              <Text class="text-faint" style={{ fontSize: 11, ...num }}>
                Revenue
              </Text>
              <Text class="text-faint" style={{ width: 52, fontSize: 11, ...num }}>
                Share
              </Text>
            </View>
            {parts().map((p, i) => (
              <View
                class="transition-opacity duration-150 motion-reduce:transition-none"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  height: size.rowSm,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                  backgroundColor: hovered() === i ? alpha(ui().text, 0.05) : undefined,
                  opacity: hovered() == null || hovered() === i ? 1 : 0.45,
                }}
              >
                <View
                  class={KEYS[i % KEYS.length]}
                  style={{ width: 8, height: 8, borderRadius: 2 }}
                />
                <Text
                  class="text-foreground"
                  style={{ fontSize: size.label - 1, flex: 1, numberOfLines: 1 }}
                >
                  {p.name}
                </Text>
                <Text class="text-foreground" style={{ fontSize: size.label - 1, ...num }}>
                  {money(p.revenue)}
                </Text>
                <Text
                  class="text-muted-foreground"
                  style={{ width: 52, fontSize: size.label - 1, ...num }}
                >
                  {percent(share(p))}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Scene>
  );
}

// --- Ranges (el-plot-ranges) ---------------------------------------------------------------

type Candle = {
  day: number;
  open: number;
  high: number;
  low: number;
  close: number;
  dir: "up" | "down";
};
type Step = { name: string; kind: "total" | "up" | "down"; start: number; end: number };

/** A repeatable walk of daily candles, so every visit shows the same chart. */
const CANDLES: Candle[] = (() => {
  let s = 17;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s % 1000) / 1000;
  };
  let close = 92;
  return Array.from({ length: 24 }, (_, day) => {
    const open = close + (next() - 0.5) * 0.8;
    close = open + (next() - 0.46) * 3.2;
    const high = Math.max(open, close) + next() * 1.2;
    const low = Math.min(open, close) - next() * 1.2;
    const r = (v: number) => Math.round(v * 100) / 100;
    return {
      day,
      open: r(open),
      high: r(high),
      low: r(low),
      close: r(close),
      dir: close >= open ? ("up" as const) : ("down" as const),
    };
  });
})();
const LOW = Math.floor(Math.min(...CANDLES.map((c) => c.low)) - 1);
const HIGH = Math.ceil(Math.max(...CANDLES.map((c) => c.high)) + 1);

/** A quarter's revenue down to net profit, in millions: each step from where the total stood to
 * where it leaves it. */
const STEPS: Step[] = (() => {
  const lines: [string, number][] = [
    ["Cost", -54.1],
    ["R&D", -22.8],
    ["SG&A", -27.4],
    ["Other", 3.9],
    ["Tax", -9.2],
  ];
  let level = 142.7;
  const steps: Step[] = [{ name: "Revenue", kind: "total", start: 0, end: level }];
  for (const [name, v] of lines) {
    const end = Math.round((level + v) * 10) / 10;
    steps.push({ name, kind: v >= 0 ? "up" : "down", start: level, end });
    level = end;
  }
  steps.push({ name: "Net", kind: "total", start: 0, end: level });
  return steps;
})();

const signed = (v: number, digits = 1) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(digits)}`;

function RangesScene() {
  const chart = signal<"candles" | "bridge">("candles");
  const hovered = signal<number | null>(null);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const height = desktop ? 200 : 180;
  const candle = () =>
    CANDLES[
      hovered() != null && chart() === "candles"
        ? Math.min(hovered()!, CANDLES.length - 1)
        : CANDLES.length - 1
    ];
  const step = () =>
    STEPS[
      hovered() != null && chart() === "bridge"
        ? Math.min(hovered()!, STEPS.length - 1)
        : STEPS.length - 1
    ];
  const tone = (dir: string) => (dir === "down" ? ui().down : dir === "up" ? ui().up : ui().text);
  const labelStyle = () => ({ fontSize: 11, paddingVertical: 3, color: ui().muted, ...num });
  return (
    <Scene
      title="Ranges (el-plot-ranges)"
      hint={() =>
        desktop
          ? "Move the pointer over the chart to read a row"
          : chart() === "candles"
            ? "Each candle spans its day: wick low to high, body open to close"
            : "Each step starts where the total stood"
      }
      inspector={
        <>
          <Panel title="chart">
            <Segmented
              options={["candles", "bridge"] as const}
              value={chart()}
              onChange={(value) => {
                chart.set(value);
                hovered.set(null);
              }}
            />
            <Text class="text-foreground" style={{ fontSize: 13, ...num }}>
              {chart() === "candles"
                ? `Rule high ← low · Bar close ← open`
                : `Bar end ← start · ${STEPS.length} steps`}
            </Text>
          </Panel>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
        <If
          when={chart() === "candles"}
          else={
            <>
              <View class="flex-row items-baseline gap-3">
                <View style={{ flex: 1, gap: 2 }}>
                  <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                    Profit bridge
                  </Text>
                  <Text class="text-muted-foreground" style={{ fontSize: size.detail }}>
                    {`${step().name} · millions`}
                  </Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: 600, color: tone(step().kind), ...num }}>
                  {step().kind === "total"
                    ? `$${step().end.toFixed(1)}M`
                    : `${signed(step().end - step().start)}M`}
                </Text>
              </View>
              <Plot
                data={STEPS}
                xScale={{ type: "band", paddingInner: 0.32, paddingOuter: 0.16 }}
                yScale={{ type: "linear", domain: [0, 160] }}
                colorScale={{
                  type: "ordinal",
                  domain: ["total", "up", "down"],
                  range: [seriesColor(1), ui().up, ui().down],
                }}
                accessibilityLabel={`Profit bridge: $142.7M revenue to $${STEPS[STEPS.length - 1].end.toFixed(1)}M net profit`}
                accessibilityValue={{
                  text: hovered() == null ? undefined : `${step().name}: ${step().end.toFixed(1)}`,
                }}
                appearGeneration="bridge"
                motion={{
                  appear: { duration: 800, easing: "easeOut" },
                  enter: { duration: 120 },
                  exit: { duration: 180 },
                  pointer: { stiffness: 320, damping: 32 },
                }}
                {...plotCrossLine({ band: true })}
                onHoverChange={({ index }) => {
                  hovered.set(index);
                  log(
                    index == null
                      ? "null: left the chart"
                      : `${index}: ${STEPS[index].name}, ${STEPS[index].start} → ${STEPS[index].end}`,
                  );
                }}
                style={{ height, marginRight: 36, marginBottom: AXIS_BELOW }}
              >
                <Grid y={[40, 80, 120]} style={plotGrid()} />
                <Grid y={[0]} style={plotBaseline()} />
                {/* From each row's start to its end, colored by its kind. */}
                <Bar
                  value="end"
                  base="start"
                  color="kind"
                  cornerRadii={2}
                  stagger={0.5}
                  inactiveOpacity={0.4}
                  label={(d: Step) =>
                    d.kind === "total" ? d.end.toFixed(1) : signed(d.end - d.start)
                  }
                  labelStyle={labelStyle()}
                />
                <PlotAxis
                  placement="right"
                  tickValues={[0, 40, 80, 120]}
                  labelStyle={{ ...plotAxisText(), width: 36, paddingLeft: 8, textAlign: "right" }}
                />
                <PlotAxis
                  format={(i) => STEPS[i].name}
                  labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
                />
              </Plot>
            </>
          }
        >
          <View class="flex-row items-baseline gap-3">
            <View style={{ flex: 1, gap: 2 }}>
              <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
                NSH Labs
              </Text>
              <Text class="text-muted-foreground" style={{ fontSize: size.detail, ...num }}>
                {`Day ${candle().day + 1} · O ${candle().open.toFixed(2)} H ${candle().high.toFixed(2)} L ${candle().low.toFixed(2)}`}
              </Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 600, color: tone(candle().dir), ...num }}>
              {candle().close.toFixed(2)}
            </Text>
          </View>
          <Plot
            data={CANDLES}
            xScale={{ type: "band", paddingInner: 0.3, paddingOuter: 0.15 }}
            yScale={{ type: "linear", domain: [LOW, HIGH] }}
            colorScale={{
              type: "ordinal",
              domain: ["up", "down"],
              range: [ui().up, ui().down],
            }}
            accessibilityLabel={`NSH Labs, ${CANDLES.length} days: from ${CANDLES[0].open.toFixed(2)} to ${CANDLES[CANDLES.length - 1].close.toFixed(2)}`}
            accessibilityValue={{
              text:
                hovered() == null
                  ? undefined
                  : `Day ${candle().day + 1}: open ${candle().open}, high ${candle().high}, low ${candle().low}, close ${candle().close}`,
            }}
            appearGeneration="candles"
            motion={{
              appear: { duration: 800, easing: "easeOut" },
              enter: { duration: 120 },
              exit: { duration: 180 },
              pointer: { stiffness: 320, damping: 32 },
            }}
            {...plotCrossLine({ band: true })}
            onHoverChange={({ index }) => {
              hovered.set(index);
              const c = index == null ? undefined : CANDLES[index];
              log(
                c == null
                  ? "null: left the chart"
                  : `${index}: ${c.low} – ${c.high}, ${c.open} → ${c.close}`,
              );
            }}
            style={{ height, marginRight: 36, marginBottom: AXIS_BELOW }}
          >
            <Grid y={[LOW + (HIGH - LOW) / 3, LOW + ((HIGH - LOW) * 2) / 3]} style={plotGrid()} />
            {/* The wick, low to high, under the body, open to close. */}
            <Rule
              value="high"
              base="low"
              color="dir"
              stagger={0.5}
              inactiveOpacity={0.3}
              style={{ strokeWidth: 1 }}
            />
            <Bar
              value="close"
              base="open"
              color="dir"
              cornerRadii={1}
              stagger={0.5}
              inactiveOpacity={0.3}
            />
            <PlotAxis
              placement="right"
              tickValues={[LOW + (HIGH - LOW) / 3, LOW + ((HIGH - LOW) * 2) / 3]}
              format={(v) => v.toFixed(0)}
              labelStyle={{ ...plotAxisText(), paddingLeft: 8 }}
            />
            <PlotAxis
              tickValues={[0, 11, 23]}
              format={(i) => `Day ${i + 1}`}
              labelStyle={{ ...plotAxisText(), lineHeight: 14, paddingTop: 12 }}
            />
          </Plot>
        </If>
      </View>
    </Scene>
  );
}

// --- A treemap (el-plot-treemap) -----------------------------------------------------------

type Node = { id: string; parent?: string; name: string; value?: number; chg?: number };

const MARKET: Node[] = [
  { id: "tech", name: "Technology" },
  { id: "comm", name: "Communication" },
  { id: "fin", name: "Financials" },
  { id: "health", name: "Healthcare" },
  ...(
    [
      ["NVDA", "tech", 4300, 2.4],
      ["MSFT", "tech", 3700, -0.6],
      ["AAPL", "tech", 3600, 0.4],
      ["AVGO", "tech", 1600, 3.1],
      ["ORCL", "tech", 720, -2.8],
      ["AMD", "tech", 380, 1.8],
      ["GOOGL", "comm", 3100, 1.1],
      ["META", "comm", 1800, -1.5],
      ["NFLX", "comm", 480, 0.2],
      ["BRK.B", "fin", 1050, 0.2],
      ["JPM", "fin", 830, 1.3],
      ["V", "fin", 670, -0.3],
      ["GS", "fin", 240, 2.7],
      ["LLY", "health", 820, -1.9],
      ["UNH", "health", 300, -4.1],
      ["JNJ", "health", 460, 0.4],
    ] as const
  ).map(([id, parent, value, chg]) => ({ id, parent, name: id, value, chg })),
];

/** A team's yearly budget in thousands: three levels, a line that is done (0) and one refunded
 * (below 0). */
const BUDGET: Node[] = [
  { id: "eng", name: "Engineering" },
  { id: "ops", name: "Operations" },
  { id: "infra", parent: "eng", name: "Infrastructure" },
  { id: "product", parent: "eng", name: "Product" },
  { id: "cloud", parent: "infra", name: "Cloud", value: 420 },
  { id: "ci", parent: "infra", name: "CI runners", value: 96 },
  { id: "observability", parent: "infra", name: "Observability", value: 74 },
  { id: "salaries", parent: "product", name: "Contractors", value: 310 },
  { id: "design", parent: "product", name: "Design tools", value: 38 },
  { id: "research", parent: "product", name: "User research", value: 0 },
  { id: "office", parent: "ops", name: "Office", value: 180 },
  { id: "travel", parent: "ops", name: "Travel", value: 64 },
  { id: "legal", parent: "ops", name: "Legal", value: -12 },
];

const pct = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;
/** A node's value: its own, or its leaves' sum (what the treemap gives `valueLabel`). */
const nodeTotal = (rows: Node[], id: string): number => {
  const children = rows.filter((r) => r.parent === id);
  if (children.length === 0) return Math.max(0, rows.find((r) => r.id === id)?.value ?? 0);
  return children.reduce((s, c) => s + nodeTotal(rows, c.id), 0);
};
const nodePath = (rows: Node[], node: Node): string => {
  const parent = node.parent && rows.find((r) => r.id === node.parent);
  return parent ? `${nodePath(rows, parent)} / ${node.name}` : node.name;
};

function TreemapScene() {
  const chart = signal<"market" | "budget">("market");
  const sort = signal<"value" | "data">("value");
  const hovered = signal<number | null>(null);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  const rows = () => (chart() === "market" ? MARKET : BUDGET);
  const shown = () => (hovered() == null ? undefined : rows()[hovered()!]);
  const height = desktop ? 260 : 240;
  const motion = {
    appear: { duration: 800, easing: "easeOut" },
    update: { duration: 500, easing: "easeInOut" },
    enter: { duration: 120 },
    exit: { duration: 160 },
    pointer: { stiffness: 380, damping: 36 },
  } as const;
  const outline = () => ({ borderRadius: 3, outlineWidth: 2, outlineColor: ui().text });
  return (
    <Scene
      title="A treemap (el-plot-treemap)"
      hint={
        desktop
          ? "Move the pointer over a tile or a group's name"
          : "Each tile's area is its share of the whole"
      }
      inspector={
        <>
          <Panel title="data">
            <Segmented
              options={["market", "budget"] as const}
              value={chart()}
              onChange={(value) => {
                chart.set(value);
                hovered.set(null);
              }}
            />
          </Panel>
          <Panel title="sort">
            <Segmented
              options={["value", "data"] as const}
              value={sort()}
              onChange={(value) => sort.set(value)}
            />
          </Panel>
          <Log title="onHoverChange" lines={events()} minHeight={92} />
        </>
      }
    >
      <View style={{ ...sectionSurface({ padded: true }), gap: 12 }}>
        <View class="flex-row items-baseline gap-3">
          <View style={{ flex: 1, gap: 2 }}>
            <Text class="text-foreground" style={{ fontSize: size.label, fontWeight: 600 }}>
              {shown()
                ? nodePath(rows(), shown()!)
                : chart() === "market"
                  ? "Largest stocks by sector"
                  : "Budget by team"}
            </Text>
            <Text class="text-muted-foreground" style={{ fontSize: size.detail, ...num }}>
              {chart() === "market"
                ? "Area: market cap · color: change of the day"
                : "Thousands of dollars · a line of 0 and a refund take no area"}
            </Text>
          </View>
          <Text class="text-foreground" style={{ fontSize: 20, fontWeight: 600, ...num }}>
            {shown()
              ? chart() === "market" && shown()!.chg != null
                ? pct(shown()!.chg!)
                : `$${nodeTotal(rows(), shown()!.id)}k`
              : ""}
          </Text>
        </View>
        <Plot
          data={rows()}
          colorScale={
            chart() === "market"
              ? {
                  type: "diverging" as const,
                  domain: [-3, 3],
                  range: [ui().down, alpha(ui().text, 0.1), ui().up],
                }
              : {
                  type: "ordinal" as const,
                  domain: ["eng", "ops"],
                  range: categoryColors().slice(0, 2),
                }
          }
          accessibilityLabel={
            chart() === "market"
              ? "Market map of 16 stocks in 4 sectors"
              : "Budget of two teams in three levels"
          }
          accessibilityValue={{ text: shown() && nodePath(rows(), shown()!) }}
          appearGeneration={chart()}
          motion={motion}
          onHoverChange={({ index }) => {
            hovered.set(index);
            const n = index == null ? undefined : rows()[index];
            log(n == null ? "null: left the map" : `${index}: ${nodePath(rows(), n)}`);
          }}
          style={{ height }}
        >
          <Treemap
            id="id"
            parent="parent"
            value="value"
            sort={sort()}
            colorValue={chart() === "market" ? "chg" : undefined}
            color={
              chart() === "budget"
                ? (d: Node) => (d.id === "ops" || d.parent === "ops" ? "ops" : "eng")
                : undefined
            }
            paddingInner={chart() === "market" ? [3, 1] : [4, 2, 1]}
            paddingOuter={chart() === "market" ? 0 : [2, 1]}
            paddingTop={18}
            cornerRadii={3}
            stagger={0.4}
            inactiveOpacity={0.35}
            groupClass={chart() === "budget" ? "fill-foreground/5" : undefined}
            label={(d: Node) => d.name}
            valueLabel={(d: Node, value: number) => (d.chg != null ? pct(d.chg) : `$${value}k`)}
            labelPlacement={chart() === "market" ? "center" : "start"}
            labelClass="text-foreground data-dark:text-white p-1.5"
            labelStyle={{ fontSize: 11, fontWeight: 600 }}
            valueLabelStyle={{ fontSize: 10, fontWeight: 400, opacity: 0.85, ...num }}
            groupLabel="name"
            groupLabelClass="text-muted-foreground px-1.5"
            groupLabelStyle={{ fontSize: 10.5, lineHeight: 18 }}
            hoverStyle={outline()}
          />
        </Plot>
      </View>
    </Scene>
  );
}

function App() {
  return (
    <DemoPage title="Plot">
      <PriceScene />
      <CellsScene />
      <DotsScene />
      <DualScene />
      <PieScene />
      <RangesScene />
      <TreemapScene />
    </DemoPage>
  );
}

mount(App);
