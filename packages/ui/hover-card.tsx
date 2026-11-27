// A hover card: `nsh/base`'s `HoverCard` with `popoverLook` on a `PopIn`.
// The surface is `popover.tsx`'s (from NSH's look/overlay.ts); the parts here are this library's.

import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, split, View } from "nsh";
import {
  HoverCard as BaseHoverCard,
  type HoverCardProps as BaseHoverCardProps,
  type OpenChangeReason,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { PopIn } from "./lib/popup";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/state";
import { popoverLook } from "./popover";

/** Why a hover card closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type HoverCardOpenChangeReason = OpenChangeReason;

/** The root: it owns whether the card is open, the trigger slot, and whether the trigger is off. */
export type HoverCardProps = {
  /** Controlled; leave it out and the root keeps the state (`defaultOpen`). */
  open?: boolean | null;
  defaultOpen?: boolean;
  /**
   * Milliseconds the pointer rests on the trigger before the card opens (default 600).
   * `Infinity`: never by itself, only when the app opens it (or a press on a touch screen).
   */
  openDelay?: number;
  /**
   * Milliseconds the pointer is away from both the trigger and the card before it closes
   * (default 300): time to move from one to the other. `Infinity`: only Escape, a press outside
   * or the app closes it.
   */
  closeDelay?: number;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: HoverCardOpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * The card. Every prop of `nsh/base`'s HoverCard passes through but the ones the root owns (the
 * open state, the delays and the callbacks); `popoverLook` is the surface of the `PopIn` it comes
 * in with. Defaults: placement `bottom`.
 */
export type HoverCardContentProps = Omit<
  BaseHoverCardProps,
  | "trigger"
  | "open"
  | "defaultOpen"
  | "openDelay"
  | "closeDelay"
  | "onOpenChange"
  | "onOpen"
  | "onClose"
  | "children"
> & {
  /** A line or two: 12 points of padding and 4 between rows. */
  compact?: boolean;
  /** The card's width; unset, as wide as its content. */
  width?: number;
  children?: JSX.Element;
};

/**
 * What the card previews: a string is a `Button`'s label; any other single element is the
 * trigger itself (its press, focus, hover and open state land on it, no view in between).
 */
export type HoverCardTriggerProps = {
  children?: string | JSX.Element;
  /** The button's variant, for a string child (default `secondary`). */
  variant?: ButtonVariant;
  /**
   * Keeps the card closed. For a string child it also disables its button; an element carries
   * its own `disabled` for the look.
   */
  disabled?: boolean;
  /** The string child's button style. */
  style?: StyleProp<ViewStyle>;
};

/** The root of a hover card's parts. */
export function HoverCard(props: HoverCardProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const trigger = createSlot<JSX.Element>();
  // The trigger registers whether it is disabled; the card reads it when it would open.
  const disabledTrigger = { read: () => false };
  return (
    <HoverCardContext.Provider
      value={{
        ...state,
        trigger,
        disabled: () => disabledTrigger.read(),
        setDisabled: (read) => {
          disabledTrigger.read = read;
        },
        // Read when the card is placed: a delay the app changes follows without a new root.
        openDelay: () => props.openDelay,
        closeDelay: () => props.closeDelay,
        get onOpen() {
          return props.onOpen;
        },
        get onClose() {
          return props.onClose;
        },
      }}
    >
      {props.children}
    </HoverCardContext.Provider>
  );
}

/** The preview target: a `Button` for a string, the element itself for anything else. */
export function HoverCardTrigger(props: HoverCardTriggerProps) {
  const ctx = useHoverCard();
  ctx.setDisabled(() => Boolean(props.disabled));
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the card without building it again
  // on every layout. A single element is the trigger itself — `nsh/base` hands its press, focus
  // and open state to that element, and its own look, test id and name stay — so no view goes
  // between them. The kind is read once, here: a string child is read where it is drawn (the
  // `Button`'s own read, through the spread's getter, so a child that reads a signal stays live).
  const kids = props.children;
  ctx.trigger.set(
    typeof kids === "string" ? (
      <Button {...props} variant={props.variant ?? "secondary"} disabled={props.disabled} />
    ) : (
      (kids ?? <View />)
    ),
  );
  return null;
}

/** The card, over the popup surface of `popoverLook`. */
export function HoverCardContent(props: HoverCardContentProps) {
  const ctx = useHoverCard();
  const [, rest] = split(props, [
    "children",
    "compact",
    "width",
    "placement",
    "align",
    "offset",
    "margin",
  ]);
  const placement = () => props.placement ?? "bottom";
  return (
    <BaseHoverCard
      {...rest}
      open={ctx.disabled() ? false : ctx.open()}
      trigger={ctx.trigger.get() ?? <View />}
      placement={placement()}
      openDelay={ctx.openDelay()}
      closeDelay={ctx.closeDelay()}
      align={props.align}
      offset={props.offset}
      margin={props.margin}
      onOpenChange={({ open, reason }) => {
        if (ctx.disabled()) return;
        ctx.setOpen(open, reason);
      }}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
    >
      {() => (
        <PopIn
          side={placement()}
          style={popoverLook({ compact: props.compact, width: props.width })}
        >
          {/* children-lint: the card's contents, built when it opens, not before. */}
          {props.children}
        </PopIn>
      )}
    </BaseHoverCard>
  );
}

// Private helpers

type HoverCardContextValue = OpenState & {
  trigger: Slot<JSX.Element>;
  /** The trigger is disabled: the card stays closed. Reads the trigger's latest value. */
  disabled: () => boolean;
  setDisabled: (read: () => boolean) => void;
  /** How long the pointer rests before the card opens, and is away before it closes. */
  openDelay: () => number | undefined;
  closeDelay: () => number | undefined;
  onOpen?: () => void;
  onClose?: () => void;
};

const HoverCardContext = context<HoverCardContextValue | null>(null);

function useHoverCard() {
  const ctx = HoverCardContext();
  if (!ctx) throw new Error("HoverCard parts must be used within <HoverCard>");
  return ctx;
}
