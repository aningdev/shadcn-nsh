import { expect, open, test } from "nsh/test";

import { nshGallery } from "../../../packages/theme/themes/nsh-gallery/index";

const builtIn = nshGallery.spec;

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
  const pointer = { height: builtIn.metrics.height, control: builtIn.metrics.control };

  const before = look(app.texts());
  expect(before).toEqual({
    density: String(pointer.height.pointer.lg),
    control: String(pointer.control.pointer.padding),
    plain: String(pointer.height.pointer.lg),
    press: String(builtIn.motion.fast.duration),
    focus: String(builtIn.feedback.focus.width),
    curve: "continuous",
  });

  await app.press("text:Roomy");

  expect(look(app.texts())).toEqual({
    density: "60",
    control: "13",
    plain: "60",
    press: "90",
    focus: "5",
    curve: "circular",
  });

  // A follower made before the switch still runs under the new theme.
  await app.press("text:Follow");
  expect(read(app.texts(), "press")).toBe("90");

  await app.press("text:Build-time");

  expect(look(app.texts())).toEqual(before);
});
