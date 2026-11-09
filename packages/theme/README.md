# @shadcn-nsh/theme

[中文](./README.zh.md)

Design-token source for shadcn-nsh. **`theme.json`** (wired via `nsh.json` `theme`) is the truth; [`theme.ts`](./theme.ts) only exposes `token()` helpers (`colors`, `radius`, …) for styled wrappers.

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as the registry `theme` item (`theme.json` + `lib/theme.ts`). After edits, run `bun run registry:build` from the repo root and commit `public/r`.
