import { expect, open, test } from "nsh/test";

test("a ghost field has no fill and no edge at rest, and keeps the focus ring", async () => {
  const app = await open("./input-variant.fixture.tsx");
  const [ghost, plain] = app
    .texts()
    .filter((text) => text.startsWith("ghost ") || text.startsWith("default "));
  expect(ghost).toBe("ghost fill=— edge=— hover-edge=— focus-edge=yes focus-ring=yes stride=1");
  // The default field is the one it always was: its fill, its edge, the pointer's edge.
  expect(plain).toBe(
    "default fill=yes edge=yes hover-edge=yes focus-edge=yes focus-ring=yes stride=1",
  );
  expect(app.viewStyle("label:Ghost field")?.backgroundColor).toBeUndefined();
  expect(app.viewStyle("label:Plain field")?.backgroundColor).toBeDefined();
});
