// A pagination: the look (`paginationLook` and its companions) and the `Pagination` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, terminal } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { platform, split } from "nsh";
import { Text, View } from "nsh";
import {
  Pagination as BasePagination,
  type PaginationItemState,
  type PaginationProps as BasePaginationProps,
} from "nsh/base";

import { Icon } from "./lib/icons";

// @port look/nav.tsx
const pointer = platform.desktop;

// Pagination -------------------------------------------------------------

/** What every pagination item shares: quiet until hovered, the current page
 * lit as a primary button is, citrus under its dark text (`selected:`), with
 * a color fade (still with reduced motion), the ends dimmed (`disabled:`),
 * the focus ring's outline. */
const pageItem =
  "flex-row items-center justify-center gap-1 px-2 rounded-md text-sm text-foreground " +
  "transition-colors duration-200 motion-reduce:transition-none hover:bg-hover active:opacity-70 " +
  "selected:bg-primary selected:text-primary-foreground disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-ring";

/**
 * A `Pagination`'s `itemClass`, over the component's own numbers and
 * labels: 32 points with a pointer, 44 on a touch screen; `outlined` (a
 * compact pager's Previous and Next, or every item on a touch screen) on the
 * border's edge, padded wider, 40 points tall with a pointer.
 */
export function paginationItemClass(o?: { outlined?: boolean }): string {
  const box = pointer ? (o?.outlined ? "min-w-8 h-10" : "min-w-8 h-8") : "min-w-11 h-11";
  return `${box} ${pageItem}${o?.outlined ? " px-3 border border-border" : ""}`;
}

/**
 * A `Pagination`'s items (its `renderItem`), as gpui-component's: Previous
 * and Next as chevrons (their accessibility labels name them), so a row of
 * pages fits a phone's width; a page its number, tabular; an ellipsis `…`.
 * A terminal's chevrons are glyphs.
 */
export function paginationArrows(item: PaginationItemState): JSX.Element {
  if (item.kind === "page")
    return <Text style={{ fontVariant: ["tabular-nums"] }}>{String(item.page)}</Text>;
  if (item.kind === "ellipsis") return <Text>…</Text>;
  if (terminal)
    return <Text style={{ color: colors.muted }}>{item.kind === "previous" ? "‹" : "›"}</Text>;
  return (
    <View style={item.kind === "previous" ? { transform: [{ rotate: "180deg" }] } : undefined}>
      <Icon name="chevron" size={pointer ? 14 : 16} tint={colors.text} />
    </View>
  );
}
// @port end

/**
 * `nsh/base`'s Pagination with `paginationItemClass` and `paginationArrows` by default.
 * Every base prop passes through.
 */
export type PaginationProps = BasePaginationProps & {
  /** Outlined Previous/Next (or every item on touch). */
  outlined?: boolean;
};

/** A pager of page numbers and arrows. */
export function Pagination(props: PaginationProps) {
  const [, rest] = split(props, ["outlined", "itemClass", "renderItem"]);
  return (
    <BasePagination
      {...rest}
      itemClass={props.itemClass ?? paginationItemClass({ outlined: props.outlined })}
      renderItem={props.renderItem ?? paginationArrows}
    />
  );
}
