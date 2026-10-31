import type { Tokens, ViewStyle } from "nsh";
import { token } from "nsh";

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

/** Keyboard focus ring for controls. */
export const focusRing = (offset = 0): ViewStyle => ({
  borderColor: colors.ring,
  outlineStyle: "solid",
  outlineWidth: 3,
  outlineColor: "color-mix(in srgb, var(--ring) 35%, transparent)",
  outlineOffset: offset,
});
