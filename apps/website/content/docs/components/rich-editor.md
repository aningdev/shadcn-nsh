---
title: Rich Editor
description: Rich document typography and its session API, on nsh/base's RichEditor.
component: true
demo: rich-editor
---

## Installation

```npm
npx shadcn-nsh@latest add rich-editor
```

## Usage

```tsx
import {
  createRichEditor,
  RichEditor,
  richEditorClasses,
  StarterKit,
} from "@/components/ui/rich-editor";
```

```tsx
const session = createRichEditor({ extensions: [StarterKit], content: doc, format: "markdown" });

<RichEditor editor={session} style={{ height: 240 }} />;
```

`RichEditor` defaults `classes` to `richEditorClasses` and merges yours into them: a part you leave out keeps the look's, `null` drops it, and a part that is a map of node or mark classes (`nodes`, `marks`) merges name by name, so `classes={{ nodes: { heading: "text-xl" } }}` overrides that node and keeps the look's others. Every prop of [`nsh/base` RichEditor](https://nsh.dev/elements/rich-editor) passes through.

The file re-exports the session's API beside the view, so an app imports the editor once: `createRichEditor` and the kits a session starts from (`StarterKit`, `TableKit`), the commands, `defineSchema` / `defineExtension` / `richExtension` and `RichEditorPlugin` for a session of its own, and the types of the session, its parts, its commands, its extensions and its node views. `command("<name>")` runs any Tiptap command by name; `chain`, `undo`, `redo`, `extendMarkRange` and `insertContent` are the named builders a toolbar usually needs.

## Examples

### Rich document

`RichEditor` wears `richEditorClasses`; the session comes from `createRichEditor`.

```tsx
const session = createRichEditor({ extensions: [StarterKit], content: doc, format: "markdown" });

<RichEditor editor={session} accessibilityLabel="Notes" style={{ height: 180 }} />;
```

### A formatting toolbar

A bar over the document, every control reading the caret: the block it stands in, the marks it
carries, the list around it. The session re-reads on each `revision`, so `isActive` and `can` are
current when the bar draws; a control whose command cannot run where the caret stands is `disabled`
(`can`), and a press runs the command and puts the caret back with `focus()` — or the document loses
it to the button. `command` builds the Tiptap commands by name; the list indents are
`sinkListItem` and `liftListItem` over `listItem`.

```tsx
import {
  command,
  type RichCommand,
  type RichEditorSession,
  undo,
  redo,
} from "@/components/ui/rich-editor";

function bar(session: RichEditorSession, revision: () => number) {
  const on = (name: string, attrs?: Record<string, unknown>) => (
    revision(),
    session.isActive(name, attrs)
  );
  const can = (cmd: RichCommand) => (revision(), session.can(cmd));
  const run = (cmd: RichCommand) => {
    session.run(cmd);
    session.focus();
  };
  return { on, can, run };
}

<Toolbar accessibilityLabel="Formatting" style={{ flexWrap: "wrap", alignSelf: "flex-start" }}>
  <ToolbarGroup accessibilityLabel="Block">
    <Toggle
      pressed={on("heading", { level: 2 })}
      onChange={() => run(command("toggleHeading", { level: 2 }))}
    >
      H2
    </Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup accessibilityLabel="Marks">
    <Toggle
      disabled={!can(command("toggleBold"))}
      pressed={on("bold")}
      onChange={() => run(command("toggleBold"))}
    >
      Bold
    </Toggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <Button
    variant="ghost"
    accessibilityLabel="Undo"
    disabled={!can(undo())}
    onPress={() => run(undo())}
  >
    Undo
  </Button>
</Toolbar>;
```

### A link bubble

`bubbleMenu` is Tiptap's bubble menu, filled by the app: it sits over the selection, flips below it
where there is no room, and follows the text as it scrolls. **The app decides when it is there** —
this one while the caret stands in a link (`isActive("link")`) or while its address is being
written — and draws what it holds. `extendMarkRange("link")` first, then `setLink` or `unsetLink`,
so the whole link changes and not just the character under the caret; an address written at an empty
caret is `insertContent` of a node marked `link`. Closing the field waits a turn (`setTimeout(…,
0)`) before `focus()`: on the web the Return that submitted it is still being handled, and an editor
focused now would take it and write a line break into the link.

```tsx
const session = createRichEditor({ extensions: [StarterKit], content: doc, format: "markdown" });
const inLink = () => (revision(), session.isActive("link"));
const address = () => {
  revision();
  const href = (session.getAttributes("link") as { href?: unknown } | null)?.href;
  return typeof href === "string" ? href : "";
};

<RichEditor
  editor={session}
  accessibilityLabel="Reading list"
  bubbleMenu={
    inLink() ? (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          ...popoverLook({ compact: true }),
        }}
      >
        <Text style={{ fontSize: 13, color: colors.info }} numberOfLines={1}>
          {address()}
        </Text>
        <IconButton accessibilityLabel="Edit link" size="sm" onPress={() => draft.set(address())}>
          <Icon icon={Pencil} {...iconButtonGlyph({ size: "sm" })} />
        </IconButton>
        <IconButton
          accessibilityLabel="Open link"
          size="sm"
          onPress={() => void openUrl(address())}
        >
          <Icon icon={ExternalLink} {...iconButtonGlyph({ size: "sm" })} />
        </IconButton>
        <IconButton
          accessibilityLabel="Remove link"
          size="sm"
          onPress={() => session.run(chain([extendMarkRange("link"), command("unsetLink")]))}
        >
          <Icon icon={Unlink} {...iconButtonGlyph({ size: "sm" })} />
        </IconButton>
      </View>
    ) : undefined
  }
/>;
```

### A node in the text

An extension's node view: `addNodeView` returns the app's own component, and the editor draws
every node of that type with it — the component runs when a node appears, and its props change in
place when the node's attributes or its selection do. `RichNodeViewProps` carries `node` (its
`attrs`), `selected` (it takes presses, so the caret steps over an atom as one character and
Backspace deletes it) and the session's own `updateAttributes` / `deleteNode` for a node that edits
itself. Typing never runs the component.

```tsx
const mention = (name: string): RichNodeJSON => ({ type: "mention", attrs: { name } });

function MentionChip(props: RichNodeViewProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 5,
        borderRadius: 5,
        backgroundColor: colors.brandFill,
        borderWidth: 1,
        borderColor: props.selected ? colors.onBrand : "transparent",
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.onBrand }}>@</Text>
      <Text style={{ fontSize: 13, color: colors.onBrand }}>
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

const session = createRichEditor({
  extensions: [StarterKit, Mention],
  doc: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Ask " },
          mention("Runtime"),
          { type: "text", text: " about the engine." },
        ],
      },
    ],
  },
});

// The chips sit on the text's line, not above it.
const classes = {
  ...richEditorClasses,
  nodes: { ...richEditorClasses.nodes, mention: "align-middle" },
};

<RichEditor editor={session} accessibilityLabel="Chat" classes={classes} />;
```

## API

| Part                                                                        | Props                                                                              | Description                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `RichEditor`                                                                | every `nsh/base` RichEditor prop; `classes` over `richEditorClasses`, part by part | Themed `nsh/base` RichEditor              |
| `richEditorClasses`                                                         | —                                                                                  | `RichEditor` document chrome              |
| `RichEditorProps`                                                           | —                                                                                  | `nsh/base`'s `RichEditorProps`, unchanged |
| `createRichEditor`, `defineSchema`                                          | `nsh/base`'s                                                                       | The session the view shows                |
| `StarterKit`, `TableKit`                                                    | —                                                                                  | The extensions a session starts from      |
| `chain`, `command`, `undo`, `redo`, `extendMarkRange`, `insertContent`      | `nsh/base`'s                                                                       | The Tiptap commands a toolbar runs        |
| `defineExtension`, `richExtension`, `RichEditorPlugin`                      | `nsh/base`'s                                                                       | An extension or plugin of the app's       |
| `RichEditorSession`, `RichCommand`, `RichNodeViewProps`, `RichEditorRef`, … | —                                                                                  | `nsh/base`'s types, re-exported           |
