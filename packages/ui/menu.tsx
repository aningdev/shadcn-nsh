// A menu: the parts first, and the shared row and popup looks (`menuItemLook`, `menuPopup`, …) below.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { JSX, StyleProp, TextStyle, TextProps, ViewProps, ViewStyle } from "nsh";
import { context, horizontalSizeClass, platform, split, Text, token, View } from "nsh";
import {
  Menu as BaseMenu,
  MenuButton as BaseMenuButton,
  type MenuButtonProps as BaseMenuButtonProps,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  type MenuItemProps as BaseMenuItemProps,
  type MenuProps as BaseMenuProps,
  type MenuSeparatorProps as BaseMenuSeparatorProps,
  type OpenChangeReason,
  Submenu as BaseSubmenu,
  type SubmenuProps as BaseSubmenuProps,
} from "nsh/base";

import {
  alpha,
  colors,
  controlHeight,
  cornerCurve,
  feedback,
  iconSize,
  rounded,
  font,
  shape,
  stroke,
  surface,
} from "../theme";
import {
  Button,
  type ButtonProps,
  type ButtonSize,
  buttonLabel,
  buttonLook,
  type ButtonVariant,
} from "./button";
import { ChevronLeft, ChevronRight, Icon } from "./lib/icons";
import {
  backdrop,
  MenuMark,
  menuIndicator,
  popInStyles,
  itemRadius,
  itemSpacing,
  listPadding,
  type PopupSide,
  popupSurface,
  rowVerticalPad,
} from "./lib/popup";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/state";
import { AsText } from "./lib/utils";

/** A menu row's least height and its type: compact with a pointer, a
 * finger's row on a touch screen. */
export interface MenuItemDimensions {
  /** The least height of a row: one with a line under its label grows past it. */
  height: number;
  font: number;
  /** A note's size (a shortcut, a value). */
  note: number;
  /** A leading icon's or a check's size. */
  icon: number;
}

/** Options of `menuItemLook`. */
export interface MenuItemLookOptions {
  /** The label starts where a checkable row's does, past the mark's room, as shadcn's `inset`. */
  inset?: boolean;
  /** More style (a justification, a padding), over the look's. */
  style?: ViewStyle;
}

/** A menu row's variants: `default`, the text's color; `destructive`, the danger tone. */
export type MenuItemVariant = "default" | "destructive";

/** Options of `menuItemLabel`, `menuItemNote` and `menuItemGlyph`. */
export interface MenuItemTextOptions {
  /** `destructive`: the danger tone on the row's label, note and icon. */
  variant?: MenuItemVariant;
}

/** Options of `menuPopup`. */
export interface MenuPopupOptions {
  /** The side of its trigger it opens on (its `placement`), which it comes in from: `"bottom"` unless set. */
  side?: PopupSide;
  /** With a pointer, its least width in points: 200 unless set. */
  minWidth?: number;
}

/** The props of `MenuLabel`: the title, plus every text prop (`style`, `numberOfLines`, …), spread after the label's own. */
export type MenuLabelProps = Omit<TextProps, "children"> & {
  /** The title itself. */
  children?: string;
  /** Lines it up with checkable rows' labels, past the mark they hold. */
  inset?: boolean;
};

/** The props of `SubmenuRow`: the label, its icon and its state, plus every view prop. */
export type SubmenuRowProps = Omit<ViewProps, "children"> & {
  children?: string | JSX.Element;
  /** An icon before the label. */
  lead?: JSX.Element;
  /** No presses: dimmed, the chevron still shown. */
  disabled?: boolean;
  /** The label starts where a checkable row's does (shadcn's `inset`). */
  inset?: boolean;
};

/** Why a menu closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type MenuOpenChangeReason = OpenChangeReason;

/**
 * The root: it owns whether the menu is open, and the trigger slot. It draws no view of its own,
 * so it takes no view props: they go to the trigger and the content.
 */
export type MenuProps = {
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: MenuOpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The popup. Every prop of `nsh/base`'s Menu passes through but the ones the root owns;
 * `popupStyle` / `backdropStyle` / starting styles go over `menuPopup`. Defaults: placement
 * `bottom`, align `start`, offset `4`.
 */
export type MenuContentProps = Omit<
  BaseMenuProps,
  "trigger" | "open" | "defaultOpen" | "onOpenChange" | "onOpen" | "onClose" | "onCancel"
> & {
  children?: JSX.Element;
};

/**
 * What opens the menu: a string is a `Button`'s label; any other single element is the trigger
 * itself (its press, focus, hover and open state land on it, no view in between).
 */
export type MenuTriggerProps = Omit<ButtonProps, "children"> & {
  /** The string child's button, or the trigger element itself. */
  children?: string | JSX.Element;
};

/** A menu row: a string child is its label (`menuItemLabel`), anything else is drawn as given. */
export type MenuItemProps = Omit<BaseMenuItemProps, "children"> & {
  /** `default`, the row as it is; `destructive`, its label in the danger tone. */
  variant?: MenuItemVariant;
  /** A string is the label; anything else is drawn as given. A string label is also the
   * row's name for screen readers, unless `accessibilityLabel` says otherwise. */
  children?: string | JSX.Element;
  /** The label starts where a checkable row's does, so a plain row lines up with the checkable
   * rows of its menu (shadcn's `inset`). */
  inset?: boolean;
};

/** A row with a checkbox: `checked` shows a check. */
export type MenuCheckboxItemProps = Omit<MenuItemProps, "checked"> & {
  checked?: boolean | null;
};

/** One choice of a group, `menuitemradio`: a dot when it is the choice. */
export type MenuRadioItemProps = Omit<MenuItemProps, "checked"> & {
  checked?: boolean | null;
};

/** A group of rows: `nsh/base` has no group part, so this is the library's own view, `group` to
 * screen readers so its rows are announced as one set. */
export type MenuGroupProps = ViewProps;

/** A hairline between rows (`menuSeparator`). */
export type MenuSeparatorProps = BaseMenuSeparatorProps;

/** A shortcut shown at a row's trailing edge (`menuItemNote`); anything but a string is drawn as given. */
export type MenuShortcutProps = Omit<ViewProps, "children" | "style"> & {
  children?: string | JSX.Element;
  /** The note's own style. A shortcut is type: a `TextStyle` is a `ViewStyle`, so an element child takes the same. */
  style?: StyleProp<TextStyle>;
};

/**
 * The root of a nested menu: it holds the submenu's trigger, its label and its disabled state. It
 * draws no view of its own, so it takes no view props: its row is `MenuSubTrigger`, its popup
 * `MenuSubContent`.
 */
export type MenuSubProps = {
  children?: JSX.Element;
  disabled?: boolean;
};

/**
 * The row that opens a submenu: a string child is the label, anything else is drawn as given —
 * both in `SubmenuRow`'s row, with its chevron at the end. A touch screen's sheet opens with a
 * back row named after a string child (`MenuSubContent`'s `back`).
 */
export type MenuSubTriggerProps = Omit<SubmenuRowProps, "disabled"> & {
  /** No press: a `MenuSub`'s own `disabled` stands when this is left out. */
  disabled?: boolean;
};

/** The nested menu's popup: `nsh/base`'s Submenu, with the trigger `MenuSubTrigger` sets; on a touch screen its sheet opens with a back row (`back`). */
export type MenuSubContentProps = Omit<BaseSubmenuProps, "trigger" | "children"> & {
  children?: JSX.Element;
};

/**
 * The menu the platform shows itself: on iOS the system's pull-down menu (a `UIMenu`, Liquid Glass
 * on iOS 26 and later) over the content, on a desktop the pointer's context menu — its placement,
 * motion, checks, submenus, sections and destructive items are the platform's. The app hands over
 * the items as data and hears the choice (`onSelect`) — the same data `ContextMenu` takes. Android
 * and the web have no system menu for a view: there the content shows and opens nothing, so a menu
 * of this library's (`Menu`) is what those platforms draw.
 *
 * shadcn has no counterpart: a web menu is always the app's own drawing (shadcn's
 * `DropdownMenu`), and this is `nsh/base`'s [`MenuButton`](https://nsh.dev/elements/menu-button).
 * A string child is a button's label, in `buttonLook`'s look of `variant` and `size`; anything
 * else is the app's own content, drawn as given (a chip, a row of an icon and a value).
 */
export type MenuButtonProps = Omit<BaseMenuButtonProps, "children"> & {
  /** The look a string child wears; default `ghost`, a bare row that shows its fill under the pointer. */
  variant?: ButtonVariant;
  /** Default `default`. */
  size?: ButtonSize;
  /** A string is a button's label; anything else is the app's own content. */
  children?: string | JSX.Element;
};

/** A group's title in a menu: not an item, nothing to press; 11 points semibold with a pointer, 13 on a touch screen, faint. */
export function MenuLabel(props: MenuLabelProps) {
  const [, rest] = split(props, ["children", "inset", "style"]);
  return (
    <Text
      {...rest}
      style={[
        {
          // No type role has this size: a group's heading is 11 / 13.
          fontSize: pointer ? 11 : 13,
          fontWeight: font.weight("title"),
          color: colors.faint,
          paddingHorizontal: itemSpacing.pad,
          ...(props.inset ? { paddingStart: itemSpacing.pad + markRoom() } : {}),
          // 6 points down from the group above it, 2 up from its own rows.
          paddingTop: 6,
          paddingBottom: 2,
        },
        props.style ?? null,
      ]}
    >
      {props.children}
    </Text>
  );
}

/**
 * The row that opens a submenu (a `Submenu`'s `trigger`): `menuItemLook`'s
 * row, `lead` (an icon) before the label and a faint chevron at its end;
 * disabled, 35%. `style` goes over the row's own, and every other view prop
 * with it. A string child is the label; anything else is drawn as given,
 * still before the chevron, so a row of the app's own (an icon, a title, a
 * value) keeps the chevron too.
 */
export function SubmenuRow(props: SubmenuRowProps) {
  const [, rest] = split(props, ["children", "lead", "disabled", "inset", "style"]);
  return (
    <SubmenuRowFrame {...rest} disabled={props.disabled} inset={props.inset} style={props.style}>
      {props.lead}
      {(() => {
        // Read once, here where the label is drawn (`marker.tsx` reads in the same shape).
        const kids = props.children;
        if (kids == null) return null;
        return typeof kids === "string" ? (
          <AsText style={menuItemLabel()}>{kids}</AsText>
        ) : (
          <View style={{ flexGrow: 1, flexShrink: 1 }}>{kids}</View>
        );
      })()}
      <Icon icon={ChevronRight} size={submenuChevron} tint={colors.faint} />
    </SubmenuRowFrame>
  );
}

/** The row a touch screen's sheet shows above a submenu's items to go back (a `Submenu`'s `back`): a back chevron and the submenu's label in the accent. */
export function SubmenuBack(props: Omit<ViewProps, "children"> & { label: string }) {
  const [, rest] = split(props, ["label", "style"]);
  const look = menuItemLook({ style: { gap: 6 } });
  return (
    <View
      {...rest}
      activeStyle={[look.activeStyle, props.activeStyle ?? null]}
      style={[look.style, props.style ?? null]}
    >
      <Icon icon={ChevronLeft} size={14} tint={colors.brand} />
      <Text
        style={{
          fontSize: menuItemSize.font,
          fontWeight: font.weight("title"),
          color: colors.brand,
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}

/** Composition root: owns the open state the parts below read. */
export function Menu(props: MenuProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const triggerSlot = createSlot<JSX.Element>();
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

/** Opens the menu: a `Button` for a string, the element itself for anything else. Base toggles on press. */
export function MenuTrigger(props: MenuTriggerProps) {
  const ctx = useMenu();
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the menu without building it again
  // on every layout. A single element is the trigger itself — `nsh/base` hands its press, focus
  // and open state to that element, and its own look, test id and name stay — so no view goes
  // between them. The kind is read once, here: a string child is read where it is drawn (the
  // `Button`'s own read, through the spread's getter, so a child that reads a signal stays live).
  const kids = props.children;
  ctx.trigger.set(
    typeof kids === "string" ? (
      <Button {...props} disabled={props.disabled} variant={props.variant ?? "secondary"} />
    ) : (
      (kids ?? <View />)
    ),
  );
  // No layout node: a zero-size view would still take a flex `gap` in a row of triggers.
  return null;
}

/** The popup surface of the menu. */
export function MenuContent(props: MenuContentProps) {
  const ctx = useMenu();
  const [, rest] = split(props, [
    "children",
    "popupStyle",
    "backdropStyle",
    "popupStartingStyle",
    "placement",
    "align",
    "offset",
  ]);
  const chrome = menuPopup({
    get side() {
      return (props.placement ?? "bottom") as PopupSide;
    },
  });
  return (
    <BaseMenu
      {...rest}
      open={ctx.open()}
      trigger={ctx.trigger.get() ?? <View />}
      placement={props.placement ?? "bottom"}
      align={props.align ?? "start"}
      offset={props.offset ?? 4}
      onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
      onOpen={ctx.onOpen}
      onClose={ctx.onClose}
      onCancel={ctx.onCancel}
      popupStyle={[chrome.popupStyle, props.popupStyle ?? null]}
      backdropStyle={[chrome.backdropStyle, props.backdropStyle ?? null]}
      popupStartingStyle={
        props.popupStartingStyle !== undefined
          ? props.popupStartingStyle
          : chrome.popupStartingStyle
      }
    >
      {props.children}
    </BaseMenu>
  );
}

/** One row: highlight while hovered or focused, pressed fill, dimmed when disabled. */
export function MenuItem(props: MenuItemProps) {
  const [, rest] = split(props, [
    "children",
    "variant",
    "inset",
    "indicator",
    "style",
    "hoverStyle",
    "focusStyle",
    "activeStyle",
    "disabledStyle",
  ]);
  const look = menuItemLook({ inset: props.inset });
  return (
    <BaseMenuItem
      {...rest}
      // Read where the item is made: an item can become checkable, and its mark follows the value.
      indicatorClass={props.indicatorClass ?? (props.checked != null ? menuIndicator : undefined)}
      indicator={
        props.indicator ??
        (props.checked != null ? (
          <MenuMark
            kind={props.role === "menuitemradio" ? "dot" : "check"}
            size={menuItemSize.icon}
            tint={colors.brand}
          />
        ) : undefined)
      }
      style={[look.style, props.style ?? null]}
      // `nsh` ranks the states itself: `disabledStyle` wins and the others do not apply while
      // disabled, so they stay whole here.
      hoverStyle={[look.hoverStyle, props.hoverStyle ?? null]}
      focusStyle={[look.focusStyle, props.focusStyle ?? null]}
      activeStyle={[look.activeStyle, props.activeStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
    >
      <AsText style={menuItemLabel({ variant: props.variant })}>{props.children}</AsText>
    </BaseMenuItem>
  );
}

/** A menu row that can be checked. */
export function MenuCheckboxItem(props: MenuCheckboxItemProps) {
  const [, rest] = split(props, ["checked"]);
  return <MenuItem {...rest} checked={props.checked ?? false} />;
}

/** A menu row that is one choice of a group. */
export function MenuRadioItem(props: MenuRadioItemProps) {
  const [, rest] = split(props, ["checked"]);
  return <MenuItem {...rest} role="menuitemradio" checked={props.checked ?? false} />;
}

/** Groups related rows. */
export function MenuGroup(props: MenuGroupProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <View {...rest} role="group" style={props.style}>
      {props.children}
    </View>
  );
}

/** A hairline between groups. */
export function MenuSeparator(props: MenuSeparatorProps = {}) {
  const [, rest] = split(props, ["style"]);
  return <BaseMenuSeparator {...rest} style={[menuSeparator(), props.style ?? null]} />;
}

/** The shortcut shown at a row's trailing edge. */
export function MenuShortcut(props: MenuShortcutProps) {
  const [, rest] = split(props, ["children", "style"]);
  return (
    <>
      {(() => {
        // Read once, here where the shortcut is drawn (`marker.tsx` reads in the same shape): a
        // string is the note, anything else keeps its own layout.
        const kids = props.children;
        if (typeof kids !== "string" && kids != null) {
          return (
            <View {...rest} style={[{ marginStart: "auto" }, props.style ?? null]}>
              {kids}
            </View>
          );
        }
        return (
          <Text {...rest} style={[menuItemNote(), { marginStart: "auto" }, props.style ?? null]}>
            {kids}
          </Text>
        );
      })()}
    </>
  );
}

/** The root of a submenu. */
export function MenuSub(props: MenuSubProps) {
  const triggerSlot = createSlot<JSX.Element>();
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
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the submenu without building it again
  // on every layout. Its row is the same whichever children it draws — a string label or the app's
  // own — so both keep the chevron that says a submenu opens. The label is read once, here: a
  // plain string is what the touch screen's back row takes.
  const kids = props.children;
  const disabled = Boolean(props.disabled ?? ctx.disabled);
  ctx.label.value = typeof kids === "string" ? kids : undefined;
  ctx.trigger.set(<SubmenuRow {...props} disabled={disabled} />);
  return null;
}

/** The popup of a submenu. On a touch screen a string trigger becomes the back row. */
export function MenuSubContent(props: MenuSubContentProps) {
  const ctx = SubContext();
  if (!ctx) throw new Error("MenuSubContent must be used within <MenuSub>");
  const [, rest] = split(props, ["children", "disabled", "back"]);
  const trigger = ctx.trigger.get() ?? <View />;
  const name = ctx.label.value;
  const back =
    props.back !== undefined ? (
      props.back
    ) : !pointer && name ? (
      <SubmenuBack label={name} />
    ) : undefined;
  return (
    <BaseSubmenu {...rest} disabled={props.disabled ?? ctx.disabled} trigger={trigger} back={back}>
      {props.children}
    </BaseSubmenu>
  );
}

/** Content that opens the platform's own menu: `nsh/base`'s `MenuButton`, with a string child drawn as a button. */
export function MenuButton(props: MenuButtonProps) {
  const [, rest] = split(props, ["variant", "size", "children"]);
  // The host is `nsh/base`'s: it takes the presses (the system's button covers the content on
  // iOS), so a string child is drawn, not a `Button` — one pressable inside another would swallow
  // the press on a desktop, where the host itself is the pressable.
  const variant = () => props.variant ?? "ghost";
  const options = { size: () => props.size, disabled: () => props.disabled };
  const look = buttonLook(variant, options);
  return (
    <BaseMenuButton {...rest}>
      {(() => {
        // Read once, here where the content is drawn (`marker.tsx` reads in the same shape).
        const kids = props.children;
        return typeof kids === "string" ? (
          <View
            style={look.style}
            hoverStyle={look.hoverStyle}
            activeStyle={look.activeStyle}
            focusVisibleStyle={look.focusVisibleStyle}
            disabledStyle={look.disabledStyle}
          >
            <AsText style={buttonLabel(variant, options)}>{kids}</AsText>
          </View>
        ) : (
          kids
        );
      })()}
    </BaseMenuButton>
  );
}

// Shared menu primitives

/**
 * Whether a menu is a popup at its trigger, as `nsh/base` presents it: on
 * the desktops, and on an iPad while its window is regular in width (UIKit's
 * horizontal size class); a sheet elsewhere. Read it in a getter or a
 * binding: an iPad's window can be resized across it.
 */
export function menuIsPopup(): boolean {
  return (
    pointer ||
    (platform.os === "ios" &&
      platform.idiom === "pad" &&
      !platform.catalyst &&
      horizontalSizeClass() === "regular")
  );
}

/**
 * A menu row's least height and type, from the theme in use: the height step under a row
 * (`controlHeight.md`), the label a type role (`body`), a note the next one down (`detail`), a
 * leading icon the theme's middle icon.
 */
export const menuItemSize: MenuItemDimensions = {
  get height() {
    return controlHeight.md;
  },
  get font() {
    return font.size("body");
  },
  get note() {
    return font.size("detail");
  },
  get icon() {
    return iconSize.md;
  },
};

/** A row under the pointer or the keyboard (`hoverStyle`, `focusStyle`): a
 * flat neutral fill, the theme's `accent`. */
export const menuHighlight = (): ViewStyle => ({ backgroundColor: token("accent") });

/**
 * A menu row's props (spread them on `nsh/base`'s `MenuItem`, or on a
 * `Submenu`'s trigger): a row 8 points apart, at least the height step under a row
 * (`menuItemSize`), its text the theme's
 * `pad` in from its fill, its corners concentric with the popup's (`itemRadius`). A row grows to
 * its content: a note on a line under its label (`menuItemNote`) takes the room it needs, and
 * the rows keep `rowVerticalPad` apart. Under the pointer and under the keyboard alike it takes
 * the neutral `accent` fill (`menuHighlight`), so arrow keys show where
 * they are; pressed, a shade deeper; disabled, 50%. Its label takes
 * `menuItemLabel`, a note `menuItemNote`, an icon `menuItemGlyph`.
 */
export function menuItemLook(o?: MenuItemLookOptions) {
  return {
    get style(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: ROW_GAP,
        minHeight: menuItemSize.height,
        paddingVertical: rowVerticalPad(),
        paddingHorizontal: itemSpacing.pad,
        ...(o?.inset ? { paddingStart: itemSpacing.pad + markRoom() } : {}),
        ...rounded(itemRadius()),
        ...o?.style,
      };
    },
    get hoverStyle(): ViewStyle {
      return menuHighlight();
    },
    get focusStyle(): ViewStyle {
      return menuHighlight();
    },
    get activeStyle(): ViewStyle {
      return menuPressed();
    },
    get disabledStyle(): ViewStyle {
      return { opacity: feedback.disabled.contentOpacity };
    },
  };
}

/** A menu row's label: the theme's `body` type role, on one line, taking the row's free width. */
export function menuItemLabel(o?: MenuItemTextOptions): TextStyle {
  return {
    numberOfLines: 1,
    flexGrow: 1,
    flexShrink: 0,
    fontSize: menuItemSize.font,
    color: o?.variant === "destructive" ? colors.destructive : colors.foreground,
  };
}

/** A menu row's note at its trailing edge (a shortcut, a value): the theme's `detail` type role, faint (the danger tone on a destructive row). */
export function menuItemNote(o?: MenuItemTextOptions): TextStyle {
  return {
    fontSize: menuItemSize.note,
    color: o?.variant === "destructive" ? colors.destructive : colors.faint,
  };
}

/** A menu row's leading icon (`<Icon {...menuItemGlyph()} />`): the theme's middle icon, muted (the danger tone for a destructive item). */
export function menuItemGlyph(o?: MenuItemTextOptions) {
  return {
    size: menuItemSize.icon,
    get tint() {
      return o?.variant === "destructive" ? colors.destructive : colors.mutedForeground;
    },
  };
}

/**
 * What a menu takes besides its items (spread it on a `Menu` or a
 * `ContextMenu`; its submenus' popups take the same): as a popup
 * (`menuIsPopup`) the popup surface every menu shares (`popupSurface`), at
 * least `minWidth` across, coming in from the trigger's `side`
 * (`popInStyles`: a fade, 96% to full size, 4 points of slide, 150 ms); as
 * a sheet the one that slides up, the card's surface with its top corners
 * on the card's radius and 34 points under its rows for the home indicator; the
 * scrim behind the sheet. The surface is the popup's own box: `nsh/base`
 * holds it to the room on its side and scrolls the items inside it, so its
 * edges and shadow stay put. Its values are getters, so they follow the
 * appearance.
 */
export function menuPopup(o?: MenuPopupOptions) {
  return {
    get popupStyle(): ViewStyle {
      return menuIsPopup()
        ? {
            ...popupSurface(),
            ...listPadding(),
            minWidth: o?.minWidth ?? 200,
            ...popInStyles(o?.side).style,
          }
        : {
            backgroundColor: colors.card,
            borderTopLeftRadius: shape.modal,
            borderTopRightRadius: shape.modal,
            ...cornerCurve,
            ...listPadding(),
            paddingBottom: 34,
          };
    },
    get popupStartingStyle(): ViewStyle | undefined {
      return menuIsPopup() ? popInStyles(o?.side).starting : undefined;
    },
    get backdropStyle(): ViewStyle {
      return backdrop();
    },
  };
}

/** A separator between a menu's groups (`<MenuSeparator style={menuSeparator()} />`): a groove, a hairline with a lip of light under it (`surface("inset")`). */
export function menuSeparator(): ViewStyle {
  return {
    height: stroke.hairline,
    marginTop: 4,
    marginBottom: 5,
    marginHorizontal: itemSpacing.inset,
    backgroundColor: colors.line,
    boxShadow: surface("inset").style.boxShadow,
  };
}

// Private helpers

const pointer = platform.desktop;

/** The horizontal gap between a row's mark/icon, label and trailing note. */
const ROW_GAP = 8;

/** The room a checkable row's mark takes before its label: the mark and the row's gap. An `inset`
 * row starts its label that much further in, so it lines up with the checkable rows. */
const markRoom = () => menuItemSize.icon + ROW_GAP;

/** A row pressed (`activeStyle`): the theme's press wash over the highlight, and on a theme
 * without one, a shade deeper than the highlight. */
const menuPressed = (): ViewStyle => {
  if (feedback.pressOverlay > 0) return feedback.press("surface").activeStyle;
  return { backgroundColor: alpha(colors.foreground, 0.1) };
};

/** How far a submenu's row dims while it takes no presses: deeper than a
 * disabled row's 50%, since the row itself is the trigger. */
const submenuRowDim = 0.35;

/** The side of a submenu row's chevron: 12 points with a pointer, 14 on a touch screen. */
const submenuChevron = pointer ? 12 : 14;

/** A submenu's row, whether `SubmenuRow` drew it or a `MenuSubTrigger`'s own
 * children: `menuItemLook`'s row and its states, dimmed while it takes no presses. */
function SubmenuRowFrame(
  props: Omit<ViewProps, "children"> & {
    disabled?: boolean;
    inset?: boolean;
    children?: JSX.Element;
  },
) {
  const [, rest] = split(props, ["disabled", "inset", "style", "children"]);
  const look = menuItemLook({ inset: props.inset });
  return (
    <View
      {...rest}
      // The row is the submenu's trigger: disabled it takes no presses, and `disabledStyle` dims
      // it deeper than an item (`nsh` leaves the pointer and keyboard styles off while disabled).
      disabled={props.disabled}
      hoverStyle={[look.hoverStyle, props.hoverStyle ?? null]}
      focusStyle={[look.focusStyle, props.focusStyle ?? null]}
      activeStyle={[look.activeStyle, props.activeStyle ?? null]}
      disabledStyle={[{ opacity: submenuRowDim }, props.disabledStyle ?? null]}
      style={[look.style, props.style ?? null]}
    >
      {props.children ?? <View />}
    </View>
  );
}

type MenuContextValue = OpenState & {
  trigger: Slot<JSX.Element>;
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
  trigger: Slot<JSX.Element>;
  label: { value?: string };
  disabled?: boolean;
};
const SubContext = context<SubContextValue | null>(null);
