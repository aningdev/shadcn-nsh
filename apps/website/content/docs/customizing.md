---
title: Customizing
description: "The three places to change a copied component: the theme, its look, and its shell."
---

`init` and `add` copy files into the app; after that they are the app's own. There are three places to change them.

| Change                  | Where                                                    | Reaches                                   |
| ----------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Colors, radii, surfaces | `theme.json` (and `lib/ui/themes/<id>.ts` for the rest)  | every component                           |
| One control's look      | its `*Look` function in `components/ui/<id>.tsx`         | that control's variants, sizes and states |
| Structure or API        | the component and parts after the look, in the same file | that component's props and parts          |

In a monorepo, every path starts at `packages/ui/` instead of the app root.

## Colors, radii and shadows

`theme.json` holds the colors for both appearances, the three `radius-*` layer lengths, the fixed `scrim` / `media` / `on-media` values and, if the app has its own, the font families. Every component reads them through `lib/ui/theme.ts`.

```sh
theme.json               # the roles of both appearances, 3 radii, fonts
lib/ui/theme.ts          # colors, surface, control, feedback, shape, font, focusRing, alpha
lib/ui/themes/<id>.ts    # the spec itself: surfaces, metrics, motion — add theme-<id>
```

Edit the values and keep the keys: components and surfaces refer to them by name, and both appearances need the same set. This is the change that reaches every component at once. [Theme](./theme) lists the roles.

What `theme.json` does not carry is the spec's own depth: the eleven `surfaces` (fill, gradient, shadow, edges, material), `feedback` (hover, press, focus, disabled, passive), `controls` (a switch's track, a field's focus line) and `metrics` (sizes per input tier). Those live in `lib/ui/themes/<id>.ts`, which `add theme-<id>` installs and which `defineTheme()` compiles: a field a surface leaves out is a neutral (no gradient, no material, no shadow), and a shadow names the parts of the theme's own `elevation` scale rather than writing one. If you add a surface, copy every field of a neighbouring one and change the ones that differ, and state device-dependent sizes twice, under `pointer` and `touch`, with the same keys.

```json
{
  "cssVars": {
    "theme": {
      "radius": "8px",
      "radius-control": "8px",
      "radius-container": "12px",
      "radius-modal": "14px"
    },
    "light": { "background": "#f6f6f9", "primary": "#c6ef6a" },
    "dark": { "background": "#16191f", "primary": "#c4ec6a" }
  }
}
```

## One control's look

The look is the function that turns a `variant` (shadcn's word: `default`, `secondary`, `ghost`, `destructive`), a `size` (`sm`, `default`, `lg`), a `tone` (the theme's `Tone`: `neutral`, `accent`, `info`, `success`, `warning`, `destructive`) and a state into the props `nsh/base` draws with. It sits at the top of a copied component, above the component itself.

```tsx
// components/ui/button.tsx
export function buttonLook(variant: Live<ButtonVariant> = "secondary", o?: ButtonLookOptions) {
  return {
    get style(): ViewStyle {
      const dims = dimensions(o);
      return {
        height: terminal ? TERMINAL_ROW : dims.height,
        borderRadius: shape.control,
        // ...
      };
    },
    // hoverStyle, activeStyle, focusVisibleStyle, disabledStyle, hitSlop
  };
}
```

Change the values in that function — a height, a radius, a hover fill — and the shell below still spreads the result. Keep the props it returns; they are what the base control reads. `buttonLook` is one; `iconButtonLook`, `roundButtonLook` and `splitButtonLook` live in the same file, and other components name theirs the same way (`switchLook`, `checkboxLook`). Controls whose shape and dimensions vary by platform (`checkbox`, `switch`, `slider`, `radio-group`, `progress`, `spinner`, `calendar`, `sheet`, and shared `lib/field-look.ts` for fields) read the theme's control geometry through `control("switch")`, `control("slider")`, `control("choice")` and `control("field")`; the per-component geometry that hangs off them stays right inside those component or lib files.

## Structure and API

The shell is the component and its parts, below the look. It reads props, spreads the look and gives a composite its roles.

```tsx
// components/ui/button.tsx
export function Button(props: ButtonProps) { ... }
export function IconButton(props: IconButtonProps) { ... }
```

```tsx
// components/ui/dialog.tsx
export function Dialog(props: DialogProps) { ... }
export function DialogTrigger(props: DialogTriggerProps) { ... }
export function DialogContent(props: DialogContentProps) { ... }
```

Change the shell to change which props a component takes, which parts it exports, and how they nest. A new prop is read in the shell and passed to the base control; keep the caller's `style`, `hoverStyle` and other style props after the look's, so they still win. Behavior — keyboard, focus, dismissal — stays in `nsh/base`; the shell passes its props through. See [nsh.dev/elements](https://nsh.dev/elements).

## After an update

`add` keeps a file the app changed and reports it; `diff` shows the lines; `add --overwrite` replaces it. `theme.json` is the exception: one with missing keys is merged, and customized values are kept unless `--overwrite`.
