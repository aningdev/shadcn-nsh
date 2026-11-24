# Theming

## Six themes

A theme is data: `theme.json` (base tokens) plus `semantics.json` (cross-platform roles), read by `lib/ui/theme.ts`. The app is built with one; others can be installed beside it for runtime switching.

| Theme         | Look                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `default`     | The library's own: graphite and paper, one citrus accent, compact controls                              |
| `shadcn`      | shadcn/ui's neutral palette, 8-point controls                                                           |
| `solid-glass` | Frosted glass, translucent finishes, large radii                                                        |
| `apple`       | Apple's system palette and HIG metrics: capsule buttons, continuous corners, Liquid Glass               |
| `material`    | Material 3 Expressive: tonal surfaces, capsule buttons, 4-point controls                                |
| `winui`       | WinUI 3 / Windows 11: Mica-friendly surfaces, 4-point controls                                          |
| `native`      | The platform's own theme (a module, not a file set); `init --theme native` installs it beside `default` |

## Choose the built theme, then add more

`init --theme <name>` decides what the app is built with. `add theme-<name>` installs one more into `themes/<name>/`; `nsh-ui.json` records the built one, so `add` never overwrites it.

```sh
npx shadcn-nsh@latest init --theme shadcn
npx shadcn-nsh@latest add theme-apple      # optional: one more to switch to at run time
```

Switching is the app's own code; the theme package only changes what is drawn:

```tsx
// src/theme.ts — the app's file.
import { Storage } from "nsh";

import { selectTheme, type AppTheme } from "@/lib/ui/theme";
import { apple } from "@/themes/apple";

export const themes: AppTheme[] = [apple];

export async function restoreTheme() {
  const id = await Storage.getItem("theme");
  selectTheme(themes.find((theme) => theme.id === id) ?? null);
}

export async function chooseTheme(theme: AppTheme | null) {
  selectTheme(theme);
  if (theme === null) await Storage.removeItem("theme");
  else await Storage.setItem("theme", theme.id);
}
```

`selectTheme(null)` means "the theme the app was built with". `currentTheme()` returns its id. Every read of a role is reactive, so the screen redraws on the next frame. Read the installed `themes/<name>/index.ts` for the export's name.

## Read roles, never colours

```tsx
import { View } from "nsh";
import { alpha, colors, finish, rounded, shape, stroke } from "@/lib/ui/theme";

// A custom surface: fill, edge, corner and padding all come from the theme.
<View
  style={{
    backgroundColor: colors.inset,
    borderColor: colors.line,
    borderWidth: stroke.hairline,
    borderRadius: rounded(shape.container),
    padding: 12,
  }}
/>

// A pane that floats: the finish carries fill, shadow, material and edge.
<View style={{ ...finish.overlay, borderRadius: shape.modal }} />
```

The roles you will reach for most:

| Group            | Roles                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces         | `colors.background` `colors.card` `colors.inset` `colors.raised` `colors.field` `colors.sidebar`                                                     |
| Edges            | `colors.border` `colors.line` `colors.input` `colors.brandEdge` `colors.glassEdge` `stroke.hairline` `stroke.control`                                |
| Text             | `colors.foreground` `colors.mutedForeground` `colors.faint` `colors.primaryForeground` `colors.onMedia`                                              |
| Accent and tones | `colors.brand` `colors.primary` `toneColor("info" \| "warn" \| "destructive" \| "up" \| "down")` `toneTint(…)`                                       |
| Depth            | `finish.card` `finish.inset` `finish.raised` `finish.overlay` `finish.modal` `finish.glass` `finish.accent` `finish.knob`                            |
| Geometry         | `shape.control` `shape.container` `shape.modal` `shape.button` `rounded(radius, inset?)` `control()` `controlHeight` `iconSize` `hitTarget()`        |
| Type             | `font.size("body")` `font.weight("title")` `font.lineHeight("body")` `mono()`                                                                        |
| Motion and state | `motion.fast` `motion.default` `motion.state` `motion.enter` `press` `hovered()` `focusRing()` `dimmed.pressed` `dimmed.disabled` `alpha(colour, a)` |

A colour literal (`"#fff"`, `"oklch(…)"`, `rgb(…)`) in app or component code is wrong: pick the role. A hardcoded `12` for a radius or a control height is wrong too: `shape.control`, `controlHeight.default`, `rounded()` already follow the theme.

## Pick a theme for the job

- Matching a platform? `apple` on macOS/iOS, `material` on Android, `winui` on Windows 11.
- Already looks like shadcn/ui? `shadcn`.
- A desktop utility on macOS with translucent panes? `solid-glass`, then turn on the window backdrop in `nsh.json` if the surface should sample the desktop.
- Shipping on all four? Start on `default`, install all six, and let the user pick.

## Change the theme

`theme.json` and `semantics.json` in the app are yours. Edit both appearances: `cssVars.light` and `cssVars.dark` for colours, `cssVars.theme` for radii and fonts, the DTCG groups for shadows, gradients, materials and metrics.

- Keep the keys: components and finishes refer to them by name, and both appearances need the same merged shape.
- Adding a component later key-merges the registry's `theme.json`/`semantics.json` into yours and keeps your values; `--overwrite` discards them.
- `light.tokens.json`, `dark.tokens.json` and `DESIGN.md` are generated snapshots for design tools; they do not follow later edits to `theme.json`.
- After editing, `nsh check`, then look at the screen in both appearances.
