# Contributing

Start by reading [`AGENTS.md`](AGENTS.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/component-authoring.md`](docs/component-authoring.md), and [`docs/theme.md`](docs/theme.md).

## Setup

Requires [Bun](https://bun.sh) and the [NSH CLI](https://nsh.dev/) matching `engines.nsh` in the root [`package.json`](package.json). The CLI type-checks, runs demos, and executes tests; never compile NSH from source.

```sh
bun install
bun run prepare:types
```

## Commands

| Command                                                 | Purpose                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `bun run dev:docs`                                      | Run the docs website locally                                              |
| `bun run dev:gallery`                                   | Run the native Gallery smoke app                                          |
| `bun run dev:showcase`                                  | Run the Showcase app                                                      |
| `nsh run apps/website/demos/<id>.tsx`                   | Run a single component demo                                               |
| `bun run new:component <id> --base <Symbol> [--family]` | Scaffold a component wrapping `nsh/base`                                  |
| `bun run new:component <id> --view [--family]`          | Scaffold a layout/style component on `View`/`Text`                        |
| `bun run check`                                         | Format, lint, type-check, catalog, theme, UI rules, registry, demos, docs |
| `bun run check:demos`                                   | Verify demos cover every declared axis value                              |
| `bun run check:narrow`                                  | Verify 320pt narrow viewport layout                                       |
| `bun run registry:build`                                | Rebuild `public/r/*.json` from `registry.json`                            |
| `bun run test:unit`                                     | Run unit tests across CLI, theme, and scripts                             |
| `bun run test:gallery`                                  | Run native Gallery behavioral tests                                       |
| `bun run test:install`                                  | Run end-to-end `init` / `add` and `nshm` install verification             |

## Pull Requests

`main` is protected. Every change lands via a squash-merged PR targeting `main`:

- Branch names: `<type>/<short-description>` (for example `fix/field-label-wrap`, `feat/combobox-chips`).
- PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`).
- Keep one concern per PR (one component family, or one bug/fix with `Closes #N`).
- Add user-facing changes under `## Unreleased` in [`CHANGELOG.md`](CHANGELOG.md). Skip changelog entries for internal scripts, CI, or tests.

Before opening a PR, run `bun run check` and supplement based on scope:

- Demo layout changed → `bun run check:narrow`
- Theme data changed → `bun run theme:diff`
- Component behavior changed → `bun run test:gallery`; Showcase changed → `nsh test apps/showcase`
- Registry items or CLI changed → `bun run test:install`
- `registry.json` or `packages/ui` / `packages/theme` files changed → `bun run registry:build` and commit `public/r`

## Adding a Component

1. Run `bun run new:component <id> --base <Symbol>` (or `--view`), adding `--family` for multi-part components.
2. Derive all colors and finishes from theme tokens (`docs/theme.md`); document intentional look decisions in the component's docs page.
3. Add phone and desktop scenarios in `apps/website/demos/<id>.tsx` and register official parity in `apps/website/src/lib/official.ts` when applicable.
4. Run `bun run catalog --check`, `bun run check:demos`, `bun run registry:build`, and `bun run check`.

## Releasing

`shadcn-nsh` on npm and the static docs root (`/`) are published from `v*` git tags matching `packages/cli/package.json`.

- **Versioning**: Before `1.0`, bump `minor` for breaking component/registry/theme changes or new components/themes; bump `patch` for fixes, look refinements, and docs.
- **Prepare release PR** (`chore/release-vX.Y.Z`, commit `chore(release): vX.Y.Z`):
  1. Rename `## Unreleased` in `CHANGELOG.md` to `## vX.Y.Z — YYYY-MM-DD` and add an empty `## Unreleased` header above it.
  2. Update `version` in `packages/cli/package.json` to `X.Y.Z`.
  3. Run `bun run catalog` so the root `nsh.json` version matches the CLI.
  4. Add a compatibility row in `README.md` and `README.zh.md`.
  5. Run `bun run registry:build` and verify `bun run check` and `bun run test:install`.
- **Tag & publish**: After merging to `main`, push `git tag vX.Y.Z`. `publish-cli.yml` publishes npm, and `deploy-docs.yml` builds `/` (while pushes to `main` update `/dev/` using `DOCS_BASE=/dev/` and `sitePath()`).
