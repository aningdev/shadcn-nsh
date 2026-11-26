# @shadcn-nsh/theme

[中文](./README.zh.md)

Theme v5 runtime and theme definitions (`docs/decisions/0020-theme-v5.md`). One complete `base` theme (`themes/nsh-gallery/index.ts`) and five sparse overrides (`shadcn`, `solid-glass`, `apple`, `material`, `winui`) authored via `defineTheme()` in TypeScript are the single source of truth. `bun run tokens:build` exports `theme.json`, W3C DTCG 2025.10 `{light,dark}.tokens.json`, and `DESIGN.md` one way.

| File                                    | Role                                                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.ts`                             | Contracts (`ThemeSpec`, `ThemePatch`), `SHARED_TYPE_SCALE`, `EASING_BEZIERS`, `defineTheme()`, and `compileNshTheme()`                                           |
| `materials.ts`                          | Platform glass and acrylic material recipes, plus `resolveMaterial()` for a parameterized spec                                                                   |
| `effects.ts`                            | Built-in WGSL surface and theme-switch shaders (`SURFACE_SHADERS`, `TRANSITION_SHADERS`)                                                                         |
| `paradigm.ts`                           | L1 `ThemeParadigm` axes and `expandParadigm()`, expanded by `defineTheme` and omitted from `ThemeSpec`                                                           |
| `themes/nsh-gallery/index.ts`           | Complete `base` theme spec (`baseSpec`, `base`, `nshGallery`)                                                                                                    |
| `themes/<id>/index.ts`                  | Sparse overrides (`shadcn`, `solid-glass`, `apple`, `material`, `winui`) and `themes/native/`                                                                    |
| `preset.ts`                             | Build-time preset re-export (replaced by `init --theme <id>` with the chosen theme)                                                                              |
| `theme.ts`                              | Zero-Proxy strongly typed readers: `colors`, `tints`, `chart`, `shape`, `metrics`, `surface()`, `feedback`, `motion`, `control()`, `selectTheme`, `currentTheme` |
| `theme.json`                            | Compiled 25-key NSH CSS variables (`cssVars.theme` + 21 `cssVars.{light,dark}` + optional `font-sans`/`font-mono`)                                               |
| `light.tokens.json`, `dark.tokens.json` | Standalone W3C DTCG 2025.10 one-way exports (interchange only; not read at runtime)                                                                              |
| `DESIGN.md`                             | Generated Google Labs `DESIGN.md` (`alpha`) specification copied to app root on `init`                                                                           |

## Architecture (Theme v5)

- **Three authoring layers**: L1 `ThemeParadigm` (`paradigm.ts`, six axes, stripped after `defineTheme`), L2 sparse `ThemeSpec` overrides, L3 `MaterialSpec` plus the WGSL in `effects.ts` (`<ThemedSurface>`, `<ThemeTransition>`). See `.agents/skills/theme-designer/SKILL.md`.
- **Minimal 25-key `theme.json` + optional fonts**:
  - `cssVars.theme`: required `radius`, `radius-control`, `radius-container`, `radius-modal`, `scrim`, `media`, `on-media`; optional `font-sans`, `font-mono` (omitted by default in built-in themes to keep system fonts).
  - `cssVars.light` / `cssVars.dark`: 21 core keys (`background`, `card`, `popover`, `muted`, `surface`, `foreground`, `muted-foreground`, `faint`, `primary`, `primary-foreground`, `secondary`, `accent`, `brand`, `border`, `line`, `input`, `ring`, `info`, `success`, `warning`, `destructive`).
  - Removed from `theme.json`: `sidebar-*`, redundant `*-foreground`, static `*-tint` (computed reactively via `tints.*` + `tintAlpha`), `chart-1..5` (defaults to `[brand, info, success, warning, destructive]`), and single-use control/surface keys.
- **Four Orthogonal Layers**:
  - `surfaces` (11 unified `SurfaceSpec` roles: `card`, `raised`, `inset`, `channel`, `plate`, `overlay`, `modal`, `inverse`, `glass`, `accent`, `fill`) + `elevation.{light,dark}`
  - `metrics` (`height`, `icon`, `density`, `control`, `item`, `hit`, `stroke`, `typography`)
  - `feedback` (`hover`, `press`, `focus`, `disabled`, `passive`) & `motion` (`state`, `fast`, `default`, `slow`, `spring`, `presets`)
  - `controls` (13 sparse control recipes with zero theme-ID branches)

## Authoring & Runtime Switching

- Build and validate after theme changes: `bun run tokens:build && bun run check:theme && bun run theme:contrast && bun run theme:parity`
- App initialization (`shadcn-nsh init --theme <id>`) installs `theme.json` and `DESIGN.md` at the app root alongside `lib/ui/{schema,materials,effects,paradigm,base,preset,theme}.ts`. Adding another theme (`shadcn-nsh add theme-<id>`) copies `themes/<id>.ts` for `selectTheme()`.
