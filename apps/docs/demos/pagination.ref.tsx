// The reference of `pagination.tsx`: `paginationItemClass` on `nsh/base`'s Pagination.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Pagination } from "nsh/base";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { paginationArrows, paginationItemClass } from "@/packages/ui/pagination";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const total = 238;

function App() {
  const page = signal(1);
  const perPage = signal<10 | 25>(10);
  const chapter = signal(3);

  const pages = () => Math.ceil(total / perPage());
  const first = () => (page() - 1) * perPage() + 1;
  const last = () => Math.min(page() * perPage(), total);

  return (
    <DemoPage title="Pagination" note={() => `${page()} of ${pages()}`}>
      <DemoCard style={{ gap: 12, ...sectionSurface({ padded: true }) }}>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          {`Showing ${first()}–${last()} of ${total} results`}
        </Text>
        <DemoSection title="Default">
          <Pagination
            page={page()}
            totalPages={pages()}
            visiblePages={5}
            accessibilityLabel="Search results"
            itemClass={paginationItemClass()}
            renderItem={paginationArrows}
            onChange={({ page: next }) => page.set(next)}
          />
        </DemoSection>
        <DemoSection title="Compact">
          <Pagination
            compact
            page={chapter()}
            totalPages={12}
            accessibilityLabel="Chapters"
            itemClass={paginationItemClass({ outlined: true })}
            renderItem={paginationArrows}
            onChange={({ page: next }) => chapter.set(next)}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 13, color: colors.muted }}
              >{`Chapter ${chapter()} of 12`}</Text>
            </View>
          </Pagination>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
