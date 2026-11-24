// Plot: what an app builds from `nsh/base/plot`'s parts and its own views, with no chart component
// in between — the gallery's `Charts` page, rebuilt on this library's plot look (`plotGrid`,
// `plotWash`, `plotCrossLine`, `plotAxisText`, …) and its `Card`, `Segmented` and `Button`.
//
// A live price streamed a tick a second, its newest point breathing and tagged in the gutter; an
// order book's depth as steps either side of the spread, the side under the pointer read out; a
// portfolio's value over its underwater plot, the worst run shaded and the hovered day marked on
// both; capacity rings that sweep in for each period; revenue as a donut whose hovered slice
// lifts; sales as bars side by side or stacked; bars that span a range of their row (a `base` per
// row): a quarter's profit bridge, an onboarding funnel centered on its middle, and daily candles
// with their volume under them; dots: a portfolio's holdings as bubbles and analysts' price
// targets; heatmaps: a correlation matrix, a calendar of monthly returns and a week of trades per
// half hour; factor exposure as a radar; a quarter's flows; two treemaps; and a watchlist of
// sparklines. Values on the axes are small monospaced figures, grids hairlines, tooltips floating
// cards with a caps title.
import { alpha, chart, colors, focusRing, rounded, toneColor, type Tone } from "@shadcn-nsh/theme";
import {
  Canvas,
  cleanup,
  LayoutAnimation,
  List,
  platform,
  reduceMotion,
  signal,
  Text,
  View,
} from "nsh";

import { Button } from "@/packages/ui/button";
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
  PlotAppearScope,
  PlotAxis,
  PlotLabel,
  RadialGrid,
  RadialLine,
  Rule,
  Sankey,
  Treemap,
  categoryColors,
  plotBaseline,
  plotCrossLine,
  plotDotClass,
  plotGrid,
  plotHoverDot,
  plotReference,
  plotTooltip,
  plotTooltipTitle,
  plotWash,
  seriesColors,
} from "@/packages/ui/plot";
import { Stat, StatGroup } from "@/packages/ui/stat";

import { DemoPage } from "../kit";
import {
  axis,
  BELOW,
  below,
  ChartCard,
  Choice,
  count,
  fixed,
  Key,
  LineKey,
  random,
  signed,
  ticks,
} from "./data-shared";

const pointer = platform.desktop;
/** The gap a card leaves between its blocks, and the segmented control's size. */
const size = pointer
  ? { gap: 10, switch: "small" as const }
  : { gap: 12, switch: "regular" as const };
/** The tooltip's card, and its caps title. */
const tipCard = plotTooltip;
const tipTitle = plotTooltipTitle;
/** The wash under a line. */
const wash = plotWash;

// --- A live price (Live) ---------------------------------------------------------------------

const LIVE_POINTS = 60;
const LIVE_HEIGHT = 176;
/** The gutter on the right, where the last price is tagged. */
const GUTTER = 58;
const SECONDS = ["−60s", "−45s", "−30s", "−15s", "now"];
const OPEN = 41.2;
/** The stream the ticks draw from: a demo repeats itself, so its screenshots do. */
const tickNoise = random(821);
/** The stretch of a hero, in points. */
const START = 10 * 3600 + 42 * 60;
/** The layout of a re-fit, the plot's `motion.update` beside it. */
const REFIT = { duration: 450, easing: "easeInOut" } as const;
const clock = (t: number) =>
  `${String(Math.floor(t / 3600)).padStart(2, "0")}:${String(Math.floor((t % 3600) / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

type LiveRow = { second: number; price: number; high: number; low: number };

/** A price walking up and down, its high and low over the last ten ticks. */
function liveStart(): LiveRow[] {
  const r = random(31);
  let price = OPEN;
  return Array.from({ length: LIVE_POINTS }, (_, second) => {
    price = Math.round((price + (r() - 0.5) * 0.16) * 100) / 100;
    return { second, price, high: price, low: price };
  }).map((row, i, all) => {
    const window = all.slice(Math.max(0, i - 9), i + 1).map((d) => d.price);
    return { ...row, high: Math.max(...window), low: Math.min(...window) };
  });
}

/** The y domain that holds `rows` with room over and under the line. */
function liveFit(rows: LiveRow[]): [number, number] {
  const prices = rows.map((row) => row.price);
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const pad = Math.max(0.2, (hi - lo) * 0.3);
  return [Math.floor((lo - pad) * 10) / 10, Math.ceil((hi + pad) * 10) / 10];
}

/**
 * A live price: a tick a second, the last price tagged in the gutter, the newest point breathing,
 * the y domain re-fitting as the walk leaves it. Pause stops the ticks; the hover reads the tick it
 * is over.
 */
function Live() {
  const points = signal<LiveRow[]>(liveStart());
  const domain = signal<[number, number]>(liveFit(points()));
  const running = signal(true);
  const hover = signal<number | null>(null);
  const tip = signal(LIVE_POINTS - 1);

  const step = () => {
    if (!running()) return;
    const rows = points();
    const last = rows[rows.length - 1];
    const next = Math.round((last.price + (tickNoise() - 0.47) * 0.3) * 100) / 100;
    const shifted = [
      ...rows.slice(1),
      { second: last.second + 1, price: next, high: next, low: next },
    ].map((row, i, all) => {
      const window = all.slice(Math.max(0, i - 9), i + 1).map((d) => d.price);
      return { ...row, high: Math.max(...window), low: Math.min(...window) };
    });
    const [lo, hi] = domain();
    const fit = liveFit(shifted);
    if (next < lo + 0.2 || next > hi - 0.2 || fit[1] - fit[0] < (hi - lo) * 0.3) domain.set(fit);
    points.set(shifted.map((row, i) => ({ ...row, second: i })));
    tip.set(LIVE_POINTS - 1);
  };
  const timer = setInterval(step, 1000);
  cleanup(() => clearInterval(timer));

  const last = () => points()[points().length - 1];
  const shown = () => (hover() == null ? last() : points()[hover()!]);
  const change = () => shown().price - OPEN;
  const tone = (): Tone => (change() >= 0 ? "up" : "down");
  const grid = () => ticks(domain()[0], domain()[1]);
  /** Where a price sits in the plot's height. */
  const y = (price: number) => {
    const [lo, hi] = domain();
    return (1 - (price - lo) / (hi - lo)) * LIVE_HEIGHT;
  };
  const high = () => points().reduce((a, b) => (b.high > a.high ? b : a));
  const low = () => points().reduce((a, b) => (b.low < a.low ? b : a));
  const peak = () => points().findIndex((row) => row === high());
  const peakAlign = () => (peak() < 6 ? "left" : peak() > LIVE_POINTS - 7 ? "right" : "center");
  const span = () => domain()[1] - domain()[0];

  return (
    <ChartCard title="Live price" subtitle="A tick a second, the last price tagged">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 13, fontFamily: "monospace", color: colors.mutedForeground }}>
          NSHL
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 6, height: 6 }}>
            <If when={running()}>
              <View
                class="animate-ping"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(toneColor("up"), 0.5),
                }}
              />
            </If>
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: running() ? toneColor("up") : colors.faint,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              letterSpacing: 0.8,
              color: colors.faint,
            }}
          >
            {running() ? "LIVE" : "PAUSED"}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <Button variant="secondary" size="sm" onPress={() => running.set(!running())}>
          {running() ? "Pause" : "Resume"}
        </Button>
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "600",
            letterSpacing: -0.6,
            color: colors.foreground,
            fontVariant: "tabular-nums",
          }}
        >
          {fixed(shown().price)}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: toneColor(tone()),
            fontVariant: "tabular-nums",
          }}
        >
          {`${signed(change())}  ${signed((change() / OPEN) * 100, 2, "%")}`}
        </Text>
      </View>
      <Plot
        data={points()}
        y="price"
        yScale={{ type: "linear", domain: domain() }}
        appearGeneration={1}
        motion={{
          appear: { duration: 900, easing: "easeOut" },
          update: REFIT,
          enter: { duration: 120 },
          exit: { duration: 160 },
          pointer: { stiffness: 380, damping: 36 },
        }}
        accessibilityLabel={`Live price, ${fixed(shown().price)}, ${signed(change())} today`}
        accessibilityValue={{
          text:
            hover() == null
              ? undefined
              : `${clock(START + shown().second)}: ${fixed(shown().price)}`,
        }}
        {...plotCrossLine()}
        dotClass={plotDotClass}
        tooltipPlacement="pointer"
        tooltipOffset={10}
        tooltipContent={
          <View style={tipCard()}>
            <Text style={tipTitle()}>{clock(START + shown().second)}</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.foreground,
                fontVariant: "tabular-nums",
              }}
            >
              {fixed(shown().price)}
            </Text>
          </View>
        }
        onHoverChange={({ index }) => {
          hover.set(index);
          if (index != null) tip.set(index);
        }}
        style={{ height: LIVE_HEIGHT, marginRight: GUTTER, marginBottom: BELOW }}
      >
        <Grid y={grid()} style={plotGrid()} />
        <Grid y={OPEN > domain()[0] && OPEN < domain()[1] ? [OPEN] : []} style={plotReference()} />
        <Area backgroundStyle={wash(toneColor(tone()), 0.2)} hoverDotClass="hidden" />
        <Area
          y1="high"
          y0="low"
          style={{ fill: alpha(toneColor(tone()), 0.12) }}
          hoverDotClass="hidden"
        />
        <Line
          style={{ stroke: toneColor(tone()), strokeWidth: 1.75 }}
          hoverDotStyle={plotHoverDot(toneColor(tone()))}
        />
        {/* The newest point, its halo breathing while the ticks run. */}
        <View
          style={{
            position: "absolute",
            left: "100%",
            top: y(last().price),
            width: 0,
            height: 0,
            pointerEvents: "none",
          }}
        >
          <If when={running()}>
            <View
              class="animate-ping"
              style={{
                position: "absolute",
                left: -6,
                top: -6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: alpha(toneColor(tone()), 0.5),
              }}
            />
          </If>
          <View
            style={{
              position: "absolute",
              left: -4.5,
              top: -4.5,
              width: 9,
              height: 9,
              borderRadius: 4.5,
              borderWidth: 2,
              borderColor: colors.card,
              backgroundColor: toneColor(tone()),
            }}
          />
        </View>
        <PlotAxis
          placement="right"
          tickValues={grid().filter((v) => Math.abs(y(v) - y(last().price)) > 14)}
          format={(v) => fixed(v)}
          labelStyle={{ ...axis(), paddingLeft: 10 }}
        />
        {/* The high above its point, and the last price tagged past the right edge. */}
        <PlotLabel
          class="text-muted-foreground"
          texts={[
            {
              text: `High ${fixed(high().high)}`,
              x: peak(),
              y: high().high,
              align: peakAlign(),
              class: "-translate-y-full",
              style: {
                ...axis(),
                color: colors.mutedForeground,
                marginTop: -6,
                paddingHorizontal: 4,
                ...rounded(3),
                backgroundColor: colors.card,
              },
            },
            {
              text: fixed(last().price),
              x: LIVE_POINTS - 1,
              y: last().price,
              align: "left",
              class: "-translate-y-1/2",
              style: {
                marginLeft: 6,
                paddingHorizontal: 6,
                lineHeight: 20,
                ...rounded(6),
                backgroundColor: toneColor(tone()),
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: "600",
                color: colors.card,
              },
            },
          ]}
        />
        <PlotAxis
          tickValues={[0, 15, 30, 45, 59]}
          format={(v) => SECONDS[Math.round((v / 59) * 4)]}
          labelStyle={below()}
        />
      </Plot>
      <StatGroup class="border-line border-t pt-3">
        <Stat label="Open" value={fixed(OPEN)} />
        <Stat label="High" value={fixed(high().high)} />
        <Stat label="Low" value={fixed(low().low)} />
        <Stat label="Range" value={`${fixed((span() / OPEN) * 100)}%`} />
      </StatGroup>
    </ChartCard>
  );
}

// --- An order book's depth (Depth) -----------------------------------------------------------

const MID = 100;
const TICK = 0.02;
const DEPTH_HEIGHT = 168;

type DepthRow = { price: number; bid?: number; ask?: number };
const DEPTH_RANGES = [
  { value: "10", label: "10 ticks" },
  { value: "20", label: "20 ticks" },
  { value: "40", label: "40 ticks" },
] as const;

/** A book of `levels` a side, each level's size growing away from the spread. */
function book(levels: number): DepthRow[] {
  const r = random(83);
  const size = (k: number) => {
    const wall = r() < 0.1 ? 3.2 : 1;
    return (30 + k * 11) * (0.6 + r() * 0.8) * wall;
  };
  const rows: DepthRow[] = [];
  let bid = 0;
  for (let k = 0; k < levels; k++) {
    bid += size(k);
    rows.unshift({ price: Math.round((MID - TICK * (k + 1)) * 100) / 100, bid: Math.round(bid) });
  }
  let ask = 0;
  for (let k = 0; k < levels; k++) {
    ask += size(k + levels);
    rows.push({ price: Math.round((MID + TICK * (k + 1)) * 100) / 100, ask: Math.round(ask) });
  }
  return rows;
}

/**
 * An order book's depth: each side summed out from the spread, as steps either side of the mid,
 * the side under the pointer read out and its dot shown, the balance of the two sides under it.
 */
function Depth() {
  const range = signal<"10" | "20" | "40">("20");
  const hover = signal<number | null>(null);
  const tip = signal(0);
  const rows = () => book(Number(range()));
  const lo = () => rows()[0].price - TICK;
  const hi = () => rows()[rows().length - 1].price + TICK;
  const bids = () =>
    rows()
      .filter((row) => row.bid != null)
      .pop()?.bid ?? 0;
  const asks = () =>
    rows()
      .filter((row) => row.ask != null)
      .pop()?.ask ?? 0;
  const top = () => Math.max(bids(), asks()) * 1.18;
  const shown = () => rows()[tip()] ?? rows()[0];
  const side = (): "bid" | "ask" => (shown().bid != null ? "bid" : "ask");
  const hoveredSide = () => (hover() == null ? null : side());
  /** Where a price sits across the plot. */
  const at = (price: number): `${number}%` => `${((price - lo()) / (hi() - lo())) * 100}%`;
  const dot = (which: "bid" | "ask", tone: Tone) => ({
    backgroundColor: toneColor(tone),
    borderColor: colors.card,
    opacity: hoveredSide() === which ? 1 : 0,
  });

  return (
    <ChartCard title="Order book depth" subtitle="Each side summed out from the spread, as steps">
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            letterSpacing: -0.4,
            color: colors.foreground,
            fontVariant: "tabular-nums",
          }}
        >
          {fixed(MID)}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: "tabular-nums" }}>
          {`mid · spread ${fixed(TICK * 2)} (${fixed(((TICK * 2) / MID) * 100)}%)`}
        </Text>
      </View>
      <View style={{ marginTop: size.gap }}>
        <Plot
          data={rows()}
          x="price"
          xScale={{ type: "linear", domain: [lo(), hi()] }}
          yScale={{ type: "linear", domain: [0, top()] }}
          appearGeneration={Number(range())}
          motion={{
            appear: { duration: 700, easing: "easeOut" },
            enter: { duration: 120 },
            exit: { duration: 160 },
            pointer: { stiffness: 420, damping: 40 },
          }}
          accessibilityLabel={`Order book depth within ${range()} ticks: ${count(bids())} bid, ${count(asks())} asked`}
          accessibilityValue={{
            text:
              hover() == null
                ? undefined
                : `${side() === "bid" ? "Bids" : "Asks"} to ${fixed(shown().price)}: ${count(shown().bid ?? shown().ask ?? 0)}`,
          }}
          {...plotCrossLine()}
          dotClass={plotDotClass}
          tooltipOffset={6}
          tooltipContent={
            <View style={tipCard()}>
              <Text style={{ ...tipTitle(), color: toneColor(side() === "bid" ? "up" : "down") }}>
                {side() === "bid"
                  ? `BIDS ≥ ${fixed(shown().price)}`
                  : `ASKS ≤ ${fixed(shown().price)}`}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: colors.foreground,
                  fontVariant: "tabular-nums",
                }}
              >
                {count(shown().bid ?? shown().ask ?? 0)}
              </Text>
            </View>
          }
          onHoverChange={({ index }) => {
            hover.set(index);
            if (index != null) tip.set(index);
          }}
          style={{ height: DEPTH_HEIGHT, marginBottom: BELOW }}
        >
          <Grid y={ticks(0, top(), 3)} style={plotGrid()} />
          {/* The middle: a dashed hairline in the spread. */}
          <View
            style={{
              position: "absolute",
              left: at(MID),
              top: 0,
              bottom: 0,
              borderLeftWidth: 1,
              borderStyle: "dashed",
              borderColor: alpha(colors.foreground, 0.2),
              pointerEvents: "none",
            }}
          />
          <Area
            y1="bid"
            curve="stepAfter"
            backgroundStyle={wash(toneColor("up"), 0.22)}
            hoverDotClass="hidden"
          />
          <Area
            y1="ask"
            curve="stepAfter"
            backgroundStyle={wash(toneColor("down"), 0.22)}
            hoverDotClass="hidden"
          />
          <Line
            y="bid"
            curve="stepAfter"
            style={{ stroke: toneColor("up"), strokeWidth: 1.5 }}
            hoverDotStyle={dot("bid", "up")}
          />
          <Line
            y="ask"
            curve="stepAfter"
            style={{ stroke: toneColor("down"), strokeWidth: 1.5 }}
            hoverDotStyle={dot("ask", "down")}
          />
          <Grid y={[0]} style={plotBaseline()} />
          {/* The prices at the ends, and the middle a shade firmer. */}
          <PlotAxis tickValues={[lo(), hi()]} format={(v) => fixed(v)} labelStyle={below()} />
          <PlotAxis
            tickValues={[MID]}
            format={(v) => fixed(v)}
            labelStyle={{ ...below(), color: colors.mutedForeground }}
          />
        </Plot>
      </View>
      {/* The balance: each side's share of what the book holds in view. */}
      <View style={{ marginTop: size.gap + 4, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 12, color: toneColor("up"), fontVariant: "tabular-nums" }}>
            {`Bids ${fixed((bids() / (bids() + asks())) * 100, 0)}%`}
          </Text>
          <Text style={{ fontSize: 12, color: toneColor("down"), fontVariant: "tabular-nums" }}>
            {`${fixed((asks() / (bids() + asks())) * 100, 0)}% Asks`}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 3, height: 4 }}>
          <View style={{ flex: bids(), borderRadius: 2, backgroundColor: toneColor("up") }} />
          <View style={{ flex: asks(), borderRadius: 2, backgroundColor: toneColor("down") }} />
        </View>
      </View>
      <View
        style={{
          marginTop: size.gap + 2,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 260 : undefined,
        }}
      >
        <Choice
          options={DEPTH_RANGES}
          value={range()}
          onChange={(next) => range.set(next)}
          size={size.switch}
        />
      </View>
    </ChartCard>
  );
}

// --- A portfolio's drawdown (Drawdown) --------------------------------------------------------

const EQUITY = (() => {
  const r = random(5);
  let value = 10000;
  let peak = value;
  return Array.from({ length: 120 }, (_, day) => {
    // A rally, a slide, a recovery: drift that changes sign with the phase.
    const drift = day < 38 ? 0.004 : day < 66 ? -0.0062 : 0.0058;
    value *= 1 + drift + (r() - 0.5) * 0.018;
    peak = Math.max(peak, value);
    return { day, value: Math.round(value), drawdown: (value / peak - 1) * 100 };
  });
})();
const TROUGH = EQUITY.reduce((a, b) => (b.drawdown < a.drawdown ? b : a));
const PEAK = EQUITY.slice(0, TROUGH.day + 1).reduce((a, b) => (b.value > a.value ? b : a));
/** The days of the worst run, from its high to its low. */
const WORST_RUN = EQUITY.slice(PEAK.day, TROUGH.day + 1);
const RECOVERED = EQUITY.find((d) => d.day > TROUGH.day && d.value >= PEAK.value);
const UNDERWATER = EQUITY.filter((d) => d.drawdown < -0.05).length / EQUITY.length;
const EQUITY_HEIGHT = 140;
const WATER_HEIGHT = 72;
/** The room the low's label takes under its dot: a gap, then a line of `axis` text. */
const TROUGH_LABEL = 5 + 13;
/** The underwater plot's floor: deep enough that the low's label fits between its dot and the floor. */
const DD_FLOOR = Math.floor((TROUGH.drawdown * WATER_HEIGHT) / (WATER_HEIGHT - TROUGH_LABEL));
const VALUE_LO = Math.min(...EQUITY.map((d) => d.value)) * 0.97;
const VALUE_HI = Math.max(...EQUITY.map((d) => d.value)) * 1.03;
/** Where day `i` is across both plots (their rows are evenly spread). */
const across = (i: number): `${number}%` => `${(i / (EQUITY.length - 1)) * 100}%`;
/** The rows of the days the axis names: day 1, then days 30, 60, 90 and 120. */
const DAYS = [0, 29, 59, 89, 119];

/**
 * A portfolio's value over its drawdown: the equity curve, the worst run from a high to its low
 * shaded on it, and under it the "underwater" plot, how far each day sits below the best day
 * before it. The day under the pointer is marked on both plots and read out above them.
 */
function Drawdown() {
  const hover = signal<number | null>(null);
  // Which plot the pointer is over: the other one marks the day itself.
  const over = signal<"equity" | "water" | null>(null);
  const shown = () => EQUITY[hover() ?? EQUITY.length - 1];
  const followTo =
    (which: "equity" | "water") =>
    ({ index }: { index: number | null }) => {
      hover.set(index);
      over.set(index == null ? null : which);
    };
  // Where the hovered day is on each plot, from its own scale.
  const height = (which: "equity" | "water") =>
    which === "equity"
      ? (1 - (shown().value - VALUE_LO) / (VALUE_HI - VALUE_LO)) * EQUITY_HEIGHT
      : (shown().drawdown / DD_FLOOR) * WATER_HEIGHT;
  const mark = (which: "equity" | "water", tone: Tone) => (
    <If when={hover() != null && over() !== which}>
      <View
        style={{
          position: "absolute",
          left: across(hover() ?? 0),
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: alpha(colors.foreground, 0.22),
          pointerEvents: "none",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: across(hover() ?? 0),
          top: height(which),
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: -4,
            top: -4,
            width: 8,
            height: 8,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: colors.card,
            backgroundColor: toneColor(tone),
          }}
        />
      </View>
    </If>
  );
  const total = (EQUITY[EQUITY.length - 1].value / EQUITY[0].value - 1) * 100;
  return (
    <ChartCard title="Drawdown" subtitle="Value against its high, the worst run shaded">
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            letterSpacing: -0.4,
            color: colors.foreground,
            fontVariant: "tabular-nums",
          }}
        >
          {`$${count(shown().value)}`}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: shown().drawdown < -0.05 ? toneColor("destructive") : colors.mutedForeground,
            fontVariant: "tabular-nums",
          }}
        >
          {shown().drawdown < -0.05 ? `${signed(shown().drawdown, 1)}% from the high` : "at a high"}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={{ ...axis(), color: colors.mutedForeground }}>{`DAY ${shown().day + 1}`}</Text>
      </View>
      <View style={{ marginTop: size.gap, gap: 6 }}>
        <Plot
          data={EQUITY}
          // Days on a linear scale, so the worst run's own rows land on their days.
          x="day"
          xScale={{ type: "linear", domain: [0, EQUITY.length - 1] }}
          y="value"
          yScale={{ type: "linear", domain: [VALUE_LO, VALUE_HI] }}
          appearGeneration={1}
          // No pointer spring: the other plot marks the same day at once, so both move together.
          motion={{
            appear: { duration: 1000, easing: "easeOut" },
            enter: { duration: 120 },
            exit: { duration: 160 },
          }}
          accessibilityLabel={`Portfolio value over 120 days, ${signed(total, 1)}%; worst drawdown ${signed(TROUGH.drawdown, 1)}% from day ${PEAK.day + 1} to day ${TROUGH.day + 1}`}
          accessibilityValue={{
            text:
              hover() == null
                ? undefined
                : `Day ${shown().day + 1}, $${count(shown().value)}, ${signed(shown().drawdown, 1)}%`,
          }}
          {...plotCrossLine()}
          dotClass={plotDotClass}
          onHoverChange={followTo("equity")}
          style={{ height: EQUITY_HEIGHT }}
        >
          {/* The worst run, from its high to its low, its value hatched under the curve. */}
          <View
            style={{
              position: "absolute",
              left: across(PEAK.day),
              width: `${((TROUGH.day - PEAK.day) / (EQUITY.length - 1)) * 100}%`,
              top: 0,
              bottom: 0,
              backgroundColor: alpha(colors.destructive, 0.04),
              pointerEvents: "none",
            }}
          >
            <Text
              style={{
                ...axis(),
                position: "absolute",
                left: 6,
                top: 6,
                color: toneColor("destructive"),
              }}
            >
              {`MAX ${signed(TROUGH.drawdown, 1)}%`}
            </Text>
          </View>
          <Grid y={ticks(VALUE_LO, VALUE_HI, 3)} style={plotGrid()} />
          <Area backgroundStyle={wash(toneColor("accent"), 0.16)} hoverDotClass="hidden" />
          {/* Hairline stripes 6pt apart, falling to the right. */}
          <Area
            data={WORST_RUN}
            x="day"
            backgroundStyle={{
              backgroundImage: `repeating-linear-gradient(-45deg, ${alpha(colors.destructive, 0.32)} 0px, ${alpha(colors.destructive, 0.32)} 1px, transparent 1px, transparent 6px)`,
            }}
            hoverDotClass="hidden"
          />
          <Line
            style={{ stroke: toneColor("accent"), strokeWidth: 1.75 }}
            hoverDotStyle={plotHoverDot(toneColor("accent"))}
          />
          {mark("equity", "accent")}
        </Plot>
        {/* Underwater: hanging from zero, deeper red the further down. */}
        <Plot
          data={EQUITY}
          y="drawdown"
          yScale={{ type: "linear", domain: [DD_FLOOR, 0] }}
          appearGeneration={1}
          motion={{
            appear: { duration: 1000, easing: "easeOut" },
            enter: { duration: 120 },
            exit: { duration: 160 },
          }}
          accessibilityLabel={`Drawdown from the high, at worst ${signed(TROUGH.drawdown, 1)}% on day ${TROUGH.day + 1}`}
          accessibilityValue={{
            text:
              hover() == null
                ? undefined
                : `Day ${shown().day + 1}, ${signed(shown().drawdown, 1)}% from the high`,
          }}
          {...plotCrossLine()}
          dotClass="size-2 rounded-full border-2"
          onHoverChange={followTo("water")}
          style={{ height: WATER_HEIGHT, marginBottom: BELOW }}
        >
          <Area
            y0={0}
            backgroundStyle={{
              backgroundImage: `linear-gradient(to bottom, ${alpha(colors.destructive, 0.04)}, ${alpha(colors.destructive, 0.26)})`,
            }}
            hoverDotClass="hidden"
          />
          <Line
            style={{ stroke: toneColor("destructive"), strokeWidth: 1.25 }}
            hoverDotStyle={plotHoverDot(toneColor("destructive"))}
          />
          {/* The floor's value over its edge, and the low marked where it is. */}
          <PlotAxis
            placement="left"
            labelPlacement="inside"
            tickValues={[DD_FLOOR]}
            format={(v) => `${v}%`}
            labelStyle={{ ...axis(), paddingBottom: 2 }}
          />
          <View
            style={{
              position: "absolute",
              left: across(TROUGH.day),
              top: (TROUGH.drawdown / DD_FLOOR) * WATER_HEIGHT,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          >
            <View
              style={{
                position: "absolute",
                left: -3.5,
                top: -3.5,
                width: 7,
                height: 7,
                borderRadius: 3.5,
                borderWidth: 1.5,
                borderColor: colors.card,
                backgroundColor: toneColor("destructive"),
              }}
            />
            {/* Under the dot, where the curve never is (the low is its lowest point); a width of
                its own, centered on the dot: the zero-width anchor would wrap it at every break. */}
            <Text
              style={{
                ...axis(),
                lineHeight: 13,
                position: "absolute",
                left: -32,
                top: 5,
                width: 64,
                textAlign: "center",
                color: toneColor("destructive"),
              }}
            >
              {`${signed(TROUGH.drawdown, 1)}%`}
            </Text>
          </View>
          {mark("water", "destructive")}
          {/* The days under both plots: the first, then every 30th. */}
          <PlotAxis
            tickValues={DAYS}
            format={(v) => (v === 0 ? "Day 1" : String(v + 1))}
            labelStyle={below()}
          />
        </Plot>
      </View>
      <StatGroup class="border-line border-t pt-3">
        <Stat label="Return" value={`${signed(total, 1)}%`} tone={total >= 0 ? "up" : "down"} />
        <Stat label="Worst" value={`${signed(TROUGH.drawdown, 1)}%`} tone="destructive" />
        <Stat label="Recovery" value={RECOVERED ? `${RECOVERED.day - TROUGH.day} days` : "—"} />
        <Stat label="Underwater" value={`${fixed(UNDERWATER * 100, 0)}%`} />
      </StatGroup>
    </ChartCard>
  );
}

// --- Capacity as rings (Capacity) ------------------------------------------------------------

const PERIODS = [
  { value: "now", label: "Now" },
  { value: "day", label: "24h peak" },
  { value: "week", label: "7d peak" },
] as const;
type Period = (typeof PERIODS)[number]["value"];
const RESOURCES: {
  name: string;
  color: () => string;
  unit: string;
  total: number;
  used: Record<Period, number>;
}[] = [
  // Getters: the series colors follow the appearance, so they are read when the rings render.
  {
    name: "Compute",
    color: () => chart.chart1,
    unit: "vCPU",
    total: 64,
    used: { now: 38, day: 51, week: 59 },
  },
  {
    name: "Memory",
    color: () => chart.chart2,
    unit: "GB",
    total: 256,
    used: { now: 141, day: 188, week: 214 },
  },
  {
    name: "Network",
    color: () => chart.chart3,
    unit: "Gbps",
    total: 10,
    used: { now: 3.2, day: 7.4, week: 8.9 },
  },
];
/** Each ring's width and the gap between rings, in points. */
const RING_WIDTH = 11;
const RING_GAP = 5;
const RINGS = pointer ? 164 : 172;

/**
 * Capacity as rings: a track per resource and over it the share in use, with round caps, sweeping
 * in from 12 o'clock and then round to each period's load (`motion.update`); the average in the
 * middle and the figures beside, in the rings' colors.
 */
function Capacity() {
  const period = signal<Period>("now");
  const shareOf = (r: (typeof RESOURCES)[number]) => r.used[period()] / r.total;
  const average = () => RESOURCES.reduce((s, r) => s + shareOf(r), 0) / RESOURCES.length;
  const outer = RINGS / 2 - 2;
  const radii = RESOURCES.map((_, i) => {
    const o = outer - i * (RING_WIDTH + RING_GAP);
    return { outer: o, inner: o - RING_WIDTH };
  });
  return (
    <ChartCard title="Capacity" subtitle="Rings of load against each resource's limit">
      <View
        style={{
          flexDirection: pointer ? "row" : "column",
          alignItems: "center",
          gap: pointer ? 24 : 16,
        }}
      >
        <Plot
          data={RESOURCES}
          interactive={false}
          appearGeneration={1}
          motion={{
            appear: { duration: 1100, easing: "easeOut" },
            update: { duration: 700, easing: "easeInOut" },
          }}
          accessibilityLabel={`Capacity, ${PERIODS.find((p) => p.value === period())!.label}: ${RESOURCES.map((r) => `${r.name} ${fixed(shareOf(r) * 100, 0)}%`).join(", ")}`}
          style={{ width: RINGS, height: RINGS }}
        >
          <Each of={RESOURCES}>
            {(r, i) => {
              const ring = radii[i()];
              const resource = r();
              return (
                <Arc
                  innerRadius={ring.inner}
                  outerRadius={ring.outer}
                  style={{ fill: alpha(resource.color(), 0.13) }}
                />
              );
            }}
          </Each>
          <Each of={RESOURCES}>
            {(r, i) => {
              const ring = radii[i()];
              const resource = r();
              return (
                <Arc
                  innerRadius={ring.inner}
                  outerRadius={ring.outer}
                  endAngle={shareOf(resource) * 2 * Math.PI}
                  cornerRadius={RING_WIDTH / 2}
                  style={{ fill: resource.color() }}
                />
              );
            }}
          </Each>
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              pointerEvents: "none",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                letterSpacing: -0.4,
                color: colors.foreground,
                fontVariant: "tabular-nums",
              }}
            >
              {`${fixed(average() * 100, 0)}%`}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: 0.8,
                color: colors.faint,
              }}
            >
              AVG LOAD
            </Text>
          </View>
        </Plot>
        <View
          style={{
            alignSelf: "stretch",
            flexGrow: pointer ? 1 : 0,
            flexBasis: pointer ? 0 : undefined,
            justifyContent: "center",
            gap: 14,
          }}
        >
          <Each of={RESOURCES}>
            {(r) => {
              const resource = r();
              return (
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: resource.color(),
                      }}
                    />
                    <Text style={{ flex: 1, fontSize: 13, color: colors.foreground }}>
                      {resource.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.foreground,
                        fontVariant: "tabular-nums",
                      }}
                    >
                      {`${fixed(shareOf(resource) * 100, 0)}%`}
                    </Text>
                  </View>
                  <Text style={{ ...axis(), marginLeft: 16 }}>
                    {`${resource.used[period()]} / ${resource.total} ${resource.unit}`}
                  </Text>
                </View>
              );
            }}
          </Each>
        </View>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 260 : undefined,
        }}
      >
        <Choice
          options={PERIODS}
          value={period()}
          onChange={(next) => period.set(next)}
          size={size.switch}
        />
      </View>
    </ChartCard>
  );
}

// --- Revenue by region (Revenue) ---------------------------------------------------------------

/** Revenue of a quarter by region, in thousands, the largest first. */
const REGIONS = [
  { name: "North America", revenue: 482 },
  { name: "EMEA", revenue: 312 },
  { name: "APAC", revenue: 268 },
  { name: "Latin America", revenue: 104 },
  { name: "Other", revenue: 74 },
];
const REVENUE = REGIONS.reduce((sum, r) => sum + r.revenue, 0);
/** The theme's series colors, in the regions' order (read where used, so
 * they follow the appearance): the plot's ordinal `colorScale` gives each
 * region's slice the next one, as the legend gives its key. */
const palette = seriesColors;
/** The leader lines of the pie's labels, each in its slice's color. */
const STROKES = [
  "stroke-chart-1",
  "stroke-chart-2",
  "stroke-chart-3",
  "stroke-chart-4",
  "stroke-chart-5",
];
const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(2)}M` : `$${k}k`);
const portion = (k: number) => `${((k / REVENUE) * 100).toFixed(1)}%`;
/** A slice's label: its share, whole. */
const percent = (k: number) => `${Math.round((k / REVENUE) * 100)}%`;
/** The ring's size, its rim 8 points in (room for the lift), the gaps
 * between slices 2 points wide there. */
const RING = pointer ? 168 : 176;
const RIM = RING / 2 - 8;
/** As a pie the ring draws in to leave room for its labels outside. */
const PIE_RIM = Math.round(RIM * 0.66);
/** The ring turned so its two smallest slices, the last, meet at 3
 * o'clock: their labels stack there instead of crowding side by side at
 * the top. */
const SMALLEST = REGIONS[3].revenue + REGIONS[4].revenue;
const PIE_START = Math.PI / 2 - (2 * Math.PI * (REVENUE - SMALLEST / 2)) / REVENUE;

/**
 * Revenue by region as a donut: 2-point gaps of even width, softly rounded
 * corners, the hovered slice lifted and the others dimmed, its value in
 * the hole, a legend with tabular figures at the trailing edge whose
 * hovered row stands out; it closes into a pie, the hole's radius moving
 * on `motion.update` as the ring draws in, its shares written outside
 * at the ends of leader lines in the slices' colors.
 */
function Revenue() {
  const hover = signal<number | null>(null);
  const donut = signal(true);
  const shown = () => (hover() == null ? undefined : REGIONS[hover()!]);
  return (
    <ChartCard
      title="Revenue by region"
      subtitle="A donut of shares, or a pie labeled around its rim"
    >
      {/* The legend sits beside the ring where the card has room for its
          names and below it where it has not, never cutting a name short. */}
      <View
        style={{
          flexDirection: pointer ? "row" : "column",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: pointer ? 24 : 16,
        }}
      >
        <Plot
          data={REGIONS}
          accessibilityLabel={`Revenue by region, ${money(REVENUE)} in all; largest North America at ${portion(482)}`}
          accessibilityValue={{
            text:
              shown() &&
              `${shown()!.name}: ${money(shown()!.revenue)}, ${portion(shown()!.revenue)}`,
          }}
          appearGeneration={1}
          motion={{
            appear: { duration: 900, easing: "easeOut" },
            update: { duration: 450, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
            pointer: { stiffness: 420, damping: 40 },
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={{ ...focusRing(4), borderRadius: RING / 2 }}
          style={{ width: RING, height: RING }}
          colorScale={{ type: "ordinal", range: palette() }}
        >
          <Pie
            value="revenue"
            startAngle={PIE_START}
            endAngle={PIE_START + 2 * Math.PI}
            innerRadius={donut() ? RIM * 0.62 : 0}
            outerRadius={donut() ? RIM : PIE_RIM}
            padAngle={2 / RIM}
            cornerRadius={3}
            color="name"
            hoverLift={6}
            hoverDim={0.64}
            label={donut() ? undefined : (d: (typeof REGIONS)[number]) => percent(d.revenue)}
            labelGap={10}
            labelStyle={{
              paddingHorizontal: 4,
              fontSize: 11,
              fontFamily: "monospace",
              color: colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
            labelLineClass={(_, i) => STROKES[i % STROKES.length]}
            labelLineStyle={{ strokeWidth: 1 }}
          />
          {/* The total in the hole fades as it opens and closes. */}
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
              gap: 2,
              opacity: donut() ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                letterSpacing: 0.8,
                color: colors.faint,
              }}
            >
              {(shown()?.name ?? "Total").toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                letterSpacing: -0.4,
                color: colors.foreground,
                fontVariant: "tabular-nums",
              }}
            >
              {money(shown()?.revenue ?? REVENUE)}
            </Text>
          </View>
        </Plot>
        <View
          style={{
            alignSelf: "stretch",
            flexGrow: 1,
            flexBasis: pointer ? 260 : undefined,
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Each of={REGIONS}>
            {(r, i) => {
              const region = r();
              return (
                <View
                  class="transition-opacity duration-150 motion-reduce:transition-none"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    height: pointer ? 30 : 36,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                    backgroundColor: hover() === i() ? alpha(colors.foreground, 0.05) : undefined,
                    opacity: hover() == null || hover() === i() ? 1 : 0.45,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: palette()[i()],
                    }}
                  />
                  <Text
                    style={{ flex: 1, fontSize: 13, color: colors.foreground, numberOfLines: 1 }}
                  >
                    {region.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.foreground,
                      fontVariant: "tabular-nums",
                      textAlign: "right",
                    }}
                  >
                    {money(region.revenue)}
                  </Text>
                  <Text
                    style={{
                      width: 48,
                      fontSize: 13,
                      color: colors.mutedForeground,
                      fontVariant: "tabular-nums",
                      textAlign: "right",
                    }}
                  >
                    {portion(region.revenue)}
                  </Text>
                </View>
              );
            }}
          </Each>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          onPress={() => {
            donut.set(!donut());
            hover.set(null);
          }}
        >
          {donut() ? "Show as pie" : "Show as donut"}
        </Button>
      </View>
    </ChartCard>
  );
}

// --- Sales per month (Sales) -----------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
/** Sales per month, in thousands, online and in store. */
const SALES = [
  [42, 31],
  [51, 28],
  [48, 36],
  [63, 33],
  [58, 40],
  [71, 38],
  [66, 44],
].map(([online, store], i) => ({ month: MONTHS[i], online, store }));
type Sale = (typeof SALES)[number];
/** The top of the y scale: a step above the highest grid line, room for
 * the labels over the stacks. */
const SALES_TOP = 130;
const SALES_HEIGHT = 168;
/** The width of the y axis' labels. */
const AXIS = 28;

/**
 * Sales per month as bars in bands, side by side or stacked, growing in
 * one after another, a value over each (the total over a stack), the month
 * under the pointer a faint band over its bars while the others fade.
 */
function Sales() {
  const mode = signal<"grouped" | "stacked">("grouped");
  const hover = signal<number | null>(null);
  const stacked = () => mode() === "stacked";
  const shown = () => SALES[hover() ?? SALES.length - 1];
  const total = (d: Sale) => d.online + d.store;
  // Upright bars, their tips rounded; a stack only at its top.
  const tip = { topLeft: 3, topRight: 3 };
  const labelStyle = {
    fontSize: 10.5,
    fontFamily: "monospace",
    paddingBottom: 3,
    color: colors.mutedForeground,
    fontVariant: "tabular-nums",
  };
  return (
    <ChartCard title="Sales" subtitle="Bars per month, side by side or stacked">
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "600",
            letterSpacing: -0.4,
            color: colors.foreground,
            fontVariant: "tabular-nums",
          }}
        >
          {`${total(shown())}k`}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
          {hover() == null ? `${shown().month}, the last month` : shown().month}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
        <Key color={chart.chart1} label="Online" value={`${shown().online}k`} />
        <Key color={chart.chart2} label="In store" value={`${shown().store}k`} />
      </View>
      <View style={{ marginTop: size.gap }}>
        <Plot
          data={SALES}
          // Bands with half their gap at the ends: their middles divide
          // the width evenly, each month's label centered under its band.
          xScale={{
            type: "band",
            paddingInner: 0.3,
            paddingOuter: 0.15,
            maxBandWidth: 56,
            groupPadding: 0.12,
          }}
          yScale={{ type: "linear", domain: [0, SALES_TOP] }}
          appearGeneration={stacked() ? 1 : 0}
          motion={{
            appear: { duration: 600, easing: "easeOut" },
            enter: { duration: 150 },
            exit: { duration: 150 },
            pointer: { stiffness: 320, damping: 32 },
          }}
          accessibilityLabel={`Sales per month, online and in store, highest in ${SALES.reduce((a, b) => (total(b) > total(a) ? b : a)).month}`}
          accessibilityValue={{
            text:
              hover() == null
                ? undefined
                : `${shown().month}, ${shown().online}k online, ${shown().store}k in store`,
          }}
          // The band of the month under the pointer: a faint tint over it.
          {...plotCrossLine({ band: true })}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{ height: SALES_HEIGHT, marginRight: AXIS + 8, marginBottom: BELOW }}
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
            labelStyle={labelStyle}
            style={{ fill: chart.chart1 }}
          />
          <Bar
            value="store"
            stack={stacked() ? "sales" : undefined}
            cornerRadii={tip}
            stagger={0.4}
            inactiveOpacity={0.45}
            // Stacked, the top bar's label is the month's total.
            label={stacked() ? (d: Sale) => String(total(d)) : "store"}
            labelStyle={labelStyle}
            style={{ fill: chart.chart2 }}
          />
          {/* The grid's values right of it, as d3 writes them, and a month under each band. */}
          <PlotAxis
            placement="right"
            tickValues={[0, 40, 80, 120]}
            labelStyle={{ ...axis(), width: AXIS + 8, paddingLeft: 8, textAlign: "right" }}
          />
          <PlotAxis format={(v) => MONTHS[v]} labelStyle={below()} />
        </Plot>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 220 : undefined,
        }}
      >
        <Choice
          options={[
            { value: "grouped", label: "Side by side" },
            { value: "stacked", label: "Stacked" },
          ]}
          value={mode()}
          size={size.switch}
          onChange={(next) => mode.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Profit bridge (Bridge) ------------------------------------------------------------------

/** Where band `i` of `n` starts and how wide it is, and the step between
 * two bands' starts, as shares of the plot's width: the band scale's own
 * arithmetic (no `maxBandWidth`), so a view of the app's lines up with a
 * band. */
function bandAt(i: number, n: number, pad: { inner: number; outer: number }) {
  const step = 1 / (n - pad.inner + 2 * pad.outer);
  return { start: step * (pad.outer + i), width: step * (1 - pad.inner), step };
}
const share = (v: number): `${number}%` => `${v * 100}%`;

/** The bridge's quarters. */
const BRIDGE_QUARTERS = [
  { value: "1Q26", label: "1Q26" },
  { value: "2Q26", label: "2Q26" },
  { value: "3Q26", label: "3Q26" },
  { value: "4Q26", label: "4Q26" },
] as const;
type BridgeQuarter = (typeof BRIDGE_QUARTERS)[number]["value"];
/** Each quarter's revenue and what each line after it adds or takes, in
 * millions: cost of sales, R&D, SG&A, other income (a loss in 3Q), tax. */
const STATEMENTS: Record<BridgeQuarter, number[]> = {
  "1Q26": [118.4, -46.2, -19.8, -24.1, 2.6, -7.4],
  "2Q26": [126.9, -48.5, -20.6, -25.3, 1.8, -8.1],
  "3Q26": [131.2, -52.9, -21.9, -26.0, -1.4, -6.6],
  "4Q26": [142.7, -54.1, -22.8, -27.4, 3.9, -9.2],
};
type StepKind = "total" | "increase" | "decrease";
type Step = { name: string; short: string; kind: StepKind; start: number; end: number };
/** A quarter's bridge: totals stand on zero, every other step runs from
 * where the one before it ends to where it leaves the running total. */
function bridge(q: BridgeQuarter): Step[] {
  const [revenue, cost, rd, sga, other, tax] = STATEMENTS[q];
  const steps: Step[] = [];
  let level = 0;
  const total = (name: string, short: string) =>
    steps.push({ name, short, kind: "total", start: 0, end: level });
  const line = (name: string, short: string, v: number) => {
    const end = Math.round((level + v) * 10) / 10;
    steps.push({ name, short, kind: v >= 0 ? "increase" : "decrease", start: level, end });
    level = end;
  };
  level = revenue;
  total("Revenue", "Rev");
  line("Cost of sales", "COGS", cost);
  total("Gross profit", "Gross");
  line("R&D", "R&D", rd);
  line("SG&A", "SG&A", sga);
  line(other >= 0 ? "Other income" : "Other loss", "Other", other);
  line("Tax", "Tax", tax);
  total("Net profit", "Net");
  return steps;
}
const BRIDGE_PAD = { inner: 0.32, outer: 0.16 };
const BRIDGE_TOP = 160;
const BRIDGE_HEIGHT = 176;
/** How a quarter's steps move into the next one's: the bars and their
 * labels on the plot's `motion.update`, the connectors with a layout
 * animation of the same length. */
const BRIDGE_UPDATE = { duration: 550, easing: "easeInOut" } as const;
const bridgeLayout = {
  duration: BRIDGE_UPDATE.duration,
  update: { type: "easeInEaseOut" },
  create: { type: "easeInEaseOut", property: "opacity" },
  delete: { type: "easeInEaseOut", property: "opacity" },
} as const;
/** The gaps between the bridge's eight steps, each crossed by a connector. */
const CONNECTORS = [0, 1, 2, 3, 4, 5, 6];
const millions = (v: number) => `$${fixed(v, 1)}M`;
const signedMillions = (v: number) => `${v >= 0 ? "+" : "−"}$${fixed(Math.abs(v), 1)}M`;
/** What a step shows: a total's level, any other step's change. */
const amount = (s: Step) => (s.kind === "total" ? s.end : s.end - s.start);

/**
 * A quarter's profit bridge, as a waterfall: revenue, what each line of
 * the income statement takes or adds, gross and net profit as totals.
 * Each step is a `Bar` from its row's `base` (where the running total
 * stood) to its value (where the step leaves it), colored by kind through
 * the plot's `colorScale`, its signed change written at its end (above a
 * rise, below a fall); dashed connectors carry each level to the next
 * step. The step under the pointer or the arrow keys is read out over the
 * plot and its share of revenue; the quarters move into each other.
 */
function Bridge() {
  const quarter = signal<BridgeQuarter>("4Q26");
  const hover = signal<number | null>(null);
  const steps = () => bridge(quarter());
  // The plot's width, for the gap between two bands a connector spans.
  const plotWidth = signal(0);
  const gap = () => {
    const band = bandAt(0, CONNECTORS.length + 1, BRIDGE_PAD);
    return (band.step - band.width) * plotWidth();
  };
  const revenue = () => steps()[0].end;
  const net = () => steps()[steps().length - 1].end;
  const operating = () => steps()[4].end;
  const margin = (v: number) => `${fixed((v / revenue()) * 100, 1)}%`;
  const shown = () => (hover() == null ? undefined : steps()[hover()!]);
  const toneOf = (s: Step): Tone =>
    s.kind === "increase" ? "up" : s.kind === "decrease" ? "down" : "neutral";
  const labelStyle = {
    fontSize: 10.5,
    fontFamily: "monospace",
    paddingVertical: 3,
    color: colors.mutedForeground,
    fontVariant: "tabular-nums",
  };
  return (
    <ChartCard
      title="Profit bridge"
      subtitle="A quarter's revenue down to net profit, step by step"
    >
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>{(shown()?.name ?? "Net profit").toUpperCase()}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: shown() ? toneColor(toneOf(shown()!)) : colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown()
              ? shown()!.kind === "total"
                ? millions(shown()!.end)
                : signedMillions(amount(shown()!))
              : millions(net())}
          </Text>
          <Text
            style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: "tabular-nums" }}
          >
            {shown()
              ? `${margin(Math.abs(amount(shown()!)))} of revenue`
              : `${margin(net())} net margin`}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
        <Key color={chart.chart2} label="Total" />
        <Key color={colors.up} label="Adds" />
        <Key color={colors.destructive} label="Takes" />
      </View>
      <View
        style={{ marginTop: size.gap }}
        onLayout={({ bounds }) => plotWidth.set(bounds.size.width - AXIS - 8)}
      >
        <Plot
          data={steps()}
          xScale={{ type: "band", paddingInner: BRIDGE_PAD.inner, paddingOuter: BRIDGE_PAD.outer }}
          yScale={{ type: "linear", domain: [0, BRIDGE_TOP] }}
          // Each step's kind takes its color: totals graphite, rises and falls in the day's tones.
          colorScale={{
            type: "ordinal",
            domain: ["total", "increase", "decrease"],
            range: [chart.chart2, colors.up, colors.destructive],
          }}
          appearGeneration={1}
          motion={{
            appear: { duration: 900, easing: "easeOut" },
            update: BRIDGE_UPDATE,
            enter: { duration: 150 },
            exit: { duration: 150 },
            pointer: { stiffness: 320, damping: 32 },
          }}
          accessibilityLabel={`Profit bridge, ${quarter()}: ${millions(revenue())} revenue to ${millions(net())} net profit, a net margin of ${margin(net())}`}
          accessibilityValue={{
            text:
              shown() &&
              `${shown()!.name}: ${shown()!.kind === "total" ? millions(shown()!.end) : signedMillions(amount(shown()!))}`,
          }}
          {...plotCrossLine({ band: true })}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{ height: BRIDGE_HEIGHT, marginRight: AXIS + 8, marginBottom: BELOW }}
        >
          <Grid y={[40, 80, 120]} style={plotGrid()} />
          {/* Connectors: each step's level carried across the gap to the next step, placed on the
              scales (from a band's right edge, half a band past its middle) so they follow the
              plot's ranges and glide with a new quarter. */}
          <PlotLabel
            texts={CONNECTORS.map((i) => ({
              text: "",
              x: i + (1 - BRIDGE_PAD.inner) / 2,
              y: steps()[i].end,
              style: {
                width: gap(),
                height: 0,
                borderTopWidth: 1,
                borderStyle: "dashed",
                borderColor: alpha(colors.foreground, 0.3),
              },
            }))}
          />
          <Grid y={[0]} style={plotBaseline()} />
          <Bar
            value="end"
            base="start"
            color="kind"
            cornerRadii={2}
            stagger={0.5}
            inactiveOpacity={0.4}
            label={(d: Step) => (d.kind === "total" ? fixed(d.end, 1) : signed(d.end - d.start, 1))}
            labelStyle={labelStyle}
          />
          <PlotAxis
            placement="right"
            tickValues={[0, 40, 80, 120]}
            labelStyle={{ ...axis(), width: AXIS + 8, paddingLeft: 8, textAlign: "right" }}
          />
          <PlotAxis format={(v) => steps()[v].short} labelStyle={below()} />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="Revenue" value={millions(revenue())} />
          <Stat label="Gross" value={margin(steps()[2].end)} />
          <Stat label="Operating" value={margin(operating())} />
          <Stat label="Net" value={margin(net())} tone="up" />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 260 : undefined,
        }}
      >
        <Choice
          options={BRIDGE_QUARTERS}
          value={quarter()}
          size={size.switch}
          onChange={(next) => {
            if (!reduceMotion()) LayoutAnimation.configureNext(bridgeLayout);
            quarter.set(next);
          }}
        />
      </View>
    </ChartCard>
  );
}

// --- Conversion funnel (Funnel) --------------------------------------------------------------

/** An onboarding funnel's stages, by channel: everyone, the app's, the web's. */
const CHANNELS = [
  { value: "all", label: "All" },
  { value: "app", label: "App" },
  { value: "web", label: "Web" },
] as const;
type Channel = (typeof CHANNELS)[number]["value"];
const STAGE_NAMES = ["Visits", "Sign-ups", "KYC verified", "Funded", "First trade"];
const REACHED: Record<Channel, number[]> = {
  app: [96800, 27110, 19240, 10870, 7830],
  web: [87400, 15250, 9170, 4150, 2410],
  all: [184200, 42360, 28410, 15020, 10240],
};
/** A stage: how many reached it, the share of the stage before that did,
 * and its place, the category its color comes from. */
type Stage = { name: string; count: number; kept: number; tier: string };
const stages = (c: Channel): Stage[] =>
  REACHED[c].map((reached, i) => ({
    name: STAGE_NAMES[i],
    count: reached,
    kept: i === 0 ? 1 : reached / REACHED[c][i - 1],
    tier: String(i),
  }));
/** Half the widest stage, everyone's visits: every channel on the same scale. */
const FUNNEL_HALF = REACHED.all[0] / 2;
const FUNNEL_ROWS = STAGE_NAMES.length;
/** Bars as high as the gaps between them, where the necks run. */
const FUNNEL_PAD = { inner: 0.5, outer: 0.08 };
const FUNNEL_HEIGHT = pointer ? 204 : 216;
/** Where stage `i`'s bar is down the plot, in points (the band scale's own
 * arithmetic): its top, height and middle, and the middle of the gap under it. */
const funnelRow = (i: number) => {
  const band = bandAt(i, FUNNEL_ROWS, FUNNEL_PAD);
  const top = band.start * FUNNEL_HEIGHT;
  const height = band.width * FUNNEL_HEIGHT;
  return {
    top,
    height,
    middle: top + height / 2,
    gap: top + height + ((band.step - band.width) * FUNNEL_HEIGHT) / 2,
  };
};
/** The columns beside the bars: each stage's name over its count, and what it keeps. */
const FUNNEL_LEFT = 86;
const FUNNEL_RIGHT = 54;
/** Each stage's depth of the series color, the top stage deepest. */
const TIERS = [1, 0.8, 0.64, 0.5, 0.38];
/** How a channel's stages move into another's: the bars on the plot's
 * `motion.update`, the necks' ends with them. */
const FUNNEL_UPDATE = { duration: 550, easing: "easeInOut" } as const;
/** The plot's appear and the share of it over which the bars start, top down. */
const FUNNEL_APPEAR = 900;
const FUNNEL_STAGGER = 0.5;
/** A bar's half width, a share of the plot's width. */
const halfOf = (reached: number) => reached / (4 * FUNNEL_HALF);
/** Where a stage's bar starts, in points (half of it): a stage of none
 * would be this wide, so a last stage of a few traders stays a bar. */
const FUNNEL_MIN_HALF = 5;
/** The bars' corners, and the necks' edges that follow them. */
const FUNNEL_RADIUS = 4;
/** A stage's half width as a share of a plot `width` wide: from
 * `FUNNEL_MIN_HALF` points for none to the whole width for everyone's
 * visits, in proportion (so a small stage stays a bar and the small ones
 * still differ). */
const halfFor = (reached: number, width: number) =>
  width > 2 * FUNNEL_MIN_HALF
    ? (FUNNEL_MIN_HALF + (width / 2 - FUNNEL_MIN_HALF) * (reached / REACHED.all[0])) / width
    : halfOf(reached);
/** A stage's bar's ends on the counts' scale, as `halfFor` sizes it: a
 * new function for each width, so the bars read their rows again. */
const barEnd = (width: number, side: 1 | -1) => (d: Stage) =>
  side * halfFor(d.count, width) * 2 * FUNNEL_HALF;
const percentOf = (v: number) => `${fixed(v * 100, 1)}%`;

/**
 * An onboarding funnel: each stage a bar centered on the middle (a `Bar`
 * from `-count / 2` to `count / 2`, a base per row), deepest at the top
 * and lighter down, and between two stages a soft neck from one bar's
 * ends to the next one's (a `Canvas` under the bars), so the stages read
 * as one flow. Beside the bars, each stage's name over its count, and
 * what it keeps of the stage before; in the gaps, what is lost there, the
 * biggest drop in the down tone. The bars grow out of the middle top down;
 * a channel moves the bars and the necks together on the same scale. The
 * stage under the pointer or the arrow keys stays lit (the necks, labels
 * and other bars fade) and is read out over the plot.
 */
function Funnel() {
  const channel = signal<Channel>("all");
  const hover = signal<number | null>(null);
  const rows = () => stages(channel());
  const shown = () => (hover() == null ? undefined : rows()[hover()!]);
  const overall = () => rows()[FUNNEL_ROWS - 1].count / rows()[0].count;
  // The stage that keeps the least of the one before it.
  const leak = () =>
    rows()
      .slice(1)
      .reduce((a, b) => (b.kept < a.kept ? b : a));
  const lit = (i: number) => hover() == null || hover() === i;
  // The plot's width, for the narrowest stage: the bars and the necks are
  // drawn from it alike.
  const plotWidth = signal(0);
  /** A row's fade with the hover. */
  const dim = (i: number) => ({ opacity: lit(i) ? 1 : 0.35 });
  const fading = "transition-opacity duration-150 motion-reduce:transition-none";
  const channelName = () => CHANNELS.find((c) => c.value === channel())!.label;
  return (
    <ChartCard title="Conversion funnel" subtitle="From a first visit to a first trade">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>{(shown()?.name ?? "Visits to first trade").toUpperCase()}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown() ? count(shown()!.count) : percentOf(overall())}
          </Text>
          <Text
            style={{
              flexShrink: 1,
              fontSize: 12,
              color: colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown()
              ? hover() === 0
                ? "the top of the funnel"
                : `${percentOf(shown()!.kept)} of ${rows()[hover()! - 1].name.toLowerCase()} · ${percentOf(shown()!.count / rows()[0].count)} of visits`
              : `${count(rows()[FUNNEL_ROWS - 1].count)} traders of ${count(rows()[0].count)} visits`}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginTop: size.gap + 6 }}>
        {/* Each stage's name over its count, end-aligned on its bar's middle. */}
        <View style={{ width: FUNNEL_LEFT, height: FUNNEL_HEIGHT }}>
          <Each of={STAGE_NAMES}>
            {(name, i) => {
              const row = funnelRow(i());
              return (
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    left: 0,
                    top: row.middle - 16,
                    height: 32,
                    justifyContent: "center",
                  }}
                >
                  <View class={fading} style={{ alignItems: "flex-end", gap: 2, ...dim(i()) }}>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, numberOfLines: 1 }}>
                      {name()}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: colors.foreground,
                        fontVariant: "tabular-nums",
                      }}
                    >
                      {count(rows()[i()].count)}
                    </Text>
                  </View>
                </View>
              );
            }}
          </Each>
        </View>
        <View
          style={{ flex: 1, height: FUNNEL_HEIGHT }}
          onLayout={({ bounds }) => plotWidth.set(bounds.size.width)}
        >
          <Plot
            data={rows()}
            // Stages down the plot, the counts across it, centered on zero.
            xScale={{ type: "linear", domain: [-FUNNEL_HALF, FUNNEL_HALF] }}
            yScale={{
              type: "band",
              paddingInner: FUNNEL_PAD.inner,
              paddingOuter: FUNNEL_PAD.outer,
            }}
            // One hue, deepest at the top stage.
            colorScale={{
              type: "ordinal",
              domain: TIERS.map((_, i) => String(i)),
              range: TIERS.map((a) => alpha(chart.chart1, a)),
            }}
            appearGeneration={1}
            motion={{
              appear: { duration: FUNNEL_APPEAR, easing: "easeOut" },
              update: FUNNEL_UPDATE,
              enter: { duration: 150 },
              exit: { duration: 150 },
              pointer: { stiffness: 320, damping: 32 },
            }}
            accessibilityLabel={`Conversion funnel, ${channelName()}: ${count(rows()[0].count)} visits to ${count(rows()[FUNNEL_ROWS - 1].count)} first trades, ${percentOf(overall())}`}
            accessibilityValue={{
              text:
                shown() &&
                `${shown()!.name}: ${count(shown()!.count)}, ${percentOf(shown()!.kept)} of the stage before`,
            }}
            crossLineClass="w-full h-full"
            crossLineStyle={{ backgroundColor: alpha(colors.foreground, 0.045), borderRadius: 6 }}
            onHoverChange={({ index }) => hover.set(index)}
            focusVisibleStyle={focusRing(4)}
            style={{ height: FUNNEL_HEIGHT }}
          >
            {/* The necks, beside the bars: from one bar's ends to the next one's, curving through the gap. Their
                edges at the bars follow the bars' rounded corners (half a point into them, so no seam shows), so a
                stage and its necks read as one shape. */}
            <Canvas
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
              }}
              draw={(cx, { width }) => {
                const mid = width / 2;
                const color = chart.chart1;
                const r = FUNNEL_RADIUS;
                const e = 0.5;
                const quarter = Math.PI / 2;
                for (let k = 0; k < FUNNEL_ROWS - 1; k++) {
                  // The bottom of the bar above, the top of the one below.
                  const y0 = funnelRow(k).top + funnelRow(k).height;
                  const y1 = funnelRow(k + 1).top;
                  const ym = (y0 + y1) / 2;
                  const a = halfFor(rows()[k].count, width) * width;
                  const b = halfFor(rows()[k + 1].count, width) * width;
                  const [aR, aL, bR, bL] = [a + mid, mid - a, b + mid, mid - b];
                  const wash = cx.createLinearGradient(0, y0, 0, y1);
                  wash.addColorStop(0, alpha(color, 0.22 * TIERS[k]));
                  wash.addColorStop(1, alpha(color, 0.22 * TIERS[k + 1]));
                  cx.fillStyle = wash;
                  // The neck runs into the hovered stage, or fades with the others.
                  cx.globalAlpha = hover() == null || hover() === k + 1 || hover() === k ? 1 : 0.35;
                  cx.beginPath();
                  // Along the bar above's bottom, its corners included, right to left.
                  cx.moveTo(aR, y0 - r);
                  cx.arc(aR - r, y0 - r, r - e, 0, quarter);
                  cx.arc(aL + r, y0 - r, r - e, quarter, 2 * quarter);
                  cx.lineTo(aL, y0 - r);
                  // Down its left end and through the gap to the bar below.
                  cx.lineTo(aL, y0);
                  cx.bezierCurveTo(aL, ym, bL, ym, bL, y1);
                  cx.lineTo(bL, y1 + r);
                  // Along the bar below's top, left to right.
                  cx.arc(bL + r, y1 + r, r - e, 2 * quarter, 3 * quarter);
                  cx.arc(bR - r, y1 + r, r - e, 3 * quarter, 4 * quarter);
                  cx.lineTo(bR, y1 + r);
                  // Up its right end and back.
                  cx.lineTo(bR, y1);
                  cx.bezierCurveTo(bR, ym, aR, ym, aR, y0);
                  cx.closePath();
                  cx.fill();
                }
                cx.globalAlpha = 1;
              }}
            />
            <Bar
              base={barEnd(plotWidth(), -1)}
              value={barEnd(plotWidth(), 1)}
              color="tier"
              cornerRadii={FUNNEL_RADIUS}
              stagger={FUNNEL_STAGGER}
              inactiveOpacity={0.35}
            />
          </Plot>
        </View>
        {/* What each stage keeps of the one before, on its row; what is lost, in the gap above it. */}
        <View style={{ width: FUNNEL_RIGHT, height: FUNNEL_HEIGHT }}>
          <Each of={STAGE_NAMES}>
            {(_, i) => {
              const row = funnelRow(i());
              return (
                <View style={{ position: "absolute", right: 0, top: row.middle - 9, height: 18 }}>
                  <View
                    class={fading}
                    style={{
                      height: 18,
                      justifyContent: "center",
                      paddingHorizontal: 6,
                      borderRadius: 9,
                      backgroundColor:
                        hover() === i()
                          ? alpha(chart.chart1, 0.22)
                          : alpha(colors.foreground, 0.06),
                      ...dim(i()),
                    }}
                  >
                    <Text style={{ ...axis(), color: colors.foreground }}>
                      {i() === 0 ? "100%" : percentOf(rows()[i()].kept)}
                    </Text>
                  </View>
                </View>
              );
            }}
          </Each>
          <Each of={STAGE_NAMES.slice(1)}>
            {(name, k) => (
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  top: funnelRow(k()).gap - 7,
                  height: 14,
                  justifyContent: "center",
                }}
              >
                <Text
                  class={fading}
                  style={{
                    ...axis(),
                    fontSize: 10,
                    paddingRight: 6,
                    color: leak().name === name() ? toneColor("down") : colors.faint,
                    ...dim(k() + 1),
                  }}
                >
                  {`−${percentOf(1 - rows()[k() + 1].kept)}`}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="Overall" value={percentOf(overall())} tone="up" />
          <Stat label="Biggest drop" value={leak().name} />
          <Stat label="Lost there" value={`−${percentOf(1 - leak().kept)}`} tone="down" />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 200 : undefined,
        }}
      >
        <Choice
          options={CHANNELS}
          value={channel()}
          size={size.switch}
          onChange={(next) => channel.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Daily candles (Candles) ------------------------------------------------------------------

const MONTH_FULL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/** The trading days up to Friday, October 30, 2026: weekdays, oldest first. */
const SESSIONS = (() => {
  const out: string[] = [];
  const day = new Date(Date.UTC(2026, 9, 30));
  while (out.length < 61) {
    const weekday = day.getUTCDay();
    if (weekday !== 0 && weekday !== 6)
      out.unshift(`${MONTH_FULL[day.getUTCMonth()]} ${day.getUTCDate()}`);
    day.setUTCDate(day.getUTCDate() - 1);
  }
  return out;
})();
type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dir: "up" | "down";
  upVolume?: number;
  downVolume?: number;
};
const cents = (v: number) => Math.round(v * 100) / 100;
/** A stock's daily candles over those days: a climb, a pullback, a recovery;
 * volume in millions, heavier on the days that move more. */
const CANDLES: Candle[] = (() => {
  const r = random(61);
  let close = 168;
  return SESSIONS.map((date, i) => {
    const open = close * (1 + (r() - 0.5) * 0.012);
    const drift = i < 24 ? 0.0035 : i < 40 ? -0.0045 : 0.004;
    close = open * (1 + drift + (r() - 0.5) * 0.026);
    const high = Math.max(open, close) * (1 + r() * 0.011);
    const low = Math.min(open, close) * (1 - r() * 0.011);
    const volume =
      Math.round((6 + r() * 6) * (1 + (Math.abs(close - open) / open) * 30) * 100) / 100;
    const dir: Candle["dir"] = close >= open ? "up" : "down";
    const candle: Candle = {
      date,
      open: cents(open),
      high: cents(high),
      low: cents(low),
      close: cents(close),
      volume,
      dir,
    };
    if (dir === "up") candle.upVolume = volume;
    else candle.downVolume = volume;
    return candle;
  });
})();
const CANDLE_SPANS = [
  { value: "1M", label: "1M", days: 21 },
  { value: "2M", label: "2M", days: 41 },
  { value: "3M", label: "3M", days: 61 },
] as const;
type CandleSpan = (typeof CANDLE_SPANS)[number]["value"];
const CANDLE_PAD = { inner: 0.3, outer: 0.15 };
const PRICE_HEIGHT = 168;
const VOLUME_HEIGHT = 44;
/** The x axis's text of a span's days: a new function for each span, so
 * the axis writes its labels again with the rows. */
const dayNames = (rows: { date: string }[]) => (v: number) => rows[v].date;

/**
 * Daily candles over their volume: each day a body from its open to its
 * close (a `Bar` with a `base` per row) over a wick from its low to its
 * high (a `Rule`), green up and red down through the plot's `colorScale`,
 * the last close tagged in the gutter at its height. Under it the day's
 * volume in the same bands, in the day's tone. The day under the pointer
 * is marked on both plots and its open, high, low and close read out over
 * them; a period draws its candles in again.
 */
function Candles() {
  const span = signal<CandleSpan>("2M");
  const hover = signal<number | null>(null);
  // Which plot the pointer is over: the other one marks the day itself.
  const over = signal<"price" | "volume" | null>(null);
  const rows = () => CANDLES.slice(-CANDLE_SPANS.find((s) => s.value === span())!.days);
  const last = () => rows()[rows().length - 1];
  const shown = () =>
    rows()[hover() != null && hover()! < rows().length ? hover()! : rows().length - 1];
  /** The close before a day's, what its change is measured from. */
  const before = (c: Candle) => {
    const i = CANDLES.indexOf(c);
    return i > 0 ? CANDLES[i - 1].close : c.open;
  };
  const change = () => shown().close - before(shown());
  const tone = (): Tone => (change() >= 0 ? "up" : "down");
  const domain = (): [number, number] => {
    const lo = Math.min(...rows().map((c) => c.low));
    const hi = Math.max(...rows().map((c) => c.high));
    const pad = (hi - lo) * 0.08;
    return [Math.floor(lo - pad), Math.ceil(hi + pad)];
  };
  const grid = () => ticks(domain()[0], domain()[1], 4);
  const y = (v: number) => (1 - (v - domain()[0]) / (domain()[1] - domain()[0])) * PRICE_HEIGHT;
  const topVolume = () => Math.max(...rows().map((c) => c.volume)) * 1.12;
  const total = () => (last().close / rows()[0].open - 1) * 100;
  const ups = () => rows().filter((c) => c.dir === "up").length;
  const dates = () => {
    const n = rows().length - 1;
    return [0, Math.round(n / 3), Math.round((2 * n) / 3), n];
  };
  const followTo =
    (which: "price" | "volume") =>
    ({ index }: { index: number | null }) => {
      hover.set(index);
      over.set(index == null ? null : which);
    };
  // The hovered day's band on the plot the pointer is not over.
  const mark = (which: "price" | "volume") => (
    <If when={hover() != null && over() !== which}>
      <View
        style={{
          position: "absolute",
          left: share(bandAt(hover() ?? 0, rows().length, CANDLE_PAD).start),
          width: share(bandAt(0, rows().length, CANDLE_PAD).width),
          top: 0,
          bottom: 0,
          backgroundColor: alpha(colors.foreground, 0.06),
          pointerEvents: "none",
        }}
      />
    </If>
  );
  const ohlc = (label: string, v: number) => (
    <Text style={{ ...axis(), color: colors.faint }}>
      {`${label} `}
      <Text style={{ color: colors.foreground }}>{fixed(v)}</Text>
    </Text>
  );
  const motion = {
    appear: { duration: 800, easing: "easeOut" },
    enter: { duration: 120 },
    exit: { duration: 160 },
  } as const;
  return (
    <ChartCard
      title="Daily candles"
      subtitle="Open to close over each day's range, its volume under it"
    >
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: "monospace", color: colors.mutedForeground }}>
            NSHL
          </Text>
          <Text style={tipTitle()}>{shown().date.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {fixed(shown().close)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: toneColor(tone()),
              fontVariant: "tabular-nums",
            }}
          >
            {`${signed(change())}  ${signed((change() / before(shown())) * 100)}%`}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 2 }}>
          {ohlc("O", shown().open)}
          {ohlc("H", shown().high)}
          {ohlc("L", shown().low)}
          {ohlc("C", shown().close)}
          <Text style={{ ...axis(), color: colors.faint }}>
            {"VOL "}
            <Text style={{ color: colors.foreground }}>{`${fixed(shown().volume, 1)}M`}</Text>
          </Text>
        </View>
      </View>
      <View style={{ marginTop: size.gap, gap: 6 }}>
        <Plot
          data={rows()}
          xScale={{ type: "band", paddingInner: CANDLE_PAD.inner, paddingOuter: CANDLE_PAD.outer }}
          yScale={{ type: "linear", domain: domain() }}
          colorScale={{
            type: "ordinal",
            domain: ["up", "down"],
            range: [colors.up, colors.destructive],
          }}
          appearGeneration={span()}
          // No pointer spring: the other plot marks the same day at once, so both move together.
          motion={motion}
          accessibilityLabel={`NSHL daily candles, ${span()}: ${fixed(rows()[0].open)} to ${fixed(last().close)}, ${signed(total())}%`}
          accessibilityValue={{
            text:
              hover() == null
                ? undefined
                : `${shown().date}: open ${fixed(shown().open)}, high ${fixed(shown().high)}, low ${fixed(shown().low)}, close ${fixed(shown().close)}`,
          }}
          crossLineClass="w-full h-full"
          crossLineStyle={{ backgroundColor: alpha(colors.foreground, 0.06) }}
          onHoverChange={followTo("price")}
          focusVisibleStyle={focusRing(4)}
          style={{ height: PRICE_HEIGHT, marginRight: GUTTER }}
        >
          <Grid y={grid()} style={plotGrid()} />
          {/* The last close: a dotted level across the days. */}
          <Grid
            y={[last().close]}
            style={{ stroke: alpha(toneColor(last().dir), 0.55), strokeDasharray: "2 3" }}
          />
          {/* Wicks under bodies, both in the day's tone. */}
          <Rule
            value="high"
            base="low"
            color="dir"
            stagger={0.6}
            inactiveOpacity={0.3}
            style={{ strokeWidth: 1 }}
          />
          <Bar
            value="close"
            base="open"
            color="dir"
            cornerRadii={1}
            stagger={0.6}
            inactiveOpacity={0.3}
          />
          {mark("price")}
          {/* The gutter: the grid's values clear of the last close's tag. */}
          <PlotAxis
            placement="right"
            tickValues={grid().filter((v) => Math.abs(y(v) - y(last().close)) > 14)}
            format={(v) => fixed(v, 0)}
            labelStyle={{ ...axis(), paddingLeft: 10 }}
          />
          <PlotAxis
            placement="right"
            tickValues={[last().close]}
            format={(v) => fixed(v)}
            labelStyle={{
              marginLeft: 6,
              paddingHorizontal: 5,
              lineHeight: 18,
              borderRadius: 5,
              backgroundColor: toneColor(last().dir),
              fontSize: 10.5,
              fontFamily: "monospace",
              fontWeight: "600",
              color: colors.card,
              fontVariant: "tabular-nums",
            }}
          />
        </Plot>
        <Plot
          data={rows()}
          xScale={{ type: "band", paddingInner: CANDLE_PAD.inner, paddingOuter: CANDLE_PAD.outer }}
          yScale={{ type: "linear", domain: [0, topVolume()] }}
          appearGeneration={span()}
          motion={motion}
          accessibilityLabel={`NSHL volume, ${span()}: ${fixed(rows().reduce((s, c) => s + c.volume, 0) / rows().length, 1)} million a day`}
          accessibilityValue={{
            text:
              hover() == null ? undefined : `${shown().date}: ${fixed(shown().volume, 1)} million`,
          }}
          crossLineClass="w-full h-full"
          crossLineStyle={{ backgroundColor: alpha(colors.foreground, 0.06) }}
          onHoverChange={followTo("volume")}
          focusVisibleStyle={focusRing(4)}
          style={{ height: VOLUME_HEIGHT, marginRight: GUTTER, marginBottom: BELOW }}
        >
          {/* A day's volume in one of two series, so each takes its tone, faded under the candles'. */}
          <Bar
            value="upVolume"
            stack="volume"
            cornerRadii={{ topLeft: 1, topRight: 1 }}
            stagger={0.6}
            inactiveOpacity={0.3}
            style={{ fill: alpha(colors.up, 0.45) }}
          />
          <Bar
            value="downVolume"
            stack="volume"
            cornerRadii={{ topLeft: 1, topRight: 1 }}
            stagger={0.6}
            inactiveOpacity={0.3}
            style={{ fill: alpha(colors.destructive, 0.45) }}
          />
          <Grid y={[0]} style={plotBaseline()} />
          {mark("volume")}
          <PlotAxis
            placement="right"
            tickValues={[topVolume() / 1.12]}
            format={(v) => `${fixed(v, 0)}M`}
            labelStyle={{ ...axis(), paddingLeft: 10 }}
          />
          <PlotAxis tickValues={dates()} format={dayNames(rows())} labelStyle={below()} />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="High" value={fixed(Math.max(...rows().map((c) => c.high)))} />
          <Stat label="Low" value={fixed(Math.min(...rows().map((c) => c.low)))} />
          <Stat
            label="Change"
            value={`${signed(total(), 1)}%`}
            tone={total() >= 0 ? "up" : "down"}
          />
          <Stat label="Up days" value={`${ups()} / ${rows().length}`} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 180 : undefined,
        }}
      >
        <Choice
          options={CANDLE_SPANS}
          value={span()}
          size={size.switch}
          onChange={(next) => {
            span.set(next);
            hover.set(null);
          }}
        />
      </View>
    </ChartCard>
  );
}

// --- Risk against return (RiskReturn) ---------------------------------------------------------

/** A round key of a legend: a dot of `color`, or a ring of it with `hollow`, and its label. */
function DotKey(props: { color: string; label: string; hollow?: boolean; size?: number }) {
  const d = props.size ?? 9;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          borderWidth: props.hollow ? 1.5 : 0,
          borderColor: props.color,
          backgroundColor: props.hollow ? "transparent" : props.color,
        }}
      />
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.label}</Text>
    </View>
  );
}

/** The periods a holding's annualized volatility and return are measured over. */
const RISK_PERIODS = [
  { value: "1Y", label: "1Y" },
  { value: "3Y", label: "3Y" },
  { value: "5Y", label: "5Y" },
] as const;
type RiskPeriod = (typeof RISK_PERIODS)[number]["value"];
const SECTORS = ["Technology", "Financials", "Energy", "Healthcare", "Consumer"] as const;
type Sector = (typeof SECTORS)[number];
/** Each sector's color: the accent leads, the others the theme's quiet hues. */
const sectorColor = (s: Sector) => categoryColors()[SECTORS.indexOf(s)];
/** A holding: its market cap in billions and, per period, its annualized
 * volatility and return in percent ([vol, ret]). */
type Holding = {
  ticker: string;
  name: string;
  sector: Sector;
  cap: number;
  p: Record<RiskPeriod, [number, number]>;
};
const HOLDINGS: Holding[] = [
  {
    ticker: "AAPL",
    name: "Apple",
    sector: "Technology",
    cap: 3600,
    p: { "1Y": [25, 12], "3Y": [23, 15], "5Y": [27, 21] },
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    sector: "Technology",
    cap: 3700,
    p: { "1Y": [21, 19], "3Y": [22, 17], "5Y": [25, 19] },
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    sector: "Technology",
    cap: 4300,
    p: { "1Y": [48, 36], "3Y": [52, 44], "5Y": [54, 46] },
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    sector: "Technology",
    cap: 380,
    p: { "1Y": [55, 41], "3Y": [50, 9], "5Y": [53, 26] },
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    sector: "Financials",
    cap: 830,
    p: { "1Y": [22, 31], "3Y": [21, 24], "5Y": [25, 19] },
  },
  {
    ticker: "GS",
    name: "Goldman Sachs",
    sector: "Financials",
    cap: 240,
    p: { "1Y": [29, 42], "3Y": [26, 27], "5Y": [29, 21] },
  },
  {
    ticker: "V",
    name: "Visa",
    sector: "Financials",
    cap: 670,
    p: { "1Y": [18, 15], "3Y": [18, 13], "5Y": [21, 12] },
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil",
    sector: "Energy",
    cap: 470,
    p: { "1Y": [20, 3], "3Y": [23, 6], "5Y": [29, 22] },
  },
  {
    ticker: "CVX",
    name: "Chevron",
    sector: "Energy",
    cap: 300,
    p: { "1Y": [22, -3], "3Y": [24, 1], "5Y": [30, 15] },
  },
  {
    ticker: "LLY",
    name: "Eli Lilly",
    sector: "Healthcare",
    cap: 820,
    p: { "1Y": [33, 12], "3Y": [30, 41], "5Y": [29, 37] },
  },
  {
    ticker: "UNH",
    name: "UnitedHealth",
    sector: "Healthcare",
    cap: 300,
    p: { "1Y": [42, -26], "3Y": [30, -4], "5Y": [31, 4] },
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    cap: 460,
    p: { "1Y": [15, 14], "3Y": [14.5, 2], "5Y": [16, 5] },
  },
  {
    ticker: "PFE",
    name: "Pfizer",
    sector: "Healthcare",
    cap: 140,
    p: { "1Y": [25, -6], "3Y": [23, -14], "5Y": [25, -4] },
  },
  // In the middle of the plot over three years, where the tests' pointer lands.
  {
    ticker: "AMZN",
    name: "Amazon",
    sector: "Consumer",
    cap: 2400,
    p: { "1Y": [31, 8], "3Y": [34, 11], "5Y": [33, 10] },
  },
  {
    ticker: "COST",
    name: "Costco",
    sector: "Consumer",
    cap: 420,
    p: { "1Y": [19, 4], "3Y": [20, 26], "5Y": [21, 24] },
  },
  {
    ticker: "NKE",
    name: "Nike",
    sector: "Consumer",
    cap: 95,
    p: { "1Y": [36, -15], "3Y": [33, -20], "5Y": [31, -10] },
  },
  {
    ticker: "MCD",
    name: "McDonald's",
    sector: "Consumer",
    cap: 220,
    p: { "1Y": [16, 2], "3Y": [17, 7], "5Y": [18, 11] },
  },
];
/** The index the holdings are measured against, per period. */
const SPX: Record<RiskPeriod, [number, number]> = {
  "1Y": [16, 16],
  "3Y": [15.5, 18],
  "5Y": [17.5, 14],
};
/** A plotted row: a holding (its `cap` sizes its bubble) or the index (its `bench` places its marker). */
type RiskRow = {
  ticker: string;
  name: string;
  sector?: Sector;
  vol: number;
  ret: number;
  cap?: number;
  bench?: number;
};
/** The rows in the order of their three-year volatility, so the keys step from the left. */
const RISK_ORDER = [
  ...HOLDINGS.map((h) => ({ ticker: h.ticker, vol: h.p["3Y"][0] })),
  { ticker: "SPX", vol: SPX["3Y"][0] },
]
  .sort((a, b) => a.vol - b.vol)
  .map((r) => r.ticker);
const riskRows = (period: RiskPeriod): RiskRow[] =>
  RISK_ORDER.map((ticker) => {
    if (ticker === "SPX") {
      const [vol, ret] = SPX[period];
      return { ticker, name: "S&P 500", vol, ret, bench: ret };
    }
    const h = HOLDINGS.find((holding) => holding.ticker === ticker)!;
    const [vol, ret] = h.p[period];
    return { ticker, name: h.name, sector: h.sector, vol, ret, cap: h.cap };
  });
/** The risk-free rate a Sharpe ratio is measured over, in percent. */
const RISK_FREE = 4;
const sharpe = (r: { vol: number; ret: number }) => (r.ret - RISK_FREE) / r.vol;
/** The plot's domains: every period's bubbles inside, the biggest included. */
const VOL_DOMAIN: [number, number] = [8, 60];
const RET_DOMAIN: [number, number] = [-36, 58];
const VOL_TICKS = pointer ? [10, 20, 30, 40, 50] : [20, 40];
const RET_TICKS = [-20, 0, 20, 40];
const RISK_HEIGHT = pointer ? 236 : 248;
/** The bubbles' radii: smaller on a narrow plot (a phone, a narrow window), so the crowded middle stays apart. */
const bubbles = (width: number): [number, number] => (width > 0 && width < 420 ? [3, 12] : [4, 20]);
const capOf = (b: number) => (b >= 1000 ? `$${fixed(b / 1000, 1)}T` : `$${fixed(b, 0)}B`);
const pct = (v: number, digits = 1) => `${signed(v, digits)}%`;

/**
 * Risk against return: a portfolio's holdings as bubbles (a `Dot` with a
 * radius per row, `r="cap"` through a square-root `rScale`, so a bubble's
 * area is its market cap), each holding's annualized volatility along x
 * and return up y, colored by sector through the plot's `colorScale`,
 * translucent with a ring in the card's color so overlaps stay apart. The
 * S&P 500 is a hollow marker of its own (a second `Dot` that reads only
 * the index's row), and dashed lines through it split the plot into
 * quadrants: up and left of it, more return for less risk. A period moves
 * every bubble to its new place (`motion.update`); the holding under the
 * pointer or the arrow keys is ringed and read out over the plot, the
 * others fading.
 */
function RiskReturn() {
  const period = signal<RiskPeriod>("3Y");
  const hover = signal<number | null>(null);
  const rows = () => riskRows(period());
  const holdings = () => rows().filter((r) => r.bench == null);
  const index = () => rows().find((r) => r.bench != null)!;
  const shown = () => (hover() == null ? undefined : rows()[hover()!]);
  const mean = (pick: (r: RiskRow) => number) =>
    holdings().reduce((s, r) => s + pick(r), 0) / holdings().length;
  const best = () => holdings().reduce((a, b) => (sharpe(b) > sharpe(a) ? b : a));
  const ahead = () => holdings().filter((r) => sharpe(r) > sharpe(index())).length;
  const ring = { outlineWidth: 1.5, outlineOffset: 2, outlineColor: colors.foreground };
  const plotWidth = signal(0);
  // On the card's color, so the grid and the index's lines pass under the words.
  const corner = {
    ...axis(),
    color: colors.faint,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: colors.card,
    borderRadius: 4,
  };
  return (
    <ChartCard title="Risk vs return" subtitle="Volatility against return, sized by market cap">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>
          {shown()
            ? `${shown()!.ticker === "SPX" ? "S&P 500" : shown()!.ticker} · ${shown()!.ticker === "SPX" ? "BENCHMARK" : shown()!.name.toUpperCase()}`
            : `PORTFOLIO · ${period()}`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {pct(shown()?.ret ?? mean((r) => r.ret))}
          </Text>
          <Text
            style={{
              flexShrink: 1,
              fontSize: 12,
              color: colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown()
              ? `${fixed(shown()!.vol, 1)}% vol · Sharpe ${fixed(sharpe(shown()!))}`
              : `mean annual return · ${fixed(
                  mean((r) => r.vol),
                  1,
                )}% mean vol`}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: "tabular-nums" }}>
          {shown()
            ? shown()!.sector
              ? `${shown()!.sector} · ${capOf(shown()!.cap!)} market cap`
              : "The index the holdings are measured against"
            : `${HOLDINGS.length} holdings, equal weight · risk-free ${RISK_FREE}%`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 14,
          rowGap: 6,
          marginTop: 10,
        }}
      >
        <Each of={SECTORS}>{(s) => <DotKey color={sectorColor(s())} label={s()} />}</Each>
        <DotKey color={colors.foreground} label="S&P 500" hollow />
      </View>
      <View
        style={{ marginTop: size.gap + 4 }}
        onLayout={({ bounds }) => plotWidth.set(bounds.size.width)}
      >
        {/* The y axis' title, over its ticks on the right. */}
        <Text style={{ ...axis(), color: colors.faint, alignSelf: "flex-end", marginBottom: 6 }}>
          Return, annualized ↑
        </Text>
        <Plot
          data={rows()}
          x="vol"
          xScale={{ type: "linear", domain: VOL_DOMAIN }}
          yScale={{ type: "linear", domain: RET_DOMAIN }}
          // Translucent sector fills, so a bubble under another still shows.
          colorScale={{
            type: "ordinal",
            domain: [...SECTORS],
            range: SECTORS.map((s) => alpha(sectorColor(s), 0.78)),
          }}
          appearGeneration={1}
          motion={{
            appear: { duration: 1000, easing: "easeOut" },
            update: { duration: 700, easing: "easeInOut" },
            enter: { duration: 150 },
            exit: { duration: 200 },
            pointer: { stiffness: 320, damping: 32 },
          }}
          accessibilityLabel={`Risk and return of ${HOLDINGS.length} holdings, ${period()}: best Sharpe ${best().ticker}, ${ahead()} ahead of the S&P 500`}
          accessibilityValue={{
            text:
              shown() &&
              `${shown()!.name}: ${pct(shown()!.ret)} return, ${fixed(shown()!.vol, 1)}% volatility, Sharpe ${fixed(sharpe(shown()!))}`,
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{ height: RISK_HEIGHT, marginRight: AXIS + 8, marginBottom: BELOW }}
        >
          <Grid x={VOL_TICKS} y={RET_TICKS} style={plotGrid()} />
          <Grid y={[0]} style={plotBaseline()} />
          {/* The index's risk and return: the quadrants' edges. */}
          <Grid
            x={[index().vol]}
            y={[index().ret]}
            style={{ stroke: alpha(colors.foreground, 0.3), strokeDasharray: "2 4" }}
          />
          <PlotLabel
            texts={[
              { text: "Less risk, more return", x: VOL_DOMAIN[0], y: RET_DOMAIN[1], style: corner },
              {
                text: "More risk, less return",
                x: VOL_DOMAIN[1],
                y: RET_DOMAIN[0],
                align: "right",
                class: "-translate-y-full",
                style: corner,
              },
            ]}
          />
          {/* The holdings: a bubble's area its market cap, the bigger ones under the smaller. */}
          <Dot
            value="ret"
            r="cap"
            rScale={{ type: "sqrt", range: bubbles(plotWidth()) }}
            color="sector"
            stagger={0.5}
            inactiveOpacity={0.22}
            hitRadius={6}
            style={{ stroke: colors.card, strokeWidth: 1.5 }}
            hoverDotClass="rounded-full"
            hoverDotStyle={ring}
          />
          {/* The index: a hollow marker in the text's color over a halo in the card's, lifting it out of the bubbles it sits among. */}
          <Dot
            value="bench"
            r={9}
            inactiveOpacity={0.3}
            style={{ fill: colors.card }}
            hoverDotClass="hidden"
          />
          <Dot
            value="bench"
            r={5}
            inactiveOpacity={0.3}
            style={{ fill: colors.card, stroke: colors.foreground, strokeWidth: 2 }}
            hoverDotClass="rounded-full"
            hoverDotStyle={ring}
          />
          <PlotAxis
            placement="right"
            tickValues={RET_TICKS}
            format={(v) => (v === 0 ? "0" : `${signed(v, 0)}%`)}
            labelStyle={{ ...axis(), width: AXIS + 8, paddingLeft: 8, textAlign: "right" }}
          />
          <PlotAxis tickValues={VOL_TICKS} format={(v) => `${v}%`} labelStyle={below()} />
        </Plot>
        {/* The x axis' title, under its ticks' end. */}
        <Text
          style={{
            ...axis(),
            color: colors.faint,
            alignSelf: "flex-end",
            marginRight: AXIS + 8,
            marginTop: 2,
          }}
        >
          Volatility →
        </Text>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="Best Sharpe" value={`${best().ticker} ${fixed(sharpe(best()))}`} tone="up" />
          <Stat label="S&P 500" value={pct(index().ret)} />
          <Stat label="Ahead" value={`${ahead()} / ${HOLDINGS.length}`} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 180 : undefined,
        }}
      >
        <Choice
          options={RISK_PERIODS}
          value={period()}
          size={size.switch}
          onChange={(next) => period.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Price targets (Targets) -----------------------------------------------------------------

/** The coverage lists of the targets card. */
const COVERAGE = [
  { value: "semis", label: "Semis" },
  { value: "software", label: "Software" },
  { value: "banks", label: "Banks" },
] as const;
type Coverage = (typeof COVERAGE)[number]["value"];
/** A stock's analysts: today's price, their lowest, mean and highest
 * 12-month targets, the mean three months ago, and how many cover it. */
type Covered = [
  ticker: string,
  price: number,
  low: number,
  mean: number,
  high: number,
  prior: number,
  analysts: number,
];
const TARGETS: Record<Coverage, Covered[]> = {
  semis: [
    ["NVDA", 186, 140, 228, 300, 210, 64],
    ["AMD", 238, 150, 255, 350, 190, 45],
    ["AVGO", 342, 280, 405, 460, 380, 41],
    ["TSM", 298, 250, 345, 400, 320, 18],
    ["INTC", 38, 20, 36, 52, 28, 38],
    ["QCOM", 168, 130, 185, 230, 188, 34],
  ],
  software: [
    ["MSFT", 512, 450, 625, 710, 600, 58],
    ["ORCL", 258, 175, 330, 400, 290, 40],
    ["CRM", 242, 200, 330, 430, 345, 50],
    ["ADBE", 345, 280, 430, 560, 460, 36],
    ["NOW", 905, 750, 1130, 1300, 1100, 42],
    ["PLTR", 182, 100, 160, 255, 130, 25],
  ],
  banks: [
    ["JPM", 305, 255, 330, 375, 315, 26],
    ["BAC", 51, 44, 57, 63, 54, 25],
    ["WFC", 82, 70, 90, 101, 86, 24],
    ["C", 98, 80, 112, 128, 102, 22],
    ["GS", 780, 560, 790, 940, 700, 24],
    ["MS", 152, 120, 158, 180, 160, 25],
  ],
};
/** A plotted stock: its targets as upsides over today's price, in percent. */
type Target = {
  ticker: string;
  price: number;
  mean: number;
  analysts: number;
  lowUp: number;
  meanUp: number;
  highUp: number;
  priorUp: number;
  revised: number;
  dir: "up" | "down";
};
const upside = (target: number, price: number) => (target / price - 1) * 100;
/** A list's stocks, the most upside first. */
const targets = (c: Coverage): Target[] =>
  TARGETS[c]
    .map(([ticker, price, low, mean, high, prior, analysts]) => ({
      ticker,
      price,
      mean,
      analysts,
      lowUp: upside(low, price),
      meanUp: upside(mean, price),
      highUp: upside(high, price),
      priorUp: upside(prior, price),
      revised: (mean / prior - 1) * 100,
      dir: (mean >= price ? "up" : "down") as Target["dir"],
    }))
    .sort((a, b) => b.meanUp - a.meanUp);
const UPSIDE_DOMAIN: [number, number] = [-55, 85];
const UPSIDE_TICKS = pointer ? [-50, -25, 0, 25, 50, 75] : [-50, 0, 50];
const TARGET_ROW = pointer ? 30 : 34;
/** The y axis' text of a list's stocks: a new function for each list, so the axis writes its labels again. */
const tickersOf = (rows: Target[]) => (v: number) => rows[v].ticker;
const dollars = (v: number) => `$${v >= 1000 ? count(v) : fixed(v, v < 100 ? 2 : 0)}`;
const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/**
 * Analysts' price targets as a dot plot across a band y scale, one stock a
 * row: a `Rule` from the lowest target to the highest (the street's
 * spread), a hollow `Dot` at the mean target three months ago and a
 * filled one at today's, in the tone of its direction (`colorScale`), all
 * as upside over today's price, a firmer line at zero. The stock under the
 * pointer or the arrow keys is read out over the plot; another list moves
 * the dots and ranges to its stocks'.
 */
function Targets() {
  const list = signal<Coverage>("semis");
  const hover = signal<number | null>(null);
  const rows = () => targets(list());
  const shown = () => (hover() == null || hover()! >= rows().length ? undefined : rows()[hover()!]);
  const name = () => COVERAGE.find((c) => c.value === list())!.label;
  const top = () => rows()[0];
  const widest = () => rows().reduce((a, b) => (b.highUp - b.lowUp > a.highUp - a.lowUp ? b : a));
  const raised = () => rows().filter((r) => r.revised > 0).length;
  const height = () => rows().length * TARGET_ROW;
  return (
    <ChartCard title="Price targets" subtitle="Analysts' one-year targets against today's price">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>
          {shown()
            ? `${shown()!.ticker} · ${shown()!.analysts} ANALYSTS`
            : `${name().toUpperCase()} · ${rows().length} STOCKS`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown() ? dollars(shown()!.mean) : pct(median(rows().map((r) => r.meanUp)))}
          </Text>
          <Text
            style={{
              flexShrink: 1,
              fontSize: 12,
              color: shown() ? toneColor(shown()!.dir) : colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown()
              ? `${pct(shown()!.meanUp)} from ${dollars(shown()!.price)}`
              : "median upside to the mean target"}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: "tabular-nums" }}>
          {shown()
            ? `${dollars(shown()!.price * (1 + shown()!.lowUp / 100))} – ${dollars(shown()!.price * (1 + shown()!.highUp / 100))} · revised ${pct(shown()!.revised)} in 3 months`
            : `${raised()} of ${rows().length} raised in the last 3 months`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 14,
          rowGap: 6,
          marginTop: 10,
        }}
      >
        <DotKey color={colors.up} label="Mean target" />
        <DotKey color={colors.mutedForeground} label="3 months ago" hollow size={7} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View
            style={{
              width: 14,
              height: 2,
              borderRadius: 1,
              backgroundColor: alpha(colors.foreground, 0.3),
            }}
          />
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Low to high</Text>
        </View>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <Plot
          data={rows()}
          // Stocks down the plot, upside across it.
          xScale={{ type: "linear", domain: UPSIDE_DOMAIN }}
          yScale={{ type: "band", paddingInner: 0.3, paddingOuter: 0.15 }}
          colorScale={{
            type: "ordinal",
            domain: ["up", "down"],
            range: [colors.up, colors.destructive],
          }}
          appearGeneration={1}
          motion={{
            appear: { duration: 900, easing: "easeOut" },
            update: { duration: 600, easing: "easeInOut" },
            enter: { duration: 150 },
            exit: { duration: 180 },
            pointer: { stiffness: 320, damping: 32 },
          }}
          accessibilityLabel={`Analysts' price targets, ${name()}: a median upside of ${pct(median(rows().map((r) => r.meanUp)))}, the most for ${top().ticker} at ${pct(top().meanUp)}`}
          accessibilityValue={{
            text:
              shown() &&
              `${shown()!.ticker}: mean target ${dollars(shown()!.mean)}, ${pct(shown()!.meanUp)} from ${dollars(shown()!.price)}`,
          }}
          crossLineClass="w-full h-full"
          crossLineStyle={{ backgroundColor: alpha(colors.foreground, 0.04), borderRadius: 6 }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{ height: height(), marginLeft: 44, marginBottom: BELOW }}
        >
          <Grid x={UPSIDE_TICKS.filter((v) => v !== 0)} style={plotGrid()} />
          {/* Today's price: no upside. */}
          <Grid x={[0]} style={plotBaseline()} />
          <Rule
            value="highUp"
            base="lowUp"
            stagger={0.4}
            inactiveOpacity={0.35}
            style={{ stroke: alpha(colors.foreground, 0.3), strokeWidth: 2 }}
          />
          <Dot
            value="priorUp"
            r={3.5}
            stagger={0.4}
            inactiveOpacity={0.35}
            style={{ fill: colors.card, stroke: colors.mutedForeground, strokeWidth: 1.5 }}
            hoverDotClass="hidden"
          />
          {/* The pointer finds a stock's dot from anywhere on its row. */}
          <Dot
            value="meanUp"
            r={pointer ? 5.5 : 6}
            color="dir"
            stagger={0.4}
            inactiveOpacity={0.35}
            hitRadius={TARGET_ROW}
            style={{ stroke: colors.card, strokeWidth: 2 }}
            hoverDotClass="rounded-full"
            hoverDotStyle={{
              outlineWidth: 1.5,
              outlineOffset: 1.5,
              outlineColor: colors.foreground,
            }}
          />
          <PlotAxis
            placement="left"
            format={tickersOf(rows())}
            labelStyle={{
              ...axis(),
              width: 44,
              paddingRight: 10,
              textAlign: "right",
              color: colors.mutedForeground,
            }}
          />
          <PlotAxis
            tickValues={UPSIDE_TICKS}
            format={(v) => (v === 0 ? "Today" : `${signed(v, 0)}%`)}
            labelStyle={below()}
          />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat
            label="Most upside"
            value={`${top().ticker} ${pct(top().meanUp, 0)}`}
            tone={top().dir}
          />
          <Stat label="Widest" value={widest().ticker} />
          <Stat label="Raised" value={`${raised()} / ${rows().length}`} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 240 : undefined,
        }}
      >
        <Choice
          options={COVERAGE}
          value={list()}
          size={size.switch}
          onChange={(next) => list.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Volume and price (VolumePrice) ----------------------------------------------------------

/** Two years of a stock's trading days up to Friday, October 30, 2026:
 * each day's close and its volume in millions of shares. */
const TAPE = (() => {
  const days: Date[] = [];
  const day = new Date(Date.UTC(2026, 9, 30));
  while (days.length < 504) {
    const weekday = day.getUTCDay();
    if (weekday !== 0 && weekday !== 6) days.unshift(new Date(day));
    day.setUTCDate(day.getUTCDate() - 1);
  }
  const r = random(97);
  let close = 118;
  return days.map((date, i) => {
    const before = close;
    const drift = i < 180 ? 0.0011 : i < 300 ? -0.0016 : 0.0021;
    close = cents(close * (1 + drift + (r() - 0.5) * 0.03));
    // Heavier on the days that move more, and through the sell-off.
    const move = Math.abs(close / before - 1);
    const volume =
      Math.round((32 + r() * 18) * (1 + move * 22) * (i >= 180 && i < 300 ? 1.25 : 1) * 10) / 10;
    return { date, close, volume };
  });
})();
type Session = { label: string; title: string; close: number; volume: number; dir: "up" | "down" };
/** `n` rows of `size` days each, the latest last: the last day's close, the
 * days' volume summed, up or down from the row before. */
function sessions(n: number, size: number, name: (d: Date) => [string, string]): Session[] {
  const out: Session[] = [];
  for (let k = n; k >= 1; k--) {
    const end = TAPE.length - (k - 1) * size;
    const days = TAPE.slice(end - size, end);
    const lastDay = days[days.length - 1];
    const prior = TAPE[end - size - 1]?.close ?? days[0].close;
    const [label, title] = name(lastDay.date);
    out.push({
      label,
      title,
      close: lastDay.close,
      volume: Math.round(days.reduce((sum, d) => sum + d.volume, 0) * 10) / 10,
      dir: lastDay.close >= prior ? "up" : "down",
    });
  }
  return out;
}
const dayLabel = (d: Date): [string, string] => [
  `${MONTH_FULL[d.getUTCMonth()]} ${d.getUTCDate()}`,
  `${MONTH_FULL[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
];
type TapeSpan = "1M" | "6M" | "2Y";
const TAPE_SPANS: { value: TapeSpan; label: string; unit: string; rows: Session[] }[] = [
  { value: "1M", label: "1M", unit: "day", rows: sessions(22, 1, dayLabel) },
  {
    value: "6M",
    label: "6M",
    unit: "week",
    rows: sessions(26, 5, (d) => [dayLabel(d)[0], `Week to ${dayLabel(d)[0]}`]),
  },
  {
    value: "2Y",
    label: "2Y",
    unit: "month",
    rows: sessions(24, 21, (d) => [
      `${MONTH_FULL[d.getUTCMonth()]} ’${String(d.getUTCFullYear()).slice(2)}`,
      `${MONTH_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    ]),
  },
];
const TAPE_HEIGHT = 176;
/** The width of each side's axis labels. */
const SIDE = 40;
/** Shares in millions, as a chart writes them: 40M, 1.2B. */
const shares = (m: number) =>
  m === 0 ? "0" : m >= 1000 ? `${fixed(m / 1000, m % 1000 === 0 ? 0 : 1)}B` : `${fixed(m, 0)}M`;
const AXIS_TITLE = () => ({
  fontSize: 10,
  fontFamily: "monospace",
  letterSpacing: 0.8,
  color: colors.faint,
});
const DUAL_UPDATE = { duration: 600, easing: "easeInOut" } as const;

/**
 * Volume and price on two y scales: a bar of the shares traded per day,
 * week or month on the left scale, in the tone of the close's move, and the
 * close as a line on the right one (`y2Scale`, the line's `scale="y2"`).
 * Neither scale names a domain: the plot widens both to the same nice
 * steps (`alignTicks`), so one grid (`<Grid />`, which follows them) serves
 * both axes. The row under the pointer reads out both values; a period
 * moves both scales to their new domains as its bars and line draw in.
 */
function VolumePrice() {
  const span = signal<TapeSpan>("6M");
  const hover = signal<number | null>(null);
  const spec = () => TAPE_SPANS.find((s) => s.value === span())!;
  const rows = () => spec().rows;
  const shown = () =>
    rows()[hover() != null && hover()! < rows().length ? hover()! : rows().length - 1];
  const prior = () => {
    const i = rows().indexOf(shown());
    return i > 0 ? rows()[i - 1].close : rows()[0].close;
  };
  const change = () => (shown().close / prior() - 1) * 100;
  const total = () => (rows()[rows().length - 1].close / rows()[0].close - 1) * 100;
  const dates = () => {
    const n = rows().length - 1;
    return [0, Math.round(n / 3), Math.round((2 * n) / 3), n];
  };
  const average = () => rows().reduce((sum, d) => sum + d.volume, 0) / rows().length;
  return (
    <ChartCard
      title="Volume and price"
      subtitle="Shares traded on the left scale, the close on the right"
    >
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: "monospace", color: colors.mutedForeground }}>
            ORBX
          </Text>
          <Text style={tipTitle()}>{shown().title.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {`$${fixed(shown().close)}`}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: toneColor(change() >= 0 ? "up" : "down"),
              fontVariant: "tabular-nums",
            }}
          >
            {`${signed(change())}%`}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 16,
            rowGap: 4,
            marginTop: 4,
          }}
        >
          <Key
            color={alpha(toneColor(shown().dir), 0.6)}
            label="Volume"
            value={shares(shown().volume)}
          />
          <LineKey color={chart.chart1} label="Close" value={`$${fixed(shown().close)}`} />
        </View>
      </View>
      {/* Each scale's title over its own axis. */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: size.gap + 2,
          marginBottom: 6,
        }}
      >
        <Text style={AXIS_TITLE()}>SHARES</Text>
        <Text style={AXIS_TITLE()}>USD</Text>
      </View>
      <Plot
        data={rows()}
        xScale={{ type: "band", paddingInner: 0.28, paddingOuter: 0.14 }}
        colorScale={{
          type: "ordinal",
          domain: ["up", "down"],
          range: [alpha(colors.up, 0.5), alpha(colors.destructive, 0.5)],
        }}
        appearGeneration={span()}
        motion={{
          appear: { duration: 700, easing: "easeOut" },
          update: DUAL_UPDATE,
          enter: { duration: 120 },
          exit: { duration: 160 },
          pointer: { stiffness: 320, damping: 32 },
        }}
        accessibilityLabel={`ORBX volume and close, ${span()}: ${signed(total(), 1)}%, ${shares(average())} shares a ${spec().unit} on average`}
        accessibilityValue={{
          text:
            hover() == null
              ? undefined
              : `${shown().title}: close $${fixed(shown().close)}, ${shares(shown().volume)} shares`,
        }}
        crossLineClass="w-full h-full"
        crossLineStyle={{ backgroundColor: alpha(colors.foreground, 0.05) }}
        dotStyle={{
          width: 9,
          height: 9,
          borderRadius: 4.5,
          borderWidth: 2,
          borderColor: chart.chart1,
          backgroundColor: colors.card,
        }}
        onHoverChange={({ index }) => hover.set(index)}
        focusVisibleStyle={focusRing(4)}
        style={{ height: TAPE_HEIGHT, marginLeft: SIDE, marginRight: SIDE, marginBottom: BELOW }}
      >
        {/* No values: the lines follow the aligned steps both axes share. */}
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
          style={{ stroke: chart.chart1, strokeWidth: 2 }}
        />
        <PlotAxis
          placement="left"
          format={shares}
          labelStyle={{ ...axis(), width: SIDE, paddingRight: 8, textAlign: "right" }}
        />
        <PlotAxis
          placement="right"
          scale="y2"
          format={(v) => fixed(v, 0)}
          labelStyle={{ ...axis(), width: SIDE, paddingLeft: 8 }}
        />
        <PlotAxis
          tickValues={dates()}
          format={(v) => rows()[v]?.label ?? ""}
          labelStyle={below()}
        />
      </Plot>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat
            label="Change"
            value={`${signed(total(), 1)}%`}
            tone={total() >= 0 ? "up" : "down"}
          />
          <Stat label={`Avg / ${spec().unit}`} value={shares(average())} />
          <Stat label="High" value={`$${fixed(Math.max(...rows().map((d) => d.close)))}`} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 180 : undefined,
        }}
      >
        <Choice
          options={TAPE_SPANS.map(({ value, label }) => ({ value, label }))}
          value={span()}
          size={size.switch}
          onChange={(next) => {
            span.set(next);
            hover.set(null);
          }}
        />
      </View>
    </ChartCard>
  );
}

// --- Revenue and margin (Margins) ------------------------------------------------------------

const QUARTER_NAMES = ["Q1 25", "Q2 25", "Q3 25", "Q4 25", "Q1 26", "Q2 26", "Q3 26", "Q4 26"];
/** Two segments' revenue per quarter in billions and their net margin in
 * percent: a growing cloud business, and devices that lose money outside
 * the holiday quarter. */
const SEGMENTS = {
  cloud: {
    revenue: [4.1, 4.4, 4.8, 5.3, 5.7, 6.2, 6.6, 7.2],
    margin: [18.0, 19.5, 21.0, 22.4, 23.0, 24.8, 25.5, 27.1],
  },
  devices: {
    revenue: [3.2, 2.9, 3.4, 4.6, 3.1, 2.8, 3.3, 4.9],
    margin: [-6.5, -9.2, -2.1, 5.8, -4.0, -7.4, 1.2, 8.6],
  },
} as const;
type Segment = keyof typeof SEGMENTS;
const MARGIN_HEIGHT = 184;

/**
 * Revenue bars on the left scale and the net margin as a line with dots on
 * the right one. Both domains are the plot's: aligned, and when the margin
 * goes below zero (devices) both scales put zero on the same grid line,
 * the revenue axis writing no values under it. Switching the segment
 * moves both scales and the marks to the new values.
 */
function Margins() {
  const segment = signal<Segment>("devices");
  const hover = signal<number | null>(null);
  const rows = () =>
    QUARTER_NAMES.map((quarter, i) => ({
      quarter,
      revenue: SEGMENTS[segment()].revenue[i],
      margin: SEGMENTS[segment()].margin[i],
    }));
  const at = () => hover() ?? QUARTER_NAMES.length - 1;
  const shown = () => rows()[at()];
  const year = () =>
    rows()
      .slice(4)
      .reduce((sum, d) => sum + d.revenue, 0);
  const losses = () => rows().filter((d) => d.margin < 0).length;
  return (
    <ChartCard
      title="Revenue and margin"
      subtitle="Quarterly revenue on the left, net margin on the right"
    >
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>{shown().quarter.replace(" ", " 20").toUpperCase()}</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 16,
            rowGap: 4,
            marginTop: 2,
          }}
        >
          <Key
            color={alpha(chart.chart2, 0.5)}
            label="Revenue"
            value={`$${fixed(shown().revenue, 1)}B`}
          />
          <LineKey
            color={chart.chart1}
            label="Net margin"
            value={`${signed(shown().margin, 1)}%`}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: size.gap + 2,
          marginBottom: 6,
        }}
      >
        <Text style={AXIS_TITLE()}>USD</Text>
        <Text style={AXIS_TITLE()}>MARGIN</Text>
      </View>
      <Plot
        data={rows()}
        xScale={{ type: "band", paddingInner: 0.4, paddingOuter: 0.2, maxBandWidth: 44 }}
        appearGeneration={0}
        motion={{
          appear: { duration: 700, easing: "easeOut" },
          update: DUAL_UPDATE,
          enter: { duration: 120 },
          exit: { duration: 160 },
          pointer: { stiffness: 320, damping: 32 },
        }}
        accessibilityLabel={`${segment() === "cloud" ? "Cloud" : "Devices"} revenue and net margin by quarter: $${fixed(year(), 1)}B over the last four, ${losses()} quarters at a loss`}
        accessibilityValue={{
          text:
            hover() == null
              ? undefined
              : `${shown().quarter}: revenue $${fixed(shown().revenue, 1)}B, net margin ${fixed(shown().margin, 1)}%`,
        }}
        crossLineClass="w-full h-full"
        crossLineStyle={{ backgroundColor: alpha(colors.foreground, 0.05) }}
        onHoverChange={({ index }) => hover.set(index)}
        focusVisibleStyle={focusRing(4)}
        style={{
          height: MARGIN_HEIGHT,
          marginLeft: SIDE,
          marginRight: SIDE,
          marginBottom: 2 * BELOW + 2,
        }}
      >
        <Grid style={plotGrid()} />
        {/* Zero, the same line on both scales. */}
        <Grid y={[0]} style={plotBaseline()} />
        <Bar
          value="revenue"
          cornerRadii={{ topLeft: 3, topRight: 3 }}
          stagger={0.4}
          inactiveOpacity={0.45}
          style={{ fill: alpha(chart.chart2, 0.5) }}
        />
        <Line
          y="margin"
          scale="y2"
          curve="linear"
          dot
          dotStyle={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            borderWidth: 1.5,
            borderColor: chart.chart1,
            backgroundColor: colors.card,
          }}
          hoverDotStyle={{
            width: 11,
            height: 11,
            borderRadius: 5.5,
            borderWidth: 2,
            borderColor: chart.chart1,
            backgroundColor: colors.card,
          }}
          style={{ stroke: chart.chart1, strokeWidth: 2 }}
        />
        <PlotAxis
          placement="left"
          format={(v) => (v < 0 ? "" : v === 0 ? "$0" : `$${fixed(v, 0)}B`)}
          labelStyle={{ ...axis(), width: SIDE, paddingRight: 8, textAlign: "right" }}
        />
        <PlotAxis
          placement="right"
          scale="y2"
          format={(v) => `${v < 0 ? "−" : ""}${fixed(Math.abs(v), 0)}%`}
          labelStyle={{ ...axis(), width: SIDE, paddingLeft: 8 }}
        />
        {/* The quarters, and under them each year in the middle of its four, so the labels fit a phone. */}
        <PlotAxis format={(v) => QUARTER_NAMES[v].slice(0, 2)} labelStyle={below()} />
        <PlotAxis
          tickValues={[1.5, 5.5]}
          format={(v) => (v < 4 ? "2025" : "2026")}
          labelStyle={{ ...below(), paddingTop: BELOW + 2, color: colors.mutedForeground }}
        />
      </Plot>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="Last 4Q" value={`$${fixed(year(), 1)}B`} />
          <Stat
            label="Best margin"
            value={`${signed(Math.max(...rows().map((d) => d.margin)), 1)}%`}
            tone="up"
          />
          <Stat
            label="Loss quarters"
            value={`${losses()} / ${rows().length}`}
            tone={losses() > 0 ? "down" : undefined}
          />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 220 : undefined,
        }}
      >
        <Choice
          options={[
            { value: "cloud", label: "Cloud" },
            { value: "devices", label: "Devices" },
          ]}
          value={segment()}
          size={size.switch}
          onChange={(next) => segment.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Factor exposure (Factors) ---------------------------------------------------------------

/** A portfolio's lean on six factors, scored 0 to 100, and two benchmarks'. */
const FACTORS = [
  { name: "Value", ours: 72, index: 46, peers: 64 },
  { name: "Momentum", ours: 58, index: 62, peers: 40 },
  { name: "Quality", ours: 86, index: 55, peers: 71 },
  { name: "Size", ours: 34, index: 70, peers: 52 },
  { name: "Low vol", ours: 64, index: 42, peers: 78 },
  { name: "Yield", ours: 48, index: 52, peers: 66 },
];
type Factor = (typeof FACTORS)[number];
const BENCHMARKS = [
  { value: "index", label: "vs Index", name: "Index" },
  { value: "peers", label: "vs Peers", name: "Peers" },
] as const;
type Benchmark = (typeof BENCHMARKS)[number]["value"];
/** The radar's side and its rim: room inside the plot for the hover dots,
 * the factors' names past the rim. */
const RADAR = pointer ? 196 : 204;
const RADAR_RIM = "78%";
/** Where the names sit: a share of the plot's side out from its middle. */
const LABEL_AT = 44;
const meanOf = (pick: (f: Factor) => number) =>
  FACTORS.reduce((s, f) => s + pick(f), 0) / FACTORS.length;
/** A name's side of its place: away from the center. */
const away = (v: number): "flex-start" | "flex-end" | "center" =>
  v > 0.01 ? "flex-start" : v < -0.01 ? "flex-end" : "center";

/**
 * A portfolio's factor exposure as a radar against a benchmark: hexagonal
 * hairline rings and spokes, the benchmark a dashed outline, the portfolio
 * a citrus outline over a wash that deepens toward the rim, growing out of
 * the center and morphing to the other benchmark (`motion.update`). The
 * factor nearest the pointer by angle, or the keys' factor, is read out
 * beside it with both scores and the spread, its name lit at the rim.
 */
function Factors() {
  const bench = signal<Benchmark>("index");
  const hover = signal<number | null>(null);
  const shown = () => (hover() == null ? undefined : FACTORS[hover()!]);
  const benchName = () => BENCHMARKS.find((b) => b.value === bench())!.name;
  const ours = () => shown()?.ours ?? meanOf((f) => f.ours);
  const theirs = () => (shown() ? shown()![bench()] : meanOf((f) => f[bench()]));
  const spread = () => ours() - theirs();
  const lead = FACTORS.reduce((a, b) => (b.ours > a.ours ? b : a));
  return (
    <ChartCard title="Factor exposure" subtitle="A portfolio against its benchmark on six factors">
      {/* The readout beside the radar where the card has room for it, below where it has not. */}
      <View
        style={{
          flexDirection: pointer ? "row" : "column",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: pointer ? 20 : 12,
        }}
      >
        <Plot
          data={FACTORS}
          yScale={{ type: "linear", domain: [0, 100] }}
          appearGeneration={1}
          motion={{
            appear: { duration: 900, easing: "easeOut" },
            update: { duration: 550, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
            pointer: { stiffness: 380, damping: 34 },
          }}
          accessibilityLabel={`Factor exposure against the ${benchName().toLowerCase()}, leaning most on ${lead.name} at ${lead.ours}`}
          accessibilityValue={{
            text:
              shown() &&
              `${shown()!.name}: ${shown()!.ours}, ${benchName().toLowerCase()} ${theirs()}`,
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={{ ...focusRing(4), borderRadius: RADAR / 2 }}
          style={{ width: RADAR, height: RADAR, marginHorizontal: 40, marginVertical: 10 }}
        >
          <RadialGrid rings={[25, 50, 75]} outerRadius={RADAR_RIM} style={plotGrid()} />
          <RadialGrid rings={[100]} spokes outerRadius={RADAR_RIM} style={plotBaseline()} />
          <RadialLine
            radius={bench()}
            closed
            outerRadius={RADAR_RIM}
            style={{
              stroke: colors.mutedForeground,
              strokeDasharray: "3 3",
              fill: alpha(colors.mutedForeground, 0.06),
            }}
            hoverDotStyle={{
              width: 7,
              height: 7,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: colors.card,
              backgroundColor: colors.mutedForeground,
            }}
          />
          <RadialLine
            radius="ours"
            closed
            outerRadius={RADAR_RIM}
            dot
            dotStyle={{ width: 4, height: 4, borderRadius: 2, backgroundColor: chart.chart1 }}
            backgroundStyle={{
              backgroundImage: `radial-gradient(circle, ${alpha(chart.chart1, 0.04)}, ${alpha(chart.chart1, 0.3)})`,
            }}
            style={{ stroke: chart.chart1, strokeWidth: 2 }}
            hoverDotStyle={{
              width: 10,
              height: 10,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: colors.card,
              backgroundColor: chart.chart1,
            }}
          />
          {/* Each factor's name past the rim at its angle, growing away from the center; the hovered one lit. */}
          <Each of={FACTORS}>
            {(f, i) => {
              const factor = f();
              const angle = (2 * Math.PI * i()) / FACTORS.length;
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);
              return (
                <View
                  style={{
                    position: "absolute",
                    left: `${50 + LABEL_AT * sin}%`,
                    top: `${50 - LABEL_AT * cos}%`,
                    width: 0,
                    height: 0,
                    alignItems: away(sin),
                    justifyContent: away(-cos),
                    pointerEvents: "none",
                  }}
                >
                  <Text
                    style={{
                      width: 64,
                      numberOfLines: 1,
                      fontSize: 10.5,
                      fontFamily: "monospace",
                      textAlign: sin > 0.01 ? "left" : sin < -0.01 ? "right" : "center",
                      color: hover() === i() ? chart.chart1 : colors.faint,
                    }}
                  >
                    {factor.name}
                  </Text>
                </View>
              );
            }}
          </Each>
        </Plot>
        <View
          style={{
            alignSelf: "stretch",
            flexGrow: 1,
            flexBasis: pointer ? 200 : undefined,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={tipTitle()}>{shown()?.name.toUpperCase() ?? "ALL SIX FACTORS"}</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "600",
                  letterSpacing: -0.6,
                  color: colors.foreground,
                  fontVariant: "tabular-nums",
                }}
              >
                {fixed(ours(), 1)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                {shown() ? "score" : "mean score"}
              </Text>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Key color={chart.chart1} label="Portfolio" value={fixed(ours(), 1)} />
            <Key color={colors.mutedForeground} label={benchName()} value={fixed(theirs(), 1)} />
          </View>
          <StatGroup class="border-line border-t pt-3">
            <Stat label="Spread" value={signed(spread(), 1)} tone={spread() >= 0 ? "up" : "down"} />
            <Stat label="Lead" value={lead.name} />
          </StatGroup>
        </View>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 220 : undefined,
        }}
      >
        <Choice
          options={BENCHMARKS}
          value={bench()}
          size={size.switch}
          onChange={(next) => bench.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Holdings correlation (Correlation) ------------------------------------------------------

/** The holdings whose daily returns the correlation matrix pairs. */
const PAIR_TICKERS = ["NVDA", "AMD", "MSFT", "AAPL", "TSLA", "JPM", "XOM", "GLD"] as const;
type Ticker = (typeof PAIR_TICKERS)[number];
const LOOKBACKS = [
  { value: "1Y", label: "1 year" },
  { value: "3Y", label: "3 years" },
] as const;
type Lookback = (typeof LOOKBACKS)[number]["value"];
/** Each holding's loadings on six factors (the market, tech, semiconductors,
 * rates, energy, gold) and the variance of its own news, per lookback: a
 * factor model, so the matrix it makes is a correlation matrix. */
const EXPOSURES: Record<Lookback, Record<Ticker, number[]>> = {
  "1Y": {
    NVDA: [0.7, 0.45, 0.85, 0, 0, 0, 0.25],
    AMD: [0.7, 0.4, 0.85, 0, 0, 0, 0.35],
    MSFT: [0.7, 0.55, 0.15, 0, 0, 0, 0.3],
    AAPL: [0.65, 0.35, 0, 0, 0, 0, 0.5],
    TSLA: [0.6, 0.25, 0, 0, 0, 0, 1.1],
    JPM: [0.65, -0.05, 0, 0.6, 0.2, 0, 0.3],
    XOM: [0.3, -0.25, 0, 0.3, 0.8, 0.1, 0.3],
    GLD: [-0.2, -0.1, -0.05, -0.15, 0.15, 0.85, 0.3],
  },
  "3Y": {
    NVDA: [0.75, 0.45, 0.7, 0, 0, 0, 0.35],
    AMD: [0.75, 0.4, 0.7, 0, 0, 0, 0.45],
    MSFT: [0.75, 0.5, 0.1, 0, 0, 0, 0.35],
    AAPL: [0.75, 0.45, 0.05, 0, 0, 0, 0.4],
    TSLA: [0.7, 0.3, 0, 0, 0, 0, 0.95],
    JPM: [0.7, 0, 0, 0.55, 0.05, 0, 0.35],
    XOM: [0.45, -0.1, 0, 0.2, 0.75, 0.05, 0.3],
    GLD: [0.05, 0, 0, -0.1, 0.1, 0.8, 0.35],
  },
};
/** A cell of the matrix: the holding of its line, of its column, and their correlation. */
type Pair = { a: Ticker; b: Ticker; r: number };
/** Every pair of holdings, line by line, each loading nudged a little: symmetric, 1 on the diagonal. */
function correlations(lookback: Lookback): Pair[] {
  const r = random(lookback === "1Y" ? 11 : 37);
  const loads = PAIR_TICKERS.map((t) =>
    EXPOSURES[lookback][t].slice(0, 6).map((l) => (l === 0 ? 0 : l * (0.92 + r() * 0.16))),
  );
  const own = PAIR_TICKERS.map((t) => EXPOSURES[lookback][t][6]);
  const cov = (i: number, j: number) =>
    loads[i].reduce((s, l, k) => s + l * loads[j][k], 0) + (i === j ? own[i] : 0);
  return PAIR_TICKERS.flatMap((a, i) =>
    PAIR_TICKERS.map((b, j) => ({
      a,
      b,
      r: i === j ? 1 : Math.round((cov(i, j) / Math.sqrt(cov(i, i) * cov(j, j))) * 100) / 100,
    })),
  );
}
const CORRELATIONS: Record<Lookback, Pair[]> = {
  "1Y": correlations("1Y"),
  "3Y": correlations("3Y"),
};
/** The 28 pairs of two holdings, each once: the cells above the diagonal. */
const pairsOf = (cells: Pair[]) =>
  cells.filter((p) => PAIR_TICKERS.indexOf(p.a) < PAIR_TICKERS.indexOf(p.b));
const coefficient = (r: number) => (r < 0 ? `−${fixed(-r)}` : fixed(r));
const kinship = (p: Pair) =>
  p.a === p.b
    ? "A holding against itself"
    : p.r >= 0.7
      ? "Move together closely"
      : p.r >= 0.4
        ? "Move together"
        : p.r >= 0.15
          ? "Loosely related"
          : p.r > -0.15
            ? "Barely related"
            : "Move apart: a hedge";
/** The cells' labels: the chart's ink on light cells, `on-media` on dark ones (`data-dark`). */
const CELL_LABEL = "text-foreground/70 data-dark:text-on-media/90";
/** The hover cell: a ring in the text's color around the cell, a little out from its edge. */
const cellRing = () => ({ outlineWidth: 1.5, outlineOffset: 1.5, outlineColor: colors.foreground });

/** A ramp's key: its colors left to right over the labels of its ends (and middle). */
function Ramp(props: { colors: string[]; labels: string[] }) {
  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundImage: `linear-gradient(to right, ${props.colors.join(", ")})`,
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Each of={props.labels}>
          {(l) => <Text style={{ ...axis(), fontSize: 10 }}>{l()}</Text>}
        </Each>
      </View>
    </View>
  );
}

/**
 * How a portfolio's holdings move together: a correlation matrix of their
 * daily returns as a heatmap, a `Cell` per pair in the bands of its two
 * holdings (band scales with the tickers as their `domain`), colored
 * along a diverging `colorScale` from −1 (blue) through 0 to +1 (the
 * accent), its coefficient written in it, white on the dark cells
 * (`data-dark:`) and left out where it does not fit. The pair under the
 * pointer or the keys (which step across the grid) is ringed and read out
 * over the plot, the other cells fading; another lookback glides every
 * cell to its new color (`motion.update`).
 */
function Correlation() {
  const lookback = signal<Lookback>("1Y");
  const hover = signal<number | null>(null);
  const cells = () => CORRELATIONS[lookback()];
  const shown = () => (hover() == null ? undefined : cells()[hover()!]);
  const pairs = () => pairsOf(cells());
  const mean = () => pairs().reduce((s, p) => s + p.r, 0) / pairs().length;
  const closest = () => pairs().reduce((a, b) => (b.r > a.r ? b : a));
  const hedge = () => pairs().reduce((a, b) => (b.r < a.r ? b : a));
  const width = signal(0);
  // A phone's narrow card: smaller tickers, and the coefficients leave the cells too small for them.
  const compact = () => width() > 0 && width() < 320;
  const tick = () => ({ ...axis(), fontSize: compact() ? 9 : 10.5, color: colors.mutedForeground });
  const ramp = () => [colors.info, colors.line, chart.chart1];
  return (
    <ChartCard title="Holdings correlation" subtitle="How closely each pair of holdings moves">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>
          {shown()
            ? `${shown()!.a} × ${shown()!.b}`
            : `${PAIR_TICKERS.length} HOLDINGS · ${lookback()}`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {coefficient(shown()?.r ?? mean())}
          </Text>
          <Text style={{ flexShrink: 1, fontSize: 12, color: colors.mutedForeground }}>
            {shown() ? kinship(shown()!) : `mean of the ${pairs().length} pairs`}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.faint }}>
          {shown()
            ? `Daily returns over ${lookback() === "1Y" ? "a year" : "three years"}`
            : "The lower, the more each holding diversifies the rest"}
        </Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <Ramp colors={ramp()} labels={["−1", "0", "+1"]} />
      </View>
      <View
        style={{ marginTop: size.gap + 4 }}
        onLayout={({ bounds }) => width.set(bounds.size.width)}
      >
        <Plot
          data={cells()}
          xScale={{ type: "band", domain: [...PAIR_TICKERS], paddingInner: 0.06 }}
          yScale={{ type: "band", domain: [...PAIR_TICKERS], paddingInner: 0.06 }}
          colorScale={{ type: "diverging", domain: [-1, 1], range: ramp() }}
          appearGeneration={1}
          motion={{
            appear: { duration: 900, easing: "easeOut" },
            update: { duration: 650, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
            pointer: { stiffness: 380, damping: 34 },
          }}
          accessibilityLabel={`Correlation of ${PAIR_TICKERS.length} holdings over ${lookback()}: closest ${closest().a} and ${closest().b} at ${coefficient(closest().r)}, best hedge ${hedge().a} and ${hedge().b} at ${coefficient(hedge().r)}`}
          accessibilityValue={{
            text: shown() && `${shown()!.a} and ${shown()!.b}: ${coefficient(shown()!.r)}`,
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{ aspectRatio: 1, marginLeft: compact() ? 34 : 40, marginTop: 20 }}
        >
          <Cell
            x="b"
            y="a"
            value="r"
            cornerRadii={3}
            stagger={0.5}
            inactiveOpacity={0.35}
            label={(d: Pair) => coefficient(d.r)}
            labelClass={CELL_LABEL}
            labelStyle={{ fontSize: compact() ? 8.5 : 10, fontVariant: "tabular-nums" }}
            hoverCellClass="rounded-[4px]"
            hoverCellStyle={cellRing()}
          />
          <PlotAxis placement="top" labelStyle={{ ...tick(), lineHeight: 14, paddingBottom: 6 }} />
          <PlotAxis
            placement="left"
            labelStyle={{
              ...tick(),
              width: compact() ? 34 : 40,
              paddingRight: 8,
              textAlign: "right",
            }}
          />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat
            label="Closest"
            value={`${closest().a}·${closest().b} ${coefficient(closest().r)}`}
          />
          <Stat
            label="Best hedge"
            value={`${hedge().a}·${hedge().b} ${coefficient(hedge().r)}`}
            tone={hedge().r < 0 ? "down" : undefined}
          />
          <Stat label="Mean" value={fixed(mean())} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 180 : undefined,
        }}
      >
        <Choice
          options={LOOKBACKS}
          value={lookback()}
          size={size.switch}
          onChange={(next) => lookback.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Monthly returns (Seasonality) ----------------------------------------------------------

/** The years of the returns calendar; this year's months up to the last full one. */
const CAL_YEARS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const MONTHS_2026 = 10;
const CAL_SYMBOLS = [
  { value: "SPX", label: "S&P 500" },
  { value: "NVDA", label: "NVDA" },
] as const;
type CalSymbol = (typeof CAL_SYMBOLS)[number]["value"];
/** Each year's mean monthly return, a month's swing around it, and the months markets remember. */
const DRIFT: Record<CalSymbol, number[]> = {
  SPX: [1.3, 2.1, -1.6, 1.8, 1.8, 1.3, 0.9],
  NVDA: [5, 4.5, -4, 7, 5, 3.5, 2],
};
const SWING: Record<CalSymbol, number> = { SPX: 7, NVDA: 26 };
const SHOCKS: Record<CalSymbol, Record<string, number>> = {
  SPX: {
    "2020 Mar": -12.5,
    "2020 Apr": 12.7,
    "2022 Jun": -8.4,
    "2022 Sep": -9.3,
    "2022 Oct": 8,
    "2023 Nov": 8.9,
    "2025 Apr": -0.8,
  },
  NVDA: {
    "2020 Mar": -2.4,
    "2022 Sep": -19.6,
    "2023 May": 36.3,
    "2024 Feb": 28.6,
    "2025 Apr": 0.4,
  },
};
/** A month's return, in percent. */
type MonthReturn = { year: string; month: string; ret: number };
function monthly(symbol: CalSymbol): MonthReturn[] {
  const r = random(symbol === "SPX" ? 7 : 29);
  return CAL_YEARS.flatMap((year, y) =>
    MONTH_FULL.slice(0, year === "2026" ? MONTHS_2026 : 12).map((month) => {
      const swing = (r() - 0.5) * SWING[symbol];
      const ret = SHOCKS[symbol][`${year} ${month}`] ?? DRIFT[symbol][y] + swing;
      return { year, month, ret: Math.round(ret * 10) / 10 };
    }),
  );
}
const MONTHLY: Record<CalSymbol, MonthReturn[]> = { SPX: monthly("SPX"), NVDA: monthly("NVDA") };
/** A year's return: its months compounded. */
const yearReturn = (rows: MonthReturn[], year: string) =>
  (rows.filter((r) => r.year === year).reduce((p, r) => p * (1 + r.ret / 100), 1) - 1) * 100;
/** The right axis' text: each year's return, a new function for each symbol so the axis writes its labels again. */
const yearsOf = (rows: MonthReturn[]) => (v: number) => pct(yearReturn(rows, CAL_YEARS[v]));
/** A cell's text: the return without its percent sign, a tenth of a percent
 * below 10 and whole above, so a big month fits its cell as the rest do. */
const tenths = (v: number) => {
  const digits = Math.abs(v) >= 10 ? 0 : 1;
  return v < 0 ? `−${fixed(-v, digits)}` : fixed(v, digits);
};

/**
 * A calendar of monthly returns: a `Cell` per month in the band of its
 * month across (the x scale's `domain`, January to December, so this
 * year's months to come stay blank) and of its year down, red for a loss
 * and green for a gain along a diverging `colorScale` about 0, its domain
 * the largest move either way (even on both sides, so a loss and a gain
 * of the same size are as strong), keyed by a ramp under the header. The
 * months are the top axis' labels, written from the band's categories,
 * the years the left one's, and each year's return the right one's. The
 * month under the pointer or the keys is read out; another symbol glides
 * every month to its new color.
 */
function Seasonality() {
  const symbol = signal<CalSymbol>("SPX");
  const hover = signal<number | null>(null);
  const rows = () => MONTHLY[symbol()];
  const shown = () => (hover() == null ? undefined : rows()[hover()!]);
  const name = () => CAL_SYMBOLS.find((s) => s.value === symbol())!.label;
  // The scale's own domain: the largest move either way, even about 0.
  const reach = () => Math.max(...rows().map((r) => Math.abs(r.ret)));
  const total = () => (rows().reduce((p, r) => p * (1 + r.ret / 100), 1) - 1) * 100;
  const best = () => rows().reduce((a, b) => (b.ret > a.ret ? b : a));
  const worst = () => rows().reduce((a, b) => (b.ret < a.ret ? b : a));
  const gains = () => rows().filter((r) => r.ret > 0).length;
  const width = signal(0);
  // A phone's narrow card: smaller labels, the returns left out of cells too small for them.
  const compact = () => width() > 0 && width() < 340;
  const tick = () => ({ ...axis(), fontSize: compact() ? 9 : 10.5 });
  const ramp = () => [colors.destructive, colors.line, colors.up];
  const gutter = () => (compact() ? 34 : 36);
  const totals = () => (compact() ? 46 : 54);
  return (
    <ChartCard title="Monthly returns" subtitle="Every month since 2020, red for a loss">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>
          {shown()
            ? `${shown()!.month.toUpperCase()} ${shown()!.year}`
            : `${name().toUpperCase()} · 2020–2026`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: shown() ? toneColor(shown()!.ret >= 0 ? "up" : "down") : colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {pct(shown()?.ret ?? total())}
          </Text>
          <Text
            style={{
              flexShrink: 1,
              fontSize: 12,
              color: colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown()
              ? `${name()} · ${shown()!.year} ${pct(yearReturn(rows(), shown()!.year))}`
              : "total return, months compounded"}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 10, marginLeft: gutter(), marginRight: totals() }}>
        <Ramp colors={ramp()} labels={[`−${fixed(reach(), 1)}%`, "0", `+${fixed(reach(), 1)}%`]} />
      </View>
      <View
        style={{ marginTop: size.gap + 4 }}
        onLayout={({ bounds }) => width.set(bounds.size.width)}
      >
        <Plot
          data={rows()}
          xScale={{ type: "band", domain: MONTH_FULL, paddingInner: 0.1 }}
          yScale={{ type: "band", domain: CAL_YEARS, paddingInner: 0.12 }}
          colorScale={{ type: "diverging", range: ramp() }}
          appearGeneration={1}
          motion={{
            appear: { duration: 1000, easing: "easeOut" },
            update: { duration: 650, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
            pointer: { stiffness: 380, damping: 34 },
          }}
          accessibilityLabel={`${name()} monthly returns since 2020: best ${best().month} ${best().year} at ${pct(best().ret)}, worst ${worst().month} ${worst().year} at ${pct(worst().ret)}`}
          accessibilityValue={{
            text: shown() && `${shown()!.month} ${shown()!.year}: ${pct(shown()!.ret)}`,
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{
            height: CAL_YEARS.length * (compact() ? 22 : 27),
            marginLeft: gutter(),
            marginRight: totals(),
            marginTop: 20,
          }}
        >
          <Cell
            x="month"
            y="year"
            value="ret"
            cornerRadii={3}
            stagger={0.6}
            inactiveOpacity={0.4}
            // A phone's cells are only the colors: a gain written in some
            // and a loss (its sign wider) left out of others would read as
            // missing months.
            label={compact() ? undefined : (d: MonthReturn) => tenths(d.ret)}
            labelClass={CELL_LABEL}
            labelStyle={{ fontSize: 9.5, fontVariant: "tabular-nums" }}
            hoverCellClass="rounded-[4px]"
            hoverCellStyle={cellRing()}
          />
          <PlotAxis placement="top" labelStyle={{ ...tick(), lineHeight: 14, paddingBottom: 6 }} />
          <PlotAxis
            placement="left"
            labelStyle={{ ...tick(), width: gutter(), paddingRight: 8, textAlign: "right" }}
          />
          <PlotAxis
            placement="right"
            format={yearsOf(rows())}
            labelStyle={{
              ...tick(),
              width: totals(),
              paddingLeft: 8,
              textAlign: "right",
              color: colors.mutedForeground,
            }}
          />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat
            label="Best month"
            value={`${best().month} ${best().year} ${pct(best().ret)}`}
            tone="up"
          />
          <Stat
            label="Worst month"
            value={`${worst().month} ${worst().year} ${pct(worst().ret)}`}
            tone="down"
          />
          <Stat label="Up months" value={`${gains()} / ${rows().length}`} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 180 : undefined,
        }}
      >
        <Choice
          options={CAL_SYMBOLS}
          value={symbol()}
          size={size.switch}
          onChange={(next) => symbol.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Trading activity (Activity) -------------------------------------------------------------

/** The half hours of a trading day, from the open; a market closed for lunch has none for 12:00 and 12:30. */
const SLOTS = [
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const MARKETS = [
  { value: "US", label: "US" },
  { value: "HK", label: "HK" },
] as const;
type Market = (typeof MARKETS)[number]["value"];
/** How busy each half hour is against the open: busy at either end of the day, quiet in its middle, a market's lunch closed. */
const INTRADAY: Record<Market, (number | null)[]> = {
  US: [1, 0.74, 0.6, 0.52, 0.46, 0.42, 0.4, 0.41, 0.45, 0.5, 0.58, 0.72, 1.05],
  HK: [1, 0.7, 0.56, 0.5, 0.58, null, null, 0.66, 0.5, 0.46, 0.5, 0.6, 0.84],
};
/** Each weekday against Tuesday: Fridays busiest. */
const BUSY = [0.92, 1, 0.97, 1.03, 1.1];
/** Thousands of trades in the open's half hour. */
const OPENING: Record<Market, number> = { US: 46, HK: 21 };
type HalfHour = { day: string; slot: string; trades: number };
/** A week of a market's trades per half hour, in thousands: a row per half hour it is open. */
function activity(market: Market): HalfHour[] {
  const r = random(market === "US" ? 5 : 13);
  return WEEKDAYS.flatMap((day, d) =>
    SLOTS.flatMap((slot, i) => {
      const shape = INTRADAY[market][i];
      return shape == null
        ? []
        : [
            {
              day,
              slot,
              trades: Math.round(OPENING[market] * shape * BUSY[d] * (0.9 + r() * 0.2) * 10) / 10,
            },
          ];
    }),
  );
}
const ACTIVITY: Record<Market, HalfHour[]> = { US: activity("US"), HK: activity("HK") };
const thousands = (v: number) => `${fixed(v, 1)}k`;
/** The half hour after `slot`: its end. */
const slotEnd = (slot: string) => {
  const [h, m] = slot.split(":").map(Number);
  return m === 30 ? `${h + 1}:00` : `${h}:30`;
};

/**
 * When a market trades: a week of trades per half hour as a heatmap, a
 * `Cell` per half hour a market is open, colored along a sequential
 * `colorScale` from the quietest (the card's line) to the busiest (the
 * accent), with round corners and no text. The x scale's `domain` is
 * every half hour of the day, so Hong Kong's lunch break stays blank, and
 * its cells shrink away when the market changes while the others glide to
 * their new colors. The half hour under the pointer or the keys is
 * ringed and read out.
 */
function Activity() {
  const market = signal<Market>("US");
  const hover = signal<number | null>(null);
  const rows = () => ACTIVITY[market()];
  const shown = () => (hover() == null || hover()! >= rows().length ? undefined : rows()[hover()!]);
  const dayTotal = (day: string) => rows().reduce((s, r) => (r.day === day ? s + r.trades : s), 0);
  const perDay = () => rows().reduce((s, r) => s + r.trades, 0) / WEEKDAYS.length;
  const busiest = () => rows().reduce((a, b) => (b.trades > a.trades ? b : a));
  const quietest = () => rows().reduce((a, b) => (b.trades < a.trades ? b : a));
  const at = (slot: string) => rows().filter((r) => r.slot === slot);
  const meanAt = (slot: string) => at(slot).reduce((s, r) => s + r.trades, 0) / at(slot).length;
  const width = signal(0);
  const compact = () => width() > 0 && width() < 340;
  const tick = () => ({ ...axis(), fontSize: compact() ? 9 : 10.5 });
  const ramp = () => [colors.line, chart.chart1];
  return (
    <ChartCard title="Trading activity" subtitle="Trades every half hour of a week">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>
          {shown()
            ? `${shown()!.day.toUpperCase()} ${shown()!.slot}–${slotEnd(shown()!.slot)}`
            : `${market()} · TRADES PER HALF HOUR`}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {thousands(shown()?.trades ?? perDay())}
          </Text>
          <Text
            style={{
              flexShrink: 1,
              fontSize: 12,
              color: colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
          >
            {shown()
              ? `trades · ${fixed((shown()!.trades / dayTotal(shown()!.day)) * 100, 1)}% of ${shown()!.day}'s`
              : "trades a day"}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.faint }}>
          {market() === "HK"
            ? "9:30 to 16:00, closed 12:00 to 13:00 for lunch"
            : "9:30 to 16:00, one session"}
        </Text>
      </View>
      <View style={{ marginTop: 10, marginLeft: 36 }}>
        <Ramp
          colors={ramp()}
          labels={[
            `${thousands(quietest().trades)} quietest`,
            `${thousands(busiest().trades)} busiest`,
          ]}
        />
      </View>
      <View
        style={{ marginTop: size.gap + 4 }}
        onLayout={({ bounds }) => width.set(bounds.size.width)}
      >
        <Plot
          data={rows()}
          xScale={{ type: "band", domain: SLOTS, paddingInner: 0.14 }}
          yScale={{ type: "band", domain: WEEKDAYS, paddingInner: 0.14 }}
          colorScale={{ type: "sequential", range: ramp() }}
          appearGeneration={1}
          motion={{
            appear: { duration: 900, easing: "easeOut" },
            update: { duration: 600, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
            pointer: { stiffness: 380, damping: 34 },
          }}
          accessibilityLabel={`Trades per half hour in ${market()}: busiest ${busiest().day} at ${busiest().slot} with ${thousands(busiest().trades)}, quietest ${quietest().day} at ${quietest().slot}`}
          accessibilityValue={{
            text:
              shown() && `${shown()!.day} ${shown()!.slot}: ${thousands(shown()!.trades)} trades`,
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          style={{ height: WEEKDAYS.length * (compact() ? 24 : 28), marginLeft: 36, marginTop: 20 }}
        >
          <Cell
            x="slot"
            y="day"
            value="trades"
            cornerRadii={4}
            stagger={0.6}
            inactiveOpacity={0.4}
            hoverCellClass="rounded-[5px]"
            hoverCellStyle={cellRing()}
          />
          <PlotAxis
            placement="top"
            tickValues={compact() ? [0, 4, 8, 12] : [0, 2, 4, 6, 8, 10, 12]}
            labelStyle={{ ...tick(), lineHeight: 14, paddingBottom: 6 }}
          />
          <PlotAxis
            placement="left"
            labelStyle={{ ...tick(), width: 36, paddingRight: 8, textAlign: "right" }}
          />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="Busiest" value={`${busiest().day} ${busiest().slot}`} />
          <Stat label="Quietest" value={`${quietest().day} ${quietest().slot}`} />
          <Stat label="Open vs 13:30" value={`${fixed(meanAt("9:30") / meanAt("13:30"), 1)}×`} />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 120 : undefined,
        }}
      >
        <Choice
          options={MARKETS}
          value={market()}
          size={size.switch}
          onChange={(next) => market.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Flows (Flows) ---------------------------------------------------------------------------

/** Two quarters' income, in billions: two segments into revenue, revenue
 * into gross profit and its cost, gross profit into operating income and
 * expenses, operating income into net income and tax. */
const ACCOUNTS = [
  "Products",
  "Services",
  "Revenue",
  "Gross profit",
  "Cost",
  "Operating",
  "OpEx",
  "Net income",
  "Tax",
].map((name) => ({
  name,
}));
const PAIRS = [
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
  [3, 6],
  [5, 7],
  [5, 8],
];
const QUARTERS = [
  { value: "q3", label: "Q3" },
  { value: "q4", label: "Q4" },
] as const;
type Quarter = (typeof QUARTERS)[number]["value"];
const FLOWED: Record<Quarter, number[]> = {
  q3: [61.6, 23.9, 39.7, 45.8, 23.4, 16.3, 19.9, 3.5],
  q4: [68.2, 25.1, 43.6, 49.7, 27.0, 16.6, 23.1, 3.9],
};
const income = (q: Quarter) =>
  PAIRS.map(([source, target], i) => ({ source, target, value: FLOWED[q][i] }));
/** What flows through account `i`: the most into or out of it. */
const through = (q: Quarter, i: number) => {
  const sum = (end: 0 | 1) =>
    PAIRS.reduce((s, pair, k) => (pair[end] === i ? s + FLOWED[q][k] : s), 0);
  return Math.max(sum(0), sum(1));
};
/** Each account's color: what is kept in the accent, the segments in
 * graphite, what is spent quiet; a ribbon fades from its source's to its
 * target's. */
const NODE = [
  "fill-chart-2",
  "fill-chart-3",
  "fill-chart-1",
  "fill-chart-1",
  "fill-chart-4",
  "fill-chart-1",
  "fill-chart-4",
  "fill-chart-1",
  "fill-chart-4",
];
const FROM = [
  "from-chart-2/30",
  "from-chart-3/30",
  "from-chart-1/30",
  "from-chart-1/30",
  "from-chart-4/30",
  "from-chart-1/30",
  "from-chart-4/30",
  "from-chart-1/30",
  "from-chart-4/30",
];
const TO = [
  "to-chart-2/30",
  "to-chart-3/30",
  "to-chart-1/30",
  "to-chart-1/30",
  "to-chart-4/30",
  "to-chart-1/30",
  "to-chart-4/30",
  "to-chart-1/30",
  "to-chart-4/30",
];
const FLOW_HEIGHT = pointer ? 196 : 220;
/** The room left of the segments' names and right of the results'. */
const FLOW_LEFT = 58;
const FLOW_RIGHT = 64;
/** Columns closer than this break two-word names over two lines, so the
 * names centered over neighbouring columns do not run into each other. */
const FLOW_NARROW = 72;
const billions = (v: number) => `$${fixed(v, 1)}B`;

/**
 * Two quarters' income as flows: each account a hairline node named beside
 * it (left of the segments, right of the results, above the rest), each
 * flow a ribbon fading from its source's color to its target's, what is
 * kept in the accent and what is spent quiet, drawn in from the left. The
 * account under the pointer or the arrow keys is read out over the flows,
 * the links away from it fading; the quarters' flows move into each other.
 */
function Flows() {
  const quarter = signal<Quarter>("q3");
  const hover = signal<number | null>(null);
  const revenue = () => through(quarter(), 2);
  const shown = () => hover() ?? 2;
  const shareOf = (v: number) => `${fixed((v / revenue()) * 100, 1)}%`;
  const margin = (i: number) => shareOf(through(quarter(), i));
  const label = () => QUARTERS.find((q) => q.value === quarter())!.label;
  /** The distance between the five columns, once laid out. */
  const column = signal(Infinity);
  const name = (d: (typeof ACCOUNTS)[number]) =>
    column() < FLOW_NARROW ? d.name.replace(" ", "\n") : d.name;
  return (
    <ChartCard title="Flows" subtitle="A quarter's revenue from its segments to net income">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>{ACCOUNTS[shown()].name.toUpperCase()}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: colors.foreground,
              fontVariant: "tabular-nums",
            }}
          >
            {billions(through(quarter(), shown()))}
          </Text>
          <Text
            style={{ fontSize: 12, color: colors.mutedForeground }}
          >{`${margin(shown())} of ${label()} revenue`}</Text>
        </View>
      </View>
      <View
        onLayout={({ bounds }) => column.set((bounds.size.width - FLOW_LEFT - FLOW_RIGHT - 3) / 4)}
        style={{ marginBottom: 6 }}
      >
        <Plot
          data={ACCOUNTS}
          appearGeneration={1}
          motion={{
            appear: { duration: 1100, easing: "easeOut" },
            update: { duration: 600, easing: "easeInOut" },
            enter: { duration: 120 },
            exit: { duration: 180 },
            pointer: { stiffness: 420, damping: 40 },
          }}
          accessibilityLabel={`Income flows, ${label()}: ${billions(revenue())} revenue, ${billions(through(quarter(), 7))} net income, a net margin of ${margin(7)}`}
          accessibilityValue={{
            text:
              hover() == null
                ? undefined
                : `${ACCOUNTS[hover()!].name}: ${billions(through(quarter(), hover()!))}, ${margin(hover()!)} of revenue`,
          }}
          onHoverChange={({ index }) => hover.set(index)}
          focusVisibleStyle={focusRing(4)}
          // Room for the segments' names left of them, the results' right
          // and the rest's above: the chart's own margins.
          style={{
            height: FLOW_HEIGHT,
            marginTop: size.gap + 18,
            marginLeft: FLOW_LEFT,
            marginRight: FLOW_RIGHT,
          }}
        >
          <Sankey
            links={income(quarter())}
            nodeAlign="left"
            nodeWidth={3}
            nodePadding={20}
            nodeCornerRadius={1.5}
            hoverDim={0.7}
            nodeClass={(_, i) => NODE[i]}
            linkBackgroundClass={(link) => `bg-linear-to-r ${FROM[link.source]} ${TO[link.target]}`}
            nodeLabel={name}
            nodeLabelStyle={{
              ...axis(),
              color: colors.mutedForeground,
              padding: 5,
              numberOfLines: 2,
            }}
          />
        </Plot>
      </View>
      <View style={{ marginTop: size.gap + 4 }}>
        <StatGroup class="border-line border-t pt-3">
          <Stat label="Revenue" value={billions(revenue())} />
          <Stat label="Gross margin" value={margin(3)} />
          <Stat label="Operating" value={margin(5)} />
          <Stat label="Net margin" value={margin(7)} tone="up" />
        </StatGroup>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 160 : undefined,
        }}
      >
        <Choice
          options={QUARTERS}
          value={quarter()}
          size={size.switch}
          onChange={(next) => {
            quarter.set(next);
            hover.set(null);
          }}
        />
      </View>
    </ChartCard>
  );
}

// --- Market map (MarketMap) ------------------------------------------------------------------

/** The periods a market map's changes are measured over. */
const MAP_PERIODS = [
  { value: "1D", label: "Day" },
  { value: "1W", label: "Week" },
  { value: "1M", label: "Month" },
] as const;
type MapPeriod = (typeof MAP_PERIODS)[number]["value"];
/** How far a period's changes run before their color is full: a day's 3%, a month's 12%. */
const MAP_RANGE: Record<MapPeriod, number> = { "1D": 3, "1W": 6, "1M": 12 };
/** A listed stock: its market cap in billions at the start of the periods and its change over each, in percent. */
type Listed = [ticker: string, name: string, cap: number, d: number, w: number, m: number];
const MARKET: { sector: string; stocks: Listed[] }[] = [
  {
    sector: "Technology",
    stocks: [
      ["NVDA", "NVIDIA", 4300, 2.41, 5.8, 11.2],
      ["MSFT", "Microsoft", 3700, -0.62, 1.4, 4.1],
      ["AAPL", "Apple", 3600, 0.35, -1.9, 6.3],
      ["AVGO", "Broadcom", 1600, 3.12, 7.4, 14.8],
      ["ORCL", "Oracle", 720, -2.84, -5.1, -9.6],
      ["AMD", "AMD", 380, 1.76, 9.2, 3.4],
      ["CRM", "Salesforce", 240, -1.21, -3.3, -7.8],
      ["ADBE", "Adobe", 150, -0.44, 0.6, -4.2],
    ],
  },
  {
    sector: "Communication",
    stocks: [
      ["GOOGL", "Alphabet", 3100, 1.05, 3.2, 8.7],
      ["META", "Meta", 1800, -1.48, 2.1, -3.6],
      ["NFLX", "Netflix", 480, 0.22, -2.7, 5.1],
      ["DIS", "Disney", 200, -0.31, -1.1, 1.9],
    ],
  },
  {
    sector: "Consumer",
    stocks: [
      ["AMZN", "Amazon", 2400, 0.86, -0.8, 2.6],
      ["TSLA", "Tesla", 1400, -3.65, -8.4, 18.9],
      ["COST", "Costco", 420, 0.12, 0.9, -1.4],
      ["WMT", "Walmart", 820, 0.48, 1.6, 3.8],
      ["HD", "Home Depot", 380, -0.73, -2.2, -4.9],
      ["MCD", "McDonald's", 220, 0.05, 0.4, 1.1],
    ],
  },
  {
    sector: "Financials",
    stocks: [
      ["BRK.B", "Berkshire", 1050, 0.18, 0.7, 2.2],
      ["JPM", "JPMorgan", 830, 1.34, 2.9, 6.6],
      ["V", "Visa", 670, -0.27, 1.2, 3.1],
      ["MA", "Mastercard", 520, -0.39, 0.8, 2.4],
      ["BAC", "Bank of America", 390, 1.92, 3.8, 7.9],
      ["GS", "Goldman Sachs", 240, 2.65, 4.4, 9.8],
    ],
  },
  {
    sector: "Healthcare",
    stocks: [
      ["LLY", "Eli Lilly", 820, -1.94, -4.6, 7.2],
      ["UNH", "UnitedHealth", 300, -4.12, -9.3, -16.4],
      ["JNJ", "Johnson & Johnson", 460, 0.41, 1.3, 2.8],
      ["ABBV", "AbbVie", 380, -0.58, 0.2, -2.1],
      ["MRK", "Merck", 210, -1.07, -2.8, -6.3],
    ],
  },
  {
    sector: "Energy",
    stocks: [
      ["XOM", "Exxon Mobil", 470, -0.96, 1.8, -3.2],
      ["CVX", "Chevron", 300, -1.33, 0.9, -4.7],
      ["COP", "ConocoPhillips", 120, -2.18, -0.6, -8.1],
    ],
  },
];
/** A market map's row: a sector (no `parent`), or a stock in one, its cap at the end of the period and its change over it. */
type MapRow = { id: string; parent?: string; name: string; cap?: number; chg?: number };
const changeOf = (s: Listed, p: MapPeriod) => (p === "1D" ? s[3] : p === "1W" ? s[4] : s[5]);
const marketRows = (p: MapPeriod): MapRow[] => [
  ...MARKET.map((m) => ({ id: m.sector, name: m.sector })),
  ...MARKET.flatMap((m) =>
    m.stocks.map((s) => ({
      id: s[0],
      parent: m.sector,
      name: s[1],
      cap: s[2] * (1 + changeOf(s, p) / 100),
      chg: changeOf(s, p),
    })),
  ),
];
const MAP_HEIGHT = pointer ? 300 : 340;

/**
 * A market map: the S&P 500's largest stocks as a `Treemap` of sectors,
 * each stock's area its market cap and its color the period's change
 * along a diverging `colorScale` (losses red, gains green, flat the
 * card's inset gray), its ticker and change centered on it where they
 * fit, light on the dark tiles (`data-dark`). Each sector's name sits in
 * a band over its stocks. The stock or sector under the pointer or the
 * arrow keys is read out over the map, the others fading; another period
 * recolors the tiles and moves them to their new caps (`motion.update`).
 */
function MarketMap() {
  const period = signal<MapPeriod>("1D");
  const hover = signal<number | null>(null);
  const rows = () => marketRows(period());
  const shown = () => (hover() == null ? undefined : rows()[hover()!]);
  const stocks = () => rows().filter((r) => r.parent != null);
  /** A set of stocks' cap-weighted change. */
  const weighted = (of: MapRow[]) =>
    of.reduce((s, r) => s + r.chg! * r.cap!, 0) / of.reduce((s, r) => s + r.cap!, 0);
  const sector = (name: string) => stocks().filter((r) => r.parent === name);
  const capOfRows = (of: MapRow[]) => of.reduce((s, r) => s + r.cap!, 0);
  const advancing = () => stocks().filter((r) => r.chg! > 0).length;
  const range = () => MAP_RANGE[period()];
  const readout = () => {
    const r = shown();
    if (!r)
      return {
        title: `S&P 500 · TOP ${stocks().length} · ${period()}`,
        value: weighted(stocks()),
        note: `${advancing()} up, ${stocks().length - advancing()} down · ${capOf(capOfRows(stocks()))} in all`,
      };
    if (r.parent == null) {
      const of = sector(r.id);
      return {
        title: `${r.name.toUpperCase()} · ${of.length} STOCKS`,
        value: weighted(of),
        note: `${capOf(capOfRows(of))} market cap · cap-weighted`,
      };
    }
    return {
      title: `${r.id} · ${r.name.toUpperCase()}`,
      value: r.chg!,
      note: `${r.parent} · ${capOf(r.cap!)} market cap`,
    };
  };
  const tone = (v: number): Tone => (v > 0 ? "up" : v < 0 ? "down" : "neutral");
  return (
    <ChartCard title="Market map" subtitle="The largest stocks by sector, sized by market cap">
      <View style={{ gap: 4 }}>
        <Text style={tipTitle()}>{readout().title}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              letterSpacing: -0.4,
              color: toneColor(tone(readout().value)),
              fontVariant: "tabular-nums",
            }}
          >
            {pct(readout().value, 2)}
          </Text>
          <Text
            style={{
              flexShrink: 1,
              fontSize: 12,
              color: colors.mutedForeground,
              fontVariant: "tabular-nums",
            }}
          >
            {readout().note}
          </Text>
        </View>
      </View>
      <Plot
        data={rows()}
        colorScale={{
          type: "diverging",
          domain: [-range(), range()],
          range: [colors.destructive, colors.inset, colors.up],
        }}
        appearGeneration={1}
        motion={{
          appear: { duration: 900, easing: "easeOut" },
          update: { duration: 650, easing: "easeInOut" },
          enter: { duration: 120 },
          exit: { duration: 180 },
          pointer: { stiffness: 380, damping: 36 },
        }}
        accessibilityLabel={`Market map of ${stocks().length} stocks in ${MARKET.length} sectors, ${period()}: ${advancing()} up`}
        accessibilityValue={{
          text: shown() && `${shown()!.name}: ${pct(readout().value, 2)}, ${readout().note}`,
        }}
        onHoverChange={({ index }) => hover.set(index)}
        focusVisibleStyle={focusRing(4)}
        style={{ height: MAP_HEIGHT, marginTop: size.gap + 4 }}
      >
        <Treemap
          id="id"
          parent="parent"
          value="cap"
          colorValue="chg"
          paddingInner={[3, 1]}
          paddingTop={18}
          cornerRadii={2}
          stagger={0.4}
          inactiveOpacity={0.35}
          label={(d: MapRow) => d.id}
          valueLabel={(d: MapRow) => pct(d.chg ?? 0, 2)}
          labelPlacement="center"
          labelClass="p-1 text-foreground data-dark:text-on-media"
          labelStyle={{ fontSize: 11.5, fontWeight: "600", letterSpacing: 0.2 }}
          valueLabelStyle={{
            fontSize: 10,
            fontWeight: "400",
            opacity: 0.85,
            fontVariant: "tabular-nums",
          }}
          groupLabel="name"
          groupLabelClass="px-1 text-muted-foreground"
          groupLabelStyle={{ ...axis(), lineHeight: 18, letterSpacing: 0.6 }}
          hoverClass="rounded-xs outline-2 outline-foreground"
        />
      </Plot>
      {/* The color's key: the period's range, from its full loss to its full gain. */}
      <View
        style={{
          marginTop: 10,
          gap: 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 260 : undefined,
        }}
      >
        <View class="from-down via-inset to-up h-2 rounded-full bg-linear-to-r" />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Each of={[-range(), -range() / 2, 0, range() / 2, range()]}>
            {(v) => (
              <Text style={axis()}>{v() === 0 ? "0" : `${signed(v(), v() % 1 ? 1 : 0)}%`}</Text>
            )}
          </Each>
        </View>
      </View>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 220 : undefined,
        }}
      >
        <Choice
          options={MAP_PERIODS}
          value={period()}
          size={size.switch}
          onChange={(next) => period.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Allocation (Allocation) -----------------------------------------------------------------

const ALLOCATION_VIEWS = [
  { value: "now", label: "Today" },
  { value: "year", label: "A year ago" },
] as const;
type AllocationView = (typeof ALLOCATION_VIEWS)[number]["value"];
const ASSET_CLASSES = ["Equities", "Bonds", "Alternatives", "Cash"];
/** Each asset class's color, also the color of the band its positions sit in. */
const classColor = (cls: string): string =>
  cls === "Equities"
    ? chart.chart1
    : cls === "Bonds"
      ? chart.chart2
      : cls === "Alternatives"
        ? chart.chart4
        : chart.chart3;
/**
 * A position's tile is its class's colour, solid. The label is `foreground` on a light
 * tile and `on-media` on a dark one: `data-dark` follows the cell's OKLab lightness (under 0.65),
 * not the appearance, so one ink pair covers every theme. Five `chart-N-foreground` tokens could
 * not, because a treemap takes a single `labelClass`.
 */
const classFill = (cls: string): string => classColor(cls);
const CLASS_GROUP = ["fill-chart-1/15", "fill-chart-2/15", "fill-chart-4/15", "fill-chart-3/15"];
/** A position: its ticker, name and class, and its value in thousands today and a year ago (none if it was not held). */
type Position = [
  ticker: string,
  name: string,
  cls: string,
  now: number | null,
  year: number | null,
];
const POSITIONS: Position[] = [
  ["VOO", "S&P 500 ETF", "Equities", 182, 140],
  ["QQQ", "Nasdaq 100 ETF", "Equities", 96, 64],
  ["VXUS", "Intl. stocks", "Equities", 58, 61],
  ["NVDA", "NVIDIA", "Equities", 41, null],
  ["ARKK", "Innovation ETF", "Equities", null, 22],
  ["BND", "Total bond", "Bonds", 74, 88],
  ["TLT", "20Y Treasuries", "Bonds", 31, null],
  ["TIP", "TIPS", "Bonds", 18, 24],
  ["GLD", "Gold", "Alternatives", 34, 21],
  ["VNQ", "Real estate", "Alternatives", 16, 19],
  ["BTC", "Bitcoin", "Alternatives", 12, 5],
  ["SGOV", "T-bills", "Cash", 44, 52],
  ["USD", "Cash", "Cash", 14, 18],
];
type AllocationRow = { id: string; parent?: string; name: string; cls: string; value?: number };
/** A class, then the positions held in it at that time. */
const allocationRows = (view: AllocationView): AllocationRow[] => [
  ...ASSET_CLASSES.map((cls) => ({ id: cls, name: cls, cls })),
  ...POSITIONS.flatMap(([id, name, cls, now, year]) => {
    const value = view === "now" ? now : year;
    return value == null ? [] : [{ id, parent: cls, name, cls, value }];
  }),
];
const kUsd = (k: number) => (k >= 1000 ? `$${fixed(k / 1000, 2)}M` : `$${fixed(k, 0)}k`);
const ALLOCATION_HEIGHT = pointer ? 260 : 300;

/**
 * A portfolio as a `Treemap` of its asset classes, each position's area
 * its value and its color its class, with the classes' names in bands over
 * their positions. The readout gives the class's or position's value and
 * share of the portfolio; the figures under it wait each class's weight.
 * A year ago moves every tile to the value it had (`motion.update`).
 */
function Allocation() {
  const view = signal<AllocationView>("now");
  const tip = signal<number | null>(null);
  const rows = () => allocationRows(view());
  const shown = () => (tip() == null ? undefined : rows()[tip()!]);
  const total = () => rows().reduce((s, r) => s + (r.value ?? 0), 0);
  const valueOf = (r: AllocationRow) =>
    r.value ?? rows().reduce((s, x) => (x.parent === r.id ? s + (x.value ?? 0) : s), 0);
  const weight = (v: number) => `${fixed((v / total()) * 100, 1)}%`;
  return (
    <ChartCard title="Allocation" subtitle="Asset classes and their positions, by value">
      <StatGroup class="border-line border-t pt-3">
        <Each of={ASSET_CLASSES}>
          {(cls) => (
            <Stat label={cls()} value={weight(valueOf(rows().find((r) => r.id === cls())!))} />
          )}
        </Each>
      </StatGroup>
      <Plot
        data={rows()}
        colorScale={{
          type: "ordinal",
          domain: ASSET_CLASSES,
          range: ASSET_CLASSES.map(classFill),
        }}
        appearGeneration={1}
        motion={{
          appear: { duration: 900, easing: "easeOut" },
          update: { duration: 700, easing: "easeInOut" },
          enter: { duration: 120 },
          exit: { duration: 160 },
          pointer: { stiffness: 380, damping: 36 },
        }}
        tooltipPlacement="pointer"
        tooltipOffset={12}
        tooltipContent={
          shown() == null ? undefined : (
            <View style={tipCard()}>
              <Text style={tipTitle()}>
                {shown()!.parent == null
                  ? `${shown()!.name.toUpperCase()} · ${rows().filter((r) => r.parent === shown()!.id).length} POSITIONS`
                  : `${shown()!.id} · ${shown()!.cls}`}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>
                {shown()!.name}
              </Text>
              <Text
                style={{ fontSize: 12, color: colors.mutedForeground }}
              >{`${kUsd(valueOf(shown()!))} · ${weight(valueOf(shown()!))} of the portfolio`}</Text>
            </View>
          )
        }
        accessibilityLabel={`Allocation, ${view() === "now" ? "today" : "a year ago"}: ${ASSET_CLASSES.map((cls) => `${cls} ${weight(valueOf(rows().find((r) => r.id === cls)!))}`).join(", ")}`}
        accessibilityValue={{
          text:
            shown() &&
            `${shown()!.name}: ${kUsd(valueOf(shown()!))}, ${weight(valueOf(shown()!))} of the portfolio`,
        }}
        onHoverChange={({ index }) => tip.set(index)}
        focusVisibleStyle={focusRing(4)}
        style={{ height: ALLOCATION_HEIGHT, marginTop: size.gap + 4 }}
      >
        <Treemap
          id="id"
          parent="parent"
          value="value"
          color="cls"
          paddingInner={[6, 2]}
          paddingOuter={3}
          paddingTop={20}
          cornerRadii={4}
          inactiveOpacity={0.4}
          groupClass={(d: AllocationRow) => CLASS_GROUP[ASSET_CLASSES.indexOf(d.cls)]}
          label={(d: AllocationRow) => d.id}
          valueLabel={(_: AllocationRow, value: number) => weight(value)}
          labelClass="px-2 py-1.5 text-foreground data-dark:text-on-media"
          labelStyle={{ fontSize: 12, fontWeight: "600" }}
          valueLabelStyle={{
            fontSize: 11,
            fontWeight: "400",
            opacity: 0.8,
            fontVariant: "tabular-nums",
          }}
          groupLabel={(d: AllocationRow) => d.name}
          groupLabelClass="px-2 text-foreground"
          groupLabelStyle={{ fontSize: 11, fontWeight: "500", lineHeight: 20 }}
          hoverClass="rounded-md outline-2 outline-foreground"
        />
      </Plot>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 220 : undefined,
        }}
      >
        <Choice
          options={ALLOCATION_VIEWS}
          value={view()}
          size={size.switch}
          onChange={(next) => view.set(next)}
        />
      </View>
    </ChartCard>
  );
}

// --- Watchlist (Watchlist) -------------------------------------------------------------------

/**
 * The indices of the watchlist: a day's 39 five-minute points, a week's
 * 35 half-hourly ones, a month's 22 daily ones.
 */
const SPANS = [
  { value: "1D", label: "1D", points: 39 },
  { value: "1W", label: "1W", points: 35 },
  { value: "1M", label: "1M", points: 22 },
] as const;
type Span = (typeof SPANS)[number]["value"];
const SYMBOLS: [symbol: string, name: string][] = [
  ["AAPL", "Apple"],
  ["MSFT", "Microsoft"],
  ["NVDA", "NVIDIA"],
  ["AMZN", "Amazon"],
  ["GOOGL", "Alphabet"],
  ["META", "Meta Platforms"],
  ["TSLA", "Tesla"],
  ["AVGO", "Broadcom"],
  ["ORCL", "Oracle"],
  ["AMD", "Advanced Micro Devices"],
  ["NFLX", "Netflix"],
  ["ADBE", "Adobe"],
  ["CRM", "Salesforce"],
  ["QCOM", "Qualcomm"],
  ["INTC", "Intel"],
  ["IBM", "IBM"],
  ["UBER", "Uber"],
  ["SHOP", "Shopify"],
];
type Point = { close: number };
/** A random walk of `n` closes from 100, inside ±1.2% a point. */
const start = 100;
function walk(seed: number, n: number): Point[] {
  const next = random(seed);
  let close = start;
  return Array.from({ length: n }, () => ({ close: (close *= 1 + (next() - 0.49) * 0.024) }));
}
type Watched = { symbol: string; name: string; last: number; closes: Record<Span, Point[]> };
/** Each symbol's 1D, 1W and 1M closes, all ending at its last. */
const WATCH: Watched[] = SYMBOLS.map(([symbol, name], i) => ({
  symbol,
  name,
  last: 40 + random(97 * (i + 1))() * 460,
  closes: Object.fromEntries(
    SPANS.map((s, j) => [s.value, walk(7919 * (i + 1) + 104729 * j, s.points)]),
  ) as Record<Span, Point[]>,
}));
/** How many rows of the list it shows. */
const WATCH_ROW = 52;

/**
 * A watchlist whose every row carries its own sparkline: a `Plot` of one
 * `Line` and an `Area` wash over it, the line the span's change's color
 * (green for a gain, red for a loss), the close it opened at a dotted
 * `Grid`, and its last close hour its change beside it. Every sparkline
 * draws itself in when the page appears or the span changes, inside a
 * `PlotAppearScope` so all 18 rows draw once. Its accessibility text reads
 * the whole line, so the plot is not interactive.
 */
function Watchlist() {
  const span = signal<Span>("1D");
  const closes = (w: Watched) => w.closes[span()];
  const change = (w: Watched) =>
    (closes(w)[closes(w).length - 1].close / closes(w)[0].close - 1) * 100;
  const tone = (w: Watched): Tone => (change(w) >= 0 ? "up" : "down");
  return (
    <ChartCard title="Watchlist" subtitle="Sparklines that draw in once and stay whole">
      <PlotAppearScope id="watchlist">
        <List
          testID="watchlist"
          each={WATCH}
          keyExtractor={(w) => w.symbol}
          estimatedItemSize={WATCH_ROW}
          style={{ height: WATCH_ROW * 5 }}
        >
          {(w) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                height: WATCH_ROW,
                borderBottomWidth: 1,
                borderColor: colors.line,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.foreground,
                    fontFamily: "monospace",
                  }}
                >
                  {w().symbol}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.faint, numberOfLines: 1 }}>
                  {w().name}
                </Text>
              </View>
              <Plot
                data={closes(w())}
                y="close"
                interactive={false}
                appearGeneration={`${w().symbol} ${span()}`}
                motion={{ appear: { duration: 700, easing: "easeOut" } }}
                accessibilityLabel={`${w().symbol}, ${span()}: ${signed(change(w()))}%`}
                style={{ width: pointer ? 112 : 88, height: 28 }}
              >
                {/* The close it opened at, so a month's net move reads at a glance. */}
                <Grid
                  y={[closes(w())[0].close]}
                  style={{ stroke: colors.line, strokeDasharray: "1 3" }}
                />
                <Area backgroundStyle={wash(toneColor(tone(w())), 0.16)} hoverDotClass="hidden" />
                <Line style={{ stroke: toneColor(tone(w())), strokeWidth: 1.5 }} />
              </Plot>
              <View style={{ width: 72, alignItems: "flex-end", gap: 2 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: colors.foreground,
                    fontVariant: "tabular-nums",
                  }}
                >
                  {fixed(w().last)}
                </Text>
                <Text
                  style={{
                    fontSize: 11.5,
                    color: toneColor(tone(w())),
                    fontVariant: "tabular-nums",
                  }}
                >{`${signed(change(w()))}%`}</Text>
              </View>
            </View>
          )}
        </List>
      </PlotAppearScope>
      <View
        style={{
          marginTop: size.gap + 4,
          alignSelf: pointer ? "flex-start" : "stretch",
          width: pointer ? 180 : undefined,
        }}
      >
        <Choice
          options={SPANS}
          value={span()}
          size={size.switch}
          onChange={(next) => span.set(next)}
        />
      </View>
    </ChartCard>
  );
}

export function PlotDemo() {
  return (
    <DemoPage
      title="Plot"
      note="The gallery's charts, each Plot composed of marks, axes and a header that reads the band under the pointer."
    >
      <View style={{ flexDirection: "column", gap: 24 }}>
        <Live />
        <Depth />
        <Drawdown />
        <Capacity />
        <Revenue />
        <Sales />
        <Bridge />
        <Funnel />
        <Candles />
        <RiskReturn />
        <Targets />
        <VolumePrice />
        <Margins />
        <Correlation />
        <Seasonality />
        <Activity />
        <Factors />
        <Flows />
        <MarketMap />
        <Allocation />
        <Watchlist />
      </View>
    </DemoPage>
  );
}
