# shadcn-nsh

为 [Native Shell (NSH)](https://github.com/longbridge/nsh) 构建的 styled UI 体系：在 `nsh/base` 之上提供可复制进应用的组件与分发体验，模式对齐 [shadcn/ui](https://github.com/shadcn-ui/ui)。

Agent 与贡献约定见 [`AGENTS.md`](AGENTS.md)。参考源码以 git submodule 挂在 [`references/`](references/)。

## 前置

- [Bun](https://bun.com)
- [NSH CLI](https://nsh.dev/docs/installation)（`nsh`）

```sh
git submodule update --init --recursive
bun install
```

## 创建 monorepo（推荐）

默认脚手架：`apps/web` + `packages/ui`（组件落在 packages）：

```sh
# 本仓开发：
bun run shadcn-nsh -- create my-app
# 或发布后：
# bunx shadcn-nsh@latest create my-app
cd my-app
bun install
bun run check
bun run dev
```

继续添加组件：

```sh
bunx shadcn-nsh@latest add button -c apps/web
```

## 在已有单 app 中使用

目录需已有 `nsh.json`（`nsh init`）：

```sh
# 本地 registry（开发本仓时）
bun run registry:build
bun run registry:serve   # 另开终端

bun run shadcn-nsh -- init -c /path/to/app --registry 'http://127.0.0.1:4173/{name}.json'
bun run shadcn-nsh -- add button -c /path/to/app --registry 'http://127.0.0.1:4173/{name}.json'
```

push 到 GitHub 后可省略 `--registry`，默认：

`https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`

## 本仓开发

工具链：Bun + [Vite+](https://viteplus.dev)（`vp fmt` / `vp lint` / `vp check`）。

```sh
bun run check
bun run check:gallery
bun run dev:gallery
bun run dev:docs
bun run docs:demos      # 可选：打包 docs 内 NSH web 预览
bun run registry:build
```

改 `packages/ui` 或 `packages/theme` 后务必 `bun run registry:build`，再提交 `public/r`。

## 布局

| 路径                     | 包名 / 角色           | 说明                                          |
| ------------------------ | --------------------- | --------------------------------------------- |
| `packages/theme`         | `@shadcn-nsh/theme`   | design tokens（作者侧 registry 源）           |
| `packages/ui`            | `@shadcn-nsh/ui`      | styled 组件源                                 |
| `packages/cli`           | `shadcn-nsh` (npm)    | `create` / `init` / `add` / `build` / `serve` |
| `public/r`               | —                     | HTTP registry 产物                            |
| `apps/gallery`           | `@shadcn-nsh/gallery` | 原生验真 demo                                 |
| `apps/docs`              | `@shadcn-nsh/docs`    | Astro 文档站（可选 web iframe 预览）          |
| `templates/nsh-monorepo` | 消费方模板            | `create` 拷贝源；**不进**根 workspaces        |
