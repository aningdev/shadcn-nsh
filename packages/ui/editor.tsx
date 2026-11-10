// No reference look. The frame is the field well; the text colors are the theme's.
import { alpha, colors, popupSurface } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { computed, split } from "nsh";
import {
  Editor as BaseEditor,
  type EditorClasses,
  type EditorProps as BaseEditorProps,
  type EditorStyles,
} from "nsh/base";

import { fieldFocusStyle, fieldTransitionClass, fieldWell } from "./lib/field";
import { mergeClass, mergePartClasses, mergePartStyles, mergeStyle } from "./lib/part-style";

/**
 * Theme layer on `nsh/base` Editor. Behavior, folding and the syntax palette
 * stay in base. This file paints the well, the gutter, selection and menus.
 * Every base prop passes through.
 */
export type EditorProps = BaseEditorProps;

/** Part classes and styles, plus the host frame. */
export type EditorLook = {
  /** Host classes. `font-mono` is the theme font; measurement stays on base's `fontFamily`. */
  className: string;
  /** The field well. Read-only lies flat. */
  style: ViewStyle;
  /** Focus on the well. Omitted while read-only. */
  focusStyle?: ViewStyle;
  /** Focus while the caret is inside. Omitted while read-only. */
  focusWithinStyle?: ViewStyle;
  /** Default part classes. */
  classes: EditorClasses;
  /** Default part styles. */
  styles: EditorStyles;
};

function look(readOnly: boolean): EditorLook {
  const ring = readOnly ? undefined : fieldFocusStyle(false);
  const menu = {
    ...popupSurface(),
    color: colors.popoverForeground,
  };
  return {
    className: `${fieldTransitionClass} font-mono`,
    style: {
      ...fieldWell({ readonly: readOnly }),
      minHeight: 64,
    },
    focusStyle: ring,
    focusWithinStyle: ring,
    classes: {
      content: "font-mono",
      gutter: "font-mono",
      placeholder: "font-mono",
    },
    styles: {
      gutter: { backgroundColor: colors.muted, color: colors.mutedForeground },
      lineNumber: { color: colors.mutedForeground },
      activeLineNumber: { color: colors.foreground },
      content: { color: colors.foreground },
      // `muted` is nearly the page in light mode, so the caret row is a whisper of ink.
      activeLine: { backgroundColor: alpha(colors.foreground, 0.04) },
      selection: { backgroundColor: alpha(colors.primary, 0.24) },
      caret: { backgroundColor: colors.foreground },
      placeholder: { color: colors.mutedForeground },
      matchingBracket: { borderColor: colors.ring },
      indentGuide: { backgroundColor: colors.border },
      ruler: { backgroundColor: colors.border },
      foldMarker: { color: colors.mutedForeground },
      foldPlaceholder: { color: colors.mutedForeground },
      whitespace: { color: alpha(colors.mutedForeground, 0.7) },
      // Base uses amber for search and warnings. This theme has no amber token.
      searchMatch: { backgroundColor: alpha(colors.primary, 0.2) },
      currentSearchMatch: { backgroundColor: alpha(colors.primary, 0.35) },
      diagnosticError: { textDecorationColor: colors.destructive },
      diagnosticWarning: { textDecorationColor: colors.destructive },
      diagnosticInfo: { textDecorationColor: colors.primary },
      diagnosticHint: { textDecorationColor: colors.mutedForeground },
      unnecessaryText: { color: colors.mutedForeground },
      deprecatedText: { textDecorationLine: "line-through" },
      selectionHandle: { backgroundColor: colors.primary },
      completionMenu: menu,
      completionItem: { color: colors.popoverForeground },
      selectedCompletionItem: {
        backgroundColor: colors.accent,
        color: colors.accentForeground,
      },
      completionMatch: { color: colors.primary },
      completionDetail: { color: colors.mutedForeground },
      completionKind: { color: colors.mutedForeground },
      completionDocumentation: menu,
      inlineCompletion: { color: colors.mutedForeground },
      definitionLink: { textDecorationColor: colors.primary },
    },
  };
}

/** The editor's default chrome. `readOnly` flattens the well and drops the focus edge. */
export function editorVariants(options?: {
  /** Flat well, no focus edge. */
  readOnly?: boolean;
}): EditorLook {
  return look(!!options?.readOnly);
}

/** A code editor. Give it a height, or `minRows` / `maxRows`, or it stays a short well. */
export function Editor(props: EditorProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "classes",
    "styles",
    "focusStyle",
    "focusWithinStyle",
  ]);
  const chrome = computed(() => look(!!props.readOnly));
  const ring = () => chrome().focusStyle;
  return (
    <BaseEditor
      {...rest}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      classes={mergePartClasses(chrome().classes, props.classes)}
      styles={mergePartStyles(chrome().styles, props.styles)}
      focusStyle={ring() ? mergeStyle(ring(), props.focusStyle) : props.focusStyle}
      focusWithinStyle={
        ring() ? mergeStyle(ring(), props.focusWithinStyle) : props.focusWithinStyle
      }
    />
  );
}
