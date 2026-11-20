// A carousel: the look (arrows, the pagination's pill and its dots) and the parts on `nsh/base`'s
// carousel.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, finish, focusRing, terminal, stroke, dimmed } from "@shadcn-nsh/theme";
import { ChevronLeft } from "lucide";
import type { JSX, StyleProp, ViewStyle } from "nsh";
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
import { joinClass } from "./lib/utils";

// @port look/nav.tsx
/** A pointer, where a carousel's controls are compact; a touch screen gets roomier ones. */
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
        borderWidth: stroke.control,
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
    get disabledStyle(): ViewStyle {
      return { opacity: dimmed.disabled };
    },
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
    } satisfies ViewStyle,
    get indicatorStyle(): ViewStyle {
      if (terminal) return { display: "none" };
      const inset = (carouselSizes.hit - carouselSizes.dot) / 2;
      return {
        top: inset,
        bottom: inset,
        marginHorizontal: 1,
        borderRadius: carouselSizes.dot / 2,
        backgroundColor: colors.brandFill,
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
        }) satisfies ViewStyle,
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
    <Text style={{ color: props.selected ? colors.brand : colors.mutedForeground }}>
      {props.selected ? "●" : "○"}
    </Text>
  ) : (
    <View
      class="group-selected:opacity-0 opacity-70 group-hover:opacity-100"
      style={{
        width: carouselSizes.dot,
        height: carouselSizes.dot,
        borderRadius: carouselSizes.dot / 2,
        backgroundColor: alpha(colors.foreground, 0.24),
        ...fade,
      }}
    />
  );
}
// @port end

/** `top` over `under` as two styles, or `under` alone when there is nothing over it. */
function over(under: StyleProp<ViewStyle>, top: StyleProp<ViewStyle>): StyleProp<ViewStyle> {
  return top == null ? under : [under, top];
}

/** `nsh/base`'s Carousel: index, looping and swipes are base's; this adds the look around it. */
export type CarouselProps = BaseCarouselProps;

/** The snap viewport the slides scroll in. */
export type CarouselContentProps = BaseContentProps;

/** One slide: one slide per view unless the app gives it a width. */
export type CarouselItemProps = BaseItemProps;

/** An arrow's options: `glass` over a photo, and its `side`. */
export type CarouselArrowProps = CarouselArrowOptions;

/** The dot row, with the pill that travels to the slide shown. */
export type CarouselPaginationProps = BasePaginationProps;

/** One dot: `index` says which slide it stands for, and names it for screen readers. */
export type CarouselPaginationItemProps = BasePaginationItemProps;

/** The previous arrow, with the look's options. */
export type CarouselPreviousProps = BasePreviousProps & CarouselArrowOptions;

/** The next arrow, with the look's options. */
export type CarouselNextProps = BaseNextProps & CarouselArrowOptions;

/** What an arrow draws when the app gives it no child: a chevron, pointed back for `next`. */
function mergeArrowChild(mark: "previous" | "next", children: JSX.Element | undefined) {
  if (children !== undefined) return children;
  if (terminal) {
    return <Text>{mark === "previous" ? "‹" : "›"}</Text>;
  }
  const icon = carouselSizes.arrowIcon;
  // The tint is read in the JSX, so it follows the appearance (light / dark).
  if (mark === "previous") {
    return <Icon icon={ChevronLeft} size={icon} tint={colors.foreground} />;
  }
  return (
    <View style={{ transform: [{ scaleX: -1 }] }}>
      <Icon icon={ChevronLeft} size={icon} tint={colors.foreground} />
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
      style={over({ gap: 8, alignSelf: "stretch" }, props.style)}
    />
  );
}

/** The viewport the slides snap in. */
export function CarouselContent(props: CarouselContentProps) {
  const [, rest] = split(props, ["class", "style"]);
  return (
    <BaseContent
      {...rest}
      class={props.class}
      style={over({ minHeight: 48, alignSelf: "stretch" }, props.style)}
    />
  );
}

/** One slide. */
export function CarouselItem(props: CarouselItemProps) {
  const [, rest] = split(props, ["class", "style"]);
  return (
    <BaseItem
      {...rest}
      class={joinClass("w-full", props.class)}
      style={over({ flexShrink: 0, alignItems: "center", justifyContent: "center" }, props.style)}
    />
  );
}

/** The control that goes back a slide: `glass` and `side` shape its look, an arrow unless given a
 * child. */
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
      style={over(look.style, props.style)}
      hoverStyle={over(look.hoverStyle, props.hoverStyle)}
      activeStyle={over(look.activeStyle, props.activeStyle)}
      focusVisibleStyle={over(look.focusVisibleStyle, props.focusVisibleStyle)}
      disabledStyle={over(look.disabledStyle, props.disabledStyle)}
    >
      {mergeArrowChild("previous", props.children)}
    </BasePrevious>
  );
}

/** The control that goes on to the next slide: `glass` and `side` shape its look, an arrow unless
 * given a child. */
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
      style={over(look.style, props.style)}
      hoverStyle={over(look.hoverStyle, props.hoverStyle)}
      activeStyle={over(look.activeStyle, props.activeStyle)}
      focusVisibleStyle={over(look.focusVisibleStyle, props.focusVisibleStyle)}
      disabledStyle={over(look.disabledStyle, props.disabledStyle)}
    >
      {mergeArrowChild("next", props.children)}
    </BaseNext>
  );
}

/** The row of dots, and the pill that travels along it to the slide shown. */
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
      style={over(look.style, props.style)}
      indicatorClass={props.indicatorClass}
      indicatorStyle={over(look.indicatorStyle, props.indicatorStyle)}
    />
  );
}

/**
 * One dot of the row: its `index`, and whatever you draw in it — give it a `CarouselDot`,
 * `selected` from the slide shown. `nsh/base` keeps the current slide to itself (it only reports
 * it through the carousel's `onChange`), so the item cannot draw a dot that stays right: given no
 * child it draws nothing, rather than a dot that never lights.
 */
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
      class={joinClass(look.class, props.class)}
      style={over(look.style, props.style)}
      focusVisibleStyle={over(look.focusVisibleStyle, props.focusVisibleStyle)}
    >
      {props.children}
    </BasePaginationItem>
  );
}
