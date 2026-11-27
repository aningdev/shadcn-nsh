// A carousel: the look (arrows, the pagination's pill and its dots) and the parts on `nsh/base`'s
// carousel.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

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

import { alpha, colors, feedback, focusRing, stroke, surface, terminal } from "../theme";
import { ChevronLeft, Icon } from "./lib/icons";
import { pressTransition } from "./lib/motion";
import { joinClass } from "./lib/utils";

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

/** Slides and controls the app lays out around it. */
export function Carousel(props: CarouselProps) {
  const [, rest] = split(props, ["class", "classList", "style"]);
  return (
    <BaseCarousel
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[{ gap: 8, alignSelf: "stretch" }, props.style ?? null]}
    />
  );
}

/** The viewport the slides snap in. */
export function CarouselContent(props: CarouselContentProps) {
  const [, rest] = split(props, ["class", "classList", "style"]);
  return (
    <BaseContent
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[{ minHeight: 48, alignSelf: "stretch" }, props.style ?? null]}
    />
  );
}

/** One slide. */
export function CarouselItem(props: CarouselItemProps) {
  const [, rest] = split(props, ["class", "classList", "style"]);
  return (
    <BaseItem
      {...rest}
      class={joinClass("w-full", props.class)}
      classList={props.classList}
      style={[
        { flexShrink: 0, alignItems: "center", justifyContent: "center" },
        props.style ?? null,
      ]}
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
    "classList",
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
      {...(props.glass ? surface("glass").platformProps : {})}
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Previous slide"}
      class={props.class}
      classList={props.classList}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle, props.hoverStyle ?? null]}
      activeStyle={[look.activeStyle, props.activeStyle ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
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
    "classList",
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
      {...(props.glass ? surface("glass").platformProps : {})}
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Next slide"}
      class={props.class}
      classList={props.classList}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle, props.hoverStyle ?? null]}
      activeStyle={[look.activeStyle, props.activeStyle ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
    >
      {mergeArrowChild("next", props.children)}
    </BaseNext>
  );
}

/** The row of dots, and the pill that travels along it to the slide shown. */
export function CarouselPagination(props: CarouselPaginationProps) {
  const [, rest] = split(props, [
    "class",
    "classList",
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
      classList={props.classList}
      style={[look.style, props.style ?? null]}
      indicatorClass={props.indicatorClass}
      indicatorStyle={[look.indicatorStyle, props.indicatorStyle ?? null]}
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
    "classList",
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
      classList={props.classList}
      style={[look.style, props.style ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
    >
      {props.children}
    </BasePaginationItem>
  );
}

/** The dot of a pagination item: a quiet circle that brightens under the
 * pointer and hides under the pill on the slide shown; a glyph, filled on
 * the slide shown, in a terminal. */
export function CarouselDot(props: {
  /** The slide this dot stands for is the one shown. */
  selected: boolean;
  /** Tailwind classes on the dot, after its own. */
  class?: string | null;
  /** Tailwind classes toggled on the dot. */
  classList?: Record<string, boolean | null | undefined>;
  /** Over the dot's look. */
  style?: StyleProp<ViewStyle>;
}) {
  if (terminal) return terminalDot(props);
  return (
    <View
      class={joinClass("group-selected:opacity-0 opacity-70 group-hover:opacity-100", props.class)}
      classList={props.classList}
      style={[
        {
          width: carouselSizes.dot,
          height: carouselSizes.dot,
          borderRadius: carouselSizes.dot / 2,
          backgroundColor: alpha(colors.foreground, 0.24),
          ...fade,
        },
        props.style ?? null,
      ]}
    />
  );
}

// Shared carousel primitives
// Gallery and showcase read `carouselSizes`, `carouselArrowLook`, `carouselPaginationLook` and
// `carouselDotItemLook`.

/** A pointer, where a carousel's controls are compact; a touch screen gets roomier ones. */
const pointer = platform.desktop;

/** A carousel's controls: an arrow's side and its icon, a pagination dot
 * and the touch-sized item around it. Compact with a pointer, roomier on a
 * touch screen. */
export const carouselSizes = pointer
  ? { arrow: 30, arrowIcon: 16, dot: 7, hit: 15 }
  : { arrow: 38, arrowIcon: 18, dot: 8, hit: 22 };

/** Options of `carouselArrowLook`. */
export interface CarouselArrowOptions {
  /** Over a photo: glass (`finish.glass`), so the photo shows through. */
  glass?: boolean;
  /** Its side, default `carouselSizes.arrow`. */
  side?: number;
}

/**
 * A carousel's arrow (spread it on `CarouselPrevious` / `CarouselNext`), the same under every
 * theme: the gallery's pill, a circle raised on a card or glass over a photo, a chevron of
 * `carouselSizes.arrowIcon` in the text color. `icon` is the glyph an arrow draws (its side and
 * tint). Under the pointer it takes the hover fill; pressed it sinks to 92%; keyboard focus:
 * `focusRing(2)`; with nothing to move to it fades to 30%. A terminal sizes it to its glyph.
 */
export function carouselArrowLook(o?: CarouselArrowOptions) {
  return {
    /** The glyph an arrow draws when the app gives it none: its side and tint. */
    get icon(): { size: number; tint: string } {
      return arrowIcon();
    },
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
        ...(o?.glass ? surface("glass").style : surface("raised").style),
        ...fade,
      };
    },
    get hoverStyle(): ViewStyle {
      if (feedback.hoverOverlay > 0) {
        return feedback.hoverStyle("foreground");
      }
      return o?.glass ? feedback.hoverStyle() : feedback.hoverSurface();
    },
    get activeStyle(): ViewStyle {
      return feedback.press("surface", { scale: 0.92, ink: "foreground" }).activeStyle;
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing(2);
    },
    get disabledStyle(): ViewStyle {
      return { opacity: feedback.disabled.contentOpacity };
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
        backgroundColor: colors.primary,
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

// Private helpers & looks

/** The properties a carousel control's states change, eased as a press. */
const fade: ViewStyle = pressTransition("background-color, border-color, opacity");

/** The glyph an arrow draws when the app gives it none: a chevron in the text color, `carouselSizes.arrowIcon` wide. */
function arrowIcon(): { size: number; tint: string } {
  return { size: carouselSizes.arrowIcon, tint: colors.foreground };
}

// Terminal

/** What an arrow draws when the app gives it no child: a chevron, pointed back for `next`. */
function mergeArrowChild(mark: "previous" | "next", children: JSX.Element | undefined) {
  if (children !== undefined) return children;
  if (terminal) return <Text>{mark === "previous" ? "‹" : "›"}</Text>;
  const icon = arrowIcon();
  // The tint is read in the JSX, so it follows the appearance (light / dark).
  if (mark === "previous") {
    return <Icon icon={ChevronLeft} size={icon.size} tint={icon.tint} />;
  }
  return (
    <View style={{ transform: [{ scaleX: -1 }] }}>
      <Icon icon={ChevronLeft} size={icon.size} tint={icon.tint} />
    </View>
  );
}

/** A pagination dot where a terminal draws no circles: `●` on the slide shown, `○` on the rest. */
function terminalDot(props: {
  selected: boolean;
  class?: string | null;
  classList?: Record<string, boolean | null | undefined>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Text
      class={joinClass(undefined, props.class)}
      classList={props.classList}
      style={[
        { color: props.selected ? colors.brand : colors.mutedForeground },
        props.style ?? null,
      ]}
    >
      {props.selected ? "●" : "○"}
    </Text>
  );
}
