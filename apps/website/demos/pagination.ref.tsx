// The reference of `pagination.tsx`: `paginationItemClass` and `paginationArrows` on `nsh/base`'s
// Pagination, the way the official example (`references/nsh/website/demos/el-pagination.tsx`)
// writes it. It differs from the component page only in what it names: the item classes and the
// arrows.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Pagination } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/packages/ui/menu";
import {
  paginationArrows,
  paginationItemClass,
  paginationItemStyle,
  type PaginationItemState,
} from "@/packages/ui/pagination";
import { Toggle } from "@/packages/ui/toggle";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Segmented, Split, wide } from "./stage";

// Five pages show in a narrow frame, seven in a wide one.
const total = 238;
const page = signal(1);
const perPage = signal<"10" | "25">("10");
const chapter = signal(1);
const events = signal<string[]>([]);

const pages = () => Math.ceil(total / Number(perPage()));
const first = () => (page() - 1) * Number(perPage()) + 1;
const last = () => Math.min(page() * Number(perPage()), total);

const changed = (next: number) => {
  page.set(next);
  events.set([`onChange({ page: ${next} })`, ...events()].slice(0, 4));
};

// An archive of ten thousand pages: ten pages show at most, so every run between them is an
// ellipsis, and a press on one opens the nearest of the pages it leaves out.
const ARCHIVE = 10000;
const archivePage = signal(5000);
const visible = signal<"5" | "7" | "9">("5");
const offline = signal(false);
const moves = signal<string[]>([]);

/** Thousands, as the archive counts them: 5,000. */
const grouped = (value: number) => value.toLocaleString("en-US");

const goTo = (next: number) => {
  archivePage.set(next);
  moves.set([`onChange({ page: ${grouped(next)} })`, ...moves()].slice(0, 2));
};

/**
 * The pages an ellipsis' menu lists: all of a short run, else the window of 25 at the run's end
 * nearest the page shown (the run's own start going forward, its end coming back).
 */
const nearPages = (start: number, end: number, current: number, limit = 25): number[] => {
  const [from, to] =
    end - start <= limit
      ? [start, end]
      : start > current
        ? [start, start + limit]
        : [end - limit, end];
  return Array.from({ length: to - from }, (_, i) => from + i);
};

/** A page's content: its number, the arrows, and the ellipsis a menu of the run it hides. */
function pageContent(item: PaginationItemState) {
  if (item.kind === "page")
    return <Text style={{ fontVariant: ["tabular-nums"] }}>{grouped(item.page)}</Text>;
  if (item.kind !== "ellipsis") return paginationArrows(item);
  const start = item.start ?? 1;
  const end = item.end ?? start + 1;
  return (
    <Menu>
      <MenuTrigger>
        <View
          accessibilityLabel={`Pages ${grouped(start)} to ${grouped(end - 1)}`}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: colors.mutedForeground }}>…</Text>
        </View>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>{`Pages ${grouped(start)}–${grouped(end - 1)}`}</MenuLabel>
        {nearPages(start, end, archivePage()).map((at) => (
          <MenuItem onSelect={() => goTo(at)}>{grouped(at)}</MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

function App() {
  return (
    <DemoPage title="Pagination">
      <Text style={{ color: colors.mutedForeground }}>
        {desktop ? "Click a page, or Tab to one and press Return" : "Tap a page"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="page · totalPages">
              <Text class="text-foreground" style={{ fontSize: 13 }}>
                {`${page()} of ${pages()}`}
              </Text>
            </Panel>
            <Log title="onChange({ page })" lines={events()} minHeight={110} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Text class="text-muted-foreground" style={{ fontSize: 13 }}>
              {`Showing ${first()}–${last()} of ${total} results`}
            </Text>
            <Segmented
              options={["10", "25"] as const}
              value={perPage()}
              onChange={(next) => {
                const row = first();
                perPage.set(next);
                page.set(Math.floor((row - 1) / Number(next)) + 1);
              }}
            />
          </View>
          <Pagination
            page={page()}
            totalPages={pages()}
            visiblePages={wide() ? 7 : 5}
            accessibilityLabel="Search results pages"
            itemClass={paginationItemClass({ variant: "default" })}
            itemStyle={paginationItemStyle()}
            renderItem={paginationArrows}
            previousAccessibilityLabel="Previous"
            nextAccessibilityLabel="Next"
            class="flex-wrap gap-1"
            onChange={({ page: next }) => changed(next)}
          />
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <Pagination
            compact
            page={chapter()}
            totalPages={12}
            accessibilityLabel="Chapters"
            previousAccessibilityLabel="Previous chapter"
            nextAccessibilityLabel="Next chapter"
            class="items-center justify-between"
            itemClass={paginationItemClass({ variant: "outline" })}
            itemStyle={paginationItemStyle()}
            renderItem={paginationArrows}
            onChange={({ page: next }) => chapter.set(next)}
          >
            <Text class="text-muted-foreground" style={{ fontSize: 13 }}>
              {`Chapter ${chapter()} of 12`}
            </Text>
          </Pagination>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="A jump menu" axis="block">
          <Text style={{ color: colors.mutedForeground }}>
            Ten thousand pages, at most {visible()} of them in the row: every run left out is an
            ellipsis, and a press on it opens the pages nearest the one shown.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.foreground }}>
              {`Page ${grouped(archivePage())} of ${grouped(ARCHIVE)}`}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Button variant="ghost" size="sm" onPress={() => goTo(1)}>
                First page
              </Button>
              <Button variant="ghost" size="sm" onPress={() => goTo(ARCHIVE)}>
                Last page
              </Button>
              <Toggle
                size="sm"
                pressed={offline()}
                onChange={({ pressed }) => offline.set(pressed)}
              >
                Offline
              </Toggle>
            </View>
          </View>

          <Pagination
            page={archivePage()}
            totalPages={ARCHIVE}
            visiblePages={wide() ? Number(visible()) : 5}
            disabled={offline()}
            accessibilityLabel="Archive pages"
            previousAccessibilityLabel="Previous page"
            nextAccessibilityLabel="Next page"
            class="flex-wrap gap-1"
            itemClass={paginationItemClass()}
            itemStyle={paginationItemStyle()}
            renderItem={(item) => pageContent(item)}
            onChange={({ page: next }) => goTo(next)}
          />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Segmented
              label="visiblePages"
              options={["5", "7", "9"] as const}
              value={visible()}
              onChange={(next) => visible.set(next)}
            />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {moves()[0] ?? "No change yet"}
            </Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
