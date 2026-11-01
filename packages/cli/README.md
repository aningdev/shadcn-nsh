# shadcn-nsh

CLI for adding styled NSH components (copy-into-app) from the shadcn-nsh registry.

```sh
bunx shadcn-nsh@latest create my-app
bunx shadcn-nsh@latest init -c apps/web
bunx shadcn-nsh@latest add button
```

Default registry: `https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json`.

## Develop in this monorepo

```sh
bun run shadcn-nsh -- --help
bun run cli:build
```
