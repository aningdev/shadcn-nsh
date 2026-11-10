import { expect, open, test } from "nsh/test";

test("a DataTable selects a row, moves with the keyboard, and sorts", async () => {
  const app = await open("./data-table.fixture.tsx");
  expect(app.texts()).toContain("sel=none");
  await app.press("text:Linus");
  await app.wait(50);
  expect(app.texts()).toContain("sel=1");
  await app.keyboard.press("down");
  await app.wait(50);
  expect(app.texts()).toContain("sel=2");
  await app.press("id:sort:score");
  await app.wait(50);
  expect(app.texts()).toContain("sort=score:ascending");
});

test("a DataTable ignores row presses once row selection is off", async () => {
  const app = await open("./data-table.fixture.tsx");
  await app.press("text:Linus");
  await app.wait(50);
  expect(app.texts()).toContain("sel=1");
  await app.press("text:Lock");
  await app.wait(50);
  await app.press("text:Ada");
  await app.wait(50);
  expect(app.texts()).toContain("sel=1");
});

test("a DataTable selects a cell", async () => {
  const app = await open("./data-table.fixture.tsx");
  expect(app.texts()).toContain("cell=none");
  await app.press("text:Oslo >> nth=1");
  await app.wait(50);
  expect(app.texts()).toContain("cell=0,1");
});
