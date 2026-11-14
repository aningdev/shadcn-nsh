# 图标换成 lucide，按图标拆分

## 目标

`positioning.md` 阶段 1："`icons` 按图标拆分减轻安装重量"。现在 `packages/ui/lib/icons.tsx` 有 813 行，是约 90 个手绘字形（20 单位方框），被 18 个组件整份依赖。改成 [lucide](https://lucide.dev)：

- 每个图标一个数据文件，组件只 import 自己用到的那几个。
- `add tabs` 只装 tabs 用到的图标。

外观会变。用户在 2026-11-14 说了"start lucide"，等于同意改外观。

## 决定

| 项             | 决定                                                                                                                                                                                   | 理由                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| API 形态       | **数据**：`<Icon icon={ChevronDown} … />`，不再用 `name="chevron"`                                                                                                                     | 字符串联合背后必须有一张汇总所有图标的表，做不到按图标拆分；shadcn 也是按图标导入 |
| 图标数据       | `packages/ui/lib/icons/<lucide 名>.ts`，导出 `IconData = { name: string; paths: readonly string[] }`，每段是 SVG path data                                                             | NSH 的 `Path2D` 直接吃 SVG path data（`references/nsh/docs/dev/canvas.md`）       |
| 生成           | `scripts/icons.ts` 从 devDependency `lucide@1.66.0`（固定版本）的 `dist/esm/icons/*.mjs` 读 IconNode，生成数据文件；`--check` 模式接进 `bun run check`                                 | `packages/*` 运行时只认 `nsh`、`nsh/base`、theme 和相对路径，所以产物要提交进仓库 |
| 元素转换       | 生成时把 `circle` / `ellipse` / `rect`（含 `rx`/`ry`）/ `line` / `polyline` / `polygon` 一律转成 `d`                                                                                   | 渲染器只处理 path                                                                 |
| 名字           | 用 lucide 的**规范名**（文件名），别名经 `iconsAndAliases.mjs` 解析（如 `smile` 的规范名是 `face-slightly-smiling`，`trash-2` 的是 `trash`）                                           | 和上游 lucide 一一对应，以后好找                                                  |
| 渲染器         | `lib/icons.tsx` 改写：24 单位方框，`weight` 默认 2，圆角端点和连接，默认只描边；新增 `fill?: boolean`（同色填充，如 `play`）；每个 path 字符串的 `Path2D` 在模块级缓存                 | lucide 的规格                                                                     |
| `weight`       | 改成 24 单位方框里的值。显式传值的地方 ×1.2 换算：`checkbox` 的 `MARK_WEIGHT` 3.2 → 3.84，`popup` 的 `CheckMark` 2.25 → 2.7                                                            | 保持现有粗细                                                                      |
| 终端           | 保留：`Icon` 在终端里，若 `icon.name === "check"` 显示 `✓`；`IconLabel` 显示文字                                                                                                       | 现有行为                                                                          |
| RTL            | 翻转集合改成 `chevron-right` / `chevron-left` / `arrow-left` / `arrow-right`                                                                                                           | 原来是 `chevron` / `back`                                                         |
| `CheckMark`    | 保留 `Image` + `tintColor` 的机制，path 换成 lucide `check`，viewBox 为 24；`#000` 的 P3 豁免保留                                                                                      | 机制来自上游，原因未查明，不冒险                                                  |
| registry       | `icons` 条目只剩渲染器；每个在用的图标一个 `registry:lib` 条目 `icon-<lucide 名>`，文件目标为 `lib/icons/<名>.ts`，`registryDependencies: ["icons"]`；各组件按实际 import 写依赖（P6） | 按图标拆分                                                                        |
| `test:install` | `icon-*` 条目不逐条测，只测一个代表（`icon-check`），其余经依赖它们的组件间接覆盖                                                                                                      | 避免每多一个图标就多一轮                                                          |
| port-map       | 上游 `icons.tsx` 改为带理由的 `exclude`："由 lucide 取代（scripts/icons.ts，docs/specs/lucide.md）"；`lib/icons.tsx` 不再有 `// @port` 区域                                            | P1 / P2                                                                           |
| 许可           | `NOTICE` 加 lucide 段，许可原文从包里的 `LICENSE` 整段复制（ISC，另有 Feather 派生图标的 MIT 段）；生成文件头写来源与许可                                                              | ISC 要求保留声明                                                                  |

## 旧名 → lucide 名（在用的）

| 旧                                                                                                                                                                   | lucide          | 旧                       | lucide                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------ | ---------------------------------- |
| `chevron`                                                                                                                                                            | `chevron-right` | `back`                   | `chevron-left`                     |
| `chevron-down` / `chevron-up`                                                                                                                                        | 同名            | `close`                  | `x`                                |
| `external`                                                                                                                                                           | `external-link` | `undo`                   | `undo-2`                           |
| `trash`                                                                                                                                                              | `trash`         | `bulb`                   | `lightbulb`                        |
| `food`                                                                                                                                                               | `utensils`      | `person`                 | `user`                             |
| `ball`                                                                                                                                                               | `volleyball`    | `smile`                  | `face-slightly-smiling`            |
| `check`、`plus`、`minus`、`search`、`star`、`play`、`code`、`pipette`、`folder`、`folder-open`、`file`、`clock`、`calendar`、`car`、`flag`、`heart`、`leaf`、`share` | 同名            | 其他（类型检查报出来的） | 选意思最近的 lucide 图标，写进本表 |

`badge` 演示里的 `name: "migrate"` 是行数据，不是图标。

**全集以类型检查为准**：换掉类型后，`nsh check apps/docs/demos` 和 `nsh check apps/gallery` 报出的每个错误都是漏掉的地方。

## 不做

- 用户自己添加 lucide 全集里的其他图标（CLI 命令、在线拉取）。
- 改 `nsh` / `nsh/base` / `references`。

## 验收标准

1. `packages/ui/lib/icons.tsx` 只剩渲染器（`Icon`、`IconLabel`、`CheckMark`、`IconData` 类型），没有手绘字形，没有 `IconName`。
2. `bun run icons --check` 通过；改动一个数据文件后它会失败；它已接进 `bun run check`。
3. `public/r/tabs.json` 只带 tabs 实际 import 的图标；每个组件的 `registryDependencies` 等于实际 import（P6 测试通过）。
4. `port:check`、`catalog --check`、`nsh check apps/docs/demos`、`nsh check apps/gallery`、`vp check`、`test:unit`、`test:install` 全部通过。
5. `port:render` 全部通过：受影响组件的基线（指针 / 触屏 × 亮 / 暗，加 ref）重录过，`port:sheet` 截图人眼看过，图标清楚、不糊、不偏、粗细接近原来。
6. `CHANGELOG.md` 0.3.0 迁移表加一行（`name="chevron"` → `icon={ChevronRight}`，`IconName` → `IconData`）；`props.test-d.ts` 加一条旧写法的 `@ts-expect-error`。
7. `NOTICE` 有 lucide 段；`ARCHITECTURE.md` 的 Layout 写进 `lib/icons/` 与 `scripts/icons.ts`；`positioning.md` 现状评估里的 `icons.tsx` 那句更新。
