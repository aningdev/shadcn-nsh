import { mount, signal } from "nsh";

import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const view = signal("List");
  const align = signal("Left");

  return (
    <DemoPage title="Segmented" note={() => `${view()} · ${align()}`}>
      <DemoCard>
        <DemoSection title="Fill">
          <Segmented value={view()} onValueChange={(v) => view.set(v)} defaultValue="List">
            <SegmentedList fill>
              <SegmentedItem value="List">List</SegmentedItem>
              <SegmentedItem value="Board">Board</SegmentedItem>
              <SegmentedItem value="Calendar">Calendar</SegmentedItem>
            </SegmentedList>
          </Segmented>
        </DemoSection>
        <DemoSection title="Small">
          <Segmented value={align()} onValueChange={(v) => align.set(v)} defaultValue="Left">
            <SegmentedList size="small">
              <SegmentedItem value="Left">Left</SegmentedItem>
              <SegmentedItem value="Center">Center</SegmentedItem>
              <SegmentedItem value="Right">Right</SegmentedItem>
            </SegmentedList>
          </Segmented>
        </DemoSection>
        <DemoSection title="Counts">
          <Segmented defaultValue="inbox">
            <SegmentedList fill>
              <SegmentedItem value="inbox" count={12}>
                Inbox
              </SegmentedItem>
              <SegmentedItem value="archive">Archive</SegmentedItem>
            </SegmentedList>
          </Segmented>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
