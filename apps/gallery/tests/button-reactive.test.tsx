import { expect, open, test } from "nsh/test";

test("Button follows a variant that changes after mount", async () => {
  const app = await open("./button-reactive.fixture.tsx");
  const before = app.spanStyle("text:Target").color;
  await app.press("text:Flip");
  await app.wait(100);
  const after = app.spanStyle("text:Target").color;
  expect(after).not.toBe(before);
});
