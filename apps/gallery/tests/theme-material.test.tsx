import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * A finish's `material` reaches the view on the next frame: its recipe's `glassEffect` and the
 * layer's own fill as `glassTintColor` ride in the finish's style, the platform props come from
 * `platformMaterial`, and a finish that asks for nothing (`material: "none"`, every shipped layer of
 * the build-time theme) keeps exactly the keys it had.
 */
test("a theme's material shows in the style and the platform props, and goes with the theme", async () => {
  const app = await open("./theme-material.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });

  // The built-in theme asks for no material: no glass keys, no platform props, no elevation.
  expect(find(app.texts(), "glass=")).toBe("");
  expect(find(app.texts(), "glassEffect=")).toBe("none");
  expect(find(app.texts(), "menu=")).toBe("");
  expect(find(app.texts(), "glassProps=")).toBe("{}");
  expect(find(app.texts(), "menuProps=")).toBe("{}");
  expect(find(app.texts(), "raisedProps=")).toBe("{}");

  await app.press("text:Glassy");
  // Light: glass is the system glass tinted with the layer's own fill (resolved, no literal
  // written), the menu is glass at 6 points of elevation, and the raised layer is acrylic.
  expect(find(app.texts(), "glass=")).toBe("glassEffect,glassTintColor");
  expect(find(app.texts(), "glassEffect=")).toBe("regular");
  expect(find(app.texts(), "tint=")).not.toBe("none");
  expect(find(app.texts(), "tint=")).not.toContain("var(");
  expect(find(app.texts(), "menu=")).toBe("glassEffect,glassTintColor");
  expect(find(app.texts(), "menuEffect=")).toBe("regular");
  expect(JSON.parse(find(app.texts(), "glassProps=")!)).toEqual({
    ios: { backdropMaterial: "regular" },
  });
  expect(JSON.parse(find(app.texts(), "menuProps=")!)).toEqual({
    ios: { backdropMaterial: "regular" },
    android: { elevation: 6 },
  });
  expect(JSON.parse(find(app.texts(), "raisedProps=")!)).toEqual({
    windows: { backdrop: { material: "blur" } },
  });
  // A finish the theme leaves at none stays as it was.
  expect(find(app.texts(), "card=")).toBe("|{}");

  await app.press("text:Build-time");
  expect(find(app.texts(), "glass=")).toBe("");
  expect(find(app.texts(), "glassEffect=")).toBe("none");
  expect(find(app.texts(), "menu=")).toBe("");
  expect(find(app.texts(), "glassProps=")).toBe("{}");
  expect(find(app.texts(), "menuProps=")).toBe("{}");
  expect(find(app.texts(), "raisedProps=")).toBe("{}");
});

test("the material follows the appearance", async () => {
  const app = await open("./theme-material.fixture.tsx", {
    platform: "macos",
    colorScheme: "dark",
  });
  await app.press("text:Glassy");
  // Dark: the glass becomes acrylic — no glass keys, the window's blur instead — and the menu asks
  // for nothing at all.
  expect(find(app.texts(), "glass=")).toBe("");
  expect(find(app.texts(), "glassEffect=")).toBe("none");
  expect(JSON.parse(find(app.texts(), "glassProps=")!)).toEqual({
    windows: { backdrop: { material: "blur" } },
  });
  expect(find(app.texts(), "menu=")).toBe("");
  expect(find(app.texts(), "menuProps=")).toBe("{}");
  expect(find(app.texts(), "raisedProps=")).toBe("{}");
});
