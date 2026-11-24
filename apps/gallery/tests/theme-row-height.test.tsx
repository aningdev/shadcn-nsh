import { expect, open, test } from "nsh/test";

test("Select and DatePicker triggers keep hearing presses, label lookup and keyboard after selectTheme changes the row height", async () => {
  const app = await open("./theme-row-height.fixture.tsx", {
    platform: "macos",
    reducedMotion: true,
  });

  expect(app.texts()).toContain("height=32");
  await app.press("text:Apply Material");
  await app.waitFor("text:height=40");

  // Keyboard activation before pressing triggers directly:
  // Start from top: Apply Material (1) -> Apply NSH Gallery (2) -> Theme picker (3) -> Switch via date (4) -> Fruit (5)
  for (let i = 0; i < 5; i++) await app.keyboard.press("tab");
  await app.keyboard.press("down");
  await app.waitFor("text:Newest");
  await app.keyboard.press("escape");
  await app.wait(50);

  // DatePicker via keyboard (next tab is Due date)
  await app.keyboard.press("tab");
  await app.keyboard.press("enter");
  await app.waitFor("text:Su");
  await app.keyboard.press("escape");
  await app.wait(50);

  // Select: label lookup and press
  expect(app.count("label:Fruit")).toBe(1);
  await app.press("label:Fruit");
  await app.waitFor("text:Oldest");
  await app.press("text:Oldest");
  await app.wait(50);

  // DatePicker: label lookup and press
  expect(app.count("label:Due date")).toBe(1);
  await app.press("label:Due date");
  await app.waitFor("text:Su");
  await app.keyboard.press("escape");
  await app.wait(50);

  // Switch back to build-time theme (line 28 -> 32)
  await app.press("text:Apply NSH Gallery");
  await app.waitFor("text:height=32");
  await app.press("label:Fruit");
  await app.waitFor("text:Newest");
});

test("a Select that switches the row height inside onChange opens again on the next press", async () => {
  const app = await open("./theme-row-height.fixture.tsx", {
    platform: "macos",
    reducedMotion: true,
  });

  await app.press("label:Theme picker");
  await app.waitFor("text:Material");
  await app.press("text:Material");
  await app.waitFor("text:height=40");

  await app.press("label:Theme picker");
  await app.waitFor("text:NSH Gallery");
});

test("a DatePicker that switches the row height inside onChange opens again on the next press", async () => {
  const app = await open("./theme-row-height.fixture.tsx", {
    platform: "macos",
    reducedMotion: true,
  });

  await app.press("label:Switch via date");
  await app.waitFor("text:15");
  await app.press("text:15");
  await app.waitFor("text:height=40");

  await app.press("label:Switch via date");
  await app.waitFor("text:20");
});
