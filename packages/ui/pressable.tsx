// A pressable: a region that owns its look and gets only the feedback of a press — the sink, the
// pointer's hover and the keyboard's ring. This library's own: nothing here comes from upstream,
// so there is no port region. Yours to change.
import { colors, focusRing, hovered, rounded, shape } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { split } from "nsh";
import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "nsh/base";

import { AsText } from "./lib/as-text";
import { pressSink, pressTransition } from "./lib/press";
import { type Live, read } from "./lib/utils";

/** Options of `pressableLook`. */
export interface PressableLookOptions {
  /** No hover and no press feedback. */
  disabled?: Live<boolean | undefined>;
  /** How far a press sinks it, over the look's 98% (a big picture at 80% reads as pressed). */
  scale?: Live<number | undefined>;
  /** More style (a padding, a background, a radius), over the look's. */
  style?: Live<ViewStyle | undefined>;
}

/** How far a press sinks a pressable: less than a button's, since the region is bigger. */
const SINK = 0.98;

/**
 * A pressable's feedback, and nothing else: no fill, no padding, no height. At rest it is what
 * its content draws, on the page's surface; `shape.control` shapes the keyboard's ring to the
 * region's corners (a `style` with its own radius moves the ring with it). Under the pointer it
 * takes the lightest hover fill the theme has (a whisper of the text color); pressed it sinks to
 * `scale` (98% by default, none with reduced motion); with the keyboard on it, `focusRing()`.
 */
export function pressableLook(o?: PressableLookOptions) {
  return {
    get style(): ViewStyle {
      return {
        ...rounded(shape.control),
        ...pressTransition("background-color"),
        ...read(o?.style),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      return read(o?.disabled) ? undefined : hovered();
    },
    get activeStyle(): ViewStyle | undefined {
      return read(o?.disabled) ? undefined : pressSink(() => read(o?.scale) ?? SINK).activeStyle;
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
  };
}

/**
 * A pressable region in the feedback of `pressableLook`: a whole row, a picture, a paragraph —
 * `nsh/base`'s Button, which owns presses, the disabled state and the role, with nothing drawn
 * on it. Every base prop passes through (`role`, `selected`, `hitSlop`, `onPress`…); the style
 * props go over the look's. A string child is text in the theme's text color and, unless `accessibilityLabel` says
 * otherwise, the region's name for screen readers; children drawn as given derive no name, so an
 * icon alone needs one.
 */
export type PressableProps = Omit<BaseButtonProps, "children"> & {
  /** A string is the label; anything else is drawn as given. */
  children?: string | JSX.Element;
  /** How far a press sinks it: 98% by default, and none at 1. */
  scale?: number;
};

/** A region that takes presses and shows only that it did. */
export function Pressable(props: PressableProps) {
  const [, rest] = split(props, [
    "children",
    "scale",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
  ]);
  const look = pressableLook({ disabled: () => props.disabled, scale: () => props.scale });
  return (
    <BaseButton
      {...rest}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[look.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
    >
      {/* The page's ink, read where it is drawn: a bare Text is nsh's black. */}
      <AsText style={{ color: colors.foreground }}>{props.children}</AsText>
    </BaseButton>
  );
}
