# shadcn-nsh

[中文](./README.zh.md)

Styled UI for [Native Shell (NSH)](https://github.com/longbridge/nsh), built on `nsh/base` and handed to your app as files you own: components, a theme, and a registry to copy them from — the shape [shadcn/ui](https://github.com/shadcn-ui/ui) gives React.

Docs, every component with its props and a live demo: **https://shadcn-nsh.aning.dev/**

- **Copy-into-app.** `add` writes the component, its theme and the shared looks it imports into your app, then forgets them: no runtime package of ours, nothing to keep in sync.
- **The appearance is data.** Components read colours, radii and surfaces from `theme.json` and `semantics.json` — never from literals — so a theme swaps the whole look.
- **Native where it matters.** Behaviour, accessibility and platform idioms come from `nsh/base`; the shells only decide how they look, and adapt to phone, desktop and the terminal.

## Quick start

Your app needs `nsh.json` (from `nsh init`):

```sh
npx shadcn-nsh init                 # nsh-ui.json, the theme, nsh.json pointed at it, the @/ alias
npx shadcn-nsh add button           # one item, with the files it depends on
npx shadcn-nsh add --all            # every component
```

`init` records the choice in `nsh-ui.json`, installs the theme at `theme.json` + `lib/ui/semantics.json` + `lib/ui/theme.ts` alongside standalone `light.tokens.json`, `dark.tokens.json` (W3C DTCG 2025.10 files describing the shipped theme for Figma Variables Light/Dark modes, Tokens Studio, and Style Dictionary v4) and `DESIGN.md` (an agent-readable specification of the theme's tokens and design rationale; static snapshots that do not follow later edits to `theme.json`), points each `nsh.json` at `theme.json`, and sets up the `@/` import alias in an app (`"@/*": ["./*"]` in `tsconfig.json`'s paths, `"resolve": { "alias": { "@": "./" } }` in `nsh.json`) so the docs' snippets — `@/components/ui/<name>`, `@/lib/ui/theme` — resolve; `add` copies files and installs the packages an item declares (`lucide` among them) with your package manager. From then on the files are yours to change.

`list`, `view` and `diff` inspect the registry without writing: `npx shadcn-nsh list`, `view button`, `diff` (exits 1 when the app's copies differ). Every command takes `-c <dir>`, `add` also `--dry-run` and `--overwrite`. The [CLI reference](https://shadcn-nsh.aning.dev/docs/cli) has the flags and defaults.

## Themes

The library's own theme comes with `init`. Two more ship as themes:

```sh
npx shadcn-nsh init --theme shadcn                      # built with shadcn's neutral palette
npx shadcn-nsh add theme-apple                    # one more theme to switch to at run time
```

`init --theme <nsh-gallery|shadcn|solid-glass|apple|material|winui|native>` decides the theme the app is **built** with; `add theme-<name>` installs **one more** into `themes/<name>/`, for `selectTheme` to switch to while the app runs (`selectTheme(null)` goes back to the built-in one). `nsh-ui.json` records which theme the app was built with, so `add` never writes another one over it. Tokens, semantics and the switching example: [themes](https://shadcn-nsh.aning.dev/docs/themes) and [`docs/specs/design-semantics.md`](docs/specs/design-semantics.md).

## Registry

`init`, `add`, `list`, `view` and `diff` read the registry published with the release your CLI came from:

`https://raw.githubusercontent.com/aningdev/shadcn-nsh/v<version>/public/r/{name}.json`

So `shadcn-nsh@0.7.0` reads `v0.7.0`'s registry: the files match the CLI you are running, and a new release never changes an installed app's source. `--registry <template>` (with `{name}` in it) points them anywhere else — a branch, a local `serve`, a fork.

## Compatibility

Each release of this library tracks one NSH CLI version; installing a newer CLI does not make an older library wrong, it only means its components were written against what that CLI's `nsh/base` had.

| shadcn-nsh | NSH CLI |
| ---------- | ------- |
| 0.11.x     | v0.7.1  |
| 0.10.x     | v0.6.1  |
| 0.9.x      | v0.6.1  |
| 0.8.x      | v0.6.0  |
| 0.7.x      | v0.5.1  |
| 0.6.x      | v0.5.1  |

## Community

- Contributing — development setup, checks before a pull request, commit format: [`CONTRIBUTING.md`](CONTRIBUTING.md).
- How the project is put together, and the rules the code keeps: [`AGENTS.md`](AGENTS.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), vocabulary in [`docs/GLOSSARY.md`](docs/GLOSSARY.md).
- Security reports: [`SECURITY.md`](SECURITY.md).
- Licence: MIT, with the parts adapted from NSH under Apache-2.0 and the Solid Glass theme's MIT text — [`NOTICE`](NOTICE), [`LICENSE`](LICENSE).

## Develop in this repo

Bun and the NSH CLI (installed, never built), then:

```sh
git submodule update --init --recursive
bun install
bun run nsh:bootstrap   # checks the CLI and references/nsh against the baseline, writes each .nsh
bun run dev:docs        # the docs site
bun run check           # what CI runs, in one command
```

[`CONTRIBUTING.md`](CONTRIBUTING.md) has the full setup, the checks a change must pass and how to port a component.

## Layout

| Path                         | Package / role        | Notes                                                                                                                                                                                                              |
| ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/theme`             | `@shadcn-nsh/theme`   | `theme.json`, `semantics.json`, `{light,dark}.tokens.json`, `DESIGN.md`, `theme.ts` — base tokens + semantic layer (ours; `oklch()`); `themes/<name>/` is another theme's data, shipped as its `theme-<name>` item |
| `packages/ui`                | `@shadcn-nsh/ui`      | one file per component: a look + shell (files that started upstream carry a credit line)                                                                                                                           |
| `apps/website/demos`         | —                     | acceptance demos, reference pages, `port:render`                                                                                                                                                                   |
| `apps/website/content/docs`  | —                     | docs pages (`/docs/…`), rendered by `src/routes/docs/$.tsx`                                                                                                                                                        |
| `apps/gallery`               | `@shadcn-nsh/gallery` | native behavior tests and smoke pages                                                                                                                                                                              |
| `packages/cli`               | `shadcn-nsh` (npm)    | `init` / `add` / `list` / `view` / `diff` / `build` / `serve`                                                                                                                                                      |
| `registry.json` → `public/r` | —                     | registry source → committed HTTP artifacts                                                                                                                                                                         |
| `scripts/port`               | —                     | `port:new` / `port:vendor` / `port:check` / `port:review` / `port:render` / `port:bump`                                                                                                                            |
| `port-map.json`              | —                     | where every upstream file and declaration goes                                                                                                                                                                     |
| `references/`                | —                     | read-only submodules: the upstream baseline, the shadcn reference                                                                                                                                                  |
