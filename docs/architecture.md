# Architecture (/docs/architecture)

This page is the map of the library you install. Behavior stays in `nsh/base`. Appearance comes from the theme. The file you import, or copy, is a styled shell. The same source is published two ways, and neither way adds a third-party runtime dependency.

## Layers [#layers]

| Layer                       | Owns                                                                                                                            | You read it as                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `nsh/base`                  | Behavior, keyboard navigation, focus, dismissal, accessibility                                                                  | The unstyled props. This library does not change them.                 |
| Theme, layer 1              | Tokens: both appearances, the three radii, fonts, `scrim` / `media` / `on-media`                                                | `theme.json`, compiled from the spec                                   |
| Theme, layer 2              | `ThemeSpec`: surfaces, controls, metrics, elevation, feedback, motion                                                           | `defineTheme()` in `themes/<id>/index.ts`                              |
| Theme, layer 3              | Native materials (`glass`, `acrylic`, `blur`) and WGSL effects (`liquid-glass`, `acrylic-noise`, `specular-rim`, `paper-grain`) | Fields on a surface. A material or an effect is replaced as a whole.   |
| Component shells and `lib/` | The JSX you compose, and the helpers more than one component shares                                                             | `shadcn-nsh/<name>`, or `components/ui/<name>` after the CLI copies it |

`nativeTheme()` picks a built-in theme from `platform.os`: Apple on iOS and macOS, Material on Android, WinUI 3 on Windows, and NSH Gallery everywhere else. `defineTheme({ extends })` derives a theme from one that already exists. [Customizing](./customizing) is the working example. [Theme specification](./theme) is the contract. [Themes](./themes) is each built-in theme's own spec.

A built-in theme distills a design system's colors, radii, surfaces, and motion. It does not clone that system's widgets one to one.

## What a component file looks like [#what-a-component-file-looks-like]

One component is one file. The public part is the top of the file. The private part is the bottom.

1. A one-line purpose, then imports.
2. **Public types.** `Variant`, `Size`, and `Props`. A control built on `nsh/base` starts from that control's props and adds its own axes.
3. **Public shell.** The JSX. The root passes `class`, `classList`, and `style` through. The caller's `class` is applied after the shell's own class (`joinClass`). Style props are arrays, and the caller's style is last, so it wins.
4. **Private look.** Unexported `*Look` helpers, sizes, and geometry live at the bottom. When a component adapts to the terminal, that code sits in a `// Terminal` section at the end of the file.

A look that more than one component uses stays exported, or lives in `lib/`: `buttonLook` and `iconButtonLook` from the button file, `pressableLook` from the pressable file, `fieldLook` from `lib/ui/field-look.ts`, and `choiceLook` from `lib/ui/choice.tsx`. A look only that file uses is not exported.

```tsx
export type ButtonProps = { variant?: "default" | "secondary" };

// Public shell. The caller's class and style come last.
export function Button(props: ButtonProps) {
  const look = buttonLook(() => props.variant);
  return (
    <BaseButton
      {...look}
      class={joinClass(look.class, props.class)}
      style={[look.style, props.style]}
    />
  );
}

// Private look. Read the theme here, in the getter, not once at module scope.
function quietFace() {
  return { backgroundColor: colors.muted };
}

// Terminal
// platform.idiom === "terminal": one row high, one column of padding.
```

The sketch is the shape of the file, not a copy of `button.tsx`. `buttonLook` is a real shared export. Keyboard, focus, and dismissal stay in `nsh/base`.

## Appearance follows the theme, live [#appearance-follows-the-theme-live]

Read a color, a surface, or a control slot in JSX or in a getter: `colors.primary`, `surface("card")`, `control("button")`. `selectTheme()` and the light/dark switch then update the next render.

Do not copy a theme value into a module-level constant, or into a `const` in the component body. That read happens once and stays on the theme that was active then.

The same shell serves pointer, touch, and terminal. Heights, icons, padding, and hit targets come from the theme's `pointer` and `touch` tiers. In the terminal, row and column sizes come from the theme's terminal metrics. Keep content inside the safe area with `env(safe-area-inset-*)` on padding and margin. Read `safeArea()` only when the layout has to do arithmetic with the inset.

## One source, two installs [#one-source-two-installs]

|                 | TSX `nshm`                                                                         | Copy-into-app CLI                                                                         |
| --------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Install         | `nsh add github:aningdev/shadcn-nsh`                                               | `npx shadcn-nsh@latest init`, then `add <name>`                                           |
| What you import | `shadcn-nsh/<name>`, `shadcn-nsh/theme`, `shadcn-nsh/themes/<id>`                  | `@/components/ui/<name>` after the copy                                                   |
| npm             | None                                                                               | None for the components. An icon from `lucide` is the app's own dependency.               |
| Editing         | Use the module as shipped. Change appearance with `defineTheme` and `selectTheme`. | The files are yours. `diff` shows the drift. `add <name> --overwrite` replaces your copy. |

The root `nsh.json` lists the exports: the component barrel, the theme runtime, each built-in theme, and every component. `public/r` is the registry the CLI copies from. Both are built from `packages/ui` and `packages/theme`.

Icons are part of that source. `lib/ui/icons.tsx` ships 39 UI icons with the same `IconNode` shape as lucide, so a component does not need the `lucide` package at run time. An app can still pass a lucide icon into any prop that takes an `IconNode`. See [Icons](./icons).

## Where to go next [#where-to-go-next]

- [Getting started](./getting-started) installs either way.
- [CLI](./cli) is every command and flag.
- [Themes](./themes) is each built-in theme.
- [Customizing](./customizing) derives a theme and edits a copied component.