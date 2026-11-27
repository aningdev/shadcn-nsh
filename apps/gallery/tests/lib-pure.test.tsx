import { expect, open, test } from "nsh/test";

test("lib pure helpers pass all class, icon drawing, and switch geometry checks", async () => {
  const app = await open("./lib-pure.fixture.tsx");
  const texts = app.texts();
  expect(texts).toContain("TOTAL:25");
  const failures = texts.filter((t) => t.startsWith("FAIL:"));
  expect(failures).toEqual([]);
  expect(texts.filter((t) => t.startsWith("PASS:"))).toHaveLength(25);
});
