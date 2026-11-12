# @shadcn-nsh/gallery

[中文](./README.zh.md)

Native behavior tests and smoke pages for [`@shadcn-nsh/ui`](../../packages/ui), on the same components the docs site documents. Screenshot comparison stays in `apps/docs/demos` (`port:render`); this app proves behavior.

```sh
bun run dev:gallery
bun run check:gallery
bun run test:gallery
```

Authoring rules: [`AGENTS.md`](./AGENTS.md). The component list and pages: [`apps/docs`](../docs).
