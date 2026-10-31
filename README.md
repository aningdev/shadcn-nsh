# shadcn-nsh

为 [Native Shell (NSH)](https://github.com/longbridge/nsh) 构建的 styled UI 体系：在 `nsh/base` 之上提供可复制进应用的组件与分发体验，模式对齐 [shadcn/ui](https://github.com/shadcn-ui/ui)。

Agent 与贡献约定见 [`AGENTS.md`](AGENTS.md)。参考源码以 git submodule 挂在 [`references/`](references/)。

## 前置

- [Bun](https://bun.com)
- [NSH CLI](https://nsh.dev/docs/installation)（`nsh`）

克隆后初始化 submodule：

```sh
git submodule update --init --recursive
bun install
```

## 开发

```sh
bun run check:gallery   # nsh check apps/gallery
bun run dev:gallery     # nsh run apps/gallery
```

## 布局

| 路径 | 包名 | 说明 |
| --- | --- | --- |
| `packages/theme` | `@shadcn-nsh/theme` | design tokens |
| `packages/ui` | `@shadcn-nsh/ui` | styled 组件 |
| `apps/gallery` | `@shadcn-nsh/gallery` | 演示应用 |
