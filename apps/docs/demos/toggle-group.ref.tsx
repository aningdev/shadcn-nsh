// The reference of `toggle-group.tsx`: the track look on `nsh/base`'s ToggleGroup.
import { mount, signal, Text, View } from "nsh";
import { Toggle, ToggleGroup } from "nsh/base";

import { toggleLabel, toggleLook } from "@/packages/ui/toggle";
import { toolbarTrack } from "@/packages/ui/toolbar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const bold = signal(true);
  const italic = signal(false);
  const align = signal<"left" | "center" | "right">("left");

  return (
    <DemoPage
      title="Toggle Group"
      note={() => `${bold() ? "B" : ""}${italic() ? "I" : ""} · ${align()}`}
    >
      <DemoCard>
        <DemoSection title="Multiple">
          <ToggleGroup style={toolbarTrack()}>
            <Toggle
              pressed={bold()}
              onChange={({ pressed }) => bold.set(pressed)}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => bold(), { text: true })}>Bold</Text>
            </Toggle>
            <Toggle
              pressed={italic()}
              onChange={({ pressed }) => italic.set(pressed)}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => italic(), { text: true })}>Italic</Text>
            </Toggle>
          </ToggleGroup>
        </DemoSection>
        <DemoSection title="Single">
          <ToggleGroup style={toolbarTrack()}>
            <Toggle
              pressed={align() === "left"}
              onChange={({ pressed }) => pressed && align.set("left")}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => align() === "left", { text: true })}>Left</Text>
            </Toggle>
            <Toggle
              pressed={align() === "center"}
              onChange={({ pressed }) => pressed && align.set("center")}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => align() === "center", { text: true })}>Center</Text>
            </Toggle>
            <Toggle
              pressed={align() === "right"}
              onChange={({ pressed }) => pressed && align.set("right")}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => align() === "right", { text: true })}>Right</Text>
            </Toggle>
          </ToggleGroup>
        </DemoSection>
        <DemoSection title="Vertical">
          <ToggleGroup style={toolbarTrack({ vertical: true })}>
            <Toggle
              pressed={bold()}
              onChange={({ pressed }) => bold.set(pressed)}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => bold(), { text: true })}>Bold</Text>
            </Toggle>
            <Toggle
              pressed={italic()}
              onChange={({ pressed }) => italic.set(pressed)}
              {...toggleLook({ text: true })}
            >
              <Text style={toggleLabel(() => italic(), { text: true })}>Italic</Text>
            </Toggle>
          </ToggleGroup>
        </DemoSection>
        <DemoSection title="States">
          <View style={{ flexDirection: "row", gap: 12 }}>
            <ToggleGroup disabled style={toolbarTrack()}>
              <Toggle pressed {...toggleLook({ text: true })}>
                <Text style={toggleLabel(true, { text: true })}>On</Text>
              </Toggle>
              <Toggle {...toggleLook({ text: true })}>
                <Text style={toggleLabel(false, { text: true })}>Off</Text>
              </Toggle>
            </ToggleGroup>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
