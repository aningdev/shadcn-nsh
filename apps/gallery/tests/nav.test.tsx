import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);
const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("Tabs rove with the keyboard and a disabled tab does not select", async () => {
  // Arrows move a tab list only where presses are keyboard stops (macOS, the web).
  const app = await open("./nav.fixture.tsx", { platform: "macos" });
  expect(has(app.texts(), "tab=one")).toBe(true);
  await app.keyboard.press("tab");
  await app.keyboard.press("right");
  await app.wait(50);
  expect(has(app.texts(), "tab=two")).toBe(true);
  await app.keyboard.press("right");
  await app.wait(50);
  expect(has(app.texts(), "tab=one")).toBe(true);
  await expect(app.press("text:Three")).rejects.toMatchObject({ code: "ERR_NSH_TEST_DISABLED" });
  expect(has(app.texts(), "tab=one")).toBe(true);
});

test("an Accordion opens and closes, and a disabled section stays shut", async () => {
  const app = await open("./nav.fixture.tsx");
  expect(has(app.texts(), "open=")).toBe(true);
  await app.press("text:Shipping");
  await app.wait(50);
  expect(has(app.texts(), "open=ship")).toBe(true);
  expect(has(app.texts(), "Ships in two days")).toBe(true);
  await app.press("text:Shipping");
  await app.wait(50);
  expect(has(app.texts(), "open=")).toBe(true);
  await expect(app.press("text:Locked")).rejects.toMatchObject({ code: "ERR_NSH_TEST_DISABLED" });
  expect(has(app.texts(), "open=")).toBe(true);
});

test("an Accordion with multiple keeps both sections, and a Collapsible toggles", async () => {
  const app = await open("./nav.fixture.tsx");
  await app.press("text:Alpha");
  await app.press("text:Beta");
  await app.wait(50);
  expect(has(app.texts(), "multi=a,b")).toBe(true);
  await app.press("text:Details");
  await app.wait(50);
  expect(has(app.texts(), "shown=true")).toBe(true);
  expect(has(app.texts(), "More about this row")).toBe(true);
});

test("a Link reports the open, and Pagination moves a page", async () => {
  const app = await open("./nav.fixture.tsx");
  await app.press("text:Docs");
  await app.press("text:2");
  await app.wait(50);
  expect(has(app.texts(), "opened=true")).toBe(true);
  expect(has(app.texts(), "page=2")).toBe(true);
});

test("tabs, a link and pagination are compact with a pointer and roomier on a touch screen", async () => {
  const desktop = await open("./nav.fixture.tsx", { platform: "macos" });
  const touch = await open("./nav.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(desktop.texts(), "tabs=")).toBe("30");
  expect(find(desktop.texts(), "link=")).toBe("24|undefined");
  expect(find(desktop.texts(), "pages=")).toBe("32|40");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  expect(find(touch.texts(), "tabs=")).toBe("52");
  expect(find(touch.texts(), "link=")).toBe("32|6");
  expect(find(touch.texts(), "pages=")).toBe("44|44");
});
