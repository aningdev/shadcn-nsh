import type { Tokens, ViewStyle } from "nsh";
import { colorScheme, token } from "nsh";

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
  popover: "popover",
  popoverForeground: "popover-foreground",
  backdrop: "custom-backdrop",
  highlight: "custom-highlight",
  shadowInk: "custom-shadow-ink",
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

/** `a` with `pct` (0–1) of `b` mixed in: both opaque colors, a state fill a step lighter or deeper. */
export function mix(a: string, b: string, pct: number) {
  return `color-mix(in srgb, ${a}, ${b} ${pct * 100}%)`;
}

/** A pressable under the pointer: a whisper of the text colour over its surface, quieter than pressed. */
export const hovered = (): ViewStyle => ({ backgroundColor: alpha(colors.foreground, 0.05) });

/**
 * The fill steps of a raised control (`secondary`): lighter under the pointer, deeper pressed,
 * and deeper again when it is on, so on and off read apart at a glance in both appearances.
 */
export const controlFill = {
  get hover() {
    return mix(colors.secondary, colors.highlight, 0.5);
  },
  get pressed() {
    return mix(colors.secondary, colors.shadowInk, 0.06);
  },
  get on() {
    return mix(colors.secondary, colors.foreground, 0.1);
  },
};

/** Keyboard focus ring for controls. */
export const focusRing = (offset = 0): ViewStyle => ({
  borderColor: colors.ring,
  outlineStyle: "solid",
  outlineWidth: 3,
  outlineColor: alpha(colors.ring, 0.35),
  outlineOffset: offset,
});

/** The one disabled look: a dimmed control. `disabled` defaults to true, for a `disabledStyle`. */
export function disabledOpacity(disabled: unknown = true): number {
  return disabled ? 0.5 : 1;
}

/**
 * Surface depth, `boxShadow` strings only (fills stay on `colors.*`), picked by what the
 * surface is, never by which component draws it:
 * - `control`: a bordered control. `rest` is the raised edge, `flat` a hairline (outline,
 *   destructive), `pressed` the sunk press, `on` a selected or toggled-on control. A hover
 *   needs no entry: it keeps `rest`, the state style changes the fill only.
 * - `filled`: a control on a solid brand fill.
 * - `popup`: the one soft shadow of the popup family (menu, popover, select, dialog, sheet).
 *
 * The colors are the `custom-shadow-ink` and `custom-highlight` tokens of `theme.json`; the shapes are here.
 */
export type Finish = {
  control: { rest: string; flat: string; pressed: string; on: string };
  filled: string;
  popup: string;
};

const ink = (a: number) => alpha(token("custom-shadow-ink"), a);
const light = (a: number) => alpha(token("custom-highlight"), a);

function finishLight(): Finish {
  return {
    control: {
      rest: `inset 0 1px 0 ${light(1)}, inset 0 2px 0 ${light(0.6)}, 0 1px 0 ${ink(0.05)}`,
      flat: `0 1px 0 ${ink(0.04)}`,
      pressed: `inset 0 1px 1px ${ink(0.1)}`,
      on: `inset 0 1px 0 ${light(0.35)}, 0 1px 0 ${ink(0.05)}`,
    },
    filled: `inset 0 1px 0 ${light(0.35)}, inset 0 -1px 0 ${ink(0.06)}, 0 1px 0 ${ink(0.08)}`,
    popup: `0 1px 0 ${ink(0.04)}, 0 12px 28px -10px ${ink(0.22)}`,
  };
}

function finishDark(): Finish {
  return {
    control: {
      rest: `inset 0 0 0 1px ${light(0.06)}, inset 0 1px 1px ${light(0.08)}, 0 1px 1px ${ink(0.12)}`,
      flat: `0 1px 0 ${ink(0.35)}`,
      pressed: `inset 0 1px 1px ${ink(0.18)}`,
      on: `inset 0 0 0 1px ${light(0.1)}, inset 0 1px 1px ${light(0.12)}, 0 1px 1px ${ink(0.12)}`,
    },
    filled: `inset 0 0 0 1px ${light(0.14)}, inset 0 1px 1px ${light(0.18)}, 0 1px 1px ${ink(0.2)}`,
    popup: `0 1px 0 ${ink(0.4)}, 0 16px 32px -10px ${ink(0.6)}`,
  };
}

const isDark = () => colorScheme() !== "light";
const finishNow = () => (isDark() ? finishDark() : finishLight());

/** Light/dark surface finishes; each role follows the appearance where it is read. */
export const finish: Finish = Object.defineProperties({} as Finish, {
  control: { enumerable: true, get: () => finishNow().control },
  filled: { enumerable: true, get: () => finishNow().filled },
  popup: { enumerable: true, get: () => finishNow().popup },
});

/** Overlay-family one-shadow (`finish.popup`). Prefer this over per-component `boxShadow`. */
export function overlayShadow(): ViewStyle {
  return { boxShadow: finish.popup };
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
  return { backgroundColor: colors.backdrop };
}

/**
 * The card of a modal (dialog, sheet): the popup family's fill, edge and shadow, with the
 * larger radius and padding a modal uses. A popup stays on `popupSurface` (the control
 * radius, 4 points of padding). A sheet's edge overrides the radius and the padding.
 */
export function modalSurface(): ViewStyle {
  return {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
    ...overlayShadow(),
  };
}
