// Source: examples/nsh-gallery-ui/look/menu.tsx, popup.tsx (MenuMark) @ 64ab8a1d (baseline), see NOTICE.
import {
  alpha,
  colors,
  disabledOpacity,
  focusRing,
  popupBackdrop,
  popupSurface,
} from "@shadcn-nsh/theme";
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
import { isPointer } from "./lib/density";
import { follow } from "./lib/follow";
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

/** Checkbox-shaped item — sets `checked` on {@link MenuItem} and shows a check. */
export type MenuCheckboxItemProps = Omit<MenuItemProps, "checked"> & {
  /** Checked or not. Omitted means unchecked, and the check's space stays. */
  checked?: boolean | null;
};

/** One choice of a group — `menuitemradio`, with a dot instead of a check. */
export type MenuRadioItemProps = Omit<MenuItemProps, "checked"> & {
  /** Selected or not. Omitted means not selected, and the dot's space stays. */
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
  focusStyle?: StyleProp<ViewStyle>;
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

type SubContextValue = {
  trigger: Slot;
  /** Filled when the trigger slot runs, if its child is a string (the touch sheet's back row). */
  label: { value?: string };
  disabled?: boolean;
};
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

/**
 * Row metrics and every menu chrome literal. Pointer: 26-point rows; touch: a 46-point finger
 * row. Heights are minimums so a label can grow with the user's text. Colours are read here, at
 * render, so they follow the appearance.
 */
function look() {
  const pointer = isPointer();
  // Geometry from look/menu.tsx (`menuItemSize`, inset 8). `terminal` is dropped.
  const row = pointer
    ? { minHeight: 26, radius: 6, font: 13, note: 11.5, icon: 14, chevron: 12, section: 11, dot: 6 }
    : { minHeight: 46, radius: 10, font: 16, note: 14, icon: 18, chevron: 14, section: 13, dot: 6 };
  const inset = 8;
  return {
    row,
    item(): TextStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minHeight: row.minHeight,
        paddingHorizontal: inset,
        borderRadius: row.radius,
        borderCurve: "continuous",
        fontSize: row.font,
        // One line, inherited by the label. A row does not wrap.
        numberOfLines: 1,
        // A getter, not a snapshot: a submenu trigger is built once, and a captured
        // light foreground stays near-black (or near-white) after the appearance changes.
        get color() {
          return colors.foreground;
        },
        transitionProperty: "background-color, opacity",
        transitionDuration: 150,
        transitionTimingFunction: "ease-out",
      };
    },
    /** Hover and keyboard share one neutral fill, so arrow keys show where they are. */
    highlight(): ViewStyle {
      return { backgroundColor: colors.accent };
    },
    /** A shade deeper than the highlight. No sink: a menu row does not scale. */
    pressed(): ViewStyle {
      return { backgroundColor: alpha(colors.foreground, 0.1) };
    },
    dim(): ViewStyle {
      return { opacity: disabledOpacity() };
    },
    section(): TextStyle {
      return {
        fontSize: row.section,
        fontWeight: "600",
        color: colors.mutedForeground,
        paddingHorizontal: inset,
        paddingTop: 6,
        paddingBottom: 2,
      };
    },
    shortcut(): TextStyle {
      // Same ink as the label. A fainter note under `disabledOpacity` disappears.
      return {
        marginLeft: "auto",
        flexShrink: 0,
        fontSize: row.note,
        get color() {
          return colors.foreground;
        },
      };
    },
    separator(): ViewStyle {
      // The hairline's thickness, not a control height. No lip of light: the theme has no groove.
      return {
        height: 1,
        marginTop: 4,
        marginBottom: 5,
        marginHorizontal: 4,
        backgroundColor: colors.border,
      };
    },
    chevron(): TextStyle {
      // Foreground, not a faint tint: the row's opacity is the only disabled dimming.
      return {
        fontSize: row.chevron,
        get color() {
          return colors.foreground;
        },
      };
    },
    popup(): ViewStyle {
      if (pointer) return { ...popupSurface(), minWidth: 200 };
      // The sheet is not the floating popup: no border, no shadow, top corners only.
      return {
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderCurve: "continuous",
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 34,
      };
    },
  };
}

/** A menu row's pointer and touch metrics: minimum height, type size, mark and chevron. */
export function menuRow() {
  return look().row;
}

/** The menu popup on a pointer (at least 200 wide), or the touch sheet. Shared with context menus. */
export function menuPopupChrome(): ViewStyle {
  return look().popup();
}

/**
 * Row ink. `foreground` is read here, in this component's render, so the text follows the
 * appearance even when a submenu trigger is kept from the first time it was built.
 */
function Ink(props: { children?: string; size?: number }) {
  return <Text style={{ fontSize: props.size, color: colors.foreground }}>{props.children}</Text>;
}

/** Passed through when the row is disabled, so the highlight does not cover the dim. */
function stateStyle(
  disabled: boolean | undefined,
  base: ViewStyle,
  consumer?: StyleProp<ViewStyle> | null,
) {
  if (disabled) return consumer ?? undefined;
  return mergeStyle(base, consumer);
}

/**
 * The check or dot in front of a checkable row. It springs in from 75% (and lands at once with
 * reduced motion). The reference tints it with its brand accent; here that is `primary`.
 */
function MenuMark(props: { kind: "check" | "dot"; on: () => boolean }) {
  const row = look().row;
  const shown = follow(() => (props.on() ? 1 : 0));
  return (
    <View
      style={{
        width: row.icon,
        height: row.icon,
        alignItems: "center",
        justifyContent: "center",
        opacity: shown,
        transform: [{ scale: shown.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }],
      }}
    >
      {props.kind === "dot" ? (
        <View
          style={{
            width: row.dot,
            height: row.dot,
            borderRadius: row.dot / 2,
            backgroundColor: colors.primary,
          }}
        />
      ) : (
        <Text
          style={{
            fontSize: row.icon - 2,
            fontWeight: "700",
            lineHeight: row.icon,
            color: colors.primary,
          }}
        >
          ✓
        </Text>
      )}
    </View>
  );
}

/** The touch sheet's way back to the menu that opened this one. */
function submenuBack(label: string) {
  const chrome = look();
  return (
    <View activeStyle={chrome.pressed()} style={{ ...chrome.item(), gap: 6 }}>
      <Text style={{ fontSize: 14, color: colors.primary }}>‹</Text>
      <Text style={{ fontSize: chrome.row.font, fontWeight: "600", color: colors.primary }}>
        {label}
      </Text>
    </View>
  );
}

/** Composition root: owns the open state the parts below read. */
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

/** Opens the menu; a string child renders a `Button`. */
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
        style={mergeStyle(props.disabled ? { opacity: disabledOpacity() } : undefined, props.style)}
      >
        {children}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

/** The popup surface of the menu, with its entrance motion as the default. */
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
      popupStyle={mergeStyle({ ...menuPopupChrome(), ...motion.style }, props.popupStyle)}
      backdropStyle={mergeStyle(popupBackdrop(), props.backdropStyle)}
      popupStartingStyle={defaultStarting() ? motion.startingStyle : props.popupStartingStyle}
      popupEndingStyle={defaultEnding() ? motion.endingStyle : props.popupEndingStyle}
    >
      {props.children}
    </BaseMenu>
  );
}

/** One row: accent while hovered or highlighted, a deeper fill while pressed, dimmed when disabled. */
export function MenuItem(props: MenuItemProps) {
  const chrome = look();
  // Defaulted: indicator, style, and the row's states. Everything else passes through.
  const [, rest] = split(props, [
    "children",
    "indicator",
    "style",
    "hoverStyle",
    "focusStyle",
    "activeStyle",
    "disabledStyle",
  ]);
  const checkable = props.checked != null;

  return (
    <BaseMenuItem
      {...rest}
      indicator={
        props.indicator ??
        (checkable ? (
          <MenuMark
            kind={props.role === "menuitemradio" ? "dot" : "check"}
            on={() => props.checked === true}
          />
        ) : undefined)
      }
      style={mergeStyle(chrome.item(), props.style)}
      hoverStyle={stateStyle(props.disabled, chrome.highlight(), props.hoverStyle)}
      focusStyle={stateStyle(props.disabled, chrome.highlight(), props.focusStyle)}
      activeStyle={stateStyle(props.disabled, chrome.pressed(), props.activeStyle)}
      disabledStyle={mergeStyle(chrome.dim(), props.disabledStyle)}
    >
      {props.children}
    </BaseMenuItem>
  );
}

/** A menu row that can be checked. */
export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const [, rest] = split(props, ["checked"]);
  return <MenuItem {...rest} checked={props.checked ?? false} />;
}

/** A menu row that is one choice of a group. The app checks one at a time; there is no radio group part. */
export function MenuRadioItem(props: MenuRadioItemProps) {
  const [, rest] = split(props, ["checked"]);
  return <MenuItem {...rest} role="menuitemradio" checked={props.checked ?? false} />;
}

/** Groups related rows. */
export function MenuGroup(props: MenuGroupProps) {
  return (
    <View class={props.class ?? undefined} style={props.style}>
      {props.children}
    </View>
  );
}

/** A group's title: not a row, nothing to press. */
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
      style={mergeStyle(look().section(), props.style as StyleProp<TextStyle> | null)}
    >
      {props.children}
    </Text>
  );
}

/** A hairline between groups. */
export function MenuSeparator(props: MenuSeparatorProps = {}) {
  const [, rest] = split(props, ["style"]);
  return <BaseMenuSeparator {...rest} style={mergeStyle(look().separator(), props.style)} />;
}

/** The shortcut shown at a row's trailing edge. */
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
      style={mergeStyle(look().shortcut(), props.style as StyleProp<TextStyle> | null)}
    >
      {props.children}
    </Text>
  );
}

/** The root of a submenu. */
export function MenuSub(props: MenuSubProps) {
  const triggerSlot = createSlot();
  const label: { value?: string } = {};
  return (
    <SubContext.Provider
      value={{
        trigger: triggerSlot,
        label,
        get disabled() {
          return props.disabled;
        },
      }}
    >
      {props.children}
    </SubContext.Provider>
  );
}

/** The row that opens a submenu. */
export function MenuSubTrigger(props: MenuSubTriggerProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("MenuSubTrigger must be used within <MenuSub>");
  const isDisabled = () => props.disabled ?? ctx.disabled;

  ctx.trigger.set(() => {
    const chrome = look();
    const children = props.children;
    // `disabledOpacity(undefined)` is 0.5: its default argument means "a disabledStyle", not "enabled".
    const disabled = Boolean(isDisabled());
    ctx.label.value = typeof children === "string" ? children : undefined;
    // Spread copies a getter's current value. Put `color` and `opacity` back as getters
    // so a trigger base keeps from the first open still follows the appearance, and so
    // the only dim is `disabledOpacity` on foreground (never a muted ink under it).
    const row = {
      ...chrome.item(),
      justifyContent: "space-between" as const,
      get color() {
        return colors.foreground;
      },
      get opacity() {
        return disabled ? disabledOpacity() : 1;
      },
    };
    if (typeof children === "string") {
      return (
        <View
          class={props.class ?? undefined}
          style={mergeStyle(row, props.style)}
          hoverStyle={stateStyle(disabled, chrome.highlight(), props.hoverStyle)}
          focusStyle={stateStyle(disabled, chrome.highlight(), props.focusStyle)}
          activeStyle={stateStyle(disabled, chrome.pressed(), props.activeStyle)}
        >
          <Ink>{children}</Ink>
          <Ink size={chrome.row.chevron}>›</Ink>
        </View>
      );
    }
    return (
      <View
        class={props.class ?? undefined}
        style={mergeStyle(
          {
            ...chrome.item(),
            get color() {
              return colors.foreground;
            },
            get opacity() {
              return disabled ? disabledOpacity() : 1;
            },
          },
          props.style,
        )}
        hoverStyle={stateStyle(disabled, chrome.highlight(), props.hoverStyle)}
        focusStyle={stateStyle(disabled, chrome.highlight(), props.focusStyle)}
        activeStyle={stateStyle(disabled, chrome.pressed(), props.activeStyle)}
      >
        {children ?? <View />}
      </View>
    );
  });
  return <View style={{ width: 0, height: 0 }} />;
}

/** The popup of a submenu. On a touch screen a string trigger becomes the back row. */
export function MenuSubContent(props: MenuSubContentProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("MenuSubContent must be used within <MenuSub>");
  const triggerAccessor = ctx.trigger.get();
  const [, rest] = split(props, ["children", "disabled", "back"]);
  // The slot writes the label; read it after the trigger is built.
  const trigger = (triggerAccessor?.() as JSX.Element) ?? <View />;
  const name = ctx.label.value;
  const back =
    props.back !== undefined ? props.back : !isPointer() && name ? submenuBack(name) : undefined;

  return (
    <BaseSubmenu {...rest} disabled={props.disabled ?? ctx.disabled} trigger={trigger} back={back}>
      {props.children}
    </BaseSubmenu>
  );
}
