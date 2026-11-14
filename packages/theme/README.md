# @shadcn-nsh/theme

[中文](./README.zh.md)

Brand look for the copy-into-app layer: this library's own, started from the upstream gallery UI theme. **Every color is `oklch()`** — tokens, the stops of a gradient, the colors of a shadow — with alpha as `oklch(… / a)`. NSH reads `oklch()` wherever a color is a string (`references/nsh/website/docs/styling.md#colors`), so one file holds one form of color and a value reads as the lightness and the hue it is.

| File             | Role                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `theme.json`     | Colors, radii, cssVars                                                |
| `finishes.json`  | Surface finishes: gradients and shadows                               |
| `theme.ts`       | Readers: `colors`, `finish`, `focusRing`, …                           |
| `themes/<name>/` | Alternative themes, generated; `themes/shadcn/` is shadcn's `neutral` |

Consumed by [`@shadcn-nsh/ui`](../ui) and shipped as registry item `theme`. After edits: `bun scripts/theme/to-oklch.ts` (keeps every color of the two files canonical), then `bun run registry:build` and commit `public/r`.

The two files are this library's own (`"owned"` in [`port-map.json`](../../port-map.json)): `port:vendor` no longer refills them and `port:check` does not compare them with upstream, so they are edited here like any other source ([`docs/port.md`](../../docs/port.md#主题文件)). The look still follows the upstream gallery UI theme; what changed is who owns the data.

`themes/shadcn/` is generated — `bun scripts/theme/generate-shadcn.ts` — from shadcn's own `oklch()` palette, never edited by hand. `bun scripts/theme/to-oklch.ts` converts and normalizes the default files the same way, and both are idempotent: the form is the file's own.

Values are written at a fixed precision (L and C five decimals, H three, alpha three), which is what makes the conversion lossless: every sRGB color lands back on its own 8-bit channels, so storing the theme as `oklch()` moves no pixel.

Rules: [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md). Toolchain / baseline: [`docs/toolchain.md`](../../docs/toolchain.md).

```sh
bun run test:unit   # the oklch round trip, the theme contract among other unit tests
```

Replace `theme.json` + `finishes.json` together to rebrand; keep the keys the upstream theme declares so finishes resolve.
