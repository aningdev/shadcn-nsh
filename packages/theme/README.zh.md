# @shadcn-nsh/theme

[English](./README.md)

shadcn-nsh 的 design token 源。**`theme.json`**（经 `nsh.json` 的 `theme` 接入）是真源；[`theme.ts`](./theme.ts) 只提供 `token()` 辅助（`colors`、`radius` 等）给 styled 包装使用。

由 [`@shadcn-nsh/ui`](../ui) 消费，并以 registry 的 `theme` 项分发（`theme.json` + `lib/theme.ts`）。修改后在仓库根执行 `bun run registry:build`，并提交 `public/r`。
