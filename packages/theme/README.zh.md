# @shadcn-nsh/theme

[English](./README.md)

copy-into-app 层的品牌外观：本库所有，起点是上游 gallery UI 主题。**颜色一律 `oklch()`** —— token、渐变的每一站、阴影里的颜色 —— 透明度写成 `oklch(… / a)`。NSH 在颜色是字符串的地方都认 `oklch()`（`references/nsh/website/docs/styling.md#colors`），所以一个文件里只有一种颜色形式，读一个值就是读它的亮度与色相。

| 文件             | 作用                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `theme.json`     | 颜色、圆角、cssVars                                                                                                          |
| `finishes.json`  | 表面 finish：渐变、阴影，以及按下缩多少                                                                                      |
| `theme.ts`       | `colors` / `finish` / `focusRing` / `selectTheme` / `fillStyle` 等读取器                                                     |
| `themes/<name>/` | 其它主题，各一个 `AppTheme`：`shadcn/`（shadcn 的 `neutral`）、`solid-glass/`（Solid Glass）、`default/`（本库这套，供多装） |

## 规范

主题由三样东西组成：**token**（有名字的颜色、数或字体家族，`theme.json` 写）、**finish**（组件自己画的表面 —— 底、渐变、边、影、模糊，`finishes.json` 写）、**alias**（写成另一个 token 的 token，`var(--x)`）。有哪些 token、每个 finish 画什么、谁读它，以 [`docs/specs/theme-roles.md`](../../docs/specs/theme-roles.md) 为准；`bun scripts/theme-lint.ts` 拿这两个文件对着它检查。

由 [`@shadcn-nsh/ui`](../ui) 使用，并以 registry 的 `theme` 项（应用的**构建时主题**）与 `theme-<name>` 项（其它主题）分发。改完后：`bun scripts/theme/to-oklch.ts`（把这两个文件的颜色写成规范形式），再 `bun run registry:build` 并提交 `public/r`。

这两个文件已归本库所有（[`port-map.json`](../../port-map.json) 里的 `"owned"`）：`port:vendor` 不再重填、`port:check` 不再与上游比对，所以像其它源码一样在这里改（[`docs/port.md`](../../docs/port.md#主题文件)）。外观仍以上游 gallery UI 主题为准；变的是数据归谁。

`themes/shadcn/{theme,finishes}.json` 是生成物 —— `bun scripts/theme/generate-shadcn.ts` —— 取自 shadcn 自己的 `oklch()` 调色板；`themes/solid-glass/` 同样是生成物 —— `bun scripts/theme/generate-solid-glass.ts`，取自 deeplethe/solid-glass 的样式表（[`NOTICE`](../../NOTICE)）—— 都不手改；旁边的 `index.ts` 是手写的一次性声明，给这套主题一个名字。`themes/default/` 是例外：它的两个 JSON 是上面那两个文件的副本（逐字节相同，`scripts/theme/themes.test.ts` 会查），因为构建时主题本身也能当"多装的一套"，而 registry 条目分发的是文件，不是本包里的一个路径。默认的两个文件由 `bun scripts/theme/to-oklch.ts` 同样转换与规范化：它们都是幂等的，文件的颜色形式就是它自己的形式。

数值按固定精度写（L、C 五位小数，H 三位，alpha 三位），这是换算无损的原因：每个 sRGB 颜色都能落回自己的 8-bit 通道，所以主题改存 `oklch()` 不动一个像素。

## 覆盖

应用经 `nsh.json` 的 `"theme"` 定外观 —— 就是上面这些 token，用在哪读到哪，所以 `setTheme` 与应用带着的每一套主题都落在同一处 —— 而不是 `"tailwind"`：后者在构建时只决定应用自己的 class 字符串，那里写了同名颜色就会盖过同名的 token 类，且不随主题变。字体也是 token（`font-sans`、`font-mono`），它写的家族随应用分发，不随本包。见[从 nsh.json 覆盖](https://shadcn-nsh.aning.dev/docs/theme#override-from-nshjson)与[字体](https://shadcn-nsh.aning.dev/docs/theme#fonts)。

## 一套以上主题

应用**构建时**只有一套主题 —— `init --theme <name>` 写出 `theme.json` 与 `lib/finishes.json` 并让 `nsh.json` 指向它们 —— 但可以**带**更多套：`shadcn-nsh add theme-<name>` 把另一套装进 `themes/<name>/`，不碰构建时的那套。每套是一个 `AppTheme` 模块：

```ts
// themes/shadcn/index.ts，`add theme-shadcn` 复制进应用的内容
export const shadcn: AppTheme = {
  id: "shadcn",
  label: "shadcn neutral",
  theme, // theme.json
  finishes, // finishes.json
};
```

`selectTheme(theme)` 让运行中的应用切到它：先 token（`nsh` 的 `setTheme`，颜色、圆角、焦点环与 `nsh/base` 都跟着走），再换 finish —— 渐变与阴影不属于任何 token，经 `finish` 的 getter 读，`press.scale` 也在这一层：它说按下时缩到几成（`1` 就是不缩，shadcn 的样子）。屏幕上每个组件在下一帧带着两者重绘；亮 / 暗 / 系统仍由应用决定，与主题无关，作用于当前这套。`selectTheme(null)` 回到构建时主题。`setTheme` 不接受的坏主题（NSH 读不懂的颜色）抛 `TypeError`，两者都保持原样。

`currentTheme()` 是当前这套的 `id`，还在构建时主题上时为 `null`（运行时读不到 `nsh-ui.json`）。读它是响应式的，所以列表能标出当前选中的一项。

**构建时主题就是列表里的 `null`。** 这份清单由应用自己写；CLI 不生成清单，也不存取持久化：

```ts
// themes.ts —— 应用自己的文件。
import { Storage } from "nsh";

import { selectTheme, type AppTheme } from "./lib/theme";
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

**本库这套主题也是其中一员。** 构建时用别的主题的应用（`init --theme shadcn`）可以用 `shadcn-nsh add theme-default` 把构建时那套装在旁边：`themes/default/` 里就是应用"本来会构建成"的那份 `theme.json` 与 `finishes.json`，外加导出 `defaultTheme` 的 `index.ts`。两项都列进清单就能来回切；`selectTheme(null)` 仍是"回到这个应用构建时的那套"，不管是哪一套。

约定见 [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)，工具链与基线见 [`docs/toolchain.md`](../../docs/toolchain.md)。

```sh
bun run test:unit   # oklch 往返、主题契约，以及其它单测
```

换肤时成对替换 `theme.json` 与 `finishes.json`，保留上游声明的键，finish 才能解析。要给应用多一套主题，把一个 `themes/<name>/` 目录原样放进本包（两个 JSON 与命名它的 `index.ts`），并在 `registry.json` 里加一个 `theme-<name>` 项 —— `themes/default/` 对应的就是 `theme-default`。
