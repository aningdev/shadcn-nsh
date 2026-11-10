import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((line) => line.startsWith(prefix))?.slice(prefix.length);

const full = (ms: string) => ({
  press: `background-color, transform|${ms}|${ms === "0" ? "still" : "sink"}`,
  button: `background-color, border-color, box-shadow, opacity, transform|${ms}|${ms === "0" ? "still" : "sink"}|still`,
  toggle: `background-color, border-color, box-shadow, opacity, transform|${ms}|${ms === "0" ? "still" : "sink"}|still`,
  link: `border-color, transform|${ms}|${ms === "0" ? "still" : "sink"}|still`,
  slider: `opacity|${ms}`,
  menu: `opacity, transform|${ms === "0" ? "0" : "100"}`,
  popover: `opacity, transform|${ms === "0" ? "0" : "150"}`,
  tooltip: `opacity|${ms === "0" ? "0" : "100"}`,
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
  expect(find(app.texts(), "toast=")).toBe(
    "transition-all duration-200 ease-out motion-reduce:transition-none",
  );
  const classes = find(app.texts(), "classes=") ?? "";
  // Hover is `still` above: it never sinks. Every animated class cancels under motion-reduce.
  expect(
    classes.split(" || ").every((part) => part.includes("motion-reduce:transition-none")),
  ).toBe(true);
  expect(classes).toContain("duration-200");
  expect(classes).toContain("duration-150");
  expect(classes).toContain("duration-180");
  expect(classes).toContain("duration-300");
  expect(classes).toContain("duration-100");
  // The sweep is the signal, so it does not opt into a zero duration.
  expect(find(app.texts(), "sweep=")).toBe("800|infinite|alternate|true");
});

test("reduced motion zeroes durations and keeps motion-reduce classes", async () => {
  const app = await open("./motion.fixture.tsx", { reducedMotion: true });
  expect(find(app.texts(), "motion=")).toBe("true|1218|70|504|38");
  const calm = full("0");
  expect(find(app.texts(), "press=")).toBe(calm.press);
  expect(find(app.texts(), "button=")).toBe(calm.button);
  expect(find(app.texts(), "toggle=")).toBe(calm.toggle);
  expect(find(app.texts(), "link=")).toBe(calm.link);
  expect(find(app.texts(), "slider=")).toBe(calm.slider);
  expect(find(app.texts(), "menu=")).toBe(calm.menu);
  expect(find(app.texts(), "popover=")).toBe(calm.popover);
  expect(find(app.texts(), "tooltip=")).toBe(calm.tooltip);
  expect(find(app.texts(), "toast=")).toBe("transition-all ease-out motion-reduce:transition-none");
  const classes = find(app.texts(), "classes=") ?? "";
  expect(
    classes.split(" || ").every((part) => part.includes("motion-reduce:transition-none")),
  ).toBe(true);
  expect(find(app.texts(), "sweep=")).toBe("800|infinite|alternate|true");
});
