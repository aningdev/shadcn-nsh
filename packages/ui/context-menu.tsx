// Source: examples/nsh-gallery-ui/look/menu.tsx @ 64ab8a1d (baseline), see NOTICE.
import { popupBackdrop } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, split, View } from "nsh";
import {
  ContextMenu as BaseContextMenu,
  type ContextMenuProps as BaseContextMenuProps,
  type OpenChangeReason,
} from "nsh/base";

import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";
import { menuPopupChrome } from "./menu";

export {
  MenuCheckboxItem as ContextMenuCheckboxItem,
  MenuGroup as ContextMenuGroup,
  MenuItem as ContextMenuItem,
  MenuLabel as ContextMenuLabel,
  MenuRadioItem as ContextMenuRadioItem,
  MenuSeparator as ContextMenuSeparator,
  MenuShortcut as ContextMenuShortcut,
  MenuSub as ContextMenuSub,
  MenuSubContent as ContextMenuSubContent,
  MenuSubTrigger as ContextMenuSubTrigger,
  type MenuCheckboxItemProps as ContextMenuCheckboxItemProps,
  type MenuGroupProps as ContextMenuGroupProps,
  type MenuItemProps as ContextMenuItemProps,
  type MenuLabelProps as ContextMenuLabelProps,
  type MenuRadioItemProps as ContextMenuRadioItemProps,
  type MenuSeparatorProps as ContextMenuSeparatorProps,
  type MenuShortcutProps as ContextMenuShortcutProps,
  type MenuSubContentProps as ContextMenuSubContentProps,
  type MenuSubProps as ContextMenuSubProps,
  type MenuSubTriggerProps as ContextMenuSubTriggerProps,
} from "./menu";

/** Composition root for `nsh/base` ContextMenu: open state + trigger slot. */
export type ContextMenuProps = {
  open?: boolean | null;
  /** Open at first, while `open` is not set. */
  defaultOpen?: boolean;
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
  trigger: Slot;
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

/** Composition root: a menu opened at the pointer. */
export function ContextMenu(props: ContextMenuProps) {
  // `props` itself is the options bag: `open` / `onOpenChange` are read when used.
  const state = createOpenState<OpenChangeReason>(props);
  const triggerSlot = createSlot();

  return (
    <ContextMenuContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
        get disabled() {
          return props.disabled;
        },
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
    </ContextMenuContext.Provider>
  );
}

/** The area that opens the menu. */
export function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  const ctx = useContextMenu();

  ctx.trigger.set(() => {
    if (props.class != null || props.style != null) {
      return (
        <View class={props.class ?? undefined} style={props.style}>
          {props.children ?? <View />}
        </View>
      );
    }
    return props.children ?? <View />;
  });
  return <View style={{ width: 0, height: 0 }} />;
}

/** The popup surface, reusing the menu's parts. */
export function ContextMenuContent(props: ContextMenuContentProps) {
  const ctx = useContextMenu();
  const triggerAccessor = ctx.trigger.get();
  // Only what this part defaults or owns is split off; the rest (class, style, hover…) passes through.
  const [, rest] = split(props, [
    "children",
    "popupStyle",
    "backdropStyle",
    "popupStartingStyle",
    "popupEndingStyle",
    "offset",
  ]);

  // menu.md: the menu surface at the pointer; 100 ms, from 4 points above. Either hook
  // of a phase set by the consumer owns that phase (`null` turns it off).
  const motion = {
    style: {
      transitionProperty: "opacity, transform",
      transitionDuration: 100,
      transitionTimingFunction: "ease-out",
    },
    startingStyle: { opacity: 0, transform: [{ translateY: -4 }] },
    endingStyle: { opacity: 0 },
  } satisfies Record<"style" | "startingStyle" | "endingStyle", ViewStyle>;
  const defaultStarting = () =>
    props.popupStartingClass === undefined && props.popupStartingStyle === undefined;
  const defaultEnding = () =>
    props.popupEndingClass === undefined && props.popupEndingStyle === undefined;

  return (
    <BaseContextMenu
      {...rest}
      open={ctx.open()}
      disabled={ctx.disabled}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      offset={props.offset ?? 4}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      popupStyle={mergeStyle({ ...menuPopupChrome(), ...motion.style }, props.popupStyle)}
      backdropStyle={mergeStyle(popupBackdrop(), props.backdropStyle)}
      popupStartingStyle={defaultStarting() ? motion.startingStyle : props.popupStartingStyle}
      popupEndingStyle={defaultEnding() ? motion.endingStyle : props.popupEndingStyle}
    >
      {props.children}
    </BaseContextMenu>
  );
}
