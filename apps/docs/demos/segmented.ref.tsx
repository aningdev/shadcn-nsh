// The reference of `segmented.tsx`: the same page with `segmentedLook` on `nsh/base`'s Tabs. The
// render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Tab, Tabs } from "nsh/base";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { segmentedLook } from "@/packages/ui/segmented";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

function App() {
  const view = signal("List");
  const align = signal("Left");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  const main = segmentedLook({ size: "regular", fill: true });
  const compact = segmentedLook({ size: "small" });

  return (
    <DemoPage title="Segmented">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a segment, or Tab to the control and move with the arrow keys"
          : "Tap a segment: the control is one stop of a screen reader"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: colors.text }}>{`${view()} · ${align()}`}</Text>
            </Panel>
            <Log title="onValueChange" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <DemoSection title="Fill: the segments share the row" axis="block">
            <Tabs style={main.style} indicatorStyle={main.indicatorStyle}>
              {[{ value: "List", count: 12 }, { value: "Board" }, { value: "Calendar" }].map(
                (option) => (
                  <Tab
                    selected={view() === option.value}
                    accessibilityLabel={option.value}
                    onPress={() => {
                      view.set(option.value);
                      log(`value: ${option.value}`);
                    }}
                    {...main.segment({ selected: () => view() === option.value })}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text style={main.label(view() === option.value)}>{option.value}</Text>
                      <If when={option.count !== undefined}>
                        <Text style={main.count}>{option.count}</Text>
                      </If>
                    </View>
                  </Tab>
                ),
              )}
            </Tabs>
          </DemoSection>

          <DemoSection title="Small" axis="block">
            <Tabs style={compact.style} indicatorStyle={compact.indicatorStyle}>
              {["Left", "Center", "Right"].map((label) => (
                <Tab
                  selected={align() === label}
                  accessibilityLabel={label}
                  onPress={() => {
                    align.set(label);
                    log(`value: ${label}`);
                  }}
                  {...compact.segment({ selected: () => align() === label })}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text style={compact.label(align() === label)}>{label}</Text>
                  </View>
                </Tab>
              ))}
            </Tabs>
          </DemoSection>

          <DemoSection title="Disabled" axis="block">
            <Tabs style={compact.style} indicatorStyle={compact.indicatorStyle}>
              <Tab
                selected={false}
                disabled
                {...compact.segment({ selected: () => false, disabled: () => true })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={compact.label(false)}>Day</Text>
                </View>
              </Tab>
              <Tab selected {...compact.segment({ selected: () => true })}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={compact.label(true)}>Week</Text>
                </View>
              </Tab>
              <Tab selected={false} {...compact.segment({ selected: () => false })}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Text style={compact.label(false)}>Month</Text>
                </View>
              </Tab>
            </Tabs>
          </DemoSection>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
