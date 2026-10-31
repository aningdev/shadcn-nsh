---
layout: ../../layouts/Docs.astro
title: Getting started
description: Create a monorepo or init shadcn-nsh in an existing NSH app.
---

## Create a monorepo (default)

Scaffolds `apps/web` + `packages/ui` (UI lands in packages):

```sh
bunx shadcn-nsh create my-app
cd my-app
bun install
bun run check
bun run dev
```

From this repo during development:

```sh
bun run shadcn-nsh -- create my-app -c /tmp
```

## Existing single NSH app

If you already have `nsh.json` (from `nsh init`):

```sh
shadcn-nsh init
shadcn-nsh add button
```

Files land next to the app (`theme.json`, `components/ui/…`).

## Add components in a monorepo

```sh
shadcn-nsh add button -c apps/web
```

Installs into `packages/ui`. Import from the app:

```tsx
import { Button } from "@workspace/ui/components/ui/button";
```

## Local registry (developing this repo)

```sh
bun run registry:build
bun run registry:serve
bun run shadcn-nsh -- add button -c apps/web --registry 'http://127.0.0.1:4173/{name}.json'
```

## Theme

Token truth is `theme.json` (see [Theme](./theme)). Add it with `shadcn-nsh add theme` before or with the first component.

## Gallery vs docs vs template

| Surface                  | Role                                                 |
| ------------------------ | ---------------------------------------------------- |
| `apps/gallery`           | Native demo of authoring packages (`@shadcn-nsh/ui`) |
| `apps/docs`              | Public docs + optional web previews                  |
| `templates/nsh-monorepo` | Consumer starter copied by `create`                  |

Behavior / a11y for controls: [nsh.dev/elements](https://nsh.dev/elements). This site documents install, usage, and styled API deltas only.
