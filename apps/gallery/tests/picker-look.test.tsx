import { expect, open, test } from "nsh/test";

// An off `Picker` dims through `disabledStyle`, the state the trigger carries (`disabled`).
test("an off picker trigger dims through its disabled state", async () => {
  const app = await open("./picker-look.fixture.tsx");
  const lit = app.viewStyle("label:Trigger")?.opacity;
  expect(lit).not.toBe(0.5);
  await app.press("text:Turn it off");
  await app.wait(50);
  expect(app.viewStyle("label:Trigger")?.opacity).toBe(0.5);
  await app.press("text:Turn it off");
  await app.wait(50);
  expect(app.viewStyle("label:Trigger")?.opacity).toBe(lit);
});
