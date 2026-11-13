// The reference of `scrollbar.tsx`: `scrollbarTheme` on `nsh/base`'s Scrollbar, the way the official
// example (`references/nsh/website/demos/el-scrollbar.tsx`) writes it. It differs from the component
// page only in what it names: the bar's mode, its motion and its classes.
import { colors } from "@shadcn-nsh/theme";
import { mount, Scroll, signal, Text, View, type ScrollRef } from "nsh";
import { Scrollbar, type ScrollbarMode } from "nsh/base";

import { controlSize, sectionSurface } from "@/packages/ui/lib/surface";
import { scrollbarTheme } from "@/packages/ui/scrollbar";

import { DemoPage } from "./kit";
import { desktop, Panel, Segmented, Split } from "./stage";

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

function App() {
  const mode = signal<ScrollbarMode>("scrolling");
  const offset = signal(0);
  let inbox: ScrollRef | undefined;
  return (
    <DemoPage title="Scrollbar">
      <Text style={{ color: colors.muted }}>
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
          <Scroll
            ref={inbox}
            scrollbar={false}
            style={{ flex: 1 }}
            onScroll={(e) => offset.set(e.offset.y)}
          >
            {MESSAGES.map((m) => (
              <View
                class={`flex-row gap-3 ${desktop ? "px-3 py-2.5" : "px-4 py-3"}`}
                style={{ borderBottomWidth: 1, borderColor: colors.line }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    class="text-foreground"
                    style={{ fontSize: controlSize.label, fontWeight: "500" }}
                  >
                    {m.from}
                  </Text>
                  <Text class="text-muted-foreground" style={{ fontSize: controlSize.detail }}>
                    {m.text}
                  </Text>
                </View>
                <Text
                  class="text-muted-foreground"
                  style={{ fontSize: controlSize.detail, fontVariant: ["tabular-nums"] }}
                >
                  {m.at}
                </Text>
              </View>
            ))}
          </Scroll>
          <Scrollbar
            scroll={inbox}
            mode={mode()}
            motion={scrollbarTheme.motion}
            class={scrollbarTheme.vertical?.class ?? undefined}
            thumbClass={scrollbarTheme.vertical?.thumbClass ?? undefined}
            accessibilityLabel="Messages"
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
