import { describe, expect, test } from "bun:test";

import { checkGlassFallback, checkMaterial, withoutMaterial } from "./material";
import type { TokenKind } from "./tokens";

const known = new Map<string, TokenKind>([
  ["glass", "color"],
  ["card", "color"],
  ["radius-card", "dimension"],
]);
const check = (material: unknown) =>
  checkMaterial("themes/x/semantics.json", "menu.light", { material }, known);

describe("checkGlassFallback", () => {
  const glass = { apple: { glass: "regular", tint: null } };
  const fallback = (finish: Record<string, unknown>) =>
    checkGlassFallback("themes/x/semantics.json", "menu.light", finish);

  test("glass over a translucent fill needs a backdropFilter", () => {
    const fill = "oklch(from {popover} l c h / 0.72)";
    expect(fallback({ background: fill, material: glass })[0]).toContain("no backdropFilter");
    expect(fallback({ background: fill, backdropFilter: "none", material: glass })[0]).toContain(
      "menu.light",
    );
    expect(fallback({ background: "transparent", material: glass })).toHaveLength(1);
    expect(fallback({ background: fill, backdropFilter: "blur(30px)", material: glass })).toEqual(
      [],
    );
  });

  test("an opaque fill or no glass asks for nothing", () => {
    expect(fallback({ background: "{popover}", material: glass })).toEqual([]);
    expect(fallback({ background: "oklch(from {popover} l c h / 0.72)", material: null })).toEqual(
      [],
    );
    expect(
      fallback({
        background: "oklch(from {popover} l c h / 0.72)",
        material: { windows: { backdrop: "blur" } },
      }),
    ).toEqual([]);
  });
});

describe("checkMaterial", () => {
  test("null and a full material pass", () => {
    expect(check(null)).toEqual([]);
    expect(
      check({
        apple: { glass: "regular", tint: "{glass}" },
        ios: { backdrop: "thin" },
        macos: { backdrop: "menu", blending: "behindWindow", state: "active" },
        windows: { backdrop: "blur" },
        android: {
          elevation: 6,
          ripple: { color: "{card}", borderless: false, radius: 18, foreground: true },
        },
      }),
    ).toEqual([]);
  });

  test("a finish with no material is named", () => {
    const finishes = withoutMaterial({ menu: { shadow: "none" }, card: { shadow: "none" } });
    delete (finishes.menu as Record<string, unknown>).material;
    const problems = Object.entries(finishes).flatMap(([role, finish]) =>
      checkMaterial("themes/x/semantics.json", `${role}.light`, finish, known),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("menu.light.material is missing");
  });

  test("values outside NSH's lists are named", () => {
    expect(check({ apple: { glass: "frosted", tint: null } })[0]).toContain("apple.glass");
    expect(check({ ios: { backdrop: "menu" } })[0]).toContain("ios.backdrop");
    expect(check({ macos: { backdrop: "menu", state: "sleepy" } })[0]).toContain("macos.state");
    expect(check({ windows: { backdrop: "mica" } })[0]).toContain("windows.backdrop");
    expect(check({ linux: {} })[0]).toContain("linux");
    expect(check({ apple: { glass: "clear" } })[0]).toContain("apple.tint is missing");
  });

  test("a tint is a colour token of the theme, not a literal or wrong kind", () => {
    expect(check({ apple: { glass: "clear", tint: "{nope}" } })[0]).toContain("nope");
    expect(check({ apple: { glass: "clear", tint: "{radius-card}" } })[0]).toContain("dimension");
    expect(check({ apple: { glass: "clear", tint: "#ff0000" } })[0]).toContain("#ff0000");
    expect(check({ apple: { glass: "clear", tint: "oklch(from {card} l c h / 0.5)" } })).toEqual(
      [],
    );
  });

  test("android material validates elevation, ripple token colour, flags, and rejects unknown keys", () => {
    expect(check({ android: { elevation: 4 } })).toEqual([]);
    expect(check({ android: { ripple: { color: "{glass}" } } })).toEqual([]);
    expect(check({ android: { unknown: true } })[0]).toContain("android.unknown");
    expect(check({ android: { elevation: -1 } })[0]).toContain("android.elevation");
    expect(check({ android: { ripple: { color: "{card}", extra: 1 } } })[0]).toContain(
      "android.ripple.extra",
    );
    expect(check({ android: { ripple: {} } })[0]).toContain("android.ripple.color is missing");
    expect(check({ android: { ripple: { color: "#ff0000" } } })[0]).toContain("#ff0000");
    expect(
      check({ android: { ripple: { color: "oklch(from {card} l c h / 0.2)" } } })[0],
    ).toContain("oklch(from {card} l c h / 0.2)");
    expect(check({ android: { ripple: { color: "{nope}" } } })[0]).toContain("nope");
    expect(check({ android: { ripple: { color: "{radius-card}" } } })[0]).toContain("dimension");
    expect(check({ android: { ripple: { color: "{card}", borderless: "yes" } } })[0]).toContain(
      "borderless",
    );
    expect(check({ android: { ripple: { color: "{card}", foreground: 1 } } })[0]).toContain(
      "foreground",
    );
    expect(check({ android: { ripple: { color: "{card}", radius: -2 } } })[0]).toContain("radius");
  });
});
