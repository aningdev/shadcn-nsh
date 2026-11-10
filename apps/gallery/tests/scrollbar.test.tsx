import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("a Scrollbar follows a scroll of the list it names", async () => {
  const app = await open("./scrollbar.fixture.tsx");
  expect(find(app.texts(), "offset=")).toBe("0");
  await app.scroll("label:Inbox", 80);
  await app.wait(50);
  const next = Number(find(app.texts(), "offset="));
  expect(next).toBeGreaterThan(0);
});

test("a Scrollbar thumb drag moves that list", async () => {
  const app = await open("./scrollbar.fixture.tsx");
  await app.drag("label:Messages", { y: 40 });
  await app.wait(50);
  const next = Number(find(app.texts(), "offset="));
  expect(next).toBeGreaterThan(0);
});

test("a Scrollbar is thicker with a pointer than on a touch screen, and fades on the documented timing", async () => {
  const desktop = await open("./scrollbar.fixture.tsx", { platform: "macos" });
  const touch = await open("./scrollbar.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  expect(find(desktop.texts(), "thumb=")).toContain("w-1.5");
  expect(find(touch.texts(), "thumb=")).toContain("w-[3px]");
  expect(find(desktop.texts(), "across=")).toContain("h-1.5");
  expect(find(desktop.texts(), "motion=")).toBe("300|500");
  expect(find(desktop.texts(), "mode=")).toBe("hover");
});

test("a Scrollbar thumb transition opts out under reduced motion", async () => {
  const app = await open("./scrollbar.fixture.tsx", { reducedMotion: true });
  expect(find(app.texts(), "thumb=")).toContain("motion-reduce:transition-none");
});
