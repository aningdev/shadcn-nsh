# 移植方案：把 `nsh-gallery-ui` 做成 Copy-into-app 组件

状态：样板已完成（`button`、`switch`、`dialog`、`spinner`），三项检查已跑通。本文是交给后续代理执行的方案，取代了原来的 `roadmap.md`。执行前先读完第 1–5 节。

## 1. 目标

把 NSH 官方示例共享的 UI 层 `references/nsh/examples/nsh-gallery-ui`（下称**上游**）整理成 shadcn 模式的组件库：一个组件一个文件，经 registry 和 CLI 复制进应用，复制后归应用所有。

三方各管一件事，互不交叉：

| 权威                  | 管什么                                                             |
| --------------------- | ------------------------------------------------------------------ |
| 上游 `nsh-gallery-ui` | 主题、外观、状态、几何、variant 集合与命名                         |
| shadcn                | 分发方式、目录、一组件一文件、组合角色（Trigger / Content / Item） |
| `nsh/base`            | 行为与无障碍                                                       |

本项目是**打包**项目：上游已有的一律搬运，不重写、不换色、不改名。本项目只新增组件外壳、registry / CLI 和文档站。

## 2. 样板验证了什么

| 验证项                     | 结果                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 上游代码由脚本搬入，不手抄 | `bun run port:vendor` 按 `port-map.json` 填充；77 个声明已移植，344 个待办，8 个排除                                 |
| 搬入的代码与上游一致       | `bun run port:check` 通过；把按钮高度 28 改成 30 后它报错，恢复后通过                                                |
| 外壳不改变渲染             | `bun run port:render`：3 个组件 × 指针 / 触屏 × 亮 / 暗共 12 组截图，与"look 直接展开在 `nsh/base` 控件上"逐字节相同 |
| 能复制进应用               | 用现有 CLI 把 `button`、`switch`、`dialog` 加进一个空应用，类型检查通过，能运行。CLI 不需要改                        |
| 仓库原有检查               | `vp check` 0 错误，`test:unit` 16 项通过                                                                             |

过程中确认的三个事实，会影响后续工作：

1. **上游的 look 层很新。** `v0.4.0`（2026-11-04）标签下 `nsh-gallery-ui` 还没有 `look/` 目录，它是之后一周内加的。上游变动快，所以必须固定提交、由脚本搬运、由检查发现漂移。
2. **CLI 必须不早于上游基线。** 已决定用 nightly、以 `main` 为准开发，所以不再有针对 store 0.4.0 的兼容写法，`port-map.json` 里目前没有任何 `replace`。外壳使用 `focusVisibleStyle`。**规则：升级 CLI 后，把 `references/nsh` 移到 `nsh --version` 显示的提交，改 `port-map.json` 的 `commit`，再 `port:vendor`。** `port:check` 在 CLI 落后于基线时报错。发布的 nightly 若落后于 main，用 `install.sh --source`（见 `docs/toolchain.md`）。
3. **上游的外观按"行"设计，单独使用时有缺口。** 例如单独一个开关没有焦点环和禁用外观，上游是由它所在的行（`listRow`）提供的。处理方式见第 9 节的待定事项。

## 3. 目录

样板放在暂存目录 `next/`，与现有代码并存，互不影响。全部家族完成后一次切换（第 7 节 WP-切换）。

```
port-map.json            上游每个文件、每个声明的去向（唯一清单）
scripts/port/            vendor.ts（搬运）、check.ts（核对）、render.ts（渲染比对）
next/
  theme/                 theme.json、finishes.json（原样复制）、theme.ts（脚本填充）
  ui/<id>.tsx            组件：上游 look（脚本填充的区域）+ 外壳（手写）
  ui/lib/*.ts            没有所属控件的共享部分：press、overlay、switch-geometry、open-state
  demos/<id>.tsx         演示，也是文档站的示例源码
  demos/<id>.ref.tsx     参照页：同一页面，按上游写法把 look 展开在 nsh/base 控件上
  demos/render.test.tsx  渲染比对
  docs/<id>.md           文档页（样板：docs/button.md）
  registry.json          暂存的 registry
```

切换后 `next/theme` → `packages/theme`，`next/ui` → `packages/ui`，`next/demos` → `apps/docs/demos`，`next/registry.json` → `registry.json`，`port-map.json` 的 `root` 改掉即可。

## 4. 规范

每条规则都有脚本判定。没有脚本判定的规则不写进规范。

| #   | 规则                                                                                                                                   | 判定                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P1  | **清单唯一。** 上游的每个文件、每个顶层声明，在 `port-map.json` 里要么有去向，要么是 `pending`，要么是带理由的 `exclude`               | `port:check`                                         |
| P2  | **上游代码只由脚本写入。** 它位于 `// @port <上游文件>` 与 `// @port end` 之间。要改，就改上游基线或 `port-map.json`，不改区域内的文字 | `port:check`（重新生成并格式化后必须与现有文件相同） |
| P3  | **偏离上游必须登记。** 与上游文字不同的声明写进 `replace`，带 `why`                                                                    | `port:check`                                         |
| P4  | **外壳不改变渲染。** 每个组件有 `demos/<id>.tsx` 和 `demos/<id>.ref.tsx`，两者截图相同                                                 | `port:render`                                        |
| P5  | **外壳不缩减能力。** 组件 props 是 `nsh/base` 对应 props 加上自己的轴（`variant`、`size` 等）；样式类 props 叠在 look 之上，使用者优先 | 类型断言（待建，见第 6 节）                          |
| P6  | **依赖如实。** `registryDependencies` 等于实际 import                                                                                  | `registry:build`（已有）                             |
| P7  | **外壳里没有外观。** 区域之外不出现颜色字面量；几何字面量只允许来自上游 demo 的布局，并在注释里写明出处                                | 颜色守门测试（已有，改扫描范围）；几何靠评审         |

### 归属规则（决定一个声明去哪个文件）

1. 描述某个控件的 look，进该控件的组件文件：`buttonLook` → `ui/button.tsx`，`dialogCard` → `ui/dialog.tsx`。其他组件需要它时 import 该组件（与 shadcn 跨文件使用 `buttonVariants` 相同）。
2. 上游一个文件服务多个控件时，按声明拆到各自的组件（`port-map.json` 的 `symbols`）。文件内私有的常量（如 `pointer`）可以路由到多个目标。
3. 没有所属控件的，进 `ui/lib/<上游文件名>`：`backdrop` → `ui/lib/overlay.ts`，`look/press.ts` → `ui/lib/press.ts`。
4. 主题相关的（`theme.ts`、两个 JSON）进 `theme/`。

### 外壳写法（样板确立的约定，见 `next/ui/button.tsx`、`dialog.tsx`）

- 不解构 props。用 `split(props, [...])` 取走外壳自己处理的键，其余 `{...rest}` 透传。
- look 的选项传读取函数（`size: () => props.size`），这是上游 `Live<>` 的用法，外观随 props 变化。
- 样式类 props 写成数组：`style={[look.style, props.style ?? null]}`，使用者在后，逐键覆盖。
- `focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}`。
- 字符串 children 渲染成带 look 字体的 `Text`，其他 children 原样渲染。
- 轴的 prop 名用 shadcn 的（`variant`、`size`），取值用上游的（`primary` / `secondary` / …，`small` / `regular` / `large`）。上游自己的 `Button` 组件也叫 `variant`。默认值取上游组件的默认值（`Button` 默认 `primary`）。
- 复合控件：Root 只持有开关状态（`createOpenState`）和生命周期回调；Content 持有 `nsh/base` 根并透传它的全部 props；Trigger / Close 对字符串 child 渲染 `Button`。
- 文件头三行注释写明来源与许可；每个导出的类型、prop 和组件都有 doc comment。

## 5. 每个组件的流程

```sh
bun run port:new <id> --from <上游文件> …   # 1–3. 路由、目标文件、填充区域、演示与文档骨架（脚手架，WP-0）
#    脚手架建成之前手工做：改 port-map.json → 建带空区域的目标文件 → bun run port:vendor → 补 import
# 4. 填外壳的差异、两个演示页、文档页（所有 TODO(port)）
# 5. 核对 next/registry.json 的条目
bun run port:check             # 清单与一致性
nsh check next/demos/button.tsx   # 类型（demos 目录的所有文件都在它的 tsconfig 里）
bun run port:render            # 渲染比对；截图在 next/demos/shots/
vp check                       # 格式与 lint
```

完成标准：以上全部通过；亮 / 暗、指针 / 触屏四张截图人眼看过，没有裁切、错位、看不清的文字；`port-map.json` 里该控件相关的声明不再是 `pending`。一个家族一个 commit。

文档页的要求：照 shadcn 的篇幅，章节固定为 Installation、Usage、Examples、API。Usage 只放 import 和一行最简用法；Examples 一个轴一小节；API 只列外壳自己加的 props，其余一句话指向 `nsh/base`。不解释实现，不写"与上游的差异"以外的背景。

演示的要求：覆盖该组件的每个 `variant`、`size` 和状态（选中、禁用、忙碌等），至少一个真实场景；参考上游 `references/nsh/website/demos/el-<id>.tsx` 的场景，但不搬它的 Inspector / Stage / Log。颜色在 JSX 里读（`colors.text` 写在组件体里只读一次，不跟随外观，样板里踩过这个坑）。

## 6. 自动检查：现状与待办

| 检查                            | 状态       | 说明                                                                                                                                               |
| ------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port:check`                    | 已建       | 第 4 节 P1–P3                                                                                                                                      |
| `port:render`                   | 已建       | P4。需要本机有 Chrome / Edge / Chromium；无需屏幕录制权限                                                                                          |
| `registry:build` 的依赖校验     | 已有       | P6                                                                                                                                                 |
| 颜色守门（`ui-guards.test.ts`） | 需改       | 扫描范围改为组件文件里区域**之外**的部分；`theme.ts` 整体放行（上游的焦点环含颜色字面量）                                                          |
| props 超集断言                  | 待建       | 每个组件一行类型断言，例如 `Omit<BaseButtonProps, "children"> extends Omit<ButtonProps, ...>`；放在 `next/ui/types.test-d.ts`，由 `nsh check` 覆盖 |
| 总览页（contact sheet）         | 待建       | `port:render` 已产出全部截图；加一个脚本把 `shots/*.png` 拼成一页 HTML，供人一次看完。每个家族合并前看一遍                                         |
| 截图基线                        | 待建       | 把 `shots/` 的一份副本提交进 `next/demos/baseline/`，`port:render` 增加"与基线相同"的比对，改动即可见                                              |
| 演示覆盖                        | 待建       | 脚本核对：每个组件的每个 `variant` / `size` 取值都在它的 demo 里出现过                                                                             |
| `check:recipes`                 | 切换时删除 | 它检查的 R1–R8 属于旧规范；其中"每个导出有 doc comment""文档页章节齐全""demo 存在"三项并入新的检查                                                 |
| `bun run check`                 | 切换时改   | 加入 `port:check`；`port:render` 较慢（每组约 1.5 秒），放进 CI 而不是每次本地检查                                                                 |

`port:check` 的两个已知限制：它比较的是格式化后的文本，所以只要 `vp fmt` 的行为不变就稳定；它不检查区域**之外**是否偷放了外观，这由 P7 负责。

## 7. 工作包

按顺序执行。每个工作包结束时第 5 节的检查全部通过。

### WP-0 地基（先做，其余都依赖它）

1. **规范落地（已完成）。** `AGENTS.md`、`GLOSSARY.md`、`docs/toolchain.md` 已按新规范重写；`roadmap.md`、`verification.md` 已删除；`packages/ui` 与 `packages/theme` 的 README 顶部加了"旧实现"提示。其余文档在切换时处理（第 8 节）。
2. **脚手架（已完成）。** `bun run port:new`（`scripts/port/new.ts` + `templates/`）。之后的新组件一律由它起步。
3. **搬运共享部分。** `look/surface.tsx`（密度、行、卡片表面）→ `ui/lib/surface.tsx`；`popup.tsx` → `ui/lib/popup.tsx`；`icons.tsx` → `ui/lib/icons.tsx`；`look/press.ts` 已完成。
4. **演示套件。** 用 `sectionSurface`、`listRow` 等替换样板 demo 里手写的卡片和行，抽成 `next/demos/kit.tsx`（不进 registry）。
5. **待建的检查。** 第 6 节的总览页、截图基线、props 断言、演示覆盖、颜色守门的范围调整。
6. **CLI。** `theme-merge.ts` 目前只合并 `custom-*` 键，新主题没有这个前缀：改成"缺的键就补"，并更新它的测试和 `theme-contract.test.ts`。`init` 的默认行为不变。
7. **对齐 CLI 与上游基线（已完成，`30f87b7c`）。** 按 `docs/toolchain.md` 的升级步骤；外壳用 `focusVisibleStyle`；`port:check` 在 CLI 落后时报错。

#### 脚手架

目的：外观由脚本搬运，已经无法写偏；外壳、演示和文档页是手写的，脚手架让它们从同一个骨架起步，代理只填差异。

```sh
bun run port:new <id> --from <上游文件> [--symbols a,b,c] [--base <nsh/base 符号>] [--family]
# 例：bun run port:new toggle --from look/tool.ts --symbols toggleLook,toggleLabel,toggleGlyph,toggleSizes --base Toggle
# 例：bun run port:new popover --from look/overlay.ts --symbols popoverLook,PopoverLookOptions --base Popover --family
```

它做的事，按顺序：

| 步骤 | 产物                                    | 内容                                                                                                                                                                                                                                                                                                                     |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `port-map.json`                         | 把 `--symbols`（省略则整个文件）路由到 `ui/<id>.tsx`；已有路由时报错，不覆盖                                                                                                                                                                                                                                             |
| 2    | `next/ui/<id>.tsx`                      | 三行文件头、空的 `// @port` 区域、外壳骨架。单部件（默认）：`<Id>Props = Omit<Base<Id>Props, "children"> & { variant?; size?; children? }`，`split`、look 选项用读取函数、样式数组、`focusVisibleStyle` 接线、字符串 children。`--family`：Root（`createOpenState` + context）、Trigger、Content、Close 以及 `use<Id>()` |
| 3    | `bun run port:vendor`                   | 填充区域；把区域里用到而未 import 的名字列出来，提示从 `@shadcn-nsh/theme`、`nsh` 或 `./lib/*` 补上                                                                                                                                                                                                                      |
| 4    | `next/demos/<id>.tsx`、`<id>.ref.tsx`   | 同一个页面骨架的两份：标题、一张卡片、`Variant` / `Size` / `States` 三个小节的占位；参照页用 `nsh/base` 控件加 look 展开                                                                                                                                                                                                 |
| 5    | `next/demos/render.test.tsx`、`App.tsx` | 各加一行                                                                                                                                                                                                                                                                                                                 |
| 6    | `next/docs/<id>.md`                     | Installation、Usage、Examples、API 四节的骨架，按 `next/docs/button.md`                                                                                                                                                                                                                                                  |
| 7    | `next/registry.json`                    | 加条目；`registryDependencies` 由实际 import 推出                                                                                                                                                                                                                                                                        |

骨架里需要人填的地方用 `TODO(port)` 标出；`port:check` 在 `next/` 下发现 `TODO(port)` 时报错，所以填完才能过检查。模板取自三个样板：单部件看 `next/ui/button.tsx` 与 `switch.tsx`，复合看 `next/ui/dialog.tsx`。实现放在 `scripts/port/new.ts`，模板放在 `scripts/port/templates/`。

验收：用它重新生成 `button` 的骨架，与现有 `next/ui/button.tsx` 的外壳部分只差填空处；再用它做 WP-1 的第一个新组件，全程不需要参考旧的 `packages/ui`。

### WP-1 … WP-10 按家族移植

顺序按依赖。"目标"是建议，最终以 `port-map.json` 为准；一个上游文件对应多个组件时按归属规则拆。

| 序  | 上游文件                                                                  | 目标组件                                                                             |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | `look/button.ts`（余下的外壳）、`index.tsx` 的 `Button` 相关              | `button` 补 `IconButton`、`RoundButton`、`SplitButton` 外壳                          |
| 2   | `look/choice.tsx`、`look/tool.ts`、`look/switch.ts`（已完成）             | `checkbox`、`radio-group`、`toggle`、`toggle-group`、`toolbar`                       |
| 3   | `look/field.tsx`                                                          | `input`、`number-input`、`otp-input`、`time-field`                                   |
| 4   | `look/overlay.ts`（余下的）、`popup.tsx`                                  | `tooltip`、`popover`、`hover-card`、`sheet`、`toast`、`alert-dialog`                 |
| 5   | `look/menu.tsx`                                                           | `menu`、`context-menu`                                                               |
| 6   | `look/listbox.tsx`                                                        | `select`、`combobox`、`calendar`、`date-picker`                                      |
| 7   | `look/tabs.tsx`、`segmented.tsx`、`look/disclosure.tsx`、`look/nav.tsx`   | `tabs`、`segmented`、`accordion`、`collapsible`、`carousel`、`link`、`pagination`    |
| 8   | `look/meter.ts`、`slider.ts`、`avatar.ts`                                 | `progress`、`slider`、`avatar`                                                       |
| 9   | `data-table.ts`、`tree.tsx`、`command.tsx`、`scrollbar-theme.ts`          | `data-table`、`table`、`tree`、`command`、`scrollbar`                                |
| 10  | `look/workspace.tsx`、`look/color.tsx`、`color-format.ts`、`look/plot.ts` | `resizable`、`dock-area`、`diff-view`、`text-view`、`editor`、`color-picker`、`plot` |
| 11  | `index.tsx` 余下的零件                                                    | `card`、`badge`、`section`、`meter`、`status` 等；每个零件单独判断是组件还是演示套件 |

现有 `packages/ui/<id>.tsx` 里的组合外壳（Root / Trigger / Content 的接线、`createOpenState`、`createSlot`、items 注册）可以直接复用；其中的 `look()`、`xVariants()`、对 `@shadcn-nsh/theme` 旧接口的调用全部丢弃。上游没有对应 look 的组件（现有的 `nav-stack`）在第 11 步单独决定去留。

### WP-切换

1. `git mv` 把 `next/theme`、`next/ui`、`next/demos` 移到 `packages/theme`、`packages/ui`、`apps/docs/demos`，覆盖旧文件；`next/registry.json` 覆盖 `registry.json`；`port-map.json` 的 `root` 改为对应路径（三个目录不同根时，把 `root` 设为仓库根，目标路径写全）。
2. 删除：旧的 `packages/ui/lib/{density,follow,field,listbox,meter,dates,part-style}`、`scripts/recipes-allowlist.json`（如仍在）、`check:recipes`。
3. `apps/gallery`：`App.tsx` 与各家族页改用新组件；行为测试里按旧 variant 名和旧尺寸写的断言逐个改。
4. `apps/docs`：组件页的 variant 表、示例代码改成新 API；`src/lib/components.ts` 的清单由 `port-map.json` 和 `registry.json` 生成；`DemoFrame` 默认 Desktop。
5. `bun run registry:build`，提交 `public/r`。
6. 全量检查：`bun run check`、`test:unit`、`test:gallery`、`port:check`、`port:render`。

## 8. 文档改动清单

原则：一处讲一件事；能由 `port-map.json` 或 `registry.json` 生成的表不手写。标"已完成"的已经改好；其余描述的是仍在使用的旧代码，等切换时与代码一起改。

| 文件                                       | 处理                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                | **已完成。** **重写定位段、分层表、"不做"清单**。删去"配色用 shadcn neutral""不搬品牌色""不新增无 base 的 Extensions"；加入第 1 节的三方分工和第 5 节的流程入口。References、工具链、常用命令保留，常用命令加 `port:*`                                                                                                                                   |
| `docs/roadmap.md`                          | **已完成。** 删除，由本文取代。本文在全部完成后改名为 `docs/port.md`，只保留第 1、3、4、5、6 节                                                                                                                                                                                                                                                          |
| `packages/ui/README.zh.md`、`README.md`    | **顶部已加"旧实现"提示；切换时：** **重写。** 删除：三份重复的 Phase-1 表、三份"不在 Phase-1"表、三份迁移状态表、Extensions 一节、R1–R8 配方、Leaf / Family 配方、文件内顺序、改造方法、完成标准、视觉核对、迁移状态。保留并更新：分层、工具链（nightly CLI）、复合命名表、"组件内的动效"里关于 nsh 动效原语的说明。组件清单改为指向文档站（由清单生成） |
| `packages/theme/README.zh.md`、`README.md` | **顶部已加"旧实现"提示；切换时：** **重写。** 主题真源改为上游的 `theme.json` + `finishes.json`；删除 neutral 映射、`custom-*` 约定、`finish` 角色的旧定义、决策记录里与之相关的条目。说明换主题的方式：替换这两个 JSON                                                                                                                                  |
| `GLOSSARY.md`                              | **已完成。** 更新词条：加 **Look**、**Shell（外壳）**、**Port region**、**Port map**；改 **Styled Component** 的定义；删与 neutral、Extensions 相关的词条                                                                                                                                                                                                |
| `README.md`、`README.zh.md`（根）          | **指向已删文档的链接已改；切换时：** Layout 一节更新目录；一句话定位改为第 1 节的表述                                                                                                                                                                                                                                                                    |
| `docs/verification.md`                     | **已完成。** 删除。它记录的是旧外观的触屏核对，结论已失效；触屏核对并入 `port:render` 的四组截图                                                                                                                                                                                                                                                         |
| `docs/toolchain.md`                        | **已完成。** 改为"用 nightly、以 `main` 为准"；写明 CLI 与上游基线必须对齐的规则和升级步骤（见第 2 节第 2 条）；`scripts/nsh-bootstrap.sh` 里"必须是 store CLI"的检查同步改掉                                                                                                                                                                            |
| `apps/gallery/GAPS.md`                     | 删除，内容已过期（仍写着没有 ColorPicker / DatePicker）；待办以 `bun run port:check --status` 为准                                                                                                                                                                                                                                                       |
| `apps/gallery/AGENTS.md`、`README*`        | 更新"两面分工"：gallery 做原生验真与行为测试，docs 是公开门面，两者用同一套组件                                                                                                                                                                                                                                                                          |
| `apps/docs/AGENTS.md`                      | 更新页面契约：Differences 一节改为"与上游写法的差异"（外壳做了什么）；variant 与 size 的命名跟上游；Demos 一节加入 `<id>.ref.tsx` 与渲染比对；删去"illustrative"的说法，demo 就是验收对象                                                                                                                                                                |
| `NOTICE`                                   | 更新基线提交为 `port-map.json` 里的值；说明移植内容位于 `// @port` 区域内                                                                                                                                                                                                                                                                                |
| `apps/docs/src/styles/gallery-ui.css`      | 核对它与新主题是否同源；可由上游 `css.js` 的同一份数据生成（单独评估，不阻塞）                                                                                                                                                                                                                                                                           |

## 9. 待你决定

以下几项我在样板里先按"推荐"做了，改起来都不大：

| 事项                                         | 样板的做法（推荐）                                                                | 另一种选择                                                                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 终端分支（**已定**）                         | 原样保留：nightly 有终端形态，`theme.ts` 的 `terminal` 就是上游的判断，搬运零改动 | —                                                                                                                                   |
| 上游缺口（单独的开关没有焦点环和禁用外观等） | 样板没有补，保持与上游一致                                                        | 允许外壳用主题已有的 `focusRing()` 和 0.5 透明度补上，并在 `port-map.json` 里登记为 `additions`。我倾向这个：无焦点指示是无障碍缺陷 |
| CLI 版本（**已定**）                         | 用 nightly，以 `main` 为准；上游基线跟 `nsh --version` 的提交走                   | —                                                                                                                                   |
| `Button` 默认 `variant`                      | `primary`（上游 `Button` 组件的默认值，也符合 shadcn 的习惯）                     | `secondary`（`buttonLook` 函数的默认值）                                                                                            |
| neutral 主题                                 | 不做，默认主题就是上游的                                                          | 全部完成后作为第二套 `theme.json` + `finishes.json` 提供                                                                            |

## 10. 风险

| 风险                                               | 应对                                                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 上游改了 look 的接口或拆了文件                     | 升级基线时 `port:check` 会逐条列出"清单里有、上游没有"和"上游有、清单里没有"；按报错调整路由，再 `port:vendor`               |
| CLI 落后于上游基线时，搬入的代码类型通过但表现不同 | 保持 CLI 与基线对齐（第 2 节第 2 条）；`port:render` 只能证明外壳没有改变渲染，每个家族仍对照 nsh.dev 的在线 demo 人眼看一遍 |
| 截图在不同机器上不逐字节相同                       | 比对的是同一次运行里的两张图，不跨机器；基线比对（待建）若不稳定，改为像素容差                                               |
| 上游一个文件被许多组件依赖，单个组件带进的文件多   | 按声明拆分（归属规则 2）已经缓解；`icons.tsx` 较大，必要时按使用的图标拆                                                     |
| 许可                                               | 移植内容保持 Apache-2.0（Longbridge），文件头与 `NOTICE` 注明                                                                |
