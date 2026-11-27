import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("a Select opens from the keyboard, skips a disabled item, and picks the next", async () => {
  const app = await open("./listbox.fixture.tsx", { platform: "macos" });
  await app.keyboard.press("tab");
  await app.keyboard.press("down");
  await app.waitFor("text:Banana");
  await app.keyboard.press("down");
  await app.keyboard.press("enter");
  await app.wait(50);
  expect(app.texts()).toContain("value=cherry");
});

test("a Combobox picks one value, and a multiple Combobox keeps several", async () => {
  const app = await open("./listbox.fixture.tsx");
  await app.press("id:framework");
  await app.waitFor("text:React");
  await app.press("text:React");
  await app.wait(50);
  expect(app.texts()).toContain("combo=react");
  await app.press("id:tags");
  await app.waitFor("text:Blue");
  await app.press("text:Blue");
  await app.press("text:Red");
  await app.wait(50);
  const tags = app.texts().find((line) => line.startsWith("tags=")) ?? "";
  expect(tags).toContain("red");
  expect(tags).toContain("blue");
});

test("a ComboboxChip inside the root draws, and a narrow Select opens", async () => {
  const app = await open("./listbox.fixture.tsx", { platform: "macos" });
  expect(app.texts()).toContain("Side");
  expect(find(app.texts(), "slider-fill=")).toBe(
    "0%|50%|native|flex-col-reverse items-center gap-1",
  );
  await app.press("label:Narrow fruit");
  await app.waitFor("text:Narrow apple");
});

test("a Combobox draws its values as chips, and a chip's remove drops its value", async () => {
  const app = await open("./listbox.fixture.tsx");
  // The chip shows the item's title, not its value.
  expect(app.texts()).toContain("Red");
  await app.press("label:Remove Red");
  await app.wait(50);
  expect(find(app.texts(), "chips=")).toBe("");
  expect(app.texts()).not.toContain("Red");
  // A disabled Combobox dims its chips and their remove button takes no press.
  expect(app.texts()).toContain("Blue");
  await expect(app.press("label:Remove Blue")).rejects.toThrow();
  expect(find(app.texts(), "chips=")).toBe("");
  // The same remove drops a default value from an uncontrolled Combobox.
  expect(app.texts()).toContain("Green");
  await app.press("label:Remove Green");
  await app.wait(50);
  expect(app.texts()).not.toContain("Green");
});

test("a select and a combobox are compact with a pointer and roomier on a touch screen", async () => {
  const desktop = await open("./listbox.fixture.tsx", { platform: "macos" });
  const touch = await open("./listbox.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  // Trigger 32×180, row 30. Touch: 44 (`dimension.size.hit.touch`), no min width, row 44.
  expect(find(desktop.texts(), "select-size=")).toBe("32|180|30");
  expect(find(touch.texts(), "select-size=")).toBe("44|0|44");
  expect(desktop.layout("id:fruit")?.height).toBe(32);
  expect(desktop.layout("id:fruit")?.width).toBeGreaterThanOrEqual(180);
  expect(touch.layout("id:fruit")?.height).toBe(44);
  expect(find(desktop.texts(), "combo-size=")).toBe("32|30");
  expect(find(touch.texts(), "combo-size=")).toBe("44|44");
  // Pointer: floating popup, padding 6. Touch: bottom sheet, top radius 20, max 70%, pad 34.
  expect(find(desktop.texts(), "popup=")).toBe("popup|4|4|none");
  expect(find(touch.texts(), "popup=")).toBe("sheet|14|14|70%|8|34");
  // The title is resolved after the item registers, not stuck on the placeholder.
  expect(desktop.texts().join("\n").includes("Apple pie")).toBe(true);
});

test("a SelectTrigger takes the test id and the name it is given", async () => {
  const app = await open("./listbox.fixture.tsx");
  expect(app.count("id:fruit")).toBe(1);
  expect(app.count("label:Fruit")).toBe(1);
});

test("a ComboboxTrigger takes the test id and the name it is given", async () => {
  const app = await open("./listbox.fixture.tsx");
  expect(app.count("id:framework")).toBe(1);
  expect(app.count("label:Show frameworks")).toBe(1);
});
