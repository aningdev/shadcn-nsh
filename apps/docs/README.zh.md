# @shadcn-nsh/docs

[English](./README.md)

copy-into-app 组件的 Astro 文档站。每页讲安装、用法、示例和外壳新增的 props；行为与完整的 `nsh/base` API 深链到 [nsh.dev](https://nsh.dev/elements)。

```sh
bun run dev:docs
bun run check:docs
bun run check:pages   # registry ↔ 页面 ↔ 演示、章节、import 名字
bun run docs:demos    # 把演示打包到 public/demos 供预览
```

作者约定与页面契约见 [`AGENTS.md`](./AGENTS.md)。组件清单由 `registry.json` 和页面生成 —— `bun run docs:components`，见 `src/lib/components.generated.ts`。
