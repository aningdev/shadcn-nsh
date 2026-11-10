# Motion policy: adopt `nsh` Animation, no second system

Styled components make branded choices over unstyled `nsh/base` behavior. For motion, `nsh` already owns the primitives: **Motion** (`createMotion` / `motions.*`), **Transitions** (`transitionProperty` & co.), `LayoutAnimation`, the element-level entrance/exit hooks (`startingClass` / `popupStartingClass` & co.), `reveal`, and the reduced-motion behavior of each ([animation.md](../../references/nsh/website/docs/animation.md), [design-guides §Motion](../../references/nsh/website/docs/design-guides.md)). The element docs also prescribe the entrance/exit look per element (`popover.md`, `menu.md`, `tooltip.md`, `toast.md`, `dialog.md`, `sheet.md`).

We decided: **the library adds no motion system of its own.** It only (1) picks the `nsh` primitive per scene, (2) whitelists the values `nsh` already documents, (3) injects per-family defaults, and (4) covers the one gap `nsh` leaves — style-based transitions do not honor `reduceMotion()` by themselves. This supersedes ADR 0002's "enter/exit overlay choreography is a later phase"; it does not change the three-layer theme (colors / finish / press motion).

## Authority

| Level | Source                                                                  | Role                                                        |
| ----- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1     | `nsh` design guides, animation docs, element docs                       | Mechanisms, per-element writes, reduced-motion behavior     |
| 2     | This ADR + [`theme` docs page](../../apps/docs/src/pages/docs/theme.md) | Scene mapping, value whitelist, defaults, override rules    |
| 3     | `packages/ui`                                                           | Defaults and override surface, one rule per line of level 2 |

`references/nsh/examples/nsh-gallery-ui/look/*` is a **reference implementation** (AGENTS: examples are not API): it sources values, not contracts.

## Rules

**M1 — One primitive per scene.** Cross-mechanism reuse is how double animation and flicker start.

| Scene                                                                                                   | Primitive                                               |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Control state (hover / pressed / checked / selected / open)                                             | Transitions                                             |
| Popup appears / disappears (`Popover`, `Menu`, `ContextMenu`, `Select`, `Combobox`, `Tooltip`, `Toast`) | `starting*` / `ending*` hooks + transitions             |
| Modal (`Dialog`, `AlertDialog`, `Sheet`)                                                                | base-owned (`animation="slide" \| "fade"`, sheet slide) |
| Height reveal (`Accordion`, `Collapsible`, `Tree`)                                                      | base `reveal`                                           |
| Content entrance, stagger, attention, loop                                                              | `createMotion` / `motions.*` / `Animated.stagger`       |
| Layout insert / remove / reorder                                                                        | `LayoutAnimation`                                       |

**M2 — Value whitelist.** Only durations, curves and property groups that `nsh` documents or its gallery uses: `100` / `120` / `150` / `180` / `200` / `300` ms; `ease-out`; `cubic-bezier(0.2, 0, 0, 1)`; `transition-colors` / `-opacity` / `-transform` / `transition` (style paths name the properties). `transition-all` appears only where an element doc writes it. A new value means amending this ADR with an `nsh` source, never a literal in a component.

**M3 — Class first, style when the part only takes styles.** Popups, toasts and chevrons follow the element docs verbatim through class hooks. Controls, and parts whose `nsh/base` API is `ViewStyle` only, take the equivalent styles; the docs' class snippets and the style props are the same mechanism (`popupStartingClass` / `popupStartingStyle`).

**M4 — Reduced motion.** Class transitions carry `motion-reduce:transition-none` (as every gallery look does). Style transitions read `reduceMotion()` — `pressSink` already does; the same getter/`reduceMotion() ? 0 : ms` pattern is the sanctioned patch. `motions.*`, `reveal`, modals and popups (base-owned) need nothing. Focus rings never animate.

**M5 — No layering over base.** `Dialog.animation`, sheet slide, `reveal`, the Tabs indicator spring and preset timings belong to `nsh/base`; the styled layer passes them through or flips them, never re-wraps them in a second animation.

**M6 — Defaults are narrow.** Only appear/disappear, expand/collapse and press are on by default. Hover changes color only. Content entrance, validation attention and loops are opt-in, written with `motions.*` or the gallery's native loop (`progressSweep`), not with new keyframes.

**M7 — Injection and override.** A default applies only while the hook is `undefined`; `null` turns it off; a consumer that sets a phase owns it whole (no class concatenation to change a duration — a later `duration-*` cannot reliably override an earlier one). Style phases merge per key through the components' existing `mergeStyle`, so a consumer's key wins.

**M8 — Interruption and continuity** stay base's: a popup reopened mid-exit returns from where it is, a dismissed one leaves after its exit. The library keeps no `closing` state and no hand-written stagger.

## Family mapping (implementation)

| Family / components              | Default (source)                                                                                                                      | Where                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `Popover`                        | 150 ms, from `opacity-0 scale-95` (popover.md)                                                                                        | `theme.overlayMotion("popover")`, applied in `popover.tsx` |
| `Menu`, `ContextMenu`            | 100 ms, from `opacity-0 -translate-y-1` (menu.md)                                                                                     | `theme.overlayMotion("menu")`, applied in each             |
| `Tooltip`                        | 100 ms fade (tooltip.md)                                                                                                              | `theme.overlayMotion("tooltip")`, applied in `tooltip.tsx` |
| `Toast`                          | 200 ms, `opacity-0 translate-y-4` → `opacity-0 scale-95` (toast.md)                                                                   | already in `toast.tsx`                                     |
| `Dialog`, `AlertDialog`, `Sheet` | base `animation` / sheet slide (dialog.md, sheet.md)                                                                                  | pass-through only                                          |
| `Accordion`, `Collapsible`       | `reveal`; chevron 150–200 ms `transition-transform` (disclosure look)                                                                 | `reveal` default on both                                   |
| `Button` (and pressable rows)    | `pressSink` 150 ms ease-out, 0.97                                                                                                     | `theme.pressSink`                                          |
| `Input`                          | `transition-colors`, 150 ms                                                                                                           | style                                                      |
| `Select`, `Combobox`             | **no entrance/exit**: `nsh/base` exposes `popupClass`/`popupStyle` only; the touch-screen sheet has base motion. Differences note it. | pass-through                                               |
| `Progress`                       | 180 ms `translate` glide, `cubic-bezier(0.2, 0, 0, 1)`; indeterminate native loop (meter look)                                        | later phase                                                |

## Considered options

- **Owned motion tokens + recipe layer** (`motion.json`, a named recipe cascade, custom duration scale) — rejected: duplicates values `nsh` owns, drifts from element docs, and turns every override into a second truth.
- **Port shadcn's `tw-animate-css` classes** — rejected: a second class-based animation system next to `nsh`'s lifecycle hooks; the docs' snippets already cover the same scenes.
- **Opt-in everywhere (no defaults)** — rejected: the element docs prescribe an entrance for the popup family; shipping components with no motion is the current gap, not a policy.
- **Inject defaults by concatenating classes** — rejected: class-order override is unreliable (see M7); styles merge per key.

## Consequences

- The values live in `theme.overlayMotion` (the motion layer ADR 0002 established next to `pressSink`); each popup content part applies them in a few explicit lines — default while the phase's hooks are `undefined`, the consumer's own hook (or `null`) owns the phase otherwise.
- `lib/` carries composition plumbing only (`open-state.ts`); popup chrome (`popupSurface` / `popupBackdrop` / `overlayShadow`) and its motion values (`overlayMotion`) are theme helpers, next to `finish` and `pressSink`, so `lib/` is not a second system.
- `Select` / `Combobox` expose `popupClass` / `popupStyle` / `backdrop*`; their lack of an entrance is documented rather than faked.
- `Tooltip`'s root type is narrowed to the props it honors; bubble look and entrance hooks live on `TooltipContent`.
- Docs must state that defaults come from `nsh` element docs, not from this library's invention.
- Review check: grep for durations outside the whitelist, and for a second animation on modals/reveal.

## Not doing

No `motion.json`, no custom duration/easing scale, no bespoke keyframes, no `closing` state, no wrapper over `LayoutAnimation`, no default animation on every component, no Android `elevation` / iOS `glassEffect` motion adapters in this phase.
