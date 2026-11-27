import { sitePath } from "@/lib/base";
import { THEME_META } from "@/lib/theme-meta";
import { themePages, type ThemePage } from "@/lib/themes";

/** A token's painted value for one appearance, after aliases are filled in. */
function swatch(theme: ThemePage, name: string, scheme: "light" | "dark"): string | undefined {
  for (const group of theme.tokens) {
    const row = group.rows.find((item) => item.name === name);
    if (row) return scheme === "light" ? row.lightSwatch : row.darkSwatch;
  }
  return undefined;
}

/** A shared length, as the theme writes it (`8px`). */
function shared(theme: ThemePage, name: string): string | undefined {
  return theme.tokens.find((group) => group.id === "shared")?.rows.find((row) => row.name === name)
    ?.light;
}

const DOTS = ["background", "card", "primary", "accent", "brand"] as const;

/**
 * One theme, drawn from its own tokens. The title and the reference are separate links: a card
 * must not nest an anchor in an anchor.
 */
function ThemeCard({ theme }: { theme: ThemePage }) {
  const meta = THEME_META[theme.palette.id];
  const radiusMd = shared(theme, "radius-md") ?? shared(theme, "radius");
  const radiusLg = shared(theme, "radius-lg") ?? radiusMd;
  const glass = theme.surfaces
    .filter((surface) => surface.translucent)
    .map((surface) => surface.role);
  const pageHref = sitePath(`/docs/themes/${theme.palette.id}`);

  return (
    <li
      id={`theme-${theme.palette.id}`}
      className="border-fd-border bg-fd-card flex min-w-0 flex-col overflow-hidden rounded-xl border"
    >
      <div className="grid grid-cols-2">
        {(["light", "dark"] as const).map((scheme) => {
          const background = swatch(theme, "background", scheme);
          const card = swatch(theme, "card", scheme);
          const primary = swatch(theme, "primary", scheme);
          const accent = swatch(theme, "accent", scheme);
          const brand = swatch(theme, "brand", scheme);
          const border = swatch(theme, "border", scheme);
          const colors = { background, card, primary, accent, brand };
          return (
            <div
              key={scheme}
              className="flex min-w-0 flex-col gap-2.5 p-3"
              style={{ backgroundColor: background }}
            >
              <span className="sr-only">{scheme}</span>
              <div
                className="flex items-center gap-2 border p-2"
                style={{
                  backgroundColor: card,
                  borderColor: border,
                  borderRadius: radiusLg,
                }}
              >
                <span
                  className="h-6 min-w-0 flex-1"
                  style={{ backgroundColor: primary, borderRadius: radiusMd }}
                />
                <span
                  className="size-6 shrink-0"
                  style={{ backgroundColor: accent, borderRadius: radiusMd }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DOTS.map((name) => (
                  <span
                    key={name}
                    title={`${scheme} ${name}`}
                    className="home-swatch-dot"
                    style={{ backgroundColor: colors[name] }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <span className="border-fd-border text-fd-muted-foreground rounded-md border px-1.5 py-0.5 text-xs">
            {meta.material}
          </span>
          {meta.platforms.length > 0 ? (
            <span className="border-fd-border text-fd-muted-foreground rounded-md border px-1.5 py-0.5 text-xs">
              nativeTheme() · {meta.platforms.join(" · ")}
            </span>
          ) : null}
        </div>
        <a
          href={pageHref}
          className="text-fd-foreground text-base font-medium no-underline hover:underline"
        >
          {meta.title}
        </a>
        <p className="text-fd-muted-foreground text-sm">{theme.palette.description}</p>
        <p className="text-fd-muted-foreground text-xs">
          {glass.length > 0 ? `Translucent ${glass.join(", ")}` : "Opaque surfaces"}
          {radiusMd ? ` · radius-md ${radiusMd}` : ""}
          {radiusLg ? ` · radius-lg ${radiusLg}` : ""}
        </p>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
          <a
            href={pageHref}
            className="text-fd-foreground font-medium no-underline hover:underline"
          >
            Details
          </a>
          <a
            href={meta.reference.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fd-muted-foreground no-underline hover:underline"
          >
            {meta.reference.name} ↗
          </a>
        </div>
      </div>
    </li>
  );
}

/** The six built-in themes, in palette order. `columns` is the wide-layout count. */
export function ThemeCardGrid({ columns = "two" }: { columns?: "two" | "three" }) {
  const themes = themePages();
  const wide = columns === "three" ? "xl:grid-cols-3" : "";
  return (
    <ul className={`not-prose grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 ${wide}`}>
      {themes.map((theme) => (
        <ThemeCard key={theme.palette.id} theme={theme} />
      ))}
    </ul>
  );
}
