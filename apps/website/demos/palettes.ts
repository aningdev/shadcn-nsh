// The themes a demo can be drawn in, and the key the docs site keeps the choice under. One list
// for both sides: the demos read it when they start (`apply-palette.ts`), the site's switch offers
// it and builds the storage key from it, and neither names a palette of its own.
//
// A palette's `label` is what the switch shows, and the title of its docs page
// (`content/docs/themes/<id>.mdx`). The theme itself names itself too, longer (`AppTheme.label`:
// "shadcn neutral"); that name is the theme's, not the switch's. One more palette here needs its
// page: `check:pages` fails when the pages and this list disagree.
//
// This module imports nothing, so the site can read it as well as the demos: no `nsh`, no theme
// data, nothing of the app.
/** The key an app's `Storage` keeps the palette under (the site prefixes it with the app's id:
 * `nsh:<nsh.json's id>:palette`). */
export const PALETTE_KEY = "palette";

/** The palettes, in the switch's order. `default` is the theme the demos are built with
 * (`packages/theme/theme.json`), which an app needs no theme file for. */
export const PALETTES = [
  {
    id: "default",
    label: "NSH Gallery",
    description:
      "The library's own: graphite surfaces, one citrus accent, 8-point controls and 14-point cards.",
  },
  {
    id: "shadcn",
    label: "shadcn/ui",
    description:
      "shadcn/ui's neutral palette: near-black and near-white fills, flat finishes, 8-point controls and 14-point cards.",
  },
  {
    id: "solid-glass",
    label: "Solid Glass",
    description:
      "Panes of thick smoky glass: a rim of light on each top edge, a hairline round it, a shadow underneath, 11-point controls and 20-point cards.",
  },
  {
    id: "apple",
    label: "Apple",
    description:
      "Apple's system colors and Liquid Glass: capsule controls, 20-point cards, hairline edges, and glass on the overlays that float.",
  },
  {
    id: "material",
    label: "Material",
    description:
      "Material 3 Expressive: tonal surfaces, capsule controls, circular corners, 8/10/10% state layers, and expressive springs.",
  },
  {
    id: "winui",
    label: "WinUI 3",
    description:
      "WinUI 3 (Windows 11): WinUI fill and stroke tokens, 4/8-point circular corners, Segoe UI Variable, Consolas, double focus rings, and timing motion.",
  },
] as const;

export type Palette = (typeof PALETTES)[number];
export type PaletteId = Palette["id"];
