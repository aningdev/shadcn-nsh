# NSH monorepo starter

[English](./README.md)

[shadcn-nsh](https://github.com/aningdev/shadcn-nsh) 的消费方布局：NSH 应用在 `apps/web`，styled UI 在 `packages/ui`（copy-into-app）。

```sh
bun install
bun run check
bun run dev
```

添加组件（在 monorepo 根或 `apps/web`）：

```sh
shadcn-nsh add button -c apps/web
```

文件落在 `packages/ui`。应用导入：`@workspace/ui/components/ui/button`。
