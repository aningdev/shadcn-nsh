# apps/docs

Astro docs site for shadcn-nsh (public copy-into-app docs + optional web demos).

## Shell (NSH website)

The chrome is a structural copy of `references/nsh/website`: sticky `site-nav` (burger under 860px), `docs-sidebar` (folding toggle under 960px), `docs-main` / `doc-content`, TOC, pager, footer, light/dark theme switch. Styles come from that site’s `global.css` + `ui.css`, with gallery tokens inlined as `styles/gallery-ui.css`.

Do **not** invent a parallel layout — extend the NSH shell components under `src/components/` and `src/layouts/`.

## Hybrid IA

This site documents the **styled / copy-into-app** layer only. Behavior, a11y, platform notes, and the full `nsh/base` API deep-link to `https://nsh.dev/elements/<nshElement>` (driven by `src/lib/components.ts`). Do **not** scrape or embed nsh Markdown into pages.

## Component pages

- Author as Markdown under `src/pages/docs/components/<slug>.md` (not `.astro`).
- Frontmatter: `layout`, `title`, `description`, `component: true`; optional `demo: <slug>` to inject `DemoFrame` (needs `bun run docs:demos`); optional `demoHeight` (px, default `300`; use ~360–480 for overlays).
- Do **not** put `# Title` in the body — `Docs.astro` renders `h1` from frontmatter.
- Do **not** hand-write nsh.dev links, `## Behavior & a11y`, or `## Source` — the layout injects them from `nshElement` / slug (handles slug ≠ element, e.g. `dropdown-menu` → `menu`).
- Rendered page contract (layout + body):

  1. Title (`h1` from frontmatter)
  2. _(layout)_ nsh chrome — `nsh.dev/elements/<nshElement>` (+ `.md`)
  3. _(layout)_ Preview — only when `demo` is set
  4. Short standfirst (body; no mandatory nsh link)
  5. Install
  6. Usage — consumer imports `@workspace/ui/components/ui/<slug>`
  7. Variants and/or Composition — when the wrapper adds variants or exposes multiple parts
  8. API — **this package’s** props / variants only; add a **Not forwarded** callout when the wrapper narrows base (do not invent props)
  9. _(layout)_ Behavior & a11y → outbound nsh
  10. _(layout)_ Source

- Nav / index list: `src/lib/components.ts` (keep in sync with Phase-1 registry UI items).
- Sidebar order: `src/lib/nav.ts` (`SIDEBAR_PAGES`).

## Site pages

- Getting started, Theme (`theme.json` / `token()` as truth), Components index.
- `public/llms.txt`: TOC for this site + pointers to `nsh.dev/elements` for behavior; do not fork nsh `llms-full`.

## Demos

One main web demo per component (NSH convention). Docs iframes are **illustrative**; native truth remains `apps/gallery`.

1. **File:** `demos/<slug>.tsx` — `<slug>` matches `src/lib/components.ts` / the page filename.
2. **Imports:** `../../../packages/ui/<module>` (not `@shadcn-nsh/ui` barrel — avoids base version skew); theme via `@shadcn-nsh/theme`.
3. **Content:** short interaction + this package’s variants; do not teach base Inspector / Playground.
4. **Page:** set `demo: <slug>` (and `demoHeight` when overlays need more room).
5. **Build:** `bun run docs:demos` (also run by `build:docs`) packages each source with `nsh package --target web` into `public/demos/<slug>/` (gitignored). Concurrent, limited; validates every `demo:` ↔ `demos/<slug>.tsx`.
6. **Types / check:** `nsh check apps/docs/demos` (via root `prepare:types` / `check`). Missing artifact → DemoFrame fallback; CI must produce the package when `demo:` is set.

Do **not** port NSH shared WASM player, `el-*`, or Playground into this site.
