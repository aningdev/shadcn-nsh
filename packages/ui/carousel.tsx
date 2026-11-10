// Source: examples/nsh-gallery-ui/look/nav.tsx @ 64ab8a1d (baseline), see NOTICE.
// Pagination dots also follow examples/nsh-gallery-ui/look/tabs.tsx (the traveling indicator).
import { alpha, colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { StyleProp, TextStyle, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
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

import { buttonVariants } from "./button";
import { isPointer } from "./lib/density";

/** Theme layer on `nsh/base` Carousel. Index, looping and swipes stay in base. */
export type CarouselProps = BaseCarouselProps;

/** Theme layer on `nsh/base` CarouselContent, the snap viewport. */
export type CarouselContentProps = BaseContentProps;

/** Theme layer on `nsh/base` CarouselItem. Default width is one slide per view. */
export type CarouselItemProps = BaseItemProps;

/** Theme layer on `nsh/base` CarouselPrevious. The arrow reuses `buttonVariants`. */
export type CarouselPreviousProps = BasePreviousProps;

/** Theme layer on `nsh/base` CarouselNext. Same look as previous. */
export type CarouselNextProps = BaseNextProps;

/** Theme layer on `nsh/base` CarouselPagination, with a pill that travels to the shown slide. */
export type CarouselPaginationProps = BasePaginationProps;

/** Theme layer on `nsh/base` CarouselPaginationItem. `index` is the slide it shows. */
export type CarouselPaginationItemProps = BasePaginationItemProps;

/** What `buttonVariants` returns for the arrow. Snapshotted, so read it inside `computed`. */
type ArrowLook = ReturnType<typeof buttonVariants>;

/**
 * Slide chrome, the round arrow, and the dots.
 * The arrow is a `button` secondary icon, made round; previous and next are already buttons, so this does not nest one.
 */
export type CarouselChrome = {
  root: ViewStyle;
  content: ViewStyle;
  item: ViewStyle;
  /** Secondary icon button, plus a full corner so the minimum box reads as a circle. */
  arrow: ArrowLook;
  round: ViewStyle;
  pagination: ViewStyle;
  /** Pill over the shown dot. `primary` stands in for the reference accent. */
  indicator: ViewStyle;
  dotItem: ViewStyle;
  dotFocus: ViewStyle;
  /** The quiet circle. A fixed mark (7 pointer / 8 touch), not a text box. */
  dot: ViewStyle;
  dotClass: string;
  label: TextStyle;
  /** Dot diameter, for a density check. */
  dotSize: number;
  /** Smallest arrow box, the button `icon-sm` step (28 pointer / 36 touch). */
  arrowMin: number;
};

/** Wrapper defaults, then consumer — consumer wins per key. */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
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
 * Dots from the reference (`carouselSizes`): 7 / 15 with a pointer, 8 / 22 on a touch screen.
 * The arrow's box comes from `button` `icon-sm` (28 / 36), not the reference's fixed 30 / 38.
 */
function look(): CarouselChrome {
  const pointer = isPointer();
  const dotSize = pointer ? 7 : 8;
  const hit = pointer ? 15 : 22;
  const inset = (hit - dotSize) / 2;
  const arrow = buttonVariants({ variant: "secondary", size: "icon-sm" });
  return {
    root: { gap: 8, alignSelf: "stretch" },
    // A floor so an empty viewport is still a slide, not a hairline. The app sets the real height.
    content: { minHeight: 48, alignSelf: "stretch" },
    item: {
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      borderRadius: radius.control,
      backgroundColor: colors.muted,
    },
    arrow,
    round: { borderRadius: 999 },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    indicator: {
      top: inset,
      bottom: inset,
      marginHorizontal: 1,
      borderRadius: dotSize / 2,
      backgroundColor: colors.primary,
    },
    dotItem: {
      minWidth: hit + 4,
      minHeight: hit,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: hit / 2,
    },
    dotFocus: focusRing(),
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: alpha(colors.foreground, 0.24),
    },
    dotClass:
      "opacity-70 group-hover:opacity-100 group-selected:opacity-0 transition-opacity duration-150 motion-reduce:transition-none",
    label: { fontSize: pointer ? 13 : 15, fontWeight: "500", color: colors.foreground },
    dotSize,
    arrowMin: pointer ? 28 : 36,
  };
}

/** Carousel chrome for the current idiom. Call it where the theme is read. */
export function carouselVariants(): CarouselChrome {
  return look();
}

/** The slides and the controls the app lays out in it. */
export function Carousel(props: CarouselProps) {
  const [, rest] = split(props, ["class", "style"]);
  const chrome = computed(() => carouselVariants());
  return (
    <BaseCarousel {...rest} class={props.class} style={mergeStyle(chrome().root, props.style)} />
  );
}

/** The snap viewport. One slide fills it unless an item sets its own size. */
export function CarouselContent(props: CarouselContentProps) {
  const [, rest] = split(props, ["class", "style"]);
  const chrome = computed(() => carouselVariants());
  return (
    <BaseContent {...rest} class={props.class} style={mergeStyle(chrome().content, props.style)} />
  );
}

/** One slide. `w-full` is one slide per view; override it for a row of cards. */
export function CarouselItem(props: CarouselItemProps) {
  const [, rest] = split(props, ["class", "style"]);
  const chrome = computed(() => carouselVariants());
  return (
    <BaseItem
      {...rest}
      class={mergeClass("w-full", props.class)}
      style={mergeStyle(chrome().item, props.style)}
    />
  );
}

function ArrowGlyph(props: { mark: string }) {
  const chrome = computed(() => carouselVariants());
  const label = () => chrome().arrow.label;
  return (
    <Text style={{ color: label().color, fontSize: label().fontSize, fontWeight: "500" }}>
      {props.mark}
    </Text>
  );
}

/** Moves to the previous slide. Disabled on the first unless the carousel loops. */
export function CarouselPrevious(props: CarouselPreviousProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "children",
    "accessibilityLabel",
  ]);
  const chrome = computed(() => carouselVariants());
  const arrow = () => chrome().arrow;
  return (
    <BasePrevious
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Previous slide"}
      class={props.class}
      style={mergeStyle(mergeStyle(arrow().style, chrome().round), props.style)}
      hoverStyle={mergeStyle(arrow().hoverStyle, props.hoverStyle)}
      activeStyle={mergeStyle(arrow().activeStyle, props.activeStyle)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      disabledStyle={mergeStyle(arrow().disabledStyle, props.disabledStyle)}
    >
      {props.children ?? <ArrowGlyph mark="‹" />}
    </BasePrevious>
  );
}

/** Moves to the next slide. Disabled on the last unless the carousel loops. */
export function CarouselNext(props: CarouselNextProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "children",
    "accessibilityLabel",
  ]);
  const chrome = computed(() => carouselVariants());
  const arrow = () => chrome().arrow;
  return (
    <BaseNext
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Next slide"}
      class={props.class}
      style={mergeStyle(mergeStyle(arrow().style, chrome().round), props.style)}
      hoverStyle={mergeStyle(arrow().hoverStyle, props.hoverStyle)}
      activeStyle={mergeStyle(arrow().activeStyle, props.activeStyle)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      disabledStyle={mergeStyle(arrow().disabledStyle, props.disabledStyle)}
    >
      {props.children ?? <ArrowGlyph mark="›" />}
    </BaseNext>
  );
}

/** Dots for the slides, and a pill that springs onto the one shown. */
export function CarouselPagination(props: CarouselPaginationProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "indicatorClass",
    "indicatorStyle",
    "accessibilityLabel",
  ]);
  const chrome = computed(() => carouselVariants());
  return (
    <BasePagination
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Choose a slide"}
      class={props.class}
      style={mergeStyle(chrome().pagination, props.style)}
      indicatorClass={props.indicatorClass}
      indicatorStyle={mergeStyle(chrome().indicator, props.indicatorStyle)}
    />
  );
}

/** One dot. Selected, it hides under the pagination pill (`group-selected:`). */
export function CarouselPaginationItem(props: CarouselPaginationItemProps) {
  const [, rest] = split(props, ["class", "style", "focusStyle", "children", "accessibilityLabel"]);
  const chrome = computed(() => carouselVariants());
  return (
    <BasePaginationItem
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? `Slide ${props.index + 1}`}
      class={mergeClass("group", props.class)}
      style={mergeStyle(chrome().dotItem, props.style)}
      focusStyle={mergeStyle(chrome().dotFocus, props.focusStyle)}
    >
      {props.children ?? <View class={chrome().dotClass} style={chrome().dot} />}
    </BasePaginationItem>
  );
}
