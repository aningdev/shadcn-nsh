import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("a button is compact with a pointer and roomier, with a hit slop, on a touch screen", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(desktop.texts(), "button=")).toBe("28|undefined");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  // 40 tall, and presses count 2 points past it: 44.
  expect(find(touch.texts(), "button=")).toBe("40|2");
});

test("the switch knob sits as far from the track's end on as off", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  // width less two (border + inset) less the knob: 36 - 4 - 16, 28 - 4 - 12; then 44 - 4 - 20, 36 - 4 - 16 — the knob's own width either way.
  expect(find(desktop.texts(), "travel=")).toBe("16|12");
  expect(find(touch.texts(), "travel=")).toBe("20|16");
  const size = (texts: string[], which: 0 | 1) => {
    const part = (find(texts, "track=") ?? "").split("|")[which] ?? "";
    const [width, height] = part.split("x").map(Number);
    return { width, height };
  };
  expect(desktop.layout("label:Track")).toMatchObject(size(desktop.texts(), 0));
  expect(desktop.layout("label:Small track")).toMatchObject(size(desktop.texts(), 1));
  expect(touch.layout("label:Track")).toMatchObject(size(touch.texts(), 0));
  expect(touch.layout("label:Small track")).toMatchObject(size(touch.texts(), 1));
});

test("a standalone switch gets a 44 point target on a touch screen", async () => {
  const app = await open("./density.fixture.tsx", { platform: "ios" });
  const slop = JSON.parse(find(app.texts(), "slop=") ?? "{}");
  // 24 tall and 44 wide against 44: 10 above and below, nothing either side.
  expect(slop).toEqual({ top: 10, bottom: 10, left: 0, right: 0 });
});

test("a popover's padding and a dialog's type grow on a touch screen", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "overlay=")).toBe("14|17|13|20");
  expect(find(touch.texts(), "overlay=")).toBe("16|20|15|20");
});

test("a menu row is the theme's step under a row, its label a type role and its icon the middle one", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  // 28 high, the `body` and `detail` roles, a 16-point icon.
  expect(find(desktop.texts(), "menu=")).toBe("28|13|12|16");
  // 40 high, 15 and 13 points, a 20-point icon.
  expect(find(touch.texts(), "menu=")).toBe("40|15|13|20");
});

test("a toggle is compact with a pointer and roomier, with a hit slop, on a touch screen", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "toggle=")).toBe("28|undefined");
  // The theme's middle height, and presses count 2 points past it: 44.
  expect(find(touch.texts(), "toggle=")).toBe("40|2");
});
