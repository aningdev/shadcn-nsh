import { expect, open, test } from "nsh/test";

test("hovering a string trigger shows the tip", async () => {
  const app = await open("./tooltip.fixture.tsx", { platform: "macos" });
  await app.hover("text:Hover A");
  await app.waitFor("text:Tip A");
});

test("hovering a custom trigger shows the tip", async () => {
  const app = await open("./tooltip.fixture.tsx", { platform: "macos" });
  await app.hover("text:Hover B");
  await app.waitFor("text:Tip B");
});

test("trigger follows a disabled that changes after mount", async () => {
  const app = await open("./tooltip.fixture.tsx", { platform: "macos" });
  await app.press("text:Flip");
  await app.wait(100);
  expect(app.enabled("text:Hover A")).toBe(false);
});
