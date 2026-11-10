// Source: examples/nsh-gallery-ui/scrollbar-theme.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { computed, split } from "nsh";
import {
  Scrollbar as BaseScrollbar,
  type Axis,
  type ScrollbarMode,
  type ScrollbarMotion,
  type ScrollbarProps as BaseScrollbarProps,
  type ScrollbarTheme,
} from "nsh/base";

import { isPointer } from "./lib/density";

/**
 * Theme layer on `nsh/base` Scrollbar. Every base prop passes through.
 * The thumb follows the named scroll view; this file only paints the bar.
 */
export type ScrollbarProps = BaseScrollbarProps;

/** Track, thumb, and the timing a placed bar and `Scrollbar.setTheme` share. */
export type ScrollbarChrome = {
  /** Track classes: the band on the viewport's edge. */
  className: string;
  /** Track thickness. A fixed overlay band, not a text box; see `look`. */
  style: ViewStyle;
  /** Thumb classes. Width stays here so `hover:` can widen it. */
  thumbClass: string;
  /** Thumb color from the theme. No width, so the class hover still applies. */
  thumbStyle: ViewStyle;
  /** When it shows. This look uses `hover` (base's own default is `scrolling`). */
  mode: ScrollbarMode;
  /**
   * Native fade. `enter` 300 and `exit` 500 are scrollbar.md's timings, not CSS
   * `duration-*` (an `always` bar, and reduced motion, never animate).
   */
  motion: ScrollbarMotion;
};

/** Wrapper default, then consumer. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

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

/**
 * The gallery bar without `scrollbar-thumb` (that token is not in this theme).
 * The thumb is `muted-foreground`; its rest thickness is a class so the pointer can widen it.
 * The 16-point track is a fixed overlay band (the press target), not a growing text box.
 */
function look(axis: Axis): ScrollbarChrome {
  const pointer = isPointer();
  // Rest thickness 6 (3 on a touch screen); 8 under the pointer or while dragged.
  const cross = axis === "horizontal" ? "h" : "w";
  const rest = pointer ? `${cross}-1.5` : `${cross}-[3px]`;
  const hover = cross === "h" ? "hover:h-2 active:h-2" : "hover:w-2 active:w-2";
  const thumbClass = `${rest} rounded-full opacity-60 transition-all duration-300 ${hover} hover:opacity-90 active:opacity-100 motion-reduce:transition-none`;
  const pad = pointer ? "p-1" : "p-0.5";
  const along =
    axis === "horizontal"
      ? `absolute inset-x-0 bottom-0 h-4 items-end ${pad}`
      : `absolute inset-y-0 right-0 w-4 items-end ${pad}`;
  return {
    className: along,
    style: axis === "horizontal" ? { minHeight: 16 } : { minWidth: 16 },
    thumbClass,
    thumbStyle: { backgroundColor: colors.mutedForeground, borderRadius: 999 },
    mode: "hover",
    motion: {
      idle: 2000,
      enter: 300,
      exit: 500,
      entrance: "fade",
      thumbHoverEntrance: "slideAndFade",
    },
  };
}

/** The bar's chrome for `axis` (default vertical). Call it where the theme is read. */
export function scrollbarVariants(options?: {
  /** Which edge. Default vertical. */
  axis?: Axis;
}): ScrollbarChrome {
  return look(options?.axis ?? "vertical");
}

/** The theme `Scrollbar.setTheme` takes, so every scroll view uses this look. */
export function scrollbarTheme(): ScrollbarTheme {
  const vertical = look("vertical");
  const horizontal = look("horizontal");
  return {
    mode: vertical.mode,
    motion: vertical.motion,
    vertical: {
      class: vertical.className,
      style: vertical.style,
      thumbClass: vertical.thumbClass,
      thumbStyle: vertical.thumbStyle,
    },
    horizontal: {
      class: horizontal.className,
      style: horizontal.style,
      thumbClass: horizontal.thumbClass,
      thumbStyle: horizontal.thumbStyle,
    },
  };
}

function Bar(props: ScrollbarProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "thumbClass",
    "thumbStyle",
    "mode",
    "motion",
    "axis",
  ]);
  const chrome = computed(() => look(props.axis ?? "vertical"));
  return (
    <BaseScrollbar
      {...rest}
      axis={props.axis}
      mode={props.mode ?? chrome().mode}
      motion={props.motion ?? chrome().motion}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      thumbClass={mergeClass(chrome().thumbClass, props.thumbClass)}
      thumbStyle={mergeStyle(chrome().thumbStyle, props.thumbStyle)}
    />
  );
}

/**
 * A scroll bar for the scroll view or list named by `scroll`.
 * `setTheme` paints the same bar on every view that still uses the platform indicator.
 */
export const Scrollbar = Bar as typeof Bar & {
  /**
   * Installs `theme` on every scroll view and list. No argument uses this package's look.
   * `null` gives the views the platform indicator back.
   */
  setTheme(theme?: ScrollbarTheme | null): void;
};

Scrollbar.setTheme = (theme?: ScrollbarTheme | null) => {
  BaseScrollbar.setTheme(theme === undefined ? scrollbarTheme() : theme);
};
