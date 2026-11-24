/**
 * The scope of a theme's customization (docs/decisions/0007-theme-customization-scope.md), as the
 * lint reads it: which colour keys a theme may state, which of them it writes a value for, and
 * which of them it can only point at; the control dimensions; and the type scale, which no theme
 * owns (docs/decisions/0009-no-theme-type-scale.md). `theme-lint` runs it on every compiled
 * theme; the fixtures in `whitelist.test.ts` show what it refuses.
 */

/** ADR 0007 §4: the colours a theme writes a value for (15). */
export const sourceColours: readonly string[] = [
  "primary",
  "primary-foreground",
  "secondary",
  "foreground",
  "muted-foreground",
  "faint",
  "background",
  "card",
  "muted",
  "border",
  "line",
  "destructive",
  "warn",
  "info",
  "up",
];

/** Colours that are fixed by what they sit on, not by the theme's palette: they stay literal. */
export const constantColours: readonly string[] = ["scrim", "media", "on-media"];

/** ADR 0007 §4: the `*-tint` colours share one formula, `color-mix(in srgb, <source> N%, transparent)`. */
export const tintColours: readonly string[] = [
  "brand-tint",
  "info-tint",
  "warn-tint",
  "destructive-tint",
  "up-tint",
  "down-tint",
];

/** ADR 0007 §4: the `chart-*` series point at a source, or at a grey derived from `foreground`. */
export const chartColours: readonly string[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

/** The colours a theme only points at: shadcn / NSH slots and the library's own roles. */
export const referenceColours: readonly string[] = [
  "card-foreground",
  "popover",
  "popover-foreground",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "input",
  "ring",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "inset",
  "raised",
  "field",
  "track",
  "knob",
  "hover",
  "brand",
  "brand-edge",
  "inverse",
  "inverse-foreground",
  "inverse-brand",
  ...tintColours,
  ...chartColours,
];

/** ADR 0007 §1: the control dimensions a theme chooses a form for. */
export const controlDimensions: readonly string[] = ["field", "choice", "track", "handle"];

/** A colour literal: anything that is a value of its own and not a pointer. */
const literal = /oklch\(|#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklab|lab|lch|color)\(/i;

const tintFormula = /^color-mix\(in srgb, var\(--[a-z-]+\) (\d+)%, transparent\)$/;
const chartForms = [
  new RegExp(`^var\\(--(?:${sourceColours.join("|")})\\)$`),
  /^color-mix\(in srgb, var\(--foreground\) \d+%, var\(--background\)\)$/,
];

/** The parts of a compiled theme the whitelist reads. */
export interface WhitelistTheme {
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export interface WhitelistSemantics {
  typography: Record<string, { fontSize: unknown; lineHeight: unknown }>;
  dimension: { control: Record<string, unknown> };
}

/** Every way `theme` steps outside the whitelist, each as one sentence naming `path`. */
export function checkWhitelist(
  path: string,
  theme: WhitelistTheme,
  semantics: WhitelistSemantics,
  shared: WhitelistSemantics,
): string[] {
  const problems: string[] = [];
  const sources = new Set(sourceColours);
  const references = new Set(referenceColours);
  const constants = new Set(constantColours);

  for (const key of Object.keys(theme.cssVars.theme))
    if (key.startsWith("font-"))
      problems.push(`${path}: \`${key}\` is a font family; a theme owns none (ADR 0009)`);

  const tints = new Set<string>();
  for (const section of ["theme", "light", "dark"] as const) {
    for (const [key, value] of Object.entries(theme.cssVars[section])) {
      if (key === "radius" || key.startsWith("radius-") || key.startsWith("font-")) continue;
      const where = `${path}: ${section}.${key}`;
      if (!sources.has(key) && !references.has(key) && !constants.has(key)) {
        problems.push(
          `${where} is no source or reference colour of ADR 0007 (a theme states no other colour key)`,
        );
        continue;
      }
      if (sources.has(key) || constants.has(key)) continue;
      if (tintColours.includes(key)) {
        const match = tintFormula.exec(value);
        if (!match)
          problems.push(
            `${where} is \`${value}\`, not color-mix(in srgb, <source> N%, transparent)`,
          );
        else tints.add(match[1]!);
      } else if (chartColours.includes(key)) {
        if (!chartForms.some((form) => form.test(value)))
          problems.push(`${where} is \`${value}\`, not a source or a grey derived from foreground`);
      } else if (literal.test(value)) {
        problems.push(`${where} writes \`${value}\`; it only points at a source (\`var(--…)\`)`);
      }
    }
  }
  if (tints.size > 1)
    problems.push(
      `${path}: the *-tint colours use ${[...tints].join(", ")}%; one number per theme`,
    );

  for (const key of Object.keys(semantics.dimension.control))
    if (!controlDimensions.includes(key))
      problems.push(
        `${path}: dimension.control.${key} is not one of ${controlDimensions.join(", ")} (ADR 0007)`,
      );
  for (const key of controlDimensions)
    if (!(key in semantics.dimension.control))
      problems.push(`${path}: dimension.control.${key} is missing`);

  for (const [role, own] of Object.entries(semantics.typography)) {
    const base = shared.typography[role];
    for (const field of ["fontSize", "lineHeight"] as const)
      if (JSON.stringify(own[field]) !== JSON.stringify(base?.[field]))
        problems.push(
          `${path}: typography.${role}.${field} differs from the shared scale (ADR 0009)`,
        );
  }
  return problems;
}
