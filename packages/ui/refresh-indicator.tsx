// A refresh indicator: the round chip a pull-to-refresh draws over the top of a scroll view. This
// library's own (drawn on `nsh`'s View, with the library's Icon and Spinner), so there is no port
// region. Yours to change.
import { colors, controlHeight, finish, iconSize, stroke } from "@shadcn-nsh/theme";
import { ArrowDown } from "lucide";
import type { AnimatedValue, ViewProps, ViewStyle } from "nsh";
import { split, View } from "nsh";

import { Icon } from "./lib/icons";
import { Spinner } from "./spinner";

/** How tall the indicator is unless told otherwise: where a pull refreshes, and the room it keeps. */
export const REFRESH_INDICATOR_HEIGHT = 72;

/** How far, in points, the pull must go before the chip is fully opaque. */
const FADE_IN = 24;

/** How far above its place the chip starts, and how small it is there. */
const FROM_ABOVE = -28;
const FROM_SCALE = 0.6;

/** A refresh indicator's parts as the styles they wear: spread each one. */
export interface RefreshIndicatorLook {
  /** The strip the chip is centered in: over the top of the scroll view, taking no presses. */
  root(height: number): ViewStyle;
  /** The round chip: a raised face with a hairline edge. It fades, grows and travels in with `pull`. */
  chip(pull: AnimatedValue, height: number): ViewStyle;
  /** The arrow's box: it turns over once the pull is past half of `height`, and is gone while refreshing. */
  arrow(pull: AnimatedValue, height: number, refreshing: boolean): ViewStyle;
  /** The ring's box, stacked over the arrow's. */
  ring(): ViewStyle;
  /** The arrow's side and the ring's, in points. */
  glyph(): number;
  /** The ink of the arrow and the ring. */
  tint(): string;
}

/**
 * A refresh indicator's look: a 40-point chip on the raised finish, its opacity, travel and scale
 * driven by `pull` (all of it on the UI thread), the arrow and the ring in the brand's color.
 */
export function refreshIndicatorLook(): RefreshIndicatorLook {
  const chip = Math.max(controlHeight.md, 40);
  return {
    root: (height) => ({
      pointerEvents: "none",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height,
      alignItems: "center",
      justifyContent: "center",
    }),
    chip: (pull, height) => ({
      width: chip,
      height: chip,
      borderRadius: chip / 2,
      borderWidth: stroke.surface,
      borderColor: colors.border,
      backgroundColor: colors.raised,
      ...finish.raised,
      alignItems: "center",
      justifyContent: "center",
      opacity: pull.interpolate({ inputRange: [0, FADE_IN], outputRange: [0, 1] }),
      transform: [
        { translateY: pull.interpolate({ inputRange: [0, height], outputRange: [FROM_ABOVE, 0] }) },
        { scale: pull.interpolate({ inputRange: [0, height], outputRange: [FROM_SCALE, 1] }) },
      ],
    }),
    arrow: (pull, height, refreshing) => ({
      position: "absolute",
      opacity: refreshing ? 0 : 1,
      transform: [
        {
          rotate: pull.interpolate({
            inputRange: [height / 2, height],
            outputRange: ["0deg", "180deg"],
          }),
        },
      ],
    }),
    ring: () => ({ position: "absolute" }),
    glyph: () => iconSize.lg,
    tint: () => colors.brand,
  };
}

/** A refresh indicator's props. */
export type RefreshIndicatorProps = Omit<ViewProps, "children"> & {
  /** The `AnimatedValue` the scroll view feeds through `pullValue`: how far it is pulled past its top. */
  pull: AnimatedValue;
  /** The refresh is running: the arrow gives way to a ring that spins (it stands still with reduced motion). */
  refreshing: boolean;
  /**
   * The same height the scroll view is given in `refreshIndicator={{ height }}`: the pull at which
   * the chip is home and the arrow has turned. Read once, when the indicator is made. 72 by default.
   */
  height?: number;
};

/**
 * The chip a pull-to-refresh draws: it travels in with the pull, grows and fades in, turns its arrow
 * over once the pull is past half of `height`, and shows a spinning ring while `refreshing`. It owns
 * the look and the motion only: the scroll view keeps `onRefresh`, `refreshing`, `pullValue` and
 * `refreshIndicator`. Put it over the scroll view, in a parent both fill; it takes no presses.
 */
export function RefreshIndicator(props: RefreshIndicatorProps) {
  const [mine, rest] = split(props, ["pull", "refreshing", "height", "style"]);
  const look = refreshIndicatorLook();
  const height = mine.height ?? REFRESH_INDICATOR_HEIGHT;
  const pull = mine.pull;
  return (
    <View {...rest} style={[look.root(height), mine.style ?? null]}>
      <View style={look.chip(pull, height)}>
        <View style={look.arrow(pull, height, mine.refreshing)}>
          <Icon icon={ArrowDown} size={look.glyph()} tint={look.tint()} />
        </View>
        <If when={mine.refreshing}>
          <View style={look.ring()}>
            <Spinner size={look.glyph()} tint={look.tint()} />
          </View>
        </If>
      </View>
    </View>
  );
}
