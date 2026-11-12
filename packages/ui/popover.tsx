// A popover: the look (`popoverLook`) and the `Popover` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import type { JSX, ViewStyle } from "nsh";
import { platform, split } from "nsh";
import { Popover as BasePopover, type PopoverProps as BasePopoverProps } from "nsh/base";

import { PopIn, popupSurface } from "./lib/popup";

// @port look/overlay.ts
const pointer = platform.desktop;

/** Options of `popoverLook`. */
export interface PopoverLookOptions {
  /** Its width; unset, as wide as its content. */
  width?: number;
  /** A small note (a line or two): 12 points of padding, its rows 4 apart. */
  compact?: boolean;
}

/**
 * A popover's or a hover card's surface (the `style` of the `PopIn` it
 * comes in with): the popup surface every menu shares (`popupSurface`:
 * `finish.menu`'s fill, edge and soft shadow, 10-point corners), 14 points
 * of padding with a pointer and 16 on a touch screen, its rows 12 apart.
 */
export function popoverLook(o?: PopoverLookOptions): ViewStyle {
  const room: ViewStyle = o?.compact
    ? { padding: 12, gap: 4 }
    : { padding: pointer ? 14 : 16, gap: 12 };
  return { ...popupSurface(), ...room, width: o?.width };
}
// @port end

/**
 * `nsh/base`'s Popover with `popoverLook` on a `PopIn`. Every base prop passes through.
 * Pass the host as `trigger`; children are the panel's content.
 */
export type PopoverProps = Omit<BasePopoverProps, "children"> & {
  /** A line or two: 12 points of padding and 4 between rows. */
  compact?: boolean;
  /** The panel's width; unset, as wide as its content. */
  width?: number;
  children?: JSX.Element;
};

/** A popover: the trigger opens a panel that grows from its side. */
export function Popover(props: PopoverProps) {
  const [, rest] = split(props, ["children", "compact", "width", "placement"]);
  const placement = props.placement ?? "bottom";
  return (
    <BasePopover {...rest} placement={placement}>
      <PopIn side={placement} style={popoverLook({ compact: props.compact, width: props.width })}>
        {props.children}
      </PopIn>
    </BasePopover>
  );
}
