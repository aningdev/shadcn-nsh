// Source: examples/nsh-gallery-ui/look/nav.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, radius } from "@shadcn-nsh/theme";
import type { StyleProp, TextStyle } from "nsh";
import { computed, split, Text } from "nsh";
import {
  Pagination as BasePagination,
  type PaginationItemState,
  type PaginationProps as BasePaginationProps,
} from "nsh/base";

import { isPointer } from "./lib/density";

/**
 * Theme layer on `nsh/base` Pagination. Item states are classes: base has no
 * per-item style hooks. Glyphs stay ‹ › … (this package has no icon set).
 */
export type PaginationProps = BasePaginationProps;

type PaginationChrome = {
  root: TextStyle;
  itemStyle: TextStyle;
  itemClass: string;
  fontSize: number;
};

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<TextStyle> | null,
  consumer?: StyleProp<TextStyle> | null,
): StyleProp<TextStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/**
 * Outlined page buttons. Touch sizes every item to 44; a pointer is 32, or 40
 * when `compact`. Color stays off `itemStyle` so `selected:` / `hover:` classes
 * can paint it (inline style wins over classes).
 */
function look(compact: boolean): PaginationChrome {
  const pointer = isPointer();
  const min = pointer ? (compact ? 40 : 32) : 44;
  return {
    fontSize: pointer ? 13 : 15,
    root: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    itemStyle: {
      minWidth: min,
      minHeight: min,
      paddingHorizontal: 8,
      borderRadius: radius.control,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    itemClass:
      "transition-colors duration-200 motion-reduce:transition-none hover:bg-accent active:bg-muted selected:bg-primary selected:text-primary-foreground disabled:opacity-50",
  };
}

/** Item box for the current idiom. Pass `compact` for the pointer's taller outlined control. */
export function paginationVariants(compact?: boolean): PaginationChrome {
  return look(!!compact);
}

function glyph(item: PaginationItemState) {
  if (item.kind === "previous") return "‹";
  if (item.kind === "next") return "›";
  if (item.kind === "ellipsis") return "…";
  return String(item.page);
}

/** Previous, pages, and next. The current page is `selected:`; disabled items fade. */
export function Pagination(props: PaginationProps) {
  const [, rest] = split(props, ["style", "itemStyle", "itemClass", "renderItem", "compact"]);
  const chrome = computed(() => paginationVariants(!!props.compact));
  const render =
    props.renderItem ??
    ((item: PaginationItemState) => (
      <Text
        style={{
          fontSize: chrome().fontSize,
          fontWeight: item.current ? "600" : "400",
          fontVariant: ["tabular-nums"],
        }}
      >
        {glyph(item)}
      </Text>
    ));

  return (
    <BasePagination
      {...rest}
      compact={props.compact}
      style={mergeStyle(chrome().root, props.style)}
      itemStyle={mergeStyle(chrome().itemStyle, props.itemStyle)}
      itemClass={mergeClass(chrome().itemClass, props.itemClass)}
      renderItem={render}
    >
      {props.children}
    </BasePagination>
  );
}
