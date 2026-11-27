// An item: the look (`itemLook`) and the ten parts that wear it.

import {
  colors,
  font,
  metrics,
  rounded,
  shape,
  stroke,
  surface,
  terminal,
} from "@shadcn-nsh/theme";
import type { TextProps, TextStyle, ViewProps, ViewStyle } from "nsh";
import { split, Text, View } from "nsh";

import { controlSize, density } from "./lib/surface";

/**
 * An item's surface: `default` (nothing around it, for a list of rows with a separator),
 * `outline` (the hairline edge of a surface, one row standing alone) or `muted` (the muted fill,
 * where a section's content sits).
 */
export type ItemVariant = "default" | "outline" | "muted";

/** A row's size: `default`, room for a title, a description and a control, or `sm`, one line tighter. */
export type ItemSize = "default" | "sm";

/**
 * What sits before an item's content: `default` (anything the app draws — an avatar, a status
 * dot), `icon` (the tile an icon goes in: a square well with an edge) or `image` (a square that
 * clips what it holds: a photograph, a thumbnail).
 */
export type ItemMediaVariant = "default" | "icon" | "image";

/** A list of items: a column with `role="list"`. */
export type ItemGroupProps = ViewProps;

/** A hairline between items. */
export type ItemSeparatorProps = ViewProps;

/** One row: what sits before its content, the content, and the controls after it. */
export type ItemProps = ViewProps & {
  /** Default `default`: no surface. `outline` edges the row, `muted` puts it on the muted fill. */
  variant?: ItemVariant;
  /** Default `default`, room for a title and a description; `sm` is one line tighter. */
  size?: ItemSize;
};

/** What sits before an item's content: an avatar, an icon's tile, a clipping frame. */
export type ItemMediaProps = ViewProps & {
  /** Default `default` (the app's own content); `icon` is a square tile, `image` a square that clips. */
  variant?: ItemMediaVariant;
};

/** An item's title and description, beside its media and its actions. */
export type ItemContentProps = ViewProps;

/** An item's title. */
export type ItemTitleProps = TextProps;

/** A quieter line under an item's title, wrapping to two lines. */
export type ItemDescriptionProps = TextProps;

/** What sits at an item's end: buttons, a badge, a switch. */
export type ItemActionsProps = ViewProps;

/** A line across the whole row above its content (a title one side, a word the other). */
export type ItemHeaderProps = ViewProps;

/** A line across the whole row under its content. */
export type ItemFooterProps = ViewProps;

/** A list of items. */
export function ItemGroup(props: ItemGroupProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      role="list"
      class={props.class}
      classList={props.classList}
      style={[itemLook().group, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** A hairline between items. */
export function ItemSeparator(props: ItemSeparatorProps) {
  const [, rest] = split(props, ["class", "classList", "style"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().separator, props.style ?? null]}
    />
  );
}

/** One row, `variant="default"` and `size="default"` unless told otherwise. */
export function Item(props: ItemProps) {
  const [, rest] = split(props, ["variant", "size", "class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[
        itemLook().item(props.variant ?? "default", props.size ?? "default"),
        props.style ?? null,
      ]}
    >
      {props.children}
    </View>
  );
}

/** An item's media: plain, an icon's tile, or a frame that clips an image. */
export function ItemMedia(props: ItemMediaProps) {
  const [, rest] = split(props, ["variant", "class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().media(props.variant ?? "default"), props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** An item's title and description. */
export function ItemContent(props: ItemContentProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().content, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** An item's title. */
export function ItemTitle(props: ItemTitleProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <Text
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().title, props.style ?? null]}
    >
      {props.children}
    </Text>
  );
}

/** A quieter line under an item's title. */
export function ItemDescription(props: ItemDescriptionProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <Text
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().description, props.style ?? null]}
    >
      {props.children}
    </Text>
  );
}

/** What sits at an item's end. */
export function ItemActions(props: ItemActionsProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().actions, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** A line across the row above its content. */
export function ItemHeader(props: ItemHeaderProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().full, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** A line across the row under its content. */
export function ItemFooter(props: ItemFooterProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[itemLook().full, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

// Shared item primitives
// `nav-stack` wears `itemLook`.

/** An item's parts as the styles they wear: spread each one. */
export interface ItemLook {
  /** A list of items: a column, its rows `density.gap + 4` apart. */
  readonly group: ViewStyle;
  /** A hairline between items, room above and below it. */
  readonly separator: ViewStyle;
  /** A row: `variant` picks its surface, `size` its padding and gaps. */
  item(variant: ItemVariant, size: ItemSize): ViewStyle;
  /** What sits before the content: the icon's tile or the image's frame. */
  media(variant: ItemMediaVariant): ViewStyle;
  /** The title and its description: a column that takes the room the row leaves. */
  readonly content: ViewStyle;
  readonly title: TextStyle;
  readonly description: TextStyle;
  /** The controls at the row's end. */
  readonly actions: ViewStyle;
  /** A line across the row before its content (a title and a trailing word). */
  readonly full: ViewStyle;
}

/**
 * An item family's look, after shadcn/ui's secondary `Item`, written from the
 * theme's roles: a row with the page's density in its padding and its gaps
 * (`density.pad`, 14 or 16), corners of the theme's control tier (`shape.control`),
 * the title in the text colour at the labels' size and medium weight, the
 * description a step quieter and muted, wrapping to two lines. `default`
 * draws no surface, `outline` the hairline edge of a surface, and `muted` the
 * muted fill (`colors.muted`, shadcn's `bg-muted`): a well that reads on a
 * card and on the page, in either appearance. An icon's tile is a control's box
 * plus 12, on the well with a hairline edge; an image's frame is a square that
 * clips. The terminal draws rows one row high, with no surface and no tile.
 */
export function itemLook(): ItemLook {
  return {
    get group(): ViewStyle {
      return terminal ? terminalGroup() : pointerGroup();
    },
    get separator(): ViewStyle {
      return terminal ? terminalSeparator() : pointerSeparator();
    },
    item: (variant: ItemVariant, size: ItemSize): ViewStyle =>
      terminal ? terminalItem() : pointerItem(variant, size),
    media: (variant: ItemMediaVariant): ViewStyle => {
      if (terminal || variant === "default") return plainMedia();
      // A control's box plus 12; read here so a theme switch redraws the tile.
      const iconTile = controlSize.control + 12;
      // A row's own least height less 8.
      const imageTile = controlSize.row - 8;
      return variant === "icon" ? iconMedia(iconTile) : imageMedia(imageTile);
    },
    get content(): ViewStyle {
      return {
        flexGrow: 1,
        flexShrink: 1,
        // A row that wraps (`flexWrap`, for its header and its footer) breaks the line by the
        // items' base sizes before it shrinks any of them: a base of 0 is what lets the content
        // take the room left of the controls and wrap its text inside it.
        flexBasis: 0,
        flexDirection: "column",
        gap: 2,
      };
    },
    get title(): TextStyle {
      return {
        alignSelf: "flex-start",
        fontSize: controlSize.label,
        fontWeight: font.weight("label"),
        color: colors.foreground,
      };
    },
    get description(): TextStyle {
      return {
        fontSize: controlSize.detail,
        color: colors.mutedForeground,
        // Two lines, as shadcn's `line-clamp-2`: a third is cut with an ellipsis.
        numberOfLines: 2,
      };
    },
    get actions(): ViewStyle {
      return { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 8 };
    },
    get full(): ViewStyle {
      return {
        flexBasis: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      };
    },
  };
}

// Private helpers & looks

/** A row's padding and gaps: `sm` takes four points off each. */
const rowBox = (size: ItemSize) =>
  size === "sm"
    ? { paddingVertical: density.pad - 4, paddingHorizontal: density.pad, gap: 10 }
    : { paddingVertical: density.pad, paddingHorizontal: density.pad, gap: density.gap + 2 };

/** A list of items with a pointer or a touch screen: a column, `density.gap` apart. */
function pointerGroup(): ViewStyle {
  return {
    flexDirection: "column",
    gap: density.gap,
    width: "100%",
  };
}

/** A hairline between items, 4 points above and below. */
function pointerSeparator(): ViewStyle {
  return {
    height: stroke.hairline,
    backgroundColor: colors.line,
    marginVertical: 4,
  };
}

/** A row with a pointer or a touch screen: its surface, its padding, wrapping for a header and a footer. */
function pointerItem(variant: ItemVariant, size: ItemSize): ViewStyle {
  return {
    ...rowBox(size),
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    minHeight: controlSize.row,
    ...rounded(shape.control),
    borderWidth: stroke.hairline,
    borderColor: variant === "outline" ? colors.border : "transparent",
    backgroundColor: variant === "muted" ? colors.muted : "transparent",
  };
}

/** Media with no tile: the app's own avatar or dot, never shrunk. */
function plainMedia(): ViewStyle {
  return { flexShrink: 0, alignItems: "center", justifyContent: "center" };
}

/** An icon's tile: a square well with a hairline edge. */
function iconMedia(side: number): ViewStyle {
  return {
    flexShrink: 0,
    width: side,
    height: side,
    alignItems: "center",
    justifyContent: "center",
    ...rounded(shape.control),
    borderWidth: stroke.hairline,
    borderColor: colors.border,
    backgroundColor: surface("inset").style.backgroundColor,
  };
}

/** An image's frame: a square that clips. */
function imageMedia(side: number): ViewStyle {
  return {
    flexShrink: 0,
    width: side,
    height: side,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...rounded(shape.control),
    backgroundColor: surface("inset").style.backgroundColor,
  };
}

// Terminal

/** A list of items in the terminal: a column with no gap (the rows are the gap). */
function terminalGroup(): ViewStyle {
  return {
    flexDirection: "column",
    gap: 0,
    width: "100%",
  };
}

/** A hairline between items, with no room around it. */
function terminalSeparator(): ViewStyle {
  return {
    height: stroke.hairline,
    backgroundColor: colors.line,
    marginVertical: 0,
  };
}

/** A row in the terminal: one row high, one column between its parts, no surface and no tile. */
function terminalItem(): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: metrics.control.gap,
    minHeight: controlSize.row,
  };
}
