import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { ResizablePanel, ResizablePanelGroup } from "@/packages/ui/resizable";

function App() {
  const sidebar = signal(160);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        {`Sidebar ${sidebar()}`}
      </Text>
      <ResizablePanelGroup style={{ height: 120 }} handleAccessibilityLabel="Resize the sidebar">
        <ResizablePanel
          size={sidebar()}
          minSize={100}
          maxSize={240}
          onResize={(event) => sidebar.set(Math.round(event.size))}
        >
          <Text style={{ color: colors.foreground }}>Files</Text>
        </ResizablePanel>
        <ResizablePanel>
          <Text style={{ color: colors.foreground }}>Editor</Text>
        </ResizablePanel>
      </ResizablePanelGroup>
    </View>
  );
}

mount(App);
