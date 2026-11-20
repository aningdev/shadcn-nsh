import { expect, open, test } from "nsh/test";

/**
 * A component's text reads its size and weight from the theme's `type` roles, so a theme with
 * another scale redraws it on the next frame: no component keeps a size of its own.
 */
test("a label's text follows the theme's type roles when the theme is switched", async () => {
  const app = await open("./theme-type.fixture.tsx", { platform: "macos", colorScheme: "light" });

  // The default theme: `label` is 14 points, weight 500, with a pointer.
  expect(app.spanStyle("text:Name")).toMatchObject({ fontSize: 14, fontWeight: 500 });
  const badge = app.spanStyle("text:Tag");

  await app.press("text:Scaled");
  expect(app.texts()).toContain("theme:scaled");
  expect(app.spanStyle("text:Name")).toMatchObject({ fontSize: 21, fontWeight: 700 });
  // The badge's weight is the `label` role's too; its size is its own and stays.
  expect(app.spanStyle("text:Tag")).toMatchObject({ fontSize: badge.fontSize, fontWeight: 700 });

  await app.press("text:Build-time");
  expect(app.spanStyle("text:Name")).toMatchObject({ fontSize: 14, fontWeight: 500 });
  expect(app.spanStyle("text:Tag")).toMatchObject(badge);
});
