import { expect, open, test } from "nsh/test";

const find = (texts: string[], prefix: string) =>
  texts.find((t) => t.startsWith(prefix))?.slice(prefix.length);

/**
 * `nativeTheme()` is Apple's on macOS (and iOS); selecting it puts Liquid Glass on the finishes that
 * float (`menu`, `glass`, `raised`) and leaves a card flat, and `selectTheme(null)` takes it back.
 */
test("nativeTheme() is apple on macOS, and its glass reaches a popover's finish", async () => {
  const app = await open("./theme-native.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });
  expect(find(app.texts(), "native=")).toBe("apple");
  // The build-time theme asks for no material.
  expect(find(app.texts(), "menu=")).toBe("");

  await app.press("text:Native");
  expect(find(app.texts(), "menu=")).toBe("glassEffect");
  expect(find(app.texts(), "menuEffect=")).toBe("regular");
  expect(find(app.texts(), "glassEffect=")).toBe("regular");
  expect(find(app.texts(), "raisedEffect=")).toBe("regular");
  // A card stays flat: no glass keys, no platform props.
  expect(find(app.texts(), "card=")).toBe("|{}");

  await app.press("text:Build-time");
  expect(find(app.texts(), "menu=")).toBe("");
});

test("nativeTheme() is apple on iOS too", async () => {
  const app = await open("./theme-native.fixture.tsx", { platform: "ios", colorScheme: "dark" });
  expect(find(app.texts(), "native=")).toBe("apple");
});

test("nativeTheme() is material on Android", async () => {
  const app = await open("./theme-native.fixture.tsx", {
    platform: "android",
    colorScheme: "light",
  });
  expect(find(app.texts(), "native=")).toBe("material");
});

test("nativeTheme() is the default theme on the other platforms", async () => {
  for (const platform of ["windows", "linux"] as const) {
    const app = await open("./theme-native.fixture.tsx", { platform, colorScheme: "light" });
    expect(find(app.texts(), "native=")).not.toBe("apple");
    expect(find(app.texts(), "native=")).not.toBe("material");
  }
});
