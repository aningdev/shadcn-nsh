# Research: theme elevation, finishes, and motion

Date: 2026-11-09  
Scope: organize a **surface-depth + motion** system for `@shadcn-nsh/theme`, referencing native HIG/M3, NSH Design Guides + Gallery, shadcn/ui, and mainstream design systems.  
Decisions and rules: [`packages/theme/README.md`](../../packages/theme/README.md).

## Sources

| Lane          | Primary sources                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NSH / Gallery | `references/nsh/website/docs/design-guides.md`, `animation.md`, `styling.md`; `references/nsh/examples/nsh-gallery-ui/{finishes.json,theme.ts,look/press.ts}`; `references/nsh/crates/nsh-base/src/theme.rs` |
| shadcn        | `references/shadcn-ui/apps/v4/content/docs/(root)/theming.mdx`, `globals.css`, `registry/styles/style-*.css`, `packages/shadcn/src/tailwind.css`                                                             |
| Native        | Apple HIG Materials / Dark Mode; M3 Elevation + State layers + Motion; NSH docs on `elevation` / `glassEffect` / no native press fade                                                                        |
| Industry      | MD3, Fluent 2, Radix Themes, Tailwind v4, MUI, Chakra v3, Park UI, Open Props, DTCG/Style Dictionary; shadcn theming (official)                                                                              |

## Findings (compressed)

### NSH boundary

- `theme.json` / cssVars own **colors and radius**. Shadows and gradients are **not** design tokens in NSH’s sense (`nsh-gallery-ui/theme.ts`: “shadows and gradients are no design tokens”).
- Press feedback and motion policy belong to the **application / styled layer**; platforms do **not** supply a native press fade (`references/nsh/AGENTS.md`).
- Runtime can express `boxShadow`, `transform`, `transitionProperty` (incl. shadows), springs via `createAnimatedValue`, and platform extras (`android.elevation`, `glassEffect`).

### Design Guides vs Gallery

- Guides: elevation = **stacking**, not importance; do not shadow every card; popup family shares **one shadow**; press example `active:scale-[0.97]` + reduced motion.
- Gallery: semantic **`finish.*`** (raised / hover / pressed / on / menu / …) with inset bevels + soft overlay shadows; **`pressSink`** 150ms ease-out.
- Tension: Guides are native-restrained; Gallery demos are tactile. This repo follows **both** by splitting **control finish** vs **overlay elevation**.

### shadcn

- Default theme tokens = colors + radius; **no** `--shadow-*` in official theming tables.
- Elevation in components = Tailwind `shadow-*` / `ring-*`; motion = `tw-animate-css` + component classes (nova flattens many `shadow-xs`).
- Custom `--shadow-*` via `cssVars.theme` is an **extension path**, not the default scaffold.

### Native

- Apple: materials + base/elevated fills; Liquid Glass for floating chrome; not a CSS shadow ramp.
- M3: elevation levels 0–5 + **state layers** (opacity overlays); motion springs; Android maps to platform elevation.
- Mapping to Gallery inset+scale is **analogy**, not 1:1.

### Industry patterns

| Pattern                    | Examples                                                            | Notes                                                    |
| -------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Elevation **levels**       | M3, MUI `shadows[0..24]`                                            | Index / level scale; press often state-layer or ripple   |
| Numeric / size **ramp**    | Fluent, Radix Themes, Tailwind, Open Props                          | `shadow-1…n` or `xs…2xl`                                 |
| Semantic **surface roles** | Gallery `finish`, DTCG elevation tokens, Radix classic inset active | Named by role/state, not blur radius                     |
| Motion tokens              | Chakra/Park durations; MUI `transitions.create`; Open Props easings | Press scale rarely a global token; often component-local |

Closest analogy to this repo’s seed: **Radix classic inset active + DTCG multi-layer shadow** for finish; **Design Guides one-shadow** for overlays; **pressSink** as explicit app-layer motion (shadcn/TW convention, not MD3).

## Capability matrix (what we can own)

| Concern                                  | Own in `@shadcn-nsh/theme`? | Mechanism                            |
| ---------------------------------------- | --------------------------- | ------------------------------------ |
| Brand colors / radius                    | Yes                         | `theme.json`                         |
| Control surface depth (raised/pressed/…) | Yes                         | `theme.ts` → `finish.*`              |
| Overlay floating shadow                  | Yes                         | `finish.popup` (shared popup family) |
| Press sink + short transitions           | Yes                         | `pressSink` / `duration` / `easing`  |
| Overlay enter/exit choreography          | Later                       | Component + NSH animation APIs       |
| Android Material elevation / iOS glass   | Document only (phase 1)     | Platform props; not dual API yet     |

## Recommendation adopted

See the [theme README](../../packages/theme/README.md): layers — **colors**, **finish** (controls + overlay `menu`), **state**, **motion** — without MUI-style shadow arrays and without claiming shadcn default parity for shadows.

### Implementation mapping (this repo)

| Layer             | Files                               | Consumers                                               |
| ----------------- | ----------------------------------- | ------------------------------------------------------- |
| Colors            | `packages/theme/theme.json`         | All styled wrappers                                     |
| Finish (controls) | `theme.ts` → `finish.control.rest`… | `packages/ui/button.tsx`                                |
| Finish (overlay)  | `finish.popup`                      | `packages/ui/lib/popup-surface.ts`, dialog/sheet chrome |
| Motion            | `pressSink`, `duration`, `easing`   | Button (and future leaf controls)                       |

Closest external analogues: Radix Themes classic inset press + DTCG semantic shadows (finish); NSH Design Guides one-shadow popups; Tailwind/shadcn `active:scale` convention (`pressSink` as a named theme helper).
