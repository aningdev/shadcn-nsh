// Editor: `richEditorClasses` and the code `Editor` from `nsh/base`.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { split } from "nsh";
import {
  Editor as BaseEditor,
  type EditorProps as BaseEditorProps,
  RichEditor as BaseRichEditor,
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
export const richEditorClasses = {
  content: "gap-3 px-6 py-5",
  placeholder: "text-muted-foreground",
  listMarker: "text-muted-foreground",
  taskCheckbox:
    "size-4 mr-2 mt-1 rounded border border-border checked:bg-primary checked:border-primary",
  nodes: {
    paragraph: "leading-relaxed",
    "heading[level=1]": "text-3xl font-bold tracking-tight",
    "heading[level=2]": "text-2xl font-semibold tracking-tight",
    "heading[level=3]": "text-xl font-semibold",
    blockquote: "border-l-4 border-border pl-4 text-muted-foreground italic",
    codeBlock: "font-mono text-sm bg-muted rounded-lg px-4 py-3",
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

/** Theme layer on `nsh/base` Editor. The model, highlighting and keys stay in base. */
export type EditorProps = BaseEditorProps;

/** Theme layer on `nsh/base` RichEditor. Document chrome is `richEditorClasses`. */
export type RichEditorProps = BaseRichEditorProps;

/** A code editor. Pass `classes` / `styles` to paint parts; the host frame is the app's. */
export function Editor(props: EditorProps) {
  const [, rest] = split(props, ["class", "style", "classes", "styles"]);
  return (
    <BaseEditor
      {...rest}
      class={props.class}
      style={props.style}
      classes={props.classes}
      styles={props.styles}
    />
  );
}

/** A rich document editor with `richEditorClasses` by default. */
export function RichEditor(props: RichEditorProps) {
  const [, rest] = split(props, ["classes"]);
  return <BaseRichEditor {...rest} classes={props.classes ?? richEditorClasses} />;
}
