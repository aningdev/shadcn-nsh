// The official sheet scene (`references/nsh/website/demos/el-sheet.tsx`) with this library's
// parts: one sheet opened from the four edges (a cross of buttons in a wide window, a column of
// them on a phone), a comments sheet resting at its medium detent, and a filter sheet whose footer
// applies a draft. Each keeps an inspector holding what the app read back and the last six lines.
import { mount, Scroll, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Sheet, SheetClose, SheetContent, type SheetSide } from "@/packages/ui/sheet";
import { Switch } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui, wide } from "./stage";

const SIDES: SheetSide[] = ["top", "left", "right", "bottom"];

type Detent = "medium" | "large";

/** A thread the comments sheet holds: enough lines to make the detent matter. */
const THREAD = [
  { who: "Ada", text: "The new numbers read well. Ship the summary first?", at: "9:12" },
  { who: "Marcel", text: "The chart's axis needs one more tick at the top.", at: "9:18" },
  { who: "Priya", text: "Agreed. I'll take the follow-up on the gutter spacing.", at: "9:24" },
  { who: "Jonas", text: "Draft is up — comments welcome until Friday.", at: "9:31" },
  { who: "Hana", text: "Reading it now. The intro is much tighter.", at: "9:40" },
];

type Sort = "relevance" | "newest" | "price";
type Price = "any" | "under50" | "mid" | "over200";
type Filters = { sort: Sort; price: Price; stock: boolean; sale: boolean };

const SORTS: Sort[] = ["relevance", "newest", "price"];
const PRICES: { value: Price; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "under50", label: "Under $50" },
  { value: "mid", label: "$50–200" },
  { value: "over200", label: "Over $200" },
];
const SHARES: Record<Price, number> = { any: 1, under50: 0.35, mid: 0.45, over200: 0.2 };
const NONE: Filters = { sort: "relevance", price: "any", stock: false, sale: false };

/** How many of the 128 results the filters leave: a stub, so the footer's number moves. */
const results = (f: Filters) =>
  Math.max(1, Math.round(128 * SHARES[f.price] * (f.stock ? 0.8 : 1) * (f.sale ? 0.35 : 1)));

/** The chosen filters as one line, or that there are none. */
function summary(f: Filters) {
  const parts: string[] = [];
  if (f.sort !== "relevance") parts.push(f.sort === "newest" ? "Newest" : "Price");
  if (f.price !== "any") parts.push(PRICES.find((p) => p.value === f.price)!.label);
  if (f.stock) parts.push("In stock");
  if (f.sale) parts.push("On sale");
  return parts.length === 0 ? "Nothing filtered — every result" : parts.join(" · ");
}

function App() {
  const open = signal(false);
  const side = signal<SheetSide>("bottom");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  const show = (s: SheetSide) => {
    side.set(s);
    open.set(true);
    log(`open · side ${s}`);
  };

  // The comments sheet: opened at medium, the grabber takes it to large.
  const commentsOpen = signal(false);
  const detent = signal<Detent>("medium");
  const thread = signal(THREAD);
  const comment = signal("");
  const commentEvents = signal<string[]>([]);
  const commentLog = (line: string) => commentEvents.set([line, ...commentEvents()].slice(0, 6));
  const send = () => {
    const text = comment().trim();
    if (text.length === 0) return;
    thread.set([...thread(), { who: "You", text, at: "now" }]);
    comment.set("");
    commentLog(`comment · ${text.length} characters`);
  };

  // The filter sheet: the draft is edited, and only the footer's button makes it applied.
  const filtersOpen = signal(false);
  const applied = signal<Filters>(NONE);
  const draft = signal<Filters>(NONE);
  const filterEvents = signal<string[]>([]);
  const filterLog = (line: string) => filterEvents.set([line, ...filterEvents()].slice(0, 6));
  const openFilters = () => {
    draft.set(applied());
    filtersOpen.set(true);
    filterLog("open · the draft starts from the applied filters");
  };
  const update = (patch: Partial<Filters>) => draft.set({ ...draft(), ...patch });
  const apply = () => {
    applied.set(draft());
    filtersOpen.set(false);
    filterLog(`apply · ${results(draft())} results · ${summary(draft())}`);
  };
  const reset = () => {
    draft.set(NONE);
    filterLog("reset · the draft is back to nothing");
  };
  /** A button that opens the sheet at side `s`; the side it opened last shows as chosen. */
  const opener = (s: SheetSide) => (
    <Button
      variant="secondary"
      selected={s === side()}
      onPress={() => show(s)}
      style={wide() ? undefined : { alignSelf: "stretch" }}
    >
      {`side="${s}"`}
    </Button>
  );

  return (
    <DemoPage title="Sheet">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Open a side; click the backdrop or press Escape to close it"
          : "Open a side; tap the backdrop or Android's back to close it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open · side">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {open() ? "open" : "closed"} · {side()}
              </Text>
            </Panel>
            <Log
              title="onOpenChange({ open, reason }) · onCancel"
              lines={events()}
              minHeight={130}
            />
          </>
        }
      >
        {/* Each button at the edge its sheet comes from. */}
        <If when={wide()}>
          <View style={{ width: 360, maxWidth: "100%", gap: 12 }}>
            <View style={{ alignItems: "center" }}>{opener("top")}</View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {opener("left")}
              {opener("right")}
            </View>
            <View style={{ alignItems: "center" }}>{opener("bottom")}</View>
          </View>
        </If>
        <If when={!wide()}>
          <View style={{ width: 240, gap: 8 }}>{SIDES.map((s) => opener(s))}</View>
        </If>
      </Split>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: ui().text }}>Detents</Text>
        <Text style={{ fontSize: 13, color: ui().muted }}>
          {desktop
            ? "The sheet rests at medium; press the grabber or drag it up to large."
            : "The sheet rests at medium; drag the grabber up to large, down to close."}
        </Text>
      </View>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="detent">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {commentsOpen() ? `${detent()} · ${thread().length} comments` : "closed"}
              </Text>
            </Panel>
            <Log
              title="onDetentChange({ detent }) · onOpenChange"
              lines={commentEvents()}
              minHeight={110}
            />
          </>
        }
      >
        <View style={{ ...sectionSurface(), padding: 16, gap: 12, width: 360, maxWidth: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: ui().text }}>
              Comments
            </Text>
            <Text
              style={{ fontSize: 12, color: ui().muted }}
            >{`${thread().length} in thread`}</Text>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 19, color: ui().muted }}>
            A bottom sheet with two detents. Start at medium, then raise it to large to see the
            whole thread; swipe it down from medium to close.
          </Text>
          <Button
            variant="secondary"
            onPress={() => {
              detent.set("medium");
              commentsOpen.set(true);
              commentLog("open · medium");
            }}
            style={{ alignSelf: "flex-start" }}
          >
            Open comments
          </Button>
        </View>
      </Split>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: ui().text }}>
          A draft the footer applies
        </Text>
        <Text style={{ fontSize: 13, color: ui().muted }}>
          Change the filters, then apply them from the footer; closing the sheet throws the draft
          away.
        </Text>
      </View>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="applied · draft">
              <Text style={{ fontSize: 13, color: ui().text }}>{summary(applied())}</Text>
              <Text style={{ fontSize: 12, color: ui().muted }}>
                {`${results(applied())} results · draft: ${summary(draft())}`}
              </Text>
            </Panel>
            <Log title="open · apply · reset · close" lines={filterEvents()} minHeight={110} />
          </>
        }
      >
        <View style={{ ...sectionSurface(), padding: 16, gap: 12, width: 360, maxWidth: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: ui().text }}>
              Filter the results
            </Text>
            <Text
              style={{ fontSize: 12, color: ui().muted }}
            >{`${results(applied())} results`}</Text>
          </View>
          <Text style={{ fontSize: 13, lineHeight: 19, color: ui().muted }}>
            {summary(applied())}
          </Text>
          <Button variant="secondary" onPress={openFilters} style={{ alignSelf: "flex-start" }}>
            Filters
          </Button>
        </View>
      </Split>

      <Sheet
        open={open()}
        onOpenChange={({ open: next, reason }) => {
          open.set(next);
          log(`onOpenChange · ${next ? "opened" : "closed"} · ${reason}`);
        }}
        onCancel={() => log("onCancel")}
      >
        <SheetContent side={side()} closeOnSwipe>
          <Text style={{ fontSize: desktop ? 16 : 18, fontWeight: "600", color: ui().text }}>
            Filters
          </Text>
          <Text
            style={{
              fontSize: desktop ? 13 : 15,
              lineHeight: desktop ? 19 : 21,
              color: ui().muted,
            }}
          >
            {`A panel at the ${side()} edge. `}
            {desktop
              ? "The backdrop and Escape close it."
              : "The backdrop and Android's back close it."}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <SheetClose variant="default" onPress={() => log("Done pressed")}>
              Done
            </SheetClose>
          </View>
        </SheetContent>
      </Sheet>

      <Sheet
        open={commentsOpen()}
        onOpenChange={({ open: next, reason }) => {
          commentsOpen.set(next);
          if (!next) detent.set("medium");
          commentLog(`onOpenChange · ${next ? "opened" : "closed"} · ${reason}`);
        }}
        onCancel={() => commentLog("onCancel")}
      >
        <SheetContent
          side="bottom"
          detents={["medium", "large"]}
          detent={detent()}
          onDetentChange={({ detent: next }) => {
            const value = next === "large" ? "large" : "medium";
            detent.set(value);
            commentLog(`detent → ${value}`);
          }}
          closeOnSwipe
          footer={
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Input
                value={comment()}
                onChange={({ value }) => comment.set(value)}
                placeholder="Add a comment"
                returnKeyType="send"
                onSubmit={send}
                accessibilityLabel="Add a comment"
                style={{ flex: 1 }}
              />
              <Button variant="default" disabled={comment().trim().length === 0} onPress={send}>
                Send
              </Button>
            </View>
          }
          footerStyle={{ borderTopWidth: 1, borderColor: ui().line, paddingTop: 10 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={{ flex: 1, fontSize: desktop ? 16 : 18, fontWeight: "600", color: ui().text }}
            >
              Comments
            </Text>
            <SheetClose variant="ghost" onPress={() => commentLog("Done pressed")}>
              Done
            </SheetClose>
          </View>
          <Scroll style={{ flexShrink: 1 }} contentStyle={{ gap: 12 }}>
            {thread().map((line) => (
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: ui().text }}>
                  {`${line.who} · ${line.at}`}
                </Text>
                <Text
                  style={{
                    fontSize: desktop ? 13 : 15,
                    lineHeight: desktop ? 19 : 21,
                    color: ui().muted,
                  }}
                >
                  {line.text}
                </Text>
              </View>
            ))}
          </Scroll>
        </SheetContent>
      </Sheet>

      <Sheet
        open={filtersOpen()}
        onOpenChange={({ open: next, reason }) => {
          filtersOpen.set(next);
          if (!next) draft.set(applied());
          filterLog(`onOpenChange · ${next ? "opened" : "closed"} · ${reason}`);
        }}
        onCancel={() => filterLog("onCancel")}
      >
        <SheetContent side={wide() ? "right" : "bottom"} closeOnSwipe>
          <Text style={{ fontSize: desktop ? 16 : 18, fontWeight: "600", color: ui().text }}>
            Filters
          </Text>
          <Text style={{ fontSize: 13, lineHeight: 19, color: ui().muted }}>
            The footer applies the draft. Closing without applying keeps the old filters.
          </Text>
          <Segmented
            label="Sort by"
            options={SORTS}
            value={draft().sort}
            onChange={(sort) => update({ sort })}
          />
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: ui().muted }}>Price</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {PRICES.map((price) => (
                <Button
                  variant="secondary"
                  size="sm"
                  selected={draft().price === price.value}
                  onPress={() => update({ price: price.value })}
                >
                  {price.label}
                </Button>
              ))}
            </View>
          </View>
          <View style={{ gap: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40 }}>
              <Text style={{ flex: 1, fontSize: 14, color: ui().text }}>In stock only</Text>
              <Switch
                checked={draft().stock}
                onChange={({ checked }) => update({ stock: checked })}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40 }}>
              <Text style={{ flex: 1, fontSize: 14, color: ui().text }}>On sale</Text>
              <Switch
                checked={draft().sale}
                onChange={({ checked }) => update({ sale: checked })}
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Button
              variant="ghost"
              disabled={
                draft().sort === NONE.sort &&
                draft().price === NONE.price &&
                !draft().stock &&
                !draft().sale
              }
              onPress={reset}
            >
              Reset
            </Button>
            <View style={{ flex: 1 }} />
            <Button variant="default" onPress={apply}>
              {`Show ${results(draft())} results`}
            </Button>
          </View>
        </SheetContent>
      </Sheet>
    </DemoPage>
  );
}

mount(App);
