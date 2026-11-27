# shadcn-nsh

[中文](./README.zh.md)

Styled UI for [Native Shell (NSH)](https://github.com/longbridge/nsh), built on `nsh/base` and delivered with zero third-party runtime dependencies. Use it either as a **TSX `nshm`** (`nsh add`) or as **copy-into-app** files via the CLI — the model [shadcn/ui](https://github.com/shadcn-ui/ui) brings to React, adapted for native phone, desktop, web, and terminal surfaces.

Docs, live previews, and API reference: **https://shadcn-nsh.aning.dev/**

- **Data-driven appearance.** Components read colors, radii, surfaces, control slots, and motion from the theme layer — never hardcoded literals — so switching a theme transforms the entire UI.
- **Native behavior where it matters.** Interaction, keyboard navigation, and accessibility live in `nsh/base`; each component adds styled shells that adapt automatically across pointer, touch, and terminal tiers.
- **Design architecture.** See the [Architecture guide](https://shadcn-nsh.aning.dev/docs/architecture) (and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)) for how `nsh/base`, the 3-layer theme system, and component shells fit together.

## Built-in themes

Six themes ship out of the box, plus a `native` preset (`nativeTheme()`) that selects `apple`, `material`, or `winui` from `platform.os` at runtime:

| Theme         | Character                                                                                      | Reference                                                                                          | Details                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `nsh-gallery` | Default palette: graphite surfaces, citrus accent, 8pt controls                                | [NSH Gallery](https://github.com/longbridge/nsh)                                                   | [`packages/theme/themes/nsh-gallery`](packages/theme/themes/nsh-gallery)     |
| `shadcn`      | Neutral black-and-white palette and flat surfaces                                              | [shadcn/ui](https://ui.shadcn.com/)                                                                | [`packages/theme/themes/shadcn`](packages/theme/themes/shadcn)               |
| `solid-glass` | Smoky glass panes, specular top rims, soft springs                                             | [Solid Glass](https://github.com/deeplethe/solid-glass)                                            | [`packages/theme/themes/solid-glass`](packages/theme/themes/solid-glass)     |
| `apple`       | Liquid Glass surfaces, system colors, continuous corners (`ios` / `macos`)                     | [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) | [`packages/theme/themes/apple`](packages/theme/themes/apple/README.md)       |
| `material`    | Tonal surfaces, capsule controls, circular corners, 8/10/10% state layers (`android`)          | [Material Design 3](https://m3.material.io/)                                                       | [`packages/theme/themes/material`](packages/theme/themes/material/README.md) |
| `winui`       | Fluent 2 acrylic layers, 4/8pt circular corners, double focus rings, damped motion (`windows`) | [Windows App Design](https://learn.microsoft.com/windows/apps/design/)                             | [`packages/theme/themes/winui`](packages/theme/themes/winui/README.md)       |

> **Style-inspired, not 1:1 native clones.** Each built-in theme distills the colors, corners, surface materials, and motion cadence of its design language onto shared `nsh/base` controls rather than replicating every platform widget pixel-for-pixel. Exact mappings and deliberate trade-offs are documented in each theme's README.

### Custom themes

Derive your own theme cleanly with `defineTheme({ extends: base, ... })` (colors, layer radii, surfaces, or control slots) and apply it at runtime with `selectTheme()`, or override tokens in `theme.json` and export W3C DTCG 2025.10 files and `DESIGN.md`. See the [Customizing guide](https://shadcn-nsh.aning.dev/docs/customizing) and [`docs/theme.md`](docs/theme.md).

## Usage

Choose whichever distribution workflow fits your project — both run from the same component source.

### Option 1: TSX `nshm` (zero npm dependencies)

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { Button } from "shadcn-nsh";
import { selectTheme } from "shadcn-nsh/theme";
import apple from "shadcn-nsh/themes/apple";

selectTheme(apple);
```

NSH resolves imports straight from the module with no `node_modules` required. Components bundle their built-in UI icons (`IconNode`-compatible with external `lucide` icons). Use `selectTheme()` to switch built-in themes at run time; if you also want build-time Tailwind tokens such as `bg-surface` or `rounded-(--radius-md)` in your app's own views, install a `theme.json` with the CLI below.

### Option 2: Copy-into-app CLI

Your app needs `nsh.json` (from `nsh init`):

```sh
npx shadcn-nsh@latest init                 # writes nsh-ui.json, installs theme.json + reader, sets up @/
npx shadcn-nsh@latest init --theme apple   # or start with any built-in theme
npx shadcn-nsh@latest add button           # copies component source + shared lib dependencies
npx shadcn-nsh@latest add theme-material   # adds another theme to switch with selectTheme()
```

Copied files belong entirely to your app. Built-in UI icons are included automatically without forcing a `lucide` install, while any app-level custom icons imported from `lucide` pass directly to `<Button icon={...} />`. Inspect or compare local copies anytime with `list`, `view <name>`, and `diff`. Each CLI version reads from its matching release tag (`v<version>/public/r/{name}.json`). See the [CLI reference](https://shadcn-nsh.aning.dev/docs/cli).

## Compatibility

Each release tracks one NSH CLI version against which its components and `nsh/base` props were checked:

| shadcn-nsh | NSH CLI |
| ---------- | ------- |
| 0.12.x     | v0.7.2  |
| 0.11.x     | v0.7.2  |
| 0.10.x     | v0.6.1  |
| 0.9.x      | v0.6.1  |
| 0.8.x      | v0.6.0  |
| 0.7.x      | v0.5.1  |
| 0.6.x      | v0.5.1  |

## Developing in this repo

Requires Bun and the [NSH CLI](https://nsh.dev/) (see `engines.nsh` in [`package.json`](package.json)):

```sh
bun install
bun run prepare:types
bun run dev:docs
bun run check
```

Contribution workflow and architecture rules: [`CONTRIBUTING.md`](CONTRIBUTING.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Acknowledgments and license

- Built on [Native Shell (NSH)](https://github.com/longbridge/nsh) and `nsh/base`; adapted look origins from `nsh-gallery-ui` retain Apache License 2.0 (see [`NOTICE`](NOTICE)).
- Distribution model, registry schema, and composition conventions inspired by [shadcn/ui](https://github.com/shadcn-ui/ui).
- `solid-glass` palette and surface finishes derived from [Solid Glass](https://github.com/deeplethe/solid-glass) (MIT License).
- Built-in UI icon paths derived from [Lucide](https://lucide.dev/) (ISC License; parts from Feather, MIT License).

This repository is licensed under the **MIT License** — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
