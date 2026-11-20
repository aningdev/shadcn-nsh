# A demo of the showcase

One file per demo, named after the component in kebab case: `button.tsx`, `switch.tsx`, later
`data-table.tsx`. Each demo is the official gallery's scene — the one
`references/nsh/examples/gallery/demos/…` draws — rebuilt with this library's parts, never with
upstream's `nsh-gallery-ui`, and never with a color of its own.

The conventions:

- **Export**: a `DemoEntry`'s `screen` is a `() => JSX.Element`; a built demo exports its component
  (`ButtonDemo`) and its group file lists it with `lazy(() => import("./button").then((m) => m.ButtonDemo))`.
- **Registration**: the entry lives in exactly one `groups/<group>.ts` (the component's purpose
  group: Actions, Inputs, Navigation, Overlays, Data, or Documents and workspaces), with the
  official gallery's `name` and one-line `detail`, and a lucide `icon`. A demo not built yet points
  at the shared placeholder instead (`notBuilt({ name, detail })` in `groups/entry.tsx`) — building
  it is replacing that entry's `screen` with a `lazy` import, nothing else.
- **Layout**: draw through `../kit` (`DemoPage`, `DemoCard`, `DemoRow`/`DemoSection`, `Caption`),
  so the scenes differ only in what they show. The page scrolls; it fits a 320-point phone.
- **Colors**: only from the theme — `colors`, `finish`, `radius`, `rounded` of
  `@shadcn-nsh/theme`. A color literal never appears here; the app's palette and appearance
  switching should redraw the whole scene with nothing else changed.
- **Shared parts**: a group's demos share one `demos/<group>-shared.tsx` (a card with a trailing
  slot, a result line, a caption with a note) instead of each redrawing it; `actions-shared.tsx`
  and `platform-shared.tsx` are the precedent.
- **Components**: from `packages/ui` (`@/packages/ui/…`), as an app installs them; `nsh/base`
  only through those shells. Sounds and the docs demos' adapter layer (`Stage`, `Split`,
  `Inspector`, `Log`) stay out.
