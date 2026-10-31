# apps/docs

Astro docs site for shadcn-nsh (public copy-into-app docs + optional web demos).

## Component pages

- Author as Markdown under `src/pages/docs/components/<slug>.md` (not `.astro`).
- Frontmatter: `layout`, `title`, `description`, `component: true`; optional `demo: <name>` to inject `DemoFrame` (needs `bun run docs:demos`).
- Do not put `# Title` in the body — `Docs.astro` renders `h1` from frontmatter when `component` / `demo` is set.
- Sections: short standfirst (link behavior to `https://nsh.dev/elements/…`) → Install → Usage → Source.
- Usage imports use consumer paths: `@workspace/ui/components/ui/<slug>`.
- Nav / index list: `src/lib/components.ts` (keep in sync with Phase-1 registry UI items).

## Demos

- Sources: `demos/<name>.tsx` → `bun run docs:demos` → `public/demos/<name>/`.
- Native truth remains `apps/gallery`, not docs iframes.
