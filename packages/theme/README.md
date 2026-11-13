# @shadcn-nsh/theme

[中文](./README.zh.md)

Brand look for the copy-into-app layer. Source of truth is the upstream gallery UI theme, vendored as:

| File            | Role                                        |
| --------------- | ------------------------------------------- |
| `theme.json`    | Colors, radii, cssVars (as upstream)        |
| `finishes.json` | Surface finishes                            |
| `theme.ts`      | Readers: `colors`, `finish`, `focusRing`, … |

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as registry item `theme`. After edits: `bun run port:vendor` (if upstream changed), then `bun run registry:build` and commit `public/r`.

Rules: [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md). Toolchain / baseline: [`docs/toolchain.md`](../../docs/toolchain.md).

```sh
bun run test:unit   # theme contract among other unit tests
```

Replace `theme.json` + `finishes.json` together to rebrand; keep keys the upstream theme declares so finishes resolve.
