import { expect, open, test } from "nsh/test";

const atAlpha = (hex: string, a: number) =>
  `${hex.slice(0, 7)}${Math.round(a * 255)
    .toString(16)
    .padStart(2, "0")}`;

test("double focus, timing motion, state-layer inks, ripple and android material follow selectTheme", async () => {
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

  // Built-in default theme before switching: halo focus, springs, overlay=0, no ripple, no material.
  const initialFocus = readJson<Record<string, unknown>>("focus");
  expect(initialFocus.borderColor).toBeDefined();
  expect(initialFocus.boxShadow).toBeUndefined();
  expect(read("motionFast")).toMatch(/^spring:\d+:\d+$/);
  expect(read("motionDefault")).toMatch(/^spring:\d+:\d+$/);
  expect(readJson<Record<string, unknown>>("btnHover")).toEqual({ opacity: 0.94 });
  expect(readJson<unknown>("toggleOnHover")).toBeNull();
  expect(readJson<Record<string, unknown>>("bareHover").backgroundColor).toBeDefined();
  expect(readJson<Record<string, unknown>>("bareHover").backgroundImage).toBeUndefined();
  expect(readJson<unknown>("btnAndroid")).toBeNull();
  expect(readJson<unknown>("toastAndroid")).toBeNull();
  expect(readJson<Record<string, unknown>>("menuMaterial")).toEqual({});

  // Drive animations once under spring config before switching.
  await app.press("text:Step");
  expect(read("roll")).toBe("1");

  // Switch to the synthetic Expressive theme.
  await app.press("text:Expressive");

  const [ring, ringHalo] = read("ringTokens").split("|");
  const expressiveFocus = readJson<Record<string, unknown>>("focus");
  expect(expressiveFocus.borderColor).toBeUndefined();
  expect(expressiveFocus.outlineColor).toBe(ring);
  expect(expressiveFocus.outlineWidth).toBe(2);
  expect(expressiveFocus.outlineOffset).toBe(3);
  expect(expressiveFocus.boxShadow).toBe(`0 0 0 1px ${ringHalo}`);

  // Timing roles & new platform-neutral curves are resolved reactively.
  expect(read("motionFast")).toBe("timing:150:[0.05,0.7,0.1,1]");
  expect(read("motionDefault")).toBe("timing:250:[0,0,0,1]");
  expect(read("motionSlow")).toBe("timing:167:[1,0,1,1]");
  expect(read("motionEnter")).toBe("200:[0.55,0.55,0,1]");

  // Drive follow/Roll/animate under timing config cleanly.
  await app.press("text:Step");
  expect(read("roll")).toBe("2");

  // State-layer hover omits backgroundColor: token("hover") and stacks ink over resting gradients.
  const [primaryForeground, inverseForeground, selectedInk] = read("tokens").split("|");
  const expectedPrimaryFgHover = atAlpha(primaryForeground, 0.08);
  const expectedInverseFgHover = atAlpha(inverseForeground, 0.08);
  const expectedSelectedFgHover = atAlpha(selectedInk, 0.08);

  const btnHover = readJson<Record<string, unknown>>("btnHover");
  expect(btnHover.backgroundColor).toBeUndefined();
  expect(btnHover.backgroundImage).toContain(expectedPrimaryFgHover);
  expect(btnHover.backgroundImage).toContain(", linear-gradient(");

  const roundHover = readJson<Record<string, unknown>>("roundHover");
  expect(roundHover.backgroundColor).toBeUndefined();
  expect(roundHover.backgroundImage).toContain(expectedPrimaryFgHover);
  expect(roundHover.backgroundImage).toContain(", linear-gradient(");

  const splitHover = readJson<Record<string, unknown>>("splitHover");
  expect(splitHover.backgroundColor).toBeUndefined();
  expect(splitHover.backgroundImage).toContain(expectedPrimaryFgHover);

  const toggleOnHover = readJson<Record<string, unknown>>("toggleOnHover");
  expect(toggleOnHover.backgroundColor).toBeUndefined();
  expect(toggleOnHover.backgroundImage).toContain(expectedSelectedFgHover);
  expect(toggleOnHover.backgroundImage).toContain(", linear-gradient(");

  const toastHover = readJson<Record<string, unknown>>("toastHover");
  expect(toastHover.backgroundColor).toBeUndefined();
  expect(toastHover.backgroundImage).toContain(expectedInverseFgHover);

  const bareHover = readJson<Record<string, unknown>>("bareHover");
  expect(bareHover.backgroundColor).toBeUndefined();
  expect(bareHover.backgroundImage).toBeDefined();

  // state.ripple: true wires surface-appropriate ripple colors on pressables.
  expect(readJson("btnAndroid")).toEqual({
    ripple: { color: atAlpha(primaryForeground, 0.1) },
  });
  expect(readJson("roundAndroid")).toEqual({
    ripple: { color: atAlpha(primaryForeground, 0.1) },
  });
  expect(readJson("toggleOnAndroid")).toEqual({
    ripple: { color: atAlpha(selectedInk, 0.1) },
  });
  expect(readJson("toastAndroid")).toEqual({ ripple: { color: atAlpha(inverseForeground, 0.1) } });

  // A layer's material reaches the platform props, and its elevation rides beside them.
  expect(readJson("menuMaterial")).toEqual({
    windows: { backdrop: { material: "blur" } },
    android: { elevation: 6 },
  });

  // Switch back to build-time default cleanly.
  await app.press("text:Reset");
  expect(readJson("focus")).toEqual(initialFocus);
  expect(read("motionFast")).toMatch(/^spring:\d+:\d+$/);
  expect(readJson("btnAndroid")).toBeNull();
  expect(readJson("menuMaterial")).toEqual({});
});
