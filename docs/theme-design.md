# 主题设计：做一套主题要决定什么（Theme v5）

**读者**：需要新增、继承修改或在应用中定制一套 Theme v5 主题的开发者与编码代理。

## 0 参考文档

| 文档                                                       | 内容                                                                             |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`decisions/0020-theme-v5.md`](decisions/0020-theme-v5.md) | Theme v5 总体架构决策（TS 稀疏继承、25 键 `theme.json`、4 层正交模型、零 Proxy） |
| [`specs/theme-roles.md`](specs/theme-roles.md)             | 颜色角色、`surfaces`、`feedback`、`motion` 契约说明                              |
| [`specs/theme-slots.md`](specs/theme-slots.md)             | 13 个 `controls` 控件组配方说明                                                  |
| [`specs/semantics-values.md`](specs/semantics-values.md)   | 五套基准平台主题全字段解析对比表                                                 |
| [`specs/native-themes.md`](specs/native-themes.md)         | Apple、Material、WinUI 原生规范出处与差异登记                                    |

## 1 怎么新增或定制一套主题

### 1.1 在本库内新增内置主题

1. 在 `packages/theme/themes/<id>/index.ts` 使用 `defineTheme({ id, label, extends: base, ... })` 声明稀疏覆写：
   - **仅当需要整体替换调色板时**：提供 `tokens.light` 与 `tokens.dark`（21 个核心颜色键；省略 `brand` 将自动使用 `var(--primary)`）；切勿依赖继承 `base` 的 `brand` / `tints` / `chart`。
   - **字体**：`theme.json` 始终写出 `font-sans` 与 `font-mono`。不配置 `tokens.font` 时为 `system-ui` 与 `monospace`；只有设计语言明确要求特定字体族时才覆写 `tokens.font.{sans,mono}`。
   - **结构与交互**：按需覆写 `metrics`、`elevation`、`surfaces`（11 角色）、`feedback`、`motion`、`controls`（13 组）。
   - **豁免说明**：若依据平台官方规范保留了低于 WCAG 2.2 AA (4.5:1) 的配色对，必须在 `meta.contrastWaivers` 中登记理由与规范出处。
2. 在 `packages/theme/themes/index.ts` 与 `packages/theme/preset.ts` 注册该主题。
3. 运行 `bun run tokens:build`，自动导出该主题目录下的：
   - `theme.json`（9 个共享键：`font-sans`、`font-mono`、`radius`、`radius-md`、`radius-lg`、`radius-xl`、`scrim`、`media`、`on-media`；外加 21 个亮暗颜色键）
   - `light.tokens.json` / `dark.tokens.json`（W3C DTCG 2025.10 互操作导出）
   - `DESIGN.md`（经 `@google/design.md/linter` 校验的视觉语言规格文档）
4. 注册进 `registry.json` 并运行 `bun run registry:build` 更新 CLI 分发清单。

### 1.2 应用侧定制

通过 `shadcn-nsh init --theme <id>` 初始化后，项目根目录会获得 `theme.json` 与 `DESIGN.md`，`lib/ui/` 下获得精简的主题源码（`schema.ts`、`materials.ts`、`effects.ts`、`paradigm.ts`、`base.ts`、`preset.ts`、`theme.ts`）。应用可直接微调 `theme.json` 的颜色、圆角（`radius`、`radius-md`、`radius-lg`、`radius-xl`）或 `font-sans`/`font-mono`，或借助 `base.ts` + `defineTheme()` 扩展视觉行为。

### 1.3 L1 `ThemeParadigm`

写一套新主题时先选六个语义轴，再只写下和这套轴不同的 L2 字段：

1. **L1** `ThemeParadigm`（`packages/theme/paradigm.ts`）：`depth`、`shape`、`stroke`、`motion`、`feedback`、`density`。`expandParadigm()` 把它展开成稀疏 L2 patch。
2. **L2** `defineTheme({ extends, paradigm, ... })`：合并顺序是被继承的主题、展开后的 paradigm、然后这次调用自己的 `tokens` / `metrics` / `elevation` / `surfaces` / `feedback` / `motion` / `controls`。显式 L2 字段胜出。解析后的 `ThemeSpec` 不保留 `paradigm`。
3. **L3** 表面材质与 WGSL：`material` 用 `"glass"` / `"acrylic"`（或 `MaterialSpec`），`effect` 用 `{ kind: "liquid-glass" | "acrylic-noise" | "specular-rim" | "paper-grain" }`。`<ThemedSurface role="…">` 画出该表面；`<ThemeTransition value={…} />` 没有子节点，放在要切换的画面旁边，按 `motion.presets.themeSwitch` 播放 `dissolve` 或 `radial-wipe`（`fade` / `none` 不走着色器）。

轴的取舍、调色板角色、不变量和一份可复制的 `defineTheme({ paradigm })` 写在 [`.agents/skills/theme-designer/SKILL.md`](../.agents/skills/theme-designer/SKILL.md)。Showcase 的 **Theme Specimen**（`apps/showcase/demos/specimen.tsx`）用同一套轴现场切换六套内置主题和 `Editorial Paper`。

## 2 硬性原则

1. **按层与语义命名，不以组件名建颜色键**：例如使用 `surface` / `accent` / `line`，不再存在 `sidebar-*`、`button-*`、`field` 等专属颜色键。
2. **禁止 `theme.id === "..."` 分支**：所有外观差异必须落入 `surfaces`、`feedback`、`motion` 或 `controls` 契约字段，通过数值/表达式退化实现。
3. **组件内不出现颜色字面量**：所有颜色一律从 `@shadcn-nsh/theme` 的 `colors`、`tints`、`chart`、`surface()` 或 Tailwind 语义 token（如 `bg-surface`、`bg-brand/15`）读取。
4. **对比度与分离度红线**：正文与图标对比度必须满足 WCAG 2.2 AA（≥ 4.5:1，除非有登记在 `meta.contrastWaivers` 的平台规范原文豁免）；选中/悬停填充在 `background`/`card`/`popover` 上的 OKLCH 亮度差须 ≥ `0.015`。

## 3 常用校验命令

```sh
bun run tokens:build --check   # 确认导出物（theme.json / *.tokens.json / DESIGN.md）与 TS 真源一致
bun run check:theme            # 确认全部主题键名与表面完备性
bun run theme:contrast         # 运行对比度与填充分离度检查
bun run theme:parity           # 确认 nsh-gallery 与上游配色一致性
bun run docs:semantics --check # 确认对比表文档最新
bun test ./scripts/theme ./scripts/tokens ./scripts/ui-rules
```
