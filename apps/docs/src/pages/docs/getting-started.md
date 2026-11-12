---
layout: ../../layouts/Docs.astro
title: Getting started
description: Add shadcn-nsh to an existing NSH app.
---

## An existing NSH app

An app with `nsh.json` (from `nsh init`) is ready:

```sh
npx shadcn-nsh@latest init
npx shadcn-nsh@latest add button
```

`init` writes `nsh-ui.json`, adds the `theme` item and points each `nsh.json` at `theme.json`. `add` copies the component and its `registryDependencies` (the theme and the shared look files it imports) into the app; from then on the files are the app's own.

Consumer monorepo scaffolding (`shadcn-nsh create`) is not built. `init` and `add` work in a workspace that already has `apps/*` and `packages/ui`.

## Commands

| Command           | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `init`            | Writes `nsh-ui.json`, installs `theme`, points each `nsh.json` at it |
| `add [items…]`    | Copies items and their `registryDependencies` into the app           |
| `list`            | The registry's items, `✓` on the ones the app has                    |
| `view <items…>`   | The files `add` would write: target paths and contents               |
| `diff [items…]`   | The app's files against the registry's; exits 1 when they differ     |
| `build` / `serve` | Build `registry.json` into `public/r`, or serve it locally           |

Every command takes `-c, --cwd <dir>` (default `.`) and `--registry <url>`, a template with `{name}` in it.

## Add

```sh
npx shadcn-nsh@latest add button -c apps/web
npx shadcn-nsh@latest add --all
npx shadcn-nsh@latest add button --dry-run
npx shadcn-nsh@latest add button --overwrite
```

- A file the app does not have is written; one identical to the registry's is skipped.
- A file the app changed is kept and reported: `kept components/ui/button.tsx, differs (run diff)`. `--overwrite` replaces it and prints the change: `overwrite components/ui/button.tsx (+2 -1)`.
- `theme.json` is merged by key: the app keeps its colors and gains the tokens it lacks. A recolored theme stays as it is.
- `--all` adds every `registry:ui` item, dependencies included.
- `--dry-run` writes nothing — not even `nsh-ui.json` or the theme — and prints what it would write.

## list, view, diff

```sh
npx shadcn-nsh@latest list
npx shadcn-nsh@latest view button
npx shadcn-nsh@latest diff
npx shadcn-nsh@latest diff button
```

`list` reads the catalog (`index.json`) and marks an item when any of its files is in the app. `view` prints what `add` would write, dependencies first, with imports rewritten for the app. `diff` compares the same rewritten content with the app's files; without an item it lists the installed items that differ, with one it prints the changed lines, and it exits 1 when anything differs:

```sh
npx shadcn-nsh@latest diff || echo "run shadcn-nsh add <item> --overwrite"
```

## Monorepo

If the workspace has `apps/web` and `packages/ui`:

```sh
npx shadcn-nsh@latest add button -c apps/web
```

The files install into `packages/ui`, and the app imports them through the workspace:

```tsx
import { Button } from "@workspace/ui/components/ui/button";
```

## Local registry

When developing this repository:

```sh
bun run registry:build
bun run registry:serve
bun run shadcn-nsh -- add button -c apps/web --registry "http://127.0.0.1:4173/{name}.json"
```

## Theme

The look is `theme.json` (colors and radii) and `lib/finishes.json` (gradients and shadows); `lib/theme.ts` reads both. Add the theme with `shadcn-nsh add theme` — or let `init` do it — before or with the first component, then edit the two JSON files to rebrand. See [Theme](./theme).

## Behavior, previews and native tests

| Surface        | Role                                                          |
| -------------- | ------------------------------------------------------------- |
| `apps/docs`    | Public docs; `apps/docs/demos/<id>.tsx` is the page's preview |
| `apps/gallery` | Native behavior tests and smoke pages for the same components |

Behavior, keyboard support and accessibility belong to `nsh/base`: [nsh.dev/elements](https://nsh.dev/elements). This site documents install, usage, examples and the props the styled layer adds.
