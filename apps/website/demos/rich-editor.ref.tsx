// The reference of `rich-editor.tsx`: the same scene on `nsh/base`'s RichEditor, the way the official
// example (`references/nsh/website/demos/el-rich-editor.tsx`) writes it, with
// `richEditorClasses` spread on it. It differs from the component page only in the parts it names.
import { colors, mono } from "@shadcn-nsh/theme";
import { Undo2 } from "lucide";
import { mount, signal, Text, View } from "nsh";
import { RichEditor } from "nsh/base";

import { Button, buttonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import {
  command,
  createRichEditor,
  redo,
  richEditorClasses,
  type RichCommand,
  StarterKit,
  undo,
} from "@/packages/ui/rich-editor";
import { Toggle } from "@/packages/ui/toggle";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/packages/ui/toolbar";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

const CONTENT = `# A document

Type **Markdown** as you go: \`#\` makes a heading, \`-\` a list, \`[ ]\` a task, each followed by a space.

- Select text and press Bold
- Undo and redo keep every step
`;

function App() {
  // The rich document: the session owns it, the view renders it, the toolbar runs its commands.
  const doc = createRichEditor({ extensions: [StarterKit], content: CONTENT, format: "markdown" });
  const markdown = signal(doc.getMarkdown());
  const revision = signal(0);
  const richEvents = signal<string[]>([]);
  const richLog = (line: string) => richEvents.set([line, ...richEvents()].slice(0, 4));
  doc.on("revision", ({ revision: r }) => {
    revision.set(r);
    markdown.set(doc.getMarkdown());
  });
  doc.on("focus", () => richLog("focus"));
  doc.on("blur", () => richLog("blur"));
  // Read again on every change of the session, the selection's included.
  const active = (name: string, attrs?: Record<string, unknown>) => (
    revision(),
    doc.isActive(name, attrs)
  );
  const can = (cmd: RichCommand) => (revision(), doc.can(cmd));
  const run = (cmd: RichCommand) => {
    doc.run(cmd);
    doc.focus();
  };

  /** A format that is on or off at the selection: a `Toggle`. */
  const format = (label: string, on: () => boolean, cmd: RichCommand) => (
    <Toggle size="sm" pressed={on()} onChange={() => run(cmd)}>
      {label}
    </Toggle>
  );
  /** An action (undo, redo): an icon button, named for screen readers, enabled while it can run. */
  const action = (label: string, cmd: () => RichCommand, mirrored?: boolean) => (
    <Button
      variant="ghost"
      size="sm"
      accessibilityLabel={label}
      disabled={!can(cmd())}
      onPress={() => run(cmd())}
    >
      <View style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Icon icon={Undo2} {...buttonGlyph("ghost", { size: "sm", disabled: () => !can(cmd()) })} />
      </View>
    </Button>
  );

  return (
    <DemoPage title="Rich editor">
      <Text style={{ color: colors.mutedForeground }}>
        {desktop
          ? "Click into the document and type; Cmd/Ctrl+B makes bold"
          : "Tap into the document and type"}
      </Text>
      <Split
        width={640}
        gap={14}
        inspector={
          <>
            <Panel title="markdown">
              <Text style={{ fontSize: 12, fontFamily: mono(), color: colors.foreground }}>
                {markdown()}
              </Text>
            </Panel>
            <Log title="events" lines={richEvents()} minHeight={72} />
          </>
        }
      >
        <Toolbar
          accessibilityLabel="Formatting"
          style={{ alignSelf: "flex-start", flexWrap: "wrap" }}
        >
          <ToolbarGroup style={{ flexDirection: "row", gap: 2 }}>
            {format("Bold", () => active("bold"), command("toggleBold"))}
            {format("Italic", () => active("italic"), command("toggleItalic"))}
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup style={{ flexDirection: "row", gap: 2 }}>
            {format(
              "Heading",
              () => active("heading", { level: 2 }),
              command("toggleHeading", { level: 2 }),
            )}
            {format("List", () => active("bulletList"), command("toggleBulletList"))}
            {format("Task", () => active("taskList"), command("toggleTaskList"))}
          </ToolbarGroup>
          <ToolbarSeparator />
          {action("Undo", undo)}
          {action("Redo", redo, true)}
        </Toolbar>
        <View style={{ height: wide() ? 360 : 300, ...sectionSurface(), overflow: "hidden" }}>
          <RichEditor
            editor={doc}
            accessibilityLabel="Document"
            placeholder="Write something"
            classes={richEditorClasses}
            style={{ flex: 1 }}
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
