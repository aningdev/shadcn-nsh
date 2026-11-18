## 改了什么

<!-- 一句话说清这个 PR 给用的人带来什么。列表展开细节。 -->

## 为什么

<!-- 改之前是什么样、哪里不对。 -->

Closes #

## 怎么确认

<!-- 你跑过的命令与看到的结果；改外观的，贴四张截图（亮/暗 × 手机/桌面）。 -->

## 检查清单

- [ ] PR 标题是约定式提交信息（`fix(menu): …`），它就是合并后的提交
- [ ] 用的人能感知到的改动：`CHANGELOG.md` 的 `Unreleased` 已加一条
- [ ] `bun run check` 通过
- [ ] 改过组件或演示：`bun run port:render`，四张截图人眼看过
- [ ] 改过行为：`bun run test:gallery`
- [ ] 改过 registry 条目或 CLI：`bun run test:install`
- [ ] 改过 `registry.json` 或组件文件：`bun run registry:build` 已重跑，`public/r` 的改动一起提交

<!--
没跑的那几项写清为什么。新组件请照 docs/port.md 的流程来，并补演示与文档页。
-->
