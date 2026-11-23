import { expect, open, test } from "nsh/test";

const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1);

/** The probe page's lines the control dimensions and the inverse, modal and tooltip roles change. */
const look = (texts: string[]) =>
  Object.fromEntries(
    ["nav-width", "inverse", "modal", "tooltip", "inverse-fill", "field", "corners"].map((key) => [
      key,
      read(texts, key),
    ]),
  );

test("the indicator presets and the inverse, modal and tooltip roles follow the theme selected", async () => {
  const app = await open("./theme-indicator.fixture.tsx", { platform: "macos" });

  // The build-time theme ("base"): pill tabs, a filled row, boxed fields with all four corners.
  const before = look(app.texts());
  expect(before["nav-width"]).toBe("2");
  expect(app.count("id:tabs-rule")).toBe(0);
  expect(app.count("id:nav-bar")).toBe(0);
  expect(read(app.texts(), "field")).not.toBe("0|0");
  expect(read(app.texts(), "field")?.endsWith("|0")).toBe(false);
  expect(read(app.texts(), "corners")?.startsWith("0|")).toBe(false);
  expect(read(app.texts(), "frame")).toContain("outline-2");

  // Material ("material"): underline tabs, filled nav row, underlined fields with top corners only.
  await app.press("text:Material");
  await app.press("text:Hide tabs");
  await app.press("text:Show tabs");

  const material = look(app.texts());
  expect(material["nav-width"]).toBe("3");
  expect(app.count("id:tabs-rule")).toBe(1);
  expect(app.count("id:nav-bar")).toBe(0);
  expect(material.field?.endsWith("|0")).toBe(true);
  expect(material.corners?.startsWith("0|")).toBe(true);
  expect(read(app.texts(), "frame")).toContain("border-muted-foreground");
  expect(read(app.texts(), "frame")).not.toContain("border-b-muted-foreground");
  // The line alone takes the accent, `focus.width` (3) wide, and no ring is drawn.
  expect(read(app.texts(), "frame")).not.toContain("outline-2");

  // Marked ("winui"): underline tabs, a leading nav bar, fields boxed all round like the base's with
  // the muted line as their bottom edge, and all four corners.
  await app.press("text:Marked");
  // A tab list picks its frame when it is made: draw it again under the new theme.
  await app.press("text:Hide tabs");
  await app.press("text:Show tabs");

  const after = look(app.texts());
  expect(after["nav-width"]).toBe("3");
  expect(app.count("id:tabs-rule")).toBe(1);
  expect(app.count("id:nav-bar")).toBe(1);
  expect(after.field).toBe(before.field);
  expect(after.corners?.startsWith("0|")).toBe(false);
  // A hairline box over an input-colored bottom edge (WinUI's TextBox), unchanged under the pointer;
  // with the keys the bottom edge alone takes the accent, `focus.width` (2) wide, in place of the ring.
  expect(read(app.texts(), "frame")).toContain("border-border border-b-input");
  expect(read(app.texts(), "frame")).not.toContain("hover:border-faint");
  expect(read(app.texts(), "frame")).toContain("focus-within:border-b-brand");
  expect(read(app.texts(), "frame")).toContain("focus-within:border-b-[2px]");
  expect(read(app.texts(), "frame")).not.toContain("outline-2");
  expect(after.inverse).not.toBe(before.inverse);
  expect(after.modal).not.toBe(before.modal);
  expect(after.tooltip).not.toBe(before.tooltip);
  expect(after["inverse-fill"]).not.toBe(before["inverse-fill"]);

  await app.press("text:Build-time");
  await app.press("text:Hide tabs");
  await app.press("text:Show tabs");

  expect(look(app.texts())).toEqual(before);
  expect(app.count("id:tabs-rule")).toBe(0);
  expect(app.count("id:nav-bar")).toBe(0);
});
