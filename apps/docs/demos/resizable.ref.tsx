// The reference of `resizable.tsx`: `resizableHandleLook` on `nsh/base`'s ResizablePanelGroup.
import { mount, signal, Text, View } from "nsh";
import { ResizablePanel, ResizablePanelGroup } from "nsh/base";

import { resizableHandleLook } from "@/packages/ui/resizable";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const sidebar = signal(160);
  const look = resizableHandleLook("horizontal");

  return (
    <DemoPage title="Resizable" note={() => `Sidebar ${sidebar()}`}>
      <DemoCard>
        <DemoSection title="Horizontal">
          <ResizablePanelGroup
            axis="horizontal"
            style={{ height: 120 }}
            handleAccessibilityLabel="Resize the sidebar"
            handleClass={look.handleClass}
            handleThumbClass={look.handleThumbClass}
          >
            <ResizablePanel
              size={sidebar()}
              minSize={100}
              maxSize={240}
              onResize={({ size }) => sidebar.set(Math.round(size))}
            >
              <View style={{ flex: 1, padding: 12 }}>
                <Text>Files</Text>
              </View>
            </ResizablePanel>
            <ResizablePanel>
              <View style={{ flex: 1, padding: 12 }}>
                <Text>Editor</Text>
              </View>
            </ResizablePanel>
          </ResizablePanelGroup>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
