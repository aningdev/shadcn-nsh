import { surface, alpha, colors, type Tone, toneColor, shape } from "@shadcn-nsh/theme";
// Scroll: the official gallery's Scrolling scene
// (`references/nsh/examples/gallery/demos/Scrolling.tsx`): paging with parallax, snapping cards,
// pinch zoom, the events and switches around a scroll view, NEW posts arriving on top, and taps
// with the keyboard up. `Scroll` and `List` are `nsh`'s primitives; the cards, buttons, input and
// meter come from this library.
import {
  Canvas,
  createAnimatedValue,
  List,
  platform,
  Scroll,
  type ScrollEvent,
  type ScrollRef,
  signal,
  Text,
  View,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";

import { Caption, DemoCard, DemoPage } from "../kit";
import { Api, Choice, Figure, Meter, SwitchRow } from "./primitives-shared";

const desk = platform.desktop;

const tones: Tone[] = ["accent", "info", "warning", "success", "destructive"];

/** A soft wave along a page's lower part, its fill fading downward: a page's backdrop. */
function Backdrop(props: { tone: Tone; seed: number }) {
  return (
    <Canvas
      style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      draw={(cx, { width, height }) => {
        const color = toneColor(props.tone);
        const points: [number, number][] = [];
        for (let i = 0; i <= 24; i++) {
          const x = (i / 24) * width;
          const y =
            height *
            (0.74 -
              0.11 * Math.sin(i * 0.5 + props.seed) -
              0.035 * Math.sin(i * 1.3 + props.seed * 2));
          points.push([x, y]);
        }
        const wave = () => {
          cx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length - 1; i++) {
            cx.quadraticCurveTo(
              points[i][0],
              points[i][1],
              (points[i][0] + points[i + 1][0]) / 2,
              (points[i][1] + points[i + 1][1]) / 2,
            );
          }
          cx.lineTo(points[24][0], points[24][1]);
        };
        cx.beginPath();
        wave();
        cx.lineTo(width, height);
        cx.lineTo(0, height);
        cx.closePath();
        const fade = cx.createLinearGradient(0, height * 0.55, 0, height);
        fade.addColorStop(0, alpha(color, 0.26));
        fade.addColorStop(1, alpha(color, 0));
        cx.fillStyle = fade;
        cx.fill();
        cx.beginPath();
        wave();
        cx.strokeStyle = color;
        cx.lineWidth = 1.75;
        cx.lineJoin = "round";
        cx.stroke();
      }}
    />
  );
}

const pages = [
  { title: "Revenue", value: "48.2k", note: "+12 %", tone: "accent" },
  { title: "Sessions", value: "9,410", note: "+3 %", tone: "info" },
  { title: "Latency", value: "142", note: "ms p95", tone: "warning" },
  { title: "Uptime", value: "99.98", note: "%", tone: "success" },
  { title: "Errors", value: "17", note: "−40 %", tone: "destructive" },
] as const;

/** Full-width pages: one per fling; the indicator and the parallax follow the offset natively. */
function Pager() {
  // Pages as wide as the scroll view; the measured width replaces the estimate.
  const width = signal(318);
  const page = signal(0);
  const x = createAnimatedValue(0);
  const step = 16;
  return (
    <View style={{ gap: 12 }}>
      <Scroll
        horizontal
        pagingEnabled
        scrollbar={false}
        scrollValue={x}
        onLayout={({ bounds }) => width.set(bounds.size.width)}
        style={{
          height: 160,
          ...circle(shape.control),
          backgroundColor: colors.card,
          ...surface("card").style,
          borderWidth: 1,
          borderColor: colors.line,
        }}
        onMomentumEnd={({ offset }) => page.set(Math.round(offset.x / width()))}
        onScrollEnd={({ offset }) => page.set(Math.round(offset.x / width()))}
      >
        <View style={{ flexDirection: "row" }}>
          <Each of={pages}>
            {(p, i) => {
              // Read inside the styles, so they follow the width once it is measured.
              const range = () => [(i() - 1) * width(), i() * width(), (i() + 1) * width()];
              return (
                <View style={{ width: width(), height: 160, overflow: "hidden" }}>
                  <Backdrop tone={p().tone} seed={i() * 1.7} />
                  <View
                    style={{
                      padding: 16,
                      gap: 4,
                      // The text lags behind the page and fades at the edges.
                      opacity: x.interpolate({
                        inputRange: range(),
                        outputRange: [0.1, 1, 0.1],
                      }),
                      translate: [
                        x.interpolate({
                          inputRange: range(),
                          outputRange: [-width() * 0.35, 0, width() * 0.35],
                        }),
                        0,
                      ],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.mutedForeground,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {p().title} · {i() + 1} of {pages.length}
                    </Text>
                    <Figure value={p().value} note={p().note} tone={p().tone} />
                  </View>
                </View>
              );
            }}
          </Each>
        </View>
      </Scroll>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: step - 8 }}>
          <Each of={pages}>
            {() => (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.border,
                }}
              />
            )}
          </Each>
          <View
            style={{
              position: "absolute",
              left: 0,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.brand,
              translate: [
                x.interpolate({
                  inputRange: [0, (pages.length - 1) * width()],
                  outputRange: [0, (pages.length - 1) * step],
                }),
                0,
              ],
            }}
          />
        </View>
        <Text
          style={{
            flex: 1,
            textAlign: "right",
            fontSize: 13,
            color: colors.faint,
            fontVariant: ["tabular-nums"],
          }}
        >
          Settled on page {page() + 1}
        </Text>
      </View>
    </View>
  );
}

/** `rounded` without importing a helper here. */
function circle(r: number) {
  return { borderRadius: r, borderCurve: "continuous" } as const;
}

/** Cards that snap; a fling can pass several unless limited to one. */
function Cards() {
  const card = 220;
  const gap = 12;
  const height = 128;
  const oneStep = signal(false);
  const align = signal<"start" | "center" | "end">("center");
  return (
    <View style={{ gap: 12 }}>
      <View style={{ marginHorizontal: -14 }}>
        <List
          each={Array.from({ length: 20 }, (_, i) => i)}
          horizontal
          estimatedItemSize={card + gap}
          snapToInterval={card + gap}
          snapToAlignment={align()}
          decelerationRate="fast"
          disableIntervalMomentum={oneStep()}
          scrollbar={false}
          style={{ height }}
          contentStyle={{ gap, paddingHorizontal: 14 }}
        >
          {(i) => {
            const tone = () => tones[i() % tones.length];
            return (
              <View
                style={{
                  width: card,
                  height,
                  ...circle(shape.control + 4),
                  backgroundColor: colors.surface,
                  backgroundImage: `linear-gradient(145deg, ${alpha(toneColor(tone()), 0.2)} 0%, ${alpha(toneColor(tone()), 0)} 62%)`,
                  ...surface("raised").style,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                  justifyContent: "space-between",
                  overflow: "hidden",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: toneColor(tone()),
                    }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: colors.mutedForeground,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    at {i() * (card + gap)} pt
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "600",
                    color: colors.foreground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  Card {i() + 1}
                </Text>
              </View>
            );
          }}
        </List>
      </View>
      <Choice
        options={["start", "center", "end"] as const}
        value={align()}
        onChange={(v) => align.set(v)}
      />
      <SwitchRow
        label="One card per fling"
        code="disableIntervalMomentum"
        value={oneStep()}
        onChange={(v) => oneStep.set(v)}
      />
    </View>
  );
}

type Logged = { name: string; y: number; tone: Tone };

/** onScroll (throttled), drag and momentum events, scrollable, bounces, contentInset. */
function Events() {
  const offset = signal<ScrollEvent | null>(null);
  const log = signal<Logged[]>([]);
  const enabled = signal(true);
  const bounces = signal(true);
  const inset = signal(false);
  const throttle = signal<"0" | "100" | "500">("100");
  const note = (name: string, tone: Tone) => (event: { offset: { y: number } }) =>
    log.update((l) => [{ name, y: Math.round(event.offset.y), tone }, ...l].slice(0, 5));
  const progress = () => {
    const o = offset();
    return o && o.contentSize.height > o.size.height
      ? o.offset.y / (o.contentSize.height - o.size.height)
      : 0;
  };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <View style={{ flex: 1 }}>
          <Figure
            value={offset() ? String(Math.round(offset()!.offset.y)) : "0"}
            unit="pt"
            note={offset() ? `/ ${Math.round(offset()!.contentSize.height)}` : "Scroll the box"}
            tone="info"
          />
        </View>
        <Text
          style={{
            fontSize: 13,
            color: colors.faint,
            fontVariant: ["tabular-nums"],
            paddingBottom: 6,
          }}
        >
          viewport {offset() ? Math.round(offset()!.size.height) : "—"} pt
        </Text>
      </View>
      <Meter value={progress()} tone="info" />
      <Scroll
        style={{
          height: 180,
          ...circle(shape.control),
          backgroundColor: colors.card,
          ...surface("card").style,
          borderWidth: 1,
          borderColor: colors.line,
        }}
        scrollable={enabled()}
        bounces={bounces()}
        contentInset={inset() ? { top: 40, bottom: 40 } : undefined}
        scrollEventThrottle={Number(throttle())}
        onScroll={(v) => offset.set(v)}
        onScrollDragStart={note("begin drag", "accent")}
        onScrollDragEnd={note("end drag", "warning")}
        onMomentumStart={note("momentum begin", "info")}
        onMomentumEnd={note("momentum end", "success")}
      >
        <View style={{ paddingVertical: 6 }}>
          <Each of={Array.from({ length: 30 }, (_, i) => i + 1)}>
            {(i) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  height: 32,
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    width: 24,
                    fontSize: 12,
                    color: colors.faint,
                    fontVariant: ["tabular-nums"],
                    textAlign: "right",
                  }}
                >
                  {i()}
                </Text>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${20 + ((i() * 37) % 70)}%`,
                    backgroundColor: colors.border,
                  }}
                />
              </View>
            )}
          </Each>
        </View>
      </Scroll>
      <View style={{ gap: 6, minHeight: 5 * 20 }}>
        <If
          when={log().length > 0}
          else={<Text style={{ fontSize: 13, color: colors.faint }}>No drags yet</Text>}
        >
          <Each of={log()}>
            {(entry, i) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  height: 20,
                  opacity: 1 - i() * 0.16,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2.5,
                    backgroundColor: toneColor(entry().tone),
                  }}
                />
                <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>
                  {entry().name}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.faint,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  at {entry().y} pt
                </Text>
              </View>
            )}
          </Each>
        </If>
      </View>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Caption>Scroll events at most every</Caption>
          <Caption>ms</Caption>
        </View>
        <Choice
          options={["0", "100", "500"] as const}
          value={throttle()}
          onChange={(v) => throttle.set(v)}
        />
      </View>
      <View>
        <SwitchRow
          label="Scroll enabled"
          code="scrollable"
          value={enabled()}
          onChange={(v) => enabled.set(v)}
        />
        <SwitchRow
          label="Bounces"
          code="bounces"
          value={bounces()}
          onChange={(v) => bounces.set(v)}
        />
        <SwitchRow
          label="Content inset"
          note="40 pt at the top and bottom"
          value={inset()}
          onChange={(v) => inset.set(v)}
        />
      </View>
    </View>
  );
}

/** Pinch to zoom (natively); tap a tile to zoom in on it. */
function Zoom() {
  const scroll = signal<ScrollRef | null>(null);
  const scale = signal(1);
  const bounces = signal(true);
  const tiles = Array.from({ length: 24 }, (_, i) => i);
  // Tiles fill the box: six to a row where they fit, four on a phone.
  const box = signal(318);
  const columns = () => (box() >= 420 ? 6 : 4);
  const tileWidth = () => Math.floor((box() - 14 - 6 * (columns() - 1)) / columns());
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <View style={{ flex: 1 }}>
          <Figure
            value={scale().toFixed(2)}
            unit="×"
            note={scale() > 1.01 ? "zoomed in" : scale() < 0.99 ? "zoomed out" : "fit"}
            tone={scale() > 1.01 ? "accent" : "info"}
          />
        </View>
        <Text
          style={{
            fontSize: 13,
            color: colors.faint,
            fontVariant: ["tabular-nums"],
            paddingBottom: 6,
          }}
        >
          0.5× to 5×
        </Text>
      </View>
      <Scroll
        ref={(node) => scroll.set(node)}
        style={{
          height: 240,
          ...circle(shape.control),
          backgroundColor: colors.card,
          ...surface("card").style,
          borderWidth: 1,
          borderColor: colors.line,
        }}
        minimumZoomScale={0.5}
        maximumZoomScale={5}
        bouncesZoom={bounces()}
        centerContent
        scrollEventThrottle={50}
        onLayout={({ bounds }) => box.set(bounds.size.width)}
        onScroll={(e) => scale.set(e.zoomScale)}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 6, gap: 6 }}>
          <Each of={tiles}>
            {(tile) => {
              const i = tile();
              // One hue in steps, as a heat map, so the zoom has one thing to read.
              const heat = 0.5 + 0.5 * Math.sin(i * 1.9 + Math.cos(i * 0.7) * 2);
              return (
                <View
                  style={{
                    width: tileWidth(),
                    height: 50,
                    ...circle(8),
                    backgroundColor: alpha(colors.brand, 0.05 + 0.24 * heat),
                    padding: 8,
                    justifyContent: "flex-end",
                  }}
                  onPress={() => {
                    // The tile's middle, in the content's (unzoomed) points.
                    const x = 6 + (i % columns()) * (tileWidth() + 6) + tileWidth() / 2;
                    const y = 6 + Math.floor(i / columns()) * 56 + 25;
                    scroll()?.zoomTo({ scale: scale() < 2.5 ? 3 : 1, x, y });
                  }}
                >
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 11,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    Tile {i + 1}
                  </Text>
                </View>
              );
            }}
          </Each>
        </View>
      </Scroll>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" onPress={() => scroll()?.zoomTo({ scale: 0.5 })}>
            0.5×
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" onPress={() => scroll()?.zoomTo({ scale: 1 })}>
            1×
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" onPress={() => scroll()?.zoomTo({ scale: 2 })}>
            2×
          </Button>
        </View>
      </View>
      <SwitchRow
        label="Bounces past the limits"
        code="bouncesZoom"
        value={bounces()}
        onChange={(v) => bounces.set(v)}
      />
    </View>
  );
}

type Post = { id: number; label: string; fresh: boolean; tone: Tone };

/** New items arrive at the top; the rows on screen stay where they are. */
function Feed() {
  const post = (id: number, label: string, fresh: boolean): Post => ({
    id,
    label,
    fresh,
    tone: tones[id % tones.length],
  });
  const posts = signal(Array.from({ length: 30 }, (_, i) => post(i, `Post ${i + 1}`, false)));
  const fresh = signal(0);
  const addOnTop = () => {
    const first = fresh() + 1;
    fresh.set(first + 2);
    posts.update((p) => [
      ...[0, 1, 2].map((k) => post(-(first + k), `New ${first + k}`, true)),
      ...p,
    ]);
  };
  return (
    <View style={{ gap: 12 }}>
      <List
        each={posts()}
        estimatedItemSize={48}
        style={{
          height: 240,
          ...circle(shape.control),
          backgroundColor: colors.card,
          ...surface("card").style,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        {(p) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              height: 48,
              paddingHorizontal: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.line,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: p().fresh ? colors.brand : colors.surface,
              }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: p().fresh ? colors.foreground : colors.mutedForeground,
              }}
            >
              {p().label}
            </Text>
            <If
              when={p().fresh}
              else={
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.faint,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  #{p().id}
                </Text>
              }
            >
              <Badge tone="accent">new</Badge>
            </If>
          </View>
        )}
      </List>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Caption>Scroll down a little, then add</Caption>
        <Caption>{`${posts().length} posts`}</Caption>
      </View>
      <Button variant="secondary" onPress={addOnTop}>
        Add 3 posts on top
      </Button>
    </View>
  );
}

type Taps = "never" | "handled" | "always";

export function ScrollDemo() {
  const taps = signal<Taps>("never");
  const presses = signal(0);
  const explanation = () =>
    taps() === "never"
      ? "A tap outside the input only hides the keyboard; the button does not get it."
      : taps() === "handled"
        ? "The button gets the tap and the keyboard stays; a tap on empty space hides it."
        : "Taps never hide the keyboard.";
  return (
    <DemoPage title="Scroll">
      <DemoCard title="Paging" subtitle="5 pages">
        <Api names="pagingEnabled · scrollValue" />
        <Pager />
      </DemoCard>
      <DemoCard title="Snapping" subtitle="20 cards">
        <Api names="snapToInterval · snapToAlignment" />
        <Cards />
      </DemoCard>
      <DemoCard
        title="Zoom"
        subtitle={desk ? "Pinch on a touchpad or click a tile" : "Pinch or tap a tile"}
      >
        <Api names="maximumZoomScale · zoomTo()" />
        <Zoom />
      </DemoCard>
      <DemoCard title="Events and behavior" subtitle="What a scroll view reports">
        <Api names="onScroll · onScrollDragStart · onMomentumEnd" />
        <Events />
      </DemoCard>
      <DemoCard title="Prepending keeps the position" subtitle="Rows on screen stay put">
        <Api names="List · maintainVisibleContentPosition" />
        <Feed />
      </DemoCard>
      <DemoCard title="Taps with the keyboard up" subtitle="keyboardShouldPersistTaps">
        {/* The page's scroll is `kit`'s; this box is its own scroll view so the setting has one
            to apply to (the gallery sets it on its page). */}
        <Scroll keyboardShouldPersistTaps={taps()} style={{ height: 250 }} scrollbar={false}>
          <View style={{ gap: 12 }}>
            <Choice
              options={["never", "handled", "always"] as const}
              value={taps()}
              onChange={(v) => taps.set(v)}
            />
            <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 18 }}>
              {explanation()}
            </Text>
            <Input
              placeholder={
                desk ? "Type here, then click the button" : "Type here, then tap the button"
              }
            />
            <Button variant="secondary" onPress={() => presses.set(presses() + 1)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text
                  style={{ fontSize: desk ? 13 : 15, fontWeight: "600", color: colors.foreground }}
                >
                  {desk ? "Click me" : "Tap me"}
                </Text>
                <Text
                  style={{
                    fontSize: desk ? 13 : 15,
                    color: colors.faint,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {presses()}
                </Text>
              </View>
            </Button>
            {/* Room to scroll the input above a phone's keyboard. */}
            <If when={!desk}>
              <View style={{ height: 300 }} />
            </If>
          </View>
        </Scroll>
      </DemoCard>
    </DemoPage>
  );
}
