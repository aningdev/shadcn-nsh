import { url } from "@/lib/site";
import { themePages } from "@/lib/themes";

/**
 * The overview's list of themes (`content/docs/themes.mdx`): one card per palette, linking to its
 * page. The cards are `themePages()`, so a palette in `demos/palettes.ts` is a card here.
 * `#theme-<id>` still lands on that card.
 */
export function ThemeIndex() {
  const themes = themePages();
  return (
    <ul className="not-prose grid list-none gap-3 p-0">
      {themes.map((theme) => (
        <li key={theme.palette.id} id={`theme-${theme.palette.id}`}>
          <a
            href={url(`docs/themes/${theme.palette.id}`)}
            className="border-fd-border bg-fd-card hover:bg-fd-accent flex flex-col gap-1 rounded-xl border p-5 no-underline"
          >
            <span className="text-fd-foreground font-medium">{theme.palette.label}</span>
            <span className="text-fd-muted-foreground text-sm">{theme.palette.description}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
