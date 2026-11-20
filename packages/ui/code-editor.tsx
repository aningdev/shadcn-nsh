// Code editor: `codeEditorClasses`, `codeEditorFrame` and the `CodeEditor` that wears them.
// This library's own: NSH's gallery has a look for the rich editor and none for the code editor,
// so nothing here is ported and there is no port region. Yours to change.
import { colors, finish, rounded, shape, stroke } from "@shadcn-nsh/theme";
import { split, type ViewStyle } from "nsh";
import {
  Editor as BaseEditor,
  type EditorClasses,
  type EditorProps as BaseEditorProps,
} from "nsh/base";

import { mergeClasses } from "./lib/utils";

/**
 * A code editor's parts, as classes: line numbers and fold markers muted, the lines with a caret
 * and their numbers in the text color, the caret's line a faint `muted` band behind the text,
 * selected text a tint of the brand, the carets and the indent guides in the text and border
 * colors, the placeholder muted, search matches in the warning tone (the one on the selection
 * stronger), and diagnostics underlined in the theme's semantic colors — `destructive` for an
 * error, `warn` for a warning, `info` for information, `muted-foreground` for a hint.
 */
export const codeEditorClasses: EditorClasses = {
  gutter: "bg-muted/40",
  lineNumber: "text-muted-foreground",
  activeLineNumber: "text-foreground",
  foldMarker: "text-muted-foreground",
  activeLine: "bg-muted/50",
  selection: "bg-brand/25",
  caret: "bg-foreground",
  composition: "text-foreground",
  searchMatch: "bg-warn/25",
  currentSearchMatch: "bg-warn/40",
  matchingBracket: "border-border",
  indentGuide: "bg-border",
  placeholder: "text-muted-foreground",
  diagnosticError: "text-destructive",
  diagnosticWarning: "text-warn",
  diagnosticInfo: "text-info",
  diagnosticHint: "text-muted-foreground",
  unnecessaryText: "text-muted-foreground",
  deprecatedText: "text-muted-foreground",
  whitespace: "text-muted-foreground/60",
  ruler: "bg-border",
};

/**
 * The surface a code editor sits on (its `style`): the field's well — the field color, a hairline
 * of the field's edge, the control tier's corners and the finish a field has — the same well a text
 * field has, so a file and a value look like the two kinds of field they are. Read where it is
 * used, so it follows the appearance and the theme; an app's `style` goes over it.
 */
export function codeEditorFrame(): ViewStyle {
  return {
    backgroundColor: colors.field,
    borderWidth: stroke.control,
    borderColor: colors.input,
    ...rounded(shape.field),
    ...finish.field,
  };
}

/**
 * Every prop of `nsh/base` Editor: the text model, the highlighting, the editing keys, folding,
 * search and diagnostics stay in base.
 */
export type CodeEditorProps = BaseEditorProps;

/**
 * A code editor on the field's well. Pass `language` for the highlighting and the editing rules
 * (`"typescript"`, `"json"`, `"css"`, or an extension or file name), `value` and `onChange` to
 * control the text, `diagnostics` to mark problems; `classes` and `styles` paint its parts over
 * `codeEditorClasses`, and `style` goes over `codeEditorFrame()`. It fills the box the app gives
 * it and scrolls its rows inside.
 */
export function CodeEditor(props: CodeEditorProps) {
  const [, rest] = split(props, ["class", "style", "classes", "styles"]);
  return (
    <BaseEditor
      {...rest}
      class={props.class}
      style={[codeEditorFrame(), props.style ?? null]}
      classes={mergeClasses(codeEditorClasses, props.classes)}
      styles={props.styles}
    />
  );
}

/**
 * The session an app drives the editor with, from `nsh/base`, so `@/components/ui/code-editor` is
 * the only import. `EditorProps` stays `CodeEditorProps`.
 */
export type {
  EditorBounds,
  EditorClasses,
  EditorCodeActionRequest,
  EditorCommand,
  EditorCompletionAcceptEvent,
  EditorCompletionItem,
  EditorCompletionKind,
  EditorCompletionRequest,
  EditorCompletionTrigger,
  EditorContextMenuEvent,
  EditorDecoration,
  EditorDefinitionRequest,
  EditorDefinitionTrigger,
  EditorDiagnostic,
  EditorDiagnosticCodeDescription,
  EditorDiagnosticRelatedInformation,
  EditorDiagnosticSeverity,
  EditorDiagnosticTag,
  EditorEdit,
  EditorFoldRange,
  EditorGutterMark,
  EditorGutterPlacement,
  EditorHoverEvent,
  EditorInlineCompletionRequest,
  EditorLocation,
  EditorOverviewRulerLane,
  EditorOverviewRulerMark,
  EditorPosition,
  EditorRange,
  EditorRect,
  EditorRef,
  EditorReplaceAll,
  EditorSearch,
  EditorSearchResult,
  EditorSelection,
  EditorStyles,
  EditorTextPressEvent,
  EditorToken,
} from "nsh/base";
