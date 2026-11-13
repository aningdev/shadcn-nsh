// The segmented control has no official example of its own (it is the inspector's option row in
// the official pages): the scene below is this library's, on the demo adapter the official
// examples are written against — the choices in a `Split`, their value in a `Panel`, every change
// in the `Log`.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

function App() {
  const view = signal("List");
  const align = signal("Left");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

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
            <Segmented
              value={view()}
              onValueChange={(next) => {
                view.set(next);
                log(`value: ${next}`);
              }}
            >
              <SegmentedList size="regular" fill>
                <SegmentedItem value="List" count={12}>
                  List
                </SegmentedItem>
                <SegmentedItem value="Board">Board</SegmentedItem>
                <SegmentedItem value="Calendar">Calendar</SegmentedItem>
              </SegmentedList>
            </Segmented>
          </DemoSection>

          <DemoSection title="Small" axis="block">
            <Segmented
              value={align()}
              onValueChange={(next) => {
                align.set(next);
                log(`value: ${next}`);
              }}
            >
              <SegmentedList size="small">
                <SegmentedItem value="Left">Left</SegmentedItem>
                <SegmentedItem value="Center">Center</SegmentedItem>
                <SegmentedItem value="Right">Right</SegmentedItem>
              </SegmentedList>
            </Segmented>
          </DemoSection>

          <DemoSection title="Disabled" axis="block">
            <Segmented defaultValue="Week">
              <SegmentedList size="small">
                <SegmentedItem value="Day" disabled>
                  Day
                </SegmentedItem>
                <SegmentedItem value="Week">Week</SegmentedItem>
                <SegmentedItem value="Month">Month</SegmentedItem>
              </SegmentedList>
            </Segmented>
          </DemoSection>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
