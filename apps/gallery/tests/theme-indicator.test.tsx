import { expect, open, test } from "nsh/test";

const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1);

/** The probe page's lines the field's dimension and the inverse, modal and tooltip roles change. */
const look = (texts: string[]) =>
  Object.fromEntries(
    ["inverse", "modal", "tooltip", "inverse-fill", "field", "corners"].map((key) => [
      key,
      read(texts, key),
    ]),
  );

test("the field dimension and the inverse, modal and tooltip roles follow the theme selected", async () => {
  const app = await open("./theme-indicator.fixture.tsx", { platform: "macos" });

  // The build-time theme ("base"): boxed fields with all four corners.
  const before = look(app.texts());
  expect(read(app.texts(), "field")).not.toBe("0|0");
  expect(read(app.texts(), "field")?.endsWith("|0")).toBe(false);
  expect(read(app.texts(), "corners")?.startsWith("0|")).toBe(false);
  expect(read(app.texts(), "frame")).toContain("ring=true");
  expect(read(app.texts(), "frame")).toContain("hover=true");
  // A theme whose well states no edge of its own spreads none: the inline field look draws it.
  expect(read(app.texts(), "stroke")?.startsWith("false|")).toBe(true);

  // Material ("material"): underlined fields with top corners only.
  await app.press("text:Material");

  const material = look(app.texts());
  expect(material.field?.endsWith("|0")).toBe(true);
  expect(material.corners?.startsWith("0|")).toBe(true);
  expect(read(app.texts(), "frame")).toContain("side-muted=true");
  expect(read(app.texts(), "frame")).not.toContain("bottom-input=true");
  // The line alone takes the accent, `focus.width` (2) wide, and no ring is drawn.
  expect(read(app.texts(), "frame")).toContain("focus-bottom-brand=true");
  expect(read(app.texts(), "frame")).toContain("focus-bottom-width=2");
  expect(read(app.texts(), "frame")).toContain("ring=false");

  // Marked ("winui"): fields boxed all round like the base's with the line color as their sides
  // and `input` as their bottom edge (WinUI's TextBox), unchanged under the pointer; with the keys
  // the bottom edge alone takes the accent, `focus.width` (2) wide, in place of the ring.
  await app.press("text:Marked");

  const after = look(app.texts());
  expect(after.field).toBe(before.field);
  expect(after.corners?.startsWith("0|")).toBe(false);
  expect(read(app.texts(), "frame")).toContain("side-line=true");
  expect(read(app.texts(), "frame")).toContain("bottom-input=true");
  expect(read(app.texts(), "frame")).toContain("hover=false");
  expect(read(app.texts(), "frame")).toContain("focus-bottom-brand=true");
  expect(read(app.texts(), "frame")).toContain("focus-bottom-width=2");
  expect(read(app.texts(), "frame")).toContain("ring=false");
  // WinUI's finish.inset declares distinct side/bottom strokes, while `insetShade()` lets field edge slots draw the border.
  expect(read(app.texts(), "stroke")).toBe("true|false|true");
  expect(after.inverse).not.toBe(before.inverse);
  expect(after.modal).not.toBe(before.modal);
  expect(after.tooltip).not.toBe(before.tooltip);
  expect(after["inverse-fill"]).not.toBe(before["inverse-fill"]);

  await app.press("text:Build-time");

  expect(look(app.texts())).toEqual(before);
});
