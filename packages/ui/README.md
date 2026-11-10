# @shadcn-nsh/ui

[中文](./README.zh.md)

Styled copy-into-app layer on top of [`nsh/base`](https://nsh.dev/elements): behavior and a11y stay in base; this package adds brand look via [`theme.json` / `token()`](../theme) helpers and ships registry items for `shadcn-nsh add`.

- Theme: [`@shadcn-nsh/theme`](../theme)
- Native demos: [`apps/gallery`](../../apps/gallery)
- Docs site: [`apps/docs`](../../apps/docs)

Authoritative base inventory and API shapes: [`references/nsh/website/elements`](../../references/nsh/website/elements) (`group: base`) and live demos `website/demos/el-*.tsx`. Primitives (`group: primitives`: `View`, `Text`, `Scroll`, …) live in `nsh` and are **not** registry items here.

## Layers

| Layer        | Home             | Role                                                      |
| ------------ | ---------------- | --------------------------------------------------------- |
| Primitives   | `nsh`            | Layout / draw / host                                      |
| Base         | `nsh/base`       | Unstyled controls (press, focus, a11y, value)             |
| This package | `@shadcn-nsh/ui` | Styled wrappers + registry for `shadcn-nsh add`           |
| Extensions   | —                | **Out of scope** (shadcn-only pieces with no base export) |

## Toolchain

This repo develops and deploys against the **published store CLI** (`curl …/install.sh | sh`, currently **0.4.0** / commit `e626a8d`). Phase-1 wraps `nsh/base` exports that release registers.

## Phase-1 status (store `nsh` 0.4.0 ∩ core parity)

| website                                                               | `nsh/base`              | registry       | shadcn         | Status |
| --------------------------------------------------------------------- | ----------------------- | -------------- | -------------- | ------ |
| [button](../../references/nsh/website/elements/button.md)             | `Button`                | `button`       | `button`       | done   |
| [input](../../references/nsh/website/elements/input.md)               | `Input`                 | `input`        | `input`        | done   |
| [checkbox](../../references/nsh/website/elements/checkbox.md)         | `Checkbox`              | `checkbox`     | `checkbox`     | done   |
| [radio](../../references/nsh/website/elements/radio.md)               | `RadioGroup`, `Radio`   | `radio-group`  | `radio-group`  | done   |
| [switch](../../references/nsh/website/elements/switch.md)             | `Switch`                | `switch`       | `switch`       | done   |
| [progress](../../references/nsh/website/elements/progress.md)         | `Progress`              | `progress`     | `progress`     | done   |
| [tabs](../../references/nsh/website/elements/tabs.md)                 | `Tabs`, `Tab`           | `tabs`         | `tabs`         | done   |
| [popover](../../references/nsh/website/elements/popover.md)           | `Popover`               | `popover`      | `popover`      | done   |
| [tooltip](../../references/nsh/website/elements/tooltip.md)           | `Tooltip`               | `tooltip`      | `tooltip`      | done   |
| [sheet](../../references/nsh/website/elements/sheet.md)               | `Sheet`                 | `sheet`        | `sheet`        | done   |
| [dialog](../../references/nsh/website/elements/dialog.md)             | `Dialog`                | `dialog`       | `dialog`       | done   |
| [menu](../../references/nsh/website/elements/menu.md)                 | `Menu`, …               | `menu`         | `menu`         | done   |
| [menu](../../references/nsh/website/elements/menu.md)                 | `ContextMenu`, …        | `context-menu` | `context-menu` | done   |
| [collapsible](../../references/nsh/website/elements/collapsible.md)   | `Collapsible`           | `collapsible`  | `collapsible`  | done   |
| [toast](../../references/nsh/website/elements/toast.md)               | `Toast`, `ToastStack`   | `toast`        | sonner / toast | done   |
| [table](../../references/nsh/website/elements/table.md)               | `Table*`                | `table`        | `table`        | done   |
| [accordion](../../references/nsh/website/elements/accordion.md)       | `Accordion*`            | `accordion`    | `accordion`    | done   |
| [avatar](../../references/nsh/website/elements/avatar.md)             | `Avatar`, `AvatarGroup` | `avatar`       | `avatar`       | done   |
| [combobox](../../references/nsh/website/elements/combobox.md)         | `Combobox`              | `combobox`     | `combobox`     | done   |
| [link](../../references/nsh/website/elements/link.md)                 | `Link`                  | `link`         | `link`         | done   |
| [number-input](../../references/nsh/website/elements/number-input.md) | `NumberInput`           | `number-input` | `number-input` | done   |
| [otp-input](../../references/nsh/website/elements/otp-input.md)       | `OtpInput`              | `otp-input`    | `otp-input`    | done   |
| [pagination](../../references/nsh/website/elements/pagination.md)     | `Pagination`            | `pagination`   | `pagination`   | done   |
| [select](../../references/nsh/website/elements/select.md)             | `Select`                | `select`       | `select`       | done   |
| [slider](../../references/nsh/website/elements/slider.md)             | `Slider`                | `slider`       | `slider`       | done   |
| [toggle](../../references/nsh/website/elements/toggle.md)             | `Toggle`                | `toggle`       | `toggle`       | done   |
| [toggle](../../references/nsh/website/elements/toggle.md)             | `ToggleGroup`           | `toggle-group` | `toggle-group` | done   |

Also: registry `theme` (`theme.json` + `lib/theme.ts` + surface/motion helpers) and `open-state` (composition plumbing).

## Not in Phase-1 (still base / documented on main)

| Kind           | website / base                                                | Reason                    |
| -------------- | ------------------------------------------------------------- | ------------------------- |
| Dates / color  | Calendar, TimeField, DatePicker, ColorPicker                  | Phase-2                   |
| Layout         | Resizable, Scrollbar, Toolbar                                 | Phase-1.5 / later         |
| Shell / system | NavStack, AlertDialog                                         | App shell / native alerts |
| Heavy          | Editor, RichEditor, DiffView, TextView, DataTable, Dock, Plot | Separate milestones       |

## Extensions (intentionally not built)

shadcn has these; **no** matching `nsh/base` / website `group: base` export → we do **not** add them as registry UI:

`badge`, `card`, `label`, `separator`, `hover-card`, `skeleton`, `aspect-ratio`, …

Compose labels with `Text` + controls; separators with `View` borders if needed.

## Compound naming (nsh + composition roles)

Public names follow `nsh/base` symbols (`MenuTrigger`, not `DropdownMenuTrigger`). Composition roles are Trigger / Content / Item; roots hold open state only (**composition-only** — no consumer `trigger` on roots). Internals still wire `nsh/base` `trigger` on Content mounts.

| nsh / public family             | This package                                                                                                                           | `nsh/base` under the hood                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Dialog / Trigger / Content / …  | `Dialog` / `DialogTrigger` / `DialogContent` / Header / Title / Description / Footer / Close; full base prop + style-hook pass-through | single `Dialog`; Content owns the base root  |
| Sheet / Trigger / Content / …   | same pattern; full base prop + style-hook pass-through                                                                                 | single `Sheet`; Content owns the base root   |
| Menu\*                          | composition-only; Group / Label / Shortcut; full base pass-through on Content / Item / Sub                                             | `Menu` / `MenuItem` / `Submenu`              |
| ContextMenu\*                   | composition-only; Item/Sub/… re-export Menu parts                                                                                      | `ContextMenu`                                |
| Popover / Trigger / Content     | composition-only; Header / Title / Description; full base pass-through                                                                 | `Popover`                                    |
| Tooltip / Trigger / Content     | composition-only; standalone `TooltipContent` for host `tooltip={}`; Provider delay                                                    | `Tooltip` bubble                             |
| Tabs / List / Trigger / Content | `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (+ direct `Tab` export)                                                            | `Tabs` + `Tab`; panels are app/`TabsContent` |
| Collapsible / Trigger / Content | composition-only; optional base `reveal` on Content                                                                                    | `Collapsible`                                |
| Select / Trigger / Content      | composition-only; items register into base list                                                                                        | `Select`                                     |
| Combobox / Trigger / Content    | composition-only; multi-value                                                                                                          | `Combobox`                                   |
| Accordion / Item / Trigger      | composition-only (`AccordionPanel`)                                                                                                    | `Accordion*`                                 |
| Toast / sonner                  | `toast()` + `Toaster` (+ `Toast` / `ToastStack` / `ToastManager`); full base prop pass-through                                         | same                                         |
| Table\*                         | `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` / …                                                     | same                                         |
| RadioGroup / Item               | `RadioGroup` / `RadioGroupItem` (+ `Radio` alias)                                                                                      | `RadioGroup` + `Radio`                       |

## Source and sync

The look and state design of these components come from NSH's own shared UI layer, `references/nsh/examples/nsh-gallery-ui` (upstream calls it an internal layer, not an application API). We port it **per family, once**: take the state design and the geometry, express colours through the shadcn neutral palette (`colors.*`, `finish`, `alpha()`), leave out the Terminal idiom, sounds and the website playground adapters, and give the component a Composition Facade.

- **Baseline:** `64ab8a1d`, the commit pinned in `references/nsh` (`examples/nsh-gallery-ui` last changed in `d96fc35c`, 2026-11-09).
- **Header of an adapted file:** `// Source: examples/nsh-gallery-ui/look/<file> @ 64ab8a1d` and a pointer to `NOTICE`.
- **Store versus main:** this repo develops against the store `nsh` 0.4.0, the reference follows `main`. Type-check against the store's `.nsh/types`; a base capability the store lacks goes in the component's Differences, it is not ported.
- **License:** the adapted parts stay Apache-2.0 (Longbridge); see `NOTICE`.
- **Sync:** manual. When the baseline moves, compare the family's look file with the header's commit, family by family. There is no automatic sync.
- **Plan and order:** [`docs/roadmap.md`](../../docs/roadmap.md).

## Scope rules

| Rule                                                                                                                                                                                | Why                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Registry completeness.** Every `nsh/base` export on the store CLI is in scope; a thin entry still hooks the theme (no bare re-export). Extensions without a base export stay out. | `add` coverage tracks base; no shadcn-only parts.                 |
| **Names follow `nsh/base` symbols** (`Menu` → `menu` / `MenuTrigger`), not shadcn ids (`dropdown-menu`). Old ids are removed with no alias.                                         | One truth; mixed names (`add menu` + `DropdownMenu`) fake parity. |
| **Compounds are composition-only** (`Root` / `Trigger` / `Content` / `Item`). No consumer `trigger` on roots, no legacy dual path.                                                  | Two APIs are two truths.                                          |
| **Behavior stays in `nsh/base`.** Irreducible gaps go in the component's docs under Differences.                                                                                    | We style and compose; we do not re-implement.                     |
| **Look comes from [`@shadcn-nsh/theme`](../theme)**, motion follows nsh Animation and lives in each component (below).                                                              | One brand source; no second motion system.                        |

## Component package

A component is not only a source file. The unit that ships, and changes together, is six artifacts (`<id>` is the kebab-case `nsh/base` symbol):

| #   | Artifact       | Home                                          | Contract                                                                                                                                                                                                                                 |
| --- | -------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Source         | `packages/ui/<id>.tsx`                        | One file per family. Satisfies the shared rules and the Leaf or Family recipe. Internal order below.                                                                                                                                     |
| 2   | Registry item  | `registry.json`                               | `name` = `<id>`; `registryDependencies` equals the actual imports (`registry:build` enforces it); `theme` is its own item, never inlined; `target: components/ui/<id>.tsx`.                                                              |
| 3   | Public surface | `packages/ui/index.ts`                        | Exports components, `xVariants()` helpers and props types only. `lib/*` stays internal.                                                                                                                                                  |
| 4   | Docs page      | `apps/docs/src/pages/docs/components/<id>.md` | Fixed sections: Install, Usage, Composition (parts table), API, Differences (against shadcn and against `nsh/base`), Accessibility. Docs show a web sketch only; the demo of record is the gallery.                                      |
| 5   | Verification   | `apps/gallery` + `apps/gallery/tests`         | A native gallery demo. A Leaf has a reactive test (a prop changed after mount is followed); a Family has a behavior test (open, close, keyboard activation). A control with reduced-motion behavior tests it with `reducedMotion: true`. |
| 6   | Built output   | `public/r/<id>.json`                          | Generated by `bun run registry:build` from 1 and 2, committed in the same commit. Run `vp fmt public/r` after hand edits.                                                                                                                |

After copy the code belongs to the app (copy, then own). Registry items carry no version and nothing updates itself; `add --overwrite` replaces files. A breaking change is recorded in the component's Differences.

**Adding a new component:** first confirm the export exists on the **store** CLI's `nsh/base` (not only on `references/nsh` main). Then produce the six artifacts above, add `theme` to `registryDependencies`, and update the status column of the Phase-1 table.

## Recipes

A Recipe is a rule set a component must satisfy. It constrains structure and dependencies, not look: look lives in the theme, motion in each component, behavior in `nsh/base`.

### Shared rules

| #      | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Why                                                                                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **R1** | **Self-contained first.** A component imports `theme`, `nsh`, `nsh/base`, and at most the exceptions in R2. A shared helper is added only when behavior must match across several files; eight duplicated lines do not qualify.                                                                                                                                                                                                                                                                                                                                                                                                                     | Every import is a registry dependency the app must install.                                                                  |
| **R2** | **Allowed horizontal imports:** `button` as the primitive layer; same-family reuse with re-export (`context-menu` → `menu`, `toggle-group` → `toggle`). Anything else needs an entry here.                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Keeps the dependency graph shallow.                                                                                          |
| **R3** | **Do not destructure props.** Read `props.x` where it is used, pass the rest on with `split(props, keys)`, write defaults in JSX (`props.x ?? d`), derive values with `computed`. A style bundle that depends on props is computed once, not per call site.                                                                                                                                                                                                                                                                                                                                                                                         | A destructured prop is read once and does not follow changes (nsh `jsx-and-components`).                                     |
| **R4** | **Merge only against a default.** A consumer value is passed through as is. `[default, consumer]` is written only where the wrapper has a default; `mergeClass(undefined, x)` and `mergeStyle(undefined, x)` are forbidden. No shared merge helper: `theme` does not grow non-token utilities and `lib/` does not either.                                                                                                                                                                                                                                                                                                                           | An identity call is noise; a shared helper is a registry dependency for a few lines.                                         |
| **R5** | **Theme for look, minimums for geometry.** Colors, radius, shadow, focus ring and the disabled look come from `theme` only. Everything else (geometry, type sizes, variant opacities, motion) is literals gathered in one `look` function at the top of the file, written as `minHeight` / `minWidth` plus padding, not fixed `height` / `width`. A deliberately fixed geometry (a square icon button) says why in a comment. Layout literals that carry no look (`borderWidth: 1`, `"transparent"` for a layout-stable border) are allowed in `look`, with a comment. A duration or curve outside the motion whitelist (below) is never a literal. | NSH: control frames grow with their labels and the user's text size; there is no spacing token (the theme stays restrained). |
| **R6** | **Public surface.** `xVariants()` helpers and component types are public. `lib/*` is internal and may change signature between releases.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | An app that copied `lib/*` must not be broken by a rename.                                                                   |
| **R7** | **Every exported prop, type and `xVariants` option has a doc comment.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | nsh Public API design.                                                                                                       |
| **R8** | **Variant and size values follow shadcn names.** A new value is recorded in the component's Differences with the reason.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | shadcn parity is a product goal; nsh's "few variants" targets one-off screens.                                               |

### Leaf recipe (template: `button`)

A single-part component over one `nsh/base` control.

- **Must:** props type is `Omit<BaseProps, "children"> & { variant axes; children?: string | JSX.Element }`. A pure `xVariants(options)` returns `style`, `label`, each state style (`hover` / `active` / `selected` / `disabled`) and `hitSlop`. State styles use the typed names `nsh/base` exposes (`checkedStyle`, `indeterminateStyle`, …); each is `[default, consumer]` with the consumer winning. Parts other than the main one pass through `<part>Class` / `<part>Style`. Focus ring, accessible label from string children (unless `nsh/base` already derives it) and touch `hitSlop` come by default. An unknown variant falls back to `default`.
- **Must not:** reimplement base behavior; import another leaf (except `button`, R2); destructure props (R3).
- **May differ:** variant axes, label rendering, size literals.

### Family recipe (template: `popover`)

A Composition Facade over a compound `nsh/base` control (`Root` / `Trigger` / `Content` / `Item` and decorations). Multi-part controls that do not pop up (`tabs`, `accordion`, `collapsible`, `table`, `toast`, `pagination`) use it too; the popup clauses below do not apply to them.

- **Root** owns only `createOpenState` and, where base has a `trigger` prop, a `createSlot`; lifecycle callbacks go into context; it renders the Provider and children and does not carry `Content` props. The context hook throws `"X parts must be used within <X>"`.
- **Trigger** fills the slot and returns a placeholder (or renders directly when base has no `trigger` prop). Both branches pass `disabled`, `class` and `style` through. A string child renders `Button`; a non-string child is focusable, keyboard-activatable and carries a role.
- **Content** omits what Root owns, uses `popupSurface()` (popups) or `modalSurface()` (modals) with `overlayMotion(kind)` where the theme defines one, and applies defaults only while the consumer's hook is `undefined`.
- **Item** adapts the base item, with focus ring, and passes state styles through unless it has a default.
- **Decorations** (`Title`, `Description`, `Label`, `Shortcut`, `Header`, `Footer`) are text parts: a string child renders a themed `Text`, anything else renders as given.
- **Must not:** import another family (R2); invent a per-part disabled look; add a helper that hides the Root / Trigger / Content skeleton, because its differences (reason type, Sub parts, content slots) are where bugs sit.
- **May differ:** popup kind, presence of a slot or items, motion kind.

Decisions that came with the Family recipe (applied as `dialog` and `sheet` migrate): `modalSurface()` joins `popupSurface()` in `theme` for `Dialog` and `Sheet` (modals differ in radius and padding; no new `overlayMotion` kind, modal motion stays base-owned). `Dialog` and `Sheet` Root no longer carry Content props (`animation`, `presentation`, `closeOnEscape`, `closeOnBackdropPress`, `closeOnSwipe`); they live on `Content`, with no alias. `createTriggerSlot` became `createSlot`.

## File order

Source files read top to bottom in a fixed order, so a reviewer finds the same thing in the same place.

**Leaf**

1. imports
2. public types (props, variant unions; each documented, R7)
3. private constants and helpers (`TOUCH_TARGET`, `touchHitSlop`, the local `mergeStyle` where a default exists)
4. `look()` — every geometry literal, R5
5. `xVariants()` — pure, public
6. the component

**Family**

1. imports
2. types
3. context and its hook
4. chrome / `look` (surfaces, sizes)
5. Root
6. Trigger
7. Content
8. Item (and Sub parts)
9. decorations

## Migration method

One family per commit, in this loop:

1. Write or extend the test first and see it fail (Leaf: reactive; Family: behavior).
2. Bring the source to the recipe, checking the Definition of Done below.
3. Update the docs page (fixed sections), the gallery demo and `index.ts`.
4. `bun run registry:build`, `bun run check`, commit `public/r` with the source.
5. Remove the component from the allowlist (when the check script exists).
6. The commit message says which rules it brought into line.

Order of the rest: `toggle` + `toggle-group` → `switch`, `checkbox`, `radio-group` → `input`, `number-input`, `otp-input`, `slider`, `progress`, `avatar`, `link` → `dialog` + `sheet` → `select` + `combobox` → `collapsible`, `accordion`, `tabs`, `table`, `pagination`, `toast`. A scaffold skill is written after the Leaf groups are migrated, so it encodes what worked.

### Definition of Done

- [ ] R1–R8 hold; Leaf or Family recipe holds
- [ ] file order followed
- [ ] docs page has all fixed sections, Differences filled
- [ ] gallery demo exists and was checked in light and dark
- [ ] test exists (reactive or behavior; reduced motion where the control has it)
- [ ] `public/r/<id>.json` rebuilt and committed

### Checks

Today: `registry:build` enforces `registryDependencies`, `bun run test:unit` covers the CLI's import rewriting, the `theme.json` merge and the theme file's contract (official keys, `custom-` prefix, oklch), and `bun run test:gallery` covers the components and the theme helpers; the review greps are `mergeClass(undefined` / `mergeStyle(undefined`, `const {` over `props`, and literal durations outside the theme whitelist.

The colour guard (`packages/cli/src/ui-guards.test.ts`, part of `test:unit`) fails on a colour literal in `packages/ui/*.tsx` or `packages/theme/theme.ts` (hex, `rgb(`, `rgba(`, `hsl(`, `oklch(`, a named colour; `"transparent"` is allowed, R5). `scripts/recipes-allowlist.json` is the **one** list of components exempt from a rule; it only shrinks, and an entry whose file no longer breaks the rule fails the test. It is empty today.

Planned (not yet built), before the third family: `check:recipes`, wired into `bun run check`, covering the three greps, doc comments (R7), docs sections, and the presence of a demo and a test per component, reading the same allowlist.

## Visual check

A family is not done until its light and dark appearance have been looked at. `apps/gallery/pilot.tsx` is the pilot page (the button and the switch, every kind, size and state); a family gets a page of its own in the gallery.

```sh
bun run shots apps/gallery/pilot.tsx /tmp/shots pilot   # writes pilot-light.png and pilot-dark.png
```

`scripts/shots.sh` runs `nsh test <entry> --target macos` with `app.setColorScheme` and `app.screenshot`; it needs the Screen Recording and Accessibility permissions. Gallery pages share `apps/gallery/demo-kit.tsx` (`Page`, `Panel`, `Row`, `Flow`).

Put the two images in the pull request, next to the reference's same control. The check is by eye; screenshots do not run in CI.

## Migration status of the rules

| Status       | Components                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migrated     | Family recipe: `popover`, `tooltip`, `menu`, `context-menu`. Leaf recipe, ported from the reference look: `button`, `switch`, `toggle`, `toggle-group`, `checkbox`, `radio-group` |
| Not migrated | every other component                                                                                                                                                             |

Shared `lib` modules, each added when a second component needed it (R1): `follow` (switch, checkbox, radio), `press` (button, toggle, the group sink of checkbox and radio), `density` (button, switch, toggle, checkbox, radio).

## Motion in components

Motion is a component concern, not part of the theme: the values come from `nsh`'s own docs and each component writes the few lines it needs, in its `look()` or beside its popup. Nothing here is a token in `theme.json`. Motion that several components must feel the same lives in a `lib` module (`press`, the sink and ease of a pressed control, and `density`, the pointer / touch sizes; both are added when a second component needs them, R1); a few lines used once stay in the component.

**The library adds no motion system.** `nsh` already owns the primitives and documents their values ([Animation](https://nsh.dev/docs/animation), Design Guides "Motion", the element docs). Components (1) pick the `nsh` primitive per scene, (2) use only the values `nsh` already documents, (3) inject per-family defaults, and (4) handle reduced motion as below.

### The Animation toolbox and where we use each tool

All of it runs on the UI thread with no per-frame JS; reach for `requestAnimationFrame` only for what cannot be described ahead of time.

| Tool (Animation doc)                                                          | We use it for                                                                                                                | Reduced motion (nsh)                                                             |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Transitions** (`transitionProperty` & co.)                                  | Control state: hover, pressed, checked, selected, open. Popup enter/exit together with the `starting*` / `ending*` hooks.    | Play as written. **We** choose the calmer alternative (below).                   |
| **Motion** (`createMotion`, `motions.*` presets)                              | Content entrance, staggered lists, validation attention (`shake`), loops. Opt-in only.                                       | Automatic: a motion lands where it ends, without moving. Exits still end hidden. |
| **Layout animations** (`LayoutAnimation`)                                     | A list insert / remove / reorder (`easeInEaseOut`, `spring`). Not for disclosure panels.                                     | Play as written: skip the call when `reduceMotion()`.                            |
| **Animated values**, **Keyframe animations**                                  | Only where a value must follow a gesture or a loop that the presets lack. Never for a state change a transition can express. | Play as written.                                                                 |
| base-owned (`reveal`, `Dialog.animation`, sheet slide, Tabs indicator spring) | Accordion / Collapsible height reveal, modals. Passed through or flipped, never re-wrapped in a second animation.            | Base handles it.                                                                 |

**One primitive per scene.** Mixing mechanisms is how double animation and flicker start.

| Scene                                                                                                   | Primitive                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Control state (hover / pressed / checked / selected / open)                                             | Transitions                                       |
| Popup appears / disappears (`Popover`, `Menu`, `ContextMenu`, `Select`, `Combobox`, `Tooltip`, `Toast`) | `starting*` / `ending*` hooks + transitions       |
| Modal (`Dialog`, `AlertDialog`, `Sheet`)                                                                | base-owned (`animation`, sheet slide)             |
| Height reveal (`Accordion`, `Collapsible`, `Tree`)                                                      | base `reveal`                                     |
| Content entrance, stagger, attention, loop                                                              | `createMotion` / `motions.*` / `Animated.stagger` |
| Layout insert / remove / reorder                                                                        | `LayoutAnimation`                                 |

### Values

- **Whitelist for defaults we ship:** durations `100` / `120` / `150` / `180` / `200` / `300` ms; curves `ease-out` and `cubic-bezier(0.2, 0, 0, 1)`; property groups `transition-colors` / `-opacity` / `-transform` / `transition` (style paths name the properties). `transition-all` only where an element doc writes it. A new value needs an `nsh` source and an entry in Decisions.
- **Presets are `nsh`'s own values** and need no whitelist entry: use `motions.fadeInUp`, `shake`, and so on by name. A custom keyframe set needs a reason in the component's Differences.
- **Class first, style when the part only takes styles.** Popups, toasts and chevrons follow the element docs verbatim through class hooks; controls and parts whose base API is `ViewStyle` only take the equivalent styles. They are the same mechanism.

### Reduced motion

`reduceMotion()` is true when the user asks for less motion. `nsh`: replace large movement with a fade or an instant change.

- **Press.** The press helper in `button.tsx` removes the scale (the movement) and keeps the ≤ 150 ms colour / shadow fade. This is the intended pattern, not a gap.
- **Style transitions** read `reduceMotion()` only where they move something. A colour fade does not need to be zero.
- **Motions** need nothing from us. Pass `ignoreReduceMotion: true` only for a motion that carries meaning the user needs (a progress spinner).
- **Popups and modals** are base-owned: base shows and hides at once; nothing here reads `reduceMotion()`.
- A helper that returns a style is a snapshot. `buttonVariants()` and friends must be called inside a `computed` (or other reactive scope) to follow a change of the setting.

### Control states

- **Hover:** subtle pointer feedback, never the only cue. It changes the fill only and keeps the rest shadow; no movement, no scale.
- **Pressed:** immediate feedback. Every variant dims with `pressed-opacity` plus `scale(0.97)`; a secondary variant also takes `finish.control.pressed`.
- **Press scale** (the helper in `button.tsx`; copy it where a control needs it) is for `Button`, `Toggle` and pressable rows. `Switch`, `Checkbox`, `RadioGroup` and `Input` use `transition-colors` only.
- **Focus:** the outline halo is not in any transition list. `border-color` stays in the transition list, so the edge fades with the hover colour instead of jumping.
- **Transition properties** for a pressable control: `background-color`, `border-color`, `box-shadow`, `opacity` (+ `transform` from `pressTransition`), 150 ms `ease-out`.
- Layout changes do not animate through transitions; use `LayoutAnimation` where a layout change must.

### Defaults are narrow

Only appear / disappear, expand / collapse and press are on by default. Content entrance, validation attention and loops are opt-in, written with `motions.*` (or the gallery's native loop), not new keyframes.

- **Entrance lists:** delay `Math.min(index, 10) * 60` ms, so a row added far down does not wait; use `Animated.stagger` for a group.
- **Removing a row:** `await row.play("fadeOutLeft")`, then `LayoutAnimation.easeInEaseOut()`, then remove.
- **Invalid field:** `shake` (opt-in, never default).

### Popups

| Family / components              | Default (source)                                                                                                                        | Where                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `Popover`                        | 150 ms, from `opacity-0 scale-95` (popover.md)                                                                                          | inline in `popover.tsx`                     |
| `Menu`, `ContextMenu`            | 100 ms, from `opacity-0 -translate-y-1` (menu.md)                                                                                       | inline in `menu.tsx` and `context-menu.tsx` |
| `Tooltip`                        | 100 ms fade (tooltip.md)                                                                                                                | inline in `tooltip.tsx`                     |
| `Toast`                          | 200 ms, `opacity-0 translate-y-4` → `opacity-0 scale-95` (toast.md)                                                                     | `toast.tsx`                                 |
| `Dialog`, `AlertDialog`, `Sheet` | base `animation` / sheet slide                                                                                                          | pass-through only                           |
| `Accordion`, `Collapsible`       | `reveal`; chevron 150–200 ms `transition-transform`                                                                                     | `reveal` default on both                    |
| `Input`                          | `transition-colors`, 150 ms                                                                                                             | style                                       |
| `Select`, `Combobox`             | **no entrance / exit**: base exposes `popupClass` / `popupStyle` only, and the touch-screen sheet has base motion. Differences note it. | pass-through                                |
| `Progress`                       | 180 ms `translate` glide, `cubic-bezier(0.2, 0, 0, 1)`; indeterminate native loop                                                       | later phase                                 |

Each popup content part holds `{ style, startingStyle, endingStyle }` as a few explicit lines.

### Injection and override

A default applies only while the consumer's hook is `undefined`; `null` turns it off; a consumer that sets a phase owns it whole (no class concatenation to change a duration, because a later `duration-*` cannot reliably override an earlier one). Style phases merge per key as `[default, consumer]`, only where a default exists. Interruption and continuity (a popup reopened mid-exit, a dismissed one leaving after its exit) are base's; the library keeps no `closing` state.

## Rejected

- Move `mergeClass` / `mergeStyle` into `theme`, or add `lib/merge.ts`: widens the public API with a non-token utility, or adds a registry dependency to every component for a few lines. The real problem was the identity calls.
- A `createPopupRoot` helper for the Family skeleton: the variants (slot or not, Sub parts, reason types) make its interface heavier than the duplication it removes.
- One recipe derived from `button`: a one-part control has no Root, Trigger or Content.
- A spacing / size / type-scale token layer, and motion, press or opacity values as tokens or a `brand` section of `theme.json`: the theme is not a general design system. The values are `nsh`'s own (motion) or one component's internals (sizes, tints), so they were not brand; the attempt added a JSON import, CLI path rewriting and a merge step, and was withdrawn.
- A third "stateful leaf" recipe, and compatibility paths (shadcn ids, legacy `trigger`, old Dialog/Sheet Root props): two truths.
- Brand-only admission (skip thin entries), long-term dual APIs: `add` coverage must track base.

## Decisions

- 2026-11-10 — Four ADRs folded into this README and the theme README; the ADR directory is gone. New decisions are added here, one line each with a reason.
- 2026-11-10 — R5 is minimums plus padding, not fixed sizes. Why: NSH Coding Guides ("let text containers grow with their text").
- 2026-11-10 — R7 (doc comments) and R8 (shadcn variant names) added.
- 2026-11-10 — The component package (six artifacts) is the definition of done for a migration.
- 2026-11-10 — Press feel and density are shared `lib` modules once a second component needs them. Why: the reference shares them across many looks (R1: behaviour that must match across files). This refines the earlier "no shared motion helper"; everything used once stays in the component.
- 2026-11-10 — The theme holds colors, radius, shadows, the focus ring and the one disabled look; motion, sizes, type scale and variant opacities stay in the components that use them. Why: those are `nsh`'s values or one component's internals, not brand, and tokenizing them needed a `brand` section, a JSON import and CLI rewriting. Gallery fixtures need a `tests/nsh.json` pointing at `theme.json`, since `nsh test` reads the `nsh.json` beside the entry, and the custom color tokens (`custom-shadow-ink`, `custom-highlight`, `custom-backdrop`) live there.
