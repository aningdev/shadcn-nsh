# 主题的角色与层次（Theme v5）

> 本库使用 Theme v5 架构（决策见 [`../decisions/0020-theme-v5.md`](../decisions/0020-theme-v5.md)）：以 TypeScript 稀疏继承（1 套完整 `nsh-gallery` 基线 + 5 套稀疏覆写）为唯一真源，`theme.json`、`*.tokens.json` 与 `DESIGN.md` 均由 `bun run tokens:build` 单向导出，不再维护手写 DTCG 源码或 `semantics.json`。

每套主题编译后的具体解析值见生成页 [`semantics-values.md`](semantics-values.md)。

| 文件 / 模块                             | 职责                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `packages/theme/schema.ts`              | 类型契约、`SHARED_TYPE_SCALE`、`EASING_BEZIERS`、`defineTheme()`、`compileNshTheme()`                                     |
| `packages/theme/themes/<id>/index.ts`   | 单一主题定义（`tokens`、`metrics`、`elevation`、`surfaces`、`feedback`、`motion`、`controls`）                            |
| `packages/theme/themes/<id>/theme.json` | 导出的精简 `theme.json`（9 共享 + 21 亮暗键），供 NSH Tailwind / `setTheme` 消费                                          |
| `packages/theme/themes/<id>/DESIGN.md`  | 导出的平台视觉语言规格（随 CLI `init` 复制到应用根目录）                                                                  |
| `packages/theme/theme.ts`               | 零 Proxy 强类型运行时读取：`colors`、`tints`、`chart`、`shape`、`metrics`、`surface()`、`feedback`、`motion`、`control()` |

## 1 精简 `theme.json`（9 个共享键 + 21 个亮暗颜色键）

`theme.json` 的 `cssVars` 精简为三组（校验脚本：`bun run check:theme`）：

### `cssVars.theme`（appearance-invariant）

| 键          | 必需 | 说明                                                           |
| ----------- | ---- | -------------------------------------------------------------- |
| `font-sans` | 是   | 无衬线字体家族；未配置时编译为 `system-ui`。`font.sans` 读取它 |
| `font-mono` | 是   | 等宽字体家族；未配置时编译为 `monospace`。`font.mono` 读取它   |
| `radius`    | 是   | A 层槽，等同于 `radius-md`（`nsh-base` 按长度解析）            |
| `radius-md` | 是   | 控件圆角（层角色 `control`）                                   |
| `radius-lg` | 是   | 卡片与面板容器圆角（层角色 `container`）                       |
| `radius-xl` | 是   | 浮层与模态框圆角（层角色 `modal`）                             |
| `scrim`     | 是   | 模态背罩透明度颜色                                             |
| `media`     | 是   | 媒体内容默认深底，不随外观翻转                                 |
| `on-media`  | 是   | 媒体表面前景白字，不随外观翻转                                 |

### `cssVars.light` / `cssVars.dark`（21 个核心颜色角色）

| 分层                | 角色                                                   | 说明                                                            |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| **背景与表面（5）** | `background`、`card`、`popover`、`muted`、`surface`    | 页面底、卡片底、浮层底、弱化容器底、控件凸起面底（原 `raised`） |
| **前景墨色（3）**   | `foreground`、`muted-foreground`、`faint`              | 主正文及默认表面前景色、次要字、更弱占位符                      |
| **交互填充（4）**   | `primary`、`primary-foreground`、`secondary`、`accent` | 主操作填充及反字、次操作底、悬停/选中高亮底                     |
| **品牌指示（1）**   | `brand`                                                | 链接、插入符与活动标识色；源码省略时导出为 `var(--primary)`     |
| **边框与聚焦（4）** | `border`、`line`、`input`、`ring`                      | 常规容器线、井内细分隔线、表单控件边线、焦点环                  |
| **状态语义（4）**   | `info`、`success`、`warning`、`destructive`            | 提示、成功/上涨（原 `up`）、警告（原 `warn`）、危险/下跌        |

### 已内化 / 删除的旧角色

- **`sidebar-*`（8 键）**：移除；侧栏与分栏直接读 `background`、`accent`、`line`。
- **冗余 `*-foreground`（4 键）**：`card-foreground`、`popover-foreground`、`secondary-foreground`、`accent-foreground` 移除；均默认继承 `foreground`（若表面需要专用前景，声明在 `surfaces.<role>.foreground`）。
- **`*-tint`（5 键）**：从 `theme.json` 移除，运行时通过 `tints.{brand,info,success,warning,destructive}` 按 `tintAlpha` 反应式计算（Theme 可选配 `tokens.tints` 固态覆写）。
- **`chart-1..5`**：从 `theme.json` 移除，运行时 `chart` 序列默认取 `[brand, info, success, warning, destructive]`（可选覆写）。
- **单一控件/状态颜色**：`inset`、`raised`（已规范为 `surface`）、`field`、`track`、`knob`、`hover`、`brand-edge`、`focus-inner`、`inverse*`、`up`/`warn` 已并入对应 `surfaces` / `feedback` / `controls` 层或重命名为标准语义。

## 2 四层正交体系

### 2.1 `surfaces`（11 个纯结构表面）与 `elevation`

11 个结构表面统一使用同一个 `SurfaceSpec` 接口（无 `finish-fields` 白名单，无 Proxy），`background` / `foreground` / `gradient` / `border` / `borderTop` / `borderBottom` / `shadow` / `backdropFilter` / `material` / `elevation` 支持顶层共享与 `light`/`dark` 稀疏覆写：

`card`、`raised`、`inset`、`channel`、`plate`、`overlay`、`modal`、`inverse`、`glass`、`accent`、`fill`。

阴影刻度 `elevation.{light,dark}` 包含 `sm`、`md`、`lg`、`xl`、`inset`、`edgeSurface`、`edgeAccent`。

### 2.2 `feedback` 与 `motion`

- **`feedback`**：统一管理交互状态原语 —— `hover`（`overlay`、`fill`、`surface`）、`press`（`scale`、`translateY`、`overlay`、`surface`、`accent`）、`focus`（`style`、`width`、`offset`、`innerColor`）、`disabled`（`contentOpacity`、`replaceFace`、`surface`）、`passive`（`restOpacity`、`pressedOpacity`）。
- **`motion`**：`state`、`fast`、`default`、`slow` 时序（时长 + 9 种标准 Bezier 曲线），可选 `spring` 参数，以及 `popoverEnter` / `dialogEnter` 入场预设。

### 2.3 `controls`（13 个稀疏控件配方）

见 [`theme-slots.md`](theme-slots.md)。

## 3 自动守卫脚本

| 检查                             | 作用                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `bun run tokens:build --check`   | 校验 `theme.json`、`*.tokens.json`、`DESIGN.md` 与 TS 源码一致                       |
| `bun run check:theme`            | 校验 6 套主题全部满足 21 个 per-mode 键与 11 个表面定义                              |
| `bun run theme:contrast`         | 校验 WCAG 2.2 AA 文本对比度与填充亮度差（豁免须登记在 `theme.meta.contrastWaivers`） |
| `bun run theme:parity`           | 校验 `nsh-gallery` 保留角色与上游参考颜色零漂移                                      |
| `bun run docs:semantics --check` | 校验 [`semantics-values.md`](semantics-values.md) 与当前 TS 定义同步                 |
