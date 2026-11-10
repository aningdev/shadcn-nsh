import { colors, focusRing, overlayMotion, popupBackdrop, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, Text, View } from "nsh";
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
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";

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
  trigger: TriggerSlot;
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

type SubContextValue = { trigger: TriggerSlot; disabled?: boolean };
const SubContext = context<SubContextValue | null>(null);

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
    opacity: disabled ? 0.5 : 1,
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
  const { open, defaultOpen, children, onOpenChange, onOpen, onClose, onCancel } = props;

  const state = createOpenState<OpenChangeReason>({
    open,
    defaultOpen,
    onOpenChange,
  });
  const triggerSlot = createTriggerSlot();

  return (
    <MenuContext.Provider
      value={{
        ...state,
        trigger: triggerSlot,
        onOpen,
        onClose,
        onCancel,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function MenuTrigger(props: MenuTriggerProps) {
  const ctx = useMenu();
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

export function MenuContent(props: MenuContentProps) {
  const ctx = useMenu();
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
    placement = "bottom",
    align = "start",
    offset = 4,
    ...rest
  } = props;

  // menu.md: 100 ms, from 4 points above. Either hook of a phase set by the consumer
  // owns that phase (`null` turns it off); the classes left in `...rest` pass through.
  const motion = overlayMotion("menu");
  const defaultStartingStyle =
    props.popupStartingClass === undefined && popupStartingStyle === undefined;
  const defaultEndingStyle = props.popupEndingClass === undefined && popupEndingStyle === undefined;

  return (
    <BaseMenu
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
      backdropClass={mergeClass(undefined, backdropClass)}
      backdropStyle={mergeStyle(popupBackdrop(), backdropStyle)}
      popupStartingStyle={defaultStartingStyle ? motion.startingStyle : popupStartingStyle}
      popupEndingStyle={defaultEndingStyle ? motion.endingStyle : popupEndingStyle}
    >
      {children}
    </BaseMenu>
  );
}

export function MenuItem(props: MenuItemProps) {
  const {
    checked,
    indicator,
    disabled,
    closeOnSelect,
    accessibilityLabel,
    children,
    onSelect,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    indicatorClass,
    indicatorStyle,
    checkedStyle,
    role,
    ...rest
  } = props;

  const resolvedIndicator = indicator ?? (checked != null ? defaultCheckIndicator() : undefined);

  return (
    <BaseMenuItem
      {...rest}
      checked={checked}
      role={role}
      indicator={resolvedIndicator}
      indicatorClass={indicatorClass}
      indicatorStyle={indicatorStyle}
      checkedStyle={checkedStyle}
      disabled={disabled}
      closeOnSelect={closeOnSelect}
      accessibilityLabel={accessibilityLabel}
      onSelect={onSelect}
      class={mergeClass(undefined, className)}
      style={mergeStyle(itemChrome(disabled), style)}
      hoverStyle={mergeStyle(itemHoverChrome(disabled), hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    >
      {children}
    </BaseMenuItem>
  );
}

export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const { checked, ...rest } = props;
  return <MenuItem {...rest} checked={checked ?? false} />;
}

export function MenuGroup(props: MenuGroupProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(undefined, style)}>
      {children}
    </View>
  );
}

export function MenuLabel(props: MenuLabelProps) {
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
      style={mergeStyle(labelChrome(), style as StyleProp<TextStyle> | null)}
    >
      {children}
    </Text>
  );
}

export function MenuSeparator(props: MenuSeparatorProps = {}) {
  const {
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;

  return (
    <BaseMenuSeparator
      {...rest}
      class={mergeClass(undefined, className)}
      style={mergeStyle(separatorChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    />
  );
}

export function MenuShortcut(props: MenuShortcutProps) {
  const { children, class: className, style } = props;
  if (typeof children !== "string" && children != null) {
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle({ marginLeft: "auto" }, style as StyleProp<ViewStyle> | null)}
      >
        {children}
      </View>
    );
  }
  return (
    <Text
      class={mergeClass(undefined, className)}
      style={mergeStyle(shortcutChrome(), style as StyleProp<TextStyle> | null)}
    >
      {children}
    </Text>
  );
}

export function MenuSub(props: MenuSubProps) {
  const { children, disabled } = props;

  const triggerSlot = createTriggerSlot();
  return (
    <SubContext.Provider value={{ trigger: triggerSlot, disabled }}>{children}</SubContext.Provider>
  );
}

export function MenuSubTrigger(props: MenuSubTriggerProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("MenuSubTrigger must be used within <MenuSub>");
  const { children, disabled, class: className, style, hoverStyle, activeStyle } = props;
  const isDisabled = disabled ?? ctx.disabled;

  ctx.trigger.set(() => {
    if (typeof children === "string") {
      return (
        <View
          class={mergeClass(undefined, className)}
          style={mergeStyle(subTriggerChrome(isDisabled), style)}
          hoverStyle={mergeStyle(itemHoverChrome(isDisabled), hoverStyle)}
          activeStyle={mergeStyle(undefined, activeStyle)}
        >
          <Text style={{ fontSize: 14, color: colors.foreground }}>{children}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>›</Text>
        </View>
      );
    }
    return (
      <View
        class={mergeClass(undefined, className)}
        style={mergeStyle(
          { opacity: isDisabled ? 0.5 : 1, flexDirection: "row", alignItems: "center" },
          style,
        )}
        hoverStyle={mergeStyle(undefined, hoverStyle)}
        activeStyle={mergeStyle(undefined, activeStyle)}
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
  const {
    children,
    disabled,
    back,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    disabledStyle,
    ...rest
  } = props;

  return (
    <BaseSubmenu
      {...rest}
      disabled={disabled ?? ctx.disabled}
      back={back}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      class={mergeClass(undefined, className)}
      style={mergeStyle(submenuChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    >
      {children}
    </BaseSubmenu>
  );
}
