// Editor: `richEditorClasses` and the `RichEditor` that wears them. The code editor is
// `code-editor.tsx` (`CodeEditor`).
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { split } from "nsh";
import {
  RichEditor as BaseRichEditor,
  type RichEditorClasses,
  type RichEditorProps as BaseRichEditorProps,
} from "nsh/base";

// @port look/workspace.tsx
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
    codeBlock: "font-mono text-sm bg-muted rounded-(--radius) px-4 py-3",
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
// @port end

/** Every prop of `nsh/base` RichEditor; the document's chrome is `richEditorClasses`. */
export type RichEditorProps = BaseRichEditorProps;

/** A rich document editor with `richEditorClasses` by default. */
export function RichEditor(props: RichEditorProps) {
  const [, rest] = split(props, ["classes"]);
  // The look's parts, then the app's: a part the app leaves out keeps the look's, and `null`
  // drops it (base's own reading of the prop).
  const classes = props.classes ? { ...richEditorClasses, ...props.classes } : richEditorClasses;
  return <BaseRichEditor {...rest} classes={classes} />;
}

/** The classes of a document's parts (`richEditorClasses`), from `nsh/base`. */
export type { RichEditorClasses };
