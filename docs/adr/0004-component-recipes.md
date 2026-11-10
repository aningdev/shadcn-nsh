# Component recipes: leaf and family

Components in `packages/ui` grew one by one, so the same decisions (how props are read, how consumer styles merge, how a Trigger renders, where popup chrome comes from) are made again in every file. We decided to fix them as two **Recipes** — a rule set a component must satisfy — and migrate existing components to them one family at a time.

A Recipe constrains structure and dependencies, not look. Look stays in `theme` (ADR 0002) and motion in ADR 0003. Behavior stays in `nsh/base` (ADR 0001).

## Shared rules

**R1 — Self-contained first.** A component imports `theme`, `nsh`, `nsh/base`, and at most the registered exceptions below. A shared helper is added only when behavior must match across several files; eight duplicated lines do not qualify. `registryDependencies` equals the actual imports; `registry:build` enforces it.

**R2 — Allowed horizontal imports.** `button` as the primitive layer; same-family reuse with re-export (`context-menu` → `menu`, `toggle-group` → `toggle`). Anything else needs an entry here.

**R3 — Do not destructure props.** A destructured prop is read once and does not follow changes (`references/nsh/website/docs/jsx-and-components.md`). Read `props.x` where it is used, pass the rest on with `split(props, keys)`, write defaults in JSX (`props.x ?? d`), and derive values with `computed`. Style bundles that depend on props are computed once, not per call site.

**R4 — Merge only against a default.** A consumer value is passed through as is. `[default, consumer]` is written only where the wrapper has a default; `mergeClass(undefined, x)` and `mergeStyle(undefined, x)` are forbidden. There is no shared merge helper: `theme` does not grow non-token utilities (public API, ADR 0002 layers), and `lib/` does not either.

**R5 — Theme for look, literals for size.** Colors, radius, shadow, motion and focus ring come from `theme` only. Sizes (height, padding, font size) are literals gathered in one `look` function at the top of the file; there is no spacing token. A duration or curve outside ADR 0003 M2 is never a literal.

**R6 — Public surface.** `xVariants()`-style style helpers and the component types are public. `lib/*` is internal and may change signature between releases.

## Leaf recipe (template: `button`)

A single-part component over one `nsh/base` control.

- **Must:** props type is `Omit<BaseProps, "children"> & { variant axes; children?: string | JSX.Element }`; a pure `xVariants(options)` returns `style`, `label`, and each state style (`hover` / `active` / `selected` / `disabled`) plus `hitSlop`; every state style is `[default, consumer]` with the consumer winning; focus ring, accessible label from string children (unless `nsh/base` already derives it) and touch `hitSlop` by default; unknown variant falls back to `default`.
- **Must not:** reimplement base behavior; import another leaf (except `button`, R2); read props by destructuring (R3).
- **May differ:** variant axes, label rendering, size literals.

## Family recipe (template: `popover`)

A Composition Facade over a compound `nsh/base` control (`Root` / `Trigger` / `Content` / `Item` and decorations).

- **Root** owns only `createOpenState` and, where base has a `trigger` prop, a `createSlot`; lifecycle callbacks go into context; renders the Provider and children. It does not carry `Content` props. The context hook throws `"X parts must be used within <X>"`.
- **Trigger** fills the slot and returns a placeholder (or renders directly when base has no `trigger` prop). Both branches pass `disabled`, `class` and `style` through. A string child renders `Button`. A non-string child is focusable, keyboard-activatable and carries a role.
- **Content** omits what Root owns, uses `popupSurface()` (popups) or `modalSurface()` (modals) with `overlayMotion(kind)` where ADR 0003 defines one, and applies defaults only while the consumer's hook is `undefined` (M7).
- **Item** adapts the base item, with focus ring, and passes state styles through unless it has a default.
- **Decorations** (`Title`, `Description`, `Label`, `Shortcut`, `Header`, `Footer`) are text parts: a string child renders a themed `Text`, anything else renders as given.
- **Must not:** import another family (R2); invent a per-part disabled look; add a helper that hides the Root/Trigger/Content skeleton — the skeleton stays explicit because its differences (reason type, Sub parts, content slots) are where bugs sit.
- **May differ:** popup kind, presence of a slot or items, motion kind.

## Decisions taken with the recipes

- **`modalSurface()`** joins `popupSurface()` in `theme` for `Dialog` and `Sheet`. Modals differ in radius and padding; folding them into `popupSurface` would give it a branch. No new `overlayMotion` kind: modal motion stays base-owned (ADR 0003 M1, M5).
- **`Dialog` / `Sheet` Root no longer carry Content props** (`animation`, `presentation`, `closeOnEscape`, `closeOnBackdropPress`, `closeOnSwipe`). They move to `Content`, as in `Popover`. The old form is removed with no alias (Composition-only); each component's Differences records it.
- **`createTriggerSlot` is now `createSlot`** (`Slot`): `Combobox` also keeps its empty-state content in one, so the name no longer says "trigger". `lib/open-state.ts` covers an open flag, named slots and an item registry; value state (`Tabs`) is outside it.
- **ADR 0003 M7** says style phases merge "through the components' existing `mergeStyle`". Read it with R4: the merge exists where a default exists, and is a plain `[default, consumer]` list, not a shared function.

## Consequences

- Migration order: `button` (pilot, with a demo whose `variant` follows a signal to confirm R3), then `popover`, `tooltip`, `menu` / `context-menu`, `dialog` / `sheet`, `select` / `combobox`, the other leaves. One commit per family, with `public/r` rebuilt.
- Dialog/Sheet Root changes break callers; they ship with a note in the docs Differences.
- Existing components do not satisfy the recipes until migrated; each migration commit states which rules it brought into line.
- Review check: grep for `mergeClass(undefined` / `mergeStyle(undefined`, for `const {` over `props`, and for literal durations outside ADR 0003 M2.
- A skill that scaffolds a component from a recipe comes after the first families are migrated, so it encodes what worked.

## Considered options

- **Move `mergeClass` / `mergeStyle` into `theme`** — rejected: widens the public API with a non-token utility, and the root problem is the identity calls (most of them), not the copies.
- **A shared `lib/merge.ts`** — rejected: every component would gain a registry dependency for a few lines (R1).
- **A `createPopupRoot` helper for the family skeleton** — rejected: the variants (slot or not, Sub parts, reason types) make its interface heavier than the duplication it removes.
- **A single recipe derived from `button`** — rejected: a one-part control has no Root, Trigger or Content; `button` does not cover the compound shape.
- **A spacing / size token layer** — rejected for the restraint of ADR 0002: the theme is not a general design system.

## Not doing

No shared merge or skeleton helpers, no spacing tokens, no `labelStyle` on `Button` in this phase (Differences notes the gap), no compatibility path for the old Dialog/Sheet Root props.
