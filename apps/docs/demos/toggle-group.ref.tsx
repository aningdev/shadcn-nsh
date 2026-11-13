// The reference of `toggle-group.tsx`: the same page with the track look (`toolbarTrack`) on
// `nsh/base`'s ToggleGroup and `toggleLook` on its toggles. The render check requires the two to
// draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Toggle, ToggleGroup } from "nsh/base";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { toggleLabel, toggleLook } from "@/packages/ui/toggle";
import { toolbarTrack } from "@/packages/ui/toolbar";

import { DemoSection, DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

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

  /** A toggle with a text label, in the toggles' ghost look. */
  const text = (label: string, pressed: () => boolean, onPress: (pressed: boolean) => void) => (
    <Toggle
      pressed={pressed()}
      onChange={({ pressed: next }) => onPress(next)}
      {...toggleLook({ text: true })}
    >
      <Text style={toggleLabel(pressed, { text: true })}>{label}</Text>
    </Toggle>
  );

  return (
    <DemoPage title="Toggle Group">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a toggle; Tab reaches a group and the arrow keys move inside it"
          : "Tap a toggle: a group is one stop of a screen reader"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="pressed">
              <Text style={{ fontSize: 13, color: colors.text }}>{`${marks()} · ${align()}`}</Text>
            </Panel>
            <Log title="onChange({ pressed })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <DemoSection title="Multiple: the marks, any number at once">
            <ToggleGroup style={toolbarTrack()}>
              {text("Bold", bold, (pressed) => {
                bold.set(pressed);
                log(`Bold: ${pressed}`);
              })}
              {text("Italic", italic, (pressed) => {
                italic.set(pressed);
                log(`Italic: ${pressed}`);
              })}
              {text("Underline", underline, (pressed) => {
                underline.set(pressed);
                log(`Underline: ${pressed}`);
              })}
            </ToggleGroup>
          </DemoSection>

          <DemoSection title="Single: the alignment, exactly one">
            <ToggleGroup style={toolbarTrack()}>
              {text(
                "Left",
                () => align() === "left",
                (pressed) => {
                  if (pressed) align.set("left");
                  log(`Left: ${pressed}`);
                },
              )}
              {text(
                "Center",
                () => align() === "center",
                (pressed) => {
                  if (pressed) align.set("center");
                  log(`Center: ${pressed}`);
                },
              )}
              {text(
                "Right",
                () => align() === "right",
                (pressed) => {
                  if (pressed) align.set("right");
                  log(`Right: ${pressed}`);
                },
              )}
            </ToggleGroup>
          </DemoSection>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            <DemoSection title="Vertical: Up and Down">
              <ToggleGroup style={toolbarTrack({ vertical: true })}>
                {text("Bold", bold, (pressed) => {
                  bold.set(pressed);
                  log(`Bold: ${pressed}`);
                })}
                {text("Italic", italic, (pressed) => {
                  italic.set(pressed);
                  log(`Italic: ${pressed}`);
                })}
              </ToggleGroup>
            </DemoSection>

            <DemoSection title="Disabled">
              <ToggleGroup disabled style={toolbarTrack()}>
                {text(
                  "On",
                  () => true,
                  () => {},
                )}
                {text(
                  "Off",
                  () => false,
                  () => {},
                )}
              </ToggleGroup>
            </DemoSection>
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
