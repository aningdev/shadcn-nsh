import { colors, font } from "@shadcn-nsh/theme";
// Pagination: the official gallery's scene
// (`references/nsh/examples/gallery/demos/PaginationDemo.tsx`) with this library's parts — search
// results with a count, a table's footer with its page size, a compact pager for a phone, and an
// archive of ten thousand pages whose ellipses open jump menus, with an offline state. `nsh/base`'s
// `Pagination` owns which pages show; the page is the app's.
import { ChevronRight } from "lucide";
import { platform, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import {
  menuItemLabel,
  menuPopup,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@/packages/ui/menu";
import {
  Pagination,
  paginationArrows,
  paginationItemClass,
  type PaginationItemState,
} from "@/packages/ui/pagination";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { DemoCard, DemoPage } from "../kit";
import { CaptionRow, hint, LabeledToggle } from "./navigation-shared";

const pointer = platform.desktop;

/** Every item's look: the current page `selected:`, the ends `disabled:`; outlined on a touch
 * screen and in a compact pager. */
const itemClass = paginationItemClass();
const outlined = paginationItemClass({ variant: "outline" });
/** The archive's items: 28 wide at least and narrower padding, so a row of nine with five-digit
 * pages fits one line. */
const tightItem = itemClass.replace("min-w-8", "min-w-7").replace("px-2", "px-1");

/** `n` with thousands separators, the same on every platform. */
const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** The pages an ellipsis menu lists: those it hides nearest the current page, at most 100. */
function hiddenPages(start: number, end: number, current: number) {
  const last = 100;
  const [from, to] =
    end - start <= last
      ? [start, end]
      : start > current
        ? [start, start + last]
        : [end - last, end];
  return Array.from({ length: to - from }, (_, i) => from + i);
}

/** An ellipsis that opens a menu of the pages it hides: up to 100 rows, so the menu scrolls, the
 * arrow keys moving through its rows and into view. */
function JumpMenu(props: {
  start: number;
  end: number;
  current: number;
  onPick: (page: number) => void;
}) {
  const pages = () => hiddenPages(props.start, props.end, props.current);
  return (
    <Menu>
      <MenuTrigger>
        <View
          accessibilityLabel={`Pages ${grouped(props.start)} to ${grouped(props.end - 1)}`}
          // The whole item, its padding too, opens the menu: 44 points on a touch screen.
          class={`${pointer ? "min-w-8" : "min-w-11"} hover:bg-accent -mx-2 items-center justify-center self-stretch rounded-md px-2`}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>…</Text>
        </View>
      </MenuTrigger>
      <MenuContent offset={4} margin={8} popupStyle={menuPopup({ minWidth: 80 }).popupStyle}>
        <Each of={pages()}>
          {(page) => (
            <MenuItem onSelect={() => props.onPick(page())}>
              <Text style={{ ...menuItemLabel(), fontVariant: ["tabular-nums"] }}>
                {grouped(page())}
              </Text>
            </MenuItem>
          )}
        </Each>
      </MenuContent>
    </Menu>
  );
}

/**
 * Pagination: search results with a count, a table's footer with its page size, a compact pager
 * for a phone, and an archive of ten thousand pages with jump menus and an offline state.
 */
/** Search results with a count: seven pages where the card is wide, five in a phone-wide one. */
function Results() {
  const total = 238;
  const perPage = 10;
  const pages = Math.ceil(total / perPage);
  const page = signal(1);
  const first = () => (page() - 1) * perPage + 1;
  const last = () => Math.min(page() * perPage, total);
  const rows = () => Array.from({ length: last() - first() + 1 }, (_, i) => first() + i);
  return (
    <DemoCard title="Search results" subtitle={`“native shell”: ${total} results`}>
      <View style={{ gap: 6, minHeight: pointer ? 260 : 320 }}>
        <Each of={rows()} key={(n) => n}>
          {(n) => (
            <View style={{ gap: 2, paddingVertical: 4 }}>
              <Text
                style={{ fontSize: 13, fontWeight: "500", color: colors.brand }}
              >{`Result ${n()}: Native views for generated UI`}</Text>
              <Text
                style={{ fontSize: 12, color: colors.faint }}
              >{`docs.example.com/guide/${n()}`}</Text>
            </View>
          )}
        </Each>
      </View>
      <View
        style={{
          gap: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          alignItems: pointer ? "flex-start" : "center",
        }}
      >
        <Pagination
          page={page()}
          totalPages={pages}
          visiblePages={pointer ? 7 : 5}
          compact={!pointer}
          accessibilityLabel="Search results pages"
          previousAccessibilityLabel="Previous"
          nextAccessibilityLabel="Next"
          class={pointer ? "flex-nowrap gap-0.5" : "items-center justify-between self-stretch"}
          itemClass={pointer ? itemClass : outlined}
          renderItem={paginationArrows}
          onChange={({ page: next }) => page.set(next)}
        >
          <If when={!pointer}>
            <Text
              style={{
                fontSize: 13,
                color: colors.mutedForeground,
                fontVariant: ["tabular-nums"],
              }}
            >{`${page()} / ${pages}`}</Text>
          </If>
        </Pagination>
        {/* Full width: the caption's label grows, which a centered column would squeeze to nothing. */}
        <View style={{ alignSelf: "stretch" }}>
          <CaptionRow
            label={`Showing ${first()}–${last()} of ${total}`}
            note={`page ${page()} of ${pages}`}
          />
        </View>
      </View>
    </DemoCard>
  );
}

/** A table's footer: the page size beside the pager, the first row staying in view. */
function TableFooter() {
  const orders = 1284;
  const sizes = ["10", "25", "50"] as const;
  const size = signal<(typeof sizes)[number]>("25");
  const page = signal(1);
  const per = () => Number(size());
  const pages = () => Math.ceil(orders / per());
  const first = () => (page() - 1) * per() + 1;
  const last = () => Math.min(page() * per(), orders);
  const shown = () =>
    Array.from({ length: Math.min(4, last() - first() + 1) }, (_, i) => first() + i);
  return (
    <DemoCard title="Table footer" subtitle="Newest first; the first row stays in view">
      <View style={{ gap: 2 }}>
        <Each of={shown()} key={(n) => n}>
          {(n) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              <Text
                style={{ fontSize: 13, color: colors.foreground, fontFamily: font.mono }}
              >{`#${20000 - n()}`}</Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >{`$${((n() * 37) % 900) + 20}.00`}</Text>
            </View>
          )}
        </Each>
        <Text style={{ fontSize: 12, color: colors.faint, paddingTop: 4 }}>
          {`and ${last() - first() + 1 - shown().length} more on this page`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Rows per page</Text>
          <Segmented
            value={size()}
            onValueChange={(next) => {
              // The row at the top stays on the page shown.
              const row = first();
              size.set(next as (typeof sizes)[number]);
              page.set(Math.floor((row - 1) / Number(next)) + 1);
            }}
          >
            <SegmentedList size="sm">
              <Each of={sizes}>{(s) => <SegmentedItem value={s()}>{s()}</SegmentedItem>}</Each>
            </SegmentedList>
          </Segmented>
        </View>
        <Pagination
          page={page()}
          totalPages={pages()}
          accessibilityLabel="Orders pages"
          previousAccessibilityLabel="Newer"
          nextAccessibilityLabel="Older"
          compact={!pointer}
          class={pointer ? "gap-1" : "items-center justify-between self-stretch"}
          itemClass={pointer ? itemClass : outlined}
          renderItem={paginationArrows}
          onChange={({ page: next }) => page.set(next)}
        >
          <If when={!pointer}>
            <Text
              style={{
                fontSize: 13,
                color: colors.mutedForeground,
                fontVariant: ["tabular-nums"],
              }}
            >{`${page()} / ${pages()}`}</Text>
          </If>
        </Pagination>
      </View>
      <CaptionRow
        label={`Rows ${grouped(first())}–${grouped(last())} of ${grouped(orders)}`}
        note={`${pages()} pages`}
      />
    </DemoCard>
  );
}

/** A compact pager: Previous, the page in words, Next — a reader on a phone. */
function Compact() {
  const chapters = [
    "Arrival",
    "The Harbor",
    "Old Maps",
    "Low Tide",
    "The Lighthouse",
    "Fog",
    "Signals",
    "The Crossing",
    "North Shore",
    "Embers",
    "Return",
    "Afterword",
  ];
  const page = signal(1);
  return (
    <DemoCard title="Compact" subtitle="Previous, the page in words, Next: a reader on a phone">
      <View style={{ gap: 4, paddingVertical: 8 }}>
        <Text style={{ fontSize: 12, color: colors.faint, letterSpacing: 0.4 }}>
          {`CHAPTER ${page()}`}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "600", color: colors.foreground }}>
          {chapters[page() - 1]}
        </Text>
      </View>
      <Pagination
        compact
        page={page()}
        totalPages={chapters.length}
        accessibilityLabel="Chapters"
        previousAccessibilityLabel="Previous chapter"
        nextAccessibilityLabel="Next chapter"
        class="items-center justify-between"
        itemClass={outlined}
        renderItem={paginationArrows}
        onChange={({ page: next }) => page.set(next)}
      >
        <Text
          style={{ fontSize: 13, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
        >{`${page()} / ${chapters.length}`}</Text>
      </Pagination>
    </DemoCard>
  );
}

/** An archive of ten thousand pages: the one pagination that draws its items, an ellipsis
 * opening a menu of the pages it hides. */
function Archive() {
  const pages = 10000;
  const page = signal(5000);
  // Five pages fit a two-column card's width at five-digit page numbers; more wrap to a second row.
  const visible = signal<"5" | "7" | "9">("5");
  const offline = signal(false);
  const log = signal<string[]>([]);
  const go = (next: number) => {
    page.set(next);
    log.set([`onChange({ page: ${next} })`, ...log()].slice(0, 3));
  };
  // An ellipsis opens a menu of the pages it hides, numbers get separators, Previous and Next
  // are chevrons.
  const draw = (item: PaginationItemState) => {
    if (item.kind === "ellipsis")
      return <JumpMenu start={item.start!} end={item.end!} current={page()} onPick={go} />;
    if (item.kind === "page")
      return <Text style={{ fontVariant: ["tabular-nums"] }}>{grouped(item.page)}</Text>;
    return (
      <View style={item.kind === "previous" ? { transform: [{ rotate: "180deg" }] } : undefined}>
        <Icon icon={ChevronRight} size={pointer ? 14 : 16} tint={colors.foreground} />
      </View>
    );
  };
  return (
    <DemoCard
      title="Ten thousand pages"
      subtitle="An ellipsis opens the pages it hides"
      style={{ gap: 12 }}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }} />
        <LabeledToggle label="Offline" value={offline()} onChange={(v) => offline.set(v)} />
      </View>
      <If when={pointer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Pages shown</Text>
          <Segmented value={visible()} onValueChange={(v) => visible.set(v as "5" | "7" | "9")}>
            <SegmentedList size="sm">
              <SegmentedItem value="5">5</SegmentedItem>
              <SegmentedItem value="7">7</SegmentedItem>
              <SegmentedItem value="9">9</SegmentedItem>
            </SegmentedList>
          </Segmented>
        </View>
      </If>
      <Pagination
        page={page()}
        totalPages={pages}
        visiblePages={Number(visible())}
        disabled={offline()}
        accessibilityLabel="Archive pages"
        previousAccessibilityLabel="Previous archive page"
        nextAccessibilityLabel="Next archive page"
        compact={!pointer}
        class={pointer ? "flex-nowrap gap-0.5" : "items-center justify-between self-stretch"}
        itemClass={pointer ? tightItem : outlined}
        renderItem={draw}
        onChange={({ page: next }) => go(next)}
      >
        <If when={!pointer}>
          <Text
            style={{ fontSize: 13, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
          >{`${grouped(page())} / ${grouped(pages)}`}</Text>
        </If>
      </Pagination>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          variant="ghost"
          size="sm"
          disabled={offline() || page() === 1}
          onPress={() => go(1)}
        >
          First page
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={offline() || page() === pages}
          onPress={() => go(pages)}
        >
          Last page
        </Button>
      </View>
      <CaptionRow
        label={
          offline()
            ? "Offline: no presses, no focus, dimmed for screen readers"
            : `Page ${grouped(page())} of ${grouped(pages)}`
        }
      />
      <View style={{ gap: 2, display: log().length ? "flex" : "none" }}>
        <Each of={log()}>
          {(line, i) => (
            <Text
              style={{
                fontSize: 12,
                fontFamily: font.mono,
                color: i() === 0 ? colors.foreground : colors.faint,
              }}
            >
              {line()}
            </Text>
          )}
        </Each>
      </View>
    </DemoCard>
  );
}

export function PaginationDemo() {
  return (
    <DemoPage
      title="Pagination"
      note={hint("Swipe or tap the pages", "Click the pages, or focus them and use the arrows")}
    >
      <Results />
      <TableFooter />
      <Compact />
      <Archive />
    </DemoPage>
  );
}
