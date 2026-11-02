import { colors, focusRing } from "@shadcn-nsh/theme";
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
import { popupBackdrop, popupSurface } from "./lib/popup-surface";

/**
 * Composition root (shadcn `DropdownMenu`): holds open state for Trigger /
 * Content. Prefer composition; legacy `trigger` still mounts a single
 * `nsh/base` Menu with full base prop + style-hook pass-through.
 */
export type DropdownMenuProps = Omit<BaseMenuProps, "children"> & {
  children?: JSX.Element;
};

/**
 * Theme layer on `nsh/base` Menu as shadcn `DropdownMenuContent`. All base
 * props + style hooks pass through; consumer styles shallow-merge over
 * defaults. Open / trigger / lifecycle events are owned by the
 * {@link DropdownMenu} context (or the legacy single-root). Defaults mirror
 * shadcn `bases/base` (`placement`/`side` bottom, `align` start,
 * `offset`/`sideOffset` 4).
 */
export type DropdownMenuContentProps = Omit<
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
export type DropdownMenuTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * Theme layer on `nsh/base` MenuItem. Store CLI `nsh` 0.3.0 has no
 * `checked` / `indicator` — when `checked` is set, the wrapper paints a
 * leading mark in children (app-layer checkbox / radio look).
 */
export type DropdownMenuItemProps = Omit<BaseMenuItemProps, "children"> & {
  /** App-layer check mark (store 0.3.0 MenuItem has no `checked`). */
  checked?: boolean | null;
  children?: JSX.Element;
};

/** Checkbox-shaped item — sets `checked` on {@link DropdownMenuItem}. */
export type DropdownMenuCheckboxItemProps = Omit<DropdownMenuItemProps, "checked"> & {
  checked?: boolean | null;
};

/** App group wrapper (shadcn `DropdownMenuGroup`; not an `nsh/base` part). */
export type DropdownMenuGroupProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** App label text (shadcn `DropdownMenuLabel`; not an `nsh/base` part). */
export type DropdownMenuLabelProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/** Theme layer on `nsh/base` MenuSeparator. */
export type DropdownMenuSeparatorProps = BaseMenuSeparatorProps;

/** App trailing shortcut hint (shadcn `DropdownMenuShortcut`). */
export type DropdownMenuShortcutProps = {
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<TextStyle | ViewStyle>;
};

/**
 * Composition root for a nested menu (shadcn `DropdownMenuSub`). Legacy
 * `trigger` still mounts a single `nsh/base` Submenu with full pass-through.
 */
export type DropdownMenuSubProps = Omit<BaseSubmenuProps, "children"> & {
  children?: JSX.Element;
};

/** Item that opens a submenu. String children get a chevron row. */
export type DropdownMenuSubTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
};

/** Nested menu body — mounts `nsh/base` Submenu with the SubTrigger slot. */
export type DropdownMenuSubContentProps = Omit<BaseSubmenuProps, "trigger" | "children"> & {
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
  if (!ctx) throw new Error("DropdownMenu parts must be used within <DropdownMenu>");
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

function bridgeOpenChange(
  onOpenChange?: (open: boolean, reason: OpenChangeReason) => void,
): ((event: { open: boolean; reason: string }) => void) | undefined {
  if (!onOpenChange) return undefined;
  return (event) => onOpenChange(event.open, event.reason as OpenChangeReason);
}

/** Popup / sheet chrome — aligned with shadcn `cn-dropdown-menu-content` padding. */
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

function renderBaseMenu(props: BaseMenuProps) {
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
    placement = "bottom",
    align = "start",
    offset = 4,
    ...rest
  } = props;

  return (
    <BaseMenu
      {...rest}
      placement={placement}
      align={align}
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

function renderBaseSubmenu(props: BaseSubmenuProps) {
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
    <BaseSubmenu
      {...rest}
      class={mergeClass(undefined, className)}
      style={mergeStyle(submenuChrome(), style)}
      hoverStyle={mergeStyle(undefined, hoverStyle)}
      activeStyle={mergeStyle(undefined, activeStyle)}
      focusStyle={mergeStyle(undefined, focusStyle)}
      disabledStyle={mergeStyle(undefined, disabledStyle)}
    />
  );
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { open, defaultOpen, trigger, children, onOpenChange, onOpen, onClose, onCancel, ...rest } =
    props;

  // Legacy: single-root with trigger prop and item children.
  if (trigger != null) {
    return renderBaseMenu({
      ...rest,
      open,
      defaultOpen,
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
    defaultOpen,
    onOpenChange: bridgeOpenChange(onOpenChange),
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

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
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

export function DropdownMenuContent(props: DropdownMenuContentProps) {
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
    backdropClass,
    backdropStyle,
    placement = "bottom",
    align = "start",
    offset = 4,
    ...rest
  } = props;

  return (
    <BaseMenu
      {...rest}
      open={ctx.open()}
      trigger={(triggerAccessor?.() as JSX.Element) ?? <View />}
      placement={placement}
      align={align}
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
    </BaseMenu>
  );
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const {
    checked,
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
    ...rest
  } = props;

  // Store nsh 0.3.0 MenuItem has no checked/indicator — paint a mark in children.
  const showMark = checked != null;
  const body = showMark ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 16, height: 16, alignItems: "center", justifyContent: "center" }}>
        {checked ? <Text style={{ fontSize: 12, color: colors.primary }}>✓</Text> : null}
      </View>
      {children}
    </View>
  ) : (
    children
  );

  return (
    <BaseMenuItem
      {...rest}
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
      {body}
    </BaseMenuItem>
  );
}

export function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  const { checked, ...rest } = props;
  return <DropdownMenuItem {...rest} checked={checked ?? false} />;
}

export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  const { children, class: className, style } = props;
  return (
    <View class={mergeClass(undefined, className)} style={mergeStyle(undefined, style)}>
      {children}
    </View>
  );
}

export function DropdownMenuLabel(props: DropdownMenuLabelProps) {
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

export function DropdownMenuSeparator(props: DropdownMenuSeparatorProps = {}) {
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

export function DropdownMenuShortcut(props: DropdownMenuShortcutProps) {
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

export function DropdownMenuSub(props: DropdownMenuSubProps) {
  const { trigger, children, disabled, ...rest } = props;

  if (trigger != null) {
    return renderBaseSubmenu({
      ...rest,
      trigger,
      disabled,
      children,
    });
  }

  const triggerSlot = createTriggerSlot();
  return (
    <SubContext.Provider value={{ trigger: triggerSlot, disabled }}>{children}</SubContext.Provider>
  );
}

export function DropdownMenuSubTrigger(props: DropdownMenuSubTriggerProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("DropdownMenuSubTrigger must be used within <DropdownMenuSub>");
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

export function DropdownMenuSubContent(props: DropdownMenuSubContentProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("DropdownMenuSubContent must be used within <DropdownMenuSub>");
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
