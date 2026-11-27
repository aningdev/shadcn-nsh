import { expect, open, test } from "nsh/test";

const read = (texts: string[], key: string) =>
  texts.find((text) => text.startsWith(`${key}:`))?.slice(key.length + 1);

test("a host-style override of radius-xl reaches components on the next frame", async () => {
  const app = await open("./theme-overrides.fixture.tsx", { platform: "macos" });

  expect(read(app.texts(), "theme")).toBe("build-time");
  expect(read(app.texts(), "dialog-radius")).toBe("14");
  expect(read(app.texts(), "shape-modal")).toBe("14");

  await app.press("text:Override");

  expect(read(app.texts(), "theme")).toBe("host-overridden");
  expect(read(app.texts(), "dialog-radius")).toBe("32");
  expect(read(app.texts(), "shape-modal")).toBe("32");

  await app.press("text:Build-time");

  expect(read(app.texts(), "theme")).toBe("build-time");
  expect(read(app.texts(), "dialog-radius")).toBe("14");
  expect(read(app.texts(), "shape-modal")).toBe("14");
});
