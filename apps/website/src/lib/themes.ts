/**
 * The themes the docs site shows: each palette of the demos (`demos/palettes.ts`) with the theme it
 * draws — `packages/theme/themes/<id>/index.ts` as `defineTheme()` compiled it (`ALL_THEMES`) and the
 * `theme.json` that `bun run tokens:build` exports from the same spec. `ALL_THEMES` is imported
 * once, eagerly, so a theme page is drawn from the same data at build time and in the browser — no
 * `node:fs`, and the page prerenders like any other. `check:pages` holds the registry items and the
 * theme pages to the same list, so a theme is never written twice here.
 *
 * The spec is the single source (`docs/decisions/0020-theme-v5.md`): the appearance roles are
 * `tokens.light`'s keys, the shared values are `cssVars.theme`, and the surfaces are `surfaces` —
 * eleven structural roles (`SurfaceRole`), each with the ink it falls back to. What a surface is for
 * is the one list this file keeps (`SURFACE_DUTIES`): the duties used to be read out of a spec page,
 * which Theme v5 deleted.
 *
 * `theme.json`'s `name` is the theme's own name — the same one `AppTheme.label` carries in the
 * `index.ts` beside it. The palette's `label` is the switch's shorter name for the same theme.
 */
import type {
  AppTheme,
  ColorExpr,
  ElevationScale,
  FaceExpr,
  Mode,
  ShadowExpr,
  SurfaceRole,
  SurfaceSpec,
  ThemeSpec,
} from "../../../../packages/theme/schema";
import { ALL_THEMES } from "../../../../packages/theme/themes/index";
import { PALETTES, type Palette, type PaletteId } from "../../demos/palettes";

/** A theme file in shadcn's `cssVars` shape, as `theme.json` writes it. */
export type ThemeFile = AppTheme["theme"];

/** One token, in both appearances: the value the theme writes and the one a swatch draws. */
export type TokenRow = {
  name: string;
  light: string;
  dark: string;
  lightSwatch: string;
  darkSwatch: string;
  /** The token this one is written as (`card: var(--background)` → `background`), else null. */
  aliasOf: string | null;
};

/** One layer of `theme.json`: the roles that turn with the appearance, or the shared values. */
export type TokenGroup = {
  id: "roles" | "shared";
  title: string;
  note: string;
  rows: TokenRow[];
};

/** One row of a theme's surface table: what the role is for, and the tokens the theme draws it from. */
export type SurfaceRow = {
  role: SurfaceRole;
  /** What it draws, and who reads it — this file's words (`SURFACE_DUTIES`). */
  draws: string;
  reads: string;
  /** Every token any of its values names, in the order they appear. */
  tokens: string[];
};

/** One palette as the themes page shows it. */
export type ThemePage = {
  palette: Palette;
  /** The theme's own name (`theme.json`'s `name`; `AppTheme.label` in its `index.ts`). */
  name: string;
  /** The registry item that installs it beside the build-time theme (`add <item>`). */
  item: string;
  /** The theme's own one-line overview, when it wrote one (`ThemeSpec.meta.overview`). */
  overview: string | null;
  /** The theme's tokens: the appearance roles, then the shared values. */
  tokens: TokenGroup[];
  /** The theme's surfaces, in `SurfaceRole`'s order. */
  surfaces: SurfaceRow[];
};

/** What a surface is for: the library's words, one row per structural role. */
const SURFACE_DUTIES: Record<SurfaceRole, { draws: string; reads: string }> = {
  card: {
    draws: "A section's ground: the theme's base surface, with its hairline and contact shadow.",
    reads: "`Card`, `Panel`, `Table`",
  },
  raised: {
    draws: "A tile standing on a card: the lifted face with a lit top edge and a soft shadow.",
    reads: "`Button` (raised), `Segmented`, a tab's thumb",
  },
  inset: {
    draws: "A well cut into a card: the recessed ground inputs and code sit in, shadow turned in.",
    reads: "`Input`, `Textarea`, a code block",
  },
  channel: {
    draws: "A narrow recess one step softer than a well: the groove a track or a divider sits in.",
    reads: "A slider's rail, a progress track",
  },
  plate: {
    draws: "A slim raised strip: the bar a toolbar or a row of tabs rests on.",
    reads: "`Toolbar`, `Tabs`' list",
  },
  overlay: {
    draws: "A floating panel above the page: the popover ground with the largest lift.",
    reads: "`Popover`, `DropdownMenu`, `Select`",
  },
  modal: {
    draws: "The heaviest floating ground: a dialog, a sheet, an alert.",
    reads: "`Dialog`, `AlertDialog`, `Sheet`",
  },
  inverse: {
    draws: "The flipped ground: dark on a light page, for a strip that has to stand apart.",
    reads: "`Toast`, a caption over media",
  },
  glass: {
    draws: "A translucent pane over content: blurred, tinted, lit along its top edge.",
    reads: "A title bar, a floating toolbar",
  },
  accent: {
    draws: "The accent fill and the ink that sits on it.",
    reads: "A primary `Button`, `Badge` (accent)",
  },
  fill: {
    draws: "The accent in its lit form: a gradient, a firm edge and a shadow under it.",
    reads: "A primary `Button`, a switch's thumb (on)",
  },
};

/** The palettes' themes, by id: the one list the pages read. */
const THEMES = new Map<string, AppTheme>(ALL_THEMES.map((theme) => [theme.id, theme]));

/** The theme of a palette: `themes/<id>/index.ts` through `ALL_THEMES`. */
function themeOf(id: PaletteId): AppTheme {
  const theme = THEMES.get(id);
  if (!theme) throw new Error(`no theme for palette "${id}"`);
  return theme;
}

/**
 * A value with the theme's own references filled in (`var(--card)` in `theme.json`), so a swatch can
 * draw it: the appearance's map first, then the `theme` block. Values the theme does not define are
 * left as written.
 */
function filled(value: string, vars: Record<string, string>): string {
  let out = value;
  for (let depth = 0; depth < 4; depth += 1) {
    const next = out.replace(
      /var\(--([\w-]+)\)/g,
      (whole: string, name: string) => vars[name] ?? whole,
    );
    if (next === out) break;
    out = next;
  }
  return out;
}

/** A theme's variables for one appearance: its `theme` block, then that appearance over it. */
function varsOf(file: ThemeFile, scheme: Mode): Record<string, string> {
  return { ...file.cssVars.theme, ...file.cssVars[scheme] };
}

/** The token a written value is, when it is a bare reference: `var(--background)` → `background`. */
function aliasOf(value: string): string | null {
  return /^var\(--([\w-]+)\)$/.exec(value)?.[1] ?? null;
}

/** The rows of one group, each read from its appearance (the shared block from either). */
function tokenRows(file: ThemeFile, names: string[], shared: boolean): TokenRow[] {
  const light = varsOf(file, "light");
  const dark = varsOf(file, "dark");
  return names.map((name) => {
    const lightValue = shared ? file.cssVars.theme[name] : file.cssVars.light[name];
    const darkValue = shared ? file.cssVars.theme[name] : file.cssVars.dark[name];
    if (lightValue === undefined || darkValue === undefined)
      throw new Error(`theme "${file.name}" states no "${name}", which its spec names`);
    return {
      name,
      light: lightValue,
      dark: darkValue,
      lightSwatch: filled(lightValue, light),
      darkSwatch: filled(darkValue, dark),
      aliasOf: aliasOf(lightValue),
    };
  });
}

/** The tokens a surface names across its values, in the order they first appear. */
function tokensOf(spec: ThemeSpec, role: SurfaceRole): string[] {
  const roles = new Set(Object.keys(spec.tokens.light));
  const names: string[] = [];
  const add = (name: string) => {
    if (roles.has(name) && !names.includes(name)) names.push(name);
  };
  const visit = (value: unknown) => {
    if (typeof value === "string") return add(value);
    if (Array.isArray(value)) return value.forEach(visit);
    if (value === null || typeof value !== "object") return;
    for (const [key, entry] of Object.entries(value)) {
      // `{surface: "accent"}` is a reference to a surface, not to the accent role; `{tint: "brand"}`
      // is the brand role at its tint alpha.
      if (key === "surface") continue;
      if (key === "tint" && typeof entry === "string") add(entry);
      else visit(entry);
    }
  };
  visit(spec.surfaces[role]);
  return names;
}

/** Every palette the demos offer, with its theme read. */
export function themePages(): ThemePage[] {
  return PALETTES.map((palette) => {
    const { spec, label, theme: file } = themeOf(palette.id);
    return {
      palette,
      name: label,
      item: `theme-${palette.id}`,
      overview: spec.meta?.overview ?? null,
      tokens: [
        {
          id: "roles",
          title: "The appearance roles",
          note: `shadcn's slots and this library's own, ${Object.keys(file.cssVars.light).length} of them, turning with the appearance.`,
          rows: tokenRows(file, Object.keys(file.cssVars.light), false),
        },
        {
          id: "shared",
          title: "The shared values",
          note: "The same in both appearances: the radii, the colours that do not turn, and the fonts when the theme sets them.",
          rows: tokenRows(file, Object.keys(file.cssVars.theme), true),
        },
      ],
      surfaces: (Object.keys(SURFACE_DUTIES) as SurfaceRole[])
        .filter((role) => spec.surfaces[role] !== undefined)
        .map((role) => ({
          role,
          ...SURFACE_DUTIES[role],
          tokens: tokensOf(spec, role),
        })),
    };
  });
}

/** An appearance's layer of a surface: what the role shares, then that appearance over it. */
function layerOf(surface: SurfaceSpec, scheme: Mode): SurfaceSpec {
  return { ...surface, ...(surface[scheme] ?? {}) };
}

/** A shadow expression as CSS, through the theme's own elevation scale (`null` for none). */
function shadowCss(theme: AppTheme, scheme: Mode, expression: ShadowExpr): string | null {
  if (expression === null) return null;
  const scale: ElevationScale = theme.spec.elevation[scheme];
  const parts = Array.isArray(expression) ? expression : [expression];
  const shadows = parts
    .map((part) => (part in scale ? scale[part as keyof ElevationScale] : part))
    .filter((value): value is string => typeof value === "string" && value !== "");
  return shadows.length === 0 ? null : shadows.join(", ");
}

/** A colour expression as a CSS colour, with the theme's references filled in (`null` for a surface.) */
function colorCss(theme: AppTheme, scheme: Mode, expression: ColorExpr | FaceExpr): string | null {
  const vars = varsOf(theme.theme, scheme);
  const base = (value: string) => filled(vars[value] ?? value, vars);
  if (typeof expression === "string") return base(expression);
  if ("surface" in expression) return null;
  if ("tint" in expression) {
    const alpha = expression.alpha ?? theme.spec.tokens.tintAlpha[scheme];
    return `color-mix(in srgb, ${base(expression.tint)} ${Math.round(alpha * 100)}%, transparent)`;
  }
  const color = base(expression.color);
  if (expression.alpha === undefined) return color;
  return `color-mix(in srgb, ${color} ${Math.round(expression.alpha * 100)}%, transparent)`;
}

/**
 * The stylesheet the surface samples draw with: one rule per surface of every theme, its values
 * taken from that theme's spec with the references filled in, and a ground of that theme's
 * `background` for the sample to sit on. Both follow `html.dark`, so a sample on the page shows the
 * theme it names in the appearance the site is in — not the site's own palette.
 */
export function surfaceSampleCss(): string {
  const rules: string[] = [];
  for (const palette of PALETTES) {
    const theme = themeOf(palette.id);
    const ground = (scheme: Mode) => {
      const vars = varsOf(theme.theme, scheme);
      return `background-color:${filled(vars.background ?? "transparent", vars)};`;
    };
    rules.push(`[data-ground="${palette.id}"]{${ground("light")}}`);
    rules.push(`html.dark [data-ground="${palette.id}"]{${ground("dark")}}`);
    for (const scheme of ["light", "dark"] as const) {
      const prefix = scheme === "dark" ? "html.dark " : "";
      const surfaces = Object.entries(theme.spec.surfaces) as [SurfaceRole, SurfaceSpec][];
      for (const [role, surface] of surfaces) {
        const layer = layerOf(surface, scheme);
        const declarations: string[] = [];
        const push = (name: string, value: string | null | undefined) => {
          if (value !== null && value !== undefined && value !== "") {
            declarations.push(`${name}:${value};`);
          }
        };
        push("background-color", layer.background && colorCss(theme, scheme, layer.background));
        push("background-image", layer.gradient);
        push("box-shadow", layer.shadow ? shadowCss(theme, scheme, layer.shadow) : null);
        push("backdrop-filter", layer.backdropFilter);
        const border = layer.border && colorCss(theme, scheme, layer.border);
        push("border", border ? `1px solid ${border}` : null);
        push("border-top-color", layer.borderTop && colorCss(theme, scheme, layer.borderTop));
        push(
          "border-bottom-color",
          layer.borderBottom && colorCss(theme, scheme, layer.borderBottom),
        );
        rules.push(`${prefix}[data-sample="${palette.id}-${role}"]{${declarations.join("")}}`);
      }
    }
  }
  return rules.join("\n");
}

/** The palette the site itself is drawn in, whatever the demos are switched to. */
const SITE_PALETTE: PaletteId = "shadcn";

/**
 * The stylesheet that draws the site: the Fumadocs colours (`--color-fd-<name>`) from the shadcn
 * theme's own roles, `.dark` from the dark ones. A Fumadocs colour of the same name as a role is
 * that role; Fumadocs' `primary` is ink where the theme's is a fill (the default theme's is a pale
 * citrus no text could be on a light page), so it is the theme's `brand`, and what sits on it is the
 * page's background. Fumadocs' `card-`, `popover-`, `secondary-` and `accent-foreground` are not
 * written: Theme v5 keeps one ink role, so those names keep Fumadocs' own default, which is that ink.
 * The demo theme switch does not reach the site: it changes the demos only.
 */
export function sitePaletteCss(): string {
  const file = themeOf(SITE_PALETTE).theme;
  const block = (scheme: Mode, selector: string) => {
    const vars = varsOf(file, scheme);
    const lines = Object.entries(file.cssVars[scheme]).map(
      ([name, value]) => `--color-fd-${name}:${filled(value, vars)};`,
    );
    if (vars.brand) lines.push(`--color-fd-primary:${filled(vars.brand, vars)};`);
    if (vars.background)
      lines.push(`--color-fd-primary-foreground:${filled(vars.background, vars)};`);
    return `${selector},${selector} #nd-sidebar{${lines.join("")}}`;
  };
  return block("light", "html") + block("dark", "html.dark");
}
