/**
 * Shared types, extension namespace, and canonical naming tables for the DTCG 2025.10 spike.
 */

export const EXT_NS = "dev.aning.shadcn-nsh";
export const FORMAT_SCHEMA_URL = "https://www.designtokens.org/schemas/2025.10/format.json";
export const RESOLVER_SCHEMA_URL = "https://www.designtokens.org/schemas/2025.10/resolver.json";

export interface DtcgDimension {
  value: number;
  unit: "px" | "rem";
}

export interface DtcgDuration {
  value: number;
  unit: "ms" | "s";
}

export interface DtcgColor {
  colorSpace: "oklch" | "srgb";
  components: [number, number, number];
  alpha?: number;
  hex?: string;
}

export interface DtcgShadowItem {
  color: DtcgColor | string;
  offsetX: DtcgDimension;
  offsetY: DtcgDimension;
  blur: DtcgDimension;
  spread: DtcgDimension;
  inset?: boolean;
}

export interface DtcgGradientStop {
  color: DtcgColor | string;
  position: number;
}

export interface DtcgTransition {
  duration: DtcgDuration;
  delay: DtcgDuration;
  timingFunction: [number, number, number, number] | string;
}

export interface DtcgTypography {
  fontFamily: string | string[];
  fontSize: DtcgDimension | string;
  fontWeight: number;
  lineHeight: number | string;
  letterSpacing: DtcgDimension;
}

export type ColorOpExtension =
  | {
      op: "mix";
      space: "srgb";
      a: DtcgColor | string;
      percent: number;
      /** Target color (`{color.*}`, DTCG color object, or `"transparent"`). */
      b: DtcgColor | string;
    }
  | {
      op: "alpha";
      color: string;
      alpha: number;
    };

/** Named cubic-bezier curves matching `packages/theme/theme.ts` (`easings`). */
export const NAMED_CUBIC_BEZIERS: Record<
  string,
  { value: [number, number, number, number]; nshEasing?: string; description: string }
> = {
  "out-cubic": {
    value: [0.333333, 1, 0.666667, 1],
    nshEasing: "out-cubic",
    description: "Exact cubic-bezier equivalent of NSH Easing.out(Easing.cubic).",
  },
  "in-cubic": {
    value: [0.333333, 0, 0.666667, 0],
    nshEasing: "in-cubic",
    description: "Exact cubic-bezier equivalent of NSH Easing.in(Easing.cubic).",
  },
  "in-out-cubic": {
    value: [0.65, 0, 0.35, 1],
    nshEasing: "in-out-cubic",
    description: "Cubic approximation of NSH Easing.inOut(Easing.cubic).",
  },
  standard: {
    value: [0.2, 0, 0, 1],
    description: "Material 3 md.sys.motion.easing.standard.",
  },
  "emphasized-decelerate": {
    value: [0.05, 0.7, 0.1, 1],
    description: "Material 3 emphasized-decelerate curve.",
  },
  "emphasized-accelerate": {
    value: [0.3, 0, 0.8, 0.15],
    description: "Material 3 emphasized-accelerate curve.",
  },
  decelerate: {
    value: [0, 0, 0, 1],
    description: "WinUI 3 / Fluent 2 Direct Entrance decelerate curve.",
  },
  accelerate: {
    value: [1, 0, 1, 1],
    description: "WinUI 3 / Fluent 2 Gentle Exit accelerate curve.",
  },
  "easy-ease": {
    value: [0.33, 0, 0.67, 1],
    description: "Fluent Web curveEasyEase.",
  },
  "point-to-point": {
    value: [0.55, 0.55, 0, 1],
    description: "WinUI 3 Point-to-Point motion curve.",
  },
};

export const RADIUS_KEYS = [
  { cssVar: "radius", dtcg: "base" },
  { cssVar: "radius-card", dtcg: "card" },
  { cssVar: "radius-control", dtcg: "control" },
  { cssVar: "radius-field", dtcg: "field" },
  { cssVar: "radius-chip", dtcg: "chip" },
  { cssVar: "radius-overlay", dtcg: "overlay" },
  { cssVar: "radius-dialog", dtcg: "dialog" },
  { cssVar: "radius-sheet", dtcg: "sheet" },
] as const;

export const TYPE_ROLES = [
  "caption",
  "detail",
  "body",
  "label",
  "title",
  "headline",
  "display",
] as const;

export const SHAPE_ROLES = [
  "control",
  "field",
  "chip",
  "card",
  "overlay",
  "dialog",
  "sheet",
  "inset",
] as const;

export const COLOR_ROLES = ["surface", "ink", "brand", "status", "chrome"] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

export interface DesignMdExtension {
  overview?: string;
  elevation?: string;
  dos?: string[];
  donts?: string[];
  sharedDos?: string[];
  sharedDonts?: string[];
  voiceOmitted?: string;
}

/** Semantic color-role grouping for every token in `color.*` (84 total: 11 C-layer + 73 A/B-layer). */
export const COLOR_ROLE_BY_NAME: Record<string, ColorRole> = {
  // surface (17 A/B-layer + 2 C-layer)
  background: "surface",
  card: "surface",
  popover: "surface",
  dialog: "surface",
  secondary: "surface",
  muted: "surface",
  accent: "surface",
  inset: "surface",
  raised: "surface",
  field: "surface",
  hover: "surface",
  disabled: "surface",
  track: "surface",
  knob: "surface",
  inverse: "surface",
  sidebar: "surface",
  "sidebar-accent": "surface",
  media: "surface",
  scrim: "surface",

  // ink (15 A/B-layer + 2 C-layer)
  foreground: "ink",
  "card-foreground": "ink",
  "popover-foreground": "ink",
  "secondary-foreground": "ink",
  "muted-foreground": "ink",
  "accent-foreground": "ink",
  "disabled-foreground": "ink",
  "on-foreground": "ink",
  "pressed-foreground": "ink",
  faint: "ink",
  code: "ink",
  "inverse-foreground": "ink",
  "inverse-muted": "ink",
  "sidebar-foreground": "ink",
  "sidebar-accent-foreground": "ink",
  "on-media": "ink",
  "chart-foreground": "ink",

  // brand (11 A/B-layer + 2 C-layer)
  primary: "brand",
  "primary-foreground": "brand",
  brand: "brand",
  "brand-edge": "brand",
  "brand-tint": "brand",
  "on-brand-tint": "brand",
  "accent-pressed": "brand",
  "on-accent-pressed": "brand",
  "inverse-brand": "brand",
  "sidebar-primary": "brand",
  "sidebar-primary-foreground": "brand",
  "brand-fill": "brand",
  "on-brand": "brand",

  // status (16 A/B-layer)
  destructive: "status",
  "destructive-tint": "status",
  info: "status",
  "info-tint": "status",
  warn: "status",
  "warn-tint": "status",
  up: "status",
  "up-tint": "status",
  down: "status",
  "down-tint": "status",
  violet: "status",
  "chart-1": "status",
  "chart-2": "status",
  "chart-3": "status",
  "chart-4": "status",
  "chart-5": "status",

  // chrome (14 A/B-layer + 5 C-layer)
  border: "chrome",
  input: "chrome",
  ring: "chrome",
  "ring-halo": "chrome",
  line: "chrome",
  "card-edge": "chrome",
  bevel: "chrome",
  "accent-bevel": "chrome",
  "glass-edge": "chrome",
  "scrollbar-thumb": "chrome",
  "scrollbar-thumb-hover": "chrome",
  "sidebar-border": "chrome",
  "sidebar-ring": "chrome",
  "window-control-off": "chrome",
  "window-close": "chrome",
  "window-minimize": "chrome",
  "window-zoom": "chrome",
  "window-control-ink": "chrome",
  "window-control-edge": "chrome",
};
