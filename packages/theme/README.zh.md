# @shadcn-nsh/theme

[English](./README.md)

copy-into-app 层的品牌外观。真源是上游 gallery UI 主题，本包原样保存：

| 文件            | 作用                         |
| --------------- | ---------------------------- |
| `theme.json`    | 颜色、圆角、cssVars          |
| `finishes.json` | 表面 finish                  |
| `theme.ts`      | `colors` / `finish` 等读取器 |

由 [`@shadcn-nsh/ui`](../ui) 使用，并以 registry 的 `theme` 项分发。改完后视情况 `port:vendor`，再 `bun run registry:build` 并提交 `public/r`。

换肤时成对替换 `theme.json` 与 `finishes.json`，保留上游声明的键。
