import { colors, finish, mono, type Tone, toneColor, toneTint, shape } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp, Plus } from "lucide";
// Lists: the official gallery's Lists scene (`references/nsh/examples/gallery/demos/Lists.tsx`)
// in five tabs — a grid of columns with viewability, sticky contact sections, a chat, two lists
// in one page, and horizontal lists with pull to refresh and an empty state. `List` is `nsh`'s;
// the buttons, badge, meter and input are this library's.
import {
  createAnimatedValue,
  LayoutAnimation,
  type ListRef,
  List,
  platform,
  Scroll,
  signal,
  Text,
  View,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button, RoundButton } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { REFRESH_INDICATOR_HEIGHT, RefreshIndicator } from "@/packages/ui/refresh-indicator";
import { Toggle } from "@/packages/ui/toggle";

import { Caption, DemoCard, DemoPage } from "../kit";
import { Api, Choice, Meter } from "./primitives-shared";

const desk = platform.desktop;

const tones: Tone[] = ["accent", "info", "warn", "up", "destructive"];

/** A small action for a list's header: a raised pill. */
function Action(props: { label: string; icon?: "down"; onPress: () => void }) {
  return (
    <Button
      variant="secondary"
      onPress={props.onPress}
      style={{ height: 36, borderRadius: 18, paddingHorizontal: 14 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <If when={props.icon === "down"}>
          <Icon icon={ArrowDown} size={14} tint={colors.foreground} />
        </If>
        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
          {props.label}
        </Text>
      </View>
    </Button>
  );
}

/** Three columns on a phone, as many as fit on a desktop (130 points each), a header, a footer. */
function Grid(props: { width: () => number }) {
  const items = Array.from({ length: 90 }, (_, i) => ({
    id: i,
    height: 84 + (i % 4) * 22,
    tone: tones[i % tones.length],
  }));
  const first = signal(-1);
  const last = signal(-1);
  const list = signal<ListRef | null>(null);
  // Changed in place when a resize fits more or fewer: the list keeps its scroll and its items.
  const columns = () => {
    const width = props.width();
    return desk && width > 0 ? Math.max(1, Math.floor((width + 10) / 140)) : 3;
  };
  return (
    <List
      ref={(node) => list.set(node)}
      each={items}
      numColumns={columns()}
      estimatedItemSize={110}
      style={{ flex: 1 }}
      contentStyle={desk ? { padding: 24, gap: 12 } : { padding: 16, gap: 8 }}
      viewabilityConfig={{ itemVisibleThreshold: 0.5 }}
      onViewableItemsChange={({ viewableItems }) => {
        first.set(viewableItems.length ? viewableItems[0].index : -1);
        last.set(viewableItems.length ? viewableItems[viewableItems.length - 1].index : -1);
      }}
      header={
        <View
          style={{
            backgroundColor: colors.card,
            ...finish.card,
            borderRadius: shape.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 12,
            marginBottom: 4,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Viewable items (at least half shown)
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "600",
                  color: colors.foreground,
                  fontVariant: ["tabular-nums"],
                  letterSpacing: -0.5,
                }}
              >
                {first() < 0 ? "—" : `${first()}–${last()}`}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "500", color: colors.brand }}>
                {first() < 0 ? "" : `${last() - first() + 1} visible`}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.faint }}>
              {`90 items, ${columns()} columns`}
            </Text>
          </View>
          <Meter value={last() < 0 ? 0 : (last() + 1) / items.length} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Action
              label="Jump to 60"
              icon="down"
              onPress={() => list()?.scrollToIndex({ index: 60, viewPosition: 0.5 })}
            />
            <Action label="End" onPress={() => list()?.scrollToEnd()} />
          </View>
        </View>
      }
      footer={
        <Text style={{ textAlign: "center", color: colors.faint, fontSize: 13, padding: 16 }}>
          End of the list
        </Text>
      }
    >
      {(item) => (
        <View
          style={{
            height: item().height,
            borderRadius: shape.inset,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: item().id === 60 ? toneColor("accent") : colors.border,
            backgroundColor: colors.raised,
            ...finish.raised,
            padding: 12,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: 18,
              height: 4,
              borderRadius: 2,
              backgroundColor: toneColor(item().tone),
            }}
          />
          <View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "600",
                color: colors.foreground,
                fontVariant: ["tabular-nums"],
              }}
            >
              {item().id}
            </Text>
            <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
              {item().height} pt
            </Text>
          </View>
        </View>
      )}
    </List>
  );
}

const people = [
  ["Ada", "Lovelace", "Analytical Engine notes"],
  ["Alan", "Kay", "Smalltalk"],
  ["Barbara", "Liskov", "CLU, substitution"],
  ["Brian", "Kernighan", "AWK, The C book"],
  ["Claude", "Shannon", "Information theory"],
  ["Dennis", "Ritchie", "C, Unix"],
  ["Donald", "Knuth", "TeX, TAOCP"],
  ["Edsger", "Dijkstra", "Shortest paths"],
  ["Frances", "Allen", "Optimizing compilers"],
  ["Grace", "Hopper", "COBOL, the first compiler"],
  ["Guido", "van Rossum", "Python"],
  ["Ken", "Thompson", "Unix, UTF-8"],
  ["Linus", "Torvalds", "Linux, Git"],
  ["Margaret", "Hamilton", "Apollo flight software"],
  ["Niklaus", "Wirth", "Pascal, Oberon"],
] as const;

type Row =
  | { header: string; count: number }
  | { first: string; last: string; note: string; tone: Tone; end: boolean };

/** Section headers stick to the top until the next one pushes them out. */
function Contacts() {
  const rows: Row[] = [];
  const headers: number[] = [];
  for (const letter of [...new Set(people.map((p) => p[0][0]))]) {
    const group = people.filter((p) => p[0][0] === letter);
    headers.push(rows.length);
    rows.push({ header: letter, count: group.length });
    group.forEach(([first, last, note], i) =>
      rows.push({
        first,
        last,
        note,
        tone: tones[(rows.length + i) % (tones.length - 1)],
        end: i === group.length - 1,
      }),
    );
  }
  return (
    <List
      each={rows}
      stickyHeaderIndices={headers}
      estimatedItemSize={60}
      style={{ flex: 1 }}
      contentStyle={{ paddingBottom: 24 }}
    >
      {(row) => {
        const person = () => row() as Extract<Row, { first: string }>;
        return (
          <If
            when={"header" in row()}
            else={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingLeft: 16,
                  height: 60,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: toneTint(person().tone),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: toneColor(person().tone) }}
                  >
                    {person().first[0]}
                    {person().last[0]}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignSelf: "stretch",
                    justifyContent: "center",
                    gap: 2,
                    paddingRight: 16,
                    borderBottomWidth: person().end ? 0 : 1,
                    borderBottomColor: colors.line,
                  }}
                >
                  <Text style={{ fontSize: 15, color: colors.foreground }}>
                    {person().first} <Text style={{ fontWeight: "600" }}>{person().last}</Text>
                  </Text>
                  <Text
                    style={{
                      numberOfLines: 1,
                      flexShrink: 1,
                      fontSize: 13,
                      color: colors.mutedForeground,
                    }}
                  >
                    {person().note}
                  </Text>
                </View>
              </View>
            }
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 34,
                paddingHorizontal: 16,
                gap: 10,
                // Opaque: rows scroll under it while it sticks.
                backgroundColor: colors.background,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.brand }}>
                {(row() as { header: string }).header}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
              <Text style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}>
                {(row() as { header: string; count: number }).count}
              </Text>
            </View>
          </If>
        );
      }}
    </List>
  );
}

type Message = { id: number; text: string; mine: boolean; time: string };

const lines = [
  "Did the build go out?",
  "Yes, 2.4 is live on both stores",
  "Crash rate?",
  "Flat. 0.02 %",
  "Nice. The list scrolls so much smoother now",
  "Recycling plus native layout, no JS per frame",
  "Ship it",
];

/** An inverted list: starts at the newest message, keeps its place as older ones load. */
function Chat() {
  const stamp = (n: number) =>
    `${String(9 + (Math.floor(n / 60) % 12)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  const message = (id: number, text: string, mine: boolean): Message => ({
    id,
    text,
    mine,
    time: stamp(id),
  });
  const messages = signal(
    Array.from({ length: 30 }, (_, i) => message(i, lines[i % lines.length], i % 3 === 0)),
  );
  const draft = signal("");
  const older = signal(0);
  const send = () => {
    if (!draft().trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    messages.update((m) => [message(m.length, draft(), true), ...m]);
    draft.set("");
  };
  const loadOlder = () => {
    older.set(older() + 1);
    messages.update((m) => [
      ...m,
      ...Array.from({ length: 20 }, (_, i) =>
        message(m.length + i, `Older message ${m.length + i + 1}`, i % 4 === 0),
      ),
    ]);
  };
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.up }} />
        <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>Release room</Text>
        <Text style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          {messages().length} messages, {older()} older pages
        </Text>
      </View>
      <List
        each={messages()}
        inverted
        estimatedItemSize={52}
        style={{ flex: 1 }}
        contentStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 6 }}
        keyboardDismissMode="interactive"
        onLoadMore={loadOlder}
        loadMoreThreshold={0.5}
      >
        {(m) => (
          <View
            style={{
              alignSelf: m().mine ? "flex-end" : "flex-start",
              maxWidth: "78%",
              gap: 3,
              alignItems: m().mine ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 18,
                borderCurve: "continuous",
                borderBottomRightRadius: m().mine ? 6 : 18,
                borderBottomLeftRadius: m().mine ? 18 : 6,
                backgroundColor: m().mine ? colors.brandFill : colors.raised,
                ...(m().mine ? finish.accent : finish.raised),
                borderWidth: m().mine ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: m().mine ? colors.onBrand : colors.foreground, fontSize: 15 }}>
                {m().text}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                color: colors.faint,
                fontVariant: ["tabular-nums"],
                paddingHorizontal: 4,
              }}
            >
              {m().time}
            </Text>
          </View>
        )}
      </List>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Input
            value={draft()}
            onChange={({ value }) => draft.set(value)}
            onSubmit={send}
            submitBehavior="submit"
            placeholder="Message"
            returnKeyType="send"
          />
        </View>
        <RoundButton accessibilityLabel="Send" side={desk ? 32 : 40} onPress={send}>
          <Icon icon={ArrowUp} size={16} tint={colors.primaryForeground} />
        </RoundButton>
      </View>
    </View>
  );
}

type Entry = { id: number; tone: Tone };

const entries = (from: number, count: number): Entry[] =>
  Array.from({ length: count }, (_, i) => ({
    id: from + i,
    tone: tones[(from + i) % (tones.length - 1)],
  }));

/** One row of the page's lists. */
function EntryRow(props: { entry: Entry; label: string }) {
  return (
    <View
      style={{
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        borderRadius: shape.inset,
        borderCurve: "continuous",
        backgroundColor: colors.raised,
        borderWidth: 1,
        borderColor: colors.border,
        ...finish.raised,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 2.5,
          backgroundColor: toneColor(props.entry.tone),
        }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: colors.foreground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.label} {props.entry.id + 1}
      </Text>
      <Badge tone={props.entry.tone}>{props.entry.tone}</Badge>
    </View>
  );
}

/** A week's heading in the page's first list: it sticks to the top of the page while its rows scroll under it. */
function WeekHeading(props: { week: number }) {
  return (
    <View
      style={{
        height: 34,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 4,
        // Opaque: rows scroll under it while it sticks.
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.brand }}>
        Week {props.week}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}

/** The height of the page's bar, which hides as the page scrolls down. */
const BAR = 44;

type PageRow = Entry | { week: number };

/** Headers and two lists on one page: the lists have no scroll view of their own (`viewport="parent"`). */
function Page() {
  const scroll = createAnimatedValue(0);
  // How much of the bar is hidden, following the page's scrolling.
  const hidden = scroll.diffClamp(0, BAR);
  // How much of it shows: where the week headings stick.
  const shown = hidden.mul(-1).add(BAR);
  // 200 entries, a week heading before every 20.
  const recent: PageRow[] = entries(0, 200).flatMap((e) =>
    e.id % 20 === 0 ? [{ week: e.id / 20 + 1 }, e] : [e],
  );
  const weeks = recent.flatMap((row, i) => ("week" in row ? [i] : []));
  const indexOf = (id: number) => recent.findIndex((row) => "id" in row && row.id === id);
  const archive = signal(entries(0, 100));
  const list = signal<ListRef | null>(null);
  const loadMore = () => {
    if (archive().length < 500) archive.update((a) => [...a, ...entries(a.length, 100)]);
  };
  return (
    <View style={{ flex: 1, overflow: "hidden" }}>
      <Scroll scrollValue={scroll} style={{ flex: 1 }}>
        <View
          style={{
            padding: 16,
            paddingTop: 16 + BAR,
            gap: 10,
            width: "100%",
            maxWidth: 720,
            alignSelf: "center",
          }}
        >
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            The lists below lie in the page at their full length, and the page scrolls them with
            this header: only the rows near its viewport exist, in recycled cells.
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Action
              label="Recent 150"
              icon="down"
              onPress={() => list()?.scrollToIndex({ index: indexOf(149), viewPosition: 0.5 })}
            />
            <Action label="End of recent" onPress={() => list()?.scrollToEnd()} />
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 8, paddingHorizontal: 4 }}
          >
            <Text style={{ flex: 1, fontSize: 17, fontWeight: "600", color: colors.foreground }}>
              Recent
            </Text>
            <Text style={{ fontSize: 13, color: colors.faint }}>200 rows</Text>
          </View>
          <List
            ref={(node) => list.set(node)}
            viewport="parent"
            each={recent}
            estimatedItemSize={56}
            stickyHeaderIndices={weeks}
            stickyHeaderOffset={shown}
            contentStyle={{ gap: 6 }}
          >
            {(row) => (
              <If when={"week" in row()} else={<EntryRow entry={row() as Entry} label="Recent" />}>
                <WeekHeading week={(row() as { week: number }).week} />
              </If>
            )}
          </List>
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 8, paddingHorizontal: 4 }}
          >
            <Text style={{ flex: 1, fontSize: 17, fontWeight: "600", color: colors.foreground }}>
              Archive
            </Text>
            <Text style={{ fontSize: 13, color: colors.faint }}>{`${archive().length} rows`}</Text>
          </View>
          <List
            viewport="parent"
            each={archive()}
            estimatedItemSize={56}
            contentStyle={{ gap: 6 }}
            onLoadMore={loadMore}
            footer={
              <Text style={{ textAlign: "center", color: colors.faint, fontSize: 13, padding: 16 }}>
                {archive().length < 500 ? "Loading more…" : "End of the archive"}
              </Text>
            }
          >
            {(entry) => <EntryRow entry={entry()} label="Archived" />}
          </List>
        </View>
      </Scroll>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: BAR,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 20,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          translate: [0, hidden.mul(-1)],
        }}
      >
        <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.foreground }}>
          Recent and archived
        </Text>
        <Text style={{ fontSize: 13, color: colors.faint }}>hides as you scroll down</Text>
      </View>
    </View>
  );
}

const ranges = ["Today", "Yesterday", "This week", "This month", "This year", "All time", "Custom"];

/** Pull to refresh (a system spinner or one drawn from `pullValue`), horizontal pills and cards, and an empty list. */
function More() {
  const refreshing = signal(false);
  const refreshed = signal(0);
  const indicator = signal<"system" | "custom">("system");
  const pull = createAnimatedValue(0);
  const range = signal("This week");
  const items = signal<{ n: number; tone: Tone }[]>([]);
  const refresh = () => {
    if (refreshing()) return;
    refreshing.set(true);
    setTimeout(() => {
      refreshed.set(refreshed() + 1);
      refreshing.set(false);
    }, 1000);
  };
  const cards = Array.from({ length: 1000 }, (_, i) => i);
  const custom = () => indicator() === "custom";
  const edit = (change: () => void) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    change();
  };
  return (
    <View style={{ flex: 1 }}>
      <Scroll
        style={{ flex: 1 }}
        refreshing={refreshing()}
        onRefresh={refresh}
        pullValue={pull}
        refreshIndicator={custom() ? { height: REFRESH_INDICATOR_HEIGHT } : undefined}
      >
        <View style={{ padding: 16, gap: 16 }}>
          {/* `position: sticky`: in the flow, then at the top while the page scrolls under it. */}
          <View
            style={{
              position: "sticky",
              top: 0,
              flexDirection: "row",
              alignItems: "baseline",
              gap: 8,
              marginHorizontal: -16,
              marginTop: -8,
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: colors.foreground }}>
              More list features
            </Text>
            <Text style={{ fontSize: 13, color: colors.faint, fontFamily: mono() }}>
              position: sticky
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  backgroundColor: colors.raised,
                  ...finish.raised,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  icon={ArrowDown}
                  size={18}
                  tint={refreshing() ? colors.brand : colors.foreground}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 15, color: colors.foreground }}>
                  {refreshing() ? "Refreshing…" : desk ? "Refresh below" : "Pull the page down"}
                </Text>
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                  {custom()
                    ? "RefreshIndicator, drawn from pullValue"
                    : "The system spinner on a plain scroll view"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "600",
                    color: colors.foreground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {refreshed()}
                </Text>
                <Text style={{ fontSize: 12, color: colors.faint }}>refreshes</Text>
              </View>
            </View>
            <Choice
              options={["system", "custom"] as const}
              value={indicator()}
              onChange={(v) => indicator.set(v)}
            />
            {/* The mouse does not pull scroll views down: desktops refresh here. */}
            <If when={desk}>
              <Button variant="secondary" disabled={refreshing()} onPress={refresh}>
                Refresh
              </Button>
            </If>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Caption>Horizontal scroll view</Caption>
              <Caption>{range()}</Caption>
            </View>
            <Scroll horizontal scrollbar={false} style={{ marginHorizontal: -16 }}>
              <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
                <Each of={ranges}>
                  {(label) => (
                    <Toggle
                      variant="outline"
                      size="lg"
                      pressed={range() === label()}
                      style={{ borderRadius: 999 }}
                      onChange={() => range.set(label())}
                    >
                      {label()}
                    </Toggle>
                  )}
                </Each>
              </View>
            </Scroll>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Caption>Horizontal list</Caption>
              <Caption>1,000 recycled cards</Caption>
            </View>
            <List
              each={cards}
              horizontal
              estimatedItemSize={130}
              scrollbar={false}
              style={{ height: 124, marginHorizontal: -16 }}
              contentStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {(i) => {
                const tone = () => tones[i() % (tones.length - 1)];
                const load = () => ((i() * 37) % 100) / 100;
                return (
                  <View
                    style={{
                      width: 120,
                      height: 124,
                      borderRadius: shape.inset,
                      borderCurve: "continuous",
                      backgroundColor: colors.raised,
                      ...finish.raised,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 12,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.mutedForeground,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      Card {i() + 1}
                    </Text>
                    <Text
                      style={{
                        fontSize: 26,
                        fontWeight: "600",
                        color: colors.foreground,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {Math.round(load() * 100)}
                      <Text style={{ fontSize: 15, fontWeight: "500", color: toneColor(tone()) }}>
                        {" %"}
                      </Text>
                    </Text>
                    <Meter value={load()} tone={tone()} />
                  </View>
                );
              }}
            </List>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Caption>An empty list</Caption>
              <Caption>{`${items().length} items`}</Caption>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  onPress={() =>
                    edit(() =>
                      items.set([
                        ...items(),
                        { n: items().length + 1, tone: tones[items().length % (tones.length - 1)] },
                      ]),
                    )
                  }
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Icon icon={Plus} size={14} tint={colors.primaryForeground} />
                    <Text
                      style={{ fontSize: 13, fontWeight: "600", color: colors.primaryForeground }}
                    >
                      Add
                    </Text>
                  </View>
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  variant="secondary"
                  disabled={!items().length}
                  onPress={() => edit(() => items.set([]))}
                >
                  Clear
                </Button>
              </View>
            </View>
            <List
              viewport="parent"
              each={items()}
              estimatedItemSize={48}
              style={{
                borderRadius: shape.control,
                backgroundColor: colors.card,
                ...finish.card,
                borderWidth: 1,
                borderColor: colors.line,
              }}
              empty={
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    height: 194,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      borderCurve: "continuous",
                      backgroundColor: colors.raised,
                      ...finish.raised,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 14,
                        borderRadius: 3,
                        borderWidth: 1.5,
                        borderColor: colors.faint,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                    {desk ? "Nothing here yet: click Add" : "Nothing here yet: tap Add"}
                  </Text>
                </View>
              }
              separator={() => (
                <View style={{ height: 1, marginLeft: 14, backgroundColor: colors.line }} />
              )}
            >
              {(item) => (
                <View
                  style={{
                    height: 48,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2.5,
                      backgroundColor: toneColor(item().tone),
                    }}
                  />
                  <Text style={{ flex: 1, fontSize: 15, color: colors.foreground }}>
                    Item {item().n}
                  </Text>
                  <Badge tone={item().tone}>{item().tone}</Badge>
                </View>
              )}
            </List>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              <Text style={{ fontFamily: mono(), color: colors.foreground }}>
                ListEmptyComponent
              </Text>{" "}
              while empty, separators between rows. In the page (
              <Text style={{ fontFamily: mono(), color: colors.foreground }}>
                viewport="parent"
              </Text>
              ), the list is as tall as its rows.
            </Text>
          </View>
        </View>
      </Scroll>
      <If when={custom()}>
        <RefreshIndicator pull={pull} refreshing={refreshing()} />
      </If>
    </View>
  );
}

type Tab = "Grid" | "Sections" | "Chat" | "Page" | "More";

export function ListDemo() {
  const tab = signal<Tab>("Grid");
  const width = signal(0);
  return (
    <DemoPage title="List">
      <DemoCard
        title="Lists"
        subtitle="One list of rows per scene: columns, sticky sections, a chat, a page, more"
      >
        <Api names="List · numColumns · stickyHeaderIndices · inverted · viewport" />
        <Choice
          options={["Grid", "Sections", "Chat", "Page", "More"] as const}
          value={tab()}
          onChange={(v) => tab.set(v)}
        />
        <View
          onLayout={({ bounds }) => width.set(bounds.size.width)}
          style={{
            height: desk ? 560 : 520,
            borderRadius: shape.card,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            overflow: "hidden",
          }}
        >
          <If when={tab() === "Grid"}>
            <Grid width={() => width() - 2} />
          </If>
          <If when={tab() === "Sections"}>
            <Contacts />
          </If>
          <If when={tab() === "Chat"}>
            <Chat />
          </If>
          <If when={tab() === "Page"}>
            <Page />
          </If>
          <If when={tab() === "More"}>
            <More />
          </If>
        </View>
      </DemoCard>
    </DemoPage>
  );
}
