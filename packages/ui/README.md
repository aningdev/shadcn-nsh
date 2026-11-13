# @shadcn-nsh/ui

[中文](./README.zh.md)

Styled copy-into-app components on [`nsh/base`](https://nsh.dev/elements): behavior and a11y stay in base; look comes from the upstream gallery UI via `// @port` regions and [`@shadcn-nsh/theme`](../theme).

- Rules and port flow: [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md), [`docs/port.md`](../../docs/port.md), [`AGENTS.md`](../../AGENTS.md)
- Routing: [`port-map.json`](../../port-map.json)
- Demos / render check: [`apps/docs/demos`](../../apps/docs/demos)
- Docs: [`apps/docs`](../../apps/docs)
- Native smoke: [`apps/gallery`](../../apps/gallery)

## Layers

| Layer        | Home                | Role                                       |
| ------------ | ------------------- | ------------------------------------------ |
| Primitives   | `nsh`               | Layout / draw / host                       |
| Base         | `nsh/base`          | Unstyled controls                          |
| Theme        | `@shadcn-nsh/theme` | Colors, finishes, radii from upstream      |
| This package | `@shadcn-nsh/ui`    | One file per component; registry for `add` |

Each file is upstream look (`// @port … // @port end`, filled by `bun run port:vendor`) plus a thin shell. Do not edit inside `@port` regions; register intentional diffs in `port-map.json` `replace`.

## Toolchain

Develop against **NSH nightly** aligned with the pinned upstream commit in `port-map.json` (see [`docs/toolchain.md`](../../docs/toolchain.md)).

```sh
bun run port:check
nsh check apps/docs/demos
bun run port:render
bun run registry:build
```

Install into an app with `npx shadcn-nsh@latest add <id>`. Component list: the docs site and root `registry.json`.
