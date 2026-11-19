# @shadcn-nsh/website

[中文](./README.zh.md)

TanStack Start + Fumadocs docs site for the copy-into-app components, built to a static site. Each page covers installation, usage, examples and the props the styled layer adds; behavior and the full `nsh/base` API deep-link to [nsh.dev](https://nsh.dev/elements).

```sh
bun run dev:docs      # vite dev on :4321
bun run check:docs    # tsc --noEmit
bun run check:pages   # registry ↔ pages ↔ demos, sections, import names
bun run docs:demos    # package the demos into public/demos for the previews
bun run build:docs    # nsh:bootstrap + docs:demos + build → .output/public
```

Pages live in `content/docs/` and are served by `src/routes/docs/$.tsx`; the site is served at the root of its domain, so internal links are plain absolute paths. Authoring rules and the page contract: [`AGENTS.md`](./AGENTS.md). The component list is generated from `registry.json` and the pages — `bun run docs:components`; see `src/lib/components.generated.ts`.
