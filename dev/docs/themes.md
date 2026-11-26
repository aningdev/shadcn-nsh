# Themes (/dev/docs/themes)

## One look, more than one palette [#one-look-more-than-one-palette]

A theme is one `AppTheme`: `theme.json` (base tokens: colours, three `radius-*` layer lengths, and fonts),
`semantics.json` (cross-platform semantics: style groups and `shared` + sparse `light` / `dark`
finishes, referencing tokens with `{token}`) and the `index.ts` that names it. An app is _built_
with one theme and can _carry_ more, switching between them while it runs with `selectTheme`.

Every demo on this site can be drawn in any of these palettes: pick one with the **Demo theme**
switch in the nav, and the previews load again in it. The panel above is the showcase — buttons, a
card with a field, badges, switches, a slider and a progress bar, with the card, inset and press finishes
the palette brings. The list is `apps/website/demos/palettes.ts`. Each palette has its own page,
with the same sections: how to install it, every token it sets, and every finish it draws. Those
pages read each theme's `theme.json` and `semantics.json`, following the
[design-semantics standard](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/design-semantics.md)
and the [theme roles spec](https://github.com/aningdev/shadcn-nsh/blob/main/docs/specs/theme-roles.md).

## Radii by role [#radii-by-role]

`theme.json` states one corner radius per layer in `cssVars.theme` — `radius-control` (in-page
elements), `radius-container` (cards, menus, popovers, toasts) and `radius-modal` (dialogs, sheets) —
and `controls().button.corner.*` makes buttons capsules (`material`, touch `apple`) or points / `control` (the rest). A surface nested in
another takes the concentric corner, `rounded(outer, inset)`. Every corner that reads a theme radius
uses `shape.curve` (`"continuous"` or `"circular"`), which `rounded()` applies in one place.

<ThemeIndex />