# 组件编写

动手前先读 [`ARCHITECTURE.md`](ARCHITECTURE.md)（P1–P9、归属）和 [`port.md`](port.md)（流程、外壳、检查）。本文只写文件怎么排、三条已经拍板的原则，以及和 P3–P9 衔接的响应式写法。

## 文件从上到下

一个组件一个文件。读的人应在第一屏看到对外的部件，往下才是不给别人用的 look。

1. **用途**。顶部 1–2 行：这文件是什么、画出什么。起源于上游的，第二行是 Credit Line：`Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.` 本库自己的组件没有这一行。
2. **Imports**，按组、组内排序：
   - `@shadcn-nsh/theme`
   - 第三方图标（`lucide`）
   - `nsh` / `nsh/base`
   - `./lib/*`
   - 同级组件（`./button`）
3. **Public Types**。`Variant` / `Size` / `Props`。基于 `nsh/base` 的组件用 `Omit<BaseProps, …>` 接上事件与无障碍属性，再加自己的轴。每个导出的类型、prop、函数上方有 `/** … */`。
4. **Public Component(s)**。主组件和复合子部件的 JSX 放在第一屏。`split(props, […])` 分开自有 props 与 `{...rest}`。根节点透传 `class`、`classList`、`style`。自带 `class` 写成 `joinClass(own, props.class)`，调用方的 class 在后。
5. **Shared Primitives**。只有白名单里、跨文件复用的样式函数才留在共享段，或放进 `packages/ui/lib/`。组件文件不重新导出 `lib/` 的声明。
6. **Private Helpers & Looks**。不供外部使用的 `*Look` / `*Sizes` / 几何计算放下半区，并且不 `export`。需要复杂终端形态的，集中在文件底部的 `// Terminal` 私有区块。

## 三条原则

**默认私有 Look（1A）。** 除白名单里跨组件复用的样式函数外，`*Look`、`*Sizes` 和内部几何函数都不导出。没有公开 Look 导出的组件，在 `render-cases.ts` 里声明 `selfReference`：参照页无法在不导入组件本身的情况下把外观展开。组件仍导出公开的 `*Look` 值（`buttonLook`、`choiceTileLook` 这种 camelCase 值；`ButtonLook` 类型不算）时，参照页必须用这些 Look 展开在 `nsh/base` 上，不得用 `selfReference` 跳过 P4。

**文件体量与拆分。** 基础组件目标单文件 250–350 行。独立控制族（例如后续的 `split-button`）拆成自己的组件文件。跨至少两个组件复用的底层原语归入 `packages/ui/lib/`（`field-look`、`choice`）。`lib/` 不 import 任何 `packages/ui/<component>`（P9）。

**TUI 尺寸下沉主题。** 标准行高和控件内边距从 `@shadcn-nsh/theme` 读：`controlHeight`、`metrics.height`、`metrics.control`。终端里高度三档都是 `TERMINAL_ROW`（16），`metrics.control` 的 `padding` 与 `gap` 都是 `TERMINAL_COLUMN`（8）；其它 idiom 拿到的是当前 tier 的同一对象，数值不变。组件主干不写满屏 `terminal ? TERMINAL_ROW : …`。`TERMINAL_ROW`、`TERMINAL_COLUMN`、`TERMINAL_GAP`、`terminal` 仍由主题导出。例外：`controlSize`（`lib/surface.tsx`）在终端里 padding 仍是 `0`、gap 仍是一列、行高仍是一行，它不读终端下的 `metrics.control`。`control(name)` 是配方（`control("field")`），不是 `metrics.control`。

## 响应式与状态

和 P3–P9 同一套检查，这里只列写组件时要守的几条：

- **颜色、finish、主题在 JSX 和 getter 里读**，不在模块顶层或组件体里读一次存下。换主题、换外观后要跟着变（P3、P8）。
- **不写 `theme.id` 分支**，不与主题名比较（P8）。颜色字面量只在标了 `// color:` 的例外里出现。
- **`children` 只读一次**，读在画它的 JSX 里。
- **交互态优先用 `*Style`**：`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle`。用平台 class 表达状态时，该行写 `// state:`。
- **`style` 优先于 `class`**。布局和静态微调用 `class`；要盖过主题或跟着状态机走的，用 `style`。
- **不对称的左右用 `start` / `end`**（P7）。同一对象里左右同值的对称对可以留 `left` / `right`。
- **每个导出都有 `/** … */`**（P9）。`registryDependencies` 等于实际 import（P6）。

## 安全区

纯 `padding*` / `margin*` 留白写原生 `"env(safe-area-inset-*)"` 或 `"calc(env(safe-area-inset-*) + …)"`，Tailwind 写成 `pt-[env(safe-area-inset-top)]`（其余三边同理）。原生侧直接更新，不经 JS 重算。

只有要拿数值做算术或定位时才读 `safeArea()`：`maxHeight`、`top` / `end` 偏移、`safeArea().bottom + 16` 这一类。不要为了纯留白先读 `safeArea()` 再写回 padding。
