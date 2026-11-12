# @shadcn-nsh/ui

[English](./README.md)

基于 [`nsh/base`](https://nsh.dev/elements) 的 copy-into-app 组件：行为与无障碍在 base；外观来自上游 gallery UI 的 `// @port` 区域与 [`@shadcn-nsh/theme`](../theme)。

- 规范与移植流程：[`docs/port-plan.md`](../../docs/port-plan.md)、[`AGENTS.md`](../../AGENTS.md)
- 路由：[`port-map.json`](../../port-map.json)
- 演示 / 渲染比对：[`apps/docs/demos`](../../apps/docs/demos)
- 文档站：[`apps/docs`](../../apps/docs)
- 原生冒烟：[`apps/gallery`](../../apps/gallery)

每个文件 = 上游 look（`bun run port:vendor` 填充）+ 薄外壳。不要手改 `@port` 区域；偏离登记在 `port-map.json` 的 `replace`。

工具链用 **NSH nightly**，与 `port-map.json` 基线提交对齐（见 [`docs/toolchain.md`](../../docs/toolchain.md)）。安装：`npx shadcn-nsh@latest add <id>`。
