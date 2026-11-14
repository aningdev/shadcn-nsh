# @shadcn-nsh/theme

[English](./README.md)

copy-into-app 层的品牌外观：本库所有，起点是上游 gallery UI 主题。**颜色一律 `oklch()`** —— token、渐变的每一站、阴影里的颜色 —— 透明度写成 `oklch(… / a)`。NSH 在颜色是字符串的地方都认 `oklch()`（`references/nsh/website/docs/styling.md#colors`），所以一个文件里只有一种颜色形式，读一个值就是读它的亮度与色相。

| 文件             | 作用                                                        |
| ---------------- | ----------------------------------------------------------- |
| `theme.json`     | 颜色、圆角、cssVars                                         |
| `finishes.json`  | 表面 finish：渐变与阴影                                     |
| `theme.ts`       | `colors` / `finish` / `focusRing` 等读取器                  |
| `themes/<name>/` | 备选主题，脚本生成；`themes/shadcn/` 是 shadcn 的 `neutral` |

由 [`@shadcn-nsh/ui`](../ui) 使用，并以 registry 的 `theme` 项分发。改完后：`bun scripts/theme/to-oklch.ts`（把这两个文件的颜色写成规范形式），再 `bun run registry:build` 并提交 `public/r`。

这两个文件已归本库所有（[`port-map.json`](../../port-map.json) 里的 `"owned"`）：`port:vendor` 不再重填、`port:check` 不再与上游比对，所以像其它源码一样在这里改（[`docs/port.md`](../../docs/port.md#主题文件)）。外观仍以上游 gallery UI 主题为准；变的是数据归谁。

`themes/shadcn/` 是生成物 —— `bun scripts/theme/generate-shadcn.ts` —— 取自 shadcn 自己的 `oklch()` 调色板，不手改。默认的两个文件由 `bun scripts/theme/to-oklch.ts` 同样转换与规范化：两者都是幂等的，文件的颜色形式就是它自己的形式。

数值按固定精度写（L、C 五位小数，H 三位，alpha 三位），这是换算无损的原因：每个 sRGB 颜色都能落回自己的 8-bit 通道，所以主题改存 `oklch()` 不动一个像素。

约定见 [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)，工具链与基线见 [`docs/toolchain.md`](../../docs/toolchain.md)。

```sh
bun run test:unit   # oklch 往返、主题契约，以及其它单测
```

换肤时成对替换 `theme.json` 与 `finishes.json`，保留上游声明的键，finish 才能解析。
