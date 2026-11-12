// Tree: row look (`treeItemClass`, `TreeRow`) and the `Tree` that wears them.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { colors, terminal, TERMINAL_COLUMN, TERMINAL_GAP } from "@shadcn-nsh/theme";
import { platform, split, Text, View } from "nsh";
import { Tree as BaseTree, type TreeEntry, type TreeProps as BaseTreeProps } from "nsh/base";

import { Icon, type IconName } from "./lib/icons";
import { controlSize } from "./lib/surface";

const desktop = platform.desktop;
const size = {
  row: controlSize.row,
  rowSm: desktop ? 32 : controlSize.row,
  label: controlSize.label,
  detail: controlSize.detail,
};

// @port tree.tsx
/**
 * A row: quiet until hovered, the selected one tinted in the brand color
 * with its label in the strong text color (a color, not a weight: the
 * labels keep their widths), the keyboard's ring on the row the keys act
 * on while the tree's focus shows (not after a click), disabled ones
 * dimmed.
 * The ring is drawn inside the row: the rows fill the list's width, whose
 * scroll view clips what reaches past its sides.
 */
export const treeItemClass =
  "group rounded-md transition-colors duration-150 motion-reduce:transition-none hover:bg-hover active:opacity-70 " +
  "selected:bg-brand-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring disabled:opacity-50";

/** How far each level is indented, in points. */
export const treeIndent = 14;

/** A `TreeRow`'s height: compact with a pointer, a 44-point target on a touch screen. */
export const treeRowHeight = desktop ? size.rowSm - 4 : size.rowSm;

/**
 * A row's content: its chevron (folders), its icon (`icon`, else a folder
 * that opens with it or a file), its label and a `detail` at the end.
 */
export function TreeRow(props: {
  entry: TreeEntry;
  icon?: IconName;
  tint?: string;
  detail?: string;
}) {
  if (terminal) return <TerminalTreeRow {...props} />;
  return (
    <View
      style={{
        height: treeRowHeight,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingEnd: 8,
        paddingStart: 4 + props.entry.depth * treeIndent,
      }}
    >
      <View
        class="transition-transform duration-200 ease-out group-aria-expanded:rotate-90 motion-reduce:transition-none rtl:group-aria-expanded:-rotate-90"
        style={{ width: 14, height: 14, opacity: props.entry.folder ? 1 : 0 }}
      >
        <Icon name="chevron" size={14} tint={colors.muted} />
      </View>
      {props.icon ? (
        <Icon name={props.icon} size={16} tint={props.tint ?? colors.muted} />
      ) : props.entry.folder ? (
        <View style={{ width: 16, height: 16 }}>
          <View class="group-aria-expanded:hidden">
            <Icon name="folder" size={16} tint={colors.muted} />
          </View>
          <View class="hidden group-aria-expanded:flex">
            <Icon name="folder-open" size={16} tint={colors.muted} />
          </View>
        </View>
      ) : (
        <Icon name="file" size={16} tint={colors.muted} />
      )}
      <Text
        class="text-muted-foreground group-selected:text-foreground flex-1"
        style={{ fontSize: desktop ? 13 : size.label, numberOfLines: 1 }}
      >
        {props.entry.label}
      </Text>
      {props.detail ? (
        <Text style={{ fontSize: size.detail, color: colors.faint }}>{props.detail}</Text>
      ) : null}
    </View>
  );
}

/**
 * A row in a terminal: two columns a level, then the folder's own mark
 * (`▸ ` closed, `▾ ` open, from the row's expanded state) or two blank
 * columns on a leaf, so a level's labels line up and a child's mark sits
 * under its parent's label; no icons. The row draws its marks itself, so
 * the core adds none (a marked first text, or a leading empty box).
 */
function TerminalTreeRow(props: { entry: TreeEntry; detail?: string }) {
  const indent = props.entry.depth * 2 * TERMINAL_COLUMN;
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
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
        <Text style={{ marginLeft: TERMINAL_GAP, color: colors.faint }}>{props.detail}</Text>
      ) : null}
    </View>
  );
}
// @port end

const treeFrameClass = "overflow-hidden rounded-lg border border-border bg-card";

function mergeClass(base: string, extra?: string | null): string {
  return extra ? `${base} ${extra}` : base;
}

/** `nsh/base` Tree with row chrome and `TreeRow` by default. */
export type TreeProps = BaseTreeProps;

/** Items that hold items: one virtualized list, one keyboard stop. */
export function Tree(props: TreeProps) {
  const [, rest] = split(props, [
    "class",
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
      class={mergeClass(treeFrameClass, props.class)}
      listClass={mergeClass(terminal ? "" : "p-1.5", props.listClass)}
      itemClass={mergeClass(treeItemClass, props.itemClass)}
      renderItem={
        props.renderItem === undefined ? (entry) => <TreeRow entry={entry} /> : props.renderItem
      }
      style={props.style}
    />
  );
}
