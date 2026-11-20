import { expect, open, test } from "nsh/test";

test("an EmojiPanel takes the test id and the name it is given", async () => {
  const app = await open("./emoji-panel.fixture.tsx");
  expect(app.count("id:emoji-panel")).toBe(1);
  expect(app.count("label:Pick an emoji")).toBe(1);
});
