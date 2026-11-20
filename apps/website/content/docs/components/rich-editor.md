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
