# NSH monorepo starter

Consumer layout for [shadcn-nsh](https://github.com/aningdev/shadcn-nsh): NSH app in `apps/web`, styled UI in `packages/ui` (copy-into-app).

```sh
bun install
bun run check
bun run dev
```

Add components (from the monorepo root or `apps/web`):

```sh
shadcn-nsh add button -c apps/web
```

Files land in `packages/ui`. App imports: `@workspace/ui/components/ui/button`.
