# shadcn-nsh

[中文](./README.zh.md)

Styled UI for [Native Shell (NSH)](https://github.com/longbridge/nsh): copy-into-app components and distribution on top of `nsh/base`, patterned after [shadcn/ui](https://github.com/shadcn-ui/ui).

Agent and contribution rules: [`AGENTS.md`](AGENTS.md). Vocabulary: [`GLOSSARY.md`](GLOSSARY.md). Rules and decisions: [`packages/ui/README.md`](packages/ui/README.md) (components) and [`packages/theme/README.md`](packages/theme/README.md) (theme, motion). Reference sources live as git submodules under [`references/`](references/).

## Prerequisites

- [Bun](https://bun.com)
- [NSH CLI](https://nsh.dev/docs/installation) (`nsh`) — **store / release tarball** (currently `0.4.0`); do not use `install.sh --source`

Phase-1 only wraps `nsh/base` exports present on the store CLI; inventory and Phase-2 gaps: [`packages/ui/README.md`](packages/ui/README.md).

```sh
git submodule update --init --recursive
curl -fsSL https://nsh.dev/install.sh | sh
bun install
bun run nsh:bootstrap   # prepare:types (generate each .nsh)
```

## Use in an existing NSH app

The directory must already have `nsh.json` (`nsh init`). Consumer monorepo scaffolding (`create`) is deferred.

```sh
# Local registry (when developing this repo)
bun run registry:build
bun run registry:serve   # separate terminal

bun run shadcn-nsh -- init -c /path/to/app --registry 'http://127.0.0.1:4173/{name}.json'
bun run shadcn-nsh -- add button -c /path/to/app --registry 'http://127.0.0.1:4173/{name}.json'
```

After push to GitHub you can omit `--registry`. Default:

`https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`

## Develop in this repo

Toolchain: Bun + [Vite+](https://viteplus.dev) (`vp fmt` / `vp lint` / `vp check`).

```sh
bun run check
bun run check:gallery
bun run dev:gallery
bun run dev:docs
bun run docs:demos      # optional: package NSH web previews for docs
bun run registry:build
```

After changing `packages/ui` or `packages/theme`, run `bun run registry:build` and commit `public/r`.

## Layout

| Path             | Package / role        | Notes                                       |
| ---------------- | --------------------- | ------------------------------------------- |
| `packages/theme` | `@shadcn-nsh/theme`   | design tokens (author-side registry source) |
| `packages/ui`    | `@shadcn-nsh/ui`      | styled component sources                    |
| `packages/cli`   | `shadcn-nsh` (npm)    | `init` / `add` / `build` / `serve`          |
| `registry.json`  | —                     | source catalog                              |
| `public/r`       | —                     | HTTP registry artifacts (committed)         |
| `apps/gallery`   | `@shadcn-nsh/gallery` | native verification demos                   |
| `apps/docs`      | `@shadcn-nsh/docs`    | Astro docs (optional web iframe previews)   |
| `references/`    | —                     | read-only git submodules                    |
