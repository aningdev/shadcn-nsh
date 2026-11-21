# shadcn-nsh

[中文](./README.zh.md)

CLI for adding styled NSH components (copy-into-app) from the shadcn-nsh registry.

```sh
bunx shadcn-nsh@latest init -c apps/web
bunx shadcn-nsh@latest add button
```

Default registry: `https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`.

## Commands

| Command             | What it does                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `init`              | Writes `nsh-ui.json`, installs a theme, points each `nsh.json` at it, sets up `@/` in an app  |
| `add [components…]` | Copies items and their `registryDependencies` into the app                                    |
| `list`              | The registry's items, `✓` on the ones the app has                                             |
| `view <items…>`     | The files `add` would write: target paths and contents                                        |
| `diff [items…]`     | The app's files against the registry's; exit 1 when they differ, 2 when offline with no cache |
| `build`             | Builds `registry.json` into `public/r` (maintaining this registry)                            |
| `serve`             | Serves `public/r` over HTTP for local testing                                                 |

Every command takes `-c, --cwd <dir>` (default: the current directory). `init`, `add`, `list`,
`view` and `diff` also take `--registry <url>`, a template with `{name}` in it; without it, `add`,
`list`, `view` and `diff` use the one in `nsh-ui.json`, and `init` uses the public registry.
`init` also takes `--overwrite`, `-y` (accepted; nothing prompts today) and `--theme <name>`,
`default`, `shadcn`, `solid-glass`, `apple`, or `native` — the theme the app is **built** with:
`theme.json`, `lib/ui/semantics.json`, and what `nsh.json` points at.

## add

```sh
shadcn-nsh add button -c apps/web
shadcn-nsh add --all
shadcn-nsh add button --dry-run
shadcn-nsh add button --overwrite
```

- A file the app does not have is written; one identical to the registry's is skipped.
- A file the app changed is kept and reported: `kept components/ui/button.tsx, differs (run diff)`.
  `--overwrite` (`-o`) replaces it and prints the change: `overwrite components/ui/button.tsx (+2 -1)`.
- `theme.json` and `semantics.json` are merged by key: the app keeps its colors, style values
  and finishes and gains any tokens, style keys, or finishes it lacks. Customized theme files
  with no missing keys are kept as they are (`kept theme.json (the app's colors stay)`,
  `kept lib/ui/semantics.json (the app's semantics stay)`).
- `--all` (`-a`) adds every `registry:ui` item the catalog lists, dependencies included.
- Naming a theme (`add theme-shadcn`) installs **one more theme**: its files land in
  `themes/<name>/` and can be switched to while the app runs (`selectTheme`, see
  [`packages/theme/README.md`](../theme/README.md#more-than-one-theme)). It does not touch the
  app's build-time theme, and `nsh-ui.json` stays as it is. To make a theme the build-time one,
  re-run `init --theme <name> --overwrite`.
- **This library's own theme is one of them**: `add theme-default` installs it into
  `themes/default/` (its `theme.json` and `semantics.json` are the ones an app is built with, and
  an `index.ts` exports `defaultTheme`). An app built with `init --theme shadcn` lists both and
  switches between them; `selectTheme(null)` still means its build-time theme.
- `theme`, named or as a dependency, is the theme in `nsh-ui.json`: in an app on `theme-shadcn`
  it writes shadcn's data at the build-time paths, the roles module and `themes/shadcn/`, so
  `add theme --overwrite`, `add button --overwrite` and `add --all --overwrite` never write the
  default theme back.
- The packages the items import (`lucide`) are installed with the app's package manager, except
  one `package.json` already declares in range: an exact `"lucide": "1.66.0"` stays as written
  (`keep lucide (package.json has it in range)`), and only an older one is raised.
- `--dry-run` prints the same lines as `would write …` / `would overwrite …` and writes nothing —
  not even `nsh-ui.json` or the theme `init` would install first.

## list, view, diff

```sh
shadcn-nsh list
shadcn-nsh list --json
shadcn-nsh view button
shadcn-nsh diff
shadcn-nsh diff button
```

`list` reads the catalog (`index.json`) and marks an item when any of its files is in the app.

`view` prints what `add` would write — dependencies first, at their target paths, with imports
rewritten for this app — and writes nothing.

`diff` compares the same rewritten content with the app's files. Without an item it lists the
installed items that differ; with one it prints the changed lines. It exits 1 when anything
differs, so it can gate an update:

```sh
shadcn-nsh diff || echo "run shadcn-nsh add <item> --overwrite"
```

Lines are the registry's version against the app's: `-` is a line of the app's file that
overwriting would drop, `+` one it would add. `theme.json` and `semantics.json` compare keys, not
values — a recolored or customized theme is the app's own, and only `add --overwrite` replaces it.

## nsh-ui.json

`init` writes it where components install:

```json
{
  "registry": "https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json",
  "theme": "theme",
  "aliases": {
    "components": "./components",
    "ui": "./components/ui",
    "lib": "./lib/ui",
    "theme": "./lib/ui/theme"
  }
}
```

`theme` is the `registry:theme` item the app's **build-time** theme came from (`theme`, or
`theme-shadcn` after `init --theme shadcn`); a file without it is on `theme`. A theme added later
(`add theme-shadcn`) changes nothing here: it lives in `themes/shadcn/`, and the app lists it.

In a monorepo (`apps/*` + `packages/ui`) it lives in `packages/ui` and `add -c apps/web`
installs there.

## Develop in this monorepo

```sh
bun run shadcn-nsh -- --help
bun run cli:build
bun run registry:build   # public/r, then e2e against it
bun run shadcn-nsh -- add button -c apps/web --registry "file://$PWD/public/r/{name}.json"
```

`bun test packages/cli` runs the command tests against a temporary app and a `file://` registry
built from `public/r`.
