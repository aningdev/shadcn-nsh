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

test("a menu row is a 26-point line with a pointer and a 46-point finger row on a touch screen", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "menu=")).toBe("26|13|11.5|14");
  expect(find(touch.texts(), "menu=")).toBe("46|16|14|18");
});

test("a toggle is compact with a pointer and roomier, with a hit slop, on a touch screen", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "toggle=")).toBe("28|undefined");
  // 38 tall, and presses count 3 points past it: 44.
  expect(find(touch.texts(), "toggle=")).toBe("38|3");
});
