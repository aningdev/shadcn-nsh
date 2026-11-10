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

test("a toggle follows a value changed after mount (its label turns from muted to text)", async () => {
  const app = await open("./choice.fixture.tsx");
  const before = app.spanStyle("text:Bold").color;
  await app.press("text:Press it");
  await app.wait(50);
  expect(app.spanStyle("text:Bold").color).not.toBe(before);
});
