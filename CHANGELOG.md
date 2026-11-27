# Changelog

## Unreleased

### Added

- **Apple Liquid Glass (`apple`) and a stronger Native preset.** Apple's `raised`, `overlay`, `modal`, `inverse`, and `glass` surfaces layer native regular/clear glass, iOS materials, saturate blur, specular hairlines, and a rounded-rect `liquid-glass` shader. `ProgressiveBlur` fades backdrop blur off an edge. Themes can declare `snappy`, `smooth`, and `bouncy` springs, and `themes/native` picks the platform theme via `nativeTheme()`.
- **Material 3 Expressive, Solid Glass, and WinUI 3 Fluent 2 polish.** Material 3 adds spatial/effects spring tiers (`snappy`, `smooth`, `bouncy`) and `reveal` springs. Solid Glass extends smoky blur and `specular-rim` across `overlay`, `inverse`, and `modal` with soft springs. WinUI 3 uses four-layer `acrylic-noise`, critically damped springs (83/167/250/333 ms), and color-only press feedback.
- **Zero-dependency TSX `nshm` install.** Root `nsh.json` exports `shadcn-nsh`, `shadcn-nsh/theme`, each theme, and every component. `nsh add github:aningdev/shadcn-nsh` runs with no npm packages and `selectTheme` switches built-in themes at run time. Copy-into-app (`npx shadcn-nsh init` / `add`) remains unchanged.

### Changed

- **Standardized components and tokens.** Radii settle on `radius-md`, `radius-lg`, and `radius-xl` (`radius` = `radius-md`). Themes emit `font-sans` and `font-mono`. Components follow a unified source layout, forward `class`/`classList`/`style`, read terminal metrics from the theme, fold `split-button` into `ButtonGroup`, use `env(safe-area-inset-*)` margins where applicable (`sheet`, `toast`, `sidebar`, `image-viewer`), and ship 39 built-in lucide-compatible `IconNode` paths.
- **NSH v0.7.2 alignment.** `Button` forwards `busy` to `nsh/base` `Button` for native assistive state; `TitleBar` wraps `nsh/base` `TitleBar` with `contentStyle` for inner row padding; `richEditorClasses` adds table interaction classes (`selectedCell`, `tableGrip`, `tableResizeHandle`, `tableDropIndicator`); `textViewLinkClasses` expands to `textViewClasses` (`link`, `tableGrid`).

### Breaking

- **Internal `*Look` and `*Sizes` helpers are private.** Single-component helpers are no longer exported (`buttonLook`, `iconButtonLook`, `fieldLook`, `choiceLook`, and `pressableLook` remain exported).
- **Shared primitives moved to `lib/`.** `fieldLook` / `field-*` live in `lib/field-look`; `choiceLook` / `choice-*` live in `lib/choice`. `Input`, `Checkbox`, and `TimeField` no longer re-export them.
- **`split-button` removed.** Use `ButtonGroup` + `Button` + `ButtonGroupSeparator`. Old `radius-control` / `radius-container` / `radius-modal` tokens have no aliases.

## v0.11.0 — 2026-11-26

### Added

- **Theme v5 & L1 `ThemeParadigm` (`expandParadigm`).** One TypeScript `base` (`nsh-gallery`) plus sparse `defineTheme()` overrides (`shadcn`, `solid-glass`, `apple`, `material`, `winui`) with unified `surface()`, `feedback`, `motion` springs/presets, pointer/touch `metrics`, 13 `control()` slots, L3 `material` / WGSL `effect` shaders (`liquid-glass`, `acrylic-noise`, `specular-rim`, `paper-grain`), and `<ThemeTransition>`. One-way export generates `theme.json`, `{light,dark}.tokens.json` (DTCG 2025.10), and `DESIGN.md`.
- **`AlertDialogContent` `input` (#122)** and **`Calendar` / `DatePicker` range preview (#326).** Added optional alert text input, `Pressable` `accessibilityHint`, NSH v0.7.1 baseline alignment, and dual docs publishing (`/` for latest `v*` tag, `/dev/` for `main`).

### Changed & Breaking

- **Renamed `default` theme to `nsh-gallery` (`theme-nsh-gallery`) (#360).**
- **Consolidated `packages/ui/lib`**, removed press ripples (`state.ripple`) and legacy `theme.json` keys (`sidebar-*`, `*-foreground`, `*-tint`, `chart-*`), and aligned Material, Apple, and WinUI control tokens/contrast.

## v0.10.0

- Added `plate` and `channel` surface roles, `muted` palette step, `capsule` group finish, semantic control tokens, and WCAG contrast / fill-separation checks.

## v0.9.0

- Standardized style roles across all themes, extracted `packages/ui/lib`, and expanded component coverage (including `TextView`, `RichEditor`, `DataTable`, `DockArea`, `DiffView`, `ColorPicker`, and `ImageViewer`).

## v0.8.0 — 0.8.1

- Added offline cache fallback and exit code `2` to `diff`, `@/` path alias setup in `init`, and NSH 0.6 alignment.

## v0.6.0 — 0.7.0

- Added `solid-glass` theme, runtime theme switching (`selectTheme`, `AppTheme`), `ButtonGroup`, conversation/trace/bubble components, and navigation containers.

## v0.3.0 — 0.5.0

- Unified component API vocabulary around shadcn's `variant` / `size` / `tone`, added runtime `theme` exports, input groups, and initial `registry:ui` components.
