# 图标换成 lucide：像前端一样引入图标库

## 目标

`positioning.md` 阶段 1 的要求是"`icons` 按图标拆分减轻安装重量"。

- **现在**：`packages/ui/lib/icons.tsx` 有 813 行，是约 90 个手绘字形，被 18 个组件整份依赖。
- **改成**：和前端用 lucide 一样，组件直接 `import { ChevronDown } from "lucide"`，图标库作为应用的 npm 依赖安装，打包时只留下用到的图标。

用户在 2026-11-14 决定"直接引用图标库，不写进一个 icons.tsx"，外观随之改成 lucide 的样子。

## 依据（2026-11-14 实测）

用 `nsh init` 新建一个 TS 应用，放进 `node_modules/lucide@1.66.0`，写 `import { ChevronDown, Search } from "lucide"`：

| 检查        | 结果                              |
| ----------- | --------------------------------- |
| `nsh check` | 通过                              |
| `nsh build` | 只打进用到的两个图标，产物 1.4 KB |
| `nsh test`  | 在无界面模式下正常运行            |

NSH 的打包器（rolldown）会解析 `node_modules`；`Path2D` 直接接受 SVG path data。

用 `lucide` 包，不用 `lucide-react`：`lucide` 的图标是纯数据（`IconNode = [tag, attrs][]`），不依赖 DOM 和 React。

## 决定

| 项          | 决定                                                                                                                                                                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 引入        | 组件和演示直接 `import { ChevronDown } from "lucide"`；图标名用 lucide 的导出名                                                                                                                                                                             |
| API         | `<Icon icon={ChevronDown} size tint weight? fill? />`，`icon` 的类型是 lucide 的 `IconNode`；公开 props 里的 `IconName` 一律改成 `IconNode`（tabs、tree、select、command、emoji-picker 的 `emojiGroups`、diff-view）                                        |
| 渲染器      | `lib/icons.tsx` 只剩渲染器，不含任何图标数据。按 lucide 的规格绘制：24 单位方框，`weight` 默认 2，圆角端点和连接，默认只描边，`fill` 时用同色填充（如 `Play`）                                                                                              |
| 元素转画布  | 运行时按元素画：`path` 用 `new Path2D(d)`（按 `d` 字符串缓存在模块级）；`circle` 用 `arc`；`ellipse` 用 `ellipse`；`rect`（含 `rx`/`ry`）用 `roundRect`；`line`、`polyline`、`polygon` 用 `moveTo`/`lineTo`                                                 |
| `weight`    | 改成 24 单位方框里的值，显式传值的地方 ×1.2 换算：`checkbox` 的 `MARK_WEIGHT` 3.2 → 3.84，`popup` 的 `CheckMark` 2.25 → 2.7                                                                                                                                 |
| 终端        | 保留：`icon === Check` 时显示 `✓`；`IconLabel` 显示文字                                                                                                                                                                                                     |
| RTL         | 翻转集合改成 `ChevronRight`、`ChevronLeft`、`ArrowLeft`、`ArrowRight`，按引用比较                                                                                                                                                                           |
| `CheckMark` | 保留 `Image` 加 `tintColor` 的机制；SVG 由 lucide 的 `Check` 节点拼出（不手抄 path），viewBox 为 24；`#000` 的 P3 豁免保留                                                                                                                                  |
| registry    | 每个 import `lucide` 的条目（含 `icons`）写 `"dependencies": ["lucide@^1.66.0"]`；P6 检查把裸的 npm import 对到 `dependencies`                                                                                                                              |
| CLI         | `init` 和 `add` 汇总所装条目的 `dependencies`：应用没有 `package.json` 就建一个最小的；按锁文件选包管理器（`bun.lock` → bun，`pnpm-lock.yaml` → pnpm，`yarn.lock` → yarn，否则 npm），运行 `<pm> add …`；`--dry-run` 时只打印；安装失败时报出要手动跑的命令 |
| 本仓        | `lucide@1.66.0`（固定版本）作为依赖装进 workspace，`packages/ui`、演示和 gallery 都能解析                                                                                                                                                                   |
| 架构规则    | `ARCHITECTURE.md`："运行时代码只认 `@shadcn-nsh/theme`、`nsh`、`nsh/base`、`lucide` 与相对路径"；npm 依赖经 registry 的 `dependencies` 安装                                                                                                                 |
| port-map    | 上游 `icons.tsx` 改成带理由的 `exclude`："由 lucide 取代（docs/specs/lucide.md）"                                                                                                                                                                           |
| 许可        | lucide 由用户自己的包管理器安装，本库不重新分发，`NOTICE` 不用加 lucide 段                                                                                                                                                                                  |

## 旧名 → lucide 导出名（在用的）

| 旧                                                                                                                                                                   | lucide                      | 旧                     | lucide                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------- | ---------------------- |
| `chevron`                                                                                                                                                            | `ChevronRight`              | `back`                 | `ChevronLeft`          |
| `chevron-down` / `chevron-up`                                                                                                                                        | `ChevronDown` / `ChevronUp` | `close`                | `X`                    |
| `external`                                                                                                                                                           | `ExternalLink`              | `undo`                 | `Undo2`                |
| `bulb`                                                                                                                                                               | `Lightbulb`                 | `food`                 | `Utensils`             |
| `person`                                                                                                                                                             | `User`                      | `ball`                 | `Volleyball`           |
| `smile`                                                                                                                                                              | `Smile`                     | `trash`                | `Trash`                |
| `document`                                                                                                                                                           | `FileText`                  | `chat`                 | `MessageSquare`        |
| `copy`                                                                                                                                                               | `Copy`                      | `download`             | `Download`             |
| `replace`                                                                                                                                                            | `Replace`                   | `terminal`             | `Terminal`             |
| `sidebar`                                                                                                                                                            | `PanelLeft`                 | `moon`                 | `Moon`                 |
| `sun`                                                                                                                                                                | `Sun`                       |                        |                        |
| `check`、`plus`、`minus`、`search`、`star`、`play`、`code`、`pipette`、`folder`、`folder-open`、`file`、`clock`、`calendar`、`car`、`flag`、`heart`、`leaf`、`share` | 对应的 PascalCase 导出      | 类型检查报出的其他名字 | 选意思最近的，补进本表 |

`badge` 演示里的 `name: "migrate"` 是行数据，不是图标。全集以 `nsh check apps/docs/demos` 和 `nsh check apps/gallery` 报出的错误为准。

## 不做

- 生成或提交任何图标数据文件。
- 每个图标一个 registry 条目。
- 改 `nsh`、`nsh/base`、`references`。

## 验收标准

1. `packages/ui/lib/icons.tsx` 只剩渲染器：`Icon`、`IconLabel`、`CheckMark`；没有字形，没有 `IconName`；仓库里没有图标数据文件。
2. `packages/ui` 和演示里的图标全部 `from "lucide"`；`nsh check apps/docs/demos`、`nsh check apps/gallery` 通过。
3. `public/r` 中 import `lucide` 的条目都带 `dependencies: ["lucide@^1.66.0"]`；P6 测试覆盖 npm import，故意漏写 `dependencies` 时会失败。
4. CLI 能装 npm 依赖：
   - 在一个没有 `package.json` 的新 NSH 应用里跑 `shadcn-nsh init` 再 `add tabs`，会装上 `lucide`，并且 `nsh check` 通过。
   - `test:install` 覆盖这一点。
   - CLI 单元测试覆盖包管理器的选择和 `--dry-run`。
5. `port:check`、`catalog --check`、`vp check`、`test:unit`、`test:install`、`port:render` 全部通过。受影响组件的基线（指针 / 触屏 × 亮 / 暗，加 ref）都重录过，`port:sheet` 截图人眼看过：图标清楚、居中、粗细接近原来。
6. 文档同步：
   - `CHANGELOG.md` 0.3.0 迁移表加一行（`name="chevron"` → `icon={ChevronRight}`，需要 `lucide`）。
   - `props.test-d.ts` 加一条旧写法的 `@ts-expect-error`。
   - `README.md` 写明安装会装 `lucide`。
   - `ARCHITECTURE.md` 的 Layers 规则更新，`positioning.md` 现状评估里的 `icons.tsx` 那句更新。
