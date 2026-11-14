# 草稿：给上游 longbridge/nsh 的 issue（未发布）

> 状态：**草稿，未发布**。发布需用户确认。目标仓库：`longbridge/nsh`，范围：`examples/nsh-gallery-ui`。英文正文如下（上游 issue 用英文）。

---

**Title:** nsh-gallery-ui: read the remaining hard-coded radii, alphas and focus halo from the theme

**Body:**

`examples/nsh-gallery-ui` already reads almost all of its look from data: colors from `theme.json` and depth from `finishes.json` (`finish.raised`, `finish.pressed`, …). That makes it possible to restyle the whole gallery by swapping those two files — we tried a flat, monochrome theme (shadcn's neutral palette) on a downstream port of the gallery and 16 controls followed it without a code change.

A handful of values are still written into the looks, so a second theme cannot reach them. Moving them into the theme would let every app that builds on the gallery restyle it as a whole, and keep the default theme exactly as it is today (the defaults would be the current numbers).

| What                               | Where (at `v0.5.1`)                                                                                                                                | Today                                                                    | Proposal                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Focus halo                         | `theme.ts:313`                                                                                                                                     | `rgba(160,170,190,0.14)` / `rgba(100,110,130,0.14)`, not a token         | derive from `ring` (e.g. `alpha(colors.ring, …)`) or add a `ring-halo` token                |
| Hover fill                         | `theme.ts:294` (`hovered`)                                                                                                                         | `alpha(colors.text, 0.05)`                                               | a `hover` token (default: the same mix)                                                     |
| A solid fill                       | `slider.ts:75`, `look/meter.ts:45`                                                                                                                 | only `finish.fill.backgroundImage` is read, so a fill must be a gradient | fall back to `finish.fill.backgroundColor` when there is no image                           |
| Track border                       | `slider.ts`, `look/meter.ts` (the `inset 0 0 0 1px ${borderColor}, ${boxShadow}` shadow)                                                           | a finish with `boxShadow: "none"` voids the whole declaration            | join only the parts that are set                                                            |
| Corner radii outside `radius.*`    | e.g. `look/overlay.ts:138` (16), `:217` (12), `look/tool.ts:174` (10), `look/plot.ts:66` (10), `look/tabs.tsx:254` (8), `look/listbox.tsx:399` (6) | fixed numbers                                                            | `radius.card` / `radius.control` / `radius.inset`, plus a `radius-popover` token for popups |
| Fixed alphas                       | `look/button.ts` (danger 0.16–0.32, ink 0.06–0.22) and ~15 more `alpha(…, 0.x)` across `look/*`                                                    | fixed strengths                                                          | a few named tints in the theme (e.g. `danger-tint`, `danger-tint-strong`, `pressed-ink`)    |
| Hover by opacity on filled buttons | `look/button.ts:143,151,288`                                                                                                                       | `opacity: 0.94 / 0.88` (lets the surface below show through)             | a color step (e.g. `alpha(primary, 0.9)`) or a `finish.hover` for filled kinds              |
| One knob for two controls          | `finish.knob` serves the switch's knob and the slider's thumb                                                                                      | one role cannot describe both                                            | split into `knob` and `thumb`                                                               |
| Press sink                         | `look/press.ts:23` (`pressSink`, 0.97)                                                                                                             | always on                                                                | a theme (or look-level) switch, for flat styles that do not sink                            |

All of these keep today's appearance by default; they only make it themeable. Happy to send a PR for any subset if this direction is welcome.
