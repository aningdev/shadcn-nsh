# @shadcn-nsh/theme

[中文](./README.zh.md)

Design-token source for shadcn-nsh. **`theme.json`** (wired via `nsh.json` `theme`) is the color/radius truth; [`finishes.json`](./finishes.json) holds light/dark surface depth (`finish.*`); [`theme.ts`](./theme.ts) exposes `token()` helpers (`colors`, `radius`, `finish`, `pressSink`, …) for styled wrappers.

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as the registry `theme` item (`theme.json` + `lib/finishes.json` + `lib/theme.ts`). After edits, run `bun run registry:build` from the repo root and commit `public/r`.
