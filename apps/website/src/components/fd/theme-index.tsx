import { ThemeCardGrid } from "@/components/fd/theme-cards";

/**
 * The overview's list of themes (`content/docs/themes.mdx`): one card per palette, linking to its
 * page. The cards are `themePages()`, so a palette in `demos/palettes.ts` is a card here.
 * `#theme-<id>` still lands on that card. The title and the external reference are separate links.
 */
export function ThemeIndex() {
  return <ThemeCardGrid columns="two" />;
}
