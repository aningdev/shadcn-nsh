// Rich editor: `richEditorClasses`, the `RichEditor` that wears them, and the session API an app
// runs it with (`createRichEditor`, the kits, the commands and their types), so the editor is one
// import. The code editor is `code-editor.tsx` (`CodeEditor`).
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors } from "@shadcn-nsh/theme";
import { Check } from "lucide";
import type { JSX } from "nsh";
import { effect, signal, split, View } from "nsh";
import {
  baseKeymap,
  createRichEditor,
  history,
  markdown,
  RichEditor as BaseRichEditor,
  type RichEditorClasses,
  type RichEditorProps as BaseRichEditorProps,
  type RichEditorSession,
  type RichNodeJSON,
  type RichPluginSpec,
  type RichSchemaSpec,
  starterKit,
} from "nsh/base";

import { mergeClasses } from "./lib/class-names";
import { Icon } from "./lib/icons";

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
    codeBlock: "font-mono text-sm bg-muted rounded-(--radius-control) px-4 py-3",
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

/** A checked task's box, in the content box's points. */
type TaskMark = { x: number; y: number; width: number };

/**
 * The plugins an editor without a `session` makes from the names `nsh/base`'s `RichEditor` takes
 * (`"starter"`, `"history"`, `"baseKeymap"`, `"markdown"`). `starter` already has history and the
 * base keymap, so those two are dropped beside it, as the base editor does. An unknown name is
 * left to the starter kit's default.
 */
function namedPlugins(names: string[] | null | undefined): RichPluginSpec[] | undefined {
  if (names == null) return undefined;
  const starter = names.includes("starter");
  const plugins: RichPluginSpec[] = [];
  for (const name of names) {
    if (name === "starter") plugins.push(starterKit());
    else if (name === "history" && !starter) plugins.push(history());
    else if (name === "baseKeymap" && !starter) plugins.push(baseKeymap());
    else if (name === "markdown") plugins.push(markdown());
  }
  return plugins;
}

/** How tall a node is in document positions: its text's length, or its children's and their offsets. */
function nodeSize(node: RichNodeJSON): number {
  if (node.text != null) return node.text.length;
  if (node.content == null) return 1;
  return 2 + node.content.reduce((sum, child) => sum + nodeSize(child), 0);
}

/** The positions of the task items a document has checked. */
function checkedTasks(doc: RichNodeJSON): number[] {
  const found: number[] = [];
  const walk = (node: RichNodeJSON, pos: number) => {
    if (node.type === "taskItem" && node.attrs?.checked === true) found.push(pos);
    let at = pos + 1;
    for (const child of node.content ?? []) {
      walk(child, at);
      at += nodeSize(child);
    }
  };
  // The document's own start is before position 0.
  walk(doc, -1);
  return found;
}

/** Options of `RichEditorTaskMarks`. */
export interface RichEditorTaskMarksProps {
  /** The session whose checked tasks get a mark. */
  editor: RichEditorSession;
  /** The mark's box, in points (default 16, `richEditorClasses`' `size-4`). */
  size?: number;
  /** The box's distance from the task's top, where its `mt-1` puts the checkbox (default 4). */
  inset?: number;
  /** The room after the box, where its `mr-2` puts the task's text (default 8). */
  gap?: number;
}

/**
 * The check a checked task shows, drawn over the box `richEditorClasses` fills: `nsh/base`'s task
 * checkbox has no indicator of its own, so the mark is the app's layer over the document. Each
 * mark is a box at the task's start edge, in a row as wide as the task, so it follows the reading
 * direction: left in a left-to-right document, right in a right-to-left one. The box takes no
 * press, so the checkbox under it keeps the whole hit area.
 *
 * `RichEditor` draws this itself; an app that renders `nsh/base`'s `RichEditor` over
 * `richEditorClasses` (its reference page) passes it as the `contentLayer`.
 */
export function RichEditorTaskMarks(props: RichEditorTaskMarksProps): JSX.Element {
  const marks = signal<TaskMark[]>([]);
  const size = () => props.size ?? 16;
  const inset = () => props.inset ?? 4;
  const gap = () => props.gap ?? 8;

  effect(() => {
    const editor = props.editor;
    const read = () => {
      const found: TaskMark[] = [];
      for (const pos of checkedTasks(editor.doc)) {
        const rect = editor.nodeRect(pos) as TaskMark | null;
        if (rect) found.push({ x: rect.x, y: rect.y, width: rect.width });
      }
      marks.set(found);
    };
    // The first layout lands a frame after the editor mounts; every later change settles its own
    // layout, as the showcase's toggle arrows do (`block-editor.tsx`).
    let pending: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (pending !== undefined) clearTimeout(pending);
      pending = setTimeout(read, 48);
    };
    read();
    schedule();
    const stop = editor.on("revision", () => {
      read();
      schedule();
    });
    return () => {
      if (pending !== undefined) clearTimeout(pending);
      stop();
    };
  });

  return (
    <Each of={marks()} key="index">
      {(mark) => (
        <View
          style={{
            // physical: `nodeRect` is measured from the content box's left edge.
            position: "absolute",
            left: mark().x,
            top: mark().y,
            width: mark().width,
            height: size(),
            flexDirection: "row",
            alignItems: "flex-start",
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              // physical: it matches the look's `mr-2` on the task checkbox.
              width: size(),
              height: size(),
              marginTop: inset(),
              marginRight: gap(),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              icon={Check}
              size={Math.round(size() * 0.75)}
              tint={colors.primaryForeground}
              weight={3.84}
            />
          </View>
        </View>
      )}
    </Each>
  );
}

/** A rich document editor with `richEditorClasses` by default, and a mark on each checked task. */
export function RichEditor(props: RichEditorProps) {
  const [, rest] = split(props, ["classes", "contentLayer", "editor"]);
  // Without a session, the editor makes one from the props `nsh/base` would use: the schema, the
  // first document, and the named plugins. It then has a session to read the task marks from.
  const editor =
    props.editor ??
    createRichEditor({
      schema: props.schema as RichSchemaSpec | null | undefined,
      doc: props.content as RichNodeJSON | null | undefined,
      plugins: namedPlugins(props.plugins),
    });
  const contentLayer = props.contentLayer ? (
    <>
      {props.contentLayer}
      <RichEditorTaskMarks editor={editor} />
    </>
  ) : (
    <RichEditorTaskMarks editor={editor} />
  );
  // The look's parts, then the app's: a part the app leaves out keeps the look's, `null` drops it,
  // and a part that is a map of node or mark classes (`nodes`, `marks`) merges name by name.
  return (
    <BaseRichEditor
      {...rest}
      editor={editor}
      classes={mergeClasses(richEditorClasses, props.classes)}
      contentLayer={contentLayer}
    />
  );
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
