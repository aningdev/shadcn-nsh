---
name: theme-designer
description: 'Author a shadcn-nsh Theme v5 theme from the L1 ThemeParadigm axes, sparse L2 defineTheme overrides, and L3 materials and WGSL effects. Use when designing or changing a theme, palette, density, motion, surface, or theme-switch transition in this repo.'
---

# Theme designer

Author a theme in three layers. Read `docs/theme.md` before changing one. The numbers `expandParadigm` writes live in `packages/theme/paradigm.ts`. `scripts/theme/invariants.ts` is what rejects a theme.

Do not branch on `theme.id`. Do not put color literals in `packages/ui` or demos. Read `colors.*`, `tints.*`, `chart.*`, or `surface()` inside a reactive JSX thunk or style callback. A component body runs once.

## 3 layers

| Layer | What you write | Where it goes |
| --- | --- | --- |
| L1 | `ThemeParadigm`: up to six axes | `expandParadigm()` → sparse L2 patch. `defineTheme` merges it after `extends` and drops `paradigm` from `ThemeSpec` |
| L2 | Sparse `tokens`, `metrics`, `elevation`, `surfaces`, `feedback`, `motion`, `controls` | Same `defineTheme` call. These fields win over the paradigm |
| L3 | `material` (`"glass"` / `"acrylic"` or `MaterialSpec`) and `effect: { kind }` | `surfaces.<role>`. Drawn by `<ThemedSurface>`. Theme switches use `motion.presets.themeSwitch` and `<ThemeTransition>` |

Merge order: extended theme, then `expandParadigm(paradigm)`, then the call's own L2 fields.

## Six axes

| Axis | Preset | Pick it when | L2 it writes |
| --- | --- | --- | --- |
| `depth` | `flat` | No lift, no blur | Elevation zeroed. `card` / `plate` / `raised` / `overlay` / `modal` lose shadow, material, effect, and backdrop |
| `depth` | `hairline` | A 1px edge is enough | Small ring in `elevation`, `shadow: "sm"` on card, raised, overlay, plate, modal |
| `depth` | `soft-shadow` | Cards and dialogs float | Soft `elevation.{light,dark}`. Card `md`, overlay `lg`, modal `xl` |
| `depth` | `glass` | Translucent chrome | `surfaces.glass` and `overlay`: `material: "glass"`, fill alpha `0.78` (floor `0.72`), glass `effect` `liquid-glass`, overlay `specular-rim` |
| `depth` | `acrylic` | Heavier frost | Same roles, `material: "acrylic"`, fill alpha `0.9` (floor `0.85`), `effect` `acrylic-noise` |
| `shape` | `sharp` | Editorial or dense tools | `radius` control/container/modal `4/4/6`, circular curve, small control corners |
| `shape` | `rounded` | Balanced product UI | `8/12/14`, continuous, `corner: "control"` |
| `shape` | `soft` | Generous curves | `12/16/20`, continuous |
| `shape` | `pill` | Capsule buttons and tabs | `button` / `badge` / `tabs` corner `"full"`. Container radii stay with the base |
| `stroke` | `crisp` | Standard 1px edges | `metrics.stroke` hairline `1`, control `1` |
| `stroke` | `hairline` | Apple-like hairline | Hairline `0.5`, control `1` |
| `stroke` | `translucent` | Quiet edges | 1px strokes plus `{ color: "border", alpha }` on card, raised, overlay, modal, field |
| `motion` | `instant` | No choreography | Durations `40/60/100/150` (floors; they cannot be 0). `themeSwitch` `{ kind: "none", duration: 0 }` |
| `motion` | `snappy` | Short CSS-like moves | `80/100/160/260`, `themeSwitch` `fade` `140` |
| `motion` | `fluid` | Organic fades | `120/140/220/360` easing `standard`, `themeSwitch` `dissolve` `280` |
| `motion` | `springy` | Physics | Spring `420/34/1` (damping ratio inside `[0.55, 1.5]`), `indicatorGlide` spring, `themeSwitch` `radial-wipe` `320` |
| `feedback` | `tint` | Fill answers the pointer | Hover overlay plus a foreground wash; press scale `0.98` |
| `feedback` | `underline` | Fields emphasize the bottom edge | `controls.field.edge.sides: false`, bottom and focus line `brand` |
| `feedback` | `lift` | The control rises | Press scale `0.94`, `translateY: -1` |
| `feedback` | `ring` | Keyboard focus is a ring | Focus outline width `2` offset `2`, field focus color `ring` |
| `density` | `compact` | Dense pointer tools | Shorter controls. Touch item height `md` `40`, hit `44` |
| `density` | `balanced` | The gallery default | Pointer/touch heights `28` / `40` at `md` |
| `density` | `airy` | Reading and touch | Pointer/touch heights `36` / `52` at `md`, larger padding |

`0 <= radius.control <= radius.container <= radius.modal`. There is no separate `radius` token besides those three (plus `curve`). `effect` is `{ kind, intensity? }`, not a string. `themeSwitch` has `kind` and `duration`; the shader comes from the kind (`dissolve`, `radial-wipe`). `fade` and `none` have no shader.

## Color roles

21 `CorePalette` keys, per appearance: `background`, `card`, `popover`, `muted`, `surface`, `foreground`, `muted-foreground`, `faint`, `primary`, `primary-foreground`, `secondary`, `accent`, `brand`, `border`, `line`, `input`, `ring`, `info`, `success`, `warning`, `destructive`.

9 shared `theme.json` keys: `font-sans` (default `system-ui`), `font-mono` (default `monospace`), `radius` (equals `radius-md`), `radius-md`, `radius-lg`, `radius-xl`, `scrim`, `media`, `on-media`. `font.sans` and `font.mono` read the font keys. Set `tokens.font` only to override the defaults.

`brand` defaults to `var(--primary)` when omitted. Replacing `tokens.light` or `tokens.dark` clears inherited `tints` and `chart`; set them in that same patch. `tints.*` and `chart.*` are runtime roles. Never name a color after a component (`button`, `sidebar`, `field`).

## Materials and shaders

Surface materials: `"glass"`, `"acrylic"`, or a `MaterialSpec` (`kind: "glass" | "acrylic" | "blur"`, optional `glass: "regular" | "clear"`, `ios: IosBackdropMaterial`, `macos: MacOsBackdropSpec`, `blur`, `saturate`, `minOpacity`, `specular`). Note: on macOS 26+, setting an explicit `macos.backdrop` draws `NSVisualEffectView` over `NSGlassEffectView` (`glassEffect`), so themes prioritizing native Liquid Glass omit `macos` and let `backdropFilter` fall back on older macOS.

Surface effects (`SURFACE_SHADERS`, transparent optical overlays drawn over host backdrop blur & fill): `"liquid-glass"` (rounded-rect SDF edge lens refraction + chromatic dispersion + top Fresnel sheen + glass rim, center transparent for `NSGlassEffectView`/`backdropFilter`; `maxSampleOffset: 6`), `"acrylic-noise"` (Fluent 2 fine noise grain + 1px top highlight over host acrylic blur/tint; `maxSampleOffset: 0`), `"specular-rim"` (`maxSampleOffset: 0`), `"paper-grain"` (`maxSampleOffset: 0`).

Theme-switch shaders (`TRANSITION_SHADERS`): `"dissolve"`, `"radial-wipe"`.

Motion springs: `motion.spring` plus optional named tiers `motion.springs.{snappy, smooth, bouncy}`. Presets (`popoverEnter`, `dialogEnter`, `indicatorGlide`, `reveal`, `press`) take `spring?: boolean | "snappy" | "smooth" | "bouncy"`. `motion.springCss()` emits native `spring(stiffness, damping)` for CSS transitions.

```tsx
<ThemedSurface role="glass">
  <Text>Panel</Text>
</ThemedSurface>
<ProgressiveBlur edge="top" />
<ThemeTransition value={shown()} />
```

`<ProgressiveBlur />` fades a `backdropFilter` off the top or bottom edge via native `maskImage` (terminal renders `null`). `<ThemeTransition>` takes `value` (`string | number | boolean`) and an optional `duration`. It has no children. Put it next to the screen it switches. Change `value` in the same press that calls `selectTheme(theme)`.

## Invariants

`validateThemeInvariants` (`scripts/theme/invariants.ts`) must return `[]`.

- Pointer and touch sizes sit on a 4px grid. Touch is at least the matching pointer size.
- `metrics.hit.pointer` is `0`. `metrics.hit.touch` is at least `44`. Touch control height `lg` is at least `44`.
- `metrics.density.touch.gap` and `metrics.control.touch.gap` are at least `8`.
- `metrics.item.touch` pad and inset together reach at least as far as the pointer pair. Spacing values are `4`, `8`, `12`, `16`, `24`, or `32` unless `meta.scaleCitations` names the path.
- Motion durations stay ordered: `state <= fast <= default <= slow`, inside `[40, 220]`, `[60, 250]`, `[100, 350]`, `[150, 500]`. A `none` theme switch lasts `0`. Other switch durations are in `[0, 500]`.
- Spring damping ratio `damping / (2 * sqrt(stiffness * mass))` is inside `[0.55, 1.5]`. Stiffness `[80, 1200]`, mass `[0.2, 5]`.
- Press scale is inside `(0.85, 1]`. `|translateY| <= 4`. Accent opacity is inside `(0, 1]`.
- A glass or acrylic fill's alpha is at least that material's `minOpacity` (preset glass `0.72`, acrylic `0.85`).
- Body text and icons meet WCAG 2.2 AA (`4.5:1`). A selected or hovered fill separates from `background` / `card` / `popover` by OKLCH lightness `>= 0.015`. A platform exception is a `meta.contrastWaivers` entry.

```sh
bun run theme:build
bun run check:theme
bun run test:unit
```

`bun run check` runs those, plus parity, docs, UI rules, and `nsh check`.

## Recipe

```ts
import { defineTheme } from "@shadcn-nsh/theme";
import { nshGallery } from "@shadcn-nsh/theme/themes";

export const editorialPaper = defineTheme({
  id: "editorial-paper",
  label: "Editorial Paper",
  extends: nshGallery.spec,
  paradigm: {
    depth: "hairline",
    shape: "sharp",
    stroke: "crisp",
    motion: "fluid",
    feedback: "underline",
    density: "airy",
  },
  // L2 wins. Paper grain replaces the hairline axis's cleared effect.
  surfaces: {
    card: { effect: { kind: "paper-grain" } },
    plate: { effect: { kind: "paper-grain" } },
  },
});
```

Switch it with `selectTheme(editorialPaper)`. `selectTheme` takes an `AppTheme` (or `null` for the build-time preset), not a theme id string.
