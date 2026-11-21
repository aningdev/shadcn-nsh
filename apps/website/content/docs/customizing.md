---
title: Customizing
description: "The three places to change a copied component: the theme, its look, and its shell."
---

`init` and `add` copy files into the app; after that they are the app's own. There are three places to change them.

| Change                 | Where                                                    | Reaches                                   |
| ---------------------- | -------------------------------------------------------- | ----------------------------------------- |
| Colors, radii, shadows | `theme.json`, `lib/ui/semantics.json`                    | every component                           |
| One control's look     | its `*Look` function in `components/ui/<id>.tsx`         | that control's variants, sizes and states |
| Structure or API       | the component and parts after the look, in the same file | that component's props and parts          |

In a monorepo, every path starts at `packages/ui/` instead of the app root.

## Colors, radii and shadows

`theme.json` holds the colors for both appearances, the eight `radius-*` lengths, and font families; `lib/ui/semantics.json` holds style groups and surface finishes (`shared` + sparse `light`/`dark`), referencing tokens with `{token}`. Every component reads them through `lib/ui/theme.ts`.

```sh
theme.json               # base tokens: colors, 8 radii, fonts
lib/ui/semantics.json    # style groups and surface finishes
lib/ui/theme.ts          # colors, finish, shape, font, focusRing, alpha
```

Edit the values and keep the keys: components and finishes refer to them by name, and both appearances need the same merged finish shape. This is the change that reaches every component at once. [Theme](./theme) lists the roles.

```json
{
  "cssVars": {
    "theme": { "radius": "10px", "radius-card": "14px", "radius-control": "8px" },
    "light": { "background": "#f6f6f9", "primary": "#c6ef6a" },
    "dark": { "background": "#16191f", "primary": "#c4ec6a" }
  }
}
```

## One control's look

The look is the function that turns a `variant` (shadcn's word: `default`, `secondary`, `ghost`, `destructive`), a `size` (`sm`, `default`, `lg`), a `tone` (the theme's `Tone`: `neutral`, `accent`, `info`, `warn`, `destructive`, `up`, `down`) and a state into the props `nsh/base` draws with. It sits at the top of a copied component, above the component itself.

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

Change the values in that function — a height, a radius, a hover fill — and the shell below still spreads the result. Keep the props it returns; they are what the base control reads. `buttonLook` is one; `iconButtonLook`, `roundButtonLook` and `splitButtonLook` live in the same file, and other components name theirs the same way (`switchLook`, `checkboxLook`).

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

`add` keeps a file the app changed and reports it; `diff` shows the lines; `add --overwrite` replaces it. `theme.json` and `semantics.json` are the exceptions: one with missing keys is merged, and customized values are kept unless `--overwrite`.
