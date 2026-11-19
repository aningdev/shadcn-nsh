# apps/website

The docs site for the copy-into-app components: install, usage, examples and the props the styled layer adds. Behavior, keyboard support and the full unstyled API live on [nsh.dev](https://nsh.dev/elements) and are linked, not copied.

Three surfaces share the same components:

| Surface              | Role                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| `apps/website`       | This site: the public face                                                     |
| `apps/website/demos` | Acceptance demos for the pages, and the reference pages `port:render` compares |
| `apps/gallery`       | Native behavior tests and smoke pages                                          |

## Stack

TanStack Start + [Fumadocs](https://fumadocs.dev) on React 19 and Tailwind v4, built to a static site: `vite build` prerenders every page under `apps/website/.output/public`, which is what `.github/workflows/deploy-docs.yml` uploads. There is no dev server in production and no server at runtime — server functions are prerendered away by `staticFunctionMiddleware`.

| Path                 | What it holds                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/`        | Routes: `__root.tsx` (chrome, theme, search), `index.tsx` (home), `docs/$.tsx` (every docs page), `api/search.ts`, the `llms*.txt` and `.md` handlers |
| `src/components/fd/` | The site's own pieces: demo panel, palette switch, search, the generated page bodies                                                                  |
| `src/lib/`           | Content, navigation, generated tables, site constants                                                                                                 |
| `content/docs/`      | The pages themselves (`.md` / `.mdx`); the sidebar order comes from `src/lib/nav.ts`                                                                  |
| `src/styles/fd.css`  | The only stylesheet: Tailwind, Fumadocs' neutral preset, nothing hand-written                                                                         |
| `demos/`             | The acceptance demos (an NSH app; see below)                                                                                                          |
| `public/`            | `favicon.svg`, packaged demos (gitignored)                                                                                                            |

`vite.config.ts` sets the base for both Vite and the router (`tanstackStart.router.basepath`). The site is served at the root of its own domain, so internal links are plain absolute paths (`/docs/components`); a move under a path is the one `BASE` constant there, and links written as router paths (the sidebar, the layout's `links`) follow it themselves.

Do **not** invent a parallel layout — the chrome is `DocsLayout` / `DocsPage` from `fumadocs-ui`, configured once in `src/routes/__root.tsx` and `src/lib/layout.shared.tsx`. A docs page gets its chrome from the route; nothing in a page writes a sidebar, a TOC or a footer.

## Pages

A page is a file in `content/docs/`. Its URL is its path: `content/docs/components/button.md` → `/docs/components/button`. `src/routes/docs/$.tsx` renders it — frontmatter through `DocsTitle` / `DocsDescription`, the body through MDX, then the sections it injects.

Frontmatter:

```yaml
---
title: Button
description: A button, an icon button, a round button, and a split button.
component: button
demo: button
demoHeight: 480 # optional, overlays only
---
```

`component` names the registry item when the page is a component page (`content/docs/components/<slug>.md`); `demo` names `demos/<slug>.tsx` and turns on the Preview. Quote a `description` that contains a colon.

A component page's body has these sections, in this order, and nothing else at `##` (the full rule, with the order of Examples' subsections, is [`docs/port.md`](../../docs/port.md) § 文档页):

1. **Installation** — one fence tagged `npm`: `npx shadcn-nsh@latest add <slug>`. Fumadocs' `remarkNpm` (configured in `vite.config.ts`) draws it as the npm / pnpm / bun tabs; don't write the three commands by hand.
2. **Usage** — the import from `@/components/ui/<slug>`, then one minimal use.
3. **Examples** — one `###` per variant, size, state or common use, each with a short `tsx` snippet, in that order: `Variant` / `Tone`, `Size`, the states (`Disabled`, `Invalid`, `Read-only`, `Loading`), everything else, `Controlled` / `Uncontrolled` last. The sections show what `apps/website/demos/<slug>.tsx` shows, and every prop is one the component really has.
4. **Differences from shadcn/ui** — optional: what the shadcn/ui component of the same name has that this does not, what this adds, and where behavior differs. Every comparison with shadcn lives here, nowhere else on the page.
5. **API** — opens with the parts table, header `| Part | Props | Description |`; only the props and parts this package adds; one sentence points to [`nsh/base`](https://nsh.dev/elements/<element>) for the rest.

Do **not**:

- put `# Title` in the body (the route renders `h1` from frontmatter);
- write `## Preview` (the route injects it), `## Behavior & a11y` or `## Source` (behavior is NSH's, one badge away);
- use the old `## Install`, `## Composition`, `## Differences`, `## Not forwarded` or `## Accessibility` sections (screen-reader names go in the example or the API they belong to);
- invent props or paste another library's API. Read `packages/ui/<slug>.tsx` and `apps/website/demos/<slug>.tsx` first.

Import snippets use the registry import path:

```tsx
import { Button, IconButton } from "@/components/ui/button";
```

Every name in such an import must be exported by `packages/ui/<slug>.tsx`; `check:pages` parses the import lines and checks them.

### Generated pages

These pages are drawn by a component, because their rows come from generated tables:

| Page           | File                                   | Body                                                           |
| -------------- | -------------------------------------- | -------------------------------------------------------------- |
| All components | `content/docs/components.mdx`          | `ComponentsIndex` (`kind="official"` / `"own"`)                |
| Coverage       | `content/docs/components/coverage.mdx` | `CoverageTable` (`group="shadcn"` / `"base"` / `"primitives"`) |
| Themes         | `content/docs/themes.mdx`              | `ThemeIndex` (one card per palette)                            |
| One theme      | `content/docs/themes/<id>.mdx`         | `ThemeIntro`, `ThemeInstall`, `ThemeTokens`, `ThemeFinishes`   |

The prose and the `##` headings stay in the page (headings belong in markdown — that is where the table of contents and the anchor buttons come from); the component only renders the rows. An `.mdx` page is registered for its `.md` URL too (`src/lib/content-paths.ts`), because the route looks pages up by that path.

`content/docs/components/coverage.mdx` must not grow rows by hand: every row is a line of `src/lib/official.ts`. `themes.mdx` must not list palettes by hand: `ThemeIndex` reads `themePages()`. Each palette has `content/docs/themes/<id>.mdx` with the same headings (Installation, Tokens and its three groups, Finishes); those headings are markdown, because that is what the table of contents lists. `check:pages` fails when a palette has no page, a page has no palette, the headings differ, or a page's title and description drift from `demos/palettes.ts`.

Imports in MDX resolve through Vite, not through `@/`: use relative paths (`../../src/lib/components`) inside a page.

## One component list

`src/lib/components.generated.ts` is generated from `registry.json` (the `registry:ui` items), each page's frontmatter, and `src/lib/official.ts` (which shadcn/ui component and which NSH element each page answers for). The sidebar (`src/lib/nav.ts`), the index (`content/docs/components.mdx` through `ComponentsIndex`) and the coverage page (`content/docs/components/coverage.mdx` through `CoverageTable`) read it, so they list exactly the components that have pages, grouped by kind in one order.

```sh
bun run docs:components   # regenerate after adding a component or a page
```

Do not edit the generated file. `src/lib/components.ts` keeps the helpers. `bun run check:pages` fails when:

- the file is stale;
- an official table names a page that does not exist, or serves nothing without a status and a note;
- `references/` has a shadcn/ui `ui/*.tsx` or an NSH `elements/*.md` with no row — an upstream addition is one row here;
- a page links `nsh.dev/elements/<x>` that has no `elements/<x>.md` in `references/nsh`;
- a theme page is missing, extra, or its headings, title or description drift from the palette list.

## Kinds and coverage

There are two kinds, and neither is filed by hand. `Base` is a page that an `NSH_ELEMENTS` row of `src/lib/official.ts` (one per `references/nsh/website/elements/*.md`) names in its `ours` — it dresses an NSH element. `Enhanced` is a page no NSH row names: a shadcn composite over an element (Menubar, InputGroup) or this library's addition. `src/lib/kinds.ts` derives the kind from those rows and holds the two labels and their order (`Base`, then `Enhanced`, alphabetically by title inside each); a new component lands in the right group the moment its row exists.

`src/lib/official.ts` answers for both official sets: `SHADCN_UI` is one row per `references/shadcn-ui/apps/v4/registry/new-york-v4/ui/*.tsx`, `NSH_ELEMENTS` one row per `references/nsh/website/elements/*.md`. A row lists the pages here that serve it (`ours`, closest first) and, when nothing does, a `status` (`planned`, `missing`, `not-doing`, `primitive`) and a one-line `note`. Reversed, the same rows give each page its header badges (`NSH ↗`, `shadcn/ui ↗`) and its base element, so a page never writes them itself. A `planned` row becomes a link by itself once its page exists.

Adding a component: add or extend the official row if one of theirs answers it (a component no NSH row names is Enhanced), then `bun run docs:components`. The coverage page is generated from these tables; do not write it by hand.

## Search

`src/routes/api/search.ts` builds one static index with Fumadocs' `createFromSource(source)` and answers with `server.staticGET()`; `src/components/fd/search.tsx` reads it through `useStaticSearch`. The index covers exactly what `src/lib/source.ts`'s loader returns — a page it does not know is not searchable, and adding entries by hand would drop the breadcrumbs Fumadocs builds. A page becomes searchable by being a page (and being reachable in the sidebar, which is what the loader walks).

## Demos

- `apps/website/demos/<slug>.tsx` is the acceptance demo: covers every variant, size and state, at least one real scenario. It is also the page's Preview and the source of truth for its Examples. It is not illustrative.
- `apps/website/demos/<slug>.ref.tsx` is the same page written the upstream way, the look expanded on `nsh/base` controls. `bun run port:render` requires the two screenshots to match; don't change one without the other.
- `bun run docs:demos` packages each demo with `nsh package --target web` into `public/demos/<slug>/` (gitignored) for the iframe. The demo `demo:` must name an existing `demos/<slug>.tsx`.
- The demo page uses `demos/kit.tsx` (`DemoPage` / `DemoCard` / `DemoSection`). Colors are read in JSX so they follow the appearance.
- The frame is `src/components/fd/demo-panel.tsx`: an iframe on `demos/<slug>/index.html`, Preview and Source tabs, phone and desktop widths, remounted when the palette changes.
- The demos' **theme** is a palette (`demos/palettes.ts`: `default`, the build-time theme, `shadcn`, `solid-glass`). The site keeps the choice in the demo app's storage — `nsh:<demos/nsh.json's id>:palette` in localStorage — and every page imports `demos/apply-palette.ts`, which reads it before it mounts and loads that theme's files on demand. `src/lib/palette.ts` builds the key from `nsh.json` and the list, so neither side names a palette or an app id of its own. A running app reads its storage once, so a panel is remounted rather than told (`src/components/fd/demo-panel.tsx` subscribes to `onPaletteChange`). `bun run check:palette` proves the first frame a visitor sees is already the chosen theme's.

## Theme

`packages/theme` is the only look: `theme.json` (colors and radii), `finishes.json` (gradients and shadows), `theme.ts` (`colors`, `finish`, `radius`, `focusRing`, `alpha`). Pages and demos use those readers; no page hand-writes a palette, and no stylesheet in this app carries a color — `src/styles/fd.css` only imports Tailwind, Fumadocs' preset and its neutral colors (usable as `bg-fd-success`, `text-fd-muted-foreground`, …). See `content/docs/theme.md` and [the theme README](../../packages/theme/README.md).

## Checks

```sh
bun run check:pages    # pages ↔ registry ↔ demos, sections, import names, generated list
bun run check:docs     # tsc --noEmit over this app (demos excluded)
nsh check apps/website/demos  # the demos app
bun run docs:demos     # package the previews (needed before a build)
bun run check:palette  # the first frame of a switched demo is the chosen theme (Chrome)
bun run check:first-frame  # every demo's first frame inside its budget (Chrome)
bun run build:docs     # nsh check (demos types host) + docs:demos + vite build → .output/public
vp check               # format, lint, tool types
```

`/llms.txt` and `/llms-full.txt` are this site's table of contents and full text for language models, and every page is also served as its own Markdown (`/docs/components/button.md`, the URL the page's Copy page button uses). All of them come from `docsLlms` in `src/lib/source.ts` (Fumadocs' `llms()` over the same loader as the pages), so a page, a title or a rename reaches them without a list to update. The build prerenders `docsLlms.files()` with Nitro (`vite.config.ts`), since TanStack's own prerender requests a trailing slash that a file route does not match.
