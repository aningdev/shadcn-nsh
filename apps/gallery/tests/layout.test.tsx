import { expect, open, test } from "nsh/test";

const has = (texts: string[], line: string) => texts.includes(line);
const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

test("a ResizablePanelGroup reports sizes after a handle drag and hides a collapsed panel", async () => {
  const app = await open("./layout.fixture.tsx");
  expect(has(app.texts(), "Files")).toBe(true);
  expect(has(app.texts(), "Sidebar hidden")).toBe(true);
  expect(has(app.texts(), "Secret")).toBe(false);
  expect(find(app.texts(), "sizes=")).toBe("none");
  await app.drag("label:Resize the sidebar", { x: 40 });
  await app.wait(80);
  expect(find(app.texts(), "sizes=")).not.toBe("none");
});

test("a Resizable handle is a vertical hairline across a row and opts out of the thumb scale under reduced motion", async () => {
  const app = await open("./layout.fixture.tsx", { reducedMotion: true });
  expect(find(app.texts(), "across=")).toContain("h-full w-px");
  expect(find(app.texts(), "along=")).toContain("h-px w-full");
  expect(find(app.texts(), "thumb=")).toContain("group-active:");
  expect(find(app.texts(), "thumb=")).toContain("group-hover:");
});

test("a DockArea shows a tab group and selects another tab", async () => {
  const app = await open("./layout.fixture.tsx");
  expect(has(app.texts(), "active=Readme")).toBe(true);
  expect(has(app.texts(), "Files")).toBe(true);
  await app.press("text:Main");
  await app.wait(50);
  expect(has(app.texts(), "active=Main")).toBe(true);
});

test("a Carousel disables previous at the start and next at the end, and a dot picks a slide", async () => {
  const app = await open("./layout.fixture.tsx");
  expect(find(app.texts(), "start=")).toBe("0");
  expect(app.enabled("label:Previous start")).toBe(false);
  await app.press("label:Next start");
  await app.wait(50);
  expect(find(app.texts(), "start=")).toBe("1");
  await app.press("label:start slide 3");
  await app.wait(50);
  expect(find(app.texts(), "start=")).toBe("2");
  expect(app.enabled("label:Next start")).toBe(false);
});

test("a looping Carousel wraps from the last slide, and the arrow sink drops under reduced motion", async () => {
  const still = await open("./layout.fixture.tsx", { reducedMotion: true });
  expect(find(still.texts(), "loop=")).toBe("2");
  expect(still.enabled("label:Next loop")).toBe(true);
  expect(still.enabled("label:Previous loop")).toBe(true);
  await still.press("label:Next loop");
  await still.wait(50);
  expect(find(still.texts(), "loop=")).toBe("0");
  expect(find(still.texts(), "sink=")).toBe("still");
  const desktop = await open("./layout.fixture.tsx", { platform: "macos" });
  const touch = await open("./layout.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "dot=")).toBe("7");
  expect(find(touch.texts(), "dot=")).toBe("8");
  expect(find(desktop.texts(), "arrow=")).toBe("30");
  expect(find(touch.texts(), "arrow=")).toBe("38");
  expect(find(desktop.texts(), "sink=")).toBe("move");
});
