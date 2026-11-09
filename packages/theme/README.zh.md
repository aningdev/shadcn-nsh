# @shadcn-nsh/theme

[English](./README.md)

shadcn-nsh 的 token / 表面辅助。三层（见 [`docs/adr/0002-theme-finish-and-motion.md`](../../docs/adr/0002-theme-finish-and-motion.md)）：

1. **`theme.json`** — 颜色 / 半径真源（经 `nsh.json` `theme` 接入 NSH `cssVars`）
2. **`finishes.json`** — light/dark 语义表面深度（`finish.*`）；不是 cssVars token
3. **`theme.ts`** — `token()` 辅助：`colors`、`radius`、`finish`、`pressSink`、`duration`、`easing`…

### Finish 角色

| 角色                                                      | 用途                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `raised` / `hover` / `pressed` / `on` / `accent` / `card` | 控件表面（如 Button）                                            |
| `menu`                                                    | 浮层家族 **一把** 软阴影（menu、popover、select、dialog、sheet） |

填色始终来自 `colors.*`；finish 只提供 `boxShadow`（深度）。

### 动效

`pressSink(0.97)` + `duration.press`（150ms）/ `easing.press` — 对齐 NSH Design Guides 按压示例；尊重 `reduceMotion()`。

由 [`@shadcn-nsh/ui`](../ui) 消费，并以 registry `theme` 分发（`theme.json` + `lib/finishes.json` + `lib/theme.ts`）。修改后在仓库根执行 `bun run registry:build`，并提交 `public/r`。
