// The reference of `toolbar.tsx`: the same scene as upstream writes it, `toolbarTrack` /
// `toolbarRule` on `nsh/base`'s Toolbar parts and the looks on its Buttons and Toggles. The
// render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { Undo2 } from "lucide";
import { mount, signal, Text, View } from "nsh";
import { Button, Toggle, ToggleGroup, Toolbar, ToolbarGroup, ToolbarSeparator } from "nsh/base";

import { buttonLook } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { toggleGlyph, toggleLabel, toggleLook } from "@/packages/ui/toggle";
import { toolbarRule, toolbarTrack } from "@/packages/ui/toolbar";

import { DemoPage } from "./kit";
import { desktop, Log, Split } from "./stage";

type Mark = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";
type Tool = "select" | "pen" | "shape" | "text";

const marks: { id: Mark; label: string; glyph: string }[] = [
  { id: "bold", label: "Bold", glyph: "B" },
  { id: "italic", label: "Italic", glyph: "I" },
  { id: "underline", label: "Underline", glyph: "U" },
];
const aligns: { id: Align; label: string; glyph: string }[] = [
  { id: "left", label: "Align left", glyph: "⇤" },
  { id: "center", label: "Align center", glyph: "↔" },
  { id: "right", label: "Align right", glyph: "⇥" },
];
const tools: { id: Tool; label: string; glyph: string }[] = [
  { id: "select", label: "Select", glyph: "↖" },
  { id: "pen", label: "Pen", glyph: "✎" },
  { id: "shape", label: "Rectangle", glyph: "▢" },
  { id: "text", label: "Text", glyph: "T" },
];

/** The run of items, as the shell's `ToolbarGroup` lays it out. */
const group = { flexDirection: "row" as const, alignItems: "center" as const, gap: 2 };

function App() {
  const on = signal<Mark[]>(["bold"]);
  const align = signal<Align>("left");
  const tool = signal<Tool>("select");
  const history = signal<string[]>([]);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const edit = (what: string) => {
    history.set([...history(), what]);
    log(what);
  };
  const has = (m: Mark) => on().includes(m);
  const glyph = (text: string, active: () => boolean) => (
    <Text style={{ ...toggleLabel(active), fontWeight: "600" }}>{text}</Text>
  );

  return (
    <DemoPage title="Toolbar">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Tab into a toolbar, then move with the arrow keys; Home and End jump to its ends"
          : "Tap the tools; a screen reader hears each bar as a toolbar"}
      </Text>

      <Split
        gap={14}
        inspector={
          <Log
            title={`${history().length} edits · ${on().join(", ") || "no marks"}, ${align()} · ${tool()}`}
            lines={events()}
            minHeight={76}
          />
        }
      >
        <Toolbar
          accessibilityLabel="Formatting"
          style={{ ...toolbarTrack(), alignSelf: "flex-start" }}
        >
          <ToolbarGroup accessibilityLabel="History" style={group}>
            <Button
              accessibilityLabel="Undo"
              disabled={history().length === 0}
              onPress={() => {
                history.set(history().slice(0, -1));
                log("Undo");
              }}
              {...buttonLook("ghost", { disabled: () => history().length === 0 })}
            >
              <Icon icon={Undo2} {...toggleGlyph(() => true)} />
            </Button>
          </ToolbarGroup>
          <ToolbarSeparator style={toolbarRule()} />
          <ToggleGroup style={group}>
            {marks.map((m) => (
              <Toggle
                pressed={has(m.id)}
                accessibilityLabel={m.label}
                onChange={({ pressed }) => {
                  on.set(pressed ? [...on(), m.id] : on().filter((x) => x !== m.id));
                  edit(`${m.label}: ${pressed}`);
                }}
                {...toggleLook()}
              >
                {glyph(m.glyph, () => has(m.id))}
              </Toggle>
            ))}
          </ToggleGroup>
          <ToolbarSeparator style={toolbarRule()} />
          <ToolbarGroup accessibilityLabel="Alignment" style={{ ...group, gap: 2 }}>
            {aligns.map((a) => (
              <Toggle
                pressed={align() === a.id}
                accessibilityLabel={a.label}
                onChange={({ pressed }) => {
                  // Exactly one: the pressed alignment stays pressed.
                  if (pressed) align.set(a.id);
                  edit(`${a.label}`);
                }}
                {...toggleLook()}
              >
                {glyph(a.glyph, () => align() === a.id)}
              </Toggle>
            ))}
          </ToolbarGroup>
        </Toolbar>

        <View style={{ flexDirection: "row", gap: 14, alignItems: "stretch" }}>
          <Toolbar
            axis="vertical"
            accessibilityLabel="Tools"
            style={{ ...toolbarTrack({ vertical: true }), alignSelf: "flex-start" }}
          >
            {tools.map((t) => (
              <Toggle
                pressed={tool() === t.id}
                accessibilityLabel={t.label}
                onChange={({ pressed }) => {
                  if (!pressed) return;
                  tool.set(t.id);
                  log(`Tool: ${t.label}`);
                }}
                {...toggleLook()}
              >
                {glyph(t.glyph, () => tool() === t.id)}
              </Toggle>
            ))}
            <ToolbarSeparator style={toolbarRule(true)} />
            <Button
              accessibilityLabel="Clear canvas"
              onPress={() => log("Clear canvas")}
              {...buttonLook("ghost")}
            >
              {glyph("⌫", () => false)}
            </Button>
          </Toolbar>
          <View style={{ flex: 1, ...sectionSurface({ padded: true }), gap: 6 }}>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22,
                color: colors.text,
                fontWeight: has("bold") ? "700" : "400",
                fontStyle: has("italic") ? "italic" : "normal",
                textDecorationLine: has("underline") ? "underline" : "none",
                textAlign: align(),
              }}
            >
              One stop of Tab per toolbar; its arrows move between the tools.
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted }}>
              {`Tool: ${tools.find((t) => t.id === tool())!.label}`}
            </Text>
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
