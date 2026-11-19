"use client";

import { choosePalette } from "@/lib/palette";
import { REPO_URL, url } from "@/lib/site";
import { finishSampleCss, themePages, type ThemePage, type TokenGroup } from "@/lib/themes";

/**
 * The pieces of one theme's docs page (`content/docs/themes/<id>.mdx`). The headings live in the
 * markdown, so the table of contents lists them; these components only fill a section. The list is
 * `demos/palettes.ts`, the values are each theme's two JSON files, and what a token's layer and a
 * finish's duty are is `docs/specs/theme-roles.md`.
 *
 * The showcase preview is the overview's (`demo: themes` on `/docs/themes`). A demo panel follows
 * the palette stored for every demo, not the page it sits on, so "Show it in the preview" stores
 * this theme and opens that overview.
 */
import type { PaletteId } from "../../../demos/palettes";
import { InstallTabs } from "./install-tabs";

const themes = themePages();
const samples = finishSampleCss();

/** The spec on GitHub: the page's lists are its, so the reader can read the reasons behind them. */
const SPEC_URL = `${REPO_URL}/blob/main/docs/specs/theme-roles.md`;

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
      href={url("docs/themes#preview")}
      className="border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground inline-block rounded-md border px-2.5 py-1 text-sm font-medium whitespace-nowrap no-underline"
      onClick={() => choosePalette(id)}
    >
      Show it in the preview
    </a>
  );
}

/** The page's opening: the theme's own name when it differs from the title, the registry item, and
 * the build-time note the default theme carries. */
export function ThemeIntro({ id }: { id: PaletteId }) {
  const theme = themeOf(id);
  return (
    <>
      <p>
        A theme is three files — <code>theme.json</code> for its tokens, <code>finishes.json</code>{" "}
        for the surfaces it draws, <code>index.ts</code> for the theme object. Which tokens there
        are, and what each finish draws, is <a href={SPEC_URL}>the theme spec on GitHub</a>; this
        page reads it, so a name or a duty here is the spec&apos;s own.
      </p>
      <p>
        A token is a colour or a number under a name, a finish is a surface a component draws itself
        in, and an alias is a token written as another (<code>card</code> is{" "}
        <code>var(--background)</code>): the table shows an alias as the token it points at. The
        swatches follow the site&apos;s light and dark switch; the finish samples follow it too,
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
      {theme.palette.id === "default" ? (
        <p>
          The build-time theme is the <code>theme</code> item that <code>init</code> writes without
          a flag; this item is the same data, for an app built on another theme to switch back to.
        </p>
      ) : null}
    </>
  );
}

/** The install command and what <code>add</code> writes beside the build-time theme. */
export function ThemeInstall({ id }: { id: PaletteId }) {
  const theme = themeOf(id);
  return (
    <>
      <InstallTabs command={`npx shadcn-nsh@latest add ${theme.item}`} />
      <p>
        <code>add {theme.item}</code> installs <code>themes/{theme.palette.id}/</code> beside the
        app&apos;s build-time theme and leaves that one as it is; the app lists the theme and calls{" "}
        <code>selectTheme</code> to switch to it. To build the app on this theme instead, run{" "}
        <code>init --theme {theme.palette.id}</code> (or{" "}
        <code>init --theme {theme.palette.id} --overwrite</code> on an app that already has one
        theme).
      </p>
    </>
  );
}

/** How to read the three token tables: one paragraph under the Tokens heading. */
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

/** The finish table, with a sample drawn from this theme's <code>finishes.json</code>. */
export function ThemeFinishes({ id }: { id: PaletteId }) {
  const theme = themeOf(id);
  return (
    <>
      <style>{samples}</style>
      <p>
        The surfaces this theme draws, in <code>finishes.json</code>&apos;s order: what each one
        draws and what reads it is the spec&apos;s, the tokens are the ones its values name in this
        theme, and the sample is drawn from <code>finishes.json</code> itself — the background, the
        gradient, the shadow and the edge it writes, with its references filled in.
      </p>
      <table>
        <thead>
          <tr>
            <th>Finish</th>
            <th>What it draws</th>
            <th>Read by</th>
            <th>Tokens</th>
            <th>Sample</th>
          </tr>
        </thead>
        <tbody>
          {theme.finishes.map((finish) => (
            <tr key={finish.role}>
              <td>
                <code>{finish.role}</code>
              </td>
              <td>{finish.drawsEn}</td>
              <td>
                <Reads text={finish.reads} />
              </td>
              <td>
                {finish.tokens.length === 0 ? (
                  <span className="text-fd-muted-foreground">—</span>
                ) : (
                  finish.tokens.map((token, index) => (
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
                  className="inline-flex items-center justify-center rounded-md p-2"
                >
                  <span
                    data-sample={`${theme.palette.id}-${finish.role}`}
                    className="block h-8 w-16 rounded-md"
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
