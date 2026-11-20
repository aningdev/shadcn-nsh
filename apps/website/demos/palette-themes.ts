// The theme of each palette, fetched only when that palette is the one chosen — shared by the
// docs demos' startup palette (`apply-palette.ts`) and the showcase app's live switcher
// (`apps/showcase/theme.ts`), so the two name the same theme modules for one `PaletteId`.
//
// Like `palettes.ts` this imports nothing at the top level: the theme files are loaded on demand,
// so a page switched to no palette carries neither its tokens nor its finishes.
import type { AppTheme } from "@shadcn-nsh/theme";

import type { PaletteId } from "./palettes";

/** A palette's theme module: each theme exports its `AppTheme` as `default`. */
type ThemeModule = { default: AppTheme };

/** The theme of each palette, fetched only when that palette is the one chosen. */
const themes: Record<PaletteId, () => Promise<ThemeModule>> = {
  default: () => import("@shadcn-nsh/theme-default"),
  shadcn: () => import("@shadcn-nsh/theme-shadcn"),
  "solid-glass": () => import("@shadcn-nsh/theme-solid-glass"),
};

/**
 * The theme a palette is, fetched on demand: a page that is not switched to it loads no theme
 * file. `default` is the theme the app is built with, so its module is read the same way and the
 * caller passes the result to `selectTheme` (which takes `null` for the build-time theme).
 */
export function paletteTheme(id: PaletteId): Promise<AppTheme> {
  return themes[id]().then((module) => module.default);
}
