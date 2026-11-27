"use client";

import { sitePath } from "@/lib/base";
import { REPO_URL } from "@/lib/layout.shared";
import { choosePalette } from "@/lib/palette";
import { THEME_META, themeBinding } from "@/lib/theme-meta";
import { surfaceSampleCss, themePages, type ThemePage, type TokenGroup } from "@/lib/themes";

/**
 * The pieces of one theme's docs page (`content/docs/themes/<id>.mdx`). The headings live in the
 * markdown, so the table of contents lists them; these components only fill a section. The list is
 * `demos/palettes.ts`, the values are each theme's spec (`packages/theme/themes/<id>/index.ts`,
 * compiled by `defineTheme()`), and what a surface is for is `SURFACE_DUTIES` in `lib/themes.ts`.
 *
 * The showcase preview is the overview's (`demo: themes` on `/docs/themes`). A demo panel follows
 * the palette stored for every demo, not the page it sits on, so "Show it in the preview" stores
 * this theme and opens that overview.
 */
import type { PaletteId } from "../../../demos/palettes";
import { CommandBlock } from "./command-block";
import { InstallTabs } from "./install-tabs";

const themes = themePages();
const samples = surfaceSampleCss();

/** The spec on GitHub: the page's lists are its, so the reader can read the rules behind them. */
const THEME_DOC_URL = `${REPO_URL}/blob/main/docs/theme.md`;

function themeOf(id: PaletteId): ThemePage {
  const theme = themes.find((page) => page.palette.id === id);
  if (!theme) throw new Error(`no theme page for palette "${id}"`);
  return theme;
}

/** A swatch: the value over the card's own colour, framed like the code beside it. */
function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="border-fd-border bg-fd-card mr-2 inline-block size-5 shrink-0 overflow-hidden rounded-md border align-middle"
    >
      <span className="block size-full" style={{ backgroundColor: color }} />
    </span>
  );
}

/** A cell the spec writes in code spans (`\`button\`、\`dialog\``): the names as code, the rest as text. */
function Reads({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/g)
        .map((part, index) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <code key={`${index}:${part}`}>{part.slice(1, -1)}</code>
          ) : (
            <span key={`${index}:${part}`}>{part}</span>
          ),
        )}
    </>
  );
}

/** Stores this palette and opens the overview's showcase, which is drawn in it. */
function ShowInPreview({ id }: { id: PaletteId }) {
  return (
    <a
      href={sitePath("/docs/themes#preview")}
      className="border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground inline-block rounded-md border px-2.5 py-1 text-sm font-medium whitespace-nowrap no-underline"
      onClick={() => choosePalette(id)}
    >
      Show it in the preview
    </a>
  );
}

/** The page's opening: the theme's own name when it differs from the title, the registry item, and
 * the build-time note the NSH Gallery theme carries. */
export function ThemeIntro({ id }: { id: PaletteId }) {
  const theme = themeOf(id);
  const meta = THEME_META[id];
  return (
    <>
      {theme.overview === null ? null : <p>{theme.overview}</p>}
      <p>
        Style inspiration rather than a 1:1 native clone. This theme distills the colors, radii,
        surfaces, and motion of {meta.reference.name}
        {meta.platforms.length > 0 ? ` (${meta.platforms.join(", ")})` : ""}.{" "}
        <a href={meta.reference.href} target="_blank" rel="noopener noreferrer">
          {meta.reference.name} ↗
        </a>
      </p>
      <p>
        A theme is one TypeScript module — <code>index.ts</code> for its spec, the tokens, metrics,
        elevation, surfaces, feedback, motion and controls <code>defineTheme()</code> compiles — and
        two files that same build exports from it: <code>theme.json</code> for NSH&apos;s variables
        and <code>DESIGN.md</code> for the language in words. Which tokens there are, and what each
        surface draws, is <a href={THEME_DOC_URL}>the Theme v5 spec on GitHub</a>; this page reads
        the specs themselves.
      </p>
      <p>
        A token is a colour, length or font family under a name, a surface is a layer a component
        draws itself in, and an alias is a token written as another (<code>secondary</code> is{" "}
        <code>var(--surface)</code>): the table shows an alias as the token it points at. The
        swatches follow the site&apos;s light and dark switch; the surface samples follow it too,
        drawn with this theme&apos;s values.
      </p>
      <p>
        {theme.name === theme.palette.label ? null : (
          <>
            The theme calls itself <strong>{theme.name}</strong>.{" "}
          </>
        )}
        The switch calls it <strong>{theme.palette.label}</strong>; the registry item is{" "}
        <code>{theme.item}</code>. <ShowInPreview id={theme.palette.id} />
      </p>
      {theme.palette.id === "nsh-gallery" ? (
        <p>
          The build-time theme is the <code>theme</code> item that <code>init</code> writes without
          a flag; this item is the same data, for an app built on another theme to switch back to.
        </p>
      ) : null}
    </>
  );
}

/** CLI install, and the same theme as an `nshm` import. */
export function ThemeInstall({ id }: { id: PaletteId }) {
  const theme = themeOf(id);
  const binding = themeBinding(theme.palette.id);
  const nshm = `import ${binding} from "shadcn-nsh/themes/${theme.palette.id}";
import { selectTheme } from "shadcn-nsh/theme";

selectTheme(${binding});`;
  return (
    <>
      <p>
        <strong>TSX nshm.</strong> The module is the theme. <code>selectTheme</code> switches to it
        while the app runs. <code>selectTheme(null)</code> returns to the theme the app was built
        with.
      </p>
      <CommandBlock code={nshm} label="Copy" />
      <p>
        <strong>CLI.</strong> <code>init --theme {theme.palette.id}</code> builds the app on this
        theme. <code>add {theme.item}</code> installs <code>themes/{theme.palette.id}.ts</code> and{" "}
        <code>themes/{theme.palette.id}/</code> beside the build-time theme and leaves that one as
        it is.
      </p>
      <InstallTabs command={`npx shadcn-nsh@latest init --theme ${theme.palette.id}`} />
      <InstallTabs command={`npx shadcn-nsh@latest add ${theme.item}`} />
      <p>
        On an app that already has a theme, <code>init --theme {theme.palette.id} --overwrite</code>{" "}
        replaces the build-time theme. <code>add {theme.item}</code> does not.
      </p>
    </>
  );
}

/** How to read the two token tables: one paragraph under the Tokens heading. */
export function ThemeTokenLead() {
  return (
    <p>
      Every token the theme sets, in <code>theme.json</code>&apos;s order, for light and dark: the
      swatch draws the value and the text is what the file writes. A <code>var(--x)</code> or a{" "}
      <code>color-mix()</code> is the theme&apos;s own reference; the swatch fills it in from the
      same appearance, the text leaves it as written.
    </p>
  );
}

/** One layer of the token table. The heading above it is the page's, so it is in the contents. */
export function ThemeTokens({ id, group }: { id: PaletteId; group: TokenGroup["id"] }) {
  const theme = themeOf(id);
  const tokens = theme.tokens.find((entry) => entry.id === group);
  if (!tokens) throw new Error(`theme "${id}" has no "${group}" tokens`);
  return (
    <>
      <p>{tokens.note}</p>
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Light</th>
            <th>Dark</th>
          </tr>
        </thead>
        <tbody>
          {tokens.rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <Swatch color={row.lightSwatch} />
                {row.aliasOf ? (
                  <code className="text-fd-muted-foreground">→ {row.aliasOf}</code>
                ) : (
                  <code className="text-xs">{row.light}</code>
                )}
              </td>
              <td>
                <Swatch color={row.darkSwatch} />
                {row.aliasOf ? (
                  <code className="text-fd-muted-foreground">→ {row.aliasOf}</code>
                ) : (
                  <code className="text-xs">{row.dark}</code>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** The surface table, with a sample drawn from this theme's own spec. */
export function ThemeSurfaces({ id }: { id: PaletteId }) {
  const theme = themeOf(id);
  return (
    <>
      <style>{samples}</style>
      <p>
        The surfaces this theme draws, in the schema&apos;s order: the tokens are the ones its
        values name, and the sample is drawn from the spec itself — the background, the gradient,
        the shadow and the edges it writes, with its references filled in and the shadow taken from
        the theme&apos;s own elevation scale.
      </p>
      <table>
        <thead>
          <tr>
            <th>Surface</th>
            <th>What it draws</th>
            <th>Read by</th>
            <th>Tokens</th>
            <th>Sample</th>
          </tr>
        </thead>
        <tbody>
          {theme.surfaces.map((surface) => (
            <tr key={surface.role}>
              <td>
                <code>{surface.role}</code>
              </td>
              <td>{surface.draws}</td>
              <td>
                <Reads text={surface.reads} />
              </td>
              <td>
                {surface.tokens.length === 0 ? (
                  <span className="text-fd-muted-foreground">—</span>
                ) : (
                  surface.tokens.map((token, index) => (
                    <span key={token}>
                      {index === 0 ? null : ", "}
                      <code>{token}</code>
                    </span>
                  ))
                )}
              </td>
              <td>
                <span
                  data-ground={theme.palette.id}
                  data-translucent={surface.translucent ? "true" : undefined}
                  className="border-fd-border/50 inline-flex items-center justify-center rounded-lg border p-2.5"
                >
                  <span
                    data-sample={`${theme.palette.id}-${surface.role}`}
                    className="block h-9 w-20 rounded-md"
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
