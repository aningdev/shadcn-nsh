# WinUI 3 (/docs/themes/winui)

<ThemeIntro id="winui" />

## Installation [#installation]

<ThemeInstall id="winui" />

## Tokens [#tokens]

<ThemeTokenLead />

### The appearance roles [#the-appearance-roles]

<ThemeTokens id="winui" group="roles" />

### The shared values [#the-shared-values]

<ThemeTokens id="winui" group="shared" />

## Surfaces [#surfaces]

<ThemeSurfaces id="winui" />

## Design notes and trade-offs [#design-notes-and-trade-offs]

This theme maps Fluent 2 and WinUI 3 onto the shared control slots: Accent blue, 4- and 8-point circular corners, in-app Acrylic, and decelerating motion. It does not clone every WinUI control. The official reference is [Windows App Design](https://learn.microsoft.com/windows/apps/design/).

**Color.** Light `background` is `#F3F3F3` (`oklch(0.96415 0 0)`). Light `primary` and `info` are `#005FB8`. Light `brand` is `#003E92`. Dark `primary` and `info` are `#60CDFF`. Dark `brand` is `oklch(0.8943 0.08425 214.859)`. Info tints are solid: light `#E5F1FB`, dark `#1E3246`. `scrim` is `oklch(0 0 0 / 0.302)`. Chart colors are `primary`, `success`, `warning`, `destructive`, and `input`.

**Material.** Component material is in-app Acrylic (`kind: "acrylic"` plus `acrylic-noise`), not window Mica. Mica is the app shell's `window.backdrop`. This library falls back to Acrylic or an opaque fill. The specular highlight is `oklch(1 0 0 / 0.6)` in light and `oklch(1 0 0 / 0.09)` in dark. `raised` is a translucent top and bottom edge, with no drop shadow. Cards have a translucent black edge and no shadow.

**Radii and motion.** `control` / `container` / `modal` are 4 / 8 / 8, with `curve: "circular"`. Do not switch the curve to `continuous`. Durations are 83 / 167 / 250 / 333 ms, decelerating, with a damping ratio of at least 1 and no overshoot. Focus is a double ring (width 2, offset 0). Hover swaps color. It is not an overlay.

**Controls.** Buttons stay at the control radius 4. They are not capsules. Press swaps color. Fields are a box: four edges in `line`, a stronger bottom edge in `input`, and a 2px `brand` focus line. Choice and radio both fill with `primary`. Switch press only widens the thumb. Slider and progress tracks use `input`, not a brand fill.