import { expect, open, test } from "nsh/test";

/** The wash `feedback.hover` lays over a fill: a `color-mix()` of the ink at the theme's overlay. */
const wash = (ink: string, a: number) =>
  `color-mix(in srgb, ${ink} ${Math.round(a * 100)}%, transparent)`;

test("double focus, timing motion, state-layer inks and platform material follow selectTheme", async () => {
  const app = await open("./theme-primitives.fixture.tsx", {
    platform: "macos",
    colorScheme: "light",
  });

  const read = (key: string) => {
    const line = app.texts().find((t) => t.startsWith(`${key}=`));
    if (line === undefined) throw new Error(`missing key ${key}`);
    return line.slice(key.length + 1);
  };
  const readJson = <T,>(key: string): T => JSON.parse(read(key));

  // Built-in theme before switching: halo focus, timing motion, overlay=0, no material.
  const initialFocus = readJson<Record<string, unknown>>("focus");
  expect(initialFocus.borderColor).toBeDefined();
  expect(initialFocus.boxShadow).toBeUndefined();
  expect(read("motionFast")).toMatch(/^timing:150:/);
  expect(read("motionDefault")).toMatch(/^timing:250:/);
  expect(readJson<Record<string, unknown>>("btnHover")).toEqual({ opacity: 0.94 });
  expect(readJson<unknown>("toggleOnHover")).toBeNull();
  expect(readJson<Record<string, unknown>>("bareHover").backgroundColor).toBeDefined();
  expect(readJson<Record<string, unknown>>("bareHover").backgroundImage).toBeUndefined();
  expect(readJson<Record<string, unknown>>("menuMaterial")).toEqual({});

  // Drive animations once under the default timing before switching.
  await app.press("text:Step");
  expect(read("roll")).toBe("1");

  // Switch to the synthetic Expressive theme.
  await app.press("text:Expressive");

  const [ring, card] = read("ringTokens").split("|");
  const expressiveFocus = readJson<Record<string, unknown>>("focus");
  expect(expressiveFocus.borderColor).toBeUndefined();
  expect(expressiveFocus.outlineColor).toBe(ring);
  expect(expressiveFocus.outlineWidth).toBe(2);
  expect(expressiveFocus.outlineOffset).toBe(3);
  expect(expressiveFocus.boxShadow).toBe(`0 0 0 1px ${card}`);

  // Timing roles & new platform-neutral curves are resolved reactively.
  expect(read("motionFast")).toBe("timing:150:[0.05,0.7,0.1,1]");
  expect(read("motionDefault")).toBe("timing:250:[0,0,0,1]");
  expect(read("motionSlow")).toBe("timing:167:[1,0,1,1]");

  // Drive follow/Roll/animate under timing config cleanly.
  await app.press("text:Step");
  expect(read("roll")).toBe("2");

  // State-layer hover omits backgroundColor: token("hover") and lays the ink wash over the fill.
  const [primaryForeground, inverseForeground, selectedInk] = read("tokens").split("|");
  const expectedPrimaryFgHover = wash(primaryForeground, 0.08);
  const expectedInverseFgHover = wash(inverseForeground, 0.08);
  const expectedSelectedFgHover = wash(selectedInk, 0.08);

  const btnHover = readJson<Record<string, unknown>>("btnHover");
  expect(btnHover.backgroundColor).toBeUndefined();
  expect(btnHover.backgroundImage).toContain(expectedPrimaryFgHover);

  const roundHover = readJson<Record<string, unknown>>("roundHover");
  expect(roundHover.backgroundColor).toBeUndefined();
  expect(roundHover.backgroundImage).toContain(expectedPrimaryFgHover);

  const splitHover = readJson<Record<string, unknown>>("splitHover");
  expect(splitHover.backgroundColor).toBeUndefined();
  expect(splitHover.backgroundImage).toContain(expectedPrimaryFgHover);

  const toggleOnHover = readJson<Record<string, unknown>>("toggleOnHover");
  expect(toggleOnHover.backgroundColor).toBeUndefined();
  expect(toggleOnHover.backgroundImage).toContain(expectedSelectedFgHover);

  const toastHover = readJson<Record<string, unknown>>("toastHover");
  expect(toastHover.backgroundColor).toBeUndefined();
  expect(toastHover.backgroundImage).toContain(expectedInverseFgHover);

  const bareHover = readJson<Record<string, unknown>>("bareHover");
  expect(bareHover.backgroundColor).toBeUndefined();
  expect(bareHover.backgroundImage).toBeDefined();

  // A layer's material reaches the platform props, and its elevation rides beside them.
  expect(readJson("menuMaterial")).toEqual({
    windows: { backdrop: { material: "blur" } },
    android: { elevation: 6 },
  });

  // Built-in theme motion presets across nsh-gallery, apple, material, and winui.
  expect(readJson("motionPresets")).toEqual({
    pop: { scale: 0.96, y: 0, spring: null },
    dlg: { scale: 0.96, y: 0, spring: null },
    glide: { dur: 150, spring: null },
    switch: { kind: "fade", duration: 200, shader: null },
  });

  await app.press("text:Apple");
  expect(readJson("motionPresets")).toEqual({
    pop: { scale: 0.96, y: 0, spring: { stiffness: 340, damping: 30, mass: 1 } },
    dlg: { scale: 0.96, y: 0, spring: { stiffness: 340, damping: 30, mass: 1 } },
    glide: { dur: 150, spring: { stiffness: 340, damping: 30, mass: 1 } },
    switch: { kind: "dissolve", duration: 240, shader: "shader" },
  });

  await app.press("text:Material");
  expect(readJson("motionPresets")).toEqual({
    pop: { scale: 0.96, y: -4, spring: { stiffness: 380, damping: 32, mass: 1 } },
    dlg: { scale: 0.94, y: 8, spring: { stiffness: 380, damping: 32, mass: 1 } },
    glide: { dur: 150, spring: { stiffness: 380, damping: 32, mass: 1 } },
    switch: { kind: "radial-wipe", duration: 320, shader: "shader" },
  });

  await app.press("text:WinUI");
  expect(readJson("motionPresets")).toEqual({
    pop: { scale: 1, y: -6, spring: null },
    dlg: { scale: 1.04, y: 0, spring: null },
    glide: { dur: 83, spring: null },
    switch: { kind: "fade", duration: 167, shader: null },
  });

  // Switch back to the build-time theme cleanly.
  await app.press("text:Reset");
  expect(readJson("focus")).toEqual(initialFocus);
  expect(read("motionFast")).toMatch(/^timing:150:/);
  expect(readJson("menuMaterial")).toEqual({});
});
