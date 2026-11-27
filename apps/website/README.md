# Website

TanStack Start + Fumadocs 的静态文档站。页面写安装、用法、示例，以及样式层增加的 props。行为与完整的 `nsh/base` API 链到 [nsh.dev](https://nsh.dev/elements)。

页面在 `content/docs/`，由 `src/routes/docs/$.tsx` 渲染。组件页的章节次序见 [`docs/port.md`](../../docs/port.md#文档页)。`src/lib/official.ts` 与 `demos/palettes.ts` 生成的行不手写。

```sh
bun run dev:docs         # vite dev，:4321
bun run check:pages      # registry ↔ 页面 ↔ 演示
bun run check:docs
bun run docs:components
bun run docs:demos
bun run build:docs
```

`DOCS_BASE` 决定站点根：发布为 `/`，`main` 为 `/dev/`。代码里的站点路径过 `sitePath()`。
