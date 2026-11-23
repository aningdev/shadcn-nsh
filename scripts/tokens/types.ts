/**
 * Shared types, extension namespace, and canonical naming tables for the DTCG 2025.10 spike.
 */

export const EXT_NS = "dev.aning.shadcn-nsh";
export const FORMAT_SCHEMA_URL = "https://www.designtokens.org/schemas/2025.10/format.json";
export const RESOLVER_SCHEMA_URL = "https://www.designtokens.org/schemas/2025.10/resolver.json";

/** A plain object: not `null`, not an array. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** A token node: an object carrying `$value` (a group carries `$extensions` instead). */
export const isTokenNode = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && Object.hasOwn(value, "$value");

/** The `dev.aning.shadcn-nsh` extension a token or group carries, when it has one. */
export function getExt(node: unknown): Record<string, unknown> | undefined {
  if (!isRecord(node) || !isRecord(node.$extensions)) return undefined;
  const ns = node.$extensions[EXT_NS];
  return isRecord(ns) ? ns : undefined;
}

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

/**
 * A `shadow` token's value: its layers, or — in a finish, which never writes a shadow of its own —
 * the scale's parts it is made of (`["{shadow.edge.surface}", "{shadow.sm}"]`). The compiler joins
 * them into one CSS `boxShadow`; a part of `null` (a flat theme's edge) is skipped.
 */
export type DtcgShadowValue = DtcgShadowItem[] | string[];

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
    description: "WinUI 3 Fast Out, Slow In curve (entering elements).",
  },
  accelerate: {
    value: [1, 0, 1, 1],
    description: "WinUI 3 Slow Out, Fast In curve (exiting elements).",
  },
  "point-to-point": {
    value: [0.55, 0.55, 0, 1],
    description: "WinUI 3 Point-to-Point motion curve.",
  },
};

export const RADIUS_KEYS = [
  { cssVar: "radius-control", dtcg: "control" },
  { cssVar: "radius-container", dtcg: "container" },
  { cssVar: "radius-modal", dtcg: "modal" },
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

export const SHAPE_ROLES = ["control", "container", "modal"] as const;

/**
 * The six control dimensions a theme decides (`dimension.control`): behaviour-named axes, one value
 * each, not a per-platform preset. A control reads the axis it draws and falls back on its own
 * where a value cannot express it (`docs/specs/theme-contract-v2.md` §11.4).
 */
export const CONTROL_DIMENSIONS = [
  "selection",
  "field",
  "choice",
  "track",
  "handle",
  "group",
] as const;
export type ControlDimension = (typeof CONTROL_DIMENSIONS)[number];

/** The motion roles every theme states: the three speeds, then `state`'s fade. */
export const MOTION_ROLES = ["fast", "default", "slow", "state"] as const;

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

/** Semantic color-role grouping for every token in `color.*` (59 total: 3 C-layer + 56 A/B-layer). */
export const COLOR_ROLE_BY_NAME: Record<string, ColorRole> = {
  // surface (15 A/B-layer + 2 C-layer)
  background: "surface",
  card: "surface",
  popover: "surface",
  secondary: "surface",
  muted: "surface",
  accent: "surface",
  inset: "surface",
  raised: "surface",
  field: "surface",
  hover: "surface",
  track: "surface",
  knob: "surface",
  inverse: "surface",
  sidebar: "surface",
  "sidebar-accent": "surface",
  media: "surface",
  scrim: "surface",

  // ink (10 A/B-layer + 1 C-layer)
  foreground: "ink",
  "card-foreground": "ink",
  "popover-foreground": "ink",
  "secondary-foreground": "ink",
  "muted-foreground": "ink",
  "accent-foreground": "ink",
  faint: "ink",
  "inverse-foreground": "ink",
  "sidebar-foreground": "ink",
  "sidebar-accent-foreground": "ink",
  "on-media": "ink",

  // brand (8 A/B-layer)
  primary: "brand",
  "primary-foreground": "brand",
  brand: "brand",
  "brand-edge": "brand",
  "brand-tint": "brand",
  "inverse-brand": "brand",
  "sidebar-primary": "brand",
  "sidebar-primary-foreground": "brand",

  // status (15 A/B-layer)
  destructive: "status",
  "destructive-tint": "status",
  info: "status",
  "info-tint": "status",
  warn: "status",
  "warn-tint": "status",
  up: "status",
  "up-tint": "status",
  "down-tint": "status",
  violet: "status",
  "chart-1": "status",
  "chart-2": "status",
  "chart-3": "status",
  "chart-4": "status",
  "chart-5": "status",

  // chrome (8 A/B-layer)
  border: "chrome",
  input: "chrome",
  ring: "chrome",
  "ring-halo": "chrome",
  line: "chrome",
  "glass-edge": "chrome",
  "sidebar-border": "chrome",
  "sidebar-ring": "chrome",
};
