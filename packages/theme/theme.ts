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

export type FinishName = "card" | "raised" | "hover" | "pressed" | "on" | "accent";

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

/** Press / state easing shared by controls. */
export const pressEasing = {
  transitionDuration: 150,
  transitionTimingFunction: "ease-out",
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
