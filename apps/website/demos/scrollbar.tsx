// The official scrollbar scene (`references/nsh/website/demos/el-scrollbar.tsx`) with this
// library's Scrollbar: a list of messages in a card whose own indicator is off, the app's bar over
// its edge, and an inspector that switches when the bar shows and follows the list's offset.
// The messages are a `List`: only the rows on screen mount, not all 60.
import { List, mount, signal, Text, View, type ListRef } from "nsh";
import type { ScrollbarMode } from "nsh/base";

import { controlSize, sectionSurface } from "@/packages/ui/lib/surface";
import { Scrollbar } from "@/packages/ui/scrollbar";

import { DemoPage } from "./kit";
import { desktop, Panel, Segmented, Split, ui } from "./stage";

// The bar shows while the content scrolls and while the pointer is over it, fades in over 300 ms
// and out over 500 ms, 2 s after the last scroll; pointing at its hidden thumb in the `hover` mode
// slides it in.
const MESSAGES = Array.from({ length: 60 }, (_, i) => ({
  from: ["Ada", "Grace", "Linus", "Ken", "Barbara"][i % 5],
  text: [
    "Shipped the build",
    "Review when you can",
    "Tests are green",
    "Moved the meeting",
    "Draft is ready",
  ][i % 5],
  at: `${9 + Math.floor(i / 6)}:${String((i * 7) % 60).padStart(2, "0")}`,
}));
/** About a message row's height: its padding and two lines (54 with a pointer, 61 on touch). */
const ROW_HEIGHT = desktop ? 54 : 61;

function App() {
  const mode = signal<ScrollbarMode>("scrolling");
  const offset = signal(0);
  let inbox: ListRef | undefined;
  return (
    <DemoPage title="Scrollbar">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Scroll the list, drag the thumb or click the track"
          : "Scroll the list, or drag the thumb"}
      </Text>

      <Split
        gap={14}
        grow
        inspector={
          <Panel title="scrollbar">
            <Segmented
              label="mode"
              options={["scrolling", "hover", "always"] as const}
              value={mode()}
              onChange={(value) => mode.set(value)}
            />
            <Text class="text-foreground" style={{ fontSize: 13, fontVariant: ["tabular-nums"] }}>
              {`offset ${Math.round(offset())}`}
            </Text>
          </Panel>
        }
      >
        <View style={{ ...sectionSurface(), flex: 1, minHeight: 320, overflow: "hidden" }}>
          <List
            ref={inbox}
            each={MESSAGES}
            keyExtractor={(m) => m.at}
            estimatedItemSize={ROW_HEIGHT}
            scrollbar={false}
            style={{ flex: 1 }}
            onScroll={(e) => {
              // The readout is a whole point; a finer move of the list changes nothing in it.
              const next = Math.round(e.offset.y);
              if (next !== offset()) offset.set(next);
            }}
          >
            {(m) => (
              <View
                class={`flex-row gap-3 ${desktop ? "px-3 py-2.5" : "px-4 py-3"}`}
                style={{ borderBottomWidth: 1, borderColor: ui().line }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    class="text-foreground"
                    style={{ fontSize: controlSize.label, fontWeight: "500" }}
                  >
                    {m().from}
                  </Text>
                  <Text class="text-muted-foreground" style={{ fontSize: controlSize.detail }}>
                    {m().text}
                  </Text>
                </View>
                <Text
                  class="text-muted-foreground"
                  style={{ fontSize: controlSize.detail, fontVariant: ["tabular-nums"] }}
                >
                  {m().at}
                </Text>
              </View>
            )}
          </List>
          <Scrollbar scroll={inbox} mode={mode()} accessibilityLabel="Messages" />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
