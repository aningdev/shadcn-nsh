# @shadcn-nsh/theme

[English](./README.md)

Theme v5 主题契约与运行时读取层（决策见 [`docs/decisions/0020-theme-v5.md`](../../docs/decisions/0020-theme-v5.md)）。以 TypeScript 稀疏继承为唯一真源（1 套完整 `base` 主题 `themes/nsh-gallery/index.ts` + 5 套通过 `defineTheme()` 定义的稀疏覆写：`shadcn`、`solid-glass`、`apple`、`material`、`winui`），由 `bun run tokens:build` 单向导出 `theme.json`、W3C DTCG 2025.10 `{light,dark}.tokens.json` 与 `DESIGN.md`。

| 文件                                    | 职责                                                                                                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.ts`                             | 契约类型（`ThemeSpec`、`ThemePatch`）、`SHARED_TYPE_SCALE`、`EASING_BEZIERS`、`defineTheme()`、`compileNshTheme()`                                       |
| `materials.ts`                          | 平台玻璃与亚克力材质配方，以及参数化材质的 `resolveMaterial()`                                                                                           |
| `effects.ts`                            | 内置 WGSL 表面与主题切换着色器（`SURFACE_SHADERS`、`TRANSITION_SHADERS`）                                                                                |
| `themes/nsh-gallery/index.ts`           | 完整 `base` 主题源码（`baseSpec`、`base`、`nshGallery`）                                                                                                 |
| `themes/<id>/index.ts`                  | 稀疏覆写主题（`shadcn`、`solid-glass`、`apple`、`material`、`winui`）与 `themes/native/`                                                                 |
| `preset.ts`                             | 构建时预设导出（`init --theme <id>` 时指向所选主题）                                                                                                     |
| `theme.ts`                              | 零 Proxy 强类型运行时读取：`colors`、`tints`、`chart`、`shape`、`metrics`、`surface()`、`feedback`、`motion`、`control()`、`selectTheme`、`currentTheme` |
| `theme.json`                            | 导出的精简 25 键 NSH 变量（7 共享 + 21 亮暗键 + 可选 `font-sans`/`font-mono`）                                                                           |
| `light.tokens.json`, `dark.tokens.json` | W3C DTCG 2025.10 单向静态导出（仅作工具链互操作，运行时不读）                                                                                            |
| `DESIGN.md`                             | 生成的 Google Labs `DESIGN.md`（`alpha`）视觉规范（随 CLI `init` 复制进应用根目录）                                                                      |

## 架构摘要（Theme v5）

- **精简 `theme.json`（25 个核心角色 + 可选字体）**：
  - `cssVars.theme`：必需 `radius`、`radius-control`、`radius-container`、`radius-modal`、`scrim`、`media`、`on-media`；可选 `font-sans`、`font-mono`（内置主题默认省略以沿用系统字体）。
  - `cssVars.light` / `cssVars.dark`：21 个核心颜色角色（`background`、`card`、`popover`、`muted`、`surface`、`foreground`、`muted-foreground`、`faint`、`primary`、`primary-foreground`、`secondary`、`accent`、`brand`、`border`、`line`、`input`、`ring`、`info`、`success`、`warning`、`destructive`）。
  - 移除 `sidebar-*`、冗余 `*-foreground`、静态 `*-tint`（运行时通过 `tints.*` 反应式计算）、必选 `chart-1..5` 与单一控件颜色键；将 `up` / `warn` / `raised` 标准化为 `success` / `warning` / `surface`。
- **四层正交模型**：
  - `surfaces`（11 个统一 `SurfaceSpec` 角色）+ `elevation.{light,dark}`
  - `metrics`（指针/触屏两档尺寸、间距、线宽与字阶）
  - `feedback`（`hover`、`press`、`focus`、`disabled`、`passive`）与 `motion`（时序、可选 `spring` 与入场预设）
  - `controls`（13 个稀疏控件配方，零主题名分支）

## 开发与验证

```sh
bun run tokens:build && bun run check:theme && bun run theme:contrast && bun run theme:parity
```

应用通过 `shadcn-nsh init --theme <id>` 初始化后，会在项目根目录写入 `theme.json` 与 `DESIGN.md`，并在 `lib/ui/` 下写入精简源码（`schema.ts`、`materials.ts`、`effects.ts`、`base.ts`、`preset.ts`、`theme.ts`）。执行 `shadcn-nsh add theme-<id>` 时仅复制 `themes/<id>.ts` 供 `selectTheme()` 运行时切换。
