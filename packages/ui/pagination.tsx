// A pagination: `paginationItemClass` and `paginationArrows`, and the `Pagination` that wears them.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { JSX, TextStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import {
  Pagination as BasePagination,
  type PaginationItemState,
  type PaginationProps as BasePaginationProps,
} from "nsh/base";

import { buttonCorner, colors, rounded, terminal } from "../theme";
import { ChevronRight, Icon } from "./lib/icons";

/** A pagination's variants: `default`, quiet items; `outline`, an edge on each. */
export type PaginationVariant = "default" | "outline";

/**
 * `nsh/base`'s Pagination with `paginationItemClass` and `paginationArrows` by default.
 * Every base prop passes through.
 */
export type PaginationProps = BasePaginationProps & {
  /** `default`: quiet items; `outline`: an edge on Previous and Next (or every item on touch). */
  variant?: PaginationVariant;
};

/** What a page of the pager is (`current`, `disabled`…), from `nsh/base`. */
export type { PaginationItemState };

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

// Shared pagination primitives
// Demos, showcase and gallery pass `paginationItemClass` and `paginationArrows`.

/** What `paginationItemClass` takes: the variant it draws for. */
export interface PaginationItemClassOptions {
  /** `default`: quiet items; `outline`: an edge on each, padded wider. */
  variant?: PaginationVariant;
}

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
  if (terminal) return terminalArrow(item.kind === "previous");
  return (
    <View style={item.kind === "previous" ? { transform: [{ rotate: "180deg" }] } : undefined}>
      <Icon icon={ChevronRight} size={arrowSize} tint={colors.foreground} />
    </View>
  );
}

// Private helpers & looks

const pointer = platform.desktop;

/** The side of an arrow's chevron: 14 points with a pointer, 16 on a touch screen. */
const arrowSize = pointer ? 14 : 16;

/** What every pagination item shares: quiet until hovered, the current page
 * lit as a primary button is, citrus under its dark text (`selected:`), with
 * a color fade (still with reduced motion), the ends dimmed (`disabled:`),
 * the focus ring's outline. */
const pageItem =
  "flex-row items-center justify-center gap-1 px-2 text-sm text-foreground " +
  "transition-colors duration-200 motion-reduce:transition-none hover:bg-accent active:opacity-70 " +
  "selected:bg-primary selected:text-primary-foreground disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring";

/** A `Pagination` item's button corners (`buttonCorner("default")`). */
const paginationItemStyle = (): TextStyle => rounded(buttonCorner("default")) as TextStyle;

// Terminal

/** Previous and Next where a terminal draws no icons: `‹` and `›` in the muted ink. */
function terminalArrow(previous: boolean) {
  return <Text style={{ color: colors.mutedForeground }}>{previous ? "‹" : "›"}</Text>;
}
