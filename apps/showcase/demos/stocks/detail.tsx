import {
  colors,
  finish,
  focusRing,
  TERMINAL_COLUMN,
  TERMINAL_GAP,
  TERMINAL_ROW,
  terminal,
} from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp, ChevronLeft, Pause, Play } from "lucide";
// A stock, opened: the quote, the chart with its ranges, and the book, the tape, the flow beside it
// — all live, with Buy / Sell raising the order ticket. Ported from `stocks/Detail.tsx`.
import {
  Canvas,
  cleanup,
  computed,
  createAnimatedValue,
  effect,
  safeAreaInsets,
  Scroll,
  signal,
  Text,
  type TextStyle,
  untracked,
  View,
} from "nsh";

import { Button } from "@/packages/ui/button";
import { Dialog, DialogContent } from "@/packages/ui/dialog";
import { Icon } from "@/packages/ui/lib/icons";
import { pressSink } from "@/packages/ui/lib/press";
import { Pressable } from "@/packages/ui/pressable";
import { Sheet, SheetContent } from "@/packages/ui/sheet";
import { Stat } from "@/packages/ui/stat";

import { Depth, OrderBook } from "./book";
import { Chart } from "./chart";
import {
  compact,
  type Market,
  percent,
  price,
  sectors,
  type Stock,
  signed,
  time,
  toneOf,
} from "./market";
import { Block, Head, LiveDot } from "./parts";
import { Flow, Tape } from "./tape";
import { createBanner, type Side, Ticket } from "./ticket";

/**
 * Where the last price sits in the day, in one line: the low–high span filled, the previous close
 * marked, the last price a knob that springs natively.
 */
function DayRange(props: { stock: Stock }) {
  const q = () => props.stock.quote();
  const x = createAnimatedValue(0);
  const width = signal(0);
  const placed = signal(false);
  const span = () => {
    const lo = Math.min(q().low, q().prevClose);
    const hi = Math.max(q().high, q().prevClose);
    return { lo, hi: hi > lo ? hi : lo + props.stock.tick };
  };
  const at = (v: number) => (v - span().lo) / (span().hi - span().lo);
  const place = () => {
    if (!width()) return;
    const to = at(q().last) * width();
    if (placed()) void x.spring(to, { stiffness: 220, damping: 24 });
    else x.set(to);
    placed.set(true);
  };
  effect(() => {
    q();
    untracked(place);
  });
  const p = (v: number) => price(v, props.stock);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}>
        L {p(q().low)}
      </Text>
      <View
        onLayout={({ bounds }) => {
          width.set(bounds.size.width);
          place();
        }}
        accessibilityLabel={`Day range ${p(q().low)} to ${p(q().high)}`}
        style={{ flex: 1, height: 16, justifyContent: "center" }}
      >
        <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.raised }} />
        <View
          style={{
            position: "absolute",
            left: `${at(q().low) * 100}%`,
            width: `${(at(q().high) - at(q().low)) * 100}%`,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: `${at(q().prevClose) * 100}%`,
            width: 2,
            height: 12,
            marginLeft: -1,
            borderRadius: 1,
            backgroundColor: colors.mutedForeground,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: -7,
            width: 14,
            height: 14,
            borderRadius: 7,
            borderWidth: 3,
            borderColor: colors.background,
            backgroundColor: toneOf(q().last - q().prevClose),
            translate: [x, 0],
          }}
        />
      </View>
      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}>
        H {p(q().high)}
      </Text>
    </View>
  );
}

/** The quote: a big figure in the day's tone, a direction arrow that turns natively, the day's range and figures. */
function Quote(props: { market: Market; stock: Stock }) {
  const q = () => props.stock.quote();
  const change = () => q().last - q().prevClose;
  const tone = () => toneOf(change());
  // The arrow turns over natively when the day flips.
  let down = change() < 0;
  const turn = createAnimatedValue(down ? 1 : 0);
  effect(() => {
    if (change() < 0 === down) return;
    down = !down;
    void turn.spring(down ? 1 : 0, { stiffness: 300, damping: 18 });
  });
  const p = (v: number) => price(v, props.stock);
  const year = computed(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const d of props.stock.days) {
      lo = Math.min(lo, d.l);
      hi = Math.max(hi, d.h);
    }
    return { lo, hi };
  });
  const sector = sectors.find((s) => s.id === props.stock.sector)!.label;
  // Four figures to a row; two in the terminal, where each takes one row.
  const width = terminal ? "50%" : "25%";
  return (
    <View
      style={
        terminal
          ? { paddingHorizontal: TERMINAL_COLUMN, paddingBottom: TERMINAL_ROW }
          : { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 10 }
      }
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: terminal ? TERMINAL_GAP : 8 }}
      >
        <Text style={{ numberOfLines: 1, flex: 1, fontSize: 15, color: colors.mutedForeground }}>
          {props.stock.name}
        </Text>
        <Text style={{ fontSize: 13, color: colors.faint }}>{sector}</Text>
        <If when={!terminal}>
          <LiveDot running={() => props.market.running()} size={6} />
        </If>
        <Text
          style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
        >
          {time(props.market.clock())}
        </Text>
      </View>
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: terminal ? TERMINAL_GAP : 6 }}
      >
        <Text
          style={{
            fontSize: 36,
            fontWeight: "600",
            letterSpacing: -1,
            color: tone(),
            fontVariant: ["tabular-nums"],
          }}
        >
          {p(q().last)}
        </Text>
        <If when={!terminal}>
          <View
            style={{
              rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }),
            }}
          >
            <Icon icon={down ? ArrowDown : ArrowUp} size={20} tint={tone()} />
          </View>
        </If>
        <View
          style={
            terminal
              ? { flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: TERMINAL_GAP }
              : { flex: 1, alignItems: "flex-end", gap: 1 }
          }
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
              color: tone(),
            }}
          >
            {signed(percent(q()))}%
          </Text>
          <Text style={{ fontSize: 12, fontVariant: ["tabular-nums"], color: tone() }}>
            {signed(change(), props.stock.tick < 0.01 ? 3 : 2)} today
          </Text>
        </View>
      </View>
      <If when={!terminal}>
        <DayRange stock={props.stock} />
      </If>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginTop: terminal ? TERMINAL_ROW : 0 }}
      >
        <Stat width={width} label="Open" value={p(q().open)} />
        <Stat width={width} label="Prev close" value={p(q().prevClose)} />
        <Stat width={width} label="Avg price" value={p(q().turnover / (q().volume || 1))} />
        <Stat
          width={width}
          label="Amplitude"
          value={`${(((q().high - q().low) / q().prevClose) * 100).toFixed(2)}%`}
        />
        <Stat width={width} label="Volume" value={compact(q().volume)} />
        <Stat width={width} label="Turnover" value={compact(q().turnover)} />
        <Stat width={width} label="120d high" value={p(year().hi)} />
        <Stat width={width} label="120d low" value={p(year().lo)} />
      </View>
    </View>
  );
}

const horizons = [5, 20, 60, 120];

/**
 * Ranges over 5 to 120 days as dumbbells (low → high), the last price a line across them and the
 * previous close dashed.
 */
function Ranges(props: { market: Market; stock: Stock }) {
  const rows = computed(() => {
    props.market.pulse();
    const q = untracked(() => props.stock.quote());
    return horizons.map((n) => {
      let lo = q.low;
      let hi = q.high;
      for (const d of props.stock.days.slice(-n)) {
        lo = Math.min(lo, d.l);
        hi = Math.max(hi, d.h);
      }
      return { n, lo, hi };
    });
  });
  const last = () => props.stock.quote().last;
  // The terminal's table: today's range first, then the horizons'.
  if (terminal) {
    const table = computed(() => {
      const q = untracked(() => props.stock.quote());
      return [
        { label: "Today", lo: q.low, hi: q.high },
        ...rows().map((row) => ({ label: `${row.n}d`, lo: row.lo, hi: row.hi })),
      ];
    });
    const column: TextStyle = {
      width: 10 * TERMINAL_COLUMN,
      textAlign: "right",
      fontSize: 13,
      fontVariant: ["tabular-nums"],
    };
    return (
      <Block title="Ranges" note={`low → high · last ${price(last(), props.stock)}`}>
        <View style={{ flexDirection: "row", gap: TERMINAL_GAP }}>
          <Head label="DAYS" width={5 * TERMINAL_COLUMN} />
          <Head label="LOW" width={10 * TERMINAL_COLUMN} align="right" />
          <Head label="HIGH" width={10 * TERMINAL_COLUMN} align="right" />
        </View>
        <Each of={table()}>
          {(row) => (
            <View style={{ height: TERMINAL_ROW, flexDirection: "row", gap: TERMINAL_GAP }}>
              <Text
                style={{ width: 5 * TERMINAL_COLUMN, fontSize: 13, color: colors.mutedForeground }}
              >
                {row().label}
              </Text>
              <Text style={[column, { color: colors.destructive }]}>
                {price(row().lo, props.stock)}
              </Text>
              <Text style={[column, { color: colors.up }]}>{price(row().hi, props.stock)}</Text>
            </View>
          )}
        </Each>
      </Block>
    );
  }
  return (
    <Block title="Ranges" note="low → high · 5 to 120 days">
      <Canvas
        style={{ height: horizons.length * 34 + 16 }}
        accessibilityLabel="Price ranges"
        draw={(cx, { width }) => {
          const r = rows();
          const q = untracked(() => props.stock.quote());
          const lo = Math.min(...r.map((x) => x.lo));
          const hi = Math.max(...r.map((x) => x.hi));
          const left = 40;
          const right = 6;
          const X = (v: number) => left + ((v - lo) / (hi - lo || 1)) * (width - left - right);
          cx.font = "11px system-ui";
          cx.textBaseline = "middle";
          r.forEach((row, i) => {
            const y = 10 + i * 34;
            cx.fillStyle = colors.mutedForeground;
            cx.textAlign = "left";
            cx.fillText(`${row.n}d`, 0, y);
            cx.strokeStyle = colors.border;
            cx.lineWidth = 3;
            cx.lineCap = "round";
            cx.beginPath();
            cx.moveTo(X(row.lo), y);
            cx.lineTo(X(row.hi), y);
            cx.stroke();
            for (const [v, c] of [
              [row.lo, colors.destructive],
              [row.hi, colors.up],
            ] as const) {
              cx.fillStyle = c;
              cx.beginPath();
              cx.arc(X(v), y, 4.5, 0, Math.PI * 2);
              cx.fill();
            }
            cx.fillStyle = colors.faint;
            cx.textAlign = "left";
            cx.fillText(price(row.lo, props.stock), X(row.lo) - 4, y + 13);
            cx.textAlign = "right";
            cx.fillText(price(row.hi, props.stock), X(row.hi) + 4, y + 13);
          });
          const bottom = horizons.length * 34;
          cx.strokeStyle = colors.faint;
          cx.lineWidth = 1;
          cx.setLineDash([3, 4]);
          cx.beginPath();
          cx.moveTo(X(q.prevClose), 0);
          cx.lineTo(X(q.prevClose), bottom);
          cx.stroke();
          cx.setLineDash([]);
          cx.strokeStyle = colors.brand;
          cx.lineWidth = 2;
          cx.beginPath();
          cx.moveTo(X(q.last), 0);
          cx.lineTo(X(q.last), bottom);
          cx.stroke();
          cx.fillStyle = colors.brand;
          cx.textAlign = "center";
          cx.fillText(
            `last ${price(q.last, props.stock)}`,
            Math.max(left + 30, Math.min(width - 40, X(q.last))),
            bottom + 8,
          );
        }}
      />
    </Block>
  );
}

/** Pauses and resumes the market. */
function PauseButton(props: { market: Market }) {
  const pause = () => (props.market.running() ? props.market.stop() : props.market.start());
  const label = () => (props.market.running() ? "Pause the market" : "Resume the market");
  if (terminal) {
    return (
      <Button accessibilityLabel={label()} variant="secondary" onPress={pause}>
        {props.market.running() ? "Pause" : "Resume"}
      </Button>
    );
  }
  return (
    <View
      onPress={pause}
      role="button"
      hitSlop={6}
      accessibilityLabel={label()}
      hoverStyle={props.market.running() ? finish.hover : { opacity: 0.94 }}
      activeStyle={pressSink(0.97).activeStyle}
      focusVisibleStyle={focusRing()}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...(props.market.running() ? finish.pill : finish.accent),
      }}
    >
      <Icon
        icon={props.market.running() ? Pause : Play}
        size={13}
        tint={props.market.running() ? colors.mutedForeground : colors.onBrand}
      />
    </View>
  );
}

/**
 * A stock: quote and chart on the first screen, then the book, depth, the tape, the flow and the
 * ranges, all live. Buy / Sell at the bottom raise the order ticket — a sheet on phones, a card in
 * the middle of the window on desktops. `wide` (the desktop layout, beside the watchlist, whose
 * strip has the pause button) heads it with the code, draws the chart taller and, while `split`
 * holds, puts the book, the tape, depth and flow in a column right of the quote, chart and ranges.
 * `back` draws the way out of a stock opened over the watchlist.
 */
export function StockView(props: {
  market: Market;
  stock: Stock;
  wide?: boolean;
  split?: () => boolean;
  back?: () => void;
}) {
  const market = props.market;
  const stock = props.stock;
  market.focus(stock);
  cleanup(() => market.focus(null));
  const side = signal<Side>("buy");
  const ticket = signal(false);
  const banner = createBanner();
  const insets = safeAreaInsets();
  const trade = (s: Side) => {
    side.set(s);
    ticket.set(true);
  };
  const stats = () => market.stats();
  const footer = (
    <Text
      style={{
        paddingHorizontal: terminal ? TERMINAL_COLUMN : 16,
        paddingTop: terminal ? 0 : 8,
        // Room for the trade bar over the content (a terminal's is below it).
        paddingBottom: terminal ? 0 : 96 + insets().bottom,
        fontSize: 12,
        color: colors.faint,
        fontVariant: ["tabular-nums"],
      }}
    >
      simulated · {stats().ms.toFixed(2)} ms JS/tick · {stats().updates} quotes/s
    </Text>
  );
  const split = () => props.split?.() ?? false;
  const ticketView = (
    <Ticket
      open={ticket}
      stock={stock}
      side={side}
      onSide={(s) => side.set(s)}
      onPlaced={(title, detail, s) => {
        ticket.set(false);
        banner.show(title, detail, s);
      }}
    />
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* A stock opened over the watchlist: the way back, its code, and the pause the strip held. */}
      <If when={props.back !== undefined}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 12,
            height: 40,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
          }}
        >
          <Pressable
            onPress={() => props.back?.()}
            accessibilityLabel="Back to the watchlist"
            hitSlop={8}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6 }}
          >
            <Icon icon={ChevronLeft} size={16} tint={colors.mutedForeground} />
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Watchlist</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <PauseButton market={market} />
        </View>
      </If>
      <If
        when={props.wide}
        else={
          <Scroll style={{ flex: 1 }}>
            <Text
              style={{
                paddingHorizontal: 16,
                paddingTop: 14,
                fontSize: 22,
                fontWeight: "700",
                letterSpacing: -0.3,
                color: colors.foreground,
              }}
            >
              {stock.code}
            </Text>
            <Quote market={market} stock={stock} />
            <If when={!terminal}>
              <Block>
                <Chart stock={stock} />
              </Block>
            </If>
            <OrderBook market={market} stock={stock} />
            <Tape market={market} stock={stock} />
            <Depth market={market} stock={stock} />
            <Flow market={market} />
            <Ranges market={market} stock={stock} />
            {footer}
          </Scroll>
        }
      >
        <Scroll style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: terminal ? TERMINAL_COLUMN : 16,
              paddingTop: terminal ? 0 : 14,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 22,
                fontWeight: "700",
                letterSpacing: -0.3,
                color: colors.foreground,
              }}
            >
              {stock.code}
            </Text>
            <PauseButton market={market} />
          </View>
          <View
            style={{
              flexDirection: split() ? "row" : "column",
              alignItems: split() ? "flex-start" : "stretch",
            }}
          >
            <View style={{ flex: split() ? 1 : undefined, minWidth: 0 }}>
              <Quote market={market} stock={stock} />
              <If when={!terminal}>
                <Block>
                  <Chart stock={stock} height={340} />
                </Block>
              </If>
              <Ranges market={market} stock={stock} />
            </View>
            <View
              style={{
                width: split() ? 380 : undefined,
                borderLeftWidth: split() ? 1 : 0,
                borderLeftColor: colors.line,
              }}
            >
              <OrderBook market={market} stock={stock} />
              <Tape market={market} stock={stock} />
              <Depth market={market} stock={stock} />
              <Flow market={market} />
            </View>
          </View>
          {/* Beside the watchlist, a terminal shows the figures once, under the watchlist's own line. */}
          <If when={!terminal}>{footer}</If>
        </Scroll>
      </If>
      {/* The trade bar, over the content; below it in a terminal, which draws nothing through it. */}
      <View
        style={{
          position: terminal ? "relative" : "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: terminal ? TERMINAL_GAP : 10,
          paddingHorizontal: terminal ? TERMINAL_COLUMN : 16,
          paddingTop: terminal ? TERMINAL_ROW - 1 : 10,
          paddingBottom: terminal ? 0 : 10 + insets().bottom,
          ...(terminal ? { backgroundColor: colors.background } : finish.glass),
          borderTopWidth: 1,
          borderTopColor: terminal ? colors.line : finish.glass.borderColor,
        }}
      >
        <View
          style={terminal ? { flexDirection: "row", gap: TERMINAL_GAP } : { width: 92, gap: 1 }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: colors.foreground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {price(stock.quote().last, stock)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontVariant: ["tabular-nums"],
              color: toneOf(percent(stock.quote())),
            }}
          >
            {signed(percent(stock.quote()))}%
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" onPress={() => trade("sell")}>
            Sell
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button onPress={() => trade("buy")}>Buy</Button>
        </View>
      </View>
      {banner.view}
      {/* The ticket: a bottom sheet on phones, a dialog card in the middle of the window on
          desktops (Escape or a click outside closes it). The card's body scrolls under its height
          cap; the sheet scrolls its own, so the whole ticket shows on a short window too. */}
      <If
        when={props.wide}
        else={
          <Sheet open={ticket()} onOpenChange={({ open }) => ticket.set(open)}>
            <SheetContent side="bottom">
              <Scroll style={{ flexGrow: 1, flexShrink: 1 }}>{ticketView}</Scroll>
            </SheetContent>
          </Sheet>
        }
      >
        <Dialog open={ticket()} onOpenChange={({ open }) => ticket.set(open)}>
          <DialogContent
            width={400}
            style={
              terminal
                ? { paddingVertical: TERMINAL_ROW - 1, paddingHorizontal: 2 * TERMINAL_COLUMN - 1 }
                : undefined
            }
          >
            {ticketView}
          </DialogContent>
        </Dialog>
      </If>
    </View>
  );
}
