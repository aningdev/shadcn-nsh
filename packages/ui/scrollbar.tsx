// Scrollbar: `scrollbarTheme` and the `Scrollbar` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, dimmed } from "@shadcn-nsh/theme";
import { platform, split, type ViewStyle } from "nsh";
import {
  Scrollbar as BaseScrollbar,
  type ScrollbarProps as BaseScrollbarProps,
  type ScrollbarTheme,
} from "nsh/base";

import { joinClass } from "./lib/utils";

// @port scrollbar-theme.ts
/** Whether the screen is a finger's, which takes a thinner bar and its smaller inset. */
const touch = !platform.desktop;

/** The thumb's fill: the muted foreground at the opacity a passive indicator rests at
 * (`state.rest-opacity`), so it sits quiet over the rows. */
const thumbFill = (): ViewStyle => ({
  backgroundColor: alpha(colors.mutedForeground, dimmed.rest),
});

/**
 * The scroll bars every scroll view and list wears, in place of the
 * platform's indicator: gpui-component's design.
 * They show while the content scrolls and while the pointer is over them
 * (pointing at a hidden thumb slides it in from the edge), fade in over
 * 300 ms and out over 500 ms, 2 s after the last scroll, drag or hover.
 * The track is 16 points thick over the view's edge (the widest thumb and
 * an inset of 4 on each side, 2 on a touch screen); the thumb is 6 points
 * at rest (3, the system's indicator, on a touch screen), 8 under the
 * pointer or while dragged, its width easing over 300 ms. Its fill is the
 * muted foreground at `state.rest-opacity`.
 */
export const scrollbarTheme: ScrollbarTheme = {
  mode: "hover",
  motion: {
    idle: 2000,
    enter: 300,
    exit: 500,
    entrance: "fade",
    thumbHoverEntrance: "slideAndFade",
  },
  // The thumb's fill is a style, not a class: its opacity is the theme's `state.rest-opacity`, and
  // a class string cannot carry a theme number. Read on each render, so a theme with another rest
  // opacity repaints, and the fill stays a theme role, so a switch of appearance recolours it.
  get vertical() {
    return {
      class: `absolute inset-y-0 right-0 w-4 items-end ${touch ? "p-0.5" : "p-1"}`,
      thumbClass: `${touch ? "w-[3px]" : "w-1.5"} rounded-full transition-all duration-300 hover:w-2 active:w-2 motion-reduce:transition-none`,
      thumbStyle: thumbFill(),
    };
  },
  get horizontal() {
    return {
      class: `absolute inset-x-0 bottom-0 h-4 items-end ${touch ? "p-0.5" : "p-1"}`,
      thumbClass: `${touch ? "h-[3px]" : "h-1.5"} rounded-full transition-all duration-300 hover:h-2 active:h-2 motion-reduce:transition-none`,
      thumbStyle: thumbFill(),
    };
  },
};
// @port end

/** Theme layer on `nsh/base` Scrollbar. Every base prop passes through. */
export type ScrollbarProps = BaseScrollbarProps;

/** The bar itself: `Scrollbar` adds the static `setTheme` to it. */
function Bar(props: ScrollbarProps) {
  const axis = props.axis ?? "vertical";
  const part = (axis === "horizontal" ? scrollbarTheme.horizontal : scrollbarTheme.vertical) ?? {};
  const [, rest] = split(props, ["class", "thumbClass", "thumbStyle", "mode", "motion", "axis"]);
  return (
    <BaseScrollbar
      {...rest}
      axis={axis}
      mode={props.mode ?? scrollbarTheme.mode}
      motion={props.motion ?? scrollbarTheme.motion}
      class={joinClass(part.class ?? "", props.class)}
      thumbClass={joinClass(part.thumbClass ?? "", props.thumbClass)}
      thumbStyle={props.thumbStyle ?? part.thumbStyle ?? undefined}
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
  BaseScrollbar.setTheme(theme === undefined ? scrollbarTheme : theme);
};

/** The colors of a scrollbar's parts (`theme`), from `nsh/base`. */
export type { ScrollbarTheme };
