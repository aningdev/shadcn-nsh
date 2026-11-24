import { expect, open, test } from "nsh/test";

/** What the probe page rendered, by the `key:value` line each reading is. */
const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1) ?? "";

/**
 * A control rounded by a class (`numberInputClasses.frame`) and one rounded by a style
 * (`buttonLook`) name the same token, `radius-control`: the class names it in the string, the
 * style reads it as a number, so both report one corner. `selectTheme` swaps the tokens, and the
 * two move together — the class side with them, which is what the fixed Tailwind steps never did.
 */
test("a class-rounded control's corners follow the theme, like a style-rounded one's", async () => {
  const app = await open("./theme-radii.fixture.tsx", { colorScheme: "light" });

  const before = {
    token: read(app.texts(), "token"),
    style: read(app.texts(), "style"),
    theme: read(app.texts(), "theme"),
  };
  expect(before.theme).toBe("build-time");
  // The build-time theme's control tier is 8 points, read by both sides.
  expect(before.token).toBe("8");
  expect(before.style).toBe("8");
  expect(read(app.texts(), "class")).toContain("rounded-(--radius-control)");

  await app.press("text:Solid Glass");

  const after = {
    token: read(app.texts(), "token"),
    style: read(app.texts(), "style"),
    theme: read(app.texts(), "theme"),
  };
  expect(after.theme).toBe("solid-glass");
  // Solid Glass draws rounder controls (11 points), and the class side moved with them.
  expect(after.token).toBe("11");
  expect(after.style).toBe("11");
  expect(read(app.texts(), "class")).toContain("rounded-(--radius-control)");
  expect(after.token).not.toBe(before.token);

  await app.press("text:Build-time");

  expect(read(app.texts(), "token")).toBe(before.token);
  expect(read(app.texts(), "style")).toBe(before.style);
  expect(read(app.texts(), "theme")).toBe("build-time");
});
