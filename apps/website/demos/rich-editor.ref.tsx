// The reference of `rich-editor.tsx`: the same scene on `nsh/base`'s RichEditor, the way the official
// example (`references/nsh/website/demos/el-rich-editor.tsx`) writes it, with
// `richEditorClasses` spread on it. It differs from the component page only in the parts it names.
import { colors, mono } from "@shadcn-nsh/theme";
import { Check, ExternalLink, Pencil, Undo2, Unlink, X } from "lucide";
import { mount, openUrl, signal, Text, type TextStyle, View } from "nsh";
import { RichEditor } from "nsh/base";

import { Button, buttonGlyph, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/packages/ui/menu";
import { popoverLook } from "@/packages/ui/popover";
import {
  chain,
  command,
  createRichEditor,
  defineExtension,
  extendMarkRange,
  redo,
  richEditorClasses,
  type RichCommand,
  type RichNodeJSON,
  type RichNodeViewProps,
  StarterKit,
  undo,
} from "@/packages/ui/rich-editor";
import { Toggle, toggleLabel } from "@/packages/ui/toggle";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/packages/ui/toolbar";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

const CONTENT = `# A document

Type **Markdown** as you go: \`#\` makes a heading, \`-\` a list, \`[ ]\` a task, each followed by a space.

- Select text and press Bold
- Undo and redo keep every step
`;

/** The notes the bar's document starts as. */
const NOTES = `## Notes

A bar reads the caret: the block it is in, the marks it carries, the list around it.

1. Press **Bold** with nothing selected and type
2. Indent a list item with the arrow
3. Undo it all with the first button
`;

/** What the link bubble's document starts as: a list of links. */
const READING = `## Reading list

- [The Design Guides](https://nsh.dev/design)
- [shadcn/ui](https://ui.shadcn.com)

Click into a link: the bubble above it holds its address, to edit, open or remove.
`;

/** The mentions a chip can hold: teams. */
const TEAMS = { runtime: "Runtime", design: "Design", docs: "Docs" } as const;

type Team = keyof typeof TEAMS;

const mention = (key: Team): RichNodeJSON => ({
  type: "mention",
  attrs: { name: TEAMS[key] },
});
const words = (value: string): RichNodeJSON => ({ type: "text", text: value });

/** What the node view's document starts as: a paragraph with two mentions in it. */
const CHAT: RichNodeJSON = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        words("Ask "),
        mention("runtime"),
        words(" about the engine, and "),
        mention("design"),
        words(" about the compiler."),
      ],
    },
  ],
};

/** A mention in the text: the app's own view of every `mention` node, ringed while it is selected. */
function MentionChip(props: RichNodeViewProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 5,
        borderRadius: 5,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: props.selected ? colors.primaryForeground : "transparent",
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primaryForeground }}>@</Text>
      <Text style={{ fontSize: 13, color: colors.primaryForeground }}>
        {String(props.node.attrs.name ?? "")}
      </Text>
    </View>
  );
}

const Mention = defineExtension({
  name: "mention",
  node: { group: "inline", inline: true, atom: true, attrs: { name: { default: "" } } },
  addNodeView: () => MentionChip,
});

/** The chips sit on the text's line, not above it. */
const chatClasses = {
  ...richEditorClasses,
  nodes: { ...richEditorClasses.nodes, mention: "align-middle" },
};

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

  // The bar's document: a session of its own, the controls reading the caret's place in it.
  const notes = createRichEditor({
    extensions: [StarterKit],
    content: NOTES,
    format: "markdown",
  });
  const edits = signal(notes.revision);
  const characters = signal(notes.getText().length);
  notes.on("revision", ({ revision: r }) => {
    edits.set(r);
    characters.set(notes.getText().length);
  });
  const notesOn = (name: string, attrs?: Record<string, unknown>) => (
    edits(),
    notes.isActive(name, attrs)
  );
  const notesCan = (cmd: RichCommand) => (edits(), notes.can(cmd));
  const notesRun = (cmd: RichCommand) => {
    notes.run(cmd);
    notes.focus();
  };
  /** A control of the bar that lights up where the caret stands: a `Toggle` that runs the command. */
  const control = (
    glyphText: string,
    label: string,
    ink: TextStyle,
    on: () => boolean,
    cmd: RichCommand,
  ) => (
    <Toggle
      size="sm"
      pressed={on()}
      accessibilityLabel={label}
      disabled={!notesCan(cmd)}
      onChange={() => notesRun(cmd)}
    >
      <Text style={{ ...toggleLabel(on), ...ink }}>{glyphText}</Text>
    </Toggle>
  );
  /** An icon action of the bar (undo, redo, the indents), enabled while its command can run. */
  const step = (label: string, glyphText: string, cmd: RichCommand) => (
    <Button
      variant="ghost"
      size="sm"
      accessibilityLabel={label}
      disabled={!notesCan(cmd)}
      onPress={() => notesRun(cmd)}
    >
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{glyphText}</Text>
    </Button>
  );
  // The link bubble's document: the bubble is the editor's, filled by the app while the caret is in
  // a link (or while its address is being written).
  const reading = createRichEditor({
    extensions: [StarterKit],
    content: READING,
    format: "markdown",
  });
  const readingRevision = signal(reading.revision);
  reading.on("revision", ({ revision: r }) => readingRevision.set(r));
  const editing = signal(false);
  const draft = signal("");
  const linked = () => (readingRevision(), reading.isActive("link"));
  const href = () => {
    readingRevision();
    const value = (reading.getAttributes("link") as { href?: unknown } | null)?.href;
    return typeof value === "string" ? value : "";
  };
  const editLink = () => {
    draft.set(href());
    editing.set(true);
  };
  const closeLink = () => {
    editing.set(false);
    // After this key: on the web the Return that submitted the field is still being handled, and
    // an editor focused now would take it too (and write a line break into the link).
    setTimeout(() => reading.focus(), 0);
  };
  const applyLink = () => {
    const url = draft().trim();
    if (!url) reading.run(chain([extendMarkRange("link"), command("unsetLink")]));
    else reading.run(chain([extendMarkRange("link"), command("setLink", { href: url })]));
    closeLink();
  };
  const removeLink = () => {
    reading.run(chain([extendMarkRange("link"), command("unsetLink")]));
    reading.focus();
  };
  /** The bubble: the address and its actions, or the field that writes it. */
  const bubble = (
    <View
      style={{
        ...popoverLook({ compact: true }),
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        padding: 4,
      }}
    >
      {editing() ? (
        <>
          <Input
            value={draft()}
            onChange={({ value }) => draft.set(value)}
            onSubmit={applyLink}
            submitBehavior="submit"
            placeholder="https://"
            accessibilityLabel="Link address"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            autoFocus
            style={{ width: 220 }}
          />
          <IconButton accessibilityLabel="Apply link" size="sm" onPress={applyLink}>
            <Icon icon={Check} {...iconButtonGlyph({ size: "sm" })} />
          </IconButton>
          <IconButton accessibilityLabel="Cancel" size="sm" onPress={closeLink}>
            <Icon icon={X} {...iconButtonGlyph({ size: "sm" })} />
          </IconButton>
        </>
      ) : (
        <>
          <Text
            style={{
              fontSize: 13,
              color: colors.info,
              maxWidth: 240,
              paddingHorizontal: 8,
              numberOfLines: 1,
            }}
          >
            {href()}
          </Text>
          <IconButton accessibilityLabel="Edit link" size="sm" onPress={editLink}>
            <Icon icon={Pencil} {...iconButtonGlyph({ size: "sm" })} />
          </IconButton>
          <IconButton accessibilityLabel="Open link" size="sm" onPress={() => void openUrl(href())}>
            <Icon icon={ExternalLink} {...iconButtonGlyph({ size: "sm" })} />
          </IconButton>
          <IconButton accessibilityLabel="Remove link" size="sm" onPress={removeLink}>
            <Icon icon={Unlink} {...iconButtonGlyph({ size: "sm" })} />
          </IconButton>
        </>
      )}
    </View>
  );

  // The node view's document: every `mention` node is drawn by the app's own chip.
  const chat = createRichEditor({ extensions: [StarterKit, Mention], doc: CHAT });
  const chatRevision = signal(chat.revision);
  chat.on("revision", ({ revision: r }) => chatRevision.set(r));
  const mentioned = () => {
    chatRevision();
    return JSON.stringify(chat.getJSON()).split('"type":"mention"').length - 1;
  };
  const insertMention = (key: Team) => {
    chat.insertContent(mention(key));
    chat.focus();
  };

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

      <DemoCard>
        <DemoSection title="A formatting toolbar" axis="block">
          <Text style={{ color: colors.mutedForeground }}>
            Every control reads the caret: the block it stands in, the marks it carries, the list
            around it, and grays out where its command cannot run. A press runs the command, then
            puts the caret back into the document.
          </Text>
          <Toolbar
            accessibilityLabel="Formatting"
            style={{ flexWrap: "wrap", alignSelf: "flex-start" }}
          >
            <ToolbarGroup accessibilityLabel="History" style={{ flexDirection: "row", gap: 2 }}>
              {step("Undo", "↶", undo())}
              {step("Redo", "↷", redo())}
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup accessibilityLabel="Block" style={{ flexDirection: "row", gap: 2 }}>
              {control(
                "¶",
                "Paragraph",
                { fontSize: 15 },
                () => notesOn("paragraph"),
                command("setParagraph"),
              )}
              {control(
                "H1",
                "Heading 1",
                {},
                () => notesOn("heading", { level: 1 }),
                command("toggleHeading", { level: 1 }),
              )}
              {control(
                "H2",
                "Heading 2",
                {},
                () => notesOn("heading", { level: 2 }),
                command("toggleHeading", { level: 2 }),
              )}
              {control(
                "❝",
                "Quote",
                { fontSize: 14 },
                () => notesOn("blockquote"),
                command("toggleBlockquote"),
              )}
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup accessibilityLabel="Marks" style={{ flexDirection: "row", gap: 2 }}>
              {control(
                "B",
                "Bold",
                { fontWeight: "700" },
                () => notesOn("bold"),
                command("toggleBold"),
              )}
              {control(
                "I",
                "Italic",
                { fontStyle: "italic" },
                () => notesOn("italic"),
                command("toggleItalic"),
              )}
              {control(
                "S",
                "Strikethrough",
                { textDecorationLine: "line-through" },
                () => notesOn("strike"),
                command("toggleStrike"),
              )}
              {control(
                "</>",
                "Inline code",
                { fontSize: 11, fontFamily: mono() },
                () => notesOn("code"),
                command("toggleCode"),
              )}
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup accessibilityLabel="Lists" style={{ flexDirection: "row", gap: 2 }}>
              {control(
                "•",
                "Bulleted list",
                { fontSize: 16 },
                () => notesOn("bulletList"),
                command("toggleBulletList"),
              )}
              {control(
                "1.",
                "Numbered list",
                {},
                () => notesOn("orderedList"),
                command("toggleOrderedList"),
              )}
              {control(
                "☐",
                "Task list",
                { fontSize: 14 },
                () => notesOn("taskList"),
                command("toggleTaskList"),
              )}
              {step("Outdent", "⇤", command("liftListItem", { name: "listItem" }))}
              {step("Indent", "⇥", command("sinkListItem", { name: "listItem" }))}
            </ToolbarGroup>
          </Toolbar>
          <View style={{ height: wide() ? 240 : 200, ...sectionSurface(), overflow: "hidden" }}>
            <RichEditor
              editor={notes}
              accessibilityLabel="Notes"
              placeholder="Write something"
              classes={richEditorClasses}
              style={{ flex: 1 }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {`${characters().toLocaleString("en-US")} characters · revision ${edits()}`}
          </Text>
        </DemoSection>
      </DemoCard>

      <DemoCard>
        <DemoSection title="A link bubble" axis="block">
          <Text style={{ color: colors.mutedForeground }}>
            The bubble is the editor's, filled by the app: it stands over the selection, flips below
            it where there is no room, and follows the text as it scrolls. This one stands while the
            caret is in a link, or while its address is being written.
          </Text>
          <View style={{ height: wide() ? 180 : 170, ...sectionSurface(), overflow: "hidden" }}>
            <RichEditor
              editor={reading}
              accessibilityLabel="Reading list"
              bubbleMenu={linked() || editing() ? bubble : undefined}
              classes={richEditorClasses}
              style={{ flex: 1 }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {linked() ? `Link: ${href()}` : "Click into a link to raise its bubble"}
          </Text>
        </DemoSection>
      </DemoCard>

      <DemoCard>
        <DemoSection title="A node in the text" axis="block">
          <Text style={{ color: colors.mutedForeground }}>
            A node view: the editor draws every `mention` node with the app's own component, ringed
            while it is selected, and a press on the menu writes one where the caret stands.
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Menu>
              <MenuTrigger>Mention a team</MenuTrigger>
              <MenuContent margin={8}>
                <MenuLabel>Teams</MenuLabel>
                <MenuItem onSelect={() => insertMention("runtime")}>{TEAMS.runtime}</MenuItem>
                <MenuItem onSelect={() => insertMention("design")}>{TEAMS.design}</MenuItem>
                <MenuItem onSelect={() => insertMention("docs")}>{TEAMS.docs}</MenuItem>
              </MenuContent>
            </Menu>
          </View>
          <View style={{ height: wide() ? 150 : 180, ...sectionSurface(), overflow: "hidden" }}>
            <RichEditor
              editor={chat}
              accessibilityLabel="Chat"
              classes={chatClasses}
              style={{ flex: 1 }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {mentioned() === 1 ? "1 mention in the text" : `${mentioned()} mentions in the text`}
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
