// The theme's roles, finishes, radii, focus and motion, read from `theme.json` and `semantics.json`.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import type {
  AnimatedValue,
  BackdropMaterial,
  Easing as EasingCurve,
  MacOsBackdropBlending,
  MacOsBackdropMaterial,
  MacOsBackdropState,
  TextStyle,
  Theme,
  Tokens,
  ViewStyle,
  WindowsBackdropMaterial,
} from "nsh";
import {
  colorScheme,
  computed,
  createAnimatedValue,
  Easing,
  effect,
  platform,
  reduceMotion,
  setTheme,
  signal,
  token,
} from "nsh";

import semantics from "./semantics.json";

// @port theme.ts
/**
 * The Terminal idiom (`nsh`'s internal module, so not a public API): a
 * terminal program leaves out what it cannot draw well (charts,
 * sparklines, decorative icons and art, window chrome), puts on one row
 * what other platforms stack, and spaces in whole rows.
 */
export const terminal = platform.idiom === "terminal";

/**
 * One row and one column of the terminal grid, in points (a Cell is 16 by 8
 * points): the terminal's line height and its unit of spacing. This
 * library's own, over `nsh`'s internal Cell metrics; everywhere else the
 * grid keeps two columns to a Cell.
 */
export const TERMINAL_ROW = 16;
export const TERMINAL_COLUMN = 8;

/** The gap the terminal's layout makes two columns (it makes any smaller
 * gap one): between neighbours that are words, such as icon buttons shown
 * as their labels, so they read apart. */
export const TERMINAL_GAP = 24;

/** Whether the app shows its dark palette; reactive: reading it subscribes. */
export const isDark = () => colorScheme() !== "light";

/**
 * The platform's own material a finish asks for, one entry per platform that has one (an
 * absent platform draws the finish as it is: its fill, its blur, its shadow). Values are NSH's:
 * `styling.md` lists them, the allow-lists of `scripts/theme/material.ts` hold a theme to them.
 */
export interface Material {
  /** Liquid Glass on iOS and macOS 26 and later: it rides in the finish's style as `glassEffect`
   * and `glassTintColor`, so every platform without it keeps the finish's `backdropFilter`. */
  apple?: {
    glass: "regular" | "clear";
    /** The glass's tint: a color of the theme (`{glass}`, an alias), or `null` for the system's own. */
    tint: string | null;
  };
  /** The system blur material of the finish's `backdropFilter` on iOS (`ios={{ backdropMaterial }}`). */
  ios?: { backdrop: BackdropMaterial };
  /** An `NSVisualEffectView` below the view on macOS (`macos={{ backdrop }}`). */
  macos?: {
    backdrop: MacOsBackdropMaterial;
    blending?: MacOsBackdropBlending;
    state?: MacOsBackdropState;
  };
  /** The system's blur of what is behind a transparent window on Windows 11 (`windows={{ backdrop }}`). */
  windows?: { backdrop: WindowsBackdropMaterial };
  /** Android's ripple and elevation (`android={{ ripple, elevation }}`). */
  android?: {
    /** A press's ripple: `{ color }` is a `{token}` reference; optional shape flags follow NSH's `Ripple`. */
    ripple?: {
      color: string;
      borderless?: boolean;
      radius?: number;
      foreground?: boolean;
    };
    /** Surface elevation in points (`android={{ elevation }}`). */
    elevation?: number;
  };
}

/** A surface's finish as `semantics.json` writes it: DTCG finish fields (`background`, `gradient`, `shadow`, `border-color`) plus `backdropFilter` and the `material` it asks of the platform (`null`: none). */
export interface Finish {
  background?: string;
  gradient?: string;
  shadow: string;
  "border-color"?: string;
  "border-top-color"?: string;
  "border-bottom-color"?: string;
  backdropFilter?: string;
  material: Material | null;
}

/** The `finishes` block of `semantics.json`: fields shared by both appearances plus sparse light/dark overrides. */
export interface SplitFinishes {
  shared: Record<FinishRole, Partial<Finish>>;
  light: Partial<Record<FinishRole, Partial<Finish>>>;
  dark: Partial<Record<FinishRole, Partial<Finish>>>;
}

/**
 * What a component reads of a finish (`finish.menu`): the style keys, spread into a `style`. A
 * finish whose `material` has `apple` also has `glassEffect` (and `glassTintColor`, unless its tint is
 * `null`); otherwise these keys are not there at all. `material` itself is never a style key.
 */
export type FinishStyle = {
  backgroundColor?: string;
  backgroundImage?: string;
  boxShadow: string;
  borderColor?: string;
  borderTopColor?: string;
  borderBottomColor?: string;
  backdropFilter?: string;
  glassEffect?: "regular" | "clear";
  glassTintColor?: string;
};

/** The finishes' roles: the keys of `semantics.json`'s `finishes` block. */
export type FinishRole =
  | "card"
  | "section"
  | "inset"
  | "field"
  | "raised"
  | "hover"
  | "pressed"
  | "disabled"
  | "light"
  | "accent"
  | "accentPressed"
  | "track"
  | "fill"
  | "knob"
  | "knobOn"
  | "handle"
  | "pill"
  | "thumb"
  | "on"
  | "chip"
  | "glass"
  | "menu"
  | "dialog"
  | "grabber"
  | "tooltip"
  | "inverse"
  | "groove";

/** What a theme's `semantics.json` holds: its style groups and its split finishes (`shared` + sparse `light`/`dark`). */
export interface Semantics extends Style {
  finishes: SplitFinishes;
}

/** A value for each tier: a pointer's (a desktop) and a touch screen's. */
export interface Tiered<T> {
  pointer: T;
  touch: T;
}

/** One typography role: fontSize and unitless lineHeight multiplier per tier, numeric fontWeight (400..700), letterSpacing in points. */
export interface TypographyRole {
  fontSize: Tiered<number>;
  lineHeight: Tiered<number>;
  fontWeight: number;
  letterSpacing: number;
}

/** The sizes of a list of controls in one tier: see `controlSize`. */
export interface ControlSizes {
  row: number;
  padding: number;
  gap: number;
  control: number;
  corner: number;
  check: number;
  dot: number;
  tabs: number;
  line: number;
  clear: number;
  switch: string;
}

/** A page's density in one tier: see `density`. */
export interface DensitySizes {
  row: number;
  pad: number;
  gap: number;
  surface: number;
}

/** Three steps of one size, small to large. */
export interface Steps {
  sm: number;
  md: number;
  lg: number;
}

/** A spring of `motion`: a unit mass's stiffness and damping. */
export interface Spring {
  stiffness: number;
  damping: number;
}

/** A timing specification as written in `semantics.json`: duration in ms and a named timing curve. */
export interface TimingSpec {
  duration: number;
  timingFunction: string;
}

/** A resolved timing configuration of `motion`, ready for `animate()` or `follow()`. */
export interface Timing {
  duration: number;
  timingFunction: EasingCurve;
}

/** Surface treatment for an unchecked checkbox box or radio ring well. */
export type ChoiceWell = "well" | "inset" | "outline";

export interface CheckboxDim {
  border: number;
  target: number;
  well: ChoiceWell;
  "has-target": boolean;
}

export interface SwitchDim {
  width: number;
  height: number;
  "sm-width": number;
  "sm-height": number;
  border: number;
  "on-border": number;
  knob: number;
  "on-knob": number;
  "sm-knob": number;
  "sm-on-knob": number;
  "knob-hover": number;
  "knob-pressed-width": number;
  "knob-pressed-height": number;
  "knob-feedback": "none" | "expand" | "stretch";
}

export interface SliderDim {
  band: number;
  rail: number;
  "thumb-width": number;
  "thumb-height": number;
  "thumb-pressed-width": number;
  "inner-dot": number;
  "inner-dot-hover": number;
  "inner-dot-pressed": number;
  "vertical-length": number;
  "handle-shape": "circle" | "bar" | "ring";
  outlined: boolean;
  "hover-brightness": boolean;
}

export interface RadioDim {
  size: number;
  dot: number;
  "dot-hover": number;
  "dot-pressed": number;
  border: number;
  target: number;
  well: ChoiceWell;
  "checked-style": "fill" | "ring";
  "has-target": boolean;
  "dot-feedback": "none" | "scale";
}

/**
 * The style of a theme: what `semantics.json` states beside its finishes, in DTCG field naming,
 * the same keys in every theme (`check:theme`). A string that names one of a list (a curve, a
 * timingFunction, an indicator) or numeric fontWeight is checked by `check:theme` (`scripts/theme/style.ts`).
 * `docs/specs/native-themes.md` §3.2 says what each key is.
 */
export interface Style {
  typography: {
    /** `null` is the system font. */
    fontFamily: string | null;
    caption: TypographyRole;
    detail: TypographyRole;
    body: TypographyRole;
    label: TypographyRole;
    title: TypographyRole;
    headline: TypographyRole;
    display: TypographyRole;
  };
  dimension: {
    shape: {
      control: string;
      field: string;
      chip: string;
      card: string;
      overlay: string;
      dialog: string;
      sheet: string;
      inset: string;
    };
    size: {
      hit: Tiered<number>;
      density: Tiered<DensitySizes>;
      control: Tiered<ControlSizes>;
      height: Tiered<Steps>;
    };
    stroke: { hairline: number; surface: number; control: number; indicator: number };
    focus: { style: string; width: number; offset: number };
    icon: Tiered<Steps>;
    grabber: { width: number; height: number };
    checkbox: CheckboxDim;
    switch: Tiered<SwitchDim>;
    slider: Tiered<SliderDim>;
    radio: Tiered<RadioDim>;
  };
  shape: {
    curve: string;
    corners: { field: string };
  };
  state: {
    "press-scale": number;
    overlay: { hover: number; focus: number; pressed: number; dragged: number };
    ripple: boolean;
    "pressed-opacity": number;
    "accent-pressed-opacity": number;
    disabled: { content: number; fill: boolean };
  };
  duration: {
    /** A rejected value's shake, the length of `nsh`'s `play("shake")` preset. */
    shake: number;
  };
  transition: {
    enter: TimingSpec;
  };
  motion: {
    press: Spring | TimingSpec;
    settle: Spring | TimingSpec;
    control: Spring | TimingSpec;
    move: Spring | TimingSpec;
  };
  indicator: { tabs: string; nav: string; field: string };
}

/**
 * One theme an app can switch to while it runs (`selectTheme`): the id an
 * app stores to bring it back, the name a list of them shows, and the
 * content of the two files a theme is.
 */
export interface AppTheme {
  /** The id an app stores and compares: `"shadcn"`. */
  id: string;
  /** The name a list of themes shows: `"shadcn neutral"`. */
  label: string;
  /** `theme.json`'s content: the tokens `setTheme` takes. */
  theme: Theme;
  /** `semantics.json`'s content. */
  semantics: Semantics;
}

/** The build-time semantics: `semantics.json` beside this file (the app's `nsh-ui.json` names the theme they belong to). */
// JSON types a `material.apple.glass` as `string`; `check:theme` holds the file to "regular" | "clear".
const builtIn = semantics as Semantics;

/** The theme `selectTheme` put in; `null` while the app shows its build-time one. */
const selected = signal<AppTheme | null>(null);

/** The semantics in use: the selected theme's, else the build-time ones. Reactive: reading it subscribes. */
const semanticsOf = (): Semantics => selected()?.semantics ?? builtIn;

/**
 * The style in use (type, shape, size, motion…): the selected theme's, else the build-time one's.
 * Reactive: reading it in JSX, a `draw` or an effect follows `selectTheme`.
 */
export const style = (): Style => semanticsOf();

/**
 * An object whose properties are read from the style in use: one getter per key, so `density.row`
 * follows `selectTheme` as a plain value would not, and the object still spreads. Each key is a
 * `computed` made here, at import (one made inside a component would be disposed with it), so what
 * reads a key re-runs only when its value changes, not whenever a theme is selected.
 */
export function reactive<T extends object>(keys: readonly (keyof T)[], read: () => T): T {
  const out = {} as T;
  for (const key of keys) {
    const value = computed(() => read()[key]);
    Object.defineProperty(out, key, { enumerable: true, get: () => value() });
  }
  return out;
}

/** The tier a pointer's screen (a desktop) or a touch screen reads: `platform.desktop`, fixed for the run. */
export const tier: "pointer" | "touch" = platform.desktop ? "pointer" : "touch";

/** A bare `{token}` reference (used by `dimension.shape.*` and `typography.fontFamily`). */
const tokenRef = /^\{([a-z0-9-]+)\}$/;

/** The one relative color a finish writes: a token's color at another alpha. */
const relative = /oklch\(from \{([a-z0-9-]+)\} l c h \/ ([\d.]+)\)/g;

/** A token's color, `#rrggbbaa` as `token` gives it, at another alpha. */
const atAlpha = (color: string, a: number) =>
  `${color.slice(0, 7)}${Math.round(a * 255)
    .toString(16)
    .padStart(2, "0")}`;

/** Resolve a `{token}` dimension reference through `token()` reactively (returns points). */
const resolveDimension = (value: string): number => {
  const match = tokenRef.exec(value);
  if (match) {
    const resolved = token(match[1] as keyof Tokens);
    if (typeof resolved === "number") return resolved;
  }
  return Number(value);
};

/** Resolve a `{token}` font family reference through `token()` reactively, or `null` for system default. */
const resolveFont = (value: string | null): string | null => {
  if (value === null) return null;
  const match = tokenRef.exec(value);
  if (match) {
    const resolved = token(match[1] as keyof Tokens);
    return typeof resolved === "string" ? resolved : null;
  }
  return value;
};

/**
 * A finish's strings name the theme's tokens instead of writing their colors (`{raised}`, an
 * alias): the finishes keep one shape in every theme while the colors they draw are the theme's.
 * `token` reads the same token the rest of the theme does, so an alias follows the appearance,
 * the theme `selectTheme` put in, and host `setThemeOverrides`, and a `{token}` anywhere in a
 * gradient or a shadow resolves with it.
 *
 * A token named at another alpha (`oklch(from {card} l c h / 0.78)`, the one relative color a
 * finish writes) resolves to that token's color with the alpha replaced: NSH reads these strings
 * as plain CSS and has no relative color syntax. It goes through `token` rather than reading the
 * theme file, so this module imports nothing but `semantics.json`: it is `lib/ui/theme.ts` in an
 * app, whose `theme.json` sits at its root.
 */
const alias = (value: string): string =>
  value
    .replace(relative, (whole, name: string, a: string) => {
      const color = token(name as keyof Tokens);
      return typeof color === "string" ? atAlpha(color, Number(a)) : whole;
    })
    .replace(/\{([a-z0-9-]+)\}/g, (whole, name: string) => {
      const color = token(name as keyof Tokens);
      return typeof color === "string" ? color : whole;
    });

/** Merge `shared` with the active appearance's sparse override for one finish role (reactive). */
const finishOf = (role: FinishRole): Finish => {
  const { finishes } = semanticsOf();
  const overrides = isDark() ? finishes.dark : finishes.light;
  return { ...finishes.shared[role], ...overrides?.[role] } as Finish;
};

/** The material one finish role asks for in the semantics in use, in the appearance shown (reactive). */
const materialOf = (role: FinishRole): Material | null => finishOf(role).material;

/** The style keys a finish's glass adds: `glassEffect` always, `glassTintColor` when it names a tint. */
const glassKeys = (role: FinishRole): readonly string[] => {
  const glass = materialOf(role)?.apple;
  if (glass === undefined) return [];
  return glass.tint === null ? ["glassEffect"] : ["glassEffect", "glassTintColor"];
};

/**
 * An object whose getters read one finish role of the semantics in use, in
 * the appearance shown: shadows and gradients are no design tokens, so they
 * stay here while every color is the theme's, by alias. Reading one
 * subscribes to the appearance, to the theme `selectTheme` put in, and to
 * host token overrides.
 *
 * `material` is not one of its keys: the glass of `material.apple` is two style keys (NSH's
 * `glassEffect` and `glassTintColor`), which the object has only while the finish asks for them, so
 * a finish with `material: null` spreads into exactly the keys it always had. The platform props of
 * the material (`ios`, `macos`, `windows`) are not style keys and come from `platformMaterial`.
 */
const finishStyleKeys: Record<Exclude<keyof Finish, "material">, keyof FinishStyle> = {
  background: "backgroundColor",
  gradient: "backgroundImage",
  shadow: "boxShadow",
  "border-color": "borderColor",
  "border-top-color": "borderTopColor",
  "border-bottom-color": "borderBottomColor",
  backdropFilter: "backdropFilter",
};

function themed(role: FinishRole): FinishStyle {
  const out = {} as FinishStyle;
  const builtInRole = {
    ...builtIn.finishes.shared[role],
    ...builtIn.finishes.dark[role],
    ...builtIn.finishes.light[role],
  };
  for (const key of Object.keys(builtInRole) as (keyof Finish)[]) {
    if (key === "material") continue;
    const styleKey = finishStyleKeys[key];
    Object.defineProperty(out, styleKey, {
      enumerable: true,
      configurable: true,
      get: () => {
        const value = finishOf(role)[key];
        return typeof value === "string" ? alias(value) : undefined;
      },
    });
  }
  const glass = (key: string): string | undefined => {
    const apple = materialOf(role)?.apple;
    if (apple === undefined) return undefined;
    if (key === "glassEffect") return apple.glass;
    return apple.tint === null ? undefined : alias(apple.tint);
  };
  return new Proxy(out, {
    ownKeys: (target) => [...Reflect.ownKeys(target), ...glassKeys(role)],
    getOwnPropertyDescriptor: (target, key) =>
      typeof key === "string" && glassKeys(role).includes(key)
        ? { value: glass(key), enumerable: true, configurable: true, writable: false }
        : Reflect.getOwnPropertyDescriptor(target, key),
    has: (target, key) =>
      Reflect.has(target, key) || (typeof key === "string" && glassKeys(role).includes(key)),
    get: (target, key, receiver) =>
      typeof key === "string" && (key === "glassEffect" || key === "glassTintColor")
        ? glass(key)
        : Reflect.get(target, key, receiver),
  });
}

/** What `platformMaterial` returns: the platform props a finish's `material` asks for. A platform it asks
 * nothing of has `undefined`. */
export interface MaterialProps {
  ios?: { backdropMaterial: BackdropMaterial };
  macos?: {
    backdrop: {
      material: MacOsBackdropMaterial;
      blending?: MacOsBackdropBlending;
      state?: MacOsBackdropState;
    };
  };
  windows?: { backdrop: { material: WindowsBackdropMaterial } };
  android?: {
    ripple?: { color?: string; borderless?: boolean; radius?: number; foreground?: boolean };
    elevation?: number;
  };
}

/**
 * The platform props of a finish's `material`: `ios={{ backdropMaterial }}`, `macos={{ backdrop }}`,
 * `windows={{ backdrop }}` and `android={{ ripple, elevation }}`, for the view that draws the finish.
 * They are props, not style keys, so a component spreads them on the same view that spreads `finish.<role>`
 * into its `style`:
 *
 *     <View {...platformMaterial("menu")} style={{ ...finish.menu }} />
 *
 * Its four keys are getters, so they follow `selectTheme` and the appearance as `finish` does, and
 * a finish with `material: null` (every finish the library ships) gives `undefined` for all four: the
 * view is drawn as it was. The Liquid Glass of `material.apple` needs no prop: it is in the style.
 */
export function platformMaterial(role: FinishRole): MaterialProps {
  return {
    get ios() {
      const ios = materialOf(role)?.ios;
      return ios === undefined ? undefined : { backdropMaterial: ios.backdrop };
    },
    get macos() {
      const macos = materialOf(role)?.macos;
      if (macos === undefined) return undefined;
      const { backdrop: material, blending, state } = macos;
      return {
        backdrop: {
          material,
          ...(blending === undefined ? {} : { blending }),
          ...(state === undefined ? {} : { state }),
        },
      };
    },
    get windows() {
      const windows = materialOf(role)?.windows;
      return windows === undefined ? undefined : { backdrop: { material: windows.backdrop } };
    },
    get android() {
      const android = materialOf(role)?.android;
      if (android === undefined) return undefined;
      const { ripple, elevation } = android;
      return {
        ...(ripple === undefined
          ? {}
          : {
              ripple: {
                ...ripple,
                color: alias(ripple.color),
              },
            }),
        ...(elevation === undefined ? {} : { elevation }),
      };
    },
  };
}

/** The palette's roles: one color each, a token of the theme's `theme.json`. */
export interface Palette {
  /** The page behind the cards. */
  background: string;
  /** A card. */
  card: string;
  /** A surface inside a card. */
  inset: string;
  /** A control on a card (buttons, fields, tracks). */
  raised: string;
  /** An input's well: below the card and the insets it sits on. */
  field: string;
  /** An input's edge. */
  input: string;
  /** The hairline round what needs an edge (a card, a well, a divider). */
  border: string;
  /** Hairlines inside insets. */
  line: string;
  /** The edge a filled pane draws (a primary button, a chosen run, a chip): the accent a step down,
   * or `border` where the theme's fill is flat. */
  brandEdge: string;
  /** The hairline round a glass surface (a raised pane, a track's thumb, a popover): Solid Glass' own
   * line, `border` in a flat theme. */
  glassEdge: string;
  /** Body text. */
  foreground: string;
  /** Secondary text: a detail, a caption. */
  mutedForeground: string;
  /** What recedes the furthest: a placeholder, an icon at rest. */
  faint: string;
  /** The accent as a foreground: text, icons, lines, small marks. */
  brand: string;
  /** The accent as a fill (buttons, bubbles), with `onBrand` on it. */
  brandFill: string;
  /** Text on the accent fill. */
  onBrand: string;
  /** The main action's fill (the theme's `primary`): the citrus, in both appearances. */
  primary: string;
  /** Text on `primary`. */
  primaryForeground: string;
  /** The app's sidebar, beside the page. */
  sidebar: string;
  /** The selected row of the sidebar. */
  sidebarAccent: string;
  /** The sidebar's edge and the toolbar's hairline. */
  sidebarBorder: string;
  /** A switch's track when off. */
  track: string;
  /** A slider's inactive track fill (`{track}` by default; `brand-tint` in Material; `input` in WinUI). */
  sliderTrack: string;
  /** A switch's knob when off. */
  knob: string;
  /** Code inside insets. */
  code: string;
  /** The ink on a `brand-tint` surface: a chosen tile, a tinted bubble. */
  onBrandTint: string;
  /** The surface of a tip or a toast, read apart from the page's: a flat theme's popover, an inverted pane in Material. */
  inverse: string;
  /** Text on `inverse`. */
  inverseForeground: string;
  /** Secondary ink on `inverse`: a toast's description, spinner and close icon, a tooltip's note. */
  inverseMuted: string;
  /** The accent on `inverse`: a toast's action. */
  inverseBrand: string;
  /** Modal dialog container surface. */
  dialog: string;
  /** Hairline border on card and section containers. */
  cardEdge: string;
  /** Directional control elevation bevel stroke. */
  bevel: string;
  /** Accent control elevation top and side bevel stroke. */
  accentBevel: string;
  /** Disabled control container surface. */
  disabled: string;
  /** Disabled control label and icon ink. */
  disabledForeground: string;
  /** Accent control fill while pressed. */
  accentPressed: string;
  /** Ink on pressed accent control fills. */
  onAccentPressed: string;
  /** Label and icon ink on selected or toggled-on controls. */
  selectedForeground: string;
  /** Label and icon ink on pressed neutral or ghost controls. */
  pressedForeground: string;
  /** The tone colors: information, a warning, a failure, a gain, a loss. */
  info: string;
  warn: string;
  destructive: string;
  up: string;
  down: string;
  /** The ground a photograph or a video sits on. It does not flip: dark in either appearance. */
  media: string;
  /** White ink on a photograph or any other surface that is not the theme's. It does not flip. */
  onMedia: string;
  /**
   * Dark ink on a light chart tile. A dark tile uses `on-media` instead (`data-dark:`), because
   * `nsh/base` marks a plot cell dark from its own OKLab lightness, not from the appearance.
   */
  chartForeground: string;
}

/** An object whose getters read the theme's tokens: reads in a reactive
 * scope (JSX, a `draw`, an effect) follow the appearance and the theme. */
function tokens<K extends string>(names: Record<K, keyof Tokens>): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const key of Object.keys(names) as K[]) {
    Object.defineProperty(out, key, { enumerable: true, get: () => token(names[key]) });
  }
  return out;
}

/**
 * The palette in use, read from the theme's tokens: reactive, so reading it
 * in JSX, a `draw` or an `effect` follows the appearance and the theme
 * `selectTheme` put in.
 */
export const colors: Palette = tokens<keyof Palette>({
  background: "background",
  card: "card",
  inset: "inset",
  raised: "raised",
  field: "field",
  input: "input",
  border: "border",
  line: "line",
  brandEdge: "brand-edge",
  glassEdge: "glass-edge",
  foreground: "foreground",
  mutedForeground: "muted-foreground",
  faint: "faint",
  brand: "brand",
  brandFill: "brand-fill",
  onBrand: "on-brand",
  primary: "primary",
  primaryForeground: "primary-foreground",
  sidebar: "sidebar",
  sidebarAccent: "sidebar-accent",
  sidebarBorder: "sidebar-border",
  track: "track",
  sliderTrack: "slider-track",
  knob: "knob",
  code: "code",
  info: "info",
  warn: "warn",
  destructive: "destructive",
  up: "up",
  down: "down",
  media: "media",
  onMedia: "on-media",
  chartForeground: "chart-foreground",
  onBrandTint: "on-brand-tint",
  inverse: "inverse",
  inverseForeground: "inverse-foreground",
  inverseMuted: "inverse-muted",
  inverseBrand: "inverse-brand",
  dialog: "dialog",
  cardEdge: "card-edge",
  bevel: "bevel",
  accentBevel: "accent-bevel",
  disabled: "disabled",
  disabledForeground: "disabled-foreground",
  accentPressed: "accent-pressed",
  onAccentPressed: "on-accent-pressed",
  selectedForeground: "selected-foreground",
  pressedForeground: "pressed-foreground",
});

/**
 * The window buttons an app draws for a frameless window on macOS (the
 * traffic lights): close, minimize and zoom in the system's hues, the
 * glyphs' ink over them, their hairline edge, and `off`, all three while
 * the window is in the background.
 */
export const windowControls = tokens<"close" | "minimize" | "zoom" | "ink" | "edge" | "off">({
  close: "window-close",
  minimize: "window-minimize",
  zoom: "window-zoom",
  ink: "window-control-ink",
  edge: "window-control-edge",
  off: "window-control-off",
});

/**
 * `color` at opacity `a` (0 to 1): a `color-mix` over nothing, for a fill or a text color that is
 * the theme's at a lighter weight. Clamped, so a ratio past its ends is still a color.
 */
export function alpha(color: string, a: number): string {
  return `color-mix(in srgb, ${color} ${Math.min(Math.max(a, 0), 1) * 100}%, transparent)`;
}

/** The charts' series colors, in order (`theme.json`'s `chart-1` to
 * `chart-5`): the brand's citrus first, then graphite from dark to light,
 * so one series leads and the rest stay as quiet as the interface. */
export const chart = tokens({
  chart1: "chart-1",
  chart2: "chart-2",
  chart3: "chart-3",
  chart4: "chart-4",
  chart5: "chart-5",
});

/** Translucent tints of the tones, for fills behind text. */
export const tints = tokens({
  brand: "brand-tint",
  info: "info-tint",
  warn: "warn-tint",
  destructive: "destructive-tint",
  up: "up-tint",
  down: "down-tint",
});

/**
 * Light and depth, kept quiet: one-color edges (corners join cleanly), a
 * hard 1-point drop under what stands up and a 1-point inner shade in what
 * is sunk; only floating surfaces (menus, glass) cast a soft
 * shadow. `hover` and `pressed` are a raised control's states, `fill` a
 * slider's or a progress bar's run of the accent; `knob` a switch's knob on its
 * sunk track, `knobOn` the white one with an olive edge on the citrus.
 * `handle` is a slider's thumb, the knob's twin here; a theme whose thumb
 * wears an edge the switch's knob does not (shadcn's `border-primary`) tells
 * them apart. `thumb` is a segmented control's or a tab strip's selected segment on
 * its sunk track: the raised fill dark; white with a soft drop light, where
 * the raised fill is all but the track's color.
 * `on` is what stays on (a toggle, a chosen tool, a selected button): a
 * fill that stands off every surface it sits on, and off a raised control
 * at rest, further than a hover does, so on and off read apart at a
 * glance. Dark, a step lighter than the raised fill; light, where a raised
 * fill is all but the color of the card and the inset under it, a deeper
 * neutral with an edge. `groove` is a hairline's lip of light under it, a
 * menu's separator cut into the surface.
 */
export const finish: Record<FinishRole, FinishStyle> = {
  card: themed("card"),
  section: themed("section"),
  inset: themed("inset"),
  field: themed("field"),
  raised: themed("raised"),
  hover: themed("hover"),
  pressed: themed("pressed"),
  disabled: themed("disabled"),
  light: themed("light"),
  accent: themed("accent"),
  accentPressed: themed("accentPressed"),
  track: themed("track"),
  fill: themed("fill"),
  knob: themed("knob"),
  knobOn: themed("knobOn"),
  handle: themed("handle"),
  pill: themed("pill"),
  thumb: themed("thumb"),
  on: themed("on"),
  chip: themed("chip"),
  glass: themed("glass"),
  menu: themed("menu"),
  dialog: themed("dialog"),
  grabber: themed("grabber"),
  tooltip: themed("tooltip"),
  inverse: themed("inverse"),
  groove: themed("groove"),
};

/**
 * How far a press sinks a control, as the theme in use says (`semantics.json`'s `state["press-scale"]`):
 * `0.97` where a press is a small sink, `1` where the theme draws none. A control that sinks
 * deeper than that names its own scale (`pressSink(0.9)`); a theme of `1` turns every sink off.
 * Reactive: reading it follows `selectTheme`.
 */
export const press = {
  get scale() {
    return semanticsOf().state["press-scale"];
  },
};

/**
 * Switch the app to `theme` while it runs: the tokens first (`setTheme`),
 * then its semantics, so every component on screen redraws with both on the
 * next frame. `null` goes back to the theme the app was built with
 * (`nsh.json`'s `theme.json`, and `semantics.json` beside this file).
 *
 * A theme NSH refuses to read (a color it does not know) throws
 * `TypeError` and leaves the app as it was: the semantics follow the tokens
 * only once they are in.
 */
export function selectTheme(theme: AppTheme | null): void {
  setTheme(theme ? theme.theme : null);
  selected.set(theme);
}

/**
 * The `id` of the theme the app shows (`selectTheme`), or `null` while it
 * shows its build-time one — the runtime cannot read `nsh-ui.json`. Reactive:
 * reading it subscribes.
 */
export function currentTheme(): string | null {
  const theme = selected();
  return theme === null ? null : theme.id;
}

export type Tone = "neutral" | "accent" | "info" | "warn" | "destructive" | "up" | "down";

/**
 * The color of a tone. `accent` is the brand ink: the tone keeps its name, and the palette key is
 * the token (`brand`).
 */
export const toneColor = (tone: Tone) =>
  tone === "neutral" ? colors.mutedForeground : tone === "accent" ? colors.brand : colors[tone];

/**
 * The tint of a tone. `accent` reads `tints.brand` (the `brand-tint` token); the other tones share
 * a key with `colors`.
 */
export const toneTint = (tone: Tone) =>
  tone === "neutral" ? colors.raised : tone === "accent" ? tints.brand : tints[tone];

/** The monospaced family, for code (API names, identifiers): the theme's
 * `font-mono`, which is also what the `font-mono` class and code in a `TextView`
 * draw in. Called where the style is built, so it follows `selectTheme`; a
 * theme that names no family gets NSH's `monospace`, the system's own. Figures
 * use the system font with tabular numbers instead. */
export const mono = () => token("font-mono");

/** A typography role of `semantics.json`'s `typography`: every one but `fontFamily`. */
export type TypeName = Exclude<keyof Style["typography"], "fontFamily">;

/**
 * One facet of a typography role, read from the style in use (reactive: reading it in JSX, a `draw` or
 * an effect follows `selectTheme`). A component reads only the facets it set before, so text that
 * leaves its weight or line height to the text around it still does:
 * `style={{ fontSize: font.size("label"), fontWeight: font.weight("label") }}`.
 * `size` and `lineHeight` take the tier of the screen (`tier`); `lineHeight` resolves the unitless
 * DTCG ratio to rounded points for NSH.
 */
export const font = {
  family: () => resolveFont(style().typography.fontFamily),
  size: (role: TypeName) => style().typography[role].fontSize[tier],
  lineHeight: (role: TypeName) => {
    const t = style().typography[role];
    return Math.round(t.fontSize[tier] * t.lineHeight[tier]);
  },
  weight: (role: TypeName) =>
    style().typography[role].fontWeight as NonNullable<TextStyle["fontWeight"]>,
  letterSpacing: (role: TypeName) => style().typography[role].letterSpacing,
};

/**
 * The corner radii by role (`semantics.json`'s `dimension.shape`), resolved from `theme.json`'s `radius-*`
 * tokens via `token()`: what the component is picks the role (`control` a button, `field` an input,
 * `chip` a badge, `card` a card, `overlay` a menu or a popup, `dialog`, `sheet`, `inset` a well
 * inside a card). Reactive: reading one in JSX, a `draw` or an effect follows `selectTheme` and
 * host token overrides.
 */
export const shape = {
  get control() {
    return resolveDimension(style().dimension.shape.control);
  },
  get field() {
    return resolveDimension(style().dimension.shape.field);
  },
  get chip() {
    return resolveDimension(style().dimension.shape.chip);
  },
  get card() {
    return resolveDimension(style().dimension.shape.card);
  },
  get overlay() {
    return resolveDimension(style().dimension.shape.overlay);
  },
  get dialog() {
    return resolveDimension(style().dimension.shape.dialog);
  },
  get sheet() {
    return resolveDimension(style().dimension.shape.sheet);
  },
  get inset() {
    return resolveDimension(style().dimension.shape.inset);
  },
};

/** Line widths in points (`semantics.json`'s `dimension.stroke`): `hairline` a divider or outlined element's edge, `surface` a surface's outline (0 where surfaces stand by tone or shadow alone), `control` a control's edge, `indicator` a selection's bar. The focus ring's width is `dimension.focus.width`. */
export const stroke = {
  get hairline() {
    return style().dimension.stroke.hairline;
  },
  get surface() {
    return style().dimension.stroke.surface;
  },
  get control() {
    return style().dimension.stroke.control;
  },
  get indicator() {
    return style().dimension.stroke.indicator;
  },
};

/**
 * How far a control fades (`semantics.json`'s `state`): `pressed` is the opacity of a pressed
 * control (`pressed-opacity`), `disabled` that of a disabled control's content when drawn as one.
 */
export const dimmed = {
  get pressed() {
    return style().state["pressed-opacity"];
  },
  get disabled() {
    return style().state.disabled.content;
  },
};

/**
 * The resolved overlay wash color (`atAlpha(token(ink), opacity)`) for a `state.overlay` role,
 * or `undefined` when the theme's overlay opacity is `<= 0`.
 */
export function stateLayerColor(
  kind: keyof Style["state"]["overlay"],
  ink: keyof Tokens = "foreground",
): string | undefined {
  const opacity = style().state.overlay[kind];
  if (opacity <= 0) return undefined;
  return atAlpha(token(ink) as string, opacity);
}

/**
 * The state layer of a theme that draws its hover, focus, press and drag as a wash of `ink`
 * (default `"foreground"`) over the surface (`state.overlay`, an opacity; Material's): a gradient
 * of that one color, stacked over `under` (an underlying `backgroundImage` fill) so the surface
 * fill is preserved. A theme whose overlay is 0 (the default: its states swap the surface's
 * finish) draws none, so this is an empty style.
 */
export function stateLayer(
  kind: keyof Style["state"]["overlay"],
  ink: keyof Tokens = "foreground",
  under?: string,
): ViewStyle {
  const wash = stateLayerColor(kind, ink);
  if (!wash) return {};
  const layer = `linear-gradient(180deg, ${wash} 0%, ${wash} 100%)`;
  return { backgroundImage: under && under !== "none" ? `${layer}, ${under}` : layer };
}

/** The smallest target a finger or a pointer gets (`dimension.size.hit` of the tier): 0 adds none. */
export const hitTarget = (): number => style().dimension.size.hit[tier];

/** Dimensions of checkbox geometry and state-layer target (`dimension.checkbox`). */
export const checkboxGeometry = (): CheckboxDim => style().dimension.checkbox;

/** Dimensions and feedback mode of switch geometry (`dimension.switch[tier]`). */
export const switchGeometry = (): SwitchDim => style().dimension.switch[tier];

/** Dimensions, handle shape, and track rules of slider geometry (`dimension.slider[tier]`). */
export const sliderGeometry = (): SliderDim => style().dimension.slider[tier];

/** Dimensions, checked ring mode, dot feedback, and state-layer target of radio geometry (`dimension.radio[tier]`). */
export const radioGeometry = (): RadioDim => style().dimension.radio[tier];

/** A button's height by size (`dimension.size.height` of the tier). */
export const controlHeight = {
  get sm() {
    return style().dimension.size.height[tier].sm;
  },
  get md() {
    return style().dimension.size.height[tier].md;
  },
  get lg() {
    return style().dimension.size.height[tier].lg;
  },
};

/** An icon's side by size (`dimension.icon` of the tier). */
export const iconSize = {
  get sm() {
    return style().dimension.icon[tier].sm;
  },
  get md() {
    return style().dimension.icon[tier].md;
  },
  get lg() {
    return style().dimension.icon[tier].lg;
  },
};

/** Every corner that reads a theme radius is continuous: the curve macOS
 * draws, not a circular arc. */
export const cornerCurve: ViewStyle = {
  get borderCurve() {
    return style().shape.curve === "circular" ? "circular" : "continuous";
  },
};

/**
 * A corner on one of the theme's radii, with the curve they all share. `inset` makes it concentric:
 * a surface drawn `inset` points inside another takes the outer radius less `inset`, never below 0.
 */
export function rounded(radius: number, inset = 0): ViewStyle {
  return { borderRadius: Math.max(radius - inset, 0), ...cornerCurve };
}

/** The system header's colors on every page (iOS, Android). */
export const header = {
  get headerStyle() {
    return {
      backgroundColor: colors.background,
      color: colors.foreground,
      tintColor: colors.brand,
    };
  },
};

/** Whether a resolved motion role is a `Timing` (`{ duration, timingFunction }`) rather than a `Spring`. */
export const isTiming = (m: Spring | Timing): m is Timing => "duration" in m;

/** The easings a theme names (`transition.enter.timingFunction` and timing roles): the curve is code, the name is data. */
const easings: Record<string, EasingCurve> = {
  "out-cubic": Easing.out(Easing.cubic),
  "in-cubic": Easing.in(Easing.cubic),
  "in-out-cubic": Easing.inOut(Easing.cubic),
  // Material 3 (`md.sys.motion.easing.standard` / single-bezier `emphasized`) & NSH `snappy`
  standard: Easing.bezier(0.2, 0, 0, 1),
  // Material 3 (`md.sys.motion.easing.emphasized-decelerate`)
  "emphasized-decelerate": Easing.bezier(0.05, 0.7, 0.1, 1),
  // Material 3 (`md.sys.motion.easing.emphasized-accelerate`)
  "emphasized-accelerate": Easing.bezier(0.3, 0, 0.8, 0.15),
  // WinUI 3 Fast Out, Slow In (`0,0,0,1`) & M3 `standard-decelerate`
  decelerate: Easing.bezier(0, 0, 0, 1),
  // WinUI 3 Slow Out, Fast In (`1,0,1,1`)
  accelerate: Easing.bezier(1, 0, 1, 1),
  // WinUI 3 Existing Elements / Point-to-Point (`0.55,0.55,0,1`, windows-dev-docs)
  "point-to-point": Easing.bezier(0.55, 0.55, 0, 1),
};

const resolveMotion = (raw: Spring | TimingSpec): Spring | Timing =>
  "duration" in raw ? { duration: raw.duration, timingFunction: easings[raw.timingFunction] } : raw;

/**
 * A reactive proxy over a `Spring | Timing` motion role so controls created before `selectTheme`
 * dynamically pick up shape switches between `Spring` and `Timing` when they animate or render.
 */
const motionRole = (read: () => Spring | TimingSpec): Spring | Timing => {
  const current = computed(() => resolveMotion(read()));
  return new Proxy({} as Spring | Timing, {
    get: (_, key) => Reflect.get(current(), key),
    has: (_, key) => key in current(),
    ownKeys: () => Reflect.ownKeys(current()),
    getOwnPropertyDescriptor: (_, key) => {
      const value = current();
      if (!(key in value)) return undefined;
      return { enumerable: true, configurable: true, value: Reflect.get(value, key) };
    },
  });
};

/**
 * The motion every control shares: quick, slightly springy (or timed when a theme supplies
 * `{ duration, timingFunction }`). `control` and `move` are gpui-kit's `spring_control` (a 180 ms
 * response, no overshoot: a mark or a fill coming and going) and `spring_move` (280 ms, a
 * damping ratio of 0.85: a thumb or an indicator traveling) as a unit mass's stiffness
 * (2π / response)² and damping 2 · ratio · 2π / response.
 */
export const motion = {
  press: motionRole(() => style().motion.press),
  settle: motionRole(() => style().motion.settle),
  control: motionRole(() => style().motion.control),
  move: motionRole(() => style().motion.move),
  get enter(): Timing {
    const { duration, timingFunction } = style().transition.enter;
    return { duration, timingFunction: easings[timingFunction] };
  },
  get shake() {
    return { duration: style().duration.shake };
  },
};

/**
 * Drive `value` to `to` using `config` (a theme `Spring` or `Timing`, `motion.control` by
 * default). Lands immediately when `reduceMotion()` is active. Optional `springExtra` (such as an
 * initial `velocity`) applies only when `config` is a spring.
 */
export function animate(
  value: AnimatedValue,
  to: number,
  config: Spring | Timing = motion.control,
  springExtra?: { velocity?: number; mass?: number },
): Promise<{ finished: boolean }> {
  if (reduceMotion()) {
    value.set(to);
    return Promise.resolve({ finished: true });
  }
  if (isTiming(config)) {
    return value.timing(to, { duration: config.duration, easing: config.timingFunction });
  }
  return value.spring(to, {
    stiffness: config.stiffness,
    damping: config.damping,
    ...springExtra,
  });
}

/**
 * An animated value that springs or times to `target` each time it changes (a
 * control's state: 1 while on, 0 while off), natively: JS only starts each
 * animation. A change mid-way turns it from where it is, with its velocity when
 * springing; with reduced motion it lands at once. For discrete changes only: what
 * the pointer drives (a dragged thumb, a hover's place) is set in the same
 * frame, never animated toward the pointer.
 */
export function follow(
  target: () => number,
  config: Spring | Timing = motion.control,
): AnimatedValue {
  const v = createAnimatedValue(target());
  let shown = target();
  effect(() => {
    const next = target();
    if (next === shown) return;
    shown = next;
    void animate(v, next, config);
  });
  return v;
}

/**
 * A pressable under the pointer (`hoverStyle`): when `state.overlay.hover` is 0 (the default:
 * swap fills), returns the theme's `hover` background; when `state.overlay.hover > 0`, returns a
 * state-layer wash of `ink` (default `"foreground"`), stacked over `under` (any underlying
 * `backgroundImage`). Leave it off a disabled control and, where a theme uses swap fills, off a
 * selected one whose own fill shows.
 */
export const hovered = (ink: keyof Tokens = "foreground", under?: string): ViewStyle => {
  if (style().state.overlay.hover <= 0) {
    return { backgroundColor: token("hover") };
  }
  return stateLayer("hover", ink, under);
};

/**
 * The keyboard focus (`focusVisibleStyle`: not after a click or a tap):
 * - `"halo"`: `borderColor` turns `ring` and a halo of `ring-halo` (`focus.width` points, 3 by default) sits outside.
 * - `"outline"`: `borderColor` stays untouched; `outlineColor` is `ring`.
 * - `"double"`: `borderColor` stays untouched; a 1 px line of `ring-halo` hugs the edge (a spread shadow, which
 *   stands in for the surface's own shadow while focused) and the `focus.width` outline of `ring` lies just outside
 *   it, so the outline's offset grows by that 1 px (WinUI 3's `FocusStrokeColorInner` / `Outer`).
 */
export const focusRing = (offset?: number): ViewStyle => {
  const { style: look, width, offset: base } = style().dimension.focus;
  const ringOutline: ViewStyle = {
    outlineStyle: "solid",
    outlineWidth: width,
    outlineColor: token(look === "halo" ? "ring-halo" : "ring"),
    outlineOffset: offset ?? base,
  };
  if (look === "halo") {
    return {
      borderColor: token("ring"),
      ...ringOutline,
    };
  }
  if (look === "double") {
    return {
      ...ringOutline,
      outlineOffset: (offset ?? base) + 1,
      boxShadow: `0 0 0 1px ${token("ring-halo")}`,
    };
  }
  return ringOutline;
};
// @port end

/*
 * Below: this library's own, with no upstream origin.
 */

/**
 * A theme's fill for a run, a bar or a slider's range: its gradient, and the color under it. The
 * gradient carries the color (a flat theme repeats one color in both stops); the theme keeps its
 * `backgroundColor` transparent, since a color under the gradient shows through and tints the run.
 */
export function fillStyle(): ViewStyle {
  return {
    backgroundColor: finish.fill.backgroundColor,
    backgroundImage: finish.fill.backgroundImage,
  };
}

/** Default width in points of the hairline edge drawn by `insetEdge` and `outerEdge`. */
export const EDGE_WIDTH = 1;

function edgeShadow(
  borderColor: string | undefined,
  boxShadow: string | undefined,
  width: number,
  inset: boolean,
): string {
  const line = borderColor ? `${inset ? "inset " : ""}0 0 0 ${width}px ${borderColor}` : undefined;
  const shade = boxShadow && boxShadow !== "none" ? boxShadow : undefined;
  const parts = [line, shade].filter((part) => part !== undefined);
  return parts.length === 0 ? "none" : parts.join(", ");
}

/**
 * A rail's edge: a `width`-point inset line of `borderColor` inside the theme's `boxShadow`,
 * whichever of the two the theme gives. `semantics.json` may write `shadow: "none"` or leave
 * the border color out, and a rail that joined the absent one after a comma would void the whole
 * declaration (`none, inset …` is not a shadow).
 */
export function insetEdge(
  borderColor: string | undefined,
  boxShadow: string | undefined,
  width = EDGE_WIDTH,
): string {
  return edgeShadow(borderColor, boxShadow, width, true);
}

/**
 * A handle's outer edge: a `width`-point outer line of `borderColor` around the theme's
 * `boxShadow`, sharing the same border/shadow normalization as `insetEdge`.
 */
export function outerEdge(
  borderColor: string | undefined,
  boxShadow: string | undefined,
  width = EDGE_WIDTH,
): string {
  return edgeShadow(borderColor, boxShadow, width, false);
}
