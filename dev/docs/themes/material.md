# Material (/dev/docs/themes/material)

<ThemeIntro id="material" />

## Installation [#installation]

<ThemeInstall id="material" />

## Tokens [#tokens]

<ThemeTokenLead />

### The appearance roles [#the-appearance-roles]

<ThemeTokens id="material" group="roles" />

### The shared values [#the-shared-values]

<ThemeTokens id="material" group="shared" />

## Surfaces [#surfaces]

<ThemeSurfaces id="material" />

## Design notes and trade-offs [#design-notes-and-trade-offs]

This theme maps Material 3 Expressive onto the shared control slots: tonal surfaces, circular corners, and state layers. It does not clone every Material widget. The official reference is [Material Design 3](https://m3.material.io/).

**Color.** Light `background` is `#FEF7FF` (`oklch(0.98379 0.01284 321.894)`). Light `primary` is `#6750A4` (`oklch(0.49552 0.13046 293.709)`). Light `secondary` is `#E8DEF8`. Dark `primary` is `oklch(0.83493 0.09457 298.018)`. `scrim` is `oklch(0 0 0 / 0.32)`. Tints are solid tonal containers for `brand`, `info`, `success`, `warning`, and `destructive`, not a `tintAlpha` wash. After the palette override, `brand` in `theme.json` is `var(--primary)`.

**Surfaces.** Elevation is tonal steps plus the Material Web double shadow. There is no backdrop blur. `glass` has no `backdropFilter`. `meta.donts`: do not add blur or a border to a tonal container.

**Radii and density.** `control` / `container` / `modal` are 4 / 12 / 28 (Corner Extra Small / Medium / Extra Large), with `curve: "circular"`. Buttons and badges are `"full"` at every size. Material 3 has no official desktop density. Pointer heights 24 / 32 / 40 are this library's tier. Touch heights are 32 / 40 / 56. `hit.touch` is 48.

**Motion and controls.** Press is an 8% hover overlay and a 10% press overlay (`scale` stays 1), not an Android ripple. `themeSwitch` is a `radial-wipe` of 320 ms. Fields are filled: sides have no edge, the bottom edge is `muted-foreground`, and focus is a 2px `brand` underline, not a four-edge box. A selected checkbox face is `primary`. A selected radio face is `none`, so the disc is not filled. Popup corners use `control` (4), not the container radius 12. Switch press expands the thumb. The library does not draw an optional thumb icon.