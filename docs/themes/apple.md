# Apple (/docs/themes/apple)

<ThemeIntro id="apple" />

## Installation [#installation]

<ThemeInstall id="apple" />

## Tokens [#tokens]

<ThemeTokenLead />

### The appearance roles [#the-appearance-roles]

<ThemeTokens id="apple" group="roles" />

### The shared values [#the-shared-values]

<ThemeTokens id="apple" group="shared" />

## Surfaces [#surfaces]

<ThemeSurfaces id="apple" />

## Design notes and trade-offs [#design-notes-and-trade-offs]

This theme maps Apple's system colors and Liquid Glass onto the shared control slots. It does not clone every UIKit or AppKit widget. The official reference is the [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/).

**Color.** Light `background`, `card`, and `popover` are white (`#FFFFFF`); `foreground` is black. `primary`, `ring`, and `info` are systemBlue `#007AFF` (`oklch(0.60276 0.21771 257.424)`). Dark `primary` is `oklch(0.62425 0.20558 255.486)`. Light `inset` is `#F2F2F7`. The palette does not inherit a separate `brand`, so `theme.json` compiles `brand` to `var(--primary)`. `tintAlpha` is `0.12`. `scrim` is `oklch(0 0 0 / 0.4)`. The five chart colors are stated system colors, not the default `[brand, info, success, warning, destructive]` ramp.

**Material.** `appleGlass()` omits `macos.backdrop`, so macOS 26 and later use `NSGlassEffectView` (`glassEffect` and `glassTintColor`). Earlier macOS and the web fall back to `backdropFilter`. The specular highlight is `oklch(1 0 0 / 0.55)` in light and `oklch(1 0 0 / 0.16)` in dark. Optical `liquid-glass` is only on `overlay`, `modal`, `inverse`, and `glass`. Cards have no shadow. Shadows elsewhere are a 0.5px hairline plus a shadow.

**Radii and density.** `control` / `container` / `modal` are 8 / 12 / 16, with `curve: "continuous"`. Pointer button corners are 5 / 6 / 8; touch buttons are `"full"`; badges are capsules. Hairline stroke is 0.5; control strokes are 1. Pointer heights are 24 / 28 / 32. Touch heights are 32 / 44 / 56. Keep the 0.5px continuous corners. Do not replace them with a thick border or `curve: "circular"`.

**Controls.** Buttons are not capsules on pointer. Fields keep a four-edge box (the baseline `input` edge), not an underline. Choice is a rounded box, not a circular radio disc. Switch and slider press change geometry (the thumb stretches). There is no drag lens; optical refraction stays on the glass surfaces. Spinner `trackOpacity` is `0`, so no track ring is drawn. `AlertDialog` calls `nsh/base` `AlertDialog.show` on every platform, so this theme's Liquid Glass modal is not applied to alerts.