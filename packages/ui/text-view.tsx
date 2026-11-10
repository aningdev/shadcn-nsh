// No reference look. Reading type stays base's; the hues below are this theme's.
import { alpha, colors, radius } from "@shadcn-nsh/theme";
import type { TextStyle } from "nsh";
import { computed, split } from "nsh";
import {
  TextView as BaseTextView,
  type TextViewClasses,
  type TextViewDocument,
  type TextViewProps as BaseTextViewProps,
  type TextViewStyles,
} from "nsh/base";

import { mergeClass, mergePartClasses, mergePartStyles, mergeStyle } from "./lib/part-style";

/**
 * Theme layer on `nsh/base` TextView. Base keeps the reading measure and the
 * syntax palette; this file points links, code, rules and alerts at the theme.
 * Every base prop passes through.
 */
export type TextViewProps = BaseTextViewProps;

/** Part classes and styles. `null` on a key drops that default. */
export type TextViewLook = {
  /** Host classes, before the consumer's. */
  className: string;
  /** Host style. The consumer wins per key. */
  style: TextStyle;
  /** Default part classes. */
  classes: TextViewClasses;
  /** Default part styles. */
  styles: TextViewStyles;
};

function look(): TextViewLook {
  const wash = (color: string): TextStyle => ({
    backgroundColor: alpha(color, 0.12),
    borderRadius: radius.control,
    borderCurve: "continuous",
  });
  const codeBox: TextStyle = {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: radius.control,
    borderCurve: "continuous",
    color: colors.foreground,
  };
  return {
    className: "font-sans",
    style: { color: colors.foreground },
    classes: {
      code: "font-mono",
      codeBlockCode: "font-mono",
      keyboard: "font-mono",
    },
    styles: {
      root: { color: colors.foreground },
      link: { color: colors.primary, textDecorationLine: "underline" },
      code: codeBox,
      keyboard: codeBox,
      codeBlock: codeBox,
      blockquote: {
        borderColor: colors.border,
        color: colors.foreground,
      },
      rule: { borderColor: colors.border },
      tableCell: { borderColor: colors.border },
      tableHeaderCell: { borderColor: colors.border, color: colors.foreground },
      // The theme has no info / warn pair. Notes sit on primary, warnings on destructive.
      alertNote: wash(colors.primary),
      alertTip: wash(colors.primary),
      alertImportant: wash(colors.primary),
      alertWarning: wash(colors.destructive),
      alertCaution: wash(colors.destructive),
    },
  };
}

/** The document's default part chrome. Call it where the theme is read. */
export function textViewVariants(): TextViewLook {
  return look();
}

function View(props: TextViewProps) {
  const [, rest] = split(props, ["class", "style", "classes", "styles"]);
  const chrome = computed(look);
  return (
    <BaseTextView
      {...rest}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      classes={mergePartClasses(chrome().classes, props.classes)}
      styles={mergePartStyles(chrome().styles, props.styles)}
    />
  );
}

/**
 * A Markdown, HTML or block document. `parse`, `parseHtml` and `plainText`
 * are the base helpers, unchanged.
 */
export const TextView = Object.assign(View, {
  /** Markdown read the way the `markdown` prop reads it. */
  parse: (
    markdown: string,
    options?: Parameters<typeof BaseTextView.parse>[1],
    extensions?: Parameters<typeof BaseTextView.parse>[2],
  ) => BaseTextView.parse(markdown, options, extensions),
  /** HTML read the way the `html` prop reads it. */
  parseHtml: (html: string, extensions?: Parameters<typeof BaseTextView.parseHtml>[1]) =>
    BaseTextView.parseHtml(html, extensions),
  /** The document as plain text, blocks separated by blank lines. */
  plainText: (document: TextViewDocument) => BaseTextView.plainText(document),
});

export type { TextViewDocument };
