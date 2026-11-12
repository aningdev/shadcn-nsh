// Scrollbar: `scrollbarTheme` and the `Scrollbar` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { platform, split } from "nsh";
import {
  Scrollbar as BaseScrollbar,
  type ScrollbarProps as BaseScrollbarProps,
  type ScrollbarTheme,
} from "nsh/base";

// @port scrollbar-theme.ts
const touch = !platform.desktop;

/**
 * The gallery's scroll bars, gpui-component's, which `Scrollbar.setTheme`
 * gives every scroll view and list in place of the platform's indicator.
 * They show while the content scrolls and while the pointer is over them
 * (pointing at a hidden thumb slides it in from the edge), fade in over
 * 300 ms and out over 500 ms, 2 s after the last scroll, drag or hover.
 * The track is 16 points thick over the view's edge (the widest thumb and
 * an inset of 4 on each side, 2 on a touch screen); the thumb is 6 points
 * at rest (3, the system's indicator, on a touch screen), 8 and darker
 * under the pointer or while dragged, its width easing over 300 ms. Its
 * colors are opaque, the muted foreground mixed into the background (as
 * gpui-component's themes do), so rows never show through it.
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
  vertical: {
    class: `absolute inset-y-0 right-0 w-4 items-end ${touch ? "p-0.5" : "p-1"}`,
    thumbClass: `${touch ? "w-[3px]" : "w-1.5"} rounded-full bg-scrollbar-thumb transition-all duration-300 hover:w-2 hover:bg-scrollbar-thumb-hover active:w-2 active:bg-scrollbar-thumb-hover motion-reduce:transition-none`,
  },
  horizontal: {
    class: `absolute inset-x-0 bottom-0 h-4 items-end ${touch ? "p-0.5" : "p-1"}`,
    thumbClass: `${touch ? "h-[3px]" : "h-1.5"} rounded-full bg-scrollbar-thumb transition-all duration-300 hover:h-2 hover:bg-scrollbar-thumb-hover active:h-2 active:bg-scrollbar-thumb-hover motion-reduce:transition-none`,
  },
};
// @port end

function mergeClass(base: string, extra?: string | null): string {
  return extra ? `${base} ${extra}` : base;
}

/** Theme layer on `nsh/base` Scrollbar. Every base prop passes through. */
export type ScrollbarProps = BaseScrollbarProps;

function Bar(props: ScrollbarProps) {
  const axis = props.axis ?? "vertical";
  const part = axis === "horizontal" ? scrollbarTheme.horizontal! : scrollbarTheme.vertical!;
  const [, rest] = split(props, ["class", "thumbClass", "mode", "motion", "axis"]);
  return (
    <BaseScrollbar
      {...rest}
      axis={axis}
      mode={props.mode ?? scrollbarTheme.mode}
      motion={props.motion ?? scrollbarTheme.motion}
      class={mergeClass(part.class ?? "", props.class)}
      thumbClass={mergeClass(part.thumbClass ?? "", props.thumbClass)}
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
