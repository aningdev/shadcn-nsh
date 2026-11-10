import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);
const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("an Input, a NumberInput and an OtpInput report what the user enters", async () => {
  const app = await open("./field.fixture.tsx");
  expect(has(app.texts(), "value=")).toBe(true);
  await app.type("id:name", "Ada");
  await app.press("text:▲");
  await app.type("id:code", "1234");
  await app.wait(50);
  expect(has(app.texts(), "value=Ada")).toBe(true);
  expect(has(app.texts(), "qty=2")).toBe(true);
  expect(has(app.texts(), "code=1234")).toBe(true);
  expect(has(app.texts(), "done=1234")).toBe(true);
});

test("an Input follows readonly set after mount (its text turns from foreground to muted)", async () => {
  const app = await open("./field.fixture.tsx");
  // The field's own glyphs are not a span the test can read, so the ink is a text
  // painted with the same `inputVariants` the component applies, and `enabled`
  // checks the readonly flag reached the field.
  const before = app.spanStyle("text:Ink").color;
  expect(app.enabled("id:quiet")).toBe(true);
  await app.press("text:Quiet");
  await app.wait(50);
  expect(has(app.texts(), "quiet=true")).toBe(true);
  expect(app.enabled("id:quiet")).toBe(false);
  expect(app.spanStyle("text:Ink").color).not.toBe(before);
});

test("a field is compact with a pointer and roomier on a touch screen", async () => {
  const desktop = await open("./field.fixture.tsx", { platform: "macos" });
  const touch = await open("./field.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  // Input 28 vs 46. Number well 32 vs 88 (two 44-point steppers). OTP cell 36×44 text 18 vs 44×52 text 20.
  expect(find(desktop.texts(), "input=")).toBe("28");
  expect(find(touch.texts(), "input=")).toBe("46");
  expect(find(desktop.texts(), "number=")).toBe("32");
  expect(find(touch.texts(), "number=")).toBe("88");
  expect(find(desktop.texts(), "otp=")).toBe("36|44|18");
  expect(find(touch.texts(), "otp=")).toBe("44|52|20");
});
