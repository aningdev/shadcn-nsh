// The reference of `toolbar.tsx`: the track and rule looks on `nsh/base`'s Toolbar parts.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Button, Toggle, ToggleGroup, Toolbar, ToolbarGroup, ToolbarSeparator } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { toggleLabel, toggleLook } from "@/packages/ui/toggle";
import { toolbarRule, toolbarTrack } from "@/packages/ui/toolbar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

type Mark = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";
type Tool = "select" | "pen" | "shape" | "text";

const group = { flexDirection: "row" as const, alignItems: "center" as const, gap: 2 };

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
          <Toolbar
            accessibilityLabel="Formatting"
            style={{ ...toolbarTrack(), alignSelf: "flex-start" }}
          >
            <ToolbarGroup accessibilityLabel="History" style={group}>
              <Button
                accessibilityLabel="Undo"
                disabled={history().length === 0}
                onPress={() => history.set(history().slice(0, -1))}
                {...buttonLook("ghost", { disabled: () => history().length === 0 })}
              >
                <Text style={buttonLabel("ghost", { disabled: () => history().length === 0 })}>
                  Undo
                </Text>
              </Button>
            </ToolbarGroup>
            <ToolbarSeparator style={toolbarRule()} />
            <ToggleGroup style={group}>
              <Toggle
                pressed={has("bold")}
                accessibilityLabel="Bold"
                onChange={({ pressed }) =>
                  on.set(pressed ? [...on(), "bold"] : on().filter((x) => x !== "bold"))
                }
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => has("bold"), { text: true })}>B</Text>
              </Toggle>
              <Toggle
                pressed={has("italic")}
                accessibilityLabel="Italic"
                onChange={({ pressed }) =>
                  on.set(pressed ? [...on(), "italic"] : on().filter((x) => x !== "italic"))
                }
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => has("italic"), { text: true })}>I</Text>
              </Toggle>
              <Toggle
                pressed={has("underline")}
                accessibilityLabel="Underline"
                onChange={({ pressed }) =>
                  on.set(pressed ? [...on(), "underline"] : on().filter((x) => x !== "underline"))
                }
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => has("underline"), { text: true })}>U</Text>
              </Toggle>
            </ToggleGroup>
            <ToolbarSeparator style={toolbarRule()} />
            <ToolbarGroup accessibilityLabel="Alignment" style={group}>
              <Toggle
                pressed={align() === "left"}
                accessibilityLabel="Align left"
                onChange={({ pressed }) => pressed && align.set("left")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => align() === "left", { text: true })}>L</Text>
              </Toggle>
              <Toggle
                pressed={align() === "center"}
                accessibilityLabel="Align center"
                onChange={({ pressed }) => pressed && align.set("center")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => align() === "center", { text: true })}>C</Text>
              </Toggle>
              <Toggle
                pressed={align() === "right"}
                accessibilityLabel="Align right"
                onChange={({ pressed }) => pressed && align.set("right")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => align() === "right", { text: true })}>R</Text>
              </Toggle>
            </ToolbarGroup>
          </Toolbar>
        </DemoSection>
        <DemoSection title="Vertical">
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Toolbar
              axis="vertical"
              accessibilityLabel="Tools"
              style={{ ...toolbarTrack({ vertical: true }), alignSelf: "flex-start" }}
            >
              <Toggle
                pressed={tool() === "select"}
                accessibilityLabel="Select"
                onChange={({ pressed }) => pressed && tool.set("select")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => tool() === "select", { text: true })}>↖</Text>
              </Toggle>
              <Toggle
                pressed={tool() === "pen"}
                accessibilityLabel="Pen"
                onChange={({ pressed }) => pressed && tool.set("pen")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => tool() === "pen", { text: true })}>✎</Text>
              </Toggle>
              <Toggle
                pressed={tool() === "shape"}
                accessibilityLabel="Rectangle"
                onChange={({ pressed }) => pressed && tool.set("shape")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => tool() === "shape", { text: true })}>▢</Text>
              </Toggle>
              <Toggle
                pressed={tool() === "text"}
                accessibilityLabel="Text"
                onChange={({ pressed }) => pressed && tool.set("text")}
                {...toggleLook({ text: true })}
              >
                <Text style={toggleLabel(() => tool() === "text", { text: true })}>T</Text>
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
