// Source: examples/nsh-gallery-ui/look/overlay.ts @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, focusRing, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, split, Text, View } from "nsh";
import {
  Popover as BasePopover,
  type OpenChangeReason,
  type PopoverProps as BasePopoverProps,
} from "nsh/base";

import { Button } from "./button";
import { isPointer } from "./lib/density";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";

/** Composition root for `nsh/base` Popover: open state + trigger slot. */
export type PopoverProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` Popover as `PopoverContent`. Open / trigger /
 * lifecycle events are owned by the {@link Popover} context. Defaults: placement
 * bottom, align center, offset 4.
 */
export type PopoverContentProps = Omit<
  BasePopoverProps,
  | "trigger"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "onOpen"
  | "onClose"
  | "onCancel"
  | "children"
> & {
  children?: JSX.Element;
  /** A line or two: 12 points of padding and 4 between rows, instead of 14 / 16 and 12. */
  compact?: boolean;
};

/** Opens the popover. String children render as a Button; otherwise a pressable View. */
export type PopoverTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App chrome around title / description (not an `nsh/base` part). */
export type PopoverHeaderProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App title text (shadcn `PopoverTitle`; not an `nsh/base` part). */
export type PopoverTitleProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** App description text (shadcn `PopoverDescription`; not an `nsh/base` part). */
export type PopoverDescriptionProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

type PopoverContextValue = OpenState & {
  trigger: Slot;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

const PopoverContext = context<PopoverContextValue | null>(null);

function usePopover() {
  const ctx = PopoverContext();
  if (!ctx) throw new Error("Popover parts must be used within <Popover>");
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
 * The popup surface every menu shares, with the popover's own room: 14 points
 * of padding with a pointer and 16 on a touch screen, rows 12 apart. Compact
 * is 12 and 4. `minWidth` keeps a short note from hugging its text.
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

/** The popover surface, the same style {@link PopoverContent} puts on the popup. */
export function popoverSurface(compact?: boolean): ViewStyle {
  return look(Boolean(compact)).surface;
}

/** Composition root: owns the open state the parts below read. */
export function Popover(props: PopoverProps) {
  // `props` itself is the options bag: `open` / `onOpenChange` are read when used.
  const state = createOpenState<OpenChangeReason>(props);
  const triggerSlot = createSlot();

  return (
    <PopoverContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
        get onOpen() {
          return props.onOpen;
        },
        get onClose() {
          return props.onClose;
        },
        get onCancel() {
          return props.onCancel;
        },
      }}
    >
      {props.children}
    </PopoverContext.Provider>
  );
}

/** Opens the popover; a string child renders a `Button`. */
export function PopoverTrigger(props: PopoverTriggerProps) {
  const ctx = usePopover();

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
        style={mergeStyle({ opacity: disabledOpacity(props.disabled) }, props.style)}
      >
        {children}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

/** The popup surface, with its entrance motion as the default. */
export function PopoverContent(props: PopoverContentProps) {
  const ctx = usePopover();
  const triggerAccessor = ctx.trigger.get();
  // Only what this part defaults or owns is split off; the rest (class, style, hover…) passes through.
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

  // popover.md: 150 ms, from 95 % of its size. Either hook of a phase set by the
  // consumer owns that phase (`null` turns it off); the classes left in `rest` pass through.
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
    <BasePopover
      {...rest}
      open={ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      placement={props.placement ?? "bottom"}
      align={props.align ?? "center"}
      offset={props.offset ?? 4}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      popupStyle={mergeStyle({ ...chrome.surface, ...motion.style }, props.popupStyle)}
      popupStartingStyle={defaultStarting() ? motion.startingStyle : props.popupStartingStyle}
      popupEndingStyle={defaultEnding() ? motion.endingStyle : props.popupEndingStyle}
    >
      {props.children}
    </BasePopover>
  );
}

/** The header block of the popup content. */
export function PopoverHeader(props: PopoverHeaderProps) {
  return (
    <View class={props.class ?? undefined} style={mergeStyle(look(false).header, props.style)}>
      {props.children}
    </View>
  );
}

/** The popup's title; a string child gets themed text. */
export function PopoverTitle(props: PopoverTitleProps) {
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

/** The popup's description; a string child gets themed text. */
export function PopoverDescription(props: PopoverDescriptionProps) {
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
