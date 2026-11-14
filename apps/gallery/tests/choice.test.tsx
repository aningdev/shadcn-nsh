import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);

test("a toggle, a checkbox and a radio take a press and report it", async () => {
  const app = await open("./choice.fixture.tsx");
  expect(has(app.texts(), "pressed=false")).toBe(true);
  await app.press("text:Bold");
  await app.press("text:Agree");
  await app.press("text:Option B");
  await app.wait(50);
  expect(has(app.texts(), "pressed=true")).toBe(true);
  expect(has(app.texts(), "checked=true")).toBe(true);
  expect(has(app.texts(), "option=b")).toBe(true);
});

test("a switch and a toggle in a group take a press and report it", async () => {
  const app = await open("./choice.fixture.tsx");
  await app.press("text:Wi-Fi");
  await app.press("text:Left");
  await app.wait(50);
  expect(has(app.texts(), "wifi=true")).toBe(true);
  expect(has(app.texts(), "left=true")).toBe(true);
});

test("a toggle follows a value changed after mount (its label turns from muted to text)", async () => {
  const app = await open("./choice.fixture.tsx");
  const before = app.spanStyle("text:Bold").color;
  await app.press("text:Press it");
  await app.wait(50);
  expect(app.spanStyle("text:Bold").color).not.toBe(before);
});

test("a checkbox checked after mount reports checked", async () => {
  const app = await open("./choice.fixture.tsx");
  expect(has(app.texts(), "checked=false")).toBe(true);
  await app.press("text:Check it");
  await app.wait(50);
  expect(has(app.texts(), "checked=true")).toBe(true);
  // The box's mark and fill are compared against the reference page by `port:render`
  // (its checkbox case presses a row after the page opened).
});
