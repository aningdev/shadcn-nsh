import { colors, disabledOpacity, focusRing, popupBackdrop, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, split, Text, View } from "nsh";
import {
  Menu as BaseMenu,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  Submenu as BaseSubmenu,
  type MenuItemProps as BaseMenuItemProps,
  type MenuProps as BaseMenuProps,
  type MenuSeparatorProps as BaseMenuSeparatorProps,
  type OpenChangeReason,
  type SubmenuProps as BaseSubmenuProps,
} from "nsh/base";

import { Button } from "./button";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";

/** Composition root for `nsh/base` Menu: open state + trigger slot for Trigger / Content. */
export type MenuProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * Theme layer on `nsh/base` Menu as `MenuContent`. All base props + style hooks
 * pass through; consumer styles shallow-merge over defaults. Open / trigger /
 * lifecycle events are owned by the {@link Menu} context. Defaults: placement
 * bottom, align start, offset 4.
 */
export type MenuContentProps = Omit<
  BaseMenuProps,
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

/** Opens the menu. String children render as a Button; otherwise a pressable View. */
export type MenuTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Theme layer on `nsh/base` MenuItem — forwards `checked` / `indicator` to base. */
export type MenuItemProps = BaseMenuItemProps;

/** Checkbox-shaped item — sets `checked` on {@link MenuItem}. */
export type MenuCheckboxItemProps = Omit<MenuItemProps, "checked"> & {
  checked?: boolean | null;
};

/** App group wrapper (not an `nsh/base` part). */
export type MenuGroupProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App label text (not an `nsh/base` part). */
export type MenuLabelProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** Theme layer on `nsh/base` MenuSeparator. */
export type MenuSeparatorProps = BaseMenuSeparatorProps;

/** App trailing shortcut hint (not an `nsh/base` part). */
export type MenuShortcutProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** Composition root for a nested `nsh/base` Submenu: trigger slot only. */
export type MenuSubProps = {
  children?: JSX.Element;
  disabled?: boolean;
};

/** Item that opens a submenu. String children get a chevron row. */
export type MenuSubTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
};

/** Nested menu body — mounts `nsh/base` Submenu with the SubTrigger slot. */
export type MenuSubContentProps = Omit<BaseSubmenuProps, "trigger" | "children"> & {
  children?: JSX.Element;
};

type MenuContextValue = OpenState & {
  trigger: Slot;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

const MenuContext = context<MenuContextValue | null>(null);

function useMenu() {
  const ctx = MenuContext();
  if (!ctx) throw new Error("Menu parts must be used within <Menu>");
  return ctx;
}

type SubContextValue = { trigger: Slot; disabled?: boolean };
const SubContext = context<SubContextValue | null>(null);

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

/** Popup / sheet chrome — aligned with shadcn `cn-menu-content` padding. */
function contentPopupChrome(): ViewStyle {
  return {
    ...popupSurface(),
    minWidth: 160,
  };
}

function itemChrome(disabled?: boolean): ViewStyle {
  return {
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: disabledOpacity(disabled),
  };
}

function itemHoverChrome(disabled?: boolean): ViewStyle | undefined {
  return disabled ? undefined : { backgroundColor: colors.accent };
}

function labelChrome(): TextStyle {
  return {
    fontSize: 12,
    fontWeight: "500",
    color: colors.mutedForeground,
    paddingHorizontal: 8,
    paddingVertical: 6,
  };
}

function separatorChrome(): ViewStyle {
  return {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 4,
    backgroundColor: colors.border,
  };
}

function shortcutChrome(): TextStyle {
  return {
    marginLeft: "auto",
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.mutedForeground,
  };
}

function subTriggerChrome(disabled?: boolean): ViewStyle {
  return {
    ...itemChrome(disabled),
    justifyContent: "space-between",
  };
}

function submenuChrome(): ViewStyle {
  return { minWidth: 140 };
}

function defaultCheckIndicator(): JSX.Element {
  return <Text style={{ fontSize: 12, color: colors.primary }}>✓</Text>;
}

export function Menu(props: MenuProps) {
  // `props` itself is the options bag: `open` / `onOpenChange` are read when used.
  const state = createOpenState<OpenChangeReason>(props);
  const triggerSlot = createSlot();

  return (
    <MenuContext.Provider
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
    </MenuContext.Provider>
  );
}

export function MenuTrigger(props: MenuTriggerProps) {
  const ctx = useMenu();

  // Base toggles the menu on a press of the trigger; no onPress of our own.
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

export function MenuContent(props: MenuContentProps) {
  const ctx = useMenu();
  const triggerAccessor = ctx.trigger.get();
  // Only what this part defaults or owns is split off; the rest (class, style, hover…) passes through.
  const [, rest] = split(props, [
    "children",
    "popupStyle",
    "backdropStyle",
    "popupStartingStyle",
    "popupEndingStyle",
    "placement",
    "align",
    "offset",
  ]);

  // menu.md: 100 ms, from 4 points above. Either hook of a phase set by the consumer
  // owns that phase (`null` turns it off); the classes left in `rest` pass through.
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
    <BaseMenu
      {...rest}
      open={ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      placement={props.placement ?? "bottom"}
      align={props.align ?? "start"}
      offset={props.offset ?? 4}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      popupStyle={mergeStyle({ ...contentPopupChrome(), ...motion.style }, props.popupStyle)}
      backdropStyle={mergeStyle(popupBackdrop(), props.backdropStyle)}
      popupStartingStyle={defaultStarting() ? motion.startingStyle : props.popupStartingStyle}
      popupEndingStyle={defaultEnding() ? motion.endingStyle : props.popupEndingStyle}
    >
      {props.children}
    </BaseMenu>
  );
}

export function MenuItem(props: MenuItemProps) {
  // Defaulted: indicator, style, hoverStyle, focusStyle. Everything else passes through.
  const [, rest] = split(props, ["children", "indicator", "style", "hoverStyle", "focusStyle"]);

  return (
    <BaseMenuItem
      {...rest}
      indicator={props.indicator ?? (props.checked != null ? defaultCheckIndicator() : undefined)}
      style={mergeStyle(itemChrome(props.disabled), props.style)}
      hoverStyle={mergeStyle(itemHoverChrome(props.disabled), props.hoverStyle)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
    >
      {props.children}
    </BaseMenuItem>
  );
}

export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const [, rest] = split(props, ["checked"]);
  return <MenuItem {...rest} checked={props.checked ?? false} />;
}

export function MenuGroup(props: MenuGroupProps) {
  return (
    <View class={props.class ?? undefined} style={props.style}>
      {props.children}
    </View>
  );
}

export function MenuLabel(props: MenuLabelProps) {
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
      style={mergeStyle(labelChrome(), props.style as StyleProp<TextStyle> | null)}
    >
      {props.children}
    </Text>
  );
}

export function MenuSeparator(props: MenuSeparatorProps = {}) {
  const [, rest] = split(props, ["style"]);
  return <BaseMenuSeparator {...rest} style={mergeStyle(separatorChrome(), props.style)} />;
}

export function MenuShortcut(props: MenuShortcutProps) {
  if (typeof props.children !== "string" && props.children != null) {
    return (
      <View
        class={props.class ?? undefined}
        style={mergeStyle({ marginLeft: "auto" }, props.style as StyleProp<ViewStyle> | null)}
      >
        {props.children}
      </View>
    );
  }
  return (
    <Text
      class={props.class ?? undefined}
      style={mergeStyle(shortcutChrome(), props.style as StyleProp<TextStyle> | null)}
    >
      {props.children}
    </Text>
  );
}

export function MenuSub(props: MenuSubProps) {
  const triggerSlot = createSlot();
  return (
    <SubContext.Provider
      value={{
        trigger: triggerSlot,
        get disabled() {
          return props.disabled;
        },
      }}
    >
      {props.children}
    </SubContext.Provider>
  );
}

export function MenuSubTrigger(props: MenuSubTriggerProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("MenuSubTrigger must be used within <MenuSub>");
  const isDisabled = () => props.disabled ?? ctx.disabled;

  ctx.trigger.set(() => {
    const children = props.children;
    if (typeof children === "string") {
      return (
        <View
          class={props.class ?? undefined}
          style={mergeStyle(subTriggerChrome(isDisabled()), props.style)}
          hoverStyle={mergeStyle(itemHoverChrome(isDisabled()), props.hoverStyle)}
          activeStyle={props.activeStyle}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>{children}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>›</Text>
        </View>
      );
    }
    return (
      <View
        class={props.class ?? undefined}
        style={mergeStyle(
          { opacity: disabledOpacity(isDisabled()), flexDirection: "row", alignItems: "center" },
          props.style,
        )}
        hoverStyle={props.hoverStyle}
        activeStyle={props.activeStyle}
      >
        {children ?? <View />}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function MenuSubContent(props: MenuSubContentProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("MenuSubContent must be used within <MenuSub>");
  const triggerAccessor = ctx.trigger.get();
  const [, rest] = split(props, ["children", "disabled", "style"]);

  return (
    <BaseSubmenu
      {...rest}
      disabled={props.disabled ?? ctx.disabled}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      style={mergeStyle(submenuChrome(), props.style)}
    >
      {props.children}
    </BaseSubmenu>
  );
}
