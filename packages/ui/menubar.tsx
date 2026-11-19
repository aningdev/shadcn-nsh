// A menubar: a row of menus whose triggers stand in one bar, as a desktop app's menu bar. The
// rows, submenus and popups are `menu.tsx`'s; this file is the bar, its triggers and the shell.
// This library's own: nothing comes from upstream, so there is no port region. Yours to change.
import { colors, focusRing, radius, rounded } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, platform, split, Text, View } from "nsh";
import { Menu as BaseMenu, type MenuProps as BaseMenuProps, type OpenChangeReason } from "nsh/base";

import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";
import type { PopupSide } from "./lib/popup";
import { menuHighlight, menuItemSize, menuPopup } from "./menu";

const pointer = platform.desktop;

/** A bar's height, its padding and the gap between its triggers, and a trigger's height: with a
 * pointer a 36-point bar around 26-point triggers (shadcn's `h-9` and `h-7`), on a touch screen 50
 * and 40, a finger's target. */
const menubarSize = pointer
  ? { height: 36, padding: 4, gap: 4, trigger: 26 }
  : { height: 50, padding: 4, gap: 6, trigger: 40 };

/** A trigger's inset from its sides (shadcn's `px-2`). */
const triggerPad = 8;

/** The gap inside a trigger, between a lead icon and its name (shadcn's `gap-1.5`). */
const triggerGap = 6;

/** How far a press dims a trigger: a menu row's press shows a deeper fill, a bar's trigger
 * (which floats on the bar's fill) a shade of its own. */
const pressDim = 0.7;

/** A menubar's parts as the styles they wear: spread each one on the part it names. */
export interface MenubarLook {
  /** The bar (`Menubar`): a row of triggers, its height and its 1-point edge, the card's fill. */
  readonly bar: ViewStyle;
  /** A trigger (`MenubarTrigger`): one line, its corners of `menuItemSize`. */
  readonly trigger: ViewStyle;
  /** A trigger's name: the menu rows' type. */
  readonly triggerText: TextStyle;
}

/**
 * A menubar's look, after shadcn/ui's: a 36-point bar (50 on a touch screen) around its triggers,
 * inside a 1-point edge, in the card's fill, at the theme's control corners; a trigger as tall as a
 * menu row (`menuItemSize`), its name in the menu's type, its corners and 8 points either side.
 */
export function menubarLook(): MenubarLook {
  return {
    get bar(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: menubarSize.gap,
        height: menubarSize.height,
        paddingHorizontal: menubarSize.padding,
        ...rounded(radius.control),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      };
    },
    get trigger(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: triggerGap,
        height: menubarSize.trigger,
        paddingHorizontal: triggerPad,
        ...rounded(menuItemSize.radius),
      };
    },
    get triggerText(): TextStyle {
      return {
        fontSize: menuItemSize.font,
        fontWeight: "500",
        color: colors.foreground,
        numberOfLines: 1,
      };
    },
  };
}

/** Options of `menubarTriggerLook`. */
export interface MenubarTriggerLookOptions {
  /** Its menu is open: the trigger wears the chosen fill. */
  open?: Live<boolean>;
  /** No presses, no hover, 50%. */
  disabled?: Live<boolean>;
}

/**
 * A trigger's look: the bar's trigger (`menubarLook().trigger`) with the states that show it — the
 * neutral `accent` fill while its menu is open or the pointer is over it, a press's dimming, the
 * theme's focus ring with the keyboard on it, 50% while disabled.
 */
export function menubarTriggerLook(o?: MenubarTriggerLookOptions) {
  const open = () => !!read(o?.open);
  const disabled = () => !!read(o?.disabled);
  return {
    get style(): ViewStyle {
      return {
        ...menubarLook().trigger,
        ...(open() ? menuHighlight() : {}),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      return disabled() || open() ? undefined : menuHighlight();
    },
    get activeStyle(): ViewStyle | undefined {
      return disabled() ? undefined : { opacity: pressDim };
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
    disabledStyle: { opacity: 0.5 },
  };
}

/** The bar. It holds the menus and nothing else, and places nothing itself. */
export type MenubarProps = {
  children?: JSX.Element;
  style?: StyleProp<ViewStyle>;
};

/** Why a menu of the bar closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type MenubarOpenChangeReason = OpenChangeReason;

/**
 * One menu of the bar: its own open state (the app may own it with `open`), its trigger and its
 * popup. Every reason `nsh/base` gives for opening or closing passes through `onOpenChange`.
 */
export type MenubarMenuProps = {
  /** Controlled; leave it out and the menu keeps the state (`defaultOpen`). */
  open?: boolean | null;
  defaultOpen?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: MenubarOpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The popup. Every prop of `nsh/base`'s Menu passes through but the ones the root owns;
 * `popupStyle` / `backdropStyle` / starting styles go over `menuPopup`. Defaults: placement
 * `bottom`, align `start`, offset `8` (shadcn's `sideOffset`, a bar's trigger standing in its bar).
 */
export type MenubarContentProps = Omit<
  BaseMenuProps,
  "trigger" | "open" | "defaultOpen" | "onOpenChange" | "onOpen" | "onClose" | "onCancel"
> & {
  children?: JSX.Element;
};

/**
 * A trigger in the bar. A string is its name, drawn in the bar's type; anything else (an icon and a
 * name) is drawn as given. It wears the chosen fill while its menu is open, and takes no presses
 * while disabled.
 */
export type MenubarTriggerProps = {
  children?: string | JSX.Element;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

type MenubarMenuContextValue = OpenState & {
  trigger: Slot<JSX.Element>;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

const MenubarMenuContext = context<MenubarMenuContextValue | null>(null);

function useMenubarMenu() {
  const ctx = MenubarMenuContext();
  if (!ctx) throw new Error("Menubar parts must be used within <MenubarMenu>");
  return ctx;
}

/** The bar: a row of menus, each its trigger and its popup. */
export function Menubar(props: MenubarProps) {
  return (
    <View role="menubar" style={[menubarLook().bar, props.style ?? null]}>
      {props.children}
    </View>
  );
}

/** One menu of the bar: it owns whether it is open, and the trigger slot. */
export function MenubarMenu(props: MenubarMenuProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const triggerSlot = createSlot<JSX.Element>();
  return (
    <MenubarMenuContext.Provider
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
    </MenubarMenuContext.Provider>
  );
}

/**
 * A menu's name in the bar. It registers itself with `MenubarContent`, which draws it inside the
 * menu, so a bar's triggers are laid out by the bar and no popup sits between them.
 */
export function MenubarTrigger(props: MenubarTriggerProps) {
  const ctx = useMenubarMenu();
  ctx.trigger.set(() => {
    const look = menubarTriggerLook({ open: ctx.open, disabled: () => !!props.disabled });
    return (
      <View
        accessible
        role="menuitem"
        disabled={props.disabled}
        accessibilityState={{ disabled: props.disabled }}
        style={[look.style, props.style ?? null]}
        hoverStyle={look.hoverStyle ?? null}
        activeStyle={look.activeStyle ?? null}
        focusVisibleStyle={look.focusVisibleStyle}
        disabledStyle={look.disabledStyle}
      >
        {typeof props.children === "string" ? (
          <Text style={menubarLook().triggerText}>{props.children}</Text>
        ) : (
          props.children
        )}
      </View>
    );
  });
  // No layout node of its own: the trigger is drawn by the menu, between the bar's items only once.
  return null;
}

/** A menu's popup, over the shared menu surface, 8 points under its trigger. */
export function MenubarContent(props: MenubarContentProps) {
  const ctx = useMenubarMenu();
  const triggerAccessor = ctx.trigger.get();
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
      trigger={triggerAccessor?.() ?? <View />}
      placement={props.placement ?? "bottom"}
      align={props.align ?? "start"}
      offset={props.offset ?? 8}
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

/**
 * A menu's rows, its groups, its submenus and its notes are the menu's own: `menu.tsx` draws them
 * for a menubar too, so a row of a bar wears what a row of a menu wears.
 */
export {
  MenuCheckboxItem as MenubarCheckboxItem,
  MenuGroup as MenubarGroup,
  MenuItem as MenubarItem,
  MenuLabel as MenubarLabel,
  MenuRadioItem as MenubarRadioItem,
  MenuSeparator as MenubarSeparator,
  MenuShortcut as MenubarShortcut,
  MenuSub as MenubarSub,
  MenuSubContent as MenubarSubContent,
  MenuSubTrigger as MenubarSubTrigger,
  type MenuCheckboxItemProps as MenubarCheckboxItemProps,
  type MenuGroupProps as MenubarGroupProps,
  type MenuItemProps as MenubarItemProps,
  type MenuItemVariant as MenubarItemVariant,
  type MenuLabelProps as MenubarLabelProps,
  type MenuRadioItemProps as MenubarRadioItemProps,
  type MenuSeparatorProps as MenubarSeparatorProps,
  type MenuShortcutProps as MenubarShortcutProps,
  type MenuSubContentProps as MenubarSubContentProps,
  type MenuSubProps as MenubarSubProps,
  type MenuSubTriggerProps as MenubarSubTriggerProps,
} from "./menu";
import { type Live, read } from "./lib/utils";
