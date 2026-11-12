import { mount, signal, View } from "nsh";

import { Toggle } from "@/packages/ui/toggle";
import { ToggleGroup } from "@/packages/ui/toggle-group";

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
          <ToggleGroup>
            <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
              Bold
            </Toggle>
            <Toggle pressed={italic()} onChange={({ pressed }) => italic.set(pressed)}>
              Italic
            </Toggle>
          </ToggleGroup>
        </DemoSection>
        <DemoSection title="Single">
          <ToggleGroup>
            <Toggle
              pressed={align() === "left"}
              onChange={({ pressed }) => pressed && align.set("left")}
            >
              Left
            </Toggle>
            <Toggle
              pressed={align() === "center"}
              onChange={({ pressed }) => pressed && align.set("center")}
            >
              Center
            </Toggle>
            <Toggle
              pressed={align() === "right"}
              onChange={({ pressed }) => pressed && align.set("right")}
            >
              Right
            </Toggle>
          </ToggleGroup>
        </DemoSection>
        <DemoSection title="Vertical">
          <ToggleGroup vertical>
            <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
              Bold
            </Toggle>
            <Toggle pressed={italic()} onChange={({ pressed }) => italic.set(pressed)}>
              Italic
            </Toggle>
          </ToggleGroup>
        </DemoSection>
        <DemoSection title="States">
          <View style={{ flexDirection: "row", gap: 12 }}>
            <ToggleGroup disabled>
              <Toggle pressed>On</Toggle>
              <Toggle>Off</Toggle>
            </ToggleGroup>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
