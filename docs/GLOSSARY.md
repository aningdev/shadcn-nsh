# shadcn-nsh

把 NSH 官方示例共享的 UI 层整理成 shadcn 模式的、copy-into-app 的组件库。约定见 [`ARCHITECTURE.md`](ARCHITECTURE.md)，流程见 [`port.md`](port.md)。

## Language

**Upstream（上游）**:
`references/nsh/examples/nsh-gallery-ui`：NSH 的 gallery 与网站 demo 共用的 UI 层。本库的主题、外观、状态、几何和 variant 取值都以它为准。
_Avoid_: reference look, 参考实现（它是来源，不是参考）

**Look**:
上游的外观函数：把"哪种、多大、什么状态"算成一组可以展开到 `nsh/base` 控件上的 props（`style`、`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle`、`hitSlop`）。例：`buttonLook("primary", { size })`。相当于 shadcn 的 `cva`。
_Avoid_: variants helper, `xVariants`, theme layer

**Shell（外壳）**:
本仓手写的组件部分：读 props、展开 look、提供组合角色。外壳不含外观。
_Avoid_: wrapper, styled layer

**Component（组件）**:
一个文件：上游的 look（Port Region）加外壳。以 Copy-into-app 交付。
_Avoid_: Styled Component, npm component

**Port Region（移植区域）**:
组件或 lib 文件里 `// @port <上游文件>` 与 `// @port end` 之间的部分，只由 `bun run port:vendor` 写入。
_Avoid_: 手抄上游代码, 在区域内修改

**Port Map（清单）**:
`port-map.json`：上游每个文件、每个顶层声明的去向（目标文件、`pending`、带理由的 `exclude`），以及登记在案的偏离（`replace`）。唯一清单，组件表由它生成。
_Avoid_: 手写的状态表

**Baseline（基线）**:
`references/nsh` 固定的提交，等于 `port-map.json` 的 `upstream.commit`，也等于 `nsh --version` 显示的提交。
_Avoid_: 自动跟随上游

**Reference Page（参照页）**:
`demos/<id>.ref.tsx`：与 `demos/<id>.tsx` 同一个页面，但按上游的写法把 look 直接展开在 `nsh/base` 控件上。渲染比对要求两者截图相同。

**Demo Adapter（演示适配层）**:
官方示例写演示时用的那套零件（`Stage`、`Split`、`Inspector`、`Panel`、`Log`、`Segmented`、`Chips`，`desktop` / `wide` / `sideBySide`，以及调色板 `ui()`）：主体居中、状态与事件放检查器、窄窗口上下堆叠；`Chips` 是放不下一条 `Segmented` 轨道时的换行版。`apps/docs/demos/stage.tsx`，只供演示，不进组件库，也不进 registry。
_Avoid_: 组件库的布局 API, 在组件里用 Stage

**Photo Page（照片页）**:
演示里从网络取图的页面（`apps/docs/demos/photos.ts` 的 `photoUrl`、`avatarPortrait`）。它先 `Image.prefetch` 全部图片再让 `Image` 画，并在全部到位后画出 `images-ready` 标记；`port:render` 用 `network: "live"` 打开它、等这个标记，再截图。圆角裁切的边缘在两次运行间偶尔差 1/255：比较按"逐字节，或落在抗锯齿预算内"（`render-cases.ts` 的 `antialiasing`），圆形头像另有更宽的 `tolerance`。
_Avoid_: 截图前 sleep, 让图片页跳过比对

**Composition Facade**:
把 `nsh/base` 的单根复合控件拆成可组合零件树（`Trigger` / `Content` / `Item` 等角色）。零件家族名跟 `nsh/base`（`MenuTrigger`），不是 shadcn 的 `DropdownMenu*`。Root 只持有开关状态；行为仍在 base。
_Avoid_: Radix port, 新的 primitive 层, 根上的 `trigger` prop

**Copy-into-app**:
通过 registry + CLI 把组件源码拷进应用，应用可以直接改。改动点有三个：换颜色、圆角、阴影改 `theme.json` / `finishes.json`；改某个控件的外观改它的 look；改结构或 API 改外壳。
_Avoid_: 黑盒依赖

**Catalog（组件目录）**:
本库交付的组件集合：registry 里的每个 `registry:ui` 条目。目录里的每个组件都有演示、参照页和文档页。
_Avoid_: 组件清单、组件表（手写的列表）

**Registry Name**:
`add` 名、落盘路径和公开导出符号由 `nsh/base` 符号推导（`Menu` → `menu` / `MenuTrigger`）。上游有而 base 没有的零件（`Card`、`Badge`、`Spinner`）用上游的名字。不为旧 id 提供别名。
_Avoid_: shadcn registry id（`dropdown-menu`）

**Variant / Size**:
prop 名用 shadcn 的（`variant`、`size`），取值用上游的（`primary` / `secondary` / `accent` / `ghost` / `danger`；`small` / `regular` / `large`）。
_Avoid_: `kind`, `default` / `outline` / `destructive`, `sm` / `lg`

**Behavior Authority**:
控件行为、a11y 与可转发能力以 `nsh/base` 为准；外壳透传 base 的全部 props。
_Avoid_: 重写行为, 缩减 props

**Theme Source**:
`theme.json`（shadcn 的 `cssVars` 格式，含上游的扩展键）与 `finishes.json`（渐变与阴影），都原样取自上游；`theme.ts` 读取它们。
_Avoid_: neutral 映射, `custom-*` 键
