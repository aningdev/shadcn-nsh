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

## 在 NSH 应用中使用

在已有 NSH 项目目录（含 `nsh.json`）：

```sh
# 本地 registry（开发本仓时）
bun run registry:build
bun run registry:serve   # 另开终端

bun run shadcn-nsh -- init -c /path/to/app --registry 'http://127.0.0.1:4173/{name}.json'
bun run shadcn-nsh -- add button -c /path/to/app --registry 'http://127.0.0.1:4173/{name}.json'
```

push 到 GitHub 后，可省略 `--registry`，默认拉取：

`https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`

`init` 会写入：

- `nsh-ui.json`（registry URL + aliases）
- `theme.json` + `lib/theme.ts`
- 更新 `nsh.json` 的 `"theme": "./theme.json"`

`add button` 会写入 `components/ui/button.tsx`（并把 `@shadcn-nsh/theme` 改写成相对路径）。

## 本仓开发

```sh
bun run check:gallery
bun run dev:gallery
bun run registry:build
```

改 `packages/ui` 或 `packages/theme` 后务必 `bun run registry:build`，再提交 `public/r`。

## 布局

| 路径 | 包名 | 说明 |
| --- | --- | --- |
| `packages/theme` | `@shadcn-nsh/theme` | design tokens |
| `packages/ui` | `@shadcn-nsh/ui` | styled 组件源 |
| `packages/cli` | `@shadcn-nsh/cli` | `shadcn-nsh` CLI |
| `public/r` | — | HTTP registry 产物 |
| `apps/gallery` | `@shadcn-nsh/gallery` | 演示应用 |
