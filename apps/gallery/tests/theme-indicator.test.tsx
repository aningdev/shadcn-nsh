import { expect, open, test } from "nsh/test";

const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1);

/** The probe page's lines the indicator keys and the new roles change. */
const look = (texts: string[]) =>
  Object.fromEntries(
    ["inverse", "dialog", "tooltip", "inverse-fill", "field", "corners"].map((key) => [
      key,
      read(texts, key),
    ]),
  );

test("the indicator keys and the inverse, dialog and tooltip roles follow the theme selected", async () => {
  const app = await open("./theme-indicator.fixture.tsx", { platform: "macos" });

  // The build-time theme: pill tabs, a filled row, boxed fields with all four corners.
  const before = look(app.texts());
  expect(app.count("id:tabs-rule")).toBe(0);
  expect(app.count("id:nav-bar")).toBe(0);
  expect(read(app.texts(), "field")).not.toBe("0|0");
  expect(read(app.texts(), "field")?.endsWith("|0")).toBe(false);
  expect(read(app.texts(), "corners")?.startsWith("0|")).toBe(false);

  await app.press("text:Marked");
  // A tab list picks its frame when it is made: draw it again under the new theme.
  await app.press("text:Hide tabs");
  await app.press("text:Show tabs");

  const after = look(app.texts());
  expect(app.count("id:tabs-rule")).toBe(1);
  expect(app.count("id:nav-bar")).toBe(1);
  // An underline: the bottom edge alone. Top corners only: the bottom ones square.
  expect(after.field?.endsWith("|0")).toBe(true);
  expect(after.corners?.startsWith("0|")).toBe(true);
  expect(after.inverse).not.toBe(before.inverse);
  expect(after.dialog).not.toBe(before.dialog);
  expect(after.tooltip).not.toBe(before.tooltip);
  expect(after["inverse-fill"]).not.toBe(before["inverse-fill"]);

  await app.press("text:Build-time");
  await app.press("text:Hide tabs");
  await app.press("text:Show tabs");

  expect(look(app.texts())).toEqual(before);
  expect(app.count("id:tabs-rule")).toBe(0);
  expect(app.count("id:nav-bar")).toBe(0);
});
