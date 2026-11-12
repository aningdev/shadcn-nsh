// A hover card: `nsh/base`'s HoverCard with `popoverLook` on a `PopIn`.
// The surface look lives in `popover.tsx` (from look/overlay.ts); this file is the shell only.
import type { JSX } from "nsh";
import { split } from "nsh";
import { HoverCard as BaseHoverCard, type HoverCardProps as BaseHoverCardProps } from "nsh/base";

import { PopIn } from "./lib/popup";
import { popoverLook } from "./popover";

/**
 * `nsh/base`'s HoverCard with `popoverLook` on a `PopIn`. Every base prop passes through.
 * Pass the host as `trigger`; children are the card's content.
 */
export type HoverCardProps = Omit<BaseHoverCardProps, "children"> & {
  /** A line or two: 12 points of padding and 4 between rows. */
  compact?: boolean;
  /** The card's width; unset, as wide as its content. */
  width?: number;
  children?: JSX.Element;
};

/** A hover card: the trigger opens a panel that grows from its side. */
export function HoverCard(props: HoverCardProps) {
  const [, rest] = split(props, ["children", "compact", "width", "placement"]);
  const placement = props.placement ?? "bottom";
  return (
    <BaseHoverCard {...rest} placement={placement}>
      <PopIn side={placement} style={popoverLook({ compact: props.compact, width: props.width })}>
        {props.children}
      </PopIn>
    </BaseHoverCard>
  );
}
