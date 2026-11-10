import { colors, overlayMotion, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, Text, View } from "nsh";
import {
  Popover as BasePopover,
  type OpenChangeReason,
  type PopoverProps as BasePopoverProps,
} from "nsh/base";

import { Button } from "./button";
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

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
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

/** Popup surface chrome — aligned with shadcn `cn-popover-content` / w-72 padding. */
function contentPopupChrome(): ViewStyle {
  return {
    ...popupSurface(),
    padding: 16,
    minWidth: 288,
    gap: 4,
  };
}

function headerChrome(): ViewStyle {
  return { gap: 4, marginBottom: 4 };
}

function titleChrome(): TextStyle {
  return { fontSize: 14, fontWeight: "600", color: colors.foreground };
}

function descriptionChrome(): TextStyle {
  return { fontSize: 13, color: colors.mutedForeground };
}

export function Popover(props: PopoverProps) {
  const { open, defaultOpen, children, onOpenChange, onOpen, onClose, onCancel } = props;

  const state = createOpenState<OpenChangeReason>({
    open,
    defaultOpen,
    onOpenChange,
  });
  const triggerSlot = createSlot();

  return (
    <PopoverContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
        onOpen,
        onClose,
        onCancel,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  const ctx = usePopover();
  const { children, disabled, class: className, style } = props;

  ctx.trigger.set(() => {
    if (typeof children === "string") {
      return (
        <Button disabled={disabled} onPress={() => ctx.setOpen(true)}>
          {children}
        </Button>
      );
    }
    return (
      <View
        class={mergeClass(undefined, className)}
        onPress={disabled ? undefined : () => ctx.setOpen(true)}
        style={mergeStyle({ opacity: disabled ? 0.5 : 1 }, style)}
      >
        {children}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function PopoverContent(props: PopoverContentProps) {
  const ctx = usePopover();
  const triggerAccessor = ctx.trigger.get();
  const {
    children,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    popupClass,
    popupStyle,
    popupStartingStyle,
    popupEndingStyle,
    placement = "bottom",
    align = "center",
    offset = 4,
    ...rest
  } = props;

  // popover.md: 150 ms, from 95 % of its size. Either hook of a phase set by the
  // consumer owns that phase (`null` turns it off); the classes left in `...rest` pass through.
  const motion = overlayMotion("popover");
  const defaultStartingStyle =
    props.popupStartingClass === undefined && popupStartingStyle === undefined;
  const defaultEndingStyle = props.popupEndingClass === undefined && popupEndingStyle === undefined;

  return (
    <BasePopover
      {...rest}
      open={ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      placement={placement}
      align={align}
      offset={offset}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      class={mergeClass(undefined, className)}
      style={mergeStyle(undefined, style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
      popupClass={mergeClass(undefined, popupClass)}
      popupStyle={mergeStyle({ ...contentPopupChrome(), ...motion.style }, popupStyle)}
      popupStartingStyle={defaultStartingStyle ? motion.startingStyle : popupStartingStyle}
      popupEndingStyle={defaultEndingStyle ? motion.endingStyle : popupEndingStyle}
    >
      {children}
    </BasePopover>
  );
}

export function PopoverHeader(props: PopoverHeaderProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(headerChrome(), style)}>
      {children}
    </View>
  );
}

export function PopoverTitle(props: PopoverTitleProps) {
  const { children, class: className, style } = props;
  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle(undefined, style as StyleProp<ViewStyle> | null)}
      >
        {children}
      </View>
    );
  }
  return (
    <Text
      class={mergeClass(undefined, className)}
      style={mergeStyle(titleChrome(), style as StyleProp<TextStyle> | null)}
    >
      {children}
    </Text>
  );
}

export function PopoverDescription(props: PopoverDescriptionProps) {
  const { children, class: className, style } = props;
  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle(undefined, style as StyleProp<ViewStyle> | null)}
      >
        {children}
      </View>
    );
  }
  return (
    <Text
      class={mergeClass(undefined, className)}
      style={mergeStyle(descriptionChrome(), style as StyleProp<TextStyle> | null)}
    >
      {children}
    </Text>
  );
}
