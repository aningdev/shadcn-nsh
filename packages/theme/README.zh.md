# @shadcn-nsh/theme

[English](./README.md)

copy-into-app 层的品牌外观：本库所有，起点是上游 gallery UI 主题。**颜色一律 `oklch()`** —— token、渐变的每一站、阴影里的颜色 —— 透明度写成 `oklch(… / a)`。NSH 在颜色是字符串的地方都认 `oklch()`（`references/nsh/website/docs/styling.md#colors`），所以一个文件里只有一种颜色形式，读一个值就是读它的亮度与色相。

| 文件             | 作用                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens/`        | 全部 6 套主题的 W3C DTCG 2025.10 源码真源（`tokens/base/*` 与 `tokens/themes/<id>/*`），经 `bun run tokens:build` 编译为 `theme.json`、`semantics.json` 与 `themes/<id>/`                                                                                                                                                                                      |
| `theme.json`     | 编译后的基础 token：颜色（明暗与共用）、全部 8 个 `radius-*` 圆角，以及字体（`cssVars`）                                                                                                                                                                                                                                                                       |
| `semantics.json` | 编译后的跨平台语义层：DTCG 命名的风格组（`typography`、`dimension`、`shape`、`state`、`duration`、`transition`、`motion`、`indicator`）与 `finishes`（`shared` + 稀疏 `light`/`dark` 覆写），以 `{token}` 引用基础 token                                                                                                                                       |
| `theme.ts`       | `colors` / `finish` / `shape` / `font` / `style` / `focusRing` / `selectTheme` / `fillStyle` 等读取器                                                                                                                                                                                                                                                          |
| `themes/<name>/` | 其它主题，各一个 `AppTheme`：`shadcn/`（shadcn 的 `neutral`）、`solid-glass/`（Solid Glass）、`apple/`（Apple 系统色与 Liquid Glass）、`material/`（Material 3 Expressive）、`winui/`（Windows 11 WinUI 3 / Fluent 2）、`native/`（`nativeTheme()`：iOS 与 macOS 用 apple，Android 用 material，Windows 用 winui，其余用默认）、`default/`（本库这套，供多装） |

## 规范

`semantics.json` 除了 `finishes`（`shared` + 稀疏 `light` / `dark`），还按 DTCG 命名写出主题的**风格**（`typography`、`dimension`、`shape`、`state`、`duration`、`transition`、`motion`、`indicator`），每套主题的键相同。`density`、`controlSize`、`motion`、`cornerCurve`、`focusRing` 读当前主题的这些数据，`selectTheme` 之后读它们的地方下一帧重画；`style()` 给出整套。组件经 `shape`（圆角，经 `token()` 响应式解析 `dimension.shape.*` 的 `{radius-…}`）、`font`（`font.family()` 经 `token()` 解析 `typography.fontFamily`，`font.lineHeight` / `font.letterSpacing` 读各字阶角色）、`stroke`（线宽）、`dimmed`（按下与禁用的透明度）、`controlHeight`、`iconSize`、`hitTarget()`（尺寸）读这些角色，`rounded(radius, inset)` 取同心圆角。全部 8 个 `radius-*`（`radius`、`radius-control`、`radius-field`、`radius-chip`、`radius-card`、`radius-overlay`、`radius-dialog`、`radius-sheet`）只定义在 `theme.json`，因此 Tailwind 类与宿主 `setThemeOverrides` 都能自动到达 `shape.*`。

主题由三样东西组成：**token**（有名字的颜色、长度或字体家族，`theme.json` 写）、**finish**（组件自己画的表面 —— 底、渐变、边、影、模糊、平台材质，`semantics.json` 写）、**alias**（`theme.json` 内写 `var(--x)`，`semantics.json` 内写 `{x}`）。分层标准与 `{token}` 规则见 [`docs/specs/design-semantics.md`](../../docs/specs/design-semantics.md)；有哪些 token、每个 finish 画什么、谁读它，以 [`docs/specs/theme-roles.md`](../../docs/specs/theme-roles.md) 为准；`bun scripts/theme-lint.ts` 拿这两个文件对着它检查。

由 [`@shadcn-nsh/ui`](../ui) 使用，并以 registry 的 `theme` 项（应用的**构建时主题**）与 `theme-<name>` 项（其它主题）分发。改任何主题时编辑 `packages/theme/tokens/` 下的 DTCG 源码（或对由生成器维护的主题运行 `bun scripts/theme/generate-*.ts` 重写对应 DTCG 源码并自动执行编译），手改 `.tokens.json` 后运行 `bun run tokens:build` 编译，再运行 `bun run registry:build` 并提交 `public/r`。

`default` 的 DTCG 源码（`tokens/`）与编译产物已归本库所有（[`port-map.json`](../../port-map.json) 里的 `"owned"`）：`port:vendor` 不再重填、`port:check` 不再与上游比对，所以像其它源码一样在这里改（[`docs/port.md`](../../docs/port.md#主题文件)）。外观仍以上游 gallery UI 主题为准；变的是数据归谁。

全部 6 套主题的 `themes/<id>/{theme,semantics}.json`（以及 `default` 根目录的 `theme.json`、`semantics.json`）均由 `bun run tokens:build` 从 `packages/theme/tokens/` 编译生成，不手改（`tokens:build --check` 与 `scripts/theme/themes.test.ts` 保证与源码一致）；旁边的 `index.ts` 是手写的一次性声明，给这套主题一个名字。构建时主题本身也能当"多装的一套"，因为 registry 条目分发的是文件，不是本包里的一个路径。

数值按固定精度写（L、C 五位小数，H 三位，alpha 三位），这是换算无损的原因：每个 sRGB 颜色都能落回自己的 8-bit 通道，所以主题改存 `oklch()` 不动一个像素。

## 覆盖

应用经 `nsh.json` 的 `"theme"` 定外观 —— 就是上面这些 token，用在哪读到哪，所以 `setTheme` 与应用带着的每一套主题都落在同一处 —— 而不是 `"tailwind"`：后者在构建时只决定应用自己的 class 字符串，那里写了同名颜色就会盖过同名的 token 类，且不随主题变。字体也是 token（`font-sans`、`font-mono`），它写的家族随应用分发，不随本包。见[从 nsh.json 覆盖](https://shadcn-nsh.aning.dev/docs/theme#override-from-nshjson)与[字体](https://shadcn-nsh.aning.dev/docs/theme#fonts)。

## 一套以上主题

应用**构建时**只有一套主题 —— `init --theme <name>` 写出 `theme.json` 与 `lib/ui/semantics.json` 并让 `nsh.json` 指向它们 —— 但可以**带**更多套：`shadcn-nsh add theme-<name>` 把另一套装进 `themes/<name>/`，不碰构建时的那套。每套是一个 `AppTheme` 模块：

```ts
// themes/shadcn/index.ts，`add theme-shadcn` 复制进应用的内容
export const shadcn: AppTheme = {
  id: "shadcn",
  label: "shadcn neutral",
  theme, // theme.json
  semantics, // semantics.json
};
```

`selectTheme(theme)` 让运行中的应用切到它：先 token（`nsh` 的 `setTheme`，颜色、圆角、字体、焦点环与 `nsh/base` 都跟着走），再换语义层 —— 渐变与阴影不属于任何 token，经 `finish` 的 getter 读，`state["press-scale"]`（经 `press.scale` 读）也在这一层：它说按下时缩到几成（`1` 就是不缩，shadcn 的样子）。屏幕上每个组件在下一帧带着两者重绘；亮 / 暗 / 系统仍由应用决定，与主题无关，作用于当前这套。`selectTheme(null)` 回到构建时主题。`setTheme` 不接受的坏主题（NSH 读不懂的颜色）抛 `TypeError`，两者都保持原样。

`currentTheme()` 是当前这套的 `id`，还在构建时主题上时为 `null`（运行时读不到 `nsh-ui.json`）。读它是响应式的，所以列表能标出当前选中的一项。

**构建时主题就是列表里的 `null`。** 这份清单由应用自己写；CLI 不生成清单，也不存取持久化：

```ts
// themes.ts —— 应用自己的文件。
import { Storage } from "nsh";

import { selectTheme, type AppTheme } from "./lib/ui/theme";
import { shadcn } from "./themes/shadcn";

/** 每个 `shadcn-nsh add theme-<name>` 一项：构建时主题不在里面。 */
export const themes: AppTheme[] = [shadcn];

/** 启动时：用户上次选的那套；`null`（或没存过）就是构建时主题。 */
export async function restoreTheme() {
  const id = await Storage.getItem("theme");
  selectTheme(themes.find((theme) => theme.id === id) ?? null);
}

/** 选中时：切过去，再记住是哪一套。 */
export async function chooseTheme(theme: AppTheme | null) {
  selectTheme(theme);
  if (theme === null) await Storage.removeItem("theme");
  else await Storage.setItem("theme", theme.id);
}
```

**本库这套主题也是其中一员。** 构建时用别的主题的应用（`init --theme shadcn`）可以用 `shadcn-nsh add theme-default` 把构建时那套装在旁边：`themes/default/` 里就是应用"本来会构建成"的那份 `theme.json` 与 `semantics.json`，外加导出 `defaultTheme` 的 `index.ts`。两项都列进清单就能来回切；`selectTheme(null)` 仍是"回到这个应用构建时的那套"，不管是哪一套。

约定见 [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)，工具链与基线见 [`docs/toolchain.md`](../../docs/toolchain.md)。

```sh
bun run test:unit   # oklch 往返、主题契约，以及其它单测
```

换肤时成对替换 `theme.json` 与 `semantics.json`，保留上游声明的键，finish 才能解析。要给应用多一套主题，把一个 `themes/<name>/` 目录原样放进本包（两个 JSON 与命名它的 `index.ts`），并在 `registry.json` 里加一个 `theme-<name>` 项 —— `themes/default/` 对应的就是 `theme-default`。
