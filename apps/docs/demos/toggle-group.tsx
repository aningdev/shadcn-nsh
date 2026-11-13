// The toggle group has no official example of its own: the scene below is this library's, on the
// demo adapter the official examples are written against (a `Split` with its inspector, a `Panel`
// of what the groups hold and a `Log` of every press). A group is a toolbar of toggles: the marks
// take any number at once, the alignment exactly one.
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { Toggle, ToggleGroup } from "@/packages/ui/toggle-group";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

type Align = "left" | "center" | "right";

function App() {
  const bold = signal(true);
  const italic = signal(false);
  const underline = signal(false);
  const align = signal<Align>("left");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  const marks = () =>
    [bold() ? "bold" : "", italic() ? "italic" : "", underline() ? "underline" : ""]
      .filter(Boolean)
      .join(", ") || "none";

  return (
    <DemoPage title="Toggle Group">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a toggle; Tab reaches a group and the arrow keys move inside it"
          : "Tap a toggle: a group is one stop of a screen reader"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="pressed">
              <Text style={{ fontSize: 13, color: ui().text }}>{`${marks()} · ${align()}`}</Text>
            </Panel>
            <Log title="onChange({ pressed })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <DemoSection title="Multiple: the marks, any number at once">
            <ToggleGroup>
              <Toggle
                pressed={bold()}
                onChange={({ pressed }) => {
                  bold.set(pressed);
                  log(`Bold: ${pressed}`);
                }}
              >
                Bold
              </Toggle>
              <Toggle
                pressed={italic()}
                onChange={({ pressed }) => {
                  italic.set(pressed);
                  log(`Italic: ${pressed}`);
                }}
              >
                Italic
              </Toggle>
              <Toggle
                pressed={underline()}
                onChange={({ pressed }) => {
                  underline.set(pressed);
                  log(`Underline: ${pressed}`);
                }}
              >
                Underline
              </Toggle>
            </ToggleGroup>
          </DemoSection>

          <DemoSection title="Single: the alignment, exactly one">
            <ToggleGroup>
              <Toggle
                pressed={align() === "left"}
                onChange={({ pressed }) => {
                  if (pressed) align.set("left");
                  log(`Left: ${pressed}`);
                }}
              >
                Left
              </Toggle>
              <Toggle
                pressed={align() === "center"}
                onChange={({ pressed }) => {
                  if (pressed) align.set("center");
                  log(`Center: ${pressed}`);
                }}
              >
                Center
              </Toggle>
              <Toggle
                pressed={align() === "right"}
                onChange={({ pressed }) => {
                  if (pressed) align.set("right");
                  log(`Right: ${pressed}`);
                }}
              >
                Right
              </Toggle>
            </ToggleGroup>
          </DemoSection>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            <DemoSection title="Vertical: Up and Down">
              <ToggleGroup vertical>
                <Toggle
                  pressed={bold()}
                  onChange={({ pressed }) => {
                    bold.set(pressed);
                    log(`Bold: ${pressed}`);
                  }}
                >
                  Bold
                </Toggle>
                <Toggle
                  pressed={italic()}
                  onChange={({ pressed }) => {
                    italic.set(pressed);
                    log(`Italic: ${pressed}`);
                  }}
                >
                  Italic
                </Toggle>
              </ToggleGroup>
            </DemoSection>

            <DemoSection title="Disabled">
              <ToggleGroup disabled>
                <Toggle pressed>On</Toggle>
                <Toggle>Off</Toggle>
              </ToggleGroup>
            </DemoSection>
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
