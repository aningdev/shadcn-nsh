import { overlayMotion, popupBackdrop, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, View } from "nsh";
import {
  ContextMenu as BaseContextMenu,
  type ContextMenuProps as BaseContextMenuProps,
  type OpenChangeReason,
} from "nsh/base";

import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";

export {
  MenuCheckboxItem as ContextMenuCheckboxItem,
  MenuGroup as ContextMenuGroup,
  MenuItem as ContextMenuItem,
  MenuLabel as ContextMenuLabel,
  MenuSeparator as ContextMenuSeparator,
  MenuShortcut as ContextMenuShortcut,
  MenuSub as ContextMenuSub,
  MenuSubContent as ContextMenuSubContent,
  MenuSubTrigger as ContextMenuSubTrigger,
  type MenuCheckboxItemProps as ContextMenuCheckboxItemProps,
  type MenuGroupProps as ContextMenuGroupProps,
  type MenuItemProps as ContextMenuItemProps,
  type MenuLabelProps as ContextMenuLabelProps,
  type MenuSeparatorProps as ContextMenuSeparatorProps,
  type MenuShortcutProps as ContextMenuShortcutProps,
  type MenuSubContentProps as ContextMenuSubContentProps,
  type MenuSubProps as ContextMenuSubProps,
  type MenuSubTriggerProps as ContextMenuSubTriggerProps,
} from "./menu";

/** Composition root for `nsh/base` ContextMenu: open state + trigger slot. */
export type ContextMenuProps = {
  open?: boolean | null;
  disabled?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` ContextMenu as `ContextMenuContent`. Open / trigger /
 * lifecycle events are owned by the {@link ContextMenu} context. Default offset 4.
 */
export type ContextMenuContentProps = Omit<
  BaseContextMenuProps,
  "trigger" | "open" | "disabled" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "children"
> & {
  children?: JSX.Element;
};

/** Surface that opens the menu on secondary click / long-press. */
export type ContextMenuTriggerProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

type ContextMenuContextValue = OpenState & {
  trigger: TriggerSlot;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

const ContextMenuContext = context<ContextMenuContextValue | null>(null);

function useContextMenu() {
  const ctx = ContextMenuContext();
  if (!ctx) throw new Error("ContextMenu parts must be used within <ContextMenu>");
  return ctx;
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/** Popup / sheet chrome — aligned with menu surface padding. */
function contentPopupChrome(): ViewStyle {
  return {
    ...popupSurface(),
    minWidth: 160,
  };
}

export function ContextMenu(props: ContextMenuProps) {
  const { open, disabled, children, onOpenChange, onOpen, onClose, onCancel } = props;

  const state = createOpenState<OpenChangeReason>({
    open,
    onOpenChange,
  });
  const triggerSlot = createTriggerSlot();

  return (
    <ContextMenuContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
        disabled,
        onOpen,
        onClose,
        onCancel,
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
}

export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  const ctx = useContextMenu();
  const { children, class: className, style } = props;

  ctx.trigger.set(() => {
    if (className != null || style != null) {
      return (
        <View class={mergeClass(undefined, className)} style={mergeStyle(undefined, style)}>
          {children ?? <View />}
        </View>
      );
    }
    return children ?? <View />;
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function ContextMenuContent(props: ContextMenuContentProps) {
  const ctx = useContextMenu();
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
    backdropClass,
    backdropStyle,
    offset = 4,
    ...rest
  } = props;

  // menu.md: the menu surface at the pointer; 100 ms, from 4 points above. Either hook
  // of a phase set by the consumer owns that phase (`null` turns it off).
  const motion = overlayMotion("menu");
  const defaultStartingStyle =
    props.popupStartingClass === undefined && popupStartingStyle === undefined;
  const defaultEndingStyle = props.popupEndingClass === undefined && popupEndingStyle === undefined;

  return (
    <BaseContextMenu
      {...rest}
      open={ctx.open()}
      disabled={ctx.disabled}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
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
      backdropClass={mergeClass(undefined, backdropClass)}
      backdropStyle={mergeStyle(popupBackdrop(), backdropStyle)}
      popupStartingStyle={defaultStartingStyle ? motion.startingStyle : popupStartingStyle}
      popupEndingStyle={defaultEndingStyle ? motion.endingStyle : popupEndingStyle}
    >
      {children}
    </BaseContextMenu>
  );
}
