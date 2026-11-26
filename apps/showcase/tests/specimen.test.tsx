// Theme Specimen: the page opens, and each theme button rewrites the contract readout.
import { open, test } from "nsh/test";

/** A desktop window: the sidebar column and the chosen demo beside it. */
const wide = { platform: "macos", width: 1024, height: 700, clock: {} } as const;

test("Theme Specimen switches Apple, Material, Editorial Paper, and back to NSH Gallery", async () => {
  const app = await open("../App.tsx", wide);
  await app.setColorScheme("light");
  await app.press("label:Theme Specimen");
  await app.waitFor("text:Theme contract");
  await app.waitFor("text:Theme: NSH Gallery");

  await app.press("label:Theme Apple");
  await app.waitFor("text:Theme: Apple");
  await app.waitFor("text:Switch: dissolve");

  await app.press("label:Theme Material");
  await app.waitFor("text:Theme: Material");
  await app.waitFor("text:Switch: radial-wipe");

  await app.press("label:Theme Editorial Paper");
  await app.waitFor("text:Theme: Editorial Paper");
  await app.waitFor("text:Radius: 4");

  await app.press("label:Theme NSH Gallery");
  await app.waitFor("text:Theme: NSH Gallery");
  await app.waitFor("text:Switch: fade");
});
