/**
 * A theme's own `$extensions["dev.aning.shadcn-nsh"]` in its `theme.tokens.json`: what the theme
 * states about itself that is not a token — the prose its DESIGN.md rewrites, the colour pairs its
 * platform keeps below AA, and the sizes its platform states off the scale.
 *
 * Per-theme facts live in the theme's own file, so a script that reads them holds no list of theme
 * ids: a theme that keeps a pair below AA or a size off the grid says so with its source beside it.
 */
import fs from "node:fs";
import path from "node:path";

import { EXT_NS } from "../tokens/types";

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
