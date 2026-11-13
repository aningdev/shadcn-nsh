---
layout: ../../layouts/Docs.astro
title: CLI
description: Every shadcn-nsh@latest command, with its flags and defaults.
---

`shadcn-nsh@latest` copies registry items into an existing NSH app. The component pages use `npx shadcn-nsh@latest add <name>`; this page is the command reference.

`-c, --cwd <dir>` is the app or monorepo directory (default: the current directory). `--registry <url>` is a template containing `{name}`; `add`, `list`, `view` and `diff` use the `registry` in `nsh-ui.json` when it is omitted, or the public registry at `https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`. `init` uses that public registry. Every command takes `-h, --help`; `shadcn-nsh --version` prints the version.

## init

Writes `nsh-ui.json`, installs the theme and points every `nsh.json` at it. Run it once in an app that already has `nsh.json`.

```sh
shadcn-nsh@latest init [options]
```

| Flag               | What it does                                 | Default               |
| ------------------ | -------------------------------------------- | --------------------- |
| `-c, --cwd <cwd>`  | App or monorepo directory.                   | The current directory |
| `-y, --yes`        | Accepted for scripts; nothing prompts today. | `false`               |
| `--overwrite`      | Overwrite files that already exist.          | `false`               |
| `--registry <url>` | Registry URL template containing `{name}`.   | The public registry   |

```sh
npx shadcn-nsh@latest init -c apps/web
```

It writes `theme.json`, `lib/finishes.json` and `lib/theme.ts` into the app (under `packages/ui` in a monorepo), and a `tsconfig.json` when the app has none.

## add

Copies items and their `registryDependencies` into the app, dependencies first.

```sh
shadcn-nsh@latest add [options] [components...]
```

Name at least one item, or pass `--all`.

| Flag               | What it does                                 | Default                                       |
| ------------------ | -------------------------------------------- | --------------------------------------------- |
| `-c, --cwd <cwd>`  | App or monorepo directory.                   | The current directory                         |
| `-o, --overwrite`  | Replace files the app has changed.           | `false`                                       |
| `-a, --all`        | Every `registry:ui` item the registry lists. | `false`                                       |
| `--dry-run`        | Print what would be written; write nothing.  | `false`                                       |
| `--registry <url>` | Registry URL template containing `{name}`.   | `nsh-ui.json`'s registry, else the public one |

```sh
npx shadcn-nsh@latest add button
npx shadcn-nsh@latest add --all
npx shadcn-nsh@latest add button --dry-run
npx shadcn-nsh@latest add button --overwrite
```

A file the app lacks is written, one identical to the registry's is skipped, and one the app changed is kept unless `--overwrite`. Without `--overwrite`, a `theme.json` gains only the keys it lacks.

## list

Lists the registry's items, marking the ones the app has.

```sh
shadcn-nsh@latest list [options]
```

| Flag               | What it does                               | Default                                       |
| ------------------ | ------------------------------------------ | --------------------------------------------- |
| `-c, --cwd <cwd>`  | App or monorepo directory.                 | The current directory                         |
| `--json`           | Print the catalog as JSON.                 | `false`                                       |
| `--registry <url>` | Registry URL template containing `{name}`. | `nsh-ui.json`'s registry, else the public one |

```sh
npx shadcn-nsh@latest list
```

`✓` marks an item when any of its files is in the app; the last line counts the items and the installed ones.

## view

Prints the files `add` would write, dependencies first, at their target paths and with imports rewritten for the app. Writes nothing.

```sh
shadcn-nsh@latest view [options] <items...>
```

| Flag               | What it does                               | Default                                       |
| ------------------ | ------------------------------------------ | --------------------------------------------- |
| `-c, --cwd <cwd>`  | App or monorepo directory.                 | The current directory                         |
| `--registry <url>` | Registry URL template containing `{name}`. | `nsh-ui.json`'s registry, else the public one |

```sh
npx shadcn-nsh@latest view button
```

## diff

Compares the app's installed files with the registry's. Exits `1` when they differ.

```sh
shadcn-nsh@latest diff [options] [items...]
```

| Flag               | What it does                               | Default                                       |
| ------------------ | ------------------------------------------ | --------------------------------------------- |
| `-c, --cwd <cwd>`  | App or monorepo directory.                 | The current directory                         |
| `--registry <url>` | Registry URL template containing `{name}`. | `nsh-ui.json`'s registry, else the public one |

```sh
npx shadcn-nsh@latest diff
npx shadcn-nsh@latest diff button
```

Without an item it lists the installed items that differ; with one it prints the changed lines. `-` is a line of the app's file that overwriting would drop, `+` one it would add. A recolored `theme.json` is not a difference; a missing key is.

```sh
npx shadcn-nsh@latest diff || echo "run shadcn-nsh@latest add <item> --overwrite"
```

## Hosting a registry

The public registry is `registry.json` built into `public/r` and served from GitHub. To host your own, build the same files and pass its URL to `--registry`.

This repository has both steps as scripts: `bun run registry:build` and `bun run registry:serve`.

### build

Builds a registry into one JSON per item plus the `index.json` that `list` and `add --all` read.

```sh
shadcn-nsh@latest build [options] [registry]
```

The argument is the registry file (default `./registry.json`). It fails when an item's `registryDependencies` disagree with its imports.

| Flag                  | What it does       | Default               |
| --------------------- | ------------------ | --------------------- |
| `-o, --output <path>` | Output directory.  | `./public/r`          |
| `-c, --cwd <cwd>`     | Working directory. | The current directory |

```sh
npx shadcn-nsh@latest build
```

### serve

Serves the built registry over HTTP at `127.0.0.1` for local testing.

```sh
shadcn-nsh@latest serve [options]
```

| Flag                | What it does        | Default               |
| ------------------- | ------------------- | --------------------- |
| `-p, --port <port>` | Port.               | `4173`                |
| `-d, --dir <path>`  | Registry directory. | `./public/r`          |
| `-c, --cwd <cwd>`   | Working directory.  | The current directory |

```sh
npx shadcn-nsh@latest serve
npx shadcn-nsh@latest add button --registry "http://127.0.0.1:4173/{name}.json"
```

`serve` prints the `--registry` URL to use.
