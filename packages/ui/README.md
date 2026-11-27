# @shadcn-nsh/ui

Copy-into-app 的样式组件。行为与无障碍在 [`nsh/base`](https://nsh.dev/elements)；外观从 [`@shadcn-nsh/theme`](../theme) 读，组件代码不写颜色字面量。一个文件一个组件：私有 Look 加外壳。起源于上游的文件在文件头一行致谢。

`lib/` 是没有所属控件的共享部分，现为 9 个模块：`utils.tsx`、`state.ts`、`motion.tsx`、`surface.tsx`、`field-look.ts`、`choice.tsx`、`icons.tsx`、`popup.tsx`、`listbox.tsx`。只被一个控件用的收回该控件。

写法见 [`docs/component-authoring.md`](../../docs/component-authoring.md)。目录、P1–P9 与词汇见 [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md)。流程与检查见 [`docs/port.md`](../../docs/port.md)。

```sh
bun run port:new <id> …
bun run port:check
nsh check apps/website/demos
bun run registry:build
```

装进应用：`npx shadcn-nsh@latest add <id>`。
