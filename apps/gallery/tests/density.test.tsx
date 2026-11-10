import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

test("a button is compact with a pointer and roomier, with a hit slop, on a touch screen", async () => {
  const desktop = await open("./density.fixture.tsx", { platform: "macos" });
  const touch = await open("./density.fixture.tsx", { platform: "ios" });
  expect(find(desktop.texts(), "desktop=")).toBe("true");
  expect(find(desktop.texts(), "button=")).toBe("32|undefined");
  expect(find(touch.texts(), "desktop=")).toBe("false");
  // 40 tall, and presses count 2 points past it: 44.
  expect(find(touch.texts(), "button=")).toBe("40|2");
});

test("the switch knob sits as far from the track's end on as off", async () => {
  const app = await open("./density.fixture.tsx", { platform: "ios" });
  // width less two (border + inset) less the knob: 28 - 4 - 12, 42 - 4 - 20, 34 - 4 - 16.
  expect(find(app.texts(), "travel=")).toBe("12|18|14");
});

test("a standalone switch gets a 44 point target on a touch screen", async () => {
  const app = await open("./density.fixture.tsx", { platform: "ios" });
  const slop = JSON.parse(find(app.texts(), "slop=") ?? "{}");
  // 24 tall and 42 wide: 10 above and below, 1 either side.
  expect(slop).toEqual({ top: 10, bottom: 10, left: 1, right: 1 });
});
