import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * A component's corners, line widths, control heights, fades and touch target come from the
 * theme's `shape`, `stroke`, `size`, `state` and `icon` roles, so a theme with other values
 * redraws it on the next frame: no component keeps a value of its own.
 */
test("corners, strokes, heights and fades follow the theme's roles when the theme is switched", async () => {
  const app = await open("./theme-shape.fixture.tsx", { platform: "macos", colorScheme: "light" });

  // The default theme: control 8, container 12, modal 14, button follows control (corners.button: "radius").
  expect(find(app.texts(), "roles=")).toBe("8|12|14|8");
  expect(find(app.texts(), "dialog=")).toBe("14|1");
  expect(find(app.texts(), "field=")).toBe("8|1");
  // Concentric: 3 points inside 8 is 5, and an inset past the radius stops at 0.
  expect(find(app.texts(), "concentric=")).toBe("5|0");
  expect(find(app.texts(), "button=")).toBe("28|8|1");
  expect(find(app.texts(), "fade=")).toBe("0.5|0.7|false");
  expect(find(app.texts(), "disabledMode=")).toBe("fade|false");
  expect(find(app.texts(), "sizes=")).toBe("24|34|14|0|1|1");

  await app.press("text:Reshaped");
  expect(app.texts()).toContain("theme:reshaped");
  expect(find(app.texts(), "roles=")).toBe("20|28|30|20");
  expect(find(app.texts(), "dialog=")).toBe("30|2");
  expect(find(app.texts(), "field=")).toBe("20|2");
  expect(find(app.texts(), "concentric=")).toBe("17|0");
  expect(find(app.texts(), "button=")).toBe("36|20|2");
  expect(find(app.texts(), "fade=")).toBe("0.3|0.5|true");
  expect(find(app.texts(), "disabledMode=")).toBe("fill|true");
  expect(find(app.texts(), "sizes=")).toBe("30|44|18|48|2|2");

  // Switching shape.corners.button to "full" turns shape.button and buttons into capsules (999) while fields stay on control (20).
  await app.press("text:Capsule");
  expect(app.texts()).toContain("theme:capsule-buttons");
  expect(find(app.texts(), "roles=")).toBe("20|28|30|999");
  expect(find(app.texts(), "field=")).toBe("20|2");
  expect(find(app.texts(), "button=")).toBe("36|999|2");

  await app.press("text:Build-time");
  expect(find(app.texts(), "roles=")).toBe("8|12|14|8");
  expect(find(app.texts(), "button=")).toBe("28|8|1");
  expect(find(app.texts(), "sizes=")).toBe("24|34|14|0|1|1");
});
