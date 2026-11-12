import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

const full = (ms: string) => ({
  press: `background-color, transform|${ms}|${ms === "0" ? "still" : "sink"}`,
  button: `background-color, border-color, box-shadow, opacity, transform|${ms}|${ms === "0" ? "still" : "sink"}|still`,
  toggle: `background-color, border-color, box-shadow, opacity, transform|${ms}|${ms === "0" ? "still" : "sink"}|still`,
  link: `opacity|200|still|still`,
  slider: `opacity|150`,
  menu: ms === "0" ? "|0" : `opacity, transform|150`,
  popover: ms === "0" ? "|0" : `opacity, transform|150`,
  tooltip: ms === "0" ? "|0" : `opacity, transform|150`,
});

test("press, hover, chevrons, springs and the progress loop use the documented motion", async () => {
  const app = await open("./motion.fixture.tsx");
  expect(find(app.texts(), "motion=")).toBe("false|1218|70|504|38");
  const live = full("150");
  expect(find(app.texts(), "press=")).toBe(live.press);
  expect(find(app.texts(), "button=")).toBe(live.button);
  expect(find(app.texts(), "toggle=")).toBe(live.toggle);
  expect(find(app.texts(), "link=")).toBe(live.link);
  expect(find(app.texts(), "slider=")).toBe(live.slider);
  expect(find(app.texts(), "menu=")).toBe(live.menu);
  expect(find(app.texts(), "popover=")).toBe(live.popover);
  expect(find(app.texts(), "tooltip=")).toBe(live.tooltip);
  expect(find(app.texts(), "toast=")).toBe("background-color, transform|150");
  const classes = find(app.texts(), "classes=") ?? "";
  expect(
    classes.split(" || ").every((part) => part.includes("motion-reduce:transition-none")),
  ).toBe(true);
  expect(classes).toContain("duration-200");
  expect(classes).toContain("duration-150");
  expect(classes).toContain("duration-100");
  expect(find(app.texts(), "sweep=")).toBe("800|infinite|alternate|true");
});

test("reduced motion zeroes durations and keeps motion-reduce classes", async () => {
  const app = await open("./motion.fixture.tsx", { reducedMotion: true });
  expect(find(app.texts(), "motion=")).toBe("true|1218|70|504|38");
  const live = full("150");
  expect(find(app.texts(), "press=")).toBe(`${live.press.split("|")[0]}|150|still`);
  expect(find(app.texts(), "button=")).toBe(`${live.button.split("|")[0]}|150|still|still`);
  expect(find(app.texts(), "toggle=")).toBe(`${live.toggle.split("|")[0]}|150|still|still`);
  expect(find(app.texts(), "link=")).toBe(live.link);
  expect(find(app.texts(), "slider=")).toBe(live.slider);
  const popup = full("0");
  expect(find(app.texts(), "menu=")).toBe(popup.menu);
  expect(find(app.texts(), "popover=")).toBe(popup.popover);
  expect(find(app.texts(), "tooltip=")).toBe(popup.tooltip);
  expect(find(app.texts(), "toast=")).toBe("background-color, transform|150");
  const classes = find(app.texts(), "classes=") ?? "";
  expect(
    classes.split(" || ").every((part) => part.includes("motion-reduce:transition-none")),
  ).toBe(true);
  expect(find(app.texts(), "sweep=")).toBe("800|infinite|alternate|true");
});
