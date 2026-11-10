// Source: examples/nsh-gallery-ui/tree.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, radius } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
import { Tree as BaseTree, type TreeEntry, type TreeProps as BaseTreeProps } from "nsh/base";

import { isPointer } from "./lib/density";

/**
 * Theme layer on `nsh/base` Tree. Row chrome is the default; every base prop
 * passes through. Not a composition facade: base is one control, and rows are
 * `items` plus `renderItem`.
 */
export type TreeProps = BaseTreeProps;

type TreeChrome = {
  root: ViewStyle;
  listClass: string;
  itemClass: string;
  rowMin: number;
  label: number;
  indent: number;
  chevron: number;
};

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base: StyleProp<ViewStyle>,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (consumer == null) return base;
  return [base, consumer];
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/**
 * Tree frame and row metrics. Selection, keyboard focus, press, and dim live
 * on `itemClass`: base draws each row once. The chevron turns with the row's
 * `aria-expanded`. Call `treeVariants()` inside `computed` so `token()` follows
 * the scheme.
 */
function look(): TreeChrome {
  const pointer = isPointer();
  return {
    root: {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderCurve: "continuous",
      borderRadius: radius.control,
      backgroundColor: colors.card,
    },
    listClass: "p-1.5",
    itemClass:
      "group rounded-md border border-transparent transition-colors duration-150 motion-reduce:transition-none hover:bg-accent selected:border-ring selected:bg-accent focus:outline-2 focus:-outline-offset-2 focus:outline-ring active:opacity-70 disabled:opacity-50",
    rowMin: pointer ? 32 : 44,
    label: pointer ? 13 : 15,
    indent: 14,
    chevron: 14,
  };
}

/** Tree chrome for the current idiom. Read it inside `computed` (or JSX). */
export function treeVariants(): TreeChrome {
  return look();
}

/** Chevron turn. `motion-reduce` drops the rotation. */
export const treeChevronClass =
  "items-center justify-center transition-transform duration-200 ease-out group-aria-expanded:rotate-90 motion-reduce:transition-none";

/**
 * Default row: a chevron that turns 90° while the folder is open (leaves keep
 * the slot so labels line up), then the label indented by depth.
 */
function TreeRow(props: { entry: TreeEntry }) {
  const chrome = look();
  return (
    <View
      style={{
        minHeight: chrome.rowMin,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingRight: 8,
        paddingLeft: 4 + props.entry.depth * chrome.indent,
      }}
    >
      <View
        class={treeChevronClass}
        style={{
          width: chrome.chevron,
          height: chrome.chevron,
          opacity: props.entry.folder ? 1 : 0,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            lineHeight: chrome.chevron,
            color: colors.mutedForeground,
          }}
        >
          ›
        </Text>
      </View>
      <Text
        class="text-foreground group-selected:text-accent-foreground flex-1"
        style={{ fontSize: chrome.label, numberOfLines: 1 }}
      >
        {props.entry.label}
      </Text>
    </View>
  );
}

/** Items that hold items: one virtualized list, one keyboard stop. */
export function Tree(props: TreeProps) {
  const [, rest] = split(props, ["style", "listClass", "itemClass", "renderItem", "reveal"]);
  const chrome = computed(() => treeVariants());
  return (
    <BaseTree
      {...rest}
      reveal={props.reveal ?? true}
      style={mergeStyle(chrome().root, props.style)}
      listClass={mergeClass(chrome().listClass, props.listClass)}
      itemClass={mergeClass(chrome().itemClass, props.itemClass)}
      renderItem={
        props.renderItem === undefined ? (entry) => <TreeRow entry={entry} /> : props.renderItem
      }
    />
  );
}
