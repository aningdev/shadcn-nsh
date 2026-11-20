# shadcn-nsh showcase

NSH's official Gallery (`references/nsh/examples/gallery`), rebuilt with this library's components:
the shell — a desktop sidebar of demos grouped by purpose, a phone index that pushes demos on a nav
stack, a search field, in-app palette and appearance switching — and the Gallery's Elements demos,
one batch at a time. See [#78](https://github.com/aningdev/shadcn-nsh/issues/78).

- `App.tsx` — the shell. `theme.ts` — the palette and appearance, chosen live and kept in the
  app's storage. `kit.tsx` — the layout every demo draws through.
- `groups/<group>.ts` — the index, one file per purpose group (Actions, Inputs, Navigation,
  Overlays, Data, Documents and workspaces), so a later batch touches its group file alone.
- `demos/` — one file per demo, plus `demos/README.md` for the conventions a demo follows.
- `tests/` — the shell's behavior tests (`nsh test apps/showcase`).

Run it with `bun run dev:showcase` (or `nsh run apps/showcase`); the website serves the packaged
app at `/showcase`. Types: `nsh check apps/showcase` (part of `bun run prepare:types`).
