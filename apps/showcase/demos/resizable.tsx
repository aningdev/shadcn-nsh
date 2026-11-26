import { colors } from "@shadcn-nsh/theme";
// Resizable: the official gallery's scene (`references/nsh/examples/gallery/demos/Resizable.tsx`)
// with this library's panels — a sidebar beside an editor over a console, each handle dragged
// within the panels' ranges, the console hidden and brought back at its size.
import { signal, Text, untracked, View, windowSize } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { ResizablePanel, ResizablePanelGroup } from "@/packages/ui/resizable";
import { Toggle } from "@/packages/ui/toggle";

import { hint } from "./documents-shared";

/** Two panels' sizes in words: `sidebar 220 pt, editor area 580 pt`. */
const sized = (names: [string, string], sizes: number[]) =>
  names.map((name, i) => `${name} ${Math.round(sizes[i] ?? 0)} pt`).join(", ");

/** A panel's title, what it does and its size now. */
function Pane(props: { title: string; detail: string; size?: string }) {
  return (
    <View style={{ flex: 1, gap: 4, padding: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        {props.title}
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.detail}</Text>
      <If when={props.size}>
        <Text
          style={{
            fontSize: 12,
            color: colors.mutedForeground,
            fontVariant: ["tabular-nums"],
            numberOfLines: 1,
          }}
        >
          {props.size}
        </Text>
      </If>
    </View>
  );
}

/** Panels resized by dragging the lines between them. The shell's flex view is the frame. */
export function ResizableDemo() {
  // A phone leaves the editor room beside the sidebar.
  const sidebar = signal(untracked(windowSize).width < 600 ? 130 : 220);
  const consoleSize = signal(140);
  const shown = signal(true);
  const last = signal<string | null>(null);

  return (
    <View style={{ flex: 1, gap: 12, padding: 16, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: 14, color: colors.mutedForeground }}>
          {hint(
            "Drag a line between two panels with your finger",
            "Drag a line between two panels",
          )}
        </Text>
        <Toggle
          pressed={shown()}
          text
          size="sm"
          accessibilityLabel={shown() ? "Hide the console" : "Show the console"}
          onChange={() => shown.set(!shown())}
        >
          Console
        </Toggle>
      </View>
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          ...sectionSurface(),
          backgroundColor: colors.background,
        }}
      >
        <ResizablePanelGroup
          axis="horizontal"
          handleAccessibilityLabel="Resize the sidebar"
          onResize={({ sizes }) => last.set(sized(["sidebar", "editor area"], sizes))}
        >
          <ResizablePanel
            size={sidebar()}
            minSize={120}
            maxSize={360}
            onResize={({ size }) => sidebar.set(size)}
          >
            <View style={{ flex: 1, backgroundColor: colors.muted }}>
              <Pane
                title="Files"
                detail="120 to 360 pt"
                size={`${Math.round(sidebar())} pt wide`}
              />
            </View>
          </ResizablePanel>
          <ResizablePanel minSize={160}>
            <ResizablePanelGroup
              axis="vertical"
              handleAccessibilityLabel="Resize the console"
              onResize={({ sizes }) => last.set(sized(["editor", "console"], sizes))}
            >
              <ResizablePanel minSize={80}>
                <Pane title="Editor" detail="Takes the room the others leave" />
              </ResizablePanel>
              <ResizablePanel
                size={consoleSize()}
                minSize={60}
                visible={shown()}
                onResize={({ size }) => consoleSize.set(size)}
              >
                <View style={{ flex: 1, backgroundColor: colors.muted }}>
                  <Pane
                    title="Console"
                    detail="Keeps its size while hidden"
                    size={`${Math.round(consoleSize())} pt tall`}
                  />
                </View>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </View>
      <If when={last()}>
        <Text
          style={{ fontSize: 12, color: colors.mutedForeground }}
        >{`Last resize: ${last()}`}</Text>
      </If>
    </View>
  );
}
