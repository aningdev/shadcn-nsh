import { expect, open, test } from "nsh/test";

/** Disabled rows use the same foreground ink as a plain row, in both appearances. */
test("disabled menu text stays foreground in light and dark", async () => {
  const app = await open("./menu-contrast.fixture.tsx");
  await app.waitFor("text:Share");
  for (const scheme of ["light", "dark"] as const) {
    await app.setColorScheme(scheme);
    await app.wait(50);
    const plain = app.spanStyle("text:Plain").color;
    const paste = app.spanStyle("text:Paste").color;
    const share = app.spanStyle("text:Share").color;
    expect(paste).toBe(plain);
    expect(share).toBe(plain);
    // Light ink is near-black, dark ink near-white. A frozen first paint fails one of these.
    expect(plain.toLowerCase().startsWith(scheme === "light" ? "#101319" : "#eeeff1")).toBe(true);
  }
});
