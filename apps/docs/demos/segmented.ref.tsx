// The reference of `segmented.tsx`: the same page with `segmentedLook` on `nsh/base`'s Tabs.
import { mount, signal, Text } from "nsh";
import { Tab, Tabs } from "nsh/base";

import { segmentedLook } from "@/packages/ui/segmented";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const view = signal("List");
  const align = signal("Left");
  const main = segmentedLook({ fill: true });
  const compact = segmentedLook({ size: "small" });

  return (
    <DemoPage title="Segmented" note={() => `${view()} · ${align()}`}>
      <DemoCard>
        <DemoSection title="Fill">
          <Tabs style={main.style} indicatorStyle={main.indicatorStyle}>
            {(["List", "Board", "Calendar"] as const).map((label) => (
              <Tab
                selected={view() === label}
                onPress={() => view.set(label)}
                {...main.segment({ selected: () => view() === label })}
              >
                <Text style={main.label(view() === label)}>{label}</Text>
              </Tab>
            ))}
          </Tabs>
        </DemoSection>
        <DemoSection title="Small">
          <Tabs style={compact.style} indicatorStyle={compact.indicatorStyle}>
            {(["Left", "Center", "Right"] as const).map((label) => (
              <Tab
                selected={align() === label}
                onPress={() => align.set(label)}
                {...compact.segment({ selected: () => align() === label })}
              >
                <Text style={compact.label(align() === label)}>{label}</Text>
              </Tab>
            ))}
          </Tabs>
        </DemoSection>
        <DemoSection title="Counts">
          <Tabs style={main.style} indicatorStyle={main.indicatorStyle}>
            <Tab selected {...main.segment({ selected: () => true })}>
              <Text style={main.label(true)}>Inbox</Text>
              <Text style={main.count}>12</Text>
            </Tab>
            <Tab selected={false} {...main.segment({ selected: () => false })}>
              <Text style={main.label(false)}>Archive</Text>
            </Tab>
          </Tabs>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
