import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("Dates: a Calendar picks a day, skips a disabled day, and opens the month view", async () => {
  const app = await open("./date.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("role:button[2026-03-15]");
  await app.wait(50);
  expect(app.texts()).toContain("day=2026-03-15");
  await app.press("text:March");
  await app.waitFor("text:Jan");
  expect(app.texts().some((line) => line === "Jun" || line.includes("Jun"))).toBe(true);
});

test("Dates: a Calendar range completes on the second day", async () => {
  const app = await open("./date.fixture.tsx", { platform: "macos", reducedMotion: true });
  // March also shows the next month's first days, so the April calendar is the second match.
  await app.press("role:button[2026-04-02] >> nth=1");
  await app.press("role:button[2026-04-05]");
  await app.wait(50);
  expect(app.texts()).toContain("range=2026-04-02..2026-04-05");
});

test("Dates: a Calendar moves from the selected day with the keyboard", async () => {
  const app = await open("./date.fixture.tsx", { platform: "macos", reducedMotion: true });
  // Header buttons take the first stops; the day grid is the next and lands on the 10th.
  for (let i = 0; i < 5; i++) await app.keyboard.press("tab");
  await app.keyboard.press("right");
  await app.keyboard.press("enter");
  await app.wait(50);
  expect(app.texts()).toContain("day=2026-03-11");
  // Six more days: the disabled 16th is skipped, so this is the 17th.
  for (let i = 0; i < 6; i++) await app.keyboard.press("right");
  await app.keyboard.press("enter");
  await app.wait(50);
  expect(app.texts()).toContain("day=2026-03-17");
});

test("Dates: a TimeField steps the hour and follows a new value", async () => {
  const app = await open("./date.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:09");
  await app.keyboard.press("up");
  await app.wait(50);
  expect(app.texts()).toContain("time=10:30");
  await app.press("text:Set time");
  await app.waitFor("text:11");
  expect(app.texts()).toContain("time=11:11");
});

test("Dates: a DatePicker opens, picks a day, and closes", async () => {
  const app = await open("./date.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:2031-06-10");
  await app.waitFor("text:open=true");
  await app.press("role:button[2031-06-03]");
  await app.wait(50);
  expect(app.texts()).toContain("due=2031-06-03");
  expect(app.texts()).toContain("open=false");
});

test("Dates: a calendar, a date picker, and a time field are roomier on a touch screen", async () => {
  const desktop = await open("./date.fixture.tsx", { platform: "macos" });
  const touch = await open("./date.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  expect(find(desktop.texts(), "calendar-size=")).toBe("30|16|13");
  expect(find(touch.texts(), "calendar-size=")).toBe("42|16|15");
  expect(find(desktop.texts(), "picker-size=")).toBe("32|180");
  expect(find(touch.texts(), "picker-size=")).toBe("44|0");
  expect(find(desktop.texts(), "popup=")).toBe("popup|6|none");
  expect(find(touch.texts(), "popup=")).toBe("sheet|20|20|70%|10|34");
  expect(find(desktop.texts(), "time-size=")).toBe("32");
  expect(find(touch.texts(), "time-size=")).toBe("44");
});
