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
import { popupBackdrop, popupSurface } from "./lib/popup-surface";

export {
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuShortcut as ContextMenuShortcut,
  DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubContent as ContextMenuSubContent,
  DropdownMenuSubTrigger as ContextMenuSubTrigger,
  type DropdownMenuCheckboxItemProps as ContextMenuCheckboxItemProps,
  type DropdownMenuGroupProps as ContextMenuGroupProps,
  type DropdownMenuItemProps as ContextMenuItemProps,
  type DropdownMenuLabelProps as ContextMenuLabelProps,
  type DropdownMenuSeparatorProps as ContextMenuSeparatorProps,
  type DropdownMenuShortcutProps as ContextMenuShortcutProps,
  type DropdownMenuSubContentProps as ContextMenuSubContentProps,
  type DropdownMenuSubProps as ContextMenuSubProps,
  type DropdownMenuSubTriggerProps as ContextMenuSubTriggerProps,
} from "./dropdown-menu";

/**
 * Composition root (shadcn `ContextMenu`): holds open state for Trigger /
 * Content. Prefer composition; legacy `trigger` still mounts a single
 * `nsh/base` ContextMenu with full base prop + style-hook pass-through.
 */
export type ContextMenuProps = Omit<BaseContextMenuProps, "children"> & {
  children?: JSX.Element;
};

/**
 * Theme layer on `nsh/base` ContextMenu as shadcn `ContextMenuContent`. All
 * base props + style hooks pass through; consumer styles shallow-merge over
 * defaults. Open / trigger / lifecycle events are owned by the
 * {@link ContextMenu} context (or the legacy single-root). Default `offset`
 * is `4` (gap from the pointer / long-press target).
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

function bridgeOpenChange(
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void,
): ((event: { open: boolean; reason: string }) => void) | undefined {
  if (!onOpenChange) return undefined;
  return (event) => onOpenChange(event.open, event.reason as OpenChangeReason);
}

/** Popup / sheet chrome — aligned with menu surface padding. */
function contentPopupChrome(): ViewStyle {
  return {
    ...popupSurface(),
    minWidth: 160,
  };
}

function renderBaseContextMenu(props: BaseContextMenuProps) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    popupClass,
    popupStyle,
    backdropClass,
    backdropStyle,
    offset = 4,
    ...rest
  } = props;

  return (
    <BaseContextMenu
      {...rest}
      offset={offset}
      class={mergeClass(undefined, className)}
      style={mergeStyle(undefined, style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
      popupClass={mergeClass(undefined, popupClass)}
      popupStyle={mergeStyle(contentPopupChrome(), popupStyle)}
      backdropClass={mergeClass(undefined, backdropClass)}
      backdropStyle={mergeStyle(popupBackdrop(), backdropStyle)}
    />
  );
}

export function ContextMenu(props: ContextMenuProps) {
  const { open, disabled, trigger, children, onOpenChange, onOpen, onClose, onCancel, ...rest } =
    props;

  // Legacy: single-root with trigger prop and item children.
  if (trigger != null) {
    return renderBaseContextMenu({
      ...rest,
      open,
      disabled,
      trigger,
      children,
      onOpen,
      onClose,
      onCancel,
      onOpenChange,
    });
  }

  const state = createOpenState({
    open,
    onOpenChange: bridgeOpenChange(onOpenChange),
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
    backdropClass,
    backdropStyle,
    offset = 4,
    ...rest
  } = props;

  return (
    <BaseContextMenu
      {...rest}
      open={ctx.open()}
      disabled={ctx.disabled}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      offset={offset}
      onOpenChange={(open, reason) => ctx.setOpen(open, reason)}
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
      popupStyle={mergeStyle(contentPopupChrome(), popupStyle)}
      backdropClass={mergeClass(undefined, backdropClass)}
      backdropStyle={mergeStyle(popupBackdrop(), backdropStyle)}
    >
      {children}
    </BaseContextMenu>
  );
}
