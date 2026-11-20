import { expect, open, test } from "nsh/test";

test("the bar drags the window and leaves the app's own controls pressable", async () => {
  const app = await open("./title-bar.fixture.tsx", { platform: "macos" });
  expect(app.shows("id:bar")).toBe(true);
  await app.press("text:Save");
  await app.waitFor("text:pressed=1");
  expect(app.texts()).toContain("pressed=1");
});

test("each kind names the window's own buttons, and only those", async () => {
  const app = await open("./title-bar.fixture.tsx", { platform: "macos" });
  for (const label of ["Close", "Minimize", "Zoom"]) {
    expect(app.count(`id:lights >> label:${label}`)).toBe(1);
  }
  for (const label of ["Close", "Minimize", "Maximize"]) {
    expect(app.count(`id:caption >> label:${label}`)).toBe(1);
  }
  // macOS's zoom is Windows' maximize: neither kind carries the other platform's name.
  expect(app.count("id:caption >> label:Zoom")).toBe(0);
  expect(app.count("label:Maximize")).toBe(1);
});

test("the traffic lights wear their own roles' tones, and a caption cell fills on hover only", async () => {
  const app = await open("./title-bar.fixture.tsx", { platform: "macos" });
  const tones = ["Close", "Minimize", "Zoom"].map(
    (label) => app.viewStyle(`id:lights >> label:${label}`)?.backgroundColor,
  );
  // Close, minimize and zoom are three window-control roles, so three different fills.
  expect(new Set(tones).size).toBe(3);
  expect(tones.every((tone) => tone !== undefined)).toBe(true);

  const cell = "id:caption >> label:Close";
  expect(app.viewStyle(cell)?.backgroundColor).toBeUndefined();
  await app.hover(cell);
  expect(app.viewStyle(cell)?.backgroundColor).toBeDefined();
});
