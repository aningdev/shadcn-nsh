import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * A finish's `material` reaches the view on the next frame: `glassEffect` and `glassTintColor` ride in
 * the finish's style, the platform props come from `platformMaterial`, and a finish with
 * `material: null` (every shipped theme) keeps exactly the keys it had.
 */
test("a theme's material shows in the style and the platform props, and goes with the theme", async () => {
  const app = await open("./theme-material.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });

  // The built-in theme asks for no material: no glass keys, no platform props.
  expect(find(app.texts(), "glass=")).toBe("");
  expect(find(app.texts(), "glassEffect=")).toBe("none");
  expect(find(app.texts(), "menu=")).toBe("");
  expect(find(app.texts(), "glassProps=")).toBe("{}");
  expect(find(app.texts(), "menuProps=")).toBe("{}");

  await app.press("text:Glassy");
  // Light: glass is regular glass tinted with a token of the theme (resolved, no literal written);
  // the menu is clear glass with no tint, and asks macOS for its menu vibrancy.
  expect(find(app.texts(), "glass=")).toBe("glassEffect,glassTintColor");
  expect(find(app.texts(), "glassEffect=")).toBe("regular");
  expect(find(app.texts(), "tint=")).not.toBe("none");
  expect(find(app.texts(), "tint=")).not.toContain("var(");
  expect(find(app.texts(), "menu=")).toBe("glassEffect");
  expect(find(app.texts(), "menuEffect=")).toBe("clear");
  expect(JSON.parse(find(app.texts(), "glassProps=")!)).toEqual({
    ios: { backdropMaterial: "thin" },
    windows: { backdrop: { material: "blur" } },
  });
  expect(JSON.parse(find(app.texts(), "menuProps=")!)).toEqual({
    macos: { backdrop: { material: "menu", blending: "behindWindow", state: "active" } },
  });
  // A finish the theme leaves at null stays as it was.
  expect(find(app.texts(), "card=")).toBe("|{}");

  await app.press("text:Build-time");
  expect(find(app.texts(), "glass=")).toBe("");
  expect(find(app.texts(), "glassEffect=")).toBe("none");
  expect(find(app.texts(), "menu=")).toBe("");
  expect(find(app.texts(), "glassProps=")).toBe("{}");
  expect(find(app.texts(), "menuProps=")).toBe("{}");
});

test("the material follows the appearance", async () => {
  const app = await open("./theme-material.fixture.tsx", {
    platform: "macos",
    colorScheme: "dark",
  });
  await app.press("text:Glassy");
  // Dark: glass is clear glass with no tint; the menu asks for nothing.
  expect(find(app.texts(), "glass=")).toBe("glassEffect");
  expect(find(app.texts(), "glassEffect=")).toBe("clear");
  expect(find(app.texts(), "menu=")).toBe("");
  expect(find(app.texts(), "menuProps=")).toBe("{}");
});
