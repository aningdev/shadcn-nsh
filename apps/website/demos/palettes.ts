// The themes a demo can be drawn in, and the key the docs site keeps the choice under. One list
// for both sides: the demos read it when they start (`apply-palette.ts`), the site's switch offers
// it and builds the storage key from it, and neither names a palette of its own.
//
// A palette's `label` is what the switch shows. The theme itself names itself too, longer
// (`AppTheme.label`: "shadcn neutral"); that name is the theme's, not the switch's. The themes
// page (`content/docs/themes.mdx`) reads this list too: one more field here is one more
// column there, and neither side keeps a second list of themes.
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
      "The library's own: graphite surfaces, one citrus accent, roomy 10-point controls.",
  },
  {
    id: "shadcn",
    label: "shadcn/ui",
    description:
      "shadcn's neutral palette: near-black and near-white fills, flat finishes, 8-point controls.",
  },
  {
    id: "solid-glass",
    label: "Solid Glass",
    description:
      "Panes of thick smoky glass: a rim of light on each top edge, a hairline round it, a shadow underneath.",
  },
] as const;

export type Palette = (typeof PALETTES)[number];
export type PaletteId = Palette["id"];
