# 0011 构建根主题改名为 `nsh-gallery`（NSH Gallery）

- 日期：2026-11-25
- 状态：已采纳（2026-11-25）
- 实现：#360
- 关联：[0004](0004-theme-contract-freeze.md)、[0007](0007-theme-customization-scope.md)、[`positioning.md`](../specs/positioning.md)

## 背景

本库的构建根主题（`init` 不传 `--theme` 时装的那套，`bun run tokens:build` 编译的那套）一直叫 `default`。这个名字有两个问题：

- **它把“默认”当成了“没有主张”。** 本库是 NSH 的 shadcn 模式组件库，官方推荐的样子由 nsh.dev 的演示给出；那套外观是我们的主张，不是某个框架留下的兜底。`default` 听起来像 shadcn 的 neutral，而 shadcn 的样子已经有了自己的主题 `shadcn`。
- **它和 shadcn 的默认主题撞名。** 文档里说“默认主题”时，读者分不清是本库的构建根，还是 shadcn 的 neutral；registry 的 `theme-default` 也读不出这是哪套外观。

## 决定

- 主题 id 改为 **`nsh-gallery`**，标签 **NSH Gallery**：目录 `packages/theme/tokens/themes/nsh-gallery/`、`packages/theme/themes/nsh-gallery/`，registry 条目 `theme-nsh-gallery`，文档路由 `/docs/themes/nsh-gallery`，包导出 `nshGallery`，CLI 的 `--theme nsh-gallery`。构建根常量 `BUILD_ROOT_THEME` 跟着改。
- **它仍是构建根。** `init` 不传 `--theme` 装它，`tokens:build` 用它当基准（finish 字段顺序、其余主题“不得多出或少掉键”的对照、`theme-lint` 的逐字节相等），编译器与生成器里没有任何按 id 分支的地方。
- **不提供别名。** `--theme default` 报错并列出可选 id；旧名字不映射到新 id，也不留重定向或迁移脚本。
- **NSH Gallery 是官方 look，`shadcn` 是 shadcn 的 look。** 要 shadcn 的 neutral 就装 `shadcn`；要对齐 nsh.dev 上的示例，就用构建根这套。
- **决策记录不改写。** 0001–0010 里写的 `default` 是当时的事实，不追改；本条是它改名的地方。

## 理由

- **名字说清主张。** “NSH Gallery”指向 nsh.dev 的 Gallery，也就是这套外观的参照；`default` 只会让人想到别人的默认值。
- **一个 id 贯穿所有面。** registry 条目、目录、包名、路由、storage 里的 palette 值、CLI 的报错列表都用同一个词，读者从任何入口进来看到的都是同一套东西。
- **先改名，成本最低。** 主题值与组件一个像素都不动（`theme:diff --same` 证明），改动只有 id 与文案；等到发版后再改还要背上迁移。

## 不采纳的方案

- **只改标签，id 留着。** 目录、registry 与 CLI 仍写着 `default`，撞名只解决了一半。
- **`default` 作为别名继续可用。** 就是任务要求排除的兼容层：两个名字指一套主题，文档与报错列表要一直维护两份。
- **把 shadcn 的 neutral 当构建根，NSH Gallery 做成另一套。** 那等于让本库的官方 look 变成 shadcn 的，与定位相反（`positioning.md`）。
