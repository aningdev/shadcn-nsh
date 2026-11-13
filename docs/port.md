# 移植一个组件

新增或修改组件、演示、文档页时照这里做。分层与规则（P1–P7、归属）见 [`ARCHITECTURE.md`](ARCHITECTURE.md)，词汇见 [`GLOSSARY.md`](GLOSSARY.md)，CLI 与基线见 [`toolchain.md`](toolchain.md)。

## 流程

```sh
bun run port:new <id> --from <上游文件> [--symbols a,b,c] [--base <nsh/base 符号>] [--family]
# 例：bun run port:new toggle --from look/tool.ts --symbols toggleLook,toggleLabel,toggleGlyph,toggleSizes --base Toggle
# 例：bun run port:new popover --from look/overlay.ts --symbols popoverLook,PopoverLookOptions --base Popover --family
```

脚手架依次：在 `port-map.json` 加路由（已有路由时报错）→ 建 `packages/ui/<id>.tsx`（文件头、空区域、外壳骨架；`--family` 生成 Root / Trigger / Content / Close 与 `use<Id>()`）→ `port:vendor` 填区域并列出缺的 import → 建 `demos/<id>.tsx` 与 `<id>.ref.tsx` → 在渲染用例表与 `App.tsx` 各加一行 → 建文档页骨架 → 加 registry 条目。

然后：

1. 填完所有 `TODO(port)`（`port:check` 在移植目录里见到它就报错）
2. 核对 registry 条目
3. 跑[检查](#检查)；指针与触屏各亮 / 暗两张截图（`port:sheet` 拼成一页）人眼看过：无裁切、错位、看不清的文字
4. 改了截图就 `bun run port:baseline --update`，与改动一起提交
5. `bun run registry:build`

一个家族一个 commit。

## 外壳写法

样板：单部件 `packages/ui/button.tsx`、`switch.tsx`；复合 `packages/ui/dialog.tsx`。

- 不解构 props：`split(props, [...])` 取走外壳处理的键，其余 `{...rest}` 透传
- look 的选项传读取函数（`size: () => props.size`），外观随 props 变化
- 样式类 props 写成数组，使用者在后：`style={[look.style, props.style ?? null]}`；`hoverStyle`、`activeStyle`、`focusVisibleStyle`、`disabledStyle` 同理
- 字符串 children 渲染成带 look 字体的 `Text`，其他原样渲染
- 轴的 prop 名用 shadcn 的（`variant`、`size`），取值与默认值用上游组件的
- 复合控件（**Composition Facade**）：Root 只持有开关状态（`createOpenState`）与生命周期回调；Content 持有 `nsh/base` 根并透传它的全部 props；Trigger / Close 对字符串 child 渲染 `Button`
- 文件头三行写明来源与许可；每个导出的类型、prop 和组件都有 doc comment

## 演示与文档页

**演示**覆盖组件声明的每个 `variant`、`size`、`kind`、`tone` 和状态（选中、禁用、忙碌等），至少一个真实场景；场景参考 `references/nsh/website/demos/el-<id>.tsx`，不搬它的 Inspector / Stage / Log。用 `kit.tsx` 的 `DemoPage` / `DemoCard` / `DemoSection`。参照页与演示是同一页面，只把组件换成 look 展开在 `nsh/base` 上。

**文档页**照 shadcn 的篇幅，章节固定为 Installation、Usage、Examples、API。Usage 只放 import 和一行最简用法；Examples 一个轴一小节；API 只列外壳自己加的 props，其余一句话指向 `nsh/base`。

## 检查

| 命令                        | 判定                                                                                                  | 何时跑         |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | -------------- |
| `bun run port:check`        | P1–P3：清单完整、区域与上游一致（格式化后比较）、安装的 CLI 与基线不同时警告；`--status` 列出待办     | 每次           |
| `nsh check apps/docs/demos` | 组件与演示的类型；`props.test-d.ts` 断言外壳 props 是 base props 的超集（P5）                         | 每次           |
| `bun run port:coverage`     | 演示覆盖组件声明的每个轴取值与共享 `Tone`；`selfReference` 只在没有外壳的组件上                       | 每次           |
| `bun run port:render`       | P4 的指针一半：web，亮 / 暗；跑完与 `apps/docs/demos/baseline/` 逐字节比较                            | 提交前、CI     |
| `bun run port:render:touch` | P4 的触屏一半：iOS 模拟器，亮 / 暗；之后跑外观切换检查                                                | 提交前（本地） |
| `bun run registry:build`    | P6：依赖等于 import，相对 import 都有条目分发                                                         | 改组件后       |
| `bun run test:unit`         | CLI 与主题；`ui-guards.test.ts` 扫 Port Region 之外的颜色字面量（P7）                                 | 每次           |
| `bun run test:gallery`      | 原生行为：按键、取值、禁用                                                                            | 改行为后       |
| `vp check`                  | 格式、lint、工具面类型                                                                                | 每次           |
| `bun run check`             | `vp check --fix` → `port:check` → `port:coverage` → demos 与 gallery 类型 → 文档页 → docs（会改文件） | 每次           |

两种渲染比对的实现细节（CPU 光栅化、定身等待、基线）见 [`toolchain.md`](toolchain.md#渲染比对的两半)。

`port:check` 比较的是格式化后的文本，只要 `vp fmt` 的行为不变就稳定；它不看区域之外，那由 P7 负责。

## 待定

- **上游按"行"设计的缺口**：单独一个开关没有焦点环和禁用外观（上游由 `listRow` 提供）。现状是与上游一致、不补。
