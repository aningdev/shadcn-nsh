# Add and own a component

## Add it

```sh
npx shadcn-nsh@latest add select
npx shadcn-nsh@latest add select switch field button card   # several at once
npx shadcn-nsh@latest add --all                             # the whole registry
npx shadcn-nsh@latest add select --dry-run                  # show the plan, write nothing
npx shadcn-nsh@latest add select -c apps/web                # another workspace package
```

`add` is idempotent: it skips a file that matches the registry, installs the ones a component depends on (`lib/ui/*.ts`), key-merges theme entries, and installs a package the component needs (icons, for example) with the app's package manager.

`init` is only for a first install: it writes the theme, `lib/ui/theme.ts`, `nsh-ui.json`, and points `nsh.json` and the `@/` alias at them. An app with `nsh-ui.json` needs no second `init`.

## What lands in the app

| Path                           | What it is                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `components/ui/<id>.tsx`       | The component: its parts, props and `*Look` functions, one file              |
| `lib/ui/*.ts`                  | Shared parts the component depends on (`look`, `press`, `popup`, `icons`, …) |
| `theme.json`, `semantics.json` | The theme's data; `lib/ui/theme.ts` reads it                                 |
| `nsh-ui.json`                  | Which theme the app was built with and what `add` has installed              |
| `themes/<name>/`               | Extra themes installed with `add theme-<name>`                               |

Imports follow the files:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/lib/ui/icons";
import { colors, rounded } from "@/lib/ui/theme";
```

## The file is yours

After `add`, the component is app code, not a dependency: edit it. No re-export, no wrapper, no patching in `node_modules`.

Two kinds of change, in this order:

1. **Look** — the `*Look` functions at the top of the file. Change colours, radii, padding, shadows there; every part reads its style from them.
2. **Structure or API** — the parts and props below the look. Change the JSX and the exported types together.

```tsx
// components/ui/switch.tsx — after add
export function switchLook(on: () => boolean, size: SwitchSize = "default"): SwitchLook {
  return {
    // …
    get trackStyle(): ViewStyle {
      const g = geometry(size);
      const checked = on();
      return {
        // The checked fill now uses the accent role rather than the primary fill.
        backgroundColor: checked ? colors.brand : colors.track,
        // …
      };
    },
  };
}
```

Keep the contract the file already states:

- A look returns the same fields the parts spread; add a field rather than renaming one.
- Colours come from roles (`colors.*`, `finish.*`, `toneColor`), never literals. Radii from `shape.*` and `rounded()`; sizes from `control()`, `controlHeight`, `iconSize`.
- A part spreads the caller's props last, so `style`, `class`, `testID` and accessibility props still win.
- Keep behaviour in `nsh/base`. If a change is about keyboard, focus, selection or accessibility state, it belongs upstream in `nsh/base`, not in the look.

If the change is one every app should get, it belongs in this library, not in the app's copy: open an issue instead of forking silently.

## Update a component

```sh
npx shadcn-nsh@latest diff select     # exits 1 when the app's copy differs
npx shadcn-nsh@latest add select      # keeps a modified file and says so
npx shadcn-nsh@latest add select --overwrite   # discards local edits
```

`add` never silently clobbers your edits: a file that differs is kept and reported. Re-run it to take new shared parts, then re-apply the look changes yourself — `diff` shows exactly what the registry now has.

A new component version may expect theme keys your theme lacks; `add` key-merges them into `theme.json` and `semantics.json` and keeps your values. `--overwrite` replaces the theme with the registry's.

## A component we don't have

Run `npx shadcn-nsh@latest list` first; if the id is there, add it. If it is not, build the component on `nsh/base` and the theme roles, following the same shape as the existing files: one file, a `*Look` for appearance, a thin shell over the base control for behaviour. Do not copy `nsh/base` into the app.
