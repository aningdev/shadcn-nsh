/**
 * A theme's own `$extensions["dev.aning.shadcn-nsh"]`, read from its DTCG sources: what the theme
 * states about itself that is not a token — the prose its DESIGN.md rewrites, the colour pairs its
 * platform keeps below AA, the sizes its platform states off the scale, and where each stated colour
 * comes from.
 *
 * Per-theme facts live in the theme's own file, so a script that reads them holds no list of theme
 * ids: a theme that keeps a pair below AA or a size off the grid says so with its source beside it.
 */
import fs from "node:fs";
import path from "node:path";

import { EXT_NS, getExt } from "../tokens/types";
import type { ColourProvenance } from "./sources";

/** A colour pair a theme keeps below AA because its platform ships it that way, with the source. */
export interface ContrastWaiver {
  /** The text role, as `theme:contrast` names a check: `muted-foreground`. */
  fg: string;
  /** The surface role it is written on: `background`, `finish.accent.pressed-background`. */
  bg: string;
  /** Where the platform states it: "Apple secondaryLabel (#3C3C43 at 60%)". */
  source: string;
}

/** What a theme's `theme.tokens.json` states in `$extensions["dev.aning.shadcn-nsh"]`. */
export interface ThemeExtensions {
  /** The DESIGN.md sections the theme rewrites in its own words. */
  designMd?: Record<string, unknown>;
  /** Pairs kept below AA, each with its source (`theme:contrast`). */
  contrast?: { waivers?: ContrastWaiver[] };
  /** Values off the scales, by token path, each with its source (`check:theme`). */
  scales?: { citations?: Record<string, string> };
}

const repoRoot = path.resolve(import.meta.dir, "..", "..");
const cache = new Map<string, ThemeExtensions>();

/** One theme's extensions, read from its DTCG source; an unreadable or absent file is an empty set. */
export function themeExtensions(id: string): ThemeExtensions {
  const cached = cache.get(id);
  if (cached) return cached;
  const file = path.join(repoRoot, "packages/theme/tokens/themes", id, "theme.tokens.json");
  const doc = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>)
    : {};
  const ext = (doc.$extensions as Record<string, unknown> | undefined)?.[EXT_NS];
  const value = ext !== null && typeof ext === "object" ? (ext as ThemeExtensions) : {};
  cache.set(id, value);
  return value;
}

/** The source that excuses a failing pair, if the theme waived it. */
export function waiverSource(id: string, fg: string, bg: string): string | undefined {
  return themeExtensions(id).contrast?.waivers?.find(
    (waiver) => waiver.fg === fg && waiver.bg === bg,
  )?.source;
}

/** The values a theme cites off the scales, by token path → source. */
export const scaleCitationsOf = (id: string): Record<string, string> =>
  themeExtensions(id).scales?.citations ?? {};

const provenanceCache = new Map<string, ColourProvenance>();

/**
 * The provenance each stated colour carries in a theme's DTCG source (`color.<key>`'s `source`,
 * ADR 0012 §4), by appearance. The compiled `theme.json` keeps only CSS values, so a check that
 * wants the provenance reads the source files; a theme with no source yet states none.
 */
export function colourSources(id: string): ColourProvenance {
  const cached = provenanceCache.get(id);
  if (cached) return cached;
  const provenance: ColourProvenance = { theme: {}, light: {}, dark: {} };
  for (const section of ["theme", "light", "dark"] as const) {
    const file = path.join(repoRoot, "packages/theme/tokens/themes", id, `${section}.tokens.json`);
    if (!fs.existsSync(file)) continue;
    const doc = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    const color = doc.color;
    if (color === null || typeof color !== "object") continue;
    for (const [key, node] of Object.entries(color as Record<string, unknown>)) {
      const source = getExt(node)?.source;
      if (typeof source === "string") provenance[section][key] = source;
    }
  }
  provenanceCache.set(id, provenance);
  return provenance;
}
