import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Toggle } from "@/packages/ui/toggle";
import { ToggleGroup } from "@/packages/ui/toggle-group";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/packages/ui/toolbar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

type Mark = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";
type Tool = "select" | "pen" | "shape" | "text";

function App() {
  const on = signal<Mark[]>(["bold"]);
  const align = signal<Align>("left");
  const tool = signal<Tool>("select");
  const history = signal<string[]>([]);
  const has = (m: Mark) => on().includes(m);

  return (
    <DemoPage title="Toolbar" note={() => `${on().join(",") || "none"} · ${align()} · ${tool()}`}>
      <DemoCard>
        <DemoSection title="Formatting">
          <Toolbar accessibilityLabel="Formatting" style={{ alignSelf: "flex-start" }}>
            <ToolbarGroup accessibilityLabel="History">
              <Button
                variant="ghost"
                accessibilityLabel="Undo"
                disabled={history().length === 0}
                onPress={() => history.set(history().slice(0, -1))}
              >
                Undo
              </Button>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToggleGroup inset={false}>
              <Toggle
                pressed={has("bold")}
                accessibilityLabel="Bold"
                onChange={({ pressed }) =>
                  on.set(pressed ? [...on(), "bold"] : on().filter((x) => x !== "bold"))
                }
              >
                B
              </Toggle>
              <Toggle
                pressed={has("italic")}
                accessibilityLabel="Italic"
                onChange={({ pressed }) =>
                  on.set(pressed ? [...on(), "italic"] : on().filter((x) => x !== "italic"))
                }
              >
                I
              </Toggle>
              <Toggle
                pressed={has("underline")}
                accessibilityLabel="Underline"
                onChange={({ pressed }) =>
                  on.set(pressed ? [...on(), "underline"] : on().filter((x) => x !== "underline"))
                }
              >
                U
              </Toggle>
            </ToggleGroup>
            <ToolbarSeparator />
            <ToolbarGroup accessibilityLabel="Alignment">
              <Toggle
                pressed={align() === "left"}
                accessibilityLabel="Align left"
                onChange={({ pressed }) => pressed && align.set("left")}
              >
                L
              </Toggle>
              <Toggle
                pressed={align() === "center"}
                accessibilityLabel="Align center"
                onChange={({ pressed }) => pressed && align.set("center")}
              >
                C
              </Toggle>
              <Toggle
                pressed={align() === "right"}
                accessibilityLabel="Align right"
                onChange={({ pressed }) => pressed && align.set("right")}
              >
                R
              </Toggle>
            </ToolbarGroup>
          </Toolbar>
        </DemoSection>
        <DemoSection title="Vertical">
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Toolbar axis="vertical" accessibilityLabel="Tools" style={{ alignSelf: "flex-start" }}>
              <Toggle
                pressed={tool() === "select"}
                accessibilityLabel="Select"
                onChange={({ pressed }) => pressed && tool.set("select")}
              >
                ↖
              </Toggle>
              <Toggle
                pressed={tool() === "pen"}
                accessibilityLabel="Pen"
                onChange={({ pressed }) => pressed && tool.set("pen")}
              >
                ✎
              </Toggle>
              <Toggle
                pressed={tool() === "shape"}
                accessibilityLabel="Rectangle"
                onChange={({ pressed }) => pressed && tool.set("shape")}
              >
                ▢
              </Toggle>
              <Toggle
                pressed={tool() === "text"}
                accessibilityLabel="Text"
                onChange={({ pressed }) => pressed && tool.set("text")}
              >
                T
              </Toggle>
            </Toolbar>
            <Text style={{ fontSize: 13, color: colors.muted, alignSelf: "center" }}>
              tool: {tool()}
            </Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
