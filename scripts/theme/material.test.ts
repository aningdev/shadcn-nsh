import { describe, expect, test } from "bun:test";

import { checkMaterial, withoutMaterial } from "./material";

const known = new Set(["glass", "card"]);
const check = (material: unknown) =>
  checkMaterial("themes/x/finishes.json", "menu.light", { material }, known);

describe("checkMaterial", () => {
  test("null and a full material pass", () => {
    expect(check(null)).toEqual([]);
    expect(
      check({
        apple: { glass: "regular", tint: "var(--glass)" },
        ios: { backdrop: "thin" },
        macos: { backdrop: "menu", blending: "behindWindow", state: "active" },
        windows: { backdrop: "blur" },
      }),
    ).toEqual([]);
  });

  test("a finish with no material is named", () => {
    const finishes = withoutMaterial({ menu: { boxShadow: "none" }, card: { boxShadow: "none" } });
    delete (finishes.menu as Record<string, unknown>).material;
    const problems = Object.entries(finishes).flatMap(([role, finish]) =>
      checkMaterial("themes/x/finishes.json", `${role}.light`, finish, known),
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

  test("a tint is a token of the theme, not a literal", () => {
    expect(check({ apple: { glass: "clear", tint: "var(--nope)" } })[0]).toContain("nope");
    expect(check({ apple: { glass: "clear", tint: "#ff0000" } })[0]).toContain("#ff0000");
    expect(
      check({ apple: { glass: "clear", tint: "oklch(from var(--card) l c h / 0.5)" } }),
    ).toEqual([]);
  });
});
