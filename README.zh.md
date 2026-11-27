# shadcn-nsh

[English](./README.md)

面向 [Native Shell (NSH)](https://github.com/longbridge/nsh) 的带样式 UI 组件库：行为与无障碍构建于 `nsh/base`，零第三方运行时依赖。你可以像原生包一样通过 **TSX `nshm`** 直接 `nsh add` 引入，也可以用 **CLI 复制源码进工程（Copy-into-app）** —— 沿用 [shadcn/ui](https://github.com/shadcn-ui/ui) 的组合模型，在手机、桌面、Web 与终端形态间自适应。

文档、在线预览与 API 说明：**https://shadcn-nsh.aning.dev/**

- **外观完全数据驱动。** 组件从主题层读取颜色、圆角、表面材质、控件槽与动效参数，不写死视觉常量，切换一套主题即可重绘整套界面。
- **该原生处原生。** 交互、键盘焦点与无障碍能力由 `nsh/base` 提供；组件外壳只负责样式与结构组合，并在指针、触屏与终端下自适应。
- **设计架构。** 有关 `nsh/base`、三层主题引擎与组件外壳如何分层协作，见[架构说明](https://shadcn-nsh.aning.dev/docs/architecture)与 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 内置主题

内置六套完整主题，另带按 `platform.os` 运行时自动匹配的 `native` 预设（`nativeTheme()`）：

| 主题          | 风格特点                                                                     | 参考规范                                                                                           | 实现说明                                                                     |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `nsh-gallery` | 默认主题：石墨表面、柑橘强调色、8pt 控件圆角                                 | [NSH Gallery](https://github.com/longbridge/nsh)                                                   | [`packages/theme/themes/nsh-gallery`](packages/theme/themes/nsh-gallery)     |
| `shadcn`      | shadcn 中性黑白灰调色板与克制扁平表面                                        | [shadcn/ui](https://ui.shadcn.com/)                                                                | [`packages/theme/themes/shadcn`](packages/theme/themes/shadcn)               |
| `solid-glass` | 烟熏玻璃表面、顶部高光棱线、柔和弹簧动效                                     | [Solid Glass](https://github.com/deeplethe/solid-glass)                                            | [`packages/theme/themes/solid-glass`](packages/theme/themes/solid-glass)     |
| `apple`       | Liquid Glass 玻璃层、系统色、连续曲率圆角（`ios` / `macos`）                 | [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) | [`packages/theme/themes/apple`](packages/theme/themes/apple/README.md)       |
| `material`    | Tonal 层次表面、胶囊按钮、圆形圆角、8/10/10% 状态层（`android`）             | [Material Design 3](https://m3.material.io/)                                                       | [`packages/theme/themes/material`](packages/theme/themes/material/README.md) |
| `winui`       | Fluent 2 Acrylic 亚克力层、4/8pt 圆形圆角、双焦点环与无过冲动效（`windows`） | [Windows App Design](https://learn.microsoft.com/windows/apps/design/)                             | [`packages/theme/themes/winui`](packages/theme/themes/winui/README.md)       |

> **风格取材，而非 1:1 像素级还原。** 这些内置主题提炼了对应设计语言的色彩、圆角、表面材质与动效节奏，落在同一套共享 `nsh/base` 控件契约上，并非对平台原生控件逐像素复刻；具体的取舍与降级边界记录在各主题目录的 README 中。

### 定制主题

基于 `defineTheme({ extends: base, ... })` 即可衍生自己的品牌主题并经 `selectTheme()` 实时切换；也可直接编辑 `theme.json` 覆写构建期 token，并生成 W3C DTCG 2025.10 文件与 `DESIGN.md`。详情见[定制指南](https://shadcn-nsh.aning.dev/docs/customizing)与 [`docs/theme.md`](docs/theme.md)。

## 使用方式

支持两种接入方式，均基于同一份源码，按项目偏好选择即可。

### 方式一：TSX `nshm`（零 npm 依赖，开箱即用）

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Button } from "shadcn-nsh";
import { selectTheme } from "shadcn-nsh/theme";
import apple from "shadcn-nsh/themes/apple";

selectTheme(apple);
```

NSH 直接从模块解析组件与主题，无需安装 npm 包或生成 `node_modules`。组件自身所需的基础 UI 图标已内置（`IconNode` 结构完全兼容外部 `lucide` 图标）。通过 `selectTheme()` 即可在运行时切换内置主题；若你需要在应用自写视图里使用 `bg-surface`、`rounded-(--radius-md)` 等构建期 Tailwind token，可配合下方 CLI 写入 `theme.json`。

### 方式二：Copy-into-app CLI（源码拷入工程，完全可控）

应用需先包含 `nsh.json`（由 `nsh init` 创建）：

```sh
npx shadcn-nsh@latest init                 # 写入 nsh-ui.json、安装 theme.json 与读取层、配置 @/ 别名
npx shadcn-nsh@latest init --theme apple   # 或直接以任意内置主题起步
npx shadcn-nsh@latest add button           # 拷贝组件源码及其共享 lib 依赖
npx shadcn-nsh@latest add theme-material   # 额外安装一套主题供运行时 selectTheme() 切换
```

复制后的源码完全归应用所有；组件自带基础图标，通常无需额外安装 `lucide`，应用业务传入的 `lucide` 图标亦可直接使用。可通过 `list`、`view <name>` 与 `diff` 随时比对本地副本差异。CLI 按发布标签读取对应版本的 registry（`v<version>/public/r/{name}.json`），完整命令与参数见 [CLI 参考](https://shadcn-nsh.aning.dev/docs/cli)。

## 兼容矩阵

本库每个版本都针对特定版本的 NSH CLI 与 `nsh/base` API 完成验证：

| shadcn-nsh | NSH CLI |
| ---------- | ------- |
| 0.11.x     | v0.7.2  |
| 0.10.x     | v0.6.1  |
| 0.9.x      | v0.6.1  |
| 0.8.x      | v0.6.0  |
| 0.7.x      | v0.5.1  |
| 0.6.x      | v0.5.1  |

## 本地开发

需要 Bun 与 [NSH CLI](https://nsh.dev/)（版本见 [`package.json`](package.json) 的 `engines.nsh`）：

```sh
bun install
bun run prepare:types
bun run dev:docs
bun run check
```

贡献规范与架构约定见 [`CONTRIBUTING.md`](CONTRIBUTING.md) 与 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 致谢与开源协议

- 感谢 [Native Shell (NSH)](https://github.com/longbridge/nsh) 提供原生底座与 `nsh/base` 行为层；借鉴自 `nsh-gallery-ui` 外观的部分保持 Apache License 2.0（详见 [`NOTICE`](NOTICE)）。
- 感谢 [shadcn/ui](https://github.com/shadcn-ui/ui) 提供的 Copy-into-app、registry 与组件组合设计模型。
- 感谢 [Solid Glass](https://github.com/deeplethe/solid-glass) 为 `solid-glass` 主题提供的色彩与玻璃表面灵感（MIT License）。
- 感谢 [Lucide](https://lucide.dev/) 提供的内置基础图标路径数据（ISC License；部分图标源自 Feather，MIT License）。

本仓库主体遵循 **MIT License** 开源，详见 [`LICENSE`](LICENSE) 与 [`NOTICE`](NOTICE)。
