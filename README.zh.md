# shadcn-nsh

[English](./README.md)

为 [Native Shell (NSH)](https://github.com/longbridge/nsh) 构建的 styled UI 体系：在 `nsh/base` 之上提供可复制进应用的组件与分发体验，模式对齐 [shadcn/ui](https://github.com/shadcn-ui/ui)。

Agent 与贡献约定见 [`AGENTS.md`](AGENTS.md)。词汇见 [`GLOSSARY.md`](GLOSSARY.md)，规则与决策见 [`packages/ui/README.zh.md`](packages/ui/README.zh.md)（组件）和 [`packages/theme/README.zh.md`](packages/theme/README.zh.md)（主题、动效）。参考源码以 git submodule 挂在 [`references/`](references/)。

## 前置

- [Bun](https://bun.com)
- [NSH CLI](https://nsh.dev/docs/installation)（`nsh`）必须构建自**基线提交**：即 [`port-map.json`](port-map.json) 固定的提交，也就是 `nsh --version` 打印的那个。store 发布包或落后的 nightly 都不行——搬入的代码用的是那个提交运行时的能力，CLI 落后时 `port:check` 会报错（[`docs/toolchain.md`](docs/toolchain.md)）。
- 跑 web 演示需要 `NSH_RUNTIME`：指向一个运行时目录（发行包的 `runtime/`，或 `bun run nsh:build` 写出的那个）。`bun run docs:demos` 与 `bun run port:render` 经由它打包、测试。

```sh
# 子模块：上游基线与 shadcn 参考
git submodule update --init --recursive

# 在基线提交上构建 CLI 与 web 运行时（需要 Rust、能编译 wasm32 的 clang 和 llvm-ar）：
bun run nsh:build                                    # 装到 ~/.nsh-sync
export PATH="$HOME/.nsh-sync/bin:$PATH" NSH_RUNTIME="$HOME/.nsh-sync/runtime"

# 或者用 main 的顶端（nightly 频道可能落后于它）：
curl -fsSL https://nsh.dev/install.sh | sh -s -- --source

bun install
bun run nsh:bootstrap   # 校验 CLI 与 references/nsh 都在基线，生成各 .nsh
```

## 在已有 NSH app 中使用

目录需已有 `nsh.json`（`nsh init`）。消费方 monorepo 脚手架（`create`）暂缓。

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

移植方案、规范与检查：[`docs/port-plan.md`](docs/port-plan.md)。

## 布局

| 路径                                  | 包名 / 角色           | 说明                                                                    |
| ------------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| `packages/theme`                      | `@shadcn-nsh/theme`   | `theme.json`、`finishes.json`、`theme.ts`（上游主题）                   |
| `packages/ui`                         | `@shadcn-nsh/ui`      | 移植组件：`// @port` 区域 + 外壳                                        |
| `apps/docs/demos`                     | —                     | 验收演示、参照页、`port:render`                                         |
| `apps/docs/src/pages/docs/components` | —                     | 组件文档页                                                              |
| `apps/gallery`                        | `@shadcn-nsh/gallery` | 原生行为测试与冒烟页                                                    |
| `packages/cli`                        | `shadcn-nsh`（npm）   | `init` / `add` / `build` / `serve`                                      |
| `registry.json` → `public/r`          | —                     | registry 源 → 提交进 git 的 HTTP 产物                                   |
| `scripts/port`                        | —                     | `port:new` / `port:vendor` / `port:check` / `port:render` / `port:bump` |
| `port-map.json`                       | —                     | 上游每个文件、每个声明的去向                                            |
| `references/`                         | —                     | 只读子模块：上游基线、shadcn 参考                                       |
