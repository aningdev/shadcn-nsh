// A navigation menu: a row of triggers, each opening a panel of anything (a grid of links, a card
// with a description) under itself, one panel open at a time.

import {
  alpha,
  colors,
  focusRing,
  rounded,
  font,
  shape,
  dimmed,
  stateLayer,
  style as themeStyle,
} from "@shadcn-nsh/theme";
import { ChevronDown } from "lucide";
import type { AndroidProps, JSX, StyleProp, TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, platform, reduceMotion, signal, split, token, View } from "nsh";
import {
  Link as BaseLink,
  type LinkProps as BaseLinkProps,
  Popover as BasePopover,
  type PopoverProps as BasePopoverProps,
  type OpenChangeReason,
} from "nsh/base";

import { AsText } from "./lib/as-text";
import { Icon } from "./lib/icons";
import { type Live, read } from "./lib/live-value";
import { createSlot, type Slot } from "./lib/open-state";
import { itemSpacing, PopIn, popupSurface, type PopupSide } from "./lib/popup";
import { pressHostProps, pressRipple, pressSink, pressTransition } from "./lib/press";

/** A pointer's compact bar; a touch screen's roomier one, a finger's target in every trigger. */
const pointer = platform.desktop;

/**
 * A bar's measurements: a trigger's height, its inset from its sides, the gap between triggers,
 * the room inside a panel, and the side of a trigger's chevron. With a pointer a 36-point trigger
 * 16 points in (shadcn's `h-9 px-4`) with a 14-point chevron; on a touch screen a 44-point
 * trigger, a finger's target, and a 16-point chevron.
 */
export const navigationMenuSize = pointer
  ? { trigger: 36, padding: 16, gap: 4, panel: 10, chevron: 14 }
  : { trigger: 44, padding: 16, gap: 6, panel: 12, chevron: 16 };

/** The gap inside a trigger, between its name and its chevron (shadcn's `ml-1`). */
const chevronGap = 4;

/** How long a trigger's chevron takes to turn (200 ms): at once with reduced motion. */
const chevronTurn = 200;

/** How far a press sinks a trigger or a link: a big region, as a pressable's (98%). */
const sink = 0.98;

/**
 * The fill of what the pointer or the keyboard is on (a trigger, a link): the theme's neutral
 * `accent`, the fill every popup row wears in this library (`menuHighlight`) — written out here so
 * a navigation menu does not bring the menu's component with it.
 */
const highlight = (): ViewStyle => ({ backgroundColor: token("accent") });

/**
 * The fill of what is chosen (the open trigger, the link of the page shown): the same `accent` at
 * half (shadcn's `bg-accent/50`), so a pointer over it still shows the full fill.
 */
const chosen = (): ViewStyle => ({ backgroundColor: alpha(token("accent"), 0.5) });

/** A navigation menu's parts as the styles they wear: spread each one on the part it names. */
export interface NavigationMenuLook {
  /** The bar (`NavigationMenu`): a row in the width the app gives it. */
  readonly root: ViewStyle;
  /** Its list (`NavigationMenuList`): the triggers a gap apart, wrapping when the window is
   * narrow. */
  readonly list: ViewStyle;
  /** One item (`NavigationMenuItem`): its trigger or its link, and nothing else. */
  readonly item: ViewStyle;
  /** A panel (`NavigationMenuContent`): the surface every popup shares (`popupSurface`: the
   * theme's `radius` corners, one edge, the menu tier's soft shadow) with `navigationMenuSize`'s
   * room inside. */
  readonly panel: ViewStyle;
  /** A link (`NavigationMenuLink`): a column, so a description can sit under its name. */
  readonly link: ViewStyle;
  /** A link's name: the `body` type, in the text color, on one line. */
  readonly linkText: TextStyle;
  /** A link's description (`NavigationMenuLink`'s nested text): the muted ink, the `body` type under
   * the name's. */
  readonly linkHint: TextStyle;
}

/**
 * A navigation menu's look, after shadcn/ui's: the bar a row of triggers 4 points apart (6 on a
 * touch screen) wrapping in a narrow window; a panel on the popup surface with 10 points of room
 * inside (12 on a touch screen); a link a 4-point column 8 points in, its corners of the theme's
 * control radius. Colors are read here, so the look follows the appearance and the theme.
 */
export function navigationMenuLook(): NavigationMenuLook {
  return {
    get root(): ViewStyle {
      return { flexDirection: "row", alignItems: "center", maxWidth: "100%" };
    },
    get list(): ViewStyle {
      return {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        flexShrink: 1,
        gap: navigationMenuSize.gap,
      };
    },
    get item(): ViewStyle {
      return { flexDirection: "row", alignItems: "center" };
    },
    get panel(): ViewStyle {
      return { ...popupSurface(), padding: navigationMenuSize.panel };
    },
    get link(): ViewStyle {
      return {
        flexDirection: "column",
        gap: 4,
        // A link's fill to its text: the list rows' `pad`.
        padding: itemSpacing.pad,
        ...rounded(shape.control),
      };
    },
    get linkText(): TextStyle {
      return {
        fontSize: font.size("body"),
        fontWeight: font.weight("label"),
        color: colors.foreground,
        numberOfLines: 1,
      };
    },
    get linkHint(): TextStyle {
      return {
        fontSize: font.size("body"),
        fontWeight: font.weight("body"),
        color: colors.mutedForeground,
        numberOfLines: 2,
      };
    },
  };
}

/** Options of `navigationMenuTriggerLook`. */
export interface NavigationMenuTriggerLookOptions {
  /** Its panel is open: the chosen fill under it, and its chevron turned. */
  open?: Live<boolean>;
}

/**
 * A trigger's look: 36 points tall with a pointer (44 on a touch screen), `navigationMenuSize`'s
 * inset either side, its name the `body` type medium and a chevron after it which turns 180° while its
 * panel is open (at once with reduced motion, in 200 ms otherwise). At rest it is bare; the chosen
 * `accent` fill sits under it while its panel is open, and the full `accent` under the pointer, the
 * theme's focus ring with the keyboard on it, a press's dimming, 50% while disabled.
 *
 * The open fill is in `style`, not `expandedStyle`: nsh ranks `expanded` above `hover`, and the
 * pointer over an open trigger shows the full fill (shadcn's `data-open:hover:bg-accent`).
 */
export function navigationMenuTriggerLook(o?: NavigationMenuTriggerLookOptions) {
  const open = () => !!read(o?.open);
  return {
    get style(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: chevronGap,
        height: navigationMenuSize.trigger,
        paddingHorizontal: navigationMenuSize.padding,
        ...rounded(shape.control),
        ...(open() ? chosen() : { backgroundColor: "transparent" }),
        ...pressTransition("background-color"),
      };
    },
    get hoverStyle(): ViewStyle {
      return highlight();
    },
    get activeStyle(): ViewStyle {
      if (themeStyle().state.overlay.pressed > 0) {
        return { ...stateLayer("pressed"), ...pressSink(sink).activeStyle };
      }
      return pressSink(sink).activeStyle;
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
    get disabledStyle(): ViewStyle {
      return { opacity: dimmed.disabled };
    },
    get android(): AndroidProps | undefined {
      return pressRipple("foreground");
    },
    /** Its name's type: the `body` type, medium, one line. */
    get text(): TextStyle {
      return {
        fontSize: font.size("body"),
        fontWeight: font.weight("label"),
        color: colors.foreground,
        numberOfLines: 1,
      };
    },
    /** The chevron's box, turned while the panel is open; the motion is the appearance's. */
    get chevron(): ViewStyle {
      const still = reduceMotion();
      return {
        alignItems: "center",
        justifyContent: "center",
        rotate: open() ? "180deg" : "0deg",
        ...(still ? {} : { transitionProperty: "rotate", transitionDuration: chevronTurn }),
      };
    },
    /** The chevron itself: `navigationMenuSize.chevron` across, in the muted ink. */
    get chevronIcon(): { size: number; tint: string } {
      return { size: navigationMenuSize.chevron, tint: colors.mutedForeground };
    },
  };
}

/** Options of `navigationMenuLinkLook`. */
export interface NavigationMenuLinkLookOptions {
  /** The page the app is on: the chosen fill under it. */
  active?: Live<boolean>;
  /** No presses, no hover, 50%. */
  disabled?: Live<boolean>;
}

/**
 * A link's look, after shadcn/ui's: a 4-point column 8 points in, at the theme's control corners,
 * its name the `body` type medium and its description under it in the muted ink; the full `accent`
 * under the pointer, the chosen `accent` under the page the app is on, the theme's focus ring with
 * the keyboard on it, a press's dimming, 50% while disabled.
 */
export function navigationMenuLinkLook(o?: NavigationMenuLinkLookOptions) {
  const active = () => !!read(o?.active);
  const disabled = () => !!read(o?.disabled);
  return {
    get style(): ViewStyle {
      return {
        ...navigationMenuLook().link,
        ...(active() ? chosen() : {}),
        ...pressTransition("background-color"),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      return disabled() ? undefined : highlight();
    },
    get activeStyle(): ViewStyle | undefined {
      if (disabled()) return undefined;
      if (themeStyle().state.overlay.pressed > 0) {
        return { ...stateLayer("pressed"), ...pressSink(sink).activeStyle };
      }
      return pressSink(sink).activeStyle;
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
    get disabledStyle(): ViewStyle {
      return { opacity: dimmed.disabled };
    },
    get android(): AndroidProps | undefined {
      return pressRipple("foreground", o?.disabled);
    },
    /** Its name's type: `navigationMenuLook().linkText`. */
    get text(): TextStyle {
      return navigationMenuLook().linkText;
    },
    /** Its description's type: `navigationMenuLook().linkHint`. */
    get hint(): TextStyle {
      return navigationMenuLook().linkHint;
    },
  };
}

/** Why the bar's open item changed (`onValueChange`'s `reason`): `nsh/base`'s `OpenChangeReason`,
 * under this part's name. */
export type NavigationMenuOpenChangeReason = OpenChangeReason;

/**
 * The root: it owns which item's panel is open — one at a time — and the delays the pointer's rest
 * waits. Every `nsh` view prop passes through (`style`, `role`, `accessibilityLabel`, …); `style`
 * goes over the look's.
 */
export type NavigationMenuProps = ViewProps & {
  /** The open item's `value` (controlled); `null` closes it. Leave it out and the root keeps the
   * state (`defaultValue`). */
  value?: string | null;
  /** The item open at first, while `value` is not set. */
  defaultValue?: string | null;
  /** Another item opened (`value`), or the open one closed (`null`), with why: `"triggerPress"`, a
   * press outside, `"cancel"` (Escape, back) — or `"hover"`, the pointer's rest. */
  onValueChange?: (event: { value: string | null; reason: NavigationMenuOpenChangeReason }) => void;
  /** Milliseconds the pointer rests on a trigger before its panel opens (default 200).
   * `Infinity`: only a press or the keyboard opens it. */
  delayDuration?: number;
  /** Milliseconds the pointer is away from both the trigger and its panel before the panel closes
   * (default 300): time to move from one to the other. `Infinity`: only Escape, a press outside, a
   * press on the trigger or the app close it. */
  closeDelay?: number;
};

/**
 * One item of the bar: its `value` (what the root opens), its trigger and its panel, or a link of
 * its own. The trigger is drawn by the item's `NavigationMenuContent` — the popup places it — so a
 * trigger declared after its content would draw nothing.
 */
export type NavigationMenuItemProps = {
  /** What names this item to the root: the open item's `value`. Made up when left out. */
  value?: string;
  children?: JSX.Element;
  style?: StyleProp<ViewStyle>;
};

/** The bar's list: a wrapping row of items. Every `nsh` view prop passes through; `style` goes
 * over the look's. */
export type NavigationMenuListProps = ViewProps;

/**
 * A trigger: a string is its name, drawn in the bar's type with a chevron after it; anything else
 * is drawn as given (a chevron follows it all the same). It wears the chosen fill while its panel
 * is open, opens it by a press (Return or Space with the keyboard on it) and, on the desktops, by
 * the pointer's rest.
 */
export type NavigationMenuTriggerProps = {
  children?: string | JSX.Element;
  /** No presses, no hover, 50%: its panel does not open. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A panel under its trigger. Every prop of `nsh/base`'s Popover passes through but the ones the
 * item owns (`open`, the callbacks). Defaults: placement `bottom`, align `start`, offset `6`
 * (shadcn's `mt-1.5`), and it takes the pointer and the presses, so a grid of links in it works.
 */
export type NavigationMenuContentProps = Omit<
  BasePopoverProps,
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
  /** The panel's width; unset, as wide as its content. */
  width?: number;
};

/**
 * A link of its own, in the bar or in a panel: `nsh/base`'s Link in the navigation menu's look.
 * Every base Link prop passes through (`href`, `openWith`, `onOpen`, `onPress`, `disabled`, …), so
 * it goes somewhere or reports a press; a string child is its name. On the web a link with an
 * `href` does not show a hover of its own — `onPress` is what a demo reaches for.
 */
export type NavigationMenuLinkProps = Omit<BaseLinkProps, "children" | "current"> & {
  children?: string | JSX.Element;
  /** The page the app is on: the chosen fill under it, and announced as the current page (ARIA's
   * `aria-current="page"`). */
  active?: boolean;
};

type NavigationMenuContextValue = {
  /** The open item's value, `null` while none is. */
  value: () => string | null;
  /** Ask the root to open `next` (or nothing) for `reason`. */
  setValue: (next: string | null, reason: NavigationMenuOpenChangeReason) => void;
  /** Milliseconds the pointer rests on a trigger before its panel opens. */
  delayDuration: () => number;
  /** Milliseconds the pointer is away from both before the panel closes. */
  closeDelay: () => number;
};

type NavigationMenuItemContextValue = {
  /** This item's value, what the root opens. */
  value: string;
  /** The root has this item's panel open. */
  open: () => boolean;
  /** Ask the root to open this item, for `reason`. */
  openFor: (reason: NavigationMenuOpenChangeReason) => void;
  /** Close this item's panel, for `reason` (unless another item opened meanwhile). */
  close: (reason: NavigationMenuOpenChangeReason) => void;
  /** The pointer came onto (`over` true) or left (`false`) the trigger or the panel. */
  pointerOver: (part: "trigger" | "panel", over: boolean) => void;
  /** The trigger the content draws, filled by `NavigationMenuTrigger`. */
  trigger: Slot<JSX.Element>;
};

const NavigationMenuContext = context<NavigationMenuContextValue | null>(null);
const NavigationMenuItemContext = context<NavigationMenuItemContextValue | null>(null);

function useNavigationMenu() {
  const ctx = NavigationMenuContext();
  if (!ctx) throw new Error("NavigationMenu parts must be used within <NavigationMenu>");
  return ctx;
}

function useNavigationMenuItem() {
  const ctx = NavigationMenuItemContext();
  if (!ctx)
    throw new Error("NavigationMenuTrigger and NavigationMenuContent need a NavigationMenuItem");
  return ctx;
}

/** The items made up a value so far: a name no one else in the app has. */
let madeUpCount = 0;

/**
 * A navigation menu, after shadcn/ui's: a landmark (`role="navigation"`, named `"Navigation"` by
 * default) holding a list of items, each a trigger over a panel of any content or a link. One
 * panel is open at a time; on the desktops the pointer's rest opens one and the panel closes when
 * the pointer has left both its trigger and itself.
 *
 * What carries it: `nsh/base`'s Popover. A trigger here has to open its panel by a press in both
 * idioms and by the keyboard (its own words for Popover: the trigger takes the presses, Escape and
 * a press outside close it, and the keyboard focus in it comes back to the trigger), while `Menu`
 * is a list of rows that becomes a sheet on phones and `HoverCard` follows the pointer alone (the
 * keyboard focus opens and holds nothing). Popover's trigger is a plain element, so the pointer's
 * rest can open the panel too — the one thing it leaves out, which this file adds on
 * `onMouseEnter` / `onMouseLeave` with the two delays `nsh/base`'s HoverCard keeps (200 ms of rest
 * to open, 300 ms off both parts to close).
 */
export function NavigationMenu(props: NavigationMenuProps) {
  const [, rest] = split(props, [
    "value",
    "defaultValue",
    "onValueChange",
    "delayDuration",
    "closeDelay",
    "accessibilityLabel",
    "role",
    "style",
  ]);
  const own = signal<string | null>(props.defaultValue ?? null);
  const value = () => (props.value !== undefined ? props.value : own());
  return (
    <NavigationMenuContext.Provider
      value={{
        value,
        delayDuration: () => props.delayDuration ?? 200,
        closeDelay: () => props.closeDelay ?? 300,
        setValue: (next, reason) => {
          if (props.value === undefined) own.set(next);
          props.onValueChange?.({ value: next, reason });
        },
      }}
    >
      <View
        {...rest}
        role={props.role ?? "navigation"}
        accessibilityLabel={props.accessibilityLabel ?? "Navigation"}
        style={[navigationMenuLook().root, props.style ?? null]}
      >
        {props.children}
      </View>
    </NavigationMenuContext.Provider>
  );
}

/** The bar's items side by side, a gap apart, wrapping onto a second line when narrow. */
export function NavigationMenuList(props: NavigationMenuListProps) {
  const [, rest] = split(props, ["style"]);
  return (
    <View role="list" {...rest} style={[navigationMenuLook().list, props.style ?? null]}>
      {props.children}
    </View>
  );
}

/**
 * One item: it holds its value and its trigger, and the pointer's place over its trigger and its
 * panel, and it reads whether the root has it open.
 */
export function NavigationMenuItem(props: NavigationMenuItemProps) {
  const root = useNavigationMenu();
  const value = props.value ?? `navigation-menu-item-${madeUpCount++}`;
  const trigger = createSlot<JSX.Element>();
  // Where the pointer is (off both parts, the panel closes after `closeDelay`) and the one timer
  // waiting on its next move.
  const pointerState: {
    trigger: boolean;
    panel: boolean;
    timer?: ReturnType<typeof setTimeout>;
  } = { trigger: false, panel: false };
  const stop = () => {
    if (pointerState.timer !== undefined) {
      clearTimeout(pointerState.timer);
      pointerState.timer = undefined;
    }
  };
  const after = (ms: number, run: () => void) => {
    stop();
    // A delay that never ends: nothing to wait for, and nothing opens or closes by itself.
    if (!Number.isFinite(ms)) return;
    if (ms <= 0) {
      run();
      return;
    }
    pointerState.timer = setTimeout(() => {
      pointerState.timer = undefined;
      run();
    }, ms);
  };
  const isOpen = () => root.value() === value;
  const openFor = (reason: NavigationMenuOpenChangeReason) => {
    stop();
    // Already open (a press and the pointer's rest both asked): nothing to say twice.
    if (isOpen()) return;
    root.setValue(value, reason);
  };
  const close = (reason: NavigationMenuOpenChangeReason) => {
    stop();
    // The panel has gone from under the pointer: it holds nothing open now.
    pointerState.panel = false;
    // Another item opened meanwhile: the root's value is not this one's to clear.
    if (isOpen()) root.setValue(null, reason);
  };
  return (
    <NavigationMenuItemContext.Provider
      value={{
        value,
        open: isOpen,
        openFor,
        close,
        pointerOver: (part, over) => {
          pointerState[part] = over;
          // Touch screens have no pointer to rest: a press opens and closes there.
          if (!pointer) return;
          // A new place replaces whatever was waiting: the open's delay or the close's.
          stop();
          if (pointerState.trigger || pointerState.panel) {
            if (!isOpen()) after(root.delayDuration(), () => openFor("hover"));
            return;
          }
          if (isOpen()) after(root.closeDelay(), () => close("hover"));
        },
        trigger,
      }}
    >
      <View style={[navigationMenuLook().item, props.style ?? null]}>{props.children}</View>
    </NavigationMenuItemContext.Provider>
  );
}

/**
 * A trigger's name in the bar, drawn inside `NavigationMenuContent` (the popup places it), so it
 * takes no room of the item's own: declare it before the content.
 */
export function NavigationMenuTrigger(props: NavigationMenuTriggerProps) {
  const item = useNavigationMenuItem();
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the panel without building it again
  // on every layout. Its children are read where they are drawn, below, so a child that reads a
  // signal stays live.
  const look = navigationMenuTriggerLook({ open: item.open });
  item.trigger.set(
    <View
      accessible
      role="button"
      disabled={props.disabled}
      android={look.android}
      accessibilityState={{ disabled: props.disabled }}
      onMouseEnter={
        pointer && !props.disabled ? () => item.pointerOver("trigger", true) : undefined
      }
      onMouseLeave={pointer ? () => item.pointerOver("trigger", false) : undefined}
      style={[look.style, props.style ?? null]}
      hoverStyle={look.hoverStyle}
      activeStyle={look.activeStyle}
      focusVisibleStyle={look.focusVisibleStyle}
      disabledStyle={look.disabledStyle}
    >
      <AsText style={look.text}>{props.children}</AsText>
      <View
        style={look.chevron}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon icon={ChevronDown} size={look.chevronIcon.size} tint={look.chevronIcon.tint} />
      </View>
    </View>,
  );
  // No layout node of its own: the popup draws the trigger, once, between the bar's items.
  return null;
}

/**
 * An item's panel: `nsh/base`'s Popover under the trigger, on the popup surface. Its content comes
 * in on a `PopIn` each time it opens; the pointer over the panel holds it open while the pointer
 * crosses from the trigger.
 */
export function NavigationMenuContent(props: NavigationMenuContentProps) {
  const item = useNavigationMenuItem();
  const [, rest] = split(props, ["children", "width", "placement", "align", "offset"]);
  const placement = () => (props.placement ?? "bottom") as PopupSide;
  return (
    <BasePopover
      {...rest}
      open={item.open()}
      trigger={item.trigger.get() ?? <View />}
      placement={placement()}
      align={props.align ?? "start"}
      offset={props.offset ?? 6}
      onOpenChange={({ open, reason }) => {
        // The root owns which item is open: base's press on the trigger asks it here.
        if (open) item.openFor(reason);
        else item.close(reason);
      }}
    >
      {() => (
        <PopIn
          side={placement()}
          style={{
            ...navigationMenuLook().panel,
            ...(props.width !== undefined ? { width: props.width } : {}),
          }}
        >
          <View
            onMouseEnter={pointer ? () => item.pointerOver("panel", true) : undefined}
            onMouseLeave={pointer ? () => item.pointerOver("panel", false) : undefined}
          >
            {/* children-lint: the panel's contents, built when it opens, not before. */}
            {props.children}
          </View>
        </PopIn>
      )}
    </BasePopover>
  );
}

/**
 * The look's state style with the app's over it (the app wins), or the app's alone when the look
 * has none: what a part's `hoverStyle` and `activeStyle` say.
 */
function styleOver(
  own: StyleProp<ViewStyle> | undefined,
  given: StyleProp<ViewStyle> | undefined,
): StyleProp<ViewStyle> {
  return own === undefined ? (given ?? null) : [own, given ?? null];
}

/**
 * A link: it goes somewhere (`href`, `openWith`, `onOpen`) or reports a press (`onPress`), and it
 * wears the navigation menu's link look — a name and, under it, a description the app nests as its
 * own `Text` with `navigationMenuLook().linkHint`.
 */
export function NavigationMenuLink(props: NavigationMenuLinkProps) {
  const [, rest] = split(props, [
    "children",
    "active",
    "disabled",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
  ]);
  const look = () =>
    navigationMenuLinkLook({
      active: () => !!props.active,
      disabled: () => !!props.disabled,
    });
  return (
    <BaseLink
      {...rest}
      disabled={props.disabled}
      current={props.active}
      {...pressHostProps(() => look().android)}
      style={[look().style, props.style ?? null]}
      hoverStyle={styleOver(look().hoverStyle, props.hoverStyle)}
      activeStyle={styleOver(look().activeStyle, props.activeStyle)}
      focusVisibleStyle={[look().focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[look().disabledStyle, props.disabledStyle ?? null]}
    >
      <AsText style={look().text}>{props.children}</AsText>
    </BaseLink>
  );
}
