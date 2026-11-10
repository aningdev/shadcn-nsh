// No reference look. Added and deleted lines use primary and destructive, not a second palette.
import { alpha, colors, radius } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { computed, split } from "nsh";
import {
  DiffView as BaseDiffView,
  type DiffViewClasses,
  type DiffViewProps as BaseDiffViewProps,
  type DiffViewStyles,
} from "nsh/base";

import { mergeClass, mergePartClasses, mergePartStyles, mergeStyle } from "./lib/part-style";

/**
 * Theme layer on `nsh/base` DiffView. Diffing stays in base.
 * This file paints the frame and tints additions and deletions with the theme.
 * Every base prop passes through.
 */
export type DiffViewProps = BaseDiffViewProps;

/** Part classes and styles, plus the host frame. */
export type DiffViewLook = {
  /** Host classes. `font-mono` matches the theme font base measures with. */
  className: string;
  /** The frame. A fixed height is the app's: this is only a minimum. */
  style: ViewStyle;
  /** Default part classes. */
  classes: DiffViewClasses;
  /** Default part styles. */
  styles: DiffViewStyles;
};

function look(): DiffViewLook {
  const added = alpha(colors.primary, 0.14);
  const deleted = alpha(colors.destructive, 0.14);
  return {
    className: "font-mono",
    style: {
      minHeight: 80,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: colors.border,
      borderRadius: radius.control,
      borderCurve: "continuous",
      backgroundColor: colors.background,
      overflow: "hidden",
    },
    classes: {
      content: "font-mono",
      gutter: "font-mono",
    },
    styles: {
      gutter: { backgroundColor: colors.muted, color: colors.mutedForeground },
      lineNumber: { color: colors.mutedForeground },
      lineNumberAdded: { color: colors.primary },
      lineNumberDeleted: { color: colors.destructive },
      content: { color: colors.foreground },
      lineAdded: { backgroundColor: added },
      lineDeleted: { backgroundColor: deleted },
      wordAdded: { backgroundColor: alpha(colors.primary, 0.32) },
      wordDeleted: { backgroundColor: alpha(colors.destructive, 0.32) },
      // `color` covers a `+` / `−`; `backgroundColor` covers a bar.
      indicatorAdded: { color: colors.primary, backgroundColor: colors.primary },
      indicatorDeleted: { color: colors.destructive, backgroundColor: colors.destructive },
      filler: { backgroundColor: alpha(colors.muted, 0.6) },
      lineSelected: { backgroundColor: alpha(colors.primary, 0.18) },
      separator: { color: colors.mutedForeground, backgroundColor: colors.muted },
      fileHeader: { backgroundColor: colors.secondary, color: colors.secondaryForeground },
    },
  };
}

/** The diff's default chrome. Call it where the theme is read. */
export function diffViewVariants(): DiffViewLook {
  return look();
}

/** Two texts, or a patch. Set a height; the frame's minimum is only a floor. */
export function DiffView(props: DiffViewProps) {
  const [, rest] = split(props, ["class", "style", "classes", "styles"]);
  const chrome = computed(look);
  return (
    <BaseDiffView
      {...rest}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      classes={mergePartClasses(chrome().classes, props.classes)}
      styles={mergePartStyles(chrome().styles, props.styles)}
    />
  );
}
