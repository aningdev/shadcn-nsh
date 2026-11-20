// The reference of `toolbar.tsx`: the same scene as upstream writes it, `toolbarTrack` /
// `toolbarRule` on `nsh/base`'s Toolbar parts and the looks on its Buttons and Toggles. The
// render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { Redo2, Undo2 } from "lucide";
import { mount, signal, Text, View } from "nsh";
import { Button, Toggle, ToggleGroup, Toolbar, ToolbarGroup, ToolbarSeparator } from "nsh/base";

import { buttonLook } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { toolbarTrack } from "@/packages/ui/lib/tool";
import {
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@/packages/ui/menu";
import { toggleGlyph, toggleLabel, toggleLook } from "@/packages/ui/toggle";
import { toolbarRule } from "@/packages/ui/toolbar";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Split, wide } from "./stage";

type Mark = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";
type Tool = "select" | "pen" | "shape" | "text";
type Block = "Paragraph" | "Heading" | "Quote";

/** What a formatting bar sets, all at once: undo walks it back and forth. */
type Doc = { marks: Mark[]; align: Align; block: Block };

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
const blocks: { value: Block; glyph: string }[] = [
  { value: "Paragraph", glyph: "¶" },
  { value: "Heading", glyph: "H" },
  { value: "Quote", glyph: "“" },
];
/** The alignment in words, for the line under the text. */
const aligned: Record<Align, string> = {
  left: "left aligned",
  center: "centered",
  right: "right aligned",
};
/** The paragraph a formatting bar formats. */
const LINE = "Marks, blocks and alignment, one Tab stop apart.";
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

  // A formatting bar over the text it formats: one document, the states it has had, and the
  // states undone out of it.
  const doc = signal<Doc>({ marks: ["bold"], align: "left", block: "Paragraph" });
  const past = signal<Doc[]>([]);
  const future = signal<Doc[]>([]);
  const blockOpen = signal(false);
  const lastEdit = signal("no edits");
  const commit = (next: Partial<Doc>, what: string) => {
    past.set([...past(), doc()].slice(-20));
    future.set([]);
    doc.set({ ...doc(), ...next });
    lastEdit.set(what);
  };
  const undo = () => {
    const previous = past().at(-1);
    if (previous === undefined) return;
    future.set([doc(), ...future()]);
    past.set(past().slice(0, -1));
    doc.set(previous);
    lastEdit.set("Undo");
  };
  const redo = () => {
    const next = future()[0];
    if (next === undefined) return;
    past.set([...past(), doc()]);
    future.set(future().slice(1));
    doc.set(next);
    lastEdit.set("Redo");
  };
  const marked = (m: Mark) => doc().marks.includes(m);
  // A block sets the text's size and weight (a heading), its slant (a quote), the line it stands on.
  const set = () => {
    const block = doc().block;
    return {
      color: colors.foreground,
      textAlign: doc().align,
      fontSize: block === "Heading" ? 22 : 15,
      lineHeight: block === "Heading" ? 30 : 22,
      fontWeight: block === "Heading" || marked("bold") ? "700" : "400",
      fontStyle: block === "Quote" || marked("italic") ? "italic" : "normal",
      textDecorationLine: marked("underline") ? "underline" : "none",
    } as const;
  };
  const glyph = (text: string, active: () => boolean) => (
    <Text style={{ ...toggleLabel(active), fontWeight: "600" }}>{text}</Text>
  );

  return (
    <DemoPage title="Toolbar">
      <Text style={{ color: colors.mutedForeground }}>
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
                color: colors.foreground,
                fontWeight: has("bold") ? "700" : "400",
                fontStyle: has("italic") ? "italic" : "normal",
                textDecorationLine: has("underline") ? "underline" : "none",
                textAlign: align(),
              }}
            >
              One stop of Tab per toolbar; its arrows move between the tools.
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              {`Tool: ${tools.find((t) => t.id === tool())!.label}`}
            </Text>
          </View>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="A formatting bar" axis="block">
          <Text style={{ color: colors.mutedForeground }}>
            History, the block, the marks, the alignment: a bar of runs, a hairline between them.
            Undo and Redo gray out at the ends of the history; the block is a menu whose trigger is
            one of the bar's items, so the arrows reach it and Space or Return opens it.
          </Text>
          <Toolbar
            accessibilityLabel="Formatting"
            style={{
              ...toolbarTrack(),
              alignSelf: "flex-start",
              maxWidth: "100%",
              flexWrap: "wrap",
            }}
          >
            <ToolbarGroup accessibilityLabel="History" style={group}>
              <Button
                accessibilityLabel="Undo"
                disabled={past().length === 0}
                onPress={undo}
                {...buttonLook("ghost", { disabled: () => past().length === 0 })}
              >
                <Icon icon={Undo2} {...toggleGlyph(() => true)} />
              </Button>
              <Button
                accessibilityLabel="Redo"
                disabled={future().length === 0}
                onPress={redo}
                {...buttonLook("ghost", { disabled: () => future().length === 0 })}
              >
                <Icon icon={Redo2} {...toggleGlyph(() => true)} />
              </Button>
            </ToolbarGroup>
            <ToolbarSeparator style={toolbarRule()} />
            <Menu open={blockOpen()} onOpenChange={({ open }) => blockOpen.set(open)}>
              <MenuTrigger>
                <View
                  role="button"
                  accessibilityLabel={`Block: ${doc().block}`}
                  accessibilityState={{ expanded: blockOpen() }}
                  {...toggleLook({ on: blockOpen, text: true })}
                >
                  <Text style={{ fontSize: 14, color: colors.foreground }}>
                    {blocks.find((b) => b.value === doc().block)!.glyph}
                  </Text>
                  {wide() ? <Text style={toggleLabel(blockOpen)}>{doc().block}</Text> : null}
                  <Text style={{ fontSize: 9, color: colors.faint }}>
                    {blockOpen() ? "▴" : "▾"}
                  </Text>
                </View>
              </MenuTrigger>
              <MenuContent>
                <MenuLabel>Turn into</MenuLabel>
                <MenuSeparator />
                {blocks.map((b) => (
                  <MenuRadioItem
                    checked={doc().block === b.value}
                    onSelect={() => commit({ block: b.value }, `Block: ${b.value}`)}
                  >
                    {b.value}
                  </MenuRadioItem>
                ))}
              </MenuContent>
            </Menu>
            <ToolbarSeparator style={toolbarRule()} />
            <ToggleGroup style={group}>
              {marks.map((m) => (
                <Toggle
                  pressed={marked(m.id)}
                  accessibilityLabel={m.label}
                  onChange={({ pressed }) =>
                    commit(
                      {
                        marks: pressed
                          ? [...doc().marks, m.id]
                          : doc().marks.filter((x) => x !== m.id),
                      },
                      `${m.label}: ${pressed ? "on" : "off"}`,
                    )
                  }
                  {...toggleLook()}
                >
                  {glyph(m.glyph, () => marked(m.id))}
                </Toggle>
              ))}
            </ToggleGroup>
            <ToolbarSeparator style={toolbarRule()} />
            <ToolbarGroup accessibilityLabel="Alignment" style={{ ...group, gap: 2 }}>
              {aligns.map((a) => (
                <Toggle
                  pressed={doc().align === a.id}
                  accessibilityLabel={a.label}
                  onChange={({ pressed }) => {
                    // Exactly one: the pressed alignment stays pressed.
                    if (pressed) commit({ align: a.id }, a.label);
                  }}
                  {...toggleLook()}
                >
                  {glyph(a.glyph, () => doc().align === a.id)}
                </Toggle>
              ))}
            </ToolbarGroup>
          </Toolbar>

          <View
            style={{
              ...sectionSurface({ padded: true }),
              gap: 8,
              ...(doc().block === "Quote"
                ? { borderLeftWidth: 2, borderLeftColor: colors.brand, paddingLeft: 12 }
                : {}),
            }}
          >
            <Text style={set()}>{LINE}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {`${doc().block}, ${aligned[doc().align]} · ${doc().marks.join(", ") || "no marks"} · ${lastEdit()} · ${past().length} back, ${future().length} forward`}
            </Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
