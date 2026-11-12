# Gallery

Native verification for the ported components: the behavior tests in [`tests/`](./tests) and the smoke page in [`App.tsx`](./App.tsx). It runs the same `packages/ui` components the docs site documents.

**Not** here: the public docs (`apps/docs`), the page previews (`apps/docs/demos`), or a copy of the upstream gallery's chrome. Behavior and accessibility still belong to `nsh` / `nsh/base`; this app proves the port.

## Runs

```sh
bun run dev:gallery     # the smoke page
bun run check:gallery   # nsh check apps/gallery
bun run test:gallery    # nsh test apps/gallery
```

## What a family adds

1. A component in `packages/ui` with its registry item (`bun run port:new` scaffolds both).
2. `tests/<family>.fixture.tsx` — the case, mounted.
3. `tests/<family>.test.tsx` — presses, keys, values, disabled states and the look the fixture reports.
4. A section in `App.tsx` when the family should be on the smoke page.

Tests drive native events and read native state; they do not compare screenshots. The pixel comparison is `bun run port:render` in `apps/docs/demos` (pointer, light and dark) and `bun run port:render:touch` (iOS). Coverage status, including what is still `pending`, is `bun run port:check --status`.
