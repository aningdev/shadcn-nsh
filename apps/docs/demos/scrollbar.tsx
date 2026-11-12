import { colors } from "@shadcn-nsh/theme";
import { mount, Scroll, Text, View, type ScrollRef } from "nsh";

import { Scrollbar } from "@/packages/ui/scrollbar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const LINES = Array.from({ length: 24 }, (_, i) => ({
  title: ["Ada", "Grace", "Linus", "Ken"][i % 4],
  body: ["Shipped the build", "Review when you can", "Tests are green", "Draft is ready"][i % 4],
}));

function App() {
  const muted = colors.muted;
  const line = colors.border;
  let inbox: ScrollRef | undefined;

  return (
    <DemoPage title="Scrollbar">
      <DemoCard>
        <DemoSection title="List">
          <View
            style={{
              width: 280,
              height: 240,
              borderWidth: 1,
              borderColor: line,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <Scroll ref={inbox} scrollbar={false} style={{ flex: 1 }}>
              {LINES.map((m) => (
                <View class="border-border flex-row gap-3 border-b px-3 py-2.5">
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 13, fontWeight: "500" }}>{m.title}</Text>
                    <Text style={{ fontSize: 12, color: muted }}>{m.body}</Text>
                  </View>
                </View>
              ))}
            </Scroll>
            <Scrollbar scroll={inbox} accessibilityLabel="Inbox scroll" />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
