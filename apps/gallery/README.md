# Gallery

`packages/ui` 的原生行为测试与冒烟页，组件与文档站相同。截图比对在 `apps/website/demos`（`port:render`）。

```sh
bun run dev:gallery
bun run check:gallery
bun run test:gallery
```

一族增加：`packages/ui` 里的组件、`tests/<family>.fixture.tsx`、`tests/<family>.test.tsx`；需要上冒烟页时再在 `App.tsx` 加一节。测试驱动原生事件、读原生状态，不比像素。约定见根 [`AGENTS.md`](../../AGENTS.md)。
