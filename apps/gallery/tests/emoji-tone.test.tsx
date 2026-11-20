import { expect, open, test } from "nsh/test";

// The chosen hand's fill is `selectedStyle` on the hand's own view (it announces
// `accessibilityState.selected`): the look no longer picks the background in JS.
test("a tone's chosen fill comes from its selected state", async () => {
  const app = await open("./emoji-tone.fixture.tsx");
  await app.press("label:Default skin tone");
  await app.wait(50);
  // Open: exactly one hand is chosen, and its fill is the page's.
  const chosen = app.viewStyle("label:Default skin tone")?.backgroundColor;
  const other = app.viewStyle("label:Dark skin tone")?.backgroundColor;
  expect(chosen).not.toBe(other);
  // Another tone: the fill follows the state to the hand that is now chosen.
  await app.press("label:Medium skin tone");
  await app.wait(50);
  await app.press("label:Medium skin tone");
  await app.wait(50);
  expect(app.viewStyle("label:Medium skin tone")?.backgroundColor).toBe(chosen);
  expect(app.viewStyle("label:Dark skin tone")?.backgroundColor).toBe(other);
});

test("the pointer over the chosen hand keeps its fill", async () => {
  const app = await open("./emoji-tone.fixture.tsx", { platform: "macos" });
  await app.press("label:Default skin tone");
  await app.wait(50);
  const rest = app.viewStyle("label:Dark skin tone")?.backgroundColor;
  await app.hover("label:Dark skin tone");
  await app.wait(200);
  // The pointer does show on a hand that is not chosen.
  expect(app.viewStyle("label:Dark skin tone")?.backgroundColor).not.toBe(rest);
  const chosen = app.viewStyle("label:Default skin tone")?.backgroundColor;
  await app.hover("label:Default skin tone");
  await app.wait(200);
  expect(app.viewStyle("label:Default skin tone")?.backgroundColor).toBe(chosen);
});
