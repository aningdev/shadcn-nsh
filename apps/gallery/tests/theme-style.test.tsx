import { expect, open, test } from "nsh/test";

import defaults from "../../../packages/theme/semantics.json";

const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1);

/** What the probe page reads out of the style in use, by the `key:value` line each is. */
const look = (texts: string[]) =>
  Object.fromEntries(
    ["density", "control", "plain", "press", "focus", "curve"].map((key) => [
      key,
      read(texts, key),
    ]),
  );

test("a rendered page follows the style of the theme selected, and of the build-time one again", async () => {
  const app = await open("./theme-style.fixture.tsx", { platform: "macos" });
  const pointer = defaults.dimension.size;

  const before = look(app.texts());
  expect(before).toEqual({
    density: String(pointer.height.pointer.lg),
    control: String(pointer.control.pointer.padding),
    plain: String(pointer.height.pointer.lg),
    press: `${defaults.motion.fast.stiffness}|${defaults.motion.fast.damping}`,
    focus: String(defaults.dimension.focus.width),
    curve: "continuous",
  });

  await app.press("text:Roomy");

  expect(look(app.texts())).toEqual({
    density: "60",
    control: "13",
    plain: "60",
    press: "111|22",
    focus: "5",
    curve: "circular",
  });

  // A spring made before the switch still springs under the new theme.
  await app.press("text:Spring");
  expect(read(app.texts(), "press")).toBe("111|22");

  await app.press("text:Build-time");

  expect(look(app.texts())).toEqual(before);
});
