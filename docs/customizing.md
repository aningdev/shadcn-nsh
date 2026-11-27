# Customizing (/docs/customizing)

Two kinds of change. A theme reaches every component. A copied file reaches that component. The TSX `nshm` install does not copy files, so appearance changes there go through [Custom themes](#custom-themes). Editing a shell or a look is the copy-into-app CLI, in [Customizing copied components](#customizing-copied-components).

## Custom themes [#custom-themes]

A theme is a `ThemeSpec` compiled by `defineTheme()`. Pass another theme's `spec` as `extends` and state only what you change. `selectTheme()` applies the result while the app runs. `selectTheme(null)` returns to the theme the app was built with.

```tsx
import { defineTheme, selectTheme } from "shadcn-nsh/theme";
import shadcnTheme from "shadcn-nsh/themes/shadcn";

const brandTheme = defineTheme({
  id: "brand",
  label: "Brand",
  extends: shadcnTheme.spec,
  tokens: {
    light: {
      primary: "oklch(0.546 0.245 262.881)",
      "primary-foreground": "oklch(0.985 0 0)",
    },
    dark: {
      primary: "oklch(0.707 0.165 254.624)",
      "primary-foreground": "oklch(0.205 0 0)",
    },
  },
});

selectTheme(brandTheme);
```

`extends` is the theme's `spec`, not the `AppTheme` wrapper. Fields you leave out are kept. Omitting `brand` compiles it to `var(--primary)`. Omitting `tints` and `chart` uses the derived tints and the default chart ramp. A radius change is the same kind of patch: `tokens.radius` is `control`, `container`, `modal`, and `curve` (`"continuous"` or `"circular"`).

With the CLI, the same call lives in a file the app owns. `npx shadcn-nsh@latest add theme-shadcn` writes `themes/shadcn.ts` plus `themes/shadcn/theme.json` and `DESIGN.md`, beside the build-time theme. Import that module and pass it to `selectTheme`. `init --theme <id>` builds the app on that theme instead. See [Themes](./themes).

`nativeTheme()` from `shadcn-nsh/themes/native` returns Apple on iOS and macOS, Material on Android, WinUI 3 on Windows, and NSH Gallery elsewhere:

```tsx
import { selectTheme } from "shadcn-nsh/theme";
import nativeTheme from "shadcn-nsh/themes/native";

selectTheme(nativeTheme());
```

### What the build writes [#what-the-build-writes]

`theme.json` is the layer NSH and Tailwind read: `cssVars.theme` (fonts, `radius`, `radius-md`, `radius-lg`, `radius-xl`, `scrim`, `media`, `on-media`) and the same color roles in `cssVars.light` and `cssVars.dark`. Edit keys, and keep the set. Both appearances need the same keys. Components refer to roles by name.

In this repository, `bun run theme:build` exports three artifacts from the resolved spec. They are generated. Change the TypeScript spec, then run the build. Do not hand-edit the exports and expect the spec to follow.

| Artifact                                | What it is                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `theme.json`                            | CSS variables for `setTheme` and Tailwind                                                         |
| `light.tokens.json`, `dark.tokens.json` | W3C Design Tokens Community Group format, 2025.10, one file per appearance. Not read at run time. |
| `DESIGN.md`                             | The design language in words, for agents. Generated.                                              |

An app that only needs different colors can edit the copied `theme.json`. A later `add` merges keys the file lacks and keeps values you changed, unless you pass `--overwrite`. Surfaces, controls, metrics, and motion are not in `theme.json`. Those stay on the spec, in `themes/<id>.ts` after a copy, or in the module `nshm` resolves. [Theme specification](./theme) lists the roles. [Architecture](./architecture) is the three layers.

```json
{
  "cssVars": {
    "theme": {
      "font-sans": "system-ui",
      "font-mono": "monospace",
      "radius": "8px",
      "radius-md": "8px",
      "radius-lg": "12px",
      "radius-xl": "14px"
    },
    "light": { "background": "#f6f6f9", "primary": "#c6ef6a" },
    "dark": { "background": "#16191f", "primary": "#c4ec6a" }
  }
}
```

## Customizing copied components [#customizing-copied-components]

`init` and `add` copy files into the app. After that they are the app's own. This section is that path. `nshm` does not copy a file to edit.

Public component shells sit at the top of each file. Component-private `*Look` helpers live at the bottom. The shell is what you change to add a prop or a part. The private look is what you change to restyle that control. Shared looks stay exported, because other files import them: `buttonLook` and `iconButtonLook` in `components/ui/button.tsx`, `pressableLook` in `components/ui/pressable.tsx`, `fieldLook` in `lib/ui/field-look.ts`, and `choiceLook` in `lib/ui/choice.tsx`.

| Change                  | Where                                                      | Reaches                                    |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Colors, radii, surfaces | `theme.json`, and `themes/<id>.ts` for the spec            | every component                            |
| One control's look      | the private look at the bottom of `components/ui/<id>.tsx` | that control's variants, sizes, and states |
| Structure or API        | the public shell at the top of the same file               | that component's props and parts           |

In a monorepo, component files live under `packages/ui/` instead of the app root. The theme readers are still `lib/ui/`.

### Colors, radii, and the spec [#colors-radii-and-the-spec]

`theme.json` holds the colors for both appearances, the three layer radii (`radius-md`, `radius-lg`, `radius-xl`, with `radius` equal to `radius-md`), the fixed `scrim` / `media` / `on-media` values, and `font-sans` / `font-mono`. Every component reads them through `lib/ui/theme.ts`.

```tsx
import { colors, control, shape } from "@/lib/ui/theme";
```

With `nshm` the same values are `import { colors, control, shape } from "shadcn-nsh/theme"`.

What `theme.json` does not carry is the spec's depth: the eleven `surfaces` (fill, gradient, shadow, edges, material), `feedback` (hover, press, focus, disabled, passive), `controls` (a switch's track, a field's focus line), and `metrics` (sizes per input tier). `add theme-<id>` installs that spec as `themes/<id>.ts`. A field a surface leaves out is a neutral (no gradient, no material, no shadow). A shadow names a step of the theme's own `elevation` scale rather than writing a shadow literal. State a device-dependent size twice, under `pointer` and `touch`, with the same keys.

### One control's look [#one-controls-look]

A look turns a `variant`, a `size`, a `tone`, and a state into the props `nsh/base` draws with. In a copied file the private helpers sit below the public shell. Change a height, a radius, or a hover fill there, and keep the props the base control reads. Helpers only that file uses stay private.

Controls whose shape varies by platform (`checkbox`, `switch`, `slider`, `radio-group`, `progress`, `spinner`, `calendar`, `sheet`) read the theme's control geometry through `control("switch")`, `control("slider")`, `control("choice")`, and `control("field")`.

### Structure and API [#structure-and-api]

The shell is the component and its parts, above the look. It reads props, spreads the look, and gives a composite its roles.

```tsx
// components/ui/button.tsx — public shell, top of the file
export function Button(props: ButtonProps) {
  /* ... */
}
export function IconButton(props: IconButtonProps) {
  /* ... */
}
```

```tsx
// components/ui/dialog.tsx
export function Dialog(props: DialogProps) {
  /* ... */
}
export function DialogTrigger(props: DialogTriggerProps) {
  /* ... */
}
export function DialogContent(props: DialogContentProps) {
  /* ... */
}
```

Change the shell to change which props a component takes, which parts it exports, and how they nest. A new prop is read in the shell and passed to the base control. Keep the caller's `style`, `hoverStyle`, and other style props after the look's, so they still win. Behavior — keyboard, focus, dismissal — stays in `nsh/base`. The shell passes those props through. See [nsh.dev/elements](https://nsh.dev/elements).

### After an update [#after-an-update]

`add` keeps a file the app changed and reports it. `diff` shows the lines. `add <name> --overwrite` replaces the file.

```npm
npx shadcn-nsh@latest diff
npx shadcn-nsh@latest add button --overwrite
```

`theme.json` is the exception: a file that only lacks keys is merged, and customized values are kept unless `--overwrite`.