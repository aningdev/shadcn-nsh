# shadcn-nsh

[中文](./README.zh.md)

CLI for adding styled NSH components (copy-into-app) from the shadcn-nsh registry.

```sh
bunx shadcn-nsh@latest init -c apps/web
bunx shadcn-nsh@latest add button
```

Default registry: `https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`.

## Commands

| Command             | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `init`              | Writes `nsh-ui.json`, installs a theme, points each `nsh.json` at it |
| `add [components…]` | Copies items and their `registryDependencies` into the app           |
| `list`              | The registry's items, `✓` on the ones the app has                    |
| `view <items…>`     | The files `add` would write: target paths and contents               |
| `diff [items…]`     | The app's files against the registry's; exit code 1 when they differ |
| `build`             | Builds `registry.json` into `public/r` (maintaining this registry)   |
| `serve`             | Serves `public/r` over HTTP for local testing                        |

Every command takes `-c, --cwd <dir>` (default: the current directory). `init`, `add`, `list`,
`view` and `diff` also take `--registry <url>`, a template with `{name}` in it; without it, `add`,
`list`, `view` and `diff` use the one in `nsh-ui.json`, and `init` uses the public registry.
`init` also takes `--overwrite`, `-y` (accepted; nothing prompts today) and `--theme <name>`,
`default` (the library's own) or `shadcn` (shadcn's neutral palette and flat finishes).

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
- `theme.json` is merged by key: the app keeps its colors and gains the tokens it lacks. A
  recolored theme is kept as it is (`kept theme.json (the app's colors stay)`).
- `--all` (`-a`) adds every `registry:ui` item the catalog lists, dependencies included.
- Naming a theme (`add theme-shadcn`, or `add theme` to go back) switches the app's theme: its
  files are written where they differ and `nsh-ui.json`'s `theme` records the new one.
- After that, `theme` as a dependency resolves to the theme the app has, so `add button`,
  `add button --overwrite` and `add --all --overwrite` never write the default theme back.
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
overwriting would drop, `+` one it would add. `theme.json` compares keys, not values — a
recolored theme is the app's own, and only `add --overwrite` replaces it.

## nsh-ui.json

`init` writes it where components install:

```json
{
  "registry": "https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json",
  "theme": "theme",
  "aliases": {
    "components": "./components",
    "ui": "./components/ui",
    "lib": "./lib",
    "theme": "./lib/theme"
  }
}
```

`theme` is the `registry:theme` item the app installed (`theme`, or `theme-shadcn`); a file
without it is on `theme`.

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
