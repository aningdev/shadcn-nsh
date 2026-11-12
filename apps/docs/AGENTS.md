# apps/docs

Astro site for the copy-into-app components: install, usage, examples and the props the styled layer adds. Behavior, keyboard support and the full unstyled API live on [nsh.dev](https://nsh.dev/elements) and are linked, not copied.

Three surfaces share the same components:

| Surface           | Role                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| `apps/docs`       | This site: the public face                                                     |
| `apps/docs/demos` | Acceptance demos for the pages, and the reference pages `port:render` compares |
| `apps/gallery`    | Native behavior tests and smoke pages                                          |

## Shell

The chrome is a structural copy of `references/nsh/website`: sticky `site-nav` (burger under 860px), `docs-sidebar` (folding under 960px), `docs-main` / `doc-content`, TOC, pager, footer, light/dark switch. Styles come from that site's `global.css` + `ui.css`, with the gallery tokens inlined in `styles/gallery-ui.css`.

Do **not** invent a parallel layout — extend `src/components/` and `src/layouts/`. A component page must name `layout: ../../../layouts/Docs.astro` in its frontmatter; without it Astro renders the Markdown with no chrome.

## Component pages

One page per `registry:ui` item, `src/pages/docs/components/<slug>.md`. The slug is the registry item's name.

Frontmatter:

```yaml
---
layout: ../../../layouts/Docs.astro
title: Button
description: A button, an icon button, a round button, and a split button.
component: true
demo: button
demoHeight: 480 # optional, overlays only
---
```

The body has four sections, in this order, and nothing else at `##`:

1. **Installation** — one `sh` fence: `npx shadcn-nsh@latest add <slug>`.
2. **Usage** — the import from `@/components/ui/<slug>`, then one minimal use.
3. **Examples** — one `###` per variant, size, state or common use, each with a short `tsx` snippet. The sections show what `apps/docs/demos/<slug>.tsx` shows, and every prop is one the component really has.
4. **API** — only the props and parts this package adds; one sentence points to [`nsh/base`](https://nsh.dev/elements/<element>) for the rest. Composites list their parts.

Do **not**:

- put `# Title` in the body (the layout renders `h1` from frontmatter);
- write `## Behavior & a11y` or `## Source` (the layout injects them);
- use the old `## Install`, `## Composition`, `## Differences` or `## Not forwarded` sections;
- invent props or paste another library's API. Read `packages/ui/<slug>.tsx` and `apps/docs/demos/<slug>.tsx` first.

Import snippets use the registry import path:

```tsx
import { Button, IconButton } from "@/components/ui/button";
```

Every name in such an import must be exported by `packages/ui/<slug>.tsx`; `check:pages` parses the import lines and checks them.

## One component list

`src/lib/components.generated.ts` is generated from `registry.json` (the `registry:ui` items) and each page's frontmatter. The sidebar (`src/lib/nav.ts`) and the index (`src/pages/docs/components/index.astro`) read it, so they list exactly the components that have pages.

```sh
bun run docs:components   # regenerate after adding a component or a page
```

Do not edit the generated file. `src/lib/components.ts` keeps the `nshElement` overrides (a page whose base element has another name, such as `radio-group` → `radio`) and the helpers. `bun run check:pages` fails when the file is stale.

## Demos

- `apps/docs/demos/<slug>.tsx` is the acceptance demo: covers every variant, size and state, at least one real scenario. It is also the page's Preview and the source of truth for its Examples. It is not illustrative.
- `apps/docs/demos/<slug>.ref.tsx` is the same page written the upstream way, the look expanded on `nsh/base` controls. `bun run port:render` requires the two screenshots to match; don't change one without the other.
- `bun run docs:demos` packages each demo with `nsh package --target web` into `public/demos/<slug>/` (gitignored) for the iframe. The demo `demo:` must name an existing `demos/<slug>.tsx`.
- The demo page uses `demos/kit.tsx` (`DemoPage` / `DemoCard` / `DemoSection`). Colors are read in JSX so they follow the appearance.

## Theme

`packages/theme` is the only look: `theme.json` (colors and radii), `finishes.json` (gradients and shadows), `theme.ts` (`colors`, `finish`, `radius`, `focusRing`, `alpha`). Pages and demos use those readers; no page hand-writes a palette. See `src/pages/docs/theme.md` and [the theme README](../../packages/theme/README.md).

## Checks

```sh
bun run check:pages    # pages ↔ registry ↔ demos, sections, import names, generated list
bun run check:docs     # astro sync + tsc
bun run check:demos    # nsh check on the demos app
bun run docs:demos     # package the previews
vp check               # format, lint, tool types
```

`public/llms.txt` is this site's table of contents for language models: the docs pages, every component with its base link, and where the base API lives. Update it when a page is added or renamed.
