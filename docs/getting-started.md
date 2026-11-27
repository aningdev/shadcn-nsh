# Getting started (/docs/getting-started)

## Two ways to install [#two-ways-to-install]

|              | TSX `nshm`                           | Copy-into-app CLI                                                  |
| ------------ | ------------------------------------ | ------------------------------------------------------------------ |
| What you get | The module, resolved by NSH          | The source, copied into the app                                    |
| Install      | `nsh add github:aningdev/shadcn-nsh` | `npx shadcn-nsh@latest init && npx shadcn-nsh@latest add button`   |
| npm          | None                                 | Whatever an item declares (the components declare none)            |
| Theme        | `selectTheme(...)` at run time       | `theme.json` at build time, plus `selectTheme` for any extra theme |

### TSX `nshm` [#tsx-nshm]

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Button } from "shadcn-nsh";
import { selectTheme } from "shadcn-nsh/theme";
import apple from "shadcn-nsh/themes/apple";

selectTheme(apple);
```

No `package.json` and no `node_modules`. `selectTheme` switches a built-in theme while the app runs. Tailwind token names such as `bg-surface` and `rounded-(--radius-md)` still need a build-time `theme.json`, which CLI `init` writes.

### Copy-into-app [#copy-into-app]

An app with `nsh.json` (from `nsh init`) is ready:

```npm
npx shadcn-nsh@latest init
npx shadcn-nsh@latest add button
```

`init` writes `nsh-ui.json`, installs the theme and points each `nsh.json` at `theme.json`; in an app it also sets up the `@/` import alias the docs' snippets use — `"@/*": ["./*"]` in `tsconfig.json`'s `compilerOptions.paths` (writing the file when there is none) and `"resolve": { "alias": { "@": "./" } }` in `nsh.json` — leaving values already there alone with a warning. `add` copies the component and its `registryDependencies` (the theme and the shared files it imports) into the app; from then on the files are the app's own. [CLI](./cli) has every command, flag and default.

Consumer monorepo scaffolding (`shadcn-nsh create`) is not built. `init` and `add` work in a workspace that already has `apps/*` and a `packages/ui` named `@workspace/ui` (or already holding `nsh-ui.json`).

## Commands [#commands]

| Command           | What it does                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `init`            | Writes `nsh-ui.json`, installs a theme, points each `nsh.json` at it, sets up `@/` in an app |
| `add [items…]`    | Copies items and their `registryDependencies` into the app                                   |
| `list`            | The registry's items, `✓` on the ones the app has                                            |
| `view <items…>`   | The files `add` would write: target paths and contents                                       |
| `diff [items…]`   | The app's files against the registry's; exits 1 when they differ                             |
| `build` / `serve` | Build `registry.json` into `public/r`, or serve it locally                                   |

Every command takes `-c, --cwd <dir>` (default: the current directory). `init`, `add`, `list`, `view` and `diff` also take `--registry <url>`, a template with `{name}` in it. [CLI](./cli) has every flag and default.

## Add [#add]

```npm
npx shadcn-nsh@latest add button -c apps/web
npx shadcn-nsh@latest add --all
npx shadcn-nsh@latest add button --dry-run
npx shadcn-nsh@latest add button --overwrite
```

- A file the app does not have is written; one identical to the registry's is skipped.
- A file the app changed is kept and reported: `kept components/ui/button.tsx, differs (run diff)`. `--overwrite` replaces it and prints the change: `overwrite components/ui/button.tsx (+2 -1)`.
- `theme.json` is merged by key: the app keeps its colors and gains any role it lacks. Customized theme values stay as they are.
- `--all` adds every `registry:ui` item, dependencies included.
- `--dry-run` writes nothing — not even `nsh-ui.json` or the theme — and prints what it would write.

## list, view, diff [#list-view-diff]

```npm
npx shadcn-nsh@latest list
npx shadcn-nsh@latest view button
npx shadcn-nsh@latest diff
npx shadcn-nsh@latest diff button
```

`list` reads the catalog (`index.json`) and marks an item when any of its files is in the app; `--json` prints the same catalog for tooling. `view` prints what `add` would write, dependencies first, with imports rewritten for the app. `diff` compares the same rewritten content with the app's files; without an item it lists the installed items that differ, with one it prints the changed lines, and it exits 1 when anything differs:

```npm
npx shadcn-nsh@latest diff || echo "run shadcn-nsh add <item> --overwrite"
```

## Monorepo [#monorepo]

If the workspace has `apps/web` and a `packages/ui` named `@workspace/ui`:

```npm
npx shadcn-nsh@latest add button -c apps/web
```

The files install into `packages/ui`, and the app imports them through the workspace:

```tsx
import { Button } from "@workspace/ui/components/ui/button";
```

## Local registry [#local-registry]

When developing this repository:

```sh
bun run registry:build
bun run registry:serve
bun run shadcn-nsh -- add button -c apps/web --registry "http://127.0.0.1:4173/{name}.json"
```

## Theme [#theme]

The look is `theme.json` (the roles of both appearances, three `radius-*` layer lengths, the fixed `scrim` / `media` / `on-media` values and any font families) plus `lib/ui/theme.ts`, the readers; the deeper half of a theme — surfaces, feedback, controls, metrics — is the spec in `themes/<id>.ts`, which `add theme-<id>` installs beside the build-time theme. `init` installs the build-time theme and points each `nsh.json` at `theme.json`; in a monorepo they live under `packages/ui`. See [Theme specification](./theme) for the keys, and [Customizing](./customizing) to derive a theme or to change a copied component.

## Behavior, previews and native tests [#behavior-previews-and-native-tests]

| Surface        | Role                                                             |
| -------------- | ---------------------------------------------------------------- |
| `apps/website` | Public docs; `apps/website/demos/<id>.tsx` is the page's preview |
| `apps/gallery` | Native behavior tests and smoke pages for the same components    |

Behavior, keyboard support and accessibility belong to `nsh/base`: [nsh.dev/elements](https://nsh.dev/elements). This site documents install, usage, examples and the props the styled layer adds.