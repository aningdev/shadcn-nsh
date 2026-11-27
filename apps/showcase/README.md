# Showcase

用本库组件重建 NSH Gallery（`references/nsh/examples/gallery`）的壳与场景。网站首页 “See it running” 嵌入其打包产物。见 [#78](https://github.com/aningdev/shadcn-nsh/issues/78)。

- `App.tsx` 是壳。`theme.ts` 管调色板与外观。`kit.tsx` 是每个场景的排版。
- `groups/<group>.ts` 按用途做索引。`demos/` 一文件一场景，经 `kit` 排版；颜色只来自主题；不进 `Stage`，也不播声音。
- `assets/` 是场景用的图、字体与媒体。`tests/` 是壳的行为测试。

```sh
bun run dev:showcase
nsh check apps/showcase
```
