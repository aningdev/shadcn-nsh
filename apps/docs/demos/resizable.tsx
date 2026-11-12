import { mount, signal, Text, View } from "nsh";

import { ResizablePanel, ResizablePanelGroup } from "@/packages/ui/resizable";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const sidebar = signal(160);

  return (
    <DemoPage title="Resizable" note={() => `Sidebar ${sidebar()}`}>
      <DemoCard>
        <DemoSection title="Horizontal">
          <ResizablePanelGroup
            style={{ height: 120 }}
            handleAccessibilityLabel="Resize the sidebar"
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
