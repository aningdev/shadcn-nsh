# @shadcn-nsh/docs

[中文](./README.zh.md)

Astro docs site for the copy-into-app components. Each page covers installation, usage, examples and the props the styled layer adds; behavior and the full `nsh/base` API deep-link to [nsh.dev](https://nsh.dev/elements).

```sh
bun run dev:docs
bun run check:docs
bun run check:pages   # registry ↔ pages ↔ demos, sections, import names
bun run docs:demos    # package the demos into public/demos for the previews
```

Authoring rules and the page contract: [`AGENTS.md`](./AGENTS.md). The component list is generated from `registry.json` and the pages — `bun run docs:components`; see `src/lib/components.generated.ts`.
