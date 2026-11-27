// A tree: the row (`TreeRow`) and the `Tree` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { StyleProp, ViewStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import { Tree as BaseTree, type TreeEntry, type TreeProps as BaseTreeProps } from "nsh/base";

import { colors, terminal, TERMINAL_COLUMN, TERMINAL_GAP, font } from "../theme";
import { ChevronRight, File, Folder, FolderOpen, Icon, type IconNode } from "./lib/icons";
import { controlSize } from "./lib/surface";
import { joinClass } from "./lib/utils";

/** `nsh/base` Tree with row chrome and `TreeRow` by default. */
export type TreeProps = BaseTreeProps;

/** A row of a tree (`renderRow`, `onSelect`), from `nsh/base`. */
export type { TreeEntry };

/** What a row draws besides the entry the tree gives it. */
type TreeRowProps = {
  entry: TreeEntry;
  icon?: IconNode;
  tint?: string;
  detail?: string;
  /** Tailwind classes on the row, after its layout. */
  class?: string;
  /** Tailwind classes toggled on the row. */
  classList?: Record<string, boolean | null | undefined>;
  /** Over the row. */
  style?: StyleProp<ViewStyle>;
};

/**
 * A row's content: its chevron (folders), its icon (`icon`, else a folder
 * that opens with it or a file), its label and a `detail` at the end.
 */
export function TreeRow(props: TreeRowProps) {
  if (terminal) return <TerminalTreeRow {...props} />;
  return (
    <View
      class={props.class}
      classList={props.classList}
      style={[
        {
          height: treeRowHeight,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingEnd: 8,
          paddingStart: 4 + props.entry.depth * treeIndent,
        },
        props.style ?? null,
      ]}
    >
      <View
        class="transition-transform duration-200 ease-out group-aria-expanded:rotate-90 motion-reduce:transition-none rtl:group-aria-expanded:-rotate-90"
        style={{ width: 14, height: 14, opacity: props.entry.folder ? 1 : 0 }}
      >
        <Icon icon={ChevronRight} size={14} tint={colors.mutedForeground} />
      </View>
      {props.icon ? (
        <Icon icon={props.icon} size={16} tint={props.tint ?? colors.mutedForeground} />
      ) : props.entry.folder ? (
        <View style={{ width: 16, height: 16 }}>
          <View class="group-aria-expanded:hidden">
            <Icon icon={Folder} size={16} tint={colors.mutedForeground} />
          </View>
          <View class="hidden group-aria-expanded:flex">
            <Icon icon={FolderOpen} size={16} tint={colors.mutedForeground} />
          </View>
        </View>
      ) : (
        <Icon icon={File} size={16} tint={colors.mutedForeground} />
      )}
      <Text
        class="text-muted-foreground group-selected:text-foreground flex-1"
        style={{ fontSize: font.size("body"), numberOfLines: 1 }}
      >
        {props.entry.label}
      </Text>
      {props.detail ? (
        <Text style={{ fontSize: size.detail, color: colors.faint }}>{props.detail}</Text>
      ) : null}
    </View>
  );
}

/** A tree in a card: base's virtualized list of rows, `TreeRow` by default. */
export function Tree(props: TreeProps) {
  const [, rest] = split(props, [
    "class",
    "classList",
    "listClass",
    "itemClass",
    "renderItem",
    "reveal",
    "style",
  ]);
  return (
    <BaseTree
      {...rest}
      reveal={props.reveal ?? true}
      class={joinClass(treeFrameClass, props.class)}
      classList={props.classList}
      listClass={joinClass(terminal ? "" : "p-1.5", props.listClass)}
      itemClass={joinClass(treeItemClass, props.itemClass)}
      renderItem={
        props.renderItem === undefined ? (entry) => <TreeRow entry={entry} /> : props.renderItem
      }
      style={props.style}
    />
  );
}

// Shared tree primitives
// Demos size a well with `treeRowHeight`.

const desktop = platform.desktop;
const size = {
  rowSm: desktop ? 32 : controlSize.row,
  detail: controlSize.detail,
};

/**
 * A row's height: 4 points under a pointer's 32-point row (28), or a touch screen's 44-point
 * target whole. A well is as tall as its rows are: `height: rows * treeRowHeight` (plus the
 * list's padding) shows `rows` of them, and more scroll.
 */
export const treeRowHeight = desktop ? size.rowSm - 4 : size.rowSm;

// Private helpers & looks

/**
 * A row: quiet until hovered, the selected one tinted in the brand color
 * with its label in the strong text color (a color, not a weight: the
 * labels keep their widths), the keyboard's ring on the row the keys act
 * on while the tree's focus shows (not after a click), disabled ones
 * dimmed.
 * The ring is drawn inside the row: the rows fill the list's width, whose
 * scroll view clips what reaches past its sides.
 */
const treeItemClass =
  "group rounded-(--radius-md) transition-colors duration-150 motion-reduce:transition-none hover:bg-accent active:opacity-70 " +
  "selected:bg-brand/15 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:opacity-50";

/** How far each level is indented, in points. */
const treeIndent = 14;

const treeFrameClass = "overflow-hidden rounded-(--radius-lg) border border-border bg-card";

// Terminal

/**
 * A row in a terminal: two columns a level, then the folder's own mark
 * (`▸ ` closed, `▾ ` open, from the row's expanded state) or two blank
 * columns on a leaf, so a level's labels line up and a child's mark sits
 * under its parent's label; no icons. The row draws its marks itself, so
 * the core adds none (a marked first text, or a leading empty box).
 */
function TerminalTreeRow(props: TreeRowProps) {
  const indent = props.entry.depth * 2 * TERMINAL_COLUMN;
  return (
    <View
      class={props.class}
      classList={props.classList}
      style={[{ flexDirection: "row", alignItems: "center" }, props.style ?? null]}
    >
      {indent > 0 ? <View style={{ width: indent, flexShrink: 0 }} /> : null}
      {props.entry.folder ? (
        <>
          <Text class="text-muted-foreground group-aria-expanded:hidden">▸ </Text>
          <Text class="text-muted-foreground hidden group-aria-expanded:flex">▾ </Text>
        </>
      ) : (
        <View style={{ width: 2 * TERMINAL_COLUMN, flexShrink: 0 }} />
      )}
      <Text
        class="text-muted-foreground group-selected:text-foreground flex-1"
        style={{ numberOfLines: 1 }}
      >
        {props.entry.label}
      </Text>
      {props.detail ? (
        <Text style={{ marginStart: TERMINAL_GAP, color: colors.faint }}>{props.detail}</Text>
      ) : null}
    </View>
  );
}
