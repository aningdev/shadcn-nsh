# apps/docs

Astro docs site for shadcn-nsh (public copy-into-app docs + optional web demos).

## Shell (NSH website)

The chrome is a structural copy of `references/nsh/website`: sticky `site-nav` (burger under 860px), `docs-sidebar` (folding toggle under 960px), `docs-main` / `doc-content`, TOC, pager, footer, light/dark theme switch. Styles come from that site’s `global.css` + `ui.css`, with gallery tokens inlined as `styles/gallery-ui.css`.

Do **not** invent a parallel layout — extend the NSH shell components under `src/components/` and `src/layouts/`.

## Hybrid IA

This site documents the **styled / copy-into-app** layer only. Behavior, a11y, platform notes, and the full `nsh/base` API deep-link to `https://nsh.dev/elements/<nshElement>` (driven by `src/lib/components.ts`). Do **not** scrape or embed nsh Markdown into pages.

Extensions (shadcn-only pieces with no `nsh/base` export) and Phase-2 components are **out of scope** for this site — see `packages/ui/COMPONENTS.md`.

## Component pages

- Author as Markdown under `src/pages/docs/components/<slug>.md` (not `.astro`).
- Frontmatter: `layout`, `title`, `description`, `component: true`; optional `demo: <slug>` to inject `DemoFrame` (needs `bun run docs:demos`); optional `demoHeight` (px, default `300`; use ~360–480 for overlays).
- Do **not** put `# Title` in the body — `Docs.astro` renders `h1` from frontmatter.
- Do **not** hand-write nsh.dev links, `## Behavior & a11y`, or `## Source` — the layout injects them from `nshElement` / slug (handles slug ≠ element, e.g. `dropdown-menu` → `menu`).
- Rendered page contract (layout + body), aligned with shadcn section intent:

  1. Title (`h1` from frontmatter)
  2. _(layout)_ nsh chrome — `nsh.dev/elements/<nshElement>` (+ `.md`)
  3. _(layout)_ **Preview** — only when `demo` is set
  4. Short standfirst (body; no mandatory nsh link)
  5. **Install**
  6. **Usage** — consumer imports `@workspace/ui/components/ui/<slug>`; document **this** package’s public API. Prefer shadcn-shaped composition trees when `@shadcn-nsh/ui` exports those facades (Trigger/Content/Item/…); do not paste Radix props that we do not implement
  7. **Composition** — ASCII tree of exported parts (required for compound components)
  8. **Examples** — 1–3 short vignettes (shadcn density, not full ports)
  9. **API** — this package’s props / variants only (optional **Variants** subsection when the wrapper adds look variants)
  10. **Differences** — vs shadcn: naming, parts, events (`onPress`), single-root vs compound trees, etc.
  11. **Not forwarded** — vs `nsh/base` narrowing (style/presentation knobs the wrapper owns; do not invent props)
  12. _(layout)_ **Behavior & a11y** → outbound nsh
  13. _(layout)_ **Source**

- Capability: only forward a missing base prop in `packages/ui` when it is clearly a wrapper gap and product-needed; otherwise document under Differences / Not forwarded. No Extensions pages, no Phase-2 components.
- Nav / index list: `src/lib/components.ts` — order is shadcn radix meta filtered to Phase-1, then nsh-only `link` / `number-input`.
- Sidebar order: `src/lib/nav.ts` (`SIDEBAR_PAGES`, derived from `components`).

## Site pages

- Getting started, Theme (`theme.json` / `token()` as truth), Components index.
- Components index must note that Extensions / Phase-2 live in `packages/ui/COMPONENTS.md` and are not listed here.
- `public/llms.txt`: TOC for this site + pointers to `nsh.dev/elements` for behavior; do not fork nsh `llms-full`.

## Demos

One main web demo per component (NSH convention). Docs iframes are **illustrative**; native truth remains `apps/gallery`. Prefer the existing demos system (`demos/<slug>.tsx` → `docs:demos` → `public/demos/<slug>/`); do **not** invent a second preview strategy.

1. **File:** `demos/<slug>.tsx` — `<slug>` matches `src/lib/components.ts` / the page filename.
2. **Imports:** `../../../packages/ui/<module>` (not `@shadcn-nsh/ui` barrel — avoids base version skew); theme via `@shadcn-nsh/theme`.
3. **Content:** short interaction + this package’s variants; do not teach base Inspector / Playground.
4. **Page:** set `demo: <slug>` (and `demoHeight` when overlays need more room).
5. **Build:** `bun run docs:demos` (also run by `build:docs`) packages each source with `nsh package --target web` into `public/demos/<slug>/` (gitignored). Concurrent, limited; validates every `demo:` ↔ `demos/<slug>.tsx`.
6. **Types / check:** `nsh check apps/docs/demos` (via root `prepare:types` / `check`). Missing artifact → DemoFrame fallback; CI must produce the package when `demo:` is set.

Do **not** port NSH shared WASM player, `el-*`, or Playground into this site.
