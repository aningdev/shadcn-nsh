/**
 * The scope of a theme's customization (docs/decisions/0007-theme-customization-scope.md,
 * docs/decisions/0012-derived-colours-are-defaults.md), as the lint reads it: every colour a theme
 * writes is a source or a reference, and a reference that states a value rather than pointing at a
 * source carries that value's provenance; the control dimensions; and the type scale, which no theme
 * owns (docs/decisions/0009-no-theme-type-scale.md). `theme-lint` runs it on every theme; the
 * fixtures in `whitelist.test.ts` show what it refuses.
 */
import {
  chartColours,
  constantColours,
  referenceColours,
  sourceColours,
  tintColours,
  type ColourProvenance,
} from "./sources";

/** ADR 0007 §1: the control dimensions a theme chooses a form for. */
export const controlDimensions: readonly string[] = ["field", "choice", "track", "handle"];

/** A colour that is a value of its own, not a pointer. */
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

const nothing: ColourProvenance = { theme: {}, light: {}, dark: {} };

/** Every way `theme` steps outside the whitelist, each as one sentence naming `path`. */
export function checkWhitelist(
  path: string,
  theme: WhitelistTheme,
  semantics: WhitelistSemantics,
  shared: WhitelistSemantics,
  provenance: ColourProvenance = nothing,
): string[] {
  const problems: string[] = [];
  const sources: ReadonlySet<string> = new Set(sourceColours);
  const references: ReadonlySet<string> = new Set(referenceColours);
  const constants: ReadonlySet<string> = new Set(constantColours);

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
      const source = provenance[section][key];
      // A value with provenance is the spec's, not the derivation's: the tint rule below is about
      // the formula the derivation writes, so it reaches only a tint that states no source.
      if (source !== undefined) continue;
      if (tintColours.includes(key)) {
        const match = tintFormula.exec(value);
        if (match) tints.add(match[1]!);
        else
          problems.push(
            `${where} is \`${value}\`, not color-mix(in srgb, <source> N%, transparent), and states no source for it (ADR 0012 §4)`,
          );
      } else if (chartColours.includes(key)) {
        if (!chartForms.some((form) => form.test(value)))
          problems.push(
            `${where} is \`${value}\`, not a source or a foreground grey, and states no source for it (ADR 0012 §4)`,
          );
      } else if (literal.test(value)) {
        problems.push(
          `${where} writes \`${value}\`; it points at a source (\`var(--…)\`) or states where its value comes from (ADR 0012 §4)`,
        );
      }
    }
  }
  if (tints.size > 1)
    problems.push(
      `${path}: the *-tint colours use ${[...tints].join(", ")}%; one number per theme`,
    );

  for (const section of ["theme", "light", "dark"] as const)
    for (const key of Object.keys(provenance[section])) {
      const value = theme.cssVars[section][key];
      if (value === undefined || value.startsWith("var(--"))
        problems.push(
          `${path}: ${section}.${key} states a source nothing uses (the colour points at a source)`,
        );
    }

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
