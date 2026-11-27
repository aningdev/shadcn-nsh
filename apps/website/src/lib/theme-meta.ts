/**
 * Editorial labels for the six built-in themes. Colors, radii, and surface roles come from
 * `themePages()`; this file only names the design system, the platforms `nativeTheme()` selects,
 * and the public reference. A palette missing here fails the type check.
 */
import type { PaletteId } from "../../demos/palettes";

export type ThemeMeta = {
  id: PaletteId;
  /** Card title: the system and the style this theme distills. */
  title: string;
  /** Short name of the material or surface character. */
  material: string;
  /** Platforms `nativeTheme()` returns this theme for. Empty when it never does. */
  platforms: readonly string[];
  reference: { name: string; href: string };
};

export const THEME_META: Record<PaletteId, ThemeMeta> = {
  "nsh-gallery": {
    id: "nsh-gallery",
    title: "NSH Gallery",
    material: "Graphite",
    platforms: ["other platforms"],
    reference: { name: "NSH Gallery", href: "https://github.com/longbridge/nsh" },
  },
  shadcn: {
    id: "shadcn",
    title: "shadcn/ui",
    material: "Flat",
    platforms: [],
    reference: { name: "shadcn/ui", href: "https://ui.shadcn.com/" },
  },
  "solid-glass": {
    id: "solid-glass",
    title: "Solid Glass",
    material: "Smoky glass",
    platforms: [],
    reference: { name: "Solid Glass", href: "https://github.com/deeplethe/solid-glass" },
  },
  apple: {
    id: "apple",
    title: "Apple · Liquid Glass",
    material: "Liquid Glass",
    platforms: ["iOS", "macOS"],
    reference: {
      name: "Apple Human Interface Guidelines",
      href: "https://developer.apple.com/design/human-interface-guidelines/",
    },
  },
  material: {
    id: "material",
    title: "Material · Material 3 Expressive",
    material: "Material 3 Expressive",
    platforms: ["Android"],
    reference: { name: "Material Design 3", href: "https://m3.material.io/" },
  },
  winui: {
    id: "winui",
    title: "WinUI 3 · Fluent 2 Acrylic",
    material: "Fluent 2 Acrylic",
    platforms: ["Windows"],
    reference: {
      name: "Windows App Design",
      href: "https://learn.microsoft.com/windows/apps/design/",
    },
  },
};

/** Binding for a default theme import: `nsh-gallery` → `nshGallery`. */
export function themeBinding(id: string): string {
  const [first, ...rest] = id.split("-");
  return (first ?? id) + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}
