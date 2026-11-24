/**
 * The themes the docs site shows: each palette of the demos (`demos/palettes.ts`) with the theme
 * it draws — `packages/theme/themes/<id>/theme.json` and the `semantics.json` beside it — as the
 * build has them. `import.meta.glob` reads every theme file once, eagerly, so a theme page is
 * drawn from the same JSON at build time and in the browser — no `node:fs`, and the page prerenders
 * like any other. `check:pages` holds the registry items and the theme pages to the same list, so a
 * theme is never written twice here.
 *
 * What the page says about a token's layer and a finish's duty is the spec's, read as text
 * (`docs/specs/theme-roles.md` through `scripts/theme/spec.ts`), so the page keeps no second list:
 * the A layer is the spec's 31 slots, the C layer is `cssVars.theme`, the B layer is the light
 * tokens that are neither, and every finish is the spec's row.
 *
 * `theme.json`'s `name` is the theme's own name — the same one `AppTheme.label` carries in the
 * `index.ts` beside it. The palette's `label` is the switch's shorter name for the same theme.
 */
import specText from "../../../../docs/specs/theme-roles.md?raw";
import { specParts } from "../../../../scripts/theme/spec";
import { PALETTES, type Palette, type PaletteId } from "../../demos/palettes";

/** A theme file in shadcn's `cssVars` shape, as `theme.json` writes it. */
export type ThemeFile = {
  name: string;
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
};

/** The fields a finish may draw with, in `semantics.json`'s order. */
export const FINISH_FIELDS = [
  "background",
  "gradient",
  "shadow",
  "border-color",
  "border-top-color",
  "border-bottom-color",
  "backdropFilter",
] as const;

/** A finish as a theme file writes it: the fields it draws with; `null` clears a field the shared finish set. */
type WrittenFinish = Partial<Record<(typeof FINISH_FIELDS)[number], string | null>>;

/** A finish after merging: the fields it draws with, and nothing else. */
export type Finish = Partial<Record<(typeof FINISH_FIELDS)[number], string>>;

/** A theme's semantics, as `semantics.json` writes them. */
export type SemanticsFile = {
  finishes: {
    shared: Record<string, WrittenFinish>;
    light: Record<string, WrittenFinish>;
    dark: Record<string, WrittenFinish>;
  };
};

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

/** One layer of the spec: the shadcn slots, the library's own tokens, or the shared `theme` block. */
export type TokenGroup = {
  id: "slots" | "extension" | "shared";
  title: string;
  note: string;
  rows: TokenRow[];
};

/** One row of a theme's finish table: the spec's words, and the tokens the theme draws it from. */
export type FinishRow = {
  role: string;
  /** What it draws, in the spec's words. */
  draws: string;
  /** The same in English: the spec's English column, which is what the page shows. */
  drawsEn: string;
  /** Who reads it: the components the spec names, or its dash for one the library leaves out. */
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
  /** The theme's tokens, one group per layer of the spec. */
  tokens: TokenGroup[];
  /** The theme's finishes, in the spec's order. */
  finishes: FinishRow[];
};

/** `packages/theme/themes/<id>/theme.json`, every one of them, as the build reads them. */
const FILES = import.meta.glob("../../../../packages/theme/themes/*/theme.json", {
  eager: true,
  import: "default",
}) as Record<string, ThemeFile>;

/** `packages/theme/themes/<id>/semantics.json`, every one of them. */
const SEMANTICS = import.meta.glob("../../../../packages/theme/themes/*/semantics.json", {
  eager: true,
  import: "default",
}) as Record<string, SemanticsFile>;

/** The spec, as the page reads it: the A and C layers and every finish's row. */
const SPEC = specParts(specText);

/** The theme file of a palette: `themes/<id>/theme.json` below `packages/theme`. */
function themeFile(id: string): ThemeFile {
  const file = FILES[`../../../../packages/theme/themes/${id}/theme.json`];
  if (!file) throw new Error(`no theme file for palette "${id}"`);
  return file;
}

/** The semantics of a palette: `themes/<id>/semantics.json` below `packages/theme`. */
function semanticsFile(id: string): SemanticsFile {
  const file = SEMANTICS[`../../../../packages/theme/themes/${id}/semantics.json`];
  if (!file) throw new Error(`no semantics file for palette "${id}"`);
  return file;
}

/** Merge `shared` with one appearance's sparse overrides into a complete finish map. */
function mergedFinishes(file: SemanticsFile, scheme: "light" | "dark"): Record<string, Finish> {
  const overrides = file.finishes[scheme] ?? {};
  const roles = [...new Set([...Object.keys(file.finishes.shared), ...Object.keys(overrides)])];
  return Object.fromEntries(
    roles.map((role) => [
      role,
      Object.fromEntries(
        Object.entries({ ...file.finishes.shared[role], ...overrides[role] }).filter(
          ([, value]) => value !== null,
        ),
      ) as Finish,
    ]),
  );
}

/**
 * A value with the theme's own references filled in (`var(--card)` in `theme.json`, `{card}` in
 * `semantics.json`), so a swatch can draw it: the appearance's map first, then the `theme` block.
 * Values the theme does not define are left as written.
 */
function filled(value: string, vars: Record<string, string>): string {
  let out = value;
  for (let depth = 0; depth < 4; depth += 1) {
    const next = out
      .replace(/\{([\w-]+)\}/g, (whole: string, name: string) => vars[name] ?? whole)
      .replace(/var\(--([\w-]+)\)/g, (whole: string, name: string) => vars[name] ?? whole);
    if (next === out) break;
    out = next;
  }
  // A relative colour — a token's own colour at another alpha (`oklch(from {card} l c h /
  // 0.78)`) — is written out whole once its reference is filled in: `theme.ts` draws it as a
  // concrete `oklch(L C H / a)` (NSH's parser reads no relative colour), and the sample should be
  // the colour the theme draws, not one a browser alone can.
  const relative = /^oklch\(from (oklch\([^)]*\)) l c h \/ ([\d.]+)\)$/.exec(out);
  const channels = relative && /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(relative[1]!);
  if (relative !== null && channels !== null)
    out = `oklch(${channels[1]} ${channels[2]} ${channels[3]} / ${relative[2]})`;
  return out;
}

/** A theme's variables for one appearance: its `theme` block, then that appearance over it. */
function varsOf(file: ThemeFile, scheme: "light" | "dark"): Record<string, string> {
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
      throw new Error(`theme "${file.name}" states no "${name}", which the spec names`);
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

/** The tokens a finish names across its values, in the order they first appear. */
function tokensOf(semantics: SemanticsFile, role: string): string[] {
  const names = new Set<string>();
  for (const scheme of ["light", "dark"] as const) {
    const finish = mergedFinishes(semantics, scheme)[role];
    if (!finish) continue;
    for (const field of FINISH_FIELDS) {
      const value = finish[field];
      if (value === undefined) continue;
      for (const match of value.matchAll(/\{([\w-]+)\}/g)) names.add(match[1]!);
    }
  }
  return [...names];
}

/** Every palette the demos offer, with its theme and semantics read. */
export function themePages(): ThemePage[] {
  return PALETTES.map((palette) => {
    const file = themeFile(palette.id);
    const semantics = semanticsFile(palette.id);
    const extension = Object.keys(file.cssVars.light).filter((name) => !SPEC.slots.includes(name));
    return {
      palette,
      name: file.name,
      item: `theme-${palette.id}`,
      tokens: [
        {
          id: "slots",
          title: "The slots NSH resolves",
          note: `shadcn's ${SPEC.slots.length}, the names an app's components ask the theme for.`,
          rows: tokenRows(file, SPEC.slots, false),
        },
        {
          id: "extension",
          title: "The library's own tokens",
          note: "What this library's components ask for beside the slots.",
          rows: tokenRows(file, extension, false),
        },
        {
          id: "shared",
          title: "The shared values",
          note: "The same in both appearances: a number, a font family, or a colour that does not turn.",
          rows: tokenRows(file, Object.keys(file.cssVars.theme), true),
        },
      ],
      finishes: SPEC.finishes.map(({ role, draws, drawsEn, reads }) => ({
        role,
        draws,
        drawsEn,
        reads,
        tokens: tokensOf(semantics, role),
      })),
    };
  });
}

/**
 * The stylesheet the finish samples draw with: one rule per finish of every theme, its values
 * taken from that theme's `semantics.json` with the references filled in, and a ground of that
 * theme's `background` for the sample to sit on. Both follow `html.dark`, so a sample on the page
 * shows the theme it names in the appearance the site is in — not the site's own palette.
 */
export function finishSampleCss(): string {
  const rules: string[] = [];
  for (const palette of PALETTES) {
    const file = themeFile(palette.id);
    const semantics = semanticsFile(palette.id);
    const ground = (scheme: "light" | "dark") => {
      const vars = varsOf(file, scheme);
      return `background-color:${filled(vars.background ?? "transparent", vars)};`;
    };
    rules.push(`[data-ground="${palette.id}"]{${ground("light")}}`);
    rules.push(`html.dark [data-ground="${palette.id}"]{${ground("dark")}}`);
    for (const scheme of ["light", "dark"] as const) {
      const vars = varsOf(file, scheme);
      const prefix = scheme === "dark" ? "html.dark " : "";
      for (const [role, finish] of Object.entries(mergedFinishes(semantics, scheme))) {
        const declarations: string[] = [];
        const value = (field: (typeof FINISH_FIELDS)[number]) => {
          const written = finish[field];
          return written === undefined ? undefined : filled(written, vars);
        };
        const backgroundColor = value("background");
        const backgroundImage = value("gradient");
        const boxShadow = value("shadow");
        const backdropFilter = value("backdropFilter");
        const borderColor = value("border-color");
        const borderTopColor = value("border-top-color");
        const borderBottomColor = value("border-bottom-color");
        if (backgroundColor !== undefined)
          declarations.push(`background-color:${backgroundColor};`);
        if (backgroundImage !== undefined)
          declarations.push(`background-image:${backgroundImage};`);
        if (boxShadow !== undefined) declarations.push(`box-shadow:${boxShadow};`);
        if (backdropFilter !== undefined) declarations.push(`backdrop-filter:${backdropFilter};`);
        if (borderColor !== undefined) declarations.push(`border:1px solid ${borderColor};`);
        if (borderTopColor !== undefined) declarations.push(`border-top-color:${borderTopColor};`);
        if (borderBottomColor !== undefined)
          declarations.push(`border-bottom-color:${borderBottomColor};`);
        rules.push(`${prefix}[data-sample="${palette.id}-${role}"]{${declarations.join("")}}`);
      }
    }
  }
  return rules.join("\n");
}

/**
 * The site's own colours (`--color-fd-<name>`, Fumadocs' names) and the theme token each one is
 * drawn from: the docs chrome is drawn in the palette the demos are. Mostly the token of the same
 * name; Fumadocs' primary is ink too (the current page's link, the outline's marker), so it is the
 * theme's `brand`, the accent that reads as text — the theme's `primary` is a fill (the default
 * theme's is a pale citrus no text could be on a light page) — and what sits on it is the page's
 * background.
 */
const SITE_ROLES: [site: string, role: string][] = [
  ["background", "background"],
  ["foreground", "foreground"],
  ["muted", "muted"],
  ["muted-foreground", "muted-foreground"],
  ["popover", "popover"],
  ["popover-foreground", "popover-foreground"],
  ["card", "card"],
  ["card-foreground", "card-foreground"],
  ["border", "border"],
  ["primary", "brand"],
  ["primary-foreground", "background"],
  ["secondary", "secondary"],
  ["secondary-foreground", "secondary-foreground"],
  ["accent", "accent"],
  ["accent-foreground", "accent-foreground"],
  ["ring", "ring"],
];

/** The palette the site itself is drawn in, whatever the demos are switched to. */
const SITE_PALETTE: PaletteId = "shadcn";

/**
 * The stylesheet that draws the site: the Fumadocs colours from the shadcn theme's light tokens,
 * `.dark` from its dark ones. The sidebar is named too, since Fumadocs' preset sets a few of its
 * colours there again. The demo theme switch does not reach it: it changes the demos only.
 */
export function sitePaletteCss(): string {
  const file = themeFile(SITE_PALETTE);
  const block = (scheme: "light" | "dark", selector: string) => {
    const vars = varsOf(file, scheme);
    const lines = SITE_ROLES.filter(([, role]) => vars[role]).map(
      ([site, role]) => `--color-fd-${site}:${filled(vars[role]!, vars)};`,
    );
    return `${selector},${selector} #nd-sidebar{${lines.join("")}}`;
  };
  return block("light", "html") + block("dark", "html.dark");
}
