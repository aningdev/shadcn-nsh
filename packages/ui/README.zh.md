# @shadcn-nsh/ui

[English](./README.md)

基于 [`nsh/base`](https://nsh.dev/elements) 的 copy-into-app 组件：行为与无障碍在 base；外观起于上游 gallery UI（有上游的组件在文件头致谢；归本库，可直接改）与 [`@shadcn-nsh/theme`](../theme)。

- 规范与移植流程：[`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)、[`docs/port.md`](../../docs/port.md)、[`AGENTS.md`](../../AGENTS.md)
- 路由：[`port-map.json`](../../port-map.json)
- 演示 / 渲染比对：[`apps/website/demos`](../../apps/website/demos)
- 文档站：[`apps/website`](../../apps/website)
- 原生冒烟：[`apps/gallery`](../../apps/gallery)

每个文件 = look + 薄外壳，整份归本库、可直接改。look 起于上游 gallery UI 的，文件头一行致谢（`Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.`），上游有变化时 `port:check` 列出待审阅项、`bun run port:review` 记下审阅；没有上游的（`pressable`）文件头没有这一行。

工具链用 **NSH nightly**，与 `port-map.json` 基线提交对齐（见 [`docs/toolchain.md`](../../docs/toolchain.md)）。安装：`npx shadcn-nsh@latest add <id>`。
