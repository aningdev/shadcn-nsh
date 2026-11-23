// A pagination: `paginationItemClass` and `paginationArrows`, and the `Pagination` that wears them.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, rounded, shape, terminal } from "@shadcn-nsh/theme";
import { ChevronRight } from "lucide";
import type { JSX, TextStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import {
  Pagination as BasePagination,
  type PaginationItemState,
  type PaginationProps as BasePaginationProps,
} from "nsh/base";

import { Icon } from "./lib/icons";

const pointer = platform.desktop;

/** The side of an arrow's chevron: 14 points with a pointer, 16 on a touch screen. */
const arrowSize = pointer ? 14 : 16;

// Pagination -------------------------------------------------------------

/** A pagination's variants: `default`, quiet items; `outline`, an edge on each. */
export type PaginationVariant = "default" | "outline";

/** What `paginationItemClass` takes: the variant it draws for. */
export interface PaginationItemClassOptions {
  /** `default`: quiet items; `outline`: an edge on each, padded wider. */
  variant?: PaginationVariant;
}

/** What every pagination item shares: quiet until hovered, the current page
 * lit as a primary button is, citrus under its dark text (`selected:`), with
 * a color fade (still with reduced motion), the ends dimmed (`disabled:`),
 * the focus ring's outline. */
const pageItem =
  "flex-row items-center justify-center gap-1 px-2 text-sm text-foreground " +
  "transition-colors duration-200 motion-reduce:transition-none hover:bg-hover active:opacity-70 " +
  "selected:bg-primary selected:text-primary-foreground disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring";

/** A `Pagination` item's button corners (`shape.button`). */
export const paginationItemStyle = (): TextStyle => rounded(shape.button) as TextStyle;

/**
 * A `Pagination`'s `itemClass`, over the component's own numbers and
 * labels: 32 points with a pointer, 44 on a touch screen; `outline` (a
 * compact pager's Previous and Next, or every item on a touch screen) on the
 * border's edge, padded wider, 40 points tall with a pointer.
 */
export function paginationItemClass(o?: PaginationItemClassOptions): string {
  const bordered = o?.variant === "outline";
  const box = pointer ? (bordered ? "min-w-8 h-10" : "min-w-8 h-8") : "min-w-11 h-11";
  return `${box} ${pageItem}${bordered ? " px-3 border border-border" : ""}`;
}

/**
 * A `Pagination`'s items (its `renderItem`): Previous and Next as chevrons
 * (their accessibility labels name them), so a row of pages fits a phone's
 * width; a page its number, tabular; an ellipsis `…`. A terminal's chevrons
 * are glyphs.
 */
export function paginationArrows(item: PaginationItemState): JSX.Element {
  if (item.kind === "page")
    return <Text style={{ fontVariant: ["tabular-nums"] }}>{String(item.page)}</Text>;
  if (item.kind === "ellipsis") return <Text>…</Text>;
  if (terminal)
    return (
      <Text style={{ color: colors.mutedForeground }}>{item.kind === "previous" ? "‹" : "›"}</Text>
    );
  return (
    <View style={item.kind === "previous" ? { transform: [{ rotate: "180deg" }] } : undefined}>
      <Icon icon={ChevronRight} size={arrowSize} tint={colors.foreground} />
    </View>
  );
}

/**
 * `nsh/base`'s Pagination with `paginationItemClass` and `paginationArrows` by default.
 * Every base prop passes through.
 */
export type PaginationProps = BasePaginationProps & {
  /** `default`: quiet items; `outline`: an edge on Previous and Next (or every item on touch). */
  variant?: PaginationVariant;
};

/** A pager of page numbers and arrows. */
export function Pagination(props: PaginationProps) {
  const [, rest] = split(props, ["variant", "itemClass", "itemStyle", "renderItem"]);
  return (
    <BasePagination
      {...rest}
      itemClass={props.itemClass ?? paginationItemClass({ variant: props.variant })}
      itemStyle={[paginationItemStyle(), props.itemStyle ?? null]}
      renderItem={props.renderItem ?? paginationArrows}
    />
  );
}

/** What a page of the pager is (`current`, `disabled`…), from `nsh/base`. */
export type { PaginationItemState };
