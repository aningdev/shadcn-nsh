// The official pagination scene (`references/nsh/website/demos/el-pagination.tsx`) with this
// library's Pagination: search results paged with a count and a compact pager beside them, and an
// inspector with the page of the total and the events.
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { Pagination } from "@/packages/ui/pagination";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split, ui, wide } from "./stage";

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

function App() {
  return (
    <DemoPage title="Pagination">
      <Text style={{ color: ui().muted }}>
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
            previousAccessibilityLabel="Previous"
            nextAccessibilityLabel="Next"
            class="flex-wrap gap-1"
            onChange={({ page: next }) => changed(next)}
          />
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <Pagination
            compact
            outlined
            page={chapter()}
            totalPages={12}
            accessibilityLabel="Chapters"
            previousAccessibilityLabel="Previous chapter"
            nextAccessibilityLabel="Next chapter"
            class="items-center justify-between"
            onChange={({ page: next }) => chapter.set(next)}
          >
            <Text class="text-muted-foreground" style={{ fontSize: 13 }}>
              {`Chapter ${chapter()} of 12`}
            </Text>
          </Pagination>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
