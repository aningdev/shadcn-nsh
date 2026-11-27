# @shadcn-nsh/theme

[English](./README.md)

Theme v5 主题契约与运行时读取层（决策见 [`docs/decisions/0020-theme-v5.md`](../../docs/decisions/0020-theme-v5.md)）。以 TypeScript 稀疏继承为唯一真源（1 套完整 `base` 主题 `themes/nsh-gallery/index.ts` + 5 套通过 `defineTheme()` 定义的稀疏覆写：`shadcn`、`solid-glass`、`apple`、`material`、`winui`），由 `bun run tokens:build` 单向导出 `theme.json`、W3C DTCG 2025.10 `{light,dark}.tokens.json` 与 `DESIGN.md`。

| 文件                                    | 职责                                                                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `schema.ts`                             | 契约类型（`ThemeSpec`、`ThemePatch`）、`SHARED_TYPE_SCALE`、`EASING_BEZIERS`、`defineTheme()`、`compileNshTheme()`                                                                                                 |
| `materials.ts`                          | 平台玻璃与亚克力材质配方（`ios` / `macos` / `windows`），以及参数化 `MaterialSpec` 的 `resolveMaterial()`                                                                                                          |
| `effects.ts`                            | 内置 WGSL 表面（`liquid-glass`、`acrylic-noise`、`specular-rim`、`paper-grain`）与主题切换着色器（`SURFACE_SHADERS`、`TRANSITION_SHADERS`）                                                                        |
| `paradigm.ts`                           | L1 `ThemeParadigm` 六轴与 `expandParadigm()`；由 `defineTheme` 展开，不进入 `ThemeSpec`                                                                                                                            |
| `themes/nsh-gallery/index.ts`           | 完整 `base` 主题源码（`baseSpec`、`base`、`nshGallery`）                                                                                                                                                           |
| `themes/<id>/index.ts`                  | 稀疏覆写主题（`shadcn`、`solid-glass`、`apple`、`material`、`winui`）与 `themes/native/`                                                                                                                           |
| `preset.ts`                             | 构建时预设导出（`init --theme <id>` 时指向所选主题）                                                                                                                                                               |
| `theme.ts`                              | 零 Proxy 强类型运行时读取：`colors`、`tints`、`chart`、`shape`、`metrics`、`surface()`、`feedback`、`motion`（`springOf`、`springCss`、`revealSpring`、`pressSpring`）、`control()`、`selectTheme`、`currentTheme` |
| `theme.json`                            | 导出的 NSH 变量（`cssVars.theme` 含 `font-sans` / `font-mono` 与圆角刻度；亮暗各 21 键）                                                                                                                           |
| `light.tokens.json`, `dark.tokens.json` | W3C DTCG 2025.10 单向静态导出（仅作工具链互操作，运行时不读）                                                                                                                                                      |
| `DESIGN.md`                             | 生成的 Google Labs `DESIGN.md`（`alpha`）视觉规范（随 CLI `init` 复制进应用根目录）                                                                                                                                |

## 架构摘要（Theme v5）

- **三层写法**：L1 `ThemeParadigm`（`paradigm.ts` 六轴，`defineTheme` 展开后从 `ThemeSpec` 去掉），L2 稀疏 `ThemeSpec` 覆写，L3 `MaterialSpec` 与 `effects.ts` 的 WGSL（`<ThemedSurface>`、`<ThemeTransition>`）。见 `.agents/skills/theme-designer/SKILL.md`。
- **`theme.json` 共享键**：
  - `cssVars.theme`：必需 `font-sans`（默认 `system-ui`）、`font-mono`（默认 `monospace`）、`radius`（等于 `radius-md`）、`radius-md`、`radius-lg`、`radius-xl`、`scrim`、`media`、`on-media`。`font.sans` 与 `font.mono` 读取这两个字体键。
  - `cssVars.light` / `cssVars.dark`：21 个核心颜色角色（`background`、`card`、`popover`、`muted`、`surface`、`foreground`、`muted-foreground`、`faint`、`primary`、`primary-foreground`、`secondary`、`accent`、`brand`、`border`、`line`、`input`、`ring`、`info`、`success`、`warning`、`destructive`）。
  - 移除 `sidebar-*`、冗余 `*-foreground`、静态 `*-tint`（运行时通过 `tints.*` 反应式计算）、必选 `chart-1..5` 与单一控件颜色键；将 `up` / `warn` / `raised` 标准化为 `success` / `warning` / `surface`。
- **四层正交模型**：
  - `surfaces`（11 个统一 `SurfaceSpec` 角色）+ `elevation.{light,dark}`
  - `metrics`（指针/触屏两档尺寸、间距、线宽与字阶）
  - `feedback`（`hover`、`press`、`focus`、`disabled`、`passive`）与 `motion`（时序、默认/三档物理弹簧 `springs.{snappy,smooth,bouncy}` 与 `reveal`/`press` 预设）
  - `controls`（13 个稀疏控件配方，零主题名分支）

## 开发与验证

```sh
bun run tokens:build && bun run check:theme && bun run theme:contrast && bun run theme:parity
```

应用通过 `shadcn-nsh init --theme <id>` 初始化后，会在项目根目录写入 `theme.json` 与 `DESIGN.md`，并在 `lib/ui/` 下写入精简源码（`schema.ts`、`materials.ts`、`effects.ts`、`paradigm.ts`、`base.ts`、`preset.ts`、`theme.ts`）。执行 `shadcn-nsh add theme-<id>` 时仅复制 `themes/<id>.ts` 供 `selectTheme()` 运行时切换。
