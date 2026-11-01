# shadcn-nsh

从 shadcn-nsh registry 向应用复制 styled NSH 组件的 CLI。

```sh
bunx shadcn-nsh@latest create my-app
bunx shadcn-nsh@latest init -c apps/web
bunx shadcn-nsh@latest add button
```

默认 registry：`https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`。

## 本仓开发

```sh
bun run shadcn-nsh -- --help
bun run cli:build
```
