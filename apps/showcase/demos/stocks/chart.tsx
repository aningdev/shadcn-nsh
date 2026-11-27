import { alpha, colors, rounded, shape, font } from "@shadcn-nsh/theme";
// The stock's chart: the intraday time-share line with its average price, or candles with MA 5 / 10
// / 20, both over volume. The gallery draws it on a canvas of its own; here it is the library's
// `Plot` and its parts, so the axes, the cross line, the hover and the last price's tag are the
// component's, and the readout beside it the scene's. Ported from `stocks/Chart.tsx`.
import { computed, signal, Text, View } from "nsh";

import {
  Area,
  Bar,
  Grid,
  Legend,
  Line,
  Plot,
  PlotAxis,
  plotAxisText,
  plotCrossLine,
  plotGrid,
  plotHoverDot,
  plotWash,
  Rule,
} from "@/packages/ui/plot";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { type Candle, compact, OPEN, price, type Stock, signed, time, toneOf } from "./market";
import { calm } from "./parts";

export type Period = "intraday" | "1m" | "5m" | "15m" | "1D";

const PERIODS: { value: Period; label: string }[] = [
  { value: "intraday", label: "Intraday" },
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1D", label: "1D" },
];

/** The moving averages a candle period draws, oldest first. */
const AVERAGES = [
  {
    n: 5,
    get color() {
      return colors.brand;
    },
  },
  {
    n: 10,
    get color() {
      return colors.info;
    },
  },
  {
    n: 20,
    get color() {
      return colors.warning;
    },
  },
];

const HEIGHT = 216;
const PRICE_H = 158;
const VOLUME_H = 40;
/** How far the price range reaches past its data, as a share of it. */
const PRICE_PAD = 0.08;
/** Room for the price axis on the right of both plots. */
const GUTTER = 54;

/** A drawn row: a candle, how it moved, its volume in each tone, and its averages. */
type Row = Candle & {
  dir: "success" | "destructive";
  uv: number;
  dv: number;
  ma5: number;
  ma10: number;
  ma20: number;
};

/** The candles of a period: minutes merged into 5 / 15, or the days with today last. */
function candles(stock: Stock, period: Period): Candle[] {
  const minutes = stock.minutes();
  if (period === "1m" || period === "intraday") return minutes;
  if (period === "1D") {
    const q = stock.quote();
    const today = {
      t: 0,
      o: q.open,
      h: q.high,
      l: q.low,
      c: q.last,
      v: q.volume,
      a: q.turnover / q.volume,
    };
    return [...stock.days, today];
  }
  const span = period === "5m" ? 300 : 900;
  const out: Candle[] = [];
  for (const m of minutes) {
    const t = m.t - ((m.t - OPEN) % span);
    const last = out[out.length - 1];
    if (last && last.t === t) {
      last.h = Math.max(last.h, m.h);
      last.l = Math.min(last.l, m.l);
      last.c = m.c;
      last.v += m.v;
      last.a = m.a;
    } else {
      out.push({ ...m, t });
    }
  }
  return out;
}

/** The mean close of the `n` candles ending at `i`: the ones there are, before there are `n`. */
function average(data: Candle[], i: number, n: number) {
  let sum = 0;
  let count = 0;
  for (let k = Math.max(0, i - n + 1); k <= i; k++) {
    sum += data[k].c;
    count++;
  }
  return sum / count;
}

/** The rows the plots draw. */
function rowsOf(data: Candle[]): Row[] {
  return data.map((c, i) => ({
    ...c,
    dir: c.c >= c.o ? "success" : "destructive",
    uv: c.c >= c.o ? c.v : 0,
    dv: c.c >= c.o ? 0 : c.v,
    ma5: average(data, i, 5),
    ma10: average(data, i, 10),
    ma20: average(data, i, 20),
  }));
}

const label = (c: Candle, period: Period) =>
  period === "1D" ? (c.t === 0 ? "Today" : `${c.t}d ago`) : time(c.t, false);

/**
 * The stock's chart: the intraday time-share line or candles, over their volume. Hover it (or drag
 * sideways on it) for the cross line and the readout beside it. 216 points tall unless `height`
 * says otherwise.
 */
export function Chart(props: { stock: Stock; height?: number }) {
  const period = signal<Period>("intraday");
  const cursor = signal<number | null>(null);
  // The minutes are one array mutated in place: every run is a change.
  const rows = computed(() => rowsOf(candles(props.stock, period())), { equals: false });
  const intraday = () => period() === "intraday";
  const p = (v: number) => price(v, props.stock);
  const prevClose = () => props.stock.quote().prevClose;
  /** What a candle's change is measured from: the previous close intraday, its own open in a period. */
  const before = (c: Candle) => (intraday() ? prevClose() : c.o);
  const tone = (c: Candle) => toneOf(c.c - before(c));
  const percent = (v: number) => `${signed(((v - prevClose()) / prevClose()) * 100)}%`;
  /** The price range: the day's own (which only widens) intraday, its window's easing in a period. */
  const range = calm(0.06);
  const domain = computed<[number, number]>(
    () => {
      const list = rows();
      const intradayNow = period() === "intraday";
      let lo = intradayNow ? prevClose() : Infinity;
      let hi = intradayNow ? prevClose() : -Infinity;
      for (const c of list) {
        lo = Math.min(lo, c.l);
        hi = Math.max(hi, c.h);
      }
      const margin = (hi - lo) * PRICE_PAD || hi * 0.01;
      const fit = intradayNow
        ? { lo: lo - margin, hi: hi + margin }
        : range.fit(lo - margin, hi + margin);
      return [fit.lo, fit.hi];
    },
    { equals: false },
  );
  const topVolume = () => Math.max(...rows().map((c) => c.v)) * 1.12;
  const at = () => rows()[Math.min(rows().length - 1, cursor() ?? rows().length - 1)];
  const last = () => rows()[rows().length - 1];
  /** Where a price sits from the top of the price plot, for keeping the tag and ticks apart. */
  const y = (v: number) => {
    const [lo, hi] = domain();
    return (1 - (v - lo) / (hi - lo)) * PRICE_H;
  };
  const priceTicks = () => {
    const [lo, hi] = domain();
    return [0, 1, 2, 3, 4].map((k) => hi - ((hi - lo) * k) / 4);
  };
  const dateTicks = () => {
    const n = rows().length - 1;
    return n < 2 ? [n] : [0, Math.floor(n / 2), n];
  };
  const motion = { enter: { duration: 120 }, exit: { duration: 160 } } as const;
  return (
    <View style={{ gap: 10 }}>
      <Segmented value={period()} onValueChange={(next) => period.set(next as Period)}>
        <SegmentedList size="sm">
          <Each of={PERIODS}>
            {(option) => <SegmentedItem value={option().value}>{option().label}</SegmentedItem>}
          </Each>
        </SegmentedList>
      </Segmented>
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14, rowGap: 6 }}>
        <If when={!intraday()}>
          <Each of={AVERAGES}>
            {(a) => (
              <Legend
                color={a().color}
                label={`MA${a().n}`}
                value={p(at()[`ma${a().n}` as "ma5"])}
              />
            )}
          </Each>
        </If>
        <If when={intraday()}>
          <Legend color={tone(at())} label="Price" value={p(at().c)} />
          <Legend color={colors.warning} label="Avg" value={p(at().a)} />
          <Legend color={colors.faint} label="Vol" value={compact(at().v)} />
        </If>
      </View>
      <View style={{ height: props.height ?? HEIGHT }}>
        <Plot
          data={rows()}
          xScale={{ type: "band", paddingInner: intraday() ? 0.8 : 0.3, paddingOuter: 0.02 }}
          yScale={{ type: "linear", domain: domain() }}
          colorScale={{
            type: "ordinal",
            domain: ["up", "down"],
            range: [colors.success, colors.destructive],
          }}
          appearGeneration={period()}
          motion={motion}
          accessibilityLabel={`${props.stock.code} ${period()} chart`}
          accessibilityValue={{
            text: `${label(at(), period())}: ${p(at().c)}, ${signed(((at().c - before(at())) / before(at())) * 100)}%`,
          }}
          onHoverChange={({ index }) => cursor.set(index)}
          {...plotCrossLine({ band: !intraday() })}
          style={{ height: PRICE_H, marginRight: GUTTER }}
        >
          <Grid y={priceTicks()} style={plotGrid()} />
          {/* The previous close: a dotted level, the change measured from it. */}
          <Grid
            y={[prevClose()]}
            style={{ stroke: alpha(colors.faint, 0.55), strokeDasharray: "2 3" }}
          />
          <If when={!intraday()}>
            {/* Wicks under bodies, both in the candle's tone. */}
            <Rule
              value="h"
              base="l"
              color="dir"
              stagger={0.6}
              inactiveOpacity={0.3}
              style={{ strokeWidth: 1 }}
            />
            <Bar
              value="c"
              base="o"
              color="dir"
              cornerRadii={1}
              stagger={0.6}
              inactiveOpacity={0.3}
            />
            <Each of={AVERAGES}>
              {(a) => (
                <Line
                  y={`ma${a().n}` as "ma5"}
                  style={{ stroke: a().color, strokeWidth: 1.2 }}
                  hoverDotStyle={plotHoverDot(a().color)}
                />
              )}
            </Each>
          </If>
          <If when={intraday()}>
            <Area
              y1="c"
              y0={domain()[0]}
              backgroundStyle={plotWash(tone(last()), 0.26)}
              style={{ fill: alpha(tone(last()), 0.08) }}
            />
            <Line
              y="c"
              style={{ stroke: tone(last()), strokeWidth: 1.5 }}
              hoverDotStyle={plotHoverDot(tone(last()))}
            />
            {/* The day's average price. */}
            <Line y="a" style={{ stroke: colors.warning, strokeWidth: 1.1 }} />
          </If>
          <PlotAxis
            placement="right"
            tickValues={priceTicks().filter((v) => Math.abs(y(v) - y(last().c)) > 14)}
            format={(v) => (intraday() ? percent(v) : p(v))}
            labelStyle={{ ...plotAxisText(), paddingLeft: 8 }}
          />
          {/* The last close on the axis, in its tone: the tag the canvas drew by hand. */}
          <PlotAxis
            placement="right"
            tickValues={[last().c]}
            format={(v) => p(v)}
            labelStyle={{
              marginLeft: 6,
              paddingHorizontal: 5,
              lineHeight: 18,
              ...rounded(5),
              backgroundColor: tone(last()),
              fontSize: 10.5,
              fontFamily: font.mono,
              fontWeight: "600",
              color: colors.muted,
              fontVariant: ["tabular-nums"],
            }}
          />
        </Plot>
        <Plot
          data={rows()}
          xScale={{ type: "band", paddingInner: intraday() ? 0.8 : 0.3, paddingOuter: 0.02 }}
          yScale={{ type: "linear", domain: [0, topVolume()] }}
          appearGeneration={period()}
          motion={motion}
          accessibilityLabel={`${props.stock.code} volume, ${period()}`}
          onHoverChange={({ index }) => cursor.set(index)}
          {...plotCrossLine({ band: true })}
          style={{ height: VOLUME_H, marginRight: GUTTER }}
        >
          {/* A row's volume in one of two series, so each takes its tone. */}
          <Bar
            value="uv"
            stack="volume"
            cornerRadii={{ topLeft: 1, topRight: 1 }}
            stagger={0.6}
            inactiveOpacity={0.3}
            style={{ fill: alpha(colors.success, 0.45) }}
          />
          <Bar
            value="dv"
            stack="volume"
            cornerRadii={{ topLeft: 1, topRight: 1 }}
            stagger={0.6}
            inactiveOpacity={0.3}
            style={{ fill: alpha(colors.destructive, 0.45) }}
          />
          <Grid y={[0]} style={{ stroke: colors.border }} />
          <PlotAxis
            placement="right"
            tickValues={[topVolume() / 1.12]}
            format={(v) => compact(v)}
            labelStyle={{ ...plotAxisText(), paddingLeft: 8 }}
          />
          <PlotAxis
            tickValues={dateTicks()}
            format={(i) => label(rows()[i] ?? last(), period())}
            labelStyle={plotAxisText()}
          />
        </Plot>
        {/* The readout: kept clear of the axis, flipped to the other side in the right half. */}
        <If when={cursor() !== null}>
          <View
            style={{
              position: "absolute",
              top: 4,
              ...(cursor()! > rows().length / 2 ? { left: 8 } : { right: GUTTER + 8 }),
              width: 140,
              padding: 10,
              gap: 3,
              pointerEvents: "none",
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: alpha(colors.card, 0.94),
              ...rounded(shape.control),
            }}
          >
            <Text
              style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
            >
              {label(at(), period())}
            </Text>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: colors.foreground,
                fontVariant: ["tabular-nums"],
              }}
            >
              {p(at().c)}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "400",
                  fontVariant: ["tabular-nums"],
                  color: tone(at()),
                }}
              >
                {" "}
                {signed(((at().c - before(at())) / before(at())) * 100)}%
              </Text>
            </Text>
            <If when={intraday()}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                avg {p(at().a)} · vol {compact(at().v)}
              </Text>
            </If>
            <If when={!intraday()}>
              <Text
                style={{
                  fontSize: 11,
                  lineHeight: 15,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                O {p(at().o)} H {p(at().h)}
                {"\n"}L {p(at().l)} V {compact(at().v)}
              </Text>
            </If>
          </View>
        </If>
      </View>
    </View>
  );
}
