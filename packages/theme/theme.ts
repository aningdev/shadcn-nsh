import type { Tokens, ViewStyle } from "nsh";
import { colorScheme, reduceMotion, token } from "nsh";

import finishes from "./finishes.json";

/** Reactive getters over `theme.json` tokens. */
function tokens<K extends string>(names: Record<K, keyof Tokens>): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of Object.keys(names) as K[]) {
    Object.defineProperty(out, key, {
      enumerable: true,
      get: () => token(names[key]),
    });
  }
  return out;
}

export const colors = tokens({
  background: "background",
  foreground: "foreground",
  card: "card",
  cardForeground: "card-foreground",
  primary: "primary",
  primaryForeground: "primary-foreground",
  secondary: "secondary",
  secondaryForeground: "secondary-foreground",
  muted: "muted",
  mutedForeground: "muted-foreground",
  accent: "accent",
  accentForeground: "accent-foreground",
  destructive: "destructive",
  border: "border",
  input: "input",
  ring: "ring",
});

export const radius = {
  get control() {
    return token("radius");
  },
};

/** `color` at opacity `a` (0–1). NSH accepts `color-mix` with resolved colors, not `var(--*)`. */
export function alpha(color: string, a: number) {
  return `color-mix(in srgb, ${color} ${a * 100}%, transparent)`;
}

/** Keyboard focus ring for controls. */
export const focusRing = (offset = 0): ViewStyle => ({
  borderColor: colors.ring,
  outlineStyle: "solid",
  outlineWidth: 3,
  outlineColor: alpha(colors.ring, 0.35),
  outlineOffset: offset,
});

/** Surface depth: shadows (and optional edges). Fills stay on `colors.*`. */
export type Finish = {
  boxShadow: string;
  borderColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backdropFilter?: string;
};

/** Control states + overlay `menu` (popup-family one-shadow). */
export type FinishName = "card" | "raised" | "hover" | "pressed" | "on" | "accent" | "menu";

const isDark = () => colorScheme() !== "light";

function themedFinish<T extends object>(dark: T, light: T): T {
  const out = {} as T;
  for (const key of Object.keys(dark) as (keyof T)[]) {
    Object.defineProperty(out, key, {
      enumerable: true,
      get: () => (isDark() ? dark : light)[key],
    });
  }
  return out;
}

/**
 * Light/dark surface finishes from `finishes.json`.
 * Depth only — pair with `colors.*` for brand fills (not Gallery citrus swaps).
 */
export const finish = themedFinish<Record<FinishName, Finish>>(finishes.dark, finishes.light);

/** Overlay-family one-shadow (`finish.menu`). Prefer this over per-component `boxShadow`. */
export function overlayShadow(): ViewStyle {
  return { boxShadow: finish.menu.boxShadow };
}

/** Shared surface for popovers, menus, and select/combobox popups. */
export function popupSurface(): ViewStyle {
  return {
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 4,
    ...overlayShadow(),
  };
}

/** The dimming behind what is modal (dialogs, sheets, touch-screen pickers). */
export function popupBackdrop(): ViewStyle {
  return { backgroundColor: "color-mix(in srgb, black 40%, transparent)" };
}

/** Duration tokens (ms). Align press with NSH Design Guides / Gallery. */
export const duration = {
  press: 150,
} as const;

/** Easing tokens for short control transitions. */
export const easing = {
  press: "ease-out",
} as const;

/** Press / state easing shared by controls. */
export const pressEasing = {
  transitionDuration: duration.press,
  transitionTimingFunction: easing.press,
} satisfies ViewStyle;

/** Transition for press sink + optional CSS property names the states change. */
export function pressTransition(also?: string): ViewStyle {
  return {
    transitionProperty: also ? `${also}, transform` : "transform",
    ...pressEasing,
  };
}

/**
 * Press feedback: sink to `scale` while active (none with reduced motion).
 * Spread `activeStyle` into the control's `activeStyle` and `transition` into `style`.
 */
export function pressSink(scale = 0.97, also?: string) {
  return {
    get activeStyle(): ViewStyle {
      return reduceMotion() ? {} : { transform: [{ scale }] };
    },
    transition: pressTransition(also),
  };
}

/**
 * Popup entrance/exit, from the `nsh/base` element docs: popover.md
 * (`transition-all duration-150 ease-out` + `opacity-0 scale-95`), menu.md
 * (`duration-100` + `opacity-0 -translate-y-1`) and tooltip.md
 * (`transition-opacity duration-100` + `opacity-0`).
 *
 * `style` goes on the popup's own look (`style` / `popupStyle`); `startingStyle`
 * and `endingStyle` are its first and last frames. `nsh/base` shows and hides
 * them at once when the user asks for less motion, so nothing here reads
 * `reduceMotion()`.
 */
export type OverlayMotionKind = "popover" | "menu" | "tooltip";

export type OverlayMotion = {
  style: ViewStyle;
  startingStyle: ViewStyle;
  endingStyle: ViewStyle;
};

function overlayTransition(properties: string, ms: number): ViewStyle {
  return {
    transitionProperty: properties,
    transitionDuration: ms,
    transitionTimingFunction: "ease-out",
  };
}

export function overlayMotion(kind: OverlayMotionKind): OverlayMotion {
  if (kind === "tooltip") {
    // tooltip.md: a 100 ms fade, no movement.
    const hidden: ViewStyle = { opacity: 0 };
    return { style: overlayTransition("opacity", 100), startingStyle: hidden, endingStyle: hidden };
  }
  if (kind === "menu") {
    // menu.md: 100 ms, from 4 points above.
    return {
      style: overlayTransition("opacity, transform", 100),
      startingStyle: { opacity: 0, transform: [{ translateY: -4 }] },
      endingStyle: { opacity: 0 },
    };
  }
  // popover.md: 150 ms, from 95 % of its size.
  const hidden: ViewStyle = { opacity: 0, transform: [{ scale: 0.95 }] };
  return {
    style: overlayTransition("opacity, transform", 150),
    startingStyle: hidden,
    endingStyle: hidden,
  };
}
