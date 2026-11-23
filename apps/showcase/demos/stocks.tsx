import {
  alpha,
  colors,
  finish,
  focusRing,
  TERMINAL_COLUMN,
  TERMINAL_GAP,
  TERMINAL_ROW,
  terminal,
} from "@shadcn-nsh/theme";
import { ChevronDown, Pause, Play } from "lucide";
// The market: a watchlist that quotes every 50 ms under a one-line market strip (open it for breadth
// and sectors), rows with today's sparkline, sorted filters, and a stock opened over the list — or
// beside it, with the book, the tape and the flow to its right. Ported from `Stocks.tsx`.
import {
  Canvas,
  cleanup,
  computed,
  createAnimatedValue,
  Easing,
  effect,
  LayoutAnimation,
  Scroll,
  signal,
  Text,
  token,
  untracked,
  View,
} from "nsh";

import { Icon } from "@/packages/ui/lib/icons";
import { pressSink } from "@/packages/ui/lib/press";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { desktop, paneWidth } from "./apps-shared";
import { StockView } from "./stocks/detail";
import {
  createMarket,
  grouped,
  INDEX_BASE,
  ISSUES,
  type Market,
  percent,
  price,
  type Stock,
  sectors,
  signed,
  time,
  toneOf,
} from "./stocks/market";
import { calm, SpringBar } from "./stocks/parts";

type Filter = "all" | "gainers" | "losers" | "active";

/** Expanding and collapsing, reordering rows: one native layout animation. */
const relayout = {
  duration: 380,
  update: { type: "spring", springDamping: 0.84 },
  create: { type: "easeInEaseOut", property: "opacity" },
  delete: { type: "easeInEaseOut", property: "opacity" },
} as const;

/** A sector's mean change as a bar diverging from the middle. */
function SectorBar(props: { label: string; change: () => number; scale: () => number }) {
  const share = () => Math.min(1, Math.abs(props.change()) / props.scale());
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: terminal ? TERMINAL_ROW : 22,
      }}
    >
      <Text
        style={{
          numberOfLines: 1,
          width: terminal ? 96 : 84,
          fontSize: 13,
          color: colors.mutedForeground,
        }}
      >
        {props.label}
      </Text>
      <If when={!terminal} else={<View style={{ flex: 1 }} />}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <SpringBar
              share={() => (props.change() < 0 ? share() : 0)}
              color={colors.destructive}
              from="right"
              height={8}
              radius={2}
            />
          </View>
          <View style={{ width: 1, height: 14, backgroundColor: colors.border }} />
          <View style={{ flex: 1 }}>
            <SpringBar
              share={() => (props.change() > 0 ? share() : 0)}
              color={colors.up}
              height={8}
              radius={2}
            />
          </View>
        </View>
      </If>
      <Text
        style={{
          width: 56,
          textAlign: "right",
          fontSize: 12,
          fontVariant: ["tabular-nums"],
          color: toneOf(props.change()),
        }}
      >
        {signed(props.change())}%
      </Text>
    </View>
  );
}

/** Advancers vs decliners across the composite and the sectors' moves: what the strip opens to. */
function Breadth(props: { market: Market }) {
  const b = () => props.market.breadth();
  const means = computed(() => {
    props.market.pulse();
    return untracked(() =>
      sectors.map((s) => {
        const members = props.market.stocks.filter((m) => m.sector === s.id);
        return members.reduce((sum, m) => sum + percent(m.quote()), 0) / members.length;
      }),
    );
  });
  const scale = () => Math.max(0.5, ...means().map(Math.abs)) * 1.1;
  return (
    <View
      style={
        terminal
          ? { paddingHorizontal: TERMINAL_COLUMN, paddingBottom: TERMINAL_ROW, gap: TERMINAL_ROW }
          : { paddingHorizontal: 16, paddingBottom: 14, gap: 10 }
      }
    >
      <View style={{ gap: terminal ? 0 : 6 }}>
        <If when={!terminal}>
          <View
            style={{ flexDirection: "row", height: 6, overflow: "hidden", gap: 2, borderRadius: 3 }}
          >
            <View style={{ flex: b().up, backgroundColor: colors.up }} />
            <View style={{ flex: b().flat, backgroundColor: colors.faint }} />
            <View style={{ flex: b().down, backgroundColor: colors.destructive }} />
          </View>
        </If>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ flex: 1, fontSize: 12, fontVariant: ["tabular-nums"], color: colors.up }}>
            {b().up} up
          </Text>
          <Text style={{ fontSize: 12, fontVariant: ["tabular-nums"], color: colors.faint }}>
            {b().flat} flat · {ISSUES} issues
          </Text>
          <Text
            style={{
              flex: 1,
              textAlign: "right",
              fontSize: 12,
              fontVariant: ["tabular-nums"],
              color: colors.destructive,
            }}
          >
            {b().down} down
          </Text>
        </View>
      </View>
      <View style={{ gap: terminal ? 0 : 2 }}>
        <Each of={sectors}>
          {(s, i) => <SectorBar label={s().label} change={() => means()[i()]} scale={scale} />}
        </Each>
      </View>
    </View>
  );
}

/**
 * The market in one line, on the 16 pt gutters: the composite and its change, the clock, pause. A
 * tap opens breadth and sectors (a layout animation; the chevron turns natively). One row in the
 * terminal, pause a text button.
 */
function MarketStrip(props: { market: Market }) {
  const opened = signal(false);
  const turn = createAnimatedValue(0);
  const level = () => props.market.composite();
  const change = () => ((level() - INDEX_BASE) / INDEX_BASE) * 100;
  const running = () => props.market.running();
  const toggle = () => {
    LayoutAnimation.configureNext(relayout);
    opened.set(!opened());
    void turn.spring(opened() ? 1 : 0, { stiffness: 260, damping: 24 });
  };
  const height = terminal ? TERMINAL_ROW : 56;
  const pause = () => (running() ? props.market.stop() : props.market.start());
  const pauseLabel = () => (running() ? "Pause the market" : "Resume the market");
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: terminal ? TERMINAL_GAP : 12,
          paddingHorizontal: terminal ? TERMINAL_COLUMN : 16,
          height,
        }}
      >
        <View
          onPress={toggle}
          role="button"
          accessibilityLabel={opened() ? "Hide breadth" : "Show breadth"}
          hoverStyle={{ opacity: 0.72 }}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: terminal ? TERMINAL_COLUMN : 8,
            height,
            transitionProperty: "opacity",
            transitionDuration: 120,
          }}
        >
          <Text style={{ numberOfLines: 1, fontSize: 13, color: colors.mutedForeground }}>
            Composite
          </Text>
          <Text
            style={{
              numberOfLines: 1,
              fontSize: 15,
              fontWeight: "600",
              color: colors.foreground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {grouped(level())}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: toneOf(change()),
              fontVariant: ["tabular-nums"],
            }}
          >
            {signed(change())}%
          </Text>
          <If when={!terminal}>
            <View
              style={{
                rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-180deg"] }),
              }}
            >
              <Icon icon={ChevronDown} size={12} tint={colors.faint} />
            </View>
          </If>
        </View>
        <Text
          style={{
            flexShrink: 0,
            numberOfLines: 1,
            fontSize: 12,
            color: colors.faint,
            fontVariant: ["tabular-nums"],
          }}
        >
          {time(props.market.clock())}
        </Text>
        <If
          when={!terminal}
          else={
            <View
              onPress={pause}
              role="button"
              accessibilityLabel={pauseLabel()}
              style={{ paddingHorizontal: 8 }}
            >
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                {running() ? "Pause" : "Resume"}
              </Text>
            </View>
          }
        >
          <View
            onPress={pause}
            role="button"
            hitSlop={6}
            accessibilityLabel={pauseLabel()}
            hoverStyle={running() ? finish.hover : { opacity: 0.94 }}
            activeStyle={pressSink(0.97).activeStyle}
            focusVisibleStyle={focusRing()}
            style={{
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderRadius: 16,
              ...(running() ? finish.raised : finish.accent),
            }}
          >
            <Icon
              icon={running() ? Pause : Play}
              size={13}
              tint={running() ? colors.mutedForeground : colors.primaryForeground}
            />
          </View>
        </If>
      </View>
      <If when={opened()}>
        <Breadth market={props.market} />
      </If>
    </View>
  );
}

/** Points a sparkline draws: few enough for a calm, readable curve. */
const SPARK_POINTS = 24;
/** Minutes each sparkline point averages over. */
const SPARK_SMOOTH = 4;
/** The newest point's ring at its widest: the canvas reaches this far past the plot on every side, so the ring is never clipped. */
const RING = 10;
/** The plot's size. */
const SPARK_W = 104;
const SPARK_H = 38;
/** The shortest time between two pulses of a row (ms): each one completes. */
const PULSE_GAP = 600;

/** The clock for the pulse gate: a reading taken in an effect, so not part of the render. */
const stamp = () => performance.now();

/**
 * Today in 104 × 38 pt: a smooth line through a moving average of the minutes' closes ending at the
 * live price, a soft fill under it that fades in from the left and down from the line, the previous
 * close dotted and a dot at the newest point that rings natively on each change. The y range eases
 * instead of jumping.
 */
function Sparkline(props: { stock: Stock }) {
  const scale = calm(0.1);
  const ring = createAnimatedValue(1);
  const ringRadius = ring.interpolate({ inputRange: [0, 1], outputRange: [3, RING] });
  const haloAlpha = ring.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
  const strokeAlpha = ring.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] });
  const seen = signal(untracked(() => props.stock.quote().changedAt));
  const fired = signal(-Infinity);
  effect(() => {
    const q = props.stock.quote();
    if (q.changedAt === seen()) return;
    seen.set(q.changedAt);
    // A pulse at most every 600 ms, so each one plays out.
    const at = stamp();
    if (at - fired() < PULSE_GAP) return;
    fired.set(at);
    ring.set(0);
    void ring.timing(1, { duration: 700, easing: Easing.out(Easing.cubic) });
  });
  return (
    <Canvas
      style={{
        pointerEvents: "none",
        width: SPARK_W + RING * 2,
        height: SPARK_H + RING * 2,
        margin: -RING,
      }}
      accessibilityLabel={`${props.stock.code} today`}
      draw={(cx, { width, height }) => {
        const minutes = props.stock.minutes();
        const q = props.stock.quote();
        // Each point: the mean close of the minutes before it; the newest point is the last trade.
        const n = Math.min(SPARK_POINTS, minutes.length);
        if (n < 2) return;
        const ys: number[] = [];
        for (let k = 0; k < n; k++) {
          const end = Math.round((k / Math.max(1, n - 1)) * (minutes.length - 1));
          const start = Math.max(0, end - SPARK_SMOOTH + 1);
          let sum = 0;
          for (let i = start; i <= end; i++) sum += minutes[i].c;
          ys[k] = sum / (end - start + 1);
        }
        ys[n - 1] = q.last;
        let lo = q.prevClose;
        let hi = q.prevClose;
        for (const v of ys) {
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
        const r = scale.fit(lo, hi);
        const left = RING;
        const right = width - RING;
        const bottom = height - RING;
        const Y = (v: number) => RING + 2 + ((r.hi - v) / (r.hi - r.lo || 1)) * (bottom - RING - 4);
        const X = (k: number) => left + (k / Math.max(1, n - 1)) * (right - left);
        const tone = toneOf(q.last - q.prevClose);
        // A smooth curve: quadratic segments through the midpoints.
        const curve = () => {
          cx.moveTo(X(0), Y(ys[0]));
          for (let k = 1; k < n - 1; k++) {
            cx.quadraticCurveTo(
              X(k),
              Y(ys[k]),
              (X(k) + X(k + 1)) / 2,
              (Y(ys[k]) + Y(ys[k + 1])) / 2,
            );
          }
          cx.lineTo(X(n - 1), Y(ys[n - 1]));
        };
        // The fill: down from the line's top, strictly under the curve...
        let top = bottom;
        for (const v of ys) top = Math.min(top, Y(v));
        const fill = cx.createLinearGradient(0, top, 0, bottom);
        fill.addColorStop(0, alpha(tone, 0.22));
        fill.addColorStop(1, alpha(tone, 0));
        cx.beginPath();
        curve();
        cx.lineTo(X(n - 1), bottom);
        cx.lineTo(X(0), bottom);
        cx.closePath();
        cx.fillStyle = fill;
        cx.fill();
        // ...and faded in over the first fifth (erased, not overdrawn).
        const fadeTo = left + (right - left) * 0.2;
        const fade = cx.createLinearGradient(left, 0, fadeTo, 0);
        fade.addColorStop(0, "rgba(0,0,0,1)");
        fade.addColorStop(1, "rgba(0,0,0,0)");
        cx.globalCompositeOperation = "destination-out";
        cx.fillStyle = fade;
        cx.fillRect(0, 0, fadeTo, height);
        cx.globalCompositeOperation = "source-over";
        // The previous close, dotted.
        cx.strokeStyle = alpha(colors.mutedForeground, 0.4);
        cx.lineWidth = 1;
        cx.setLineDash([1, 3]);
        cx.beginPath();
        cx.moveTo(left, Y(q.prevClose));
        cx.lineTo(right, Y(q.prevClose));
        cx.stroke();
        cx.setLineDash([]);
        cx.beginPath();
        curve();
        cx.strokeStyle = tone;
        cx.lineWidth = 1.75;
        cx.lineJoin = "round";
        cx.lineCap = "round";
        cx.stroke();
        // The newest point and its pulse: a soft halo and a ring that grow and fade natively (the
        // canvas has room for them on every side).
        const x = X(n - 1);
        const y = Y(ys[n - 1]);
        cx.fillStyle = tone;
        cx.strokeStyle = tone;
        cx.globalAlpha = haloAlpha;
        cx.beginPath();
        cx.arc(x, y, ringRadius, 0, Math.PI * 2);
        cx.fill();
        cx.globalAlpha = strokeAlpha;
        cx.lineWidth = 1.5;
        cx.beginPath();
        cx.arc(x, y, ringRadius, 0, Math.PI * 2);
        cx.stroke();
        cx.globalAlpha = 1;
        cx.beginPath();
        cx.arc(x, y, 3, 0, Math.PI * 2);
        cx.fill();
      }}
    />
  );
}

/**
 * A watchlist row: code and name, today's sparkline, the price and its change, plain text on a flat
 * row. In the desktop layout the row shown beside the list is `active`, and the others light up
 * under the pointer.
 */
function StockRow(props: {
  stock: Stock;
  first: boolean;
  onPress: () => void;
  wide?: boolean;
  active?: boolean;
}) {
  const q = () => props.stock.quote();
  const change = () => percent(q());
  return (
    <View
      onPress={props.onPress}
      role="button"
      activeStyle={{ backgroundColor: colors.card }}
      hoverStyle={props.wide && !props.active ? { backgroundColor: colors.card } : undefined}
      accessibilityLabel={props.stock.name}
      accessibilityState={props.wide ? { selected: !!props.active } : undefined}
      style={{
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        cursor: props.wide ? "pointer" : undefined,
        backgroundColor: props.active ? token("accent") : undefined,
      }}
    >
      <If when={props.active}>
        <View
          style={{
            position: "absolute",
            top: 14,
            bottom: 14,
            left: 0,
            width: 3,
            backgroundColor: colors.brand,
            borderRadius: 1.5,
          }}
        />
      </If>
      <If when={!props.first}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 16,
            right: 0,
            height: 1,
            backgroundColor: colors.line,
          }}
        />
      </If>
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{ numberOfLines: 1, fontSize: 16, fontWeight: "600", color: colors.foreground }}
        >
          {props.stock.code}
        </Text>
        <Text style={{ numberOfLines: 1, fontSize: 13, color: colors.mutedForeground }}>
          {props.stock.name}
        </Text>
      </View>
      <Sparkline stock={props.stock} />
      <View style={{ width: 84, alignItems: "flex-end", gap: 3 }}>
        <Text
          style={{
            numberOfLines: 1,
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {price(q().last, props.stock)}
        </Text>
        <Text
          style={{
            numberOfLines: 1,
            fontSize: 13,
            fontWeight: "500",
            color: toneOf(change()),
            fontVariant: ["tabular-nums"],
          }}
        >
          {signed(change())}%
        </Text>
      </View>
    </View>
  );
}

/** A watchlist row in the terminal, on one row: code, name, price and change in columns. */
function TerminalStockRow(props: {
  stock: Stock;
  onPress: () => void;
  wide?: boolean;
  active?: boolean;
}) {
  const q = () => props.stock.quote();
  const change = () => percent(q());
  return (
    <View
      onPress={props.onPress}
      role="button"
      accessibilityLabel={props.stock.name}
      accessibilityState={props.wide ? { selected: !!props.active } : undefined}
      style={{
        height: TERMINAL_ROW,
        flexDirection: "row",
        alignItems: "center",
        gap: TERMINAL_GAP,
        paddingHorizontal: TERMINAL_COLUMN,
      }}
    >
      <Text
        style={{
          numberOfLines: 1,
          width: 4 * TERMINAL_COLUMN,
          fontSize: 16,
          fontWeight: "600",
          color: colors.foreground,
        }}
      >
        {props.stock.code}
      </Text>
      <Text style={{ numberOfLines: 1, flex: 1, fontSize: 13, color: colors.mutedForeground }}>
        {props.stock.name}
      </Text>
      <Text
        style={{
          numberOfLines: 1,
          width: 9 * TERMINAL_COLUMN,
          textAlign: "right",
          fontSize: 16,
          fontWeight: "600",
          color: colors.foreground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {price(q().last, props.stock)}
      </Text>
      <Text
        style={{
          numberOfLines: 1,
          width: 7 * TERMINAL_COLUMN,
          textAlign: "right",
          fontSize: 13,
          fontWeight: "500",
          color: toneOf(change()),
          fontVariant: ["tabular-nums"],
        }}
      >
        {signed(change())}%
      </Text>
    </View>
  );
}

/** The most the watchlist takes beside the stock in the desktop layout. */
const WATCHLIST = 380;
/** The least it takes: a row's name has room beside its code, its sparkline and its price. */
const WATCHLIST_MIN = 300;
/** The least the stock beside it keeps: with less, the list is the page and a stock is opened over it. */
const STOCK_MIN = 380;

/**
 * The watchlist: quotes that change every 50 ms under a one-line market strip; sorted filters
 * re-sort once a second with a layout animation. A stock opens its details, over the list, or beside
 * it when the pane has room for both; leaving the demo stops the market.
 */
export function StocksDemo() {
  // The showcase's pane is 768 at a 1024 window: a fixed 380 leaves the stock 388, and 0.47 of the
  // pane keeps the row's name whole there while the stock keeps enough for its two columns.
  const list = computed(() =>
    Math.max(WATCHLIST_MIN, Math.min(WATCHLIST, Math.round(paneWidth() * 0.47))),
  );
  const wide = computed(() => desktop() && paneWidth() - list() >= STOCK_MIN);
  const market = createMarket();
  market.start();
  cleanup(() => market.stop());
  const stocks = market.stocks;
  const filter = signal<Filter>("all");
  const ordered = (f: Filter) => {
    const change = (s: Stock) => percent(s.quote());
    if (f === "all") return stocks;
    if (f === "gainers")
      return stocks.filter((s) => change(s) > 0).sort((a, b) => change(b) - change(a));
    if (f === "losers")
      return stocks.filter((s) => change(s) < 0).sort((a, b) => change(a) - change(b));
    return [...stocks].sort((a, b) => b.quote().turnover - a.quote().turnover).slice(0, 10);
  };
  const rows = signal<Stock[]>(stocks);
  effect(() => {
    const f = filter();
    market.pulse();
    untracked(() => {
      const next = ordered(f);
      const now = rows();
      if (next.length === now.length && next.every((s, i) => s === now[i])) return;
      LayoutAnimation.configureNext(relayout);
      rows.set(next);
    });
  });
  const counts = computed(() => {
    market.pulse();
    let up = 0;
    let down = 0;
    for (const c of untracked(() => stocks.map((m) => percent(m.quote())))) {
      if (c > 0) up++;
      else if (c < 0) down++;
    }
    return { up, down };
  });
  const stats = () => market.stats();
  // Desktop: the stock beside the list.
  const shown = signal<Stock>(stocks[0]);
  // A stock opened over the list (a phone, or a pane without the room for both).
  const opened = signal<Stock | null>(null);
  const watchlist = () => (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MarketStrip market={market} />
      <View
        style={
          terminal
            ? { paddingHorizontal: TERMINAL_COLUMN, paddingBottom: TERMINAL_ROW }
            : { paddingHorizontal: 16, paddingBottom: 6 }
        }
      >
        <Segmented value={filter()} onValueChange={(f) => filter.set(f as Filter)}>
          <SegmentedList size="sm">
            <SegmentedItem value="all" count={stocks.length}>
              All
            </SegmentedItem>
            <SegmentedItem value="gainers" count={counts().up}>
              Gainers
            </SegmentedItem>
            <SegmentedItem value="losers" count={counts().down}>
              Losers
            </SegmentedItem>
            <SegmentedItem value="active">Active</SegmentedItem>
          </SegmentedList>
        </Segmented>
      </View>
      <Scroll style={{ flex: 1 }}>
        <View>
          <Each of={rows()}>
            {(stock, i) =>
              terminal ? (
                <TerminalStockRow
                  stock={stock()}
                  onPress={() => (wide() ? shown.set(stock()) : opened.set(stock()))}
                  wide={wide()}
                  active={wide() && shown() === stock()}
                />
              ) : (
                <StockRow
                  stock={stock()}
                  first={i() === 0}
                  onPress={() => (wide() ? shown.set(stock()) : opened.set(stock()))}
                  wide={wide()}
                  active={wide() && shown() === stock()}
                />
              )
            }
          </Each>
          <If when={!rows().length}>
            <Text
              style={{
                paddingVertical: 32,
                textAlign: "center",
                fontSize: 14,
                color: colors.mutedForeground,
              }}
            >
              Nothing here right now
            </Text>
          </If>
        </View>
        <Text
          style={{
            paddingHorizontal: terminal ? TERMINAL_COLUMN : 16,
            paddingTop: 16,
            paddingBottom: terminal ? TERMINAL_ROW : 40,
            fontSize: 12,
            lineHeight: 17,
            color: colors.faint,
            fontVariant: ["tabular-nums"],
          }}
        >
          Simulated, fictional companies · tick 50 ms · {stats().ms.toFixed(2)} ms JS/tick ·{" "}
          {stats().updates} quotes/s
        </Text>
      </Scroll>
    </View>
  );
  // The book and the tape go beside the chart when the stock has the room.
  const split = computed(() => paneWidth() - list() >= 860);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <If
        when={wide()}
        else={
          <If when={opened() !== null} else={watchlist()}>
            <StockView market={market} stock={opened()!} back={() => opened.set(null)} />
          </If>
        }
      >
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ width: list(), borderRightWidth: 1, borderRightColor: colors.line }}>
            {watchlist()}
          </View>
          <View style={{ flex: 1 }}>
            {/* A component runs once: the one stock is an `Each` item, so picking another one
                makes the pane anew instead of leaving it on the first. */}
            <Each of={[shown()]} key={(stock) => stock.code}>
              {(stock) => <StockView market={market} stock={stock()} wide={true} split={split} />}
            </Each>
          </View>
        </View>
      </If>
    </View>
  );
}
