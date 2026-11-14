# shadcn-nsh Architecture

一个文件一个**组件**，经 registry 与 CLI 以 **Copy-into-app** 交付。组件归本库所有：外观以**上游**（`references/nsh/examples/nsh-gallery-ui`）与官方推荐为参考规范自行抽取，行为来自 `nsh/base`，分发、组合角色与 API 命名参照 shadcn。词汇见 [`GLOSSARY.md`](GLOSSARY.md)。

## Stack

**运行时与组件**：NSH（`nsh`、`nsh/base`），CLI 安装、从不编译；版本等于 **Baseline**（见 [`toolchain.md`](toolchain.md)）
_Avoid_: 编译 NSH、设 `NSH_RUNTIME`、自定 primitive 层

**脚本与依赖**：Bun；格式化、lint、工具面类型用 Vite+（`vp`），配置只在根 `vite.config.ts`
_Avoid_: Prettier、npm / pnpm 脚本

**上游解析**：`oxc-parser`
_Avoid_: TypeScript 编译器 API、正则切声明

**文档站**：Astro（`apps/docs`），演示由 `nsh package --target web` 打包后嵌入

**分发**：shadcn registry 格式（`registry.json` → `public/r`）+ 本仓 CLI `shadcn-nsh`
_Avoid_: 发布组件 npm 包、旧 registry id 的别名

**许可**：源自上游的内容保持 Apache-2.0，文件头与 `NOTICE` 注明来源

## Layout

- `registry.json`：**Catalog** 的真源，其 `registry:ui` 条目就是组件集合
- `port-map.json`：**Port Map**，上游每个声明的来源去向表与已审阅的上游提交；目标不一定是组件——`demo.ts` 的 `Stage` / `Split` / `Inspector` / `Panel` / `Log` / `Segmented` 等去向 `apps/docs/demos/stage.tsx`（演示适配层，不进 registry）
- `packages/theme/`：**Theme Source**（两个 JSON，oklch，归本库）与 `theme.ts`（角色读取）；`themes/<name>/` 是其他主题的数据；不放组件
- `packages/ui/<id>.tsx`：一个**组件** = look（源自上游的部分以 **Port Region** 标注来源）+ **Shell**；一个 registry 条目一个文件
- `packages/ui/lib/`：没有所属控件的上游部分（以上游文件名命名）与多个外壳共用的接线；作为 `registry:lib` 条目分发
- `apps/docs/demos/`：每个组件的 `<id>.tsx` 与 **Reference Page** `<id>.ref.tsx`、渲染比对用例与基线截图；`kit.tsx` 是演示外框，`stage.tsx` 是演示适配层（`Stage` / `Inspector` / `Split` / `Panel` / `Log` / `Segmented` / `Chips` / `desktop` / `wide` / `ui()`，见 [`port.md`](port.md#演示)），`photos.ts` 是照片页用的图（上游 `photos.ts`，原样搬运），都不进 registry；`shots/` 是渲染比对的截图，`shots-audit/` 是诊断脚本的，两者都不提交
- `apps/docs/public/demos/`：`docs:demos` 的打包产物（页面、运行时、wasm），不进仓库；`apps/docs/scripts/build-demos.ts` 打包每个演示，`player-options.ts` 让页面认面板的 `?idiom=` / `?theme=`
- `apps/docs/src/pages/docs/components/<id>.md`：组件文档页，固定四节
- `apps/gallery/`：原生行为测试与冒烟页，用同一套 `packages/ui`；不做公开文档，不比截图
- `packages/cli/`：`shadcn-nsh` CLI（`init`、`add`、`list`、`view`、`diff`、`build`、`serve`）
- `scripts/catalog.ts`：**Catalog** 模块，脚本读写 `registry.json` 与取组件集合的唯一入口（`addComponent` 写入新条目）；生成 `apps/docs/demos/catalog.generated.ts` 供 NSH 运行时使用（不手改）；`demos/` 下不是组件演示的文件（`App.tsx`、`kit.tsx`、`stage.tsx`）在 `NON_COMPONENT_DEMOS` 登记，新增这样的文件要加进去，否则 `catalog --check` 把它当成没有组件的演示
- `scripts/registry-build.ts`：`registry:build` 与 `test:install` 共用的构建（CLI `build` 加格式化）
- `scripts/install-test.ts`：`test:install`，从应用一侧验证 Copy-into-app
- `scripts/failure.ts`：脚本报错的约定，`StepFailure` 带失败的步骤名与 `cause`
- `scripts/port/`：抽取与上游变化提醒工具（读 `references/nsh`，见下）
- `scripts/audit/`：诊断演示的工具（批量打包 / 截图 / 量画布 / 拼对照页），不属于检查流水线；也读 `references/nsh`（官方示例原地打包），截图落在 `apps/docs/demos/shots-audit/`（gitignored，`port:render` 不清它），包落在仓库外，见 [`specs/demo-audit.md`](specs/demo-audit.md)
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
  demos["apps/docs/demos"]
  gallery["apps/gallery"]
  site["apps/docs 站点"]
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
- `packages/theme` 不 import `packages/ui`
- `packages/*` 不 import `apps/*`、`scripts/*` 或 `references/*`；运行时代码只认 `@shadcn-nsh/theme`、`nsh`、`nsh/base`、`lucide`（图标库，应用经 registry 的 `dependencies` 安装）与相对路径
- 只有 `scripts/port`（抽取与变化提醒）与 `scripts/audit`（对照诊断截图）读 `references/nsh`；`apps/docs` 的构建不需要子模块
- 组件集合只从 `scripts/catalog.ts`（脚本）或 `catalog.generated.ts`（NSH 运行时）取；不自己读 `registry.json` 过滤，也不 `readdir` 演示或文档目录来推导
- `scripts/*` 可以把 `packages/cli/src/*` 当库 import（构建、serve、registry 形状校验）：它是工具，不是应用代码；CLI 本身仍只经 Registry 拿组件
- registry JSON 的形状只在 `packages/cli/src/utils/registry-schema.ts` 校验；读到的 JSON 经它变成类型，不用 `as` 断言
- `scripts/*` 可以 import `apps/docs/demos/render-cases.ts`（渲染用例与特例）与 `apps/docs/scripts/player-options.ts`（演示包的 `?idiom=` / `?theme=`：文档站与审计用同一份），不 import `apps/docs` 的其他代码
- 每个组件的特例（渲染前的 steps、`selfReference`）只写在 `render-cases.ts`，按 id 覆盖；`packages/ui/index.ts` 手写，由检查保证它导出每个组件

## Rules

每条规则都有脚本判定；没有判定的不写进来。判定与命令见 [`port.md`](port.md#检查)。

| #   | 规则                                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| P1  | **清单唯一。** 上游每个文件、每个顶层声明在 Port Map 里有去向，或是带理由的 `exclude`                                        |
| P2  | **上游变化必经审阅。** 自 Port Map 记录的已审阅提交以来，上游改动了我们有去向的声明，`port:check` 列为待审阅；审阅后更新记录 |
| P3  | **颜色只来自主题。** 组件、lib 与演示适配层的代码里不出现颜色字面量（含 Port Region）；主题文件以 oklch 存储                 |
| P4  | **外壳不改变渲染。** 组件页与它的 Reference Page 截图相同（指针与触屏，亮与暗）；没有外壳的组件声明 `selfReference`          |
| P5  | **外壳不缩减能力。** 组件 props 是对应 `nsh/base` props 加自己的轴；样式类 props 叠在 look 之上，使用者优先                  |
| P6  | **依赖如实。** registry 条目的依赖等于实际 import，相对 import 的文件必须有条目分发                                          |

Port Region 是**来源标注**，不是只读区：可以直接修改；`port:vendor` 只为新组件抽取初稿，不覆盖已有代码。

**归属**（抽取时，一个上游声明去哪个文件）：

1. 描述某个控件的 look，进该控件的组件文件；别的组件需要时 import 那个组件
2. 上游一个文件服务多个控件时，按声明拆到各自的组件；文件私有的常量可以路由到多个目标
3. 没有所属控件的，进 `packages/ui/lib/<上游文件名>`
4. 主题相关的进 `packages/theme`

**外观随外观模式变化**：颜色与依赖 props 的 look 在 JSX 里读，不在组件体里读一次存下（web 上是 CSS 变量看不出来，原生上会冻结）。

## Seams

**Registry**（`registry.json` 的 shadcn 格式）：CLI 只经它拿组件，不读仓库源码
_Adapters_: GitHub Pages 上的 `public/r`、本地 `registry:serve`、CLI 测试的夹具 registry

**渲染用例表**（`apps/docs/demos/render-cases.ts`）：哪些页、怎么定身、怎么比较，只在这里定义
_Adapters_: web 指针（`port:render`）、iOS 触屏（`port:render:touch`）、外观切换检查
