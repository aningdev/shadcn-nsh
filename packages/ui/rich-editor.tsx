// Rich editor: `richEditorClasses`, the `RichEditor` that wears them, and the session API an app
// runs it with (`createRichEditor`, the kits, the commands and their types), so the editor is one
// import. The editor is `editor.tsx` (`Editor`).
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { split } from "nsh";
import {
  RichEditor as BaseRichEditor,
  type RichEditorClasses,
  type RichEditorProps as BaseRichEditorProps,
} from "nsh/base";

import { mergeClasses } from "./lib/utils";

/**
 * A `RichEditor`'s document (its `classes`): roomy padding inside the
 * scroll view, so its scroll bar runs along the editor's edge; relaxed
 * paragraphs, tight large headings, a quiet quote, code on the muted fill,
 * indented lists, task checkboxes filled with the primary once checked,
 * brand-colored links. NSH's editor draws nothing of its own.
 */
export const richEditorClasses: RichEditorClasses = {
  content: "gap-3 px-6 py-5",
  placeholder: "text-muted-foreground",
  listMarker: "text-muted-foreground",
  taskCheckbox:
    "size-4 mr-2 mt-1 rounded border border-border cursor-pointer transition duration-150 ease-out hover:border-foreground/40 hover:bg-foreground/5 active:scale-90 checked:bg-primary checked:border-primary checked:hover:bg-primary/80",
  nodes: {
    paragraph: "leading-relaxed",
    "heading[level=1]": "text-3xl font-bold tracking-tight",
    "heading[level=2]": "text-2xl font-semibold tracking-tight",
    "heading[level=3]": "text-xl font-semibold",
    blockquote: "border-l-4 border-border pl-4 text-muted-foreground italic",
    codeBlock: "font-mono text-sm bg-muted rounded-(--radius-md) px-4 py-3",
    bulletList: "gap-1.5 pl-6",
    orderedList: "gap-1.5 pl-6",
    taskList: "gap-1.5",
    horizontalRule: "h-px bg-border my-3",
    tableHeader: "font-semibold",
  },
  marks: {
    bold: "font-bold",
    italic: "italic",
    code: "font-mono text-sm bg-muted rounded px-1",
    link: "text-brand underline",
    strike: "line-through",
  },
};

/** Every prop of `nsh/base` RichEditor; the document's chrome is `richEditorClasses`. */
export type RichEditorProps = BaseRichEditorProps;

/** A rich document editor with `richEditorClasses` by default. */
export function RichEditor(props: RichEditorProps) {
  const [, rest] = split(props, ["classes"]);
  // The look's parts, then the app's: a part the app leaves out keeps the look's, `null` drops it,
  // and a part that is a map of node or mark classes (`nodes`, `marks`) merges name by name.
  return <BaseRichEditor {...rest} classes={mergeClasses(richEditorClasses, props.classes)} />;
}

// The session's API, re-exported from `nsh/base`: an app makes the session with `createRichEditor`
// and runs Tiptap's commands on it here, without importing the element a second time. `command`
// takes any Tiptap command by name, so the named builders below are the common ones, not the whole
// set; a node view or an extension brings its own types with it.
export {
  chain,
  command,
  createRichEditor,
  defineExtension,
  defineSchema,
  extendMarkRange,
  first,
  insertContent,
  redo,
  richExtension,
  RichEditorPlugin,
  StarterKit,
  TableKit,
  undo,
} from "nsh/base";
export type {
  RichCommand,
  RichCommandName,
  RichDecoration,
  RichDecorationKind,
  RichEditorChange,
  RichEditorClasses,
  RichEditorFile,
  RichEditorOptions,
  RichEditorPastedFiles,
  RichEditorRef,
  RichEditorSelection,
  RichEditorSession,
  RichEditorStateJSON,
  RichExtension,
  RichExtensionConfig,
  RichFormat,
  RichMarkJSON,
  RichNodeJSON,
  RichNodeViewProps,
  RichPluginSpec,
  RichSchema,
  RichSchemaSpec,
  RichSelectionJSON,
} from "nsh/base";
