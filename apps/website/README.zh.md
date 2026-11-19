# @shadcn-nsh/website

[English](./README.md)

copy-into-app 组件的文档站：TanStack Start + Fumadocs，构建成静态站。每页讲安装、用法、示例和外壳新增的 props；行为与完整的 `nsh/base` API 深链到 [nsh.dev](https://nsh.dev/elements)。

```sh
bun run dev:docs      # :4321 上的 vite dev
bun run check:docs    # tsc --noEmit
bun run check:pages   # registry ↔ 页面 ↔ 演示、章节、import 名字
bun run docs:demos    # 把演示打包到 public/demos 供预览
bun run build:docs    # nsh:bootstrap + docs:demos + 构建 → .output/public
```

页面在 `content/docs/`，由 `src/routes/docs/$.tsx` 渲染；站点在自有域名的根路径上，站内链接写普通绝对路径。作者约定与页面契约见 [`AGENTS.md`](./AGENTS.md)。组件清单由 `registry.json` 和页面生成 —— `bun run docs:components`，见 `src/lib/components.generated.ts`。
