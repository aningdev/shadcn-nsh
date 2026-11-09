# @shadcn-nsh/theme

[English](./README.md)

shadcn-nsh 的 design token 源。**`theme.json`**（经 `nsh.json` 的 `theme` 接入）是颜色/半径真源；[`finishes.json`](./finishes.json) 提供 light/dark 表面深度（`finish.*`）；[`theme.ts`](./theme.ts) 提供 `token()` 辅助（`colors`、`radius`、`finish`、`pressSink` 等）给 styled 包装使用。

由 [`@shadcn-nsh/ui`](../ui) 消费，并以 registry 的 `theme` 项分发（`theme.json` + `lib/finishes.json` + `lib/theme.ts`）。修改后在仓库根执行 `bun run registry:build`，并提交 `public/r`。
