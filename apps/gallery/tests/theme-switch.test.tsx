import { expect, open, test } from "nsh/test";

import plainFinishes from "../../../packages/theme/finishes.json";
import neutralFinishes from "../../../packages/theme/themes/shadcn/finishes.json";

type Finish = {
  backgroundColor?: string;
  backgroundImage?: string;
  boxShadow: string;
  borderColor?: string;
};
type Finishes = {
  press: { scale: number };
  light: Record<string, Finish>;
  dark: Record<string, Finish>;
};

const plain = plainFinishes as Finishes;
const neutral = neutralFinishes as Finishes;

/** What the probe page rendered, by the `key:value` line each reading is. */
type Look = {
  fill: string;
  shadow: string;
  radius: string;
  sink: string;
  run: string;
  rail: string;
  theme: string;
  appearance: string;
};

const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1) ?? "";

const look = (texts: string[]): Look => ({
  fill: read(texts, "fill"),
  shadow: read(texts, "shadow"),
  radius: read(texts, "radius"),
  sink: read(texts, "sink"),
  run: read(texts, "run"),
  rail: read(texts, "rail"),
  theme: read(texts, "theme"),
  appearance: read(texts, "appearance"),
});

/** A colour the engine resolved: `#rrggbbaa`, what a `var(--token)` alias reads as. */
const resolved = /^#[0-9a-f]{6,8}$/i;

/** A raised button's shadow, its corners and how far it sinks, from a theme's finishes and radii. A
 * theme whose `press.scale` is 1 draws no press: a control asked to sink as ever stands still. Its
 * fill is an alias, so the page reads it out resolved and the shape of it is checked, not a
 * literal. */
const raisedIn = (finishes: Finishes, appearance: "light" | "dark", radius: string) => {
  const finish = finishes[appearance].raised;
  return {
    shadow: finish.boxShadow,
    radius,
    sink: finishes.press.scale >= 1 ? "1" : "0.97",
  };
};

/** A run is a gradient in every theme: one colour at both stops where the theme draws it flat. A
 * stop is a named alias by then, and the themes' remaining literals are `oklch()` the engine reads. */
const oneGradient = /^linear-gradient\(180deg, .+ 0%, .+ 100%\)$/;

/** A rail: its 1-point edge, resolved, and the shade it hangs off where the theme draws one. */
const railShape = /^inset 0 0 0 1px .+(, .+)?$/;

test("selectTheme swaps a rendered button's fills to the neutral theme, and null brings them back", async () => {
  const app = await open("./theme-switch.fixture.tsx");
  await app.setColorScheme("light");
  const ink = app.spanStyle("text:Ink").color;

  const before = look(app.texts());
  expect(before.theme).toBe("build-time");
  expect(before).toMatchObject({ ...raisedIn(plain, "light", "8"), theme: "build-time" });
  // The finishes name their colours as aliases; by the time the page reads them they are resolved,
  // and every theme states a gradient — a flat one is one colour at both stops.
  expect(before.fill).toMatch(resolved);
  expect(before.run).toMatch(oneGradient);
  expect(before.rail).toMatch(railShape);

  await app.press("text:Shadcn");

  const after = look(app.texts());
  expect(after).toMatchObject({ ...raisedIn(neutral, "light", "8"), theme: "shadcn" });
  expect(after.fill).toMatch(resolved);
  expect(after.run).toMatch(oneGradient);
  expect(after.rail).toMatch(railShape);
  // Another theme, another fill and another run: the neutral theme's raised face is a step darker,
  // and its run runs the chart ramp instead of the brand one.
  expect(after.fill).not.toBe(before.fill);
  expect(after.run).not.toBe(before.run);
  // The tokens came with the finishes: the same text, another color.
  expect(app.spanStyle("text:Ink").color).not.toBe(ink);

  await app.press("text:Build-time");

  expect(app.texts().length).toBeGreaterThan(0);
  expect(look(app.texts())).toEqual(before);
  expect(app.spanStyle("text:Ink").color).toBe(ink);
});

test("an appearance change reaches both themes", async () => {
  const app = await open("./theme-switch.fixture.tsx");
  await app.setColorScheme("light");

  await app.press("text:Shadcn");
  const light = look(app.texts());
  expect(light).toMatchObject(raisedIn(neutral, "light", "8"));

  await app.setColorScheme("dark");
  const dark = look(app.texts());
  expect(dark).toMatchObject({
    ...raisedIn(neutral, "dark", "8"),
    theme: "shadcn",
    appearance: "dark",
  });
  expect(dark.fill).toMatch(resolved);
  expect(dark.run).toMatch(oneGradient);
  expect(dark.rail).toMatch(railShape);
  expect(dark.fill).not.toBe(light.fill);
  expect(dark.run).not.toBe(light.run);

  await app.press("text:Build-time");
  const back = look(app.texts());
  expect(back).toMatchObject(raisedIn(plain, "dark", "8"));
  expect(back.fill).toMatch(resolved);
  expect(back.run).toMatch(oneGradient);
  expect(back.rail).toMatch(railShape);
  expect(back.fill).not.toBe(dark.fill);
});

test("a theme setTheme refuses throws and leaves the finishes as they were", async () => {
  const app = await open("./theme-switch.fixture.tsx");
  await app.setColorScheme("light");
  await app.press("text:Shadcn");
  const before = look(app.texts());

  await app.press("text:Broken");

  const texts = app.texts();
  expect(read(texts, "failure")).toBe("TypeError");
  expect(look(texts)).toEqual(before);
});
