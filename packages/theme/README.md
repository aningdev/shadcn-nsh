# @shadcn-nsh/theme

Theme v5 的主题契约与运行时。真源是 `themes/<id>/index.ts`：`nsh-gallery` 写完整 `base`，`shadcn`、`solid-glass`、`apple`、`material`、`winui` 用 `defineTheme()` 稀疏覆写。`themes/native` 的 `nativeTheme()` 按 `platform.os` 选择平台主题。

`bun run theme:build` 单向导出 `theme.json`、`{light,dark}.tokens.json` 与 `DESIGN.md`（生成，不手改）。运行时读 `theme.ts`：`colors`、`tints`、`chart`、`shape`、`surface()`、`feedback`、`motion`、`control()`、`selectTheme` / `currentTheme`。

| 文件                                          | 作用                                              |
| --------------------------------------------- | ------------------------------------------------- |
| `schema.ts`                                   | `ThemeSpec`、`defineTheme()`、`compileNshTheme()` |
| `theme.ts`                                    | 强类型读取                                        |
| `themes/<id>/index.ts`                        | 主题真源                                          |
| `materials.ts` / `effects.ts` / `paradigm.ts` | 材质、WGSL、L1 轴                                 |

契约与作者命令见 [`docs/theme.md`](../../docs/theme.md)。解析后的全表是 [`docs/theme-values.md`](../../docs/theme-values.md)。平台主题：[`apple`](themes/apple/README.md)、[`material`](themes/material/README.md)、[`winui`](themes/winui/README.md)。

改主题后：`bun run theme:build && bun run check:theme`。
