/**
 * The finishes a theme derives from its `menu`: `dialog`, `tooltip` and `inverse` (`docs/specs/theme-roles.md`).
 *
 * The three themes written by generators (shadcn, Solid Glass, Apple) and the default theme paint a
 * dialog, a tooltip and a toast exactly as they paint a card, a popover and a menu, so each of the
 * three finishes is stated here from the menu rather than written three times. A theme that paints
 * them differently (material) states them itself.
 *
 * Pure: no `node:fs`.
 */

type Roles = Record<string, Record<string, unknown>>;

/** The token a finish's fill names: `{popover}` and `oklch(from {popover} l c h / 0.72)` both name `popover`. */
const fillToken = (fill: unknown): string => {
  const match = typeof fill === "string" ? fill.match(/\{([a-z0-9-]+)\}/) : null;
  if (!match) throw new Error(`the menu's fill names no token: ${String(fill)}`);
  return match[1]!;
};

/**
 * `roles` with `dialog` (the card's colour and the menu's shadow), `tooltip` (the popover's pane,
 * flat) and `inverse` (the menu, its fill read from the `inverse` token) added after `menu`.
 */
export function withSurfaces(roles: Roles): Roles {
  const menu = roles.menu;
  if (menu === undefined) throw new Error("the finishes state no menu");
  const token = fillToken(menu.background);
  const inverse = {
    ...menu,
    background: (menu.background as string).replace(`{${token}}`, "{inverse}"),
    foreground: "{muted-foreground}",
  };
  return Object.fromEntries(
    Object.entries(roles).flatMap(([role, finish]) =>
      role === "menu"
        ? [
            [role, finish],
            [
              "dialog",
              {
                background: "{dialog}",
                shadow: menu.shadow,
                "border-color": "{border}",
                material: null,
              },
            ],
            [
              "tooltip",
              {
                background: "{popover}",
                shadow: "none",
                "border-color": "{border}",
                material: null,
              },
            ],
            ["inverse", inverse],
          ]
        : [[role, finish]],
    ),
  );
}
