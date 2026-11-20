import { expect, open, test } from "nsh/test";

test("a RichEditor merges the app's node classes into the look's, name by name", async () => {
  const app = await open("./rich-editor.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(app.shows("label:Document")).toBe(true);
  // `text-xl` (20): the app's paragraph class, applied after the look's `leading-relaxed`.
  expect(app.spanStyle("text:A plain paragraph.").fontSize).toBe(20);
  // The look's other nodes survive the app naming one: `text-2xl font-semibold` on a level-2 heading.
  const heading = app.spanStyle("text:A heading");
  expect(heading.fontSize).toBe(24);
  expect(heading.fontWeight).toBe(600);
});
