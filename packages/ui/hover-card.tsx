// Source: examples/nsh-gallery-ui/look/overlay.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { computed, context, split, Text, View } from "nsh";
import {
  HoverCard as BaseHoverCard,
  type HoverCardProps as BaseHoverCardProps,
  type OpenChangeReason,
} from "nsh/base";

import { Button } from "./button";
import { isPointer } from "./lib/density";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";

/** Composition root for `nsh/base` HoverCard: open state + trigger slot. */
export type HoverCardProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Theme layer on `nsh/base` HoverCard as `HoverCardContent`. Open / trigger /
 * lifecycle events are owned by the {@link HoverCard} context. Defaults: placement
 * bottom, align center, offset 4 (base leaves the gap at 0). Delays stay on base
 * (600 ms open, 300 ms close).
 */
export type HoverCardContentProps = Omit<
  BaseHoverCardProps,
  "trigger" | "open" | "defaultOpen" | "onOpenChange" | "onOpen" | "onClose" | "children"
> & {
  children?: JSX.Element;
  /** A line or two: 12 points of padding and 4 between rows, instead of 14 / 16 and 12. */
  compact?: boolean;
};

/** What the card previews. String children render as a Button; otherwise a focusable View. */
export type HoverCardTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App chrome around title / description (not an `nsh/base` part). */
export type HoverCardHeaderProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App title text (not an `nsh/base` part). */
export type HoverCardTitleProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** App description text (not an `nsh/base` part). */
export type HoverCardDescriptionProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

type HoverCardContextValue = OpenState & {
  trigger: Slot;
  /** The trigger is disabled: the card stays closed. Reads the trigger's latest value. */
  disabled: () => boolean;
  setDisabled: (read: () => boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

const HoverCardContext = context<HoverCardContextValue | null>(null);

function useHoverCard() {
  const ctx = HoverCardContext();
  if (!ctx) throw new Error("HoverCard parts must be used within <HoverCard>");
  return ctx;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<T extends ViewStyle | TextStyle>(
  base?: StyleProp<T> | null,
  consumer?: StyleProp<T> | null,
): StyleProp<T> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * The same popup surface a popover uses: 14 points of padding with a pointer
 * and 16 on a touch screen, rows 12 apart. Compact is 12 and 4. `minWidth`
 * keeps a short note from hugging its text.
 */
function look(compact: boolean) {
  const room = compact
    ? { padding: 12, gap: 4, minWidth: 160 }
    : { padding: isPointer() ? 14 : 16, gap: 12, minWidth: 200 };
  return {
    surface: { ...popupSurface(), ...room } satisfies ViewStyle,
    header: { gap: 4 } satisfies ViewStyle,
    title: { fontSize: 14, fontWeight: "600", color: colors.foreground } satisfies TextStyle,
    description: { fontSize: 13, color: colors.mutedForeground } satisfies TextStyle,
  };
}

/** The hover-card surface, the same style {@link HoverCardContent} puts on the popup. */
export function hoverCardSurface(compact?: boolean): ViewStyle {
  return look(Boolean(compact)).surface;
}

/** Composition root: owns the open state the parts below read. */
export function HoverCard(props: HoverCardProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const triggerSlot = createSlot();
  const triggerDisabled = { read: () => false };
  return (
    <HoverCardContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
        disabled: () => triggerDisabled.read(),
        setDisabled: (read) => {
          triggerDisabled.read = read;
        },
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

/** The preview target; a string child renders a `Button`. */
export function HoverCardTrigger(props: HoverCardTriggerProps) {
  const ctx = useHoverCard();
  // `computed` so a `disabled` that changes after mount still keeps the card shut.
  const disabled = computed(() => Boolean(props.disabled));
  ctx.setDisabled(disabled);
  ctx.trigger.set(() => {
    const children = props.children;
    if (typeof children === "string") {
      return (
        <Button disabled={props.disabled} class={props.class ?? undefined} style={props.style}>
          {children}
        </Button>
      );
    }
    return (
      <View
        accessible
        role="button"
        accessibilityState={{ disabled: props.disabled }}
        class={props.class ?? undefined}
        focusStyle={focusRing()}
        style={
          props.disabled ? mergeStyle({ opacity: disabledOpacity() }, props.style) : props.style
        }
      >
        {children}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

/** The popup surface, with the same entrance as a popover (150 ms, from 95%). */
export function HoverCardContent(props: HoverCardContentProps) {
  const ctx = useHoverCard();
  const triggerAccessor = ctx.trigger.get();
  const [, rest] = split(props, [
    "children",
    "popupStyle",
    "popupStartingStyle",
    "popupEndingStyle",
    "placement",
    "align",
    "offset",
    "compact",
  ]);
  const chrome = look(Boolean(props.compact));
  // hover-card.md: 150 ms, from 95% of its size, as a popover. Either hook of a
  // phase set by the consumer owns that phase (`null` turns it off).
  const motion = {
    style: {
      transitionProperty: "opacity, transform",
      transitionDuration: 150,
      transitionTimingFunction: "ease-out",
    },
    startingStyle: { opacity: 0, transform: [{ scale: 0.95 }] },
    endingStyle: { opacity: 0, transform: [{ scale: 0.95 }] },
  } satisfies Record<"style" | "startingStyle" | "endingStyle", ViewStyle>;
  const defaultStarting = () =>
    props.popupStartingClass === undefined && props.popupStartingStyle === undefined;
  const defaultEnding = () =>
    props.popupEndingClass === undefined && props.popupEndingStyle === undefined;

  return (
    <BaseHoverCard
      {...rest}
      open={ctx.disabled() ? false : ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      placement={props.placement ?? "bottom"}
      align={props.align ?? "center"}
      offset={props.offset ?? 4}
      onOpenChange={({ open, reason }) => {
        if (ctx.disabled()) return;
        ctx.setOpen(open, reason);
      }}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      popupStyle={mergeStyle({ ...chrome.surface, ...motion.style }, props.popupStyle)}
      popupStartingStyle={defaultStarting() ? motion.startingStyle : props.popupStartingStyle}
      popupEndingStyle={defaultEnding() ? motion.endingStyle : props.popupEndingStyle}
    >
      {props.children}
    </BaseHoverCard>
  );
}

/** The header block of the card. */
export function HoverCardHeader(props: HoverCardHeaderProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look(false).header, props.style)}>
      {props.children}
    </View>
  );
}

/** The card's title; a string child gets themed text. */
export function HoverCardTitle(props: HoverCardTitleProps) {
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View class={props.class ?? undefined} style={props.style as StyleProp<ViewStyle> | null}>
        {props.children}
      </View>
    );
  }
  return (
    <Text
      class={props.class ?? undefined}
      style={mergeStyle(look(false).title, props.style as StyleProp<TextStyle> | null)}
    >
      {props.children}
    </Text>
  );
}

/** The card's description; a string child gets themed text. */
export function HoverCardDescription(props: HoverCardDescriptionProps) {
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View class={props.class ?? undefined} style={props.style as StyleProp<ViewStyle> | null}>
        {props.children}
      </View>
    );
  }
  return (
    <Text
      class={props.class ?? undefined}
      style={mergeStyle(look(false).description, props.style as StyleProp<TextStyle> | null)}
    >
      {props.children}
    </Text>
  );
}
