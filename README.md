# shadcn-nsh

[中文](./README.zh.md)

Styled UI for [Native Shell (NSH)](https://github.com/longbridge/nsh): copy-into-app components and distribution on top of `nsh/base`, patterned after [shadcn/ui](https://github.com/shadcn-ui/ui).

Agent and contribution rules: [`AGENTS.md`](AGENTS.md). Reference sources live as git submodules under [`references/`](references/).

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

## Create a monorepo (recommended)

Default scaffold: `apps/web` + `packages/ui` (components land in packages):

```sh
# Developing this repo:
bun run shadcn-nsh -- create my-app
# Or after publish:
# bunx shadcn-nsh@latest create my-app
cd my-app
bun install
bun run check
bun run dev
```

Add more components:

```sh
bunx shadcn-nsh@latest add button -c apps/web
```

## Use in an existing single app

The directory must already have `nsh.json` (`nsh init`):

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

| Path                     | Package / role        | Notes                                         |
| ------------------------ | --------------------- | --------------------------------------------- |
| `packages/theme`         | `@shadcn-nsh/theme`   | design tokens (author-side registry source)   |
| `packages/ui`            | `@shadcn-nsh/ui`      | styled component sources                      |
| `packages/cli`           | `shadcn-nsh` (npm)    | `create` / `init` / `add` / `build` / `serve` |
| `public/r`               | —                     | HTTP registry artifacts                       |
| `apps/gallery`           | `@shadcn-nsh/gallery` | native verification demos                     |
| `apps/docs`              | `@shadcn-nsh/docs`    | Astro docs (optional web iframe previews)     |
| `templates/nsh-monorepo` | consumer template     | `create` copy source; **not** in root workspaces |
