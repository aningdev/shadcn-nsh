import { expect, open, test } from "nsh/test";

test("a DatePickerTrigger takes the test id and the name it is given", async () => {
  const app = await open("./date-trigger.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.count("id:due-date")).toBe(1);
  expect(app.count("label:Due date")).toBe(1);
  await app.press("id:due-date");
  await app.waitFor("text:15");
});
