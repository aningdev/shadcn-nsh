# shadcn-nsh

[中文](./README.zh.md)

Styled UI for [Native Shell (NSH)](https://github.com/longbridge/nsh): copy-into-app components and distribution on top of `nsh/base`, patterned after [shadcn/ui](https://github.com/shadcn-ui/ui).

Agent and contribution rules: [`AGENTS.md`](AGENTS.md). Vocabulary: [`docs/GLOSSARY.md`](docs/GLOSSARY.md). Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Rules and decisions: [`packages/ui/README.md`](packages/ui/README.md) (components) and [`packages/theme/README.md`](packages/theme/README.md) (theme, motion). Reference sources live as git submodules under [`references/`](references/).

## Prerequisites

- [Bun](https://bun.com)
- [NSH CLI](https://nsh.dev/docs/installation) (`nsh`), **installed, never built**: the version in [`port-map.json`](port-map.json)'s `upstream.cli` (today `v0.5.0`), `curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=v0.5.0 sh`. The commit it prints is the **baseline**, [`port-map.json`](port-map.json)'s `upstream.commit`; when you install a newer CLI, `bun run port:bump` moves the baseline (and `upstream.cli`) with it. `port:check` warns — it does not fail — when the two differ ([`docs/toolchain.md`](docs/toolchain.md)). The ported code uses what the baseline's runtime has, so a CLI older than the baseline is the wrong one.
- Nothing else: the installed CLI carries the runtimes (and fetches the ones a target needs), so there is no `NSH_RUNTIME` to export.

```sh
# The submodules hold the upstream baseline and the shadcn reference.
git submodule update --init --recursive

# The CLI: installed, never built.
curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=v0.5.0 sh   # port-map.json upstream.cli
export PATH="$HOME/.local/bin:$PATH"   # where the installer links nsh

bun install
bun run nsh:bootstrap   # checks CLI + references/nsh are at the baseline, writes each .nsh
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

Porting a component, rules and checks: [`docs/port.md`](docs/port.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Layout

| Path                                  | Package / role        | Notes                                                                   |
| ------------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `packages/theme`                      | `@shadcn-nsh/theme`   | `theme.json`, `finishes.json`, `theme.ts` — the upstream theme          |
| `packages/ui`                         | `@shadcn-nsh/ui`      | ported components: `// @port` regions + shell                           |
| `apps/docs/demos`                     | —                     | acceptance demos, reference pages, `port:render`                        |
| `apps/docs/src/pages/docs/components` | —                     | component pages                                                         |
| `apps/gallery`                        | `@shadcn-nsh/gallery` | native behavior tests and smoke pages                                   |
| `packages/cli`                        | `shadcn-nsh` (npm)    | `init` / `add` / `build` / `serve`                                      |
| `registry.json` → `public/r`          | —                     | registry source → committed HTTP artifacts                              |
| `scripts/port`                        | —                     | `port:new` / `port:vendor` / `port:check` / `port:render` / `port:bump` |
| `port-map.json`                       | —                     | where every upstream file and declaration goes                          |
| `references/`                         | —                     | read-only submodules: the upstream baseline, the shadcn reference       |
