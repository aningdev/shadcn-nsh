// A carousel: the look (`carouselArrowLook`, pagination) on `nsh/base` carousel parts.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, finish, focusRing, terminal } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import {
  Carousel as BaseCarousel,
  CarouselContent as BaseContent,
  CarouselItem as BaseItem,
  CarouselNext as BaseNext,
  CarouselPagination as BasePagination,
  CarouselPaginationItem as BasePaginationItem,
  CarouselPrevious as BasePrevious,
  type CarouselContentProps as BaseContentProps,
  type CarouselItemProps as BaseItemProps,
  type CarouselNextProps as BaseNextProps,
  type CarouselPaginationItemProps as BasePaginationItemProps,
  type CarouselPaginationProps as BasePaginationProps,
  type CarouselPreviousProps as BasePreviousProps,
  type CarouselProps as BaseCarouselProps,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { pressSink, pressTransition } from "./lib/press";

// @port look/nav.tsx
const pointer = platform.desktop;

// Carousel ---------------------------------------------------------------

/** A carousel's controls: an arrow's side and its icon, a pagination dot
 * and the touch-sized item around it. Compact with a pointer, roomier on a
 * touch screen. */
export const carouselSizes = pointer
  ? { arrow: 30, arrowIcon: 16, dot: 7, hit: 15 }
  : { arrow: 38, arrowIcon: 18, dot: 8, hit: 22 };

/** The properties a carousel control's states change, eased as a press. */
const fade: ViewStyle = pressTransition("background-color, border-color, opacity");

/** Options of `carouselArrowLook`. */
export interface CarouselArrowOptions {
  /** Over a photo: glass (`finish.glass`), so the photo shows through. */
  glass?: boolean;
  /** Its side, default `carouselSizes.arrow`. */
  side?: number;
}

/**
 * A carousel's arrow (spread it on `CarouselPrevious` / `CarouselNext`, or a
 * round control beside them): a circle, raised on a card or glass over a
 * photo, with an icon in the text color (`carouselSizes.arrowIcon`). Under
 * the pointer it takes the hover fill; pressed it sinks to 92% (none with
 * reduced motion); keyboard focus: `focusRing(2)`; with nothing to move to
 * it fades to 30%. A terminal sizes it to its glyph.
 */
export function carouselArrowLook(o?: CarouselArrowOptions) {
  return {
    get style(): ViewStyle {
      if (terminal)
        return { alignItems: "center", justifyContent: "center", flexShrink: 0, ...fade };
      const side = o?.side ?? carouselSizes.arrow;
      return {
        width: side,
        height: side,
        borderRadius: side / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...(o?.glass ? finish.glass : finish.raised),
        ...fade,
      };
    },
    get hoverStyle(): ViewStyle {
      return { ...finish.hover };
    },
    get activeStyle(): ViewStyle {
      return pressSink(0.92).activeStyle;
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing(2);
    },
    disabledStyle: { opacity: 0.5 } as ViewStyle,
  };
}

/**
 * A `CarouselPagination`'s look (spread it): its items in a row, and the
 * indicator, a citrus pill a dot high and two wide that springs to the item
 * of the slide shown, over its dot (`CarouselDot`). Hidden in a terminal,
 * whose dots are glyphs.
 */
export function carouselPaginationLook() {
  return {
    style: {
      flexDirection: "row",
      alignItems: "center",
      gap: terminal ? 8 : undefined,
    } as ViewStyle,
    get indicatorStyle(): ViewStyle {
      if (terminal) return { display: "none" };
      const inset = (carouselSizes.hit - carouselSizes.dot) / 2;
      return {
        top: inset,
        bottom: inset,
        marginHorizontal: 1,
        borderRadius: carouselSizes.dot / 2,
        backgroundColor: colors.accentFill,
      };
    },
  };
}

/** A `CarouselPaginationItem`'s look (spread it): a touch-sized item around
 * its dot, the `group` its dot follows, the keyboard's focus ring. */
export function carouselDotItemLook() {
  return {
    class: "group",
    style: (terminal
      ? {}
      : {
          width: carouselSizes.hit + 4,
          height: carouselSizes.hit,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: carouselSizes.hit / 2,
        }) as ViewStyle,
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
  };
}

/** The dot of a pagination item: a quiet circle that brightens under the
 * pointer and hides under the pill on the slide shown; a glyph, filled on
 * the slide shown, in a terminal. */
export function CarouselDot(props: { selected: boolean }) {
  return terminal ? (
    <Text style={{ color: props.selected ? colors.accent : colors.muted }}>
      {props.selected ? "●" : "○"}
    </Text>
  ) : (
    <View
      class="group-selected:opacity-0 opacity-70 group-hover:opacity-100"
      style={{
        width: carouselSizes.dot,
        height: carouselSizes.dot,
        borderRadius: carouselSizes.dot / 2,
        backgroundColor: alpha(colors.text, 0.24),
        ...fade,
      }}
    />
  );
}
// @port end

/** `nsh/base` Carousel. Index, looping and swipes stay in base. */
export type CarouselProps = BaseCarouselProps;

/** Snap viewport. */
export type CarouselContentProps = BaseContentProps;

/** One slide. Default width is one slide per view (`w-full`). */
export type CarouselItemProps = BaseItemProps;

function mergeClass(base: string, extra?: string | null): string | undefined {
  if (extra == null) return base;
  return `${base} ${extra}`;
}

/** Options for arrow chrome on previous / next. */
export type CarouselArrowProps = CarouselArrowOptions;

/** Pagination with a pill that travels to the shown slide. */
export type CarouselPaginationProps = BasePaginationProps;

export type CarouselPaginationItemProps = BasePaginationItemProps;

export type CarouselPreviousProps = BasePreviousProps & CarouselArrowOptions;
export type CarouselNextProps = BaseNextProps & CarouselArrowOptions;

function mergeArrowChild(mark: "previous" | "next", children: JSX.Element | undefined) {
  if (children !== undefined) return children;
  if (terminal) {
    return <Text>{mark === "previous" ? "‹" : "›"}</Text>;
  }
  const icon = carouselSizes.arrowIcon;
  // The tint is read in the JSX, so it follows the appearance (light / dark).
  if (mark === "previous") {
    return <Icon name="back" size={icon} tint={colors.text} />;
  }
  return (
    <View style={{ transform: [{ scaleX: -1 }] }}>
      <Icon name="back" size={icon} tint={colors.text} />
    </View>
  );
}

/** Slides and controls the app lays out around it. */
export function Carousel(props: CarouselProps) {
  const [, rest] = split(props, ["class", "style"]);
  return (
    <BaseCarousel
      {...rest}
      class={props.class}
      style={overlayStyle({ gap: 8, alignSelf: "stretch" }, props.style)}
    />
  );
}

/** Snap viewport. */
export function CarouselContent(props: CarouselContentProps) {
  const [, rest] = split(props, ["class", "style"]);
  return (
    <BaseContent
      {...rest}
      class={props.class}
      style={overlayStyle({ minHeight: 48, alignSelf: "stretch" }, props.style)}
    />
  );
}

/** One slide. */
export function CarouselItem(props: CarouselItemProps) {
  const [, rest] = split(props, ["class", "style"]);
  return (
    <BaseItem
      {...rest}
      class={mergeClass("w-full", props.class)}
      style={overlayStyle(
        { flexShrink: 0, alignItems: "center", justifyContent: "center" },
        props.style,
      )}
    />
  );
}

function overlayStyle<T>(base: T, extra: T | null | undefined): T | (T | null)[] {
  return extra == null ? base : [base, extra];
}

/** Previous slide control. */
export function CarouselPrevious(props: CarouselPreviousProps) {
  const [, rest] = split(props, [
    "glass",
    "side",
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
    "children",
    "accessibilityLabel",
  ]);
  const look = carouselArrowLook({ glass: props.glass, side: props.side });
  return (
    <BasePrevious
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Previous slide"}
      class={props.class}
      style={overlayStyle(look.style, props.style)}
      hoverStyle={overlayStyle(look.hoverStyle, props.hoverStyle)}
      activeStyle={overlayStyle(look.activeStyle, props.activeStyle)}
      focusVisibleStyle={overlayStyle(look.focusVisibleStyle, props.focusVisibleStyle)}
      disabledStyle={overlayStyle(look.disabledStyle, props.disabledStyle)}
    >
      {mergeArrowChild("previous", props.children)}
    </BasePrevious>
  );
}

/** Next slide control. */
export function CarouselNext(props: CarouselNextProps) {
  const [, rest] = split(props, [
    "glass",
    "side",
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
    "children",
    "accessibilityLabel",
  ]);
  const look = carouselArrowLook({ glass: props.glass, side: props.side });
  return (
    <BaseNext
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Next slide"}
      class={props.class}
      style={overlayStyle(look.style, props.style)}
      hoverStyle={overlayStyle(look.hoverStyle, props.hoverStyle)}
      activeStyle={overlayStyle(look.activeStyle, props.activeStyle)}
      focusVisibleStyle={overlayStyle(look.focusVisibleStyle, props.focusVisibleStyle)}
      disabledStyle={overlayStyle(look.disabledStyle, props.disabledStyle)}
    >
      {mergeArrowChild("next", props.children)}
    </BaseNext>
  );
}

/** Dot row and traveling indicator. */
export function CarouselPagination(props: CarouselPaginationProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "indicatorClass",
    "indicatorStyle",
    "accessibilityLabel",
  ]);
  const look = carouselPaginationLook();
  return (
    <BasePagination
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Choose a slide"}
      class={props.class}
      style={overlayStyle(look.style, props.style)}
      indicatorClass={props.indicatorClass}
      indicatorStyle={overlayStyle(look.indicatorStyle, props.indicatorStyle)}
    />
  );
}

/** One pagination dot. */
export function CarouselPaginationItem(props: CarouselPaginationItemProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "focusVisibleStyle",
    "children",
    "accessibilityLabel",
  ]);
  const look = carouselDotItemLook();
  return (
    <BasePaginationItem
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? `Slide ${props.index + 1}`}
      class={mergeClass(look.class, props.class)}
      style={overlayStyle(look.style, props.style)}
      focusVisibleStyle={overlayStyle(look.focusVisibleStyle, props.focusVisibleStyle)}
    >
      {props.children ?? <CarouselDot selected={false} />}
    </BasePaginationItem>
  );
}
