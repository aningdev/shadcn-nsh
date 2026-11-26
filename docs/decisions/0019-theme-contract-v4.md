# 0019 · Theme Contract v4: Typed Nested Controls and Dead-Field Cleanup

- **Date**: 2026-11-26
- **Status**: Accepted

## Context

Over Contracts v1–v3 (`0004`, `0007`, `0009`, `0013`, `0016`), incremental fixes and theme ports accumulated parallel mechanisms, dead fields, constant slots, string-enum drift (`text` slots), and flat string-keyed lookup in `semantics.json` (`slots`):

1. **Dual-track typography & radii**: `typography.*.fontSize`/`lineHeight` were hardcoded to identical values across all themes (`0009`) yet serialized into every `semantics.json`, while `dimension.shape.*` indirection repeated `{radius-control}` / `{radius-container}` / `{radius-modal}` even though `theme.ts` could read `token("radius-*")` directly.
2. **Orphan / dead fields**: `transition.enter` (`motion.enter`), `shape.corners.button` (`shape.button`), `dimension.size.control.dot`, `state.overlay.{focus,dragged}`, `finish.inset["border-top-color"]`, and `down-tint` (already merged conceptually into `destructive-tint` alongside `colors.destructive` / `down`) had either zero live consumers or duplicated an adjacent mechanism. `press.ts` also hardcoded `150ms ease-out` instead of reading `motion.state`.
3. **Flat string-keyed `slots` (102 keys)**:
   - 9 slots were constants across all 6 themes (`button.destructive.{face,ink}`, `field.{face,shade,edge.width,corner.top}`, `slider.vertical`) or redundant (`button.destructive.shade` matched `button.secondary.shade`, and `switch.feedback` was derivable from resting vs. pressed knob geometry).
   - 5 `text` slots (`field.focus.colour`, `calendar.today.ink`, `list.item.highlight`, `list.item.edge`, `menubar.bar`) drifted back into ad-hoc string enums, mixed `.colour` / `.color` spelling, and used camelCase color names (`color:primaryForeground`).
   - 16 paired width/height/hover/pressed slots for switches and slider knobs duplicated geometry across 2 axes.

## Decision

Upgrade the compiled and runtime theme contract (`semantics.json` and `packages/theme`) to **Contract v4**:

1. **Remove redundant tokens and dead fields**:
   - Remove `down-tint` (apps and `toneTint("down")` use `tints.destructive`); keep `down` exempted in `parity.ts`.
   - Remove `transition.enter` / `motion.enter`; wire `packages/ui/lib/press.ts` to `motion.state`.
   - Remove `dimension.shape.*` and `shape.corners.button` / `shape.button`; `shape.{control,container,modal}` read `token("radius-*")` directly and `pagination` / `calendar` use `buttonCorner("default")`.
   - Move shared font sizes and whole-point line heights into `SHARED_TYPE_SCALE` inside `packages/theme/theme.ts`; `semantics.json` stores only per-theme `typography.*.fontWeight` and `letterSpacing` (DTCG source files continue checking font scale integrity).
   - Remove `dimension.size.control.dot` (`progress.tsx` reads `choiceLook().dot[tier]`), `state.overlay.{focus,dragged}`, and `finishFields.inset["border-top-color"]`.
2. **Replace flat `slots` with strongly typed nested `controls` (86 leaves)**:
   - Compile `slot.*` DTCG tokens into nested `semantics.json` `controls` (`controls(): Controls`), ensuring no leaf path is a dot-prefix of another (`switch.knob.size`, `slider.knob.size`).
   - Eliminate all `text` slots: remove `switch.feedback` (derived in `switchLook()` from resting vs. pressed knob ratios) and migrate the remaining 5 (`field.focus.color`, `calendar.today.ink`, `list.item.highlight`, `list.item.edge`, `menubar.bar`) to typed `face` slots.
   - Standardize American spelling (`color`, `.color`, `ColorRole`, `SwitchLook.edgeColor`) and enforce kebab-case color names in slots (`color:primary-foreground`, `color:secondary-foreground`, `color:muted-foreground`); expose `accent` and `ring` on `Palette` / `colors`.
   - Introduce `size` slots (`number | readonly number[] | "same"`), encoded in DTCG 2025.10 as `dimension` for square sizes, `"WxH"` strings for non-square tuples, and `"same"` to inherit the resting knob size — merging 16 switch/slider size slots into 9 (`switch.track`, `switch.small.track`, `switch.small.knob`, `switch.knob.{size,on,hover,pressed}`, `slider.knob.{size,pressed}`).
   - Delete 9 redundant slots (`button.destructive.{face,ink,shade}`, `field.{face,shade,edge.width,corner.top}`, `slider.vertical`, `switch.feedback`), consolidate `button.secondary.shade` into `button.shade`, and rename `state.disabled.*` slots to `disabled.*`.

## Consequences

- `semantics.json` is smaller, strictly typed through `Controls`, free of dead fields, and exposes no untyped `text` enum backdoors.
- Every slot color reference maps cleanly through one `toColorRole()` helper and Tailwind class formatter (`backgroundClass`, `listItemHighlightClass`), removing duplicate lookup maps in `listbox.tsx` and `command.tsx`.
- All 6 themes preserve pixel parity (with `apple` pagination/calendar buttons now consistently using `buttonCorner("default")`, `shadcn` progress step dots matching `choice.mark.size`, and `command.tsx` reading theme `list.item.highlight`).
