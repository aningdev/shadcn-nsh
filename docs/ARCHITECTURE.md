# shadcn-nsh Architecture

一个文件一个**组件**，经 registry 与 CLI 以 **Copy-into-app** 交付。组件归本库所有：外观以**上游**（`references/nsh/examples/nsh-gallery-ui`）与官方推荐为参考规范自行抽取，行为来自 `nsh/base`，分发、组合角色与 API 命名参照 shadcn。词汇见 [`GLOSSARY.md`](GLOSSARY.md)。

## Stack

**运行时与组件**：NSH（`nsh`、`nsh/base`），CLI 安装、从不编译；版本等于 **Baseline**（见 [`toolchain.md`](toolchain.md)）
_Avoid_: 编译 NSH、设 `NSH_RUNTIME`、自定 primitive 层

**脚本与依赖**：Bun；格式化、lint、工具面类型用 Vite+（`vp`），配置只在根 `vite.config.ts`
_Avoid_: Prettier、npm / pnpm 脚本

**上游解析**：`oxc-parser`
_Avoid_: TypeScript 编译器 API、正则切声明

**文档站**：TanStack Start + Fumadocs（`apps/website`，React + Tailwind），静态预渲染；演示由 `nsh package --target web` 打包后嵌进 iframe

**分发**：shadcn registry 格式（`registry.json` → `public/r`）+ 本仓 CLI `shadcn-nsh`
_Avoid_: 发布组件 npm 包、旧 registry id 的别名

**许可**：源自上游的内容保持 Apache-2.0，文件头与 `NOTICE` 注明来源

## Layout

- `registry.json`：**Catalog** 的真源，其 `registry:ui` 条目就是组件集合
- `port-map.json`：**Port Map**，上游每个声明的来源去向表与已审阅的上游提交；目标不一定是组件——`demo.ts` 的 `Stage` / `Split` / `Inspector` / `Panel` / `Log` / `Segmented` 等去向 `apps/website/demos/stage.tsx`（演示适配层，不进 registry）
- `packages/theme/`：全部 6 套主题（`default`、`shadcn`、`solid-glass`、`apple`、`material`、`winui`）的 **Theme Source** 是 `tokens/`（DTCG 2025.10，`tokens/base/` 与 `tokens/themes/<id>/`），经 `bun run tokens:build` 编译为运行时 `theme.json`、`semantics.json` 与 `themes/<id>/{theme,semantics}.json`（oklch，归本库；标准见 [`specs/design-semantics.md`](specs/design-semantics.md)）；`theme.ts` 读取它们与运行时的 `selectTheme` / `currentTheme`；`themes/<name>/` 一套一个 `AppTheme`（`theme.json`、`semantics.json`、`index.ts`），经 `theme-<name>` 条目分发；不放组件
- `packages/ui/<id>.tsx`：一个**组件** = look（源自上游的部分以 **Port Region** 标注来源）+ **Shell**；一个 registry 条目一个文件
- `packages/ui/lib/`：没有所属控件的上游部分（以上游文件名命名）与多个外壳共用的接线；作为 `registry:lib` 条目分发
- `apps/website/demos/`：每个组件的 `<id>.tsx` 与 **Reference Page** `<id>.ref.tsx`、渲染比对用例与基线截图；`kit.tsx` 是演示外框，`stage.tsx` 是演示适配层（`Stage` / `Inspector` / `Split` / `Panel` / `Log` / `Segmented` / `Chips` / `desktop` / `wide` / `ui()`，见 [`port.md`](port.md#演示)），`photos.ts` 是照片页用的图（上游 `photos.ts`，原样搬运），都不进 registry；`shots/` 是渲染比对的截图，`shots-audit/` 是诊断脚本的，两者都不提交
- `apps/website/public/demos/`：`docs:demos` 的打包产物（页面、运行时、wasm），不进仓库；`apps/website/scripts/build-demos.ts` 打包每个演示，`player-options.ts` 让页面认面板的 `?idiom=` / `?theme=`
- `apps/showcase/`：展示应用（#78）——NSH 官方 Gallery 的壳（桌面侧栏、手机索引推入 nav stack、搜索）与其场景演示，全部用 `packages/ui` 重建，分批实现（`groups/<group>.ts` 一个目的一个文件，未建的入口指向共享占位屏）；调色板与外观在应用内经 `theme.ts` 实时切换并持久化，`nsh test apps/showcase` 测壳的行为；由 `build-demos.ts` 打包到 `apps/website/public/showcase/`，站点首页的 “See it running” 以 `ShowcaseFrame` 嵌入，不进文档菜单
- `apps/website/content/docs/`：文档页（MDX / Markdown，`createFileRoute("/docs/$")` 渲染）；组件页 `<id>.md` 按固定次序分节：Installation、Usage、可选 Composition、Examples、可选 Differences from shadcn/ui、API（规则见 [`port.md`](port.md#文档页)）。`components.mdx`（组件索引）与 `components/coverage.mdx`（对照页）由 `apps/website/src/components/fd/` 里的 React 组件画，行来自生成表。`themes.mdx` 是总览；每个主题一页 `themes/<id>.mdx`，标题写在 markdown 里（目录来自标题），token 与 finish 仍由组件按 `demos/palettes.ts` 画。`apps/website/src/lib/official.ts` 是文档站唯一的登记表（shadcn/ui 与 NSH 元素各一张：来源、去向、没做的理由）；分类从它推导——页被 NSH 元素表（`references/nsh/website/elements`）某行的 `ours` 列出就是**对齐官方**，否则是**自研**（shadcn/ui 有没有对应都不影响）——`apps/website/src/lib/kinds.ts` 只留两个类名、顺序与这条推导。侧边栏分组、索引分节、每页页头的官方链接（`Official: shadcn/ui · … | NSH · …`）与对照页都从它们生成，页面自己不写。新增组件只在该表登记（若对得上某个官方组件），分类自动得出；`bun run check:pages` 会拦下没登记或没建的页
- `apps/gallery/`：原生行为测试与冒烟页，用同一套 `packages/ui`；不做公开文档，不比截图
- `packages/cli/`：`shadcn-nsh` CLI（`init`、`add`、`list`、`view`、`diff`、`build`、`serve`）
- `scripts/catalog.ts`：**Catalog** 模块，脚本读写 `registry.json` 与取组件集合的唯一入口（`addComponent` 写入新条目）；生成 `apps/website/demos/catalog.generated.ts` 供 NSH 运行时使用（不手改）；`demos/` 下不是组件演示的文件（`App.tsx`、`kit.tsx`、`stage.tsx`）在 `NON_COMPONENT_DEMOS` 登记，新增这样的文件要加进去，否则 `catalog --check` 把它当成没有组件的演示
- `scripts/registry-build.ts`：`registry:build` 与 `test:install` 共用的构建（CLI `build` 加格式化）
- `scripts/install-test.ts`：`test:install`，从应用一侧验证 Copy-into-app
- `scripts/failure.ts`：脚本报错的约定，`StepFailure` 带失败的步骤名与 `cause`
- `scripts/port/`：抽取与上游变化提醒工具（读 `references/nsh`，见下）
- `scripts/audit/`：诊断演示的工具（批量打包 / 截图 / 量画布 / 拼对照页），不属于检查流水线；也读 `references/nsh`（官方示例原地打包），截图落在 `apps/website/demos/shots-audit/`（gitignored，`port:render` 不清它），包落在仓库外，见 [`specs/demo-audit.md`](specs/demo-audit.md)
- `references/`：只读子模块

## Layers

```mermaid
flowchart TD
  upstream["上游 nsh-gallery-ui（参考规范）<br/>(references/nsh, 固定在 Baseline)"]
  port["scripts/port"]
  theme["packages/theme"]
  lib["packages/ui/lib"]
  ui["packages/ui/&lt;id&gt;"]
  base["nsh/base"]
  nsh["nsh"]
  demos["apps/website/demos"]
  gallery["apps/gallery"]
  site["apps/website 站点"]
  registry["registry.json → public/r"]
  cli["packages/cli"]

  upstream -. port:check 提醒变化 .-> port
  port -. 新组件时抽取初稿 .-> lib & ui
  ui --> lib --> theme
  ui --> theme
  ui & lib --> base --> nsh
  theme --> nsh
  demos & gallery --> ui
  site -. 嵌入打包产物 .-> demos
  ui & lib & theme -. registry:build .-> registry
  cli -. 读取 .-> registry
  tools["scripts/catalog、install-test"] -- 当库 import --> cli
  tools -. 读写 registry.json .-> registry
```

- `packages/ui/lib` 不 import `packages/ui/<id>`；组件之间可以 import（`./button`），依赖写进该条目的 `registryDependencies`
- `packages/theme` 不 import `packages/ui`；反过来，组件只经 `@shadcn-nsh/theme` 的 token 与 finish 取外观（`colors`、`finish`、`shape`、`stroke`），不直接读两个 JSON，也不读 `themes/<name>/`
- `packages/*` 不 import `apps/*`、`scripts/*` 或 `references/*`；运行时代码只认 `@shadcn-nsh/theme`、`nsh`、`nsh/base`、`lucide`（图标库，应用经 registry 的 `dependencies` 安装）与相对路径
- 只有 `scripts/port`（抽取与变化提醒）与 `scripts/audit`（对照诊断截图）读 `references/nsh`；`apps/website` 的构建不需要子模块
- 组件集合只从 `scripts/catalog.ts`（脚本）或 `catalog.generated.ts`（NSH 运行时）取；不自己读 `registry.json` 过滤，也不 `readdir` 演示或文档目录来推导
- `scripts/*` 可以把 `packages/cli/src/*` 当库 import（构建、serve、registry 形状校验）：它是工具，不是应用代码；CLI 本身仍只经 Registry 拿组件
- registry JSON 的形状只在 `packages/cli/src/utils/registry-schema.ts` 校验；读到的 JSON 经它变成类型，不用 `as` 断言
- `scripts/*` 可以 import `apps/website/demos/render-cases.ts`（渲染用例与特例）、`apps/website/demos/palettes.ts`（可切换的主题清单：站点与主题渲染检查读同一份）与 `apps/website/scripts/player-options.ts`（演示包的 `?idiom=` / `?theme=`：文档站与审计用同一份），不 import `apps/website` 的其他代码
- 每个组件的特例（渲染前的 steps、`selfReference`）只写在 `render-cases.ts`，按 id 覆盖；`packages/ui/index.ts` 手写，由检查保证它导出每个组件

## Themes

两件事，名字不混用：

| 词             | 是什么                                                                                   | 谁定                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **构建时主题** | `nsh.json` 的 `theme` 指向的 `theme.json`，以及 `lib/ui/semantics.json`                  | `init --theme <name>`（`nsh-ui.json` 的 `theme` 也记这一个）；换就是重跑 `init --theme <name> --overwrite` |
| **AppTheme**   | 应用装进 `themes/<name>/` 的一套 `{ id, label, theme, semantics }`，一个 `index.ts` 导出 | registry 的 `theme-<name>` 条目，`add theme-<name>` 多装一套                                               |

- 颜色、8 个圆角、字体经 `token()` 读，`setTheme` 与宿主 `setThemeOverrides` 一换就跟；语义层（`semantics.json`：风格数据、`state["press-scale"]` 与 `finishes` 的 `shared` + 稀疏 `light`/`dark`）通过 `{token}` 引用基础层，由 `theme.ts` 响应式解析。两者拼成 `selectTheme(theme)`；`selectTheme(null)` 回到构建时主题。平面主题（shadcn）把 `state["press-scale"]` 写成 `1`：按下不缩放。标准与分层规则见 [`specs/design-semantics.md`](specs/design-semantics.md)。
- 圆角一律经 `shape.*`（`semantics.json` 的 `dimension.shape` 以 `{radius-…}` 引用 `theme.json` 的 8 个圆角 token，按用途角色：`control`、`field`、`chip`、`card`、`overlay`、`dialog`、`sheet`、`inset`）：组件是什么就读哪个角色，没有写死的数值；读主题圆角的角一律用 `rounded(radius, inset?)`，continuous 曲线只在那里给；嵌在另一个面里的面用 `inset` 参数取同心圆角。线宽读 `stroke`（`hairline`、`control`、`indicator`），按下与禁用的透明度读 `dimmed`，按钮高、图标、触控目标读 `controlHeight`、`iconSize`、`hitTarget()`。
- `theme` 条目仍是构建时那套的三个文件（`theme.json`、`lib/ui/semantics.json`、`lib/ui/theme.ts`）；`theme-<name>` 只装 `themes/<name>/`，不碰它们。组件条目的 `theme` 依赖按 `nsh-ui.json` 解析，所以装主题不会把默认主题写回来。
- **构建时主题也能当"多装的一套"**：`theme-default` 装 `themes/default/`，里面是构建时那两个 JSON 的副本（均由 `tokens:build` 从 `tokens/themes/default/` 编译并由 `scripts/theme/themes.test.ts` 与 `tokens:build --check` 保证逐字节相同）加一个导出 `defaultTheme` 的 `index.ts`。构建时用 shadcn 的应用这样就能两边切。
- 应用的清单与持久化都是应用的：库只给 `selectTheme` / `currentTheme`，不写清单、不存 `id`（示例见 [`packages/theme/README.md`](../packages/theme/README.md)）。
- finish 在 JSX 里读（见下）；把 `finish.*` 存进模块级常量，运行时切换就不会跟着变。

## Rules

每条规则都有脚本判定；没有判定的不写进来。判定与命令见 [`port.md`](port.md#检查)。

| #   | 规则                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | **清单唯一。** 上游每个文件、每个顶层声明在 Port Map 里有去向，或是带理由的 `exclude`                                                                                             |
| P2  | **上游变化必经审阅。** 自 Port Map 记录的已审阅提交以来，上游改动了我们有去向的声明，`port:check` 列为待审阅；审阅后更新记录                                                      |
| P3  | **颜色只来自主题。** 组件、lib 与演示适配层的代码里不出现颜色字面量（含 Port Region）；主题文件以 oklch 存储                                                                      |
| P4  | **外壳不改变渲染。** 组件页与它的 Reference Page 截图相同（指针与触屏，亮与暗）；没有外壳的组件声明 `selfReference`                                                               |
| P5  | **外壳不缩减能力。** 组件 props 是对应 `nsh/base` props 加自己的轴；样式类 props 叠在 look 之上，使用者优先                                                                       |
| P6  | **依赖如实。** registry 条目的依赖等于实际 import，相对 import 的文件必须有条目分发                                                                                               |
| P7  | **侧向随阅读方向。** `packages/ui` 里不对称的 left/right 侧向属性用 `start`/`end`，`direction: "rtl"` 才会镜像；同一对象里两侧同值的对称对与标了 `// physical: <原因>` 的对象例外 |

Port Region 是**来源标注**，不是只读区：可以直接修改；`port:vendor` 只为新组件抽取初稿，不覆盖已有代码。

**归属**（抽取时，一个上游声明去哪个文件）：

1. 描述某个控件的 look，进该控件的组件文件；别的组件需要时 import 那个组件
2. 上游一个文件服务多个控件时，按声明拆到各自的组件；文件私有的常量可以路由到多个目标
3. 没有所属控件的，进 `packages/ui/lib/<上游文件名>`
4. 主题相关的进 `packages/theme`

导出的声明只有一个归属（只有文件私有的常量能路由到多个目标）。组件文件不再导出 `lib/` 的声明：用 `lib/<x>` 的人（应用、演示）直接从那里 import。

**Provider 的 children 在 Provider 里求值。** 组合控件的子元素要看见 Provider 的值，所以只在它内部求值：那里的读写成就地执行的 `(() => …)()`（见 `marker.tsx`），既在孩子们真正建出来的位置读，又只读一次。

**children 只读一次，读在画它的地方。** 每读一次 `props.children` 都会把子元素重新建一遍（新的原生视图），所以控件只读一次：读在画它们的 JSX 里，或交给宿主画的元素里；字符串 child 就地交给 `AsText`（`packages/ui/lib/as-text.tsx`，一个组件，props 即 getter、在应用处求值）画成 `Text`，函数 child 直接画（renderer 跟着它读的 signal 更新）。读写在组件自己的主体或就地执行的 `(() => …)()` 里；唯一的例外是门户的内容构建函数（`nsh/base` 每次打开才建它），那一个读带 `children-lint: <原因>` 注释。`bun run check:children` 检查每一条。

**外观随外观模式变化**：颜色与依赖 props 的 look 在 JSX 里读，不在组件体里读一次存下（web 上是 CSS 变量看不出来，原生上会冻结）。这一条同样管主题：`finish` 的 getter 读的是当前主题（`selectTheme`）与当前外观，组件若把 finish 的值存进模块级常量、或读进变量后不再读，运行时切换就不会跟着变。

**状态的外观进 state 样式。** 一个状态下的静态外观（底色、边框、透明度、缩放）交给 `hoverStyle` / `focusStyle` / `focusVisibleStyle` / `activeStyle` / `disabledStyle` / `selectedStyle` / `checkedStyle` / `indeterminateStyle` / `expandedStyle` / `pressedStyle`，不在 `style` 里按 `disabled`、`open`、`selected` 用 JS 再算一遍：状态本来就在元素上（它自己的 `disabled`、`accessibilityState`，或 `nsh/base` 投影给部件的状态），平台按 Tailwind 的变体顺序叠，后面的胜：`checked` → `indeterminate` → `selected` → `focus-within` → `hover` → `focus` → `focus-visible` → `active` → `disabled` → `aria-busy` → `aria-checked` → `expanded` → `aria-invalid` → `aria-pressed`（`references/nsh/crates/nsh-core/src/tailwind/mod.rs` 的 `rank`）。注意 `expanded` 与 `pressed` 排在 `hover`、`focus-visible`、`active` 之后：一个打开时的外观若要让 hover 或键盘焦点盖过它（导航菜单打开时指针在上面要显示完整底色；select 打开时触发器仍持有焦点，焦点边框要露出来），它留在 `style` 里，并在注释里写明这个理由。`disabledStyle` 只在元素真的 `disabled` 时生效，`expandedStyle` 只在元素真的 `expanded` 时生效——look 不是那个元素时，要由画它的外壳把状态写上。JS 只留 nsh 没有的状态，或排位不对的状态：数据驱动的 `active`（应用说“就是当前这页”，不是可访问性状态）、跟着状态换的内容（`●`/`○`、图标的字形）、`Text` 自己的字色字重（状态样式落在 `View` 上，盖不过子节点的 `color`）、需要插值的量（`follow` 的进度、动效），以及上面那种要被低位状态盖过的外观。元素已经 `disabled` 时，`hoverStyle` / `activeStyle` 不必再用 `disabled` 关掉：平台不给 hover，也不给按下。

## Seams

**Registry**（`registry.json` 的 shadcn 格式）：CLI 只经它拿组件，不读仓库源码
_Adapters_: GitHub Pages 上的 `public/r`、本地 `registry:serve`、CLI 测试的夹具 registry

**渲染用例表**（`apps/website/demos/render-cases.ts`）：哪些页、怎么定身、怎么比较，只在这里定义
_Adapters_: web 指针（`port:render`）、iOS 触屏（`port:render:touch`）、shadcn 主题（`port:render:theme`）、外观切换检查
