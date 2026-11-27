// A menubar: a row of menus whose triggers stand in one bar, as a desktop app's menu bar. The
// rows, submenus and popups are `menu.tsx`'s; this file is the bar, its triggers and the shell.

import {
  colors,
  control,
  controlHeight,
  feedback,
  rounded,
  font,
  shape,
  surfaceBorderWidth,
  tier,
} from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, split, View } from "nsh";
import { Menu as BaseMenu, type MenuProps as BaseMenuProps, type OpenChangeReason } from "nsh/base";

import type { PopupSide } from "./lib/popup";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/state";
import { AsText, joinClass } from "./lib/utils";
import { menuHighlight, menuItemSize, menuPopup } from "./menu";

/**
 * The bar. It holds the menus and nothing else, and places nothing itself; every view prop
 * (`class`, `classList`, `style`, `testID`) is spread on the bar's row after its own.
 */
export type MenubarProps = ViewProps;

/** Why a menu of the bar closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type MenubarOpenChangeReason = OpenChangeReason;

/**
 * One menu of the bar: its own open state (the app may own it with `open`), its trigger and its
 * popup. Every reason `nsh/base` gives for opening or closing passes through `onOpenChange`.
 * It draws no view of its own.
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
export type MenubarTriggerProps = Omit<ViewProps, "children"> & {
  /** A string is the name, drawn in the bar's type; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/** The bar: a row of menus, each its trigger and its popup. */
export function Menubar(props: MenubarProps) {
  const [, rest] = split(props, ["style", "class", "classList", "children", "role"]);
  return (
    <View
      {...rest}
      role="menubar"
      class={joinClass(undefined, props.class)}
      classList={props.classList}
      style={[menubarLook().bar, props.style ?? null]}
    >
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
  const [, rest] = split(props, [
    "children",
    "disabled",
    "style",
    "class",
    "classList",
    "hoverStyle",
    "activeStyle",
    "expandedStyle",
    "focusVisibleStyle",
    "disabledStyle",
  ]);
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the menu without building it again on
  // every layout. Its children are read where they are drawn, below, so a child that reads a
  // signal stays live.
  const look = menubarTriggerLook();
  ctx.trigger.set(
    <View
      {...rest}
      accessible
      role="menuitem"
      disabled={props.disabled}
      class={joinClass(undefined, props.class)}
      classList={props.classList}
      accessibilityState={{ disabled: props.disabled }}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle, props.hoverStyle ?? null]}
      activeStyle={[look.activeStyle, props.activeStyle ?? null]}
      expandedStyle={[look.expandedStyle, props.expandedStyle ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
    >
      <AsText style={menubarLook().triggerText}>{props.children}</AsText>
    </View>,
  );
  // No layout node of its own: the trigger is drawn by the menu, between the bar's items only once.
  return null;
}

/** A menu's popup, over the shared menu surface, 8 points under its trigger. */
export function MenubarContent(props: MenubarContentProps) {
  const ctx = useMenubarMenu();
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

// Private helpers

const pointer = tier === "pointer";

/** The room around a bar's triggers, and the gap between them (shadcn's `p-1` and `gap-1`): 4
 * points either way, 6 between on a touch screen. The theme's spacing has no step this small. */
const barPadding = 4;
const barGap = pointer ? 4 : 6;

/** A trigger's height: the theme's height step under a row (shadcn's `h-7`). */
const triggerHeight = () => controlHeight.md;

/** A trigger's inset from its sides (shadcn's `px-2`). */
const triggerPad = 8;

/** The gap inside a trigger, between a lead icon and its name (shadcn's `gap-1.5`). */
const triggerGap = 6;

/** A menubar's parts as the styles they wear: spread each one on the part it names. */
interface MenubarLook {
  /** The bar (`Menubar`): a row of triggers, its height and its 1-point edge, the card's fill. */
  readonly bar: ViewStyle;
  /** A trigger (`MenubarTrigger`): one line, at the theme's control corners. */
  readonly trigger: ViewStyle;
  /** A trigger's name: the menu rows' type. */
  readonly triggerText: TextStyle;
}

/**
 * A menubar's look, after shadcn/ui's: a bar a step over its triggers, inside a 1-point edge, in the
 * card's fill, at the theme's control corners; a trigger the theme's height step under a row, its
 * name in the menu's type, the control corners and 8 points either side.
 */
function menubarLook(): MenubarLook {
  return {
    get bar(): ViewStyle {
      const bar = control("menubar");
      if (bar.bar === "none") {
        return {
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          gap: barGap,
          height: triggerHeight(),
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      }
      const layer = bar.style;
      const edge = typeof layer.borderColor === "string" ? layer.borderColor : undefined;
      const bw = surfaceBorderWidth(edge);
      return {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: barGap,
        height: triggerHeight() + 2 * barPadding + 2 * bw,
        paddingHorizontal: barPadding,
        ...rounded(shape.control),
        borderWidth: bw,
        borderColor: edge,
        backgroundColor: layer.backgroundColor,
        boxShadow: layer.boxShadow,
      };
    },
    get trigger(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: triggerGap,
        height: triggerHeight(),
        paddingHorizontal: triggerPad,
        ...rounded(shape.control),
      };
    },
    get triggerText(): TextStyle {
      return {
        fontSize: menuItemSize.font,
        fontWeight: font.weight("label"),
        color: colors.foreground,
        numberOfLines: 1,
      };
    },
  };
}

/**
 * A trigger's look: the bar's trigger (`menubarLook().trigger`) with the states that show it — the
 * neutral `accent` fill while its menu is open (`expandedStyle`, from the trigger's own `expanded`
 * state) or the pointer is over it, a press's dimming, the theme's focus ring with the keyboard on
 * it, 50% while disabled (`disabledStyle`).
 */
function menubarTriggerLook() {
  return {
    get style(): ViewStyle {
      return menubarLook().trigger;
    },
    get hoverStyle(): ViewStyle {
      return menuHighlight();
    },
    get activeStyle(): ViewStyle {
      return { opacity: feedback.passive.pressedOpacity };
    },
    get expandedStyle(): ViewStyle {
      return menuHighlight();
    },
    get focusVisibleStyle(): ViewStyle {
      return feedback.focusRing();
    },
    get disabledStyle(): ViewStyle {
      return { opacity: feedback.disabled.contentOpacity };
    },
  };
}

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
