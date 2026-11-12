import { expect, open, test } from "nsh/test";

test("Toolbar arrows walk items, skip a disabled one, and Space presses", async () => {
  const app = await open("./toolbar.fixture.tsx", { platform: "macos" });
  await app.keyboard.press("tab");
  await app.keyboard.press("space");
  await app.waitFor("bold 1");
  await app.keyboard.press("right");
  await app.keyboard.press("space");
  await app.waitFor("italic on");
  await app.keyboard.press("right");
  await app.keyboard.press("space");
  await app.waitFor("docs 1");
  // Off is disabled, so the next arrow wraps to Bold.
  await app.keyboard.press("right");
  await app.keyboard.press("space");
  await app.waitFor("bold 2");
  await app.keyboard.press("end");
  await app.keyboard.press("space");
  await app.waitFor("docs 2");
  await app.keyboard.press("home");
  await app.keyboard.press("space");
  await app.waitFor("bold 3");
});

test("a disabled Toolbar ignores presses", async () => {
  const app = await open("./toolbar.fixture.tsx");
  await app.press("text:Lock");
  await app.waitFor("locked yes");
  expect(app.enabled("label:Approve")).toBe(false);
  await app.press("label:Approve").catch(() => {});
  await app.wait(100);
  expect(app.shows("docs 1")).toBe(false);
});

/** Channel 0–255 of a `#rrggbb` / `#rrggbbaa` color. */
function red(hex: string) {
  return parseInt(hex.slice(1, 3), 16);
}

test("Toolbar ink follows the scheme, the track stays light-on-dark, and Site is a link", async () => {
  const app = await open("./toolbar.fixture.tsx");
  expect(app.count("role:link[Docs]")).toBe(1);
  expect(app.count("role:button[Docs]")).toBe(0);
  const tracks: string[] = [];
  for (const scheme of ["light", "dark"] as const) {
    await app.setColorScheme(scheme);
    const ink = scheme === "light" ? "#101319" : "#eeeff1";
    await app.waitUntil(() => app.spanStyle("text:Bold").color.toLowerCase().startsWith(ink));
    const bold = app.spanStyle("text:Bold").color;
    const site = app.spanStyle("text:Docs").color;
    const track = (app.texts().find((text) => text.startsWith("track ")) ?? "").slice(6);
    tracks.push(track);
    // Ghost label is foreground. Off is that button, disabled, dimmed by disabledOpacity.
    expect(app.enabled("label:Off")).toBe(false);
    expect(bold.toLowerCase().startsWith(ink)).toBe(true);
    // Site is a link: primary ink, not the button's foreground, and it flips with the scheme.
    expect(site).not.toBe(bold);
    // `muted` track. Near-white in light (#f5f5f5), the dark step in dark. A snapshot stays one of them.
    expect(red(track) > 200).toBe(scheme === "light");
  }
  expect(tracks[0]).not.toBe(tracks[1]);
});

test("Toolbar is one labelled toolbar and the group is named", async () => {
  const app = await open("./toolbar.fixture.tsx");
  expect(app.count("role:toolbar[Formatting]")).toBe(1);
  expect(app.count("role:group[Marks]")).toBe(1);
});
