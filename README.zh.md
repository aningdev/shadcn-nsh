# shadcn-nsh

[English](./README.md)

为 [Native Shell (NSH)](https://github.com/longbridge/nsh) 构建的 styled UI 体系：在 `nsh/base` 之上提供可复制进应用的组件与分发体验，模式对齐 [shadcn/ui](https://github.com/shadcn-ui/ui)。

Agent 与贡献约定见 [`AGENTS.md`](AGENTS.md)。词汇见 [`docs/GLOSSARY.md`](docs/GLOSSARY.md)，架构见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)，规则与决策见 [`packages/ui/README.zh.md`](packages/ui/README.zh.md)（组件）和 [`packages/theme/README.zh.md`](packages/theme/README.zh.md)（主题、动效）。参考源码以 git submodule 挂在 [`references/`](references/)。

## 前置

- [Bun](https://bun.com)
- [NSH CLI](https://nsh.dev/docs/installation)（`nsh`）**安装而来，从不编译**：装 [`port-map.json`](port-map.json) 的 `upstream.cli` 指定的版本（当前 `v0.5.1`），`curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=v0.5.1 sh`。它打印的提交就是**基线**，即 [`port-map.json`](port-map.json) 的 `upstream.commit`；nightly 动了，`bun run port:bump` 把基线一起移动。两者不同时 `port:check` 只警告、不失败（[`docs/toolchain.md`](docs/toolchain.md)）。搬入的代码用的是基线运行时的能力，所以早于基线的 CLI 都是错的。
- 别的都不用：运行时随安装的 CLI 而来（缺哪个 target 的它会自己装），没有 `NSH_RUNTIME` 要导出。

```sh
# 子模块：上游基线与 shadcn 参考
git submodule update --init --recursive

# CLI：安装，不编译
curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=v0.5.1 sh   # port-map.json 的 upstream.cli
export PATH="$HOME/.local/bin:$PATH"   # 安装器把 nsh 链到这里

bun install
bun run nsh:bootstrap   # 校验 CLI 与 references/nsh 都在基线，生成各 .nsh
```

## 在已有 NSH app 中使用

目录需已有 `nsh.json`（`nsh init`）。消费方 monorepo 脚手架（`create`）暂缓。

组件从 [`lucide`](https://lucide.dev) 引入图标；`init` / `add` 用应用自己的包管理器（按锁文件取 `bun`、`pnpm`、`yarn`，否则 npm）装着条目声明的包。没有 `package.json` 的应用会得到一个最小的；`--dry-run` 只打印命令。

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

移植流程、规范与检查：[`docs/port.md`](docs/port.md)、[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 布局

| 路径                                  | 包名 / 角色           | 说明                                                                      |
| ------------------------------------- | --------------------- | ------------------------------------------------------------------------- |
| `packages/theme`                      | `@shadcn-nsh/theme`   | `theme.json`、`finishes.json`、`theme.ts`（本库主题，颜色一律 `oklch()`） |
| `packages/ui`                         | `@shadcn-nsh/ui`      | 移植组件：`// @port` 区域 + 外壳                                          |
| `apps/docs/demos`                     | —                     | 验收演示、参照页、`port:render`                                           |
| `apps/docs/src/pages/docs/components` | —                     | 组件文档页                                                                |
| `apps/gallery`                        | `@shadcn-nsh/gallery` | 原生行为测试与冒烟页                                                      |
| `packages/cli`                        | `shadcn-nsh`（npm）   | `init` / `add` / `build` / `serve`                                        |
| `registry.json` → `public/r`          | —                     | registry 源 → 提交进 git 的 HTTP 产物                                     |
| `scripts/port`                        | —                     | `port:new` / `port:vendor` / `port:check` / `port:render` / `port:bump`   |
| `port-map.json`                       | —                     | 上游每个文件、每个声明的去向                                              |
| `references/`                         | —                     | 只读子模块：上游基线、shadcn 参考                                         |
