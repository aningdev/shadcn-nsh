import { expect, open, test } from "nsh/test";

const line = (texts: string[], name: string) =>
  texts.find((text) => text.startsWith(`${name} `))?.slice(name.length + 1);

test("a page pushed on the stack shows its title and a back button named Back", async () => {
  const app = await open("./nav-stack.fixture.tsx", { platform: "macos", reducedMotion: true });
  expect(line(app.texts(), "routes")).toBe("first");
  expect(app.shows("label:Back")).toBe(false);
  expect(app.shows("text:First")).toBe(true);
  await app.press("text:Go to second");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
  expect(app.texts()).toContain("Second");
  // The page above the first has one — this library's ghost icon button, named "Back" — and the
  // first has none.
  expect(app.shows("id:page-second >> label:Back")).toBe(true);
  expect(app.shows("id:page-first >> label:Back")).toBe(false);
});

test("the header's back button reports the press and pops to the page below", async () => {
  const app = await open("./nav-stack.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:Go to second");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
  await app.press("label:Back");
  await app.waitUntil(() => line(app.texts(), "routes") === "first");
  expect(line(app.texts(), "backs")).toBe("1");
  expect(app.shows("label:Back")).toBe(false);
});

test("the platform's back pops the page, as `routes` follows", async () => {
  const app = await open("./nav-stack.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:Go to second");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
  await app.back();
  await app.waitUntil(() => line(app.texts(), "routes") === "first");
  expect(line(app.texts(), "backs")).toBe("1");
});

test("popOnBack={false} keeps the page while the press is reported, and the app pops it", async () => {
  const app = await open("./nav-stack.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:Go to second");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
  await app.press("text:Go to third");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second,third");
  await app.press("id:page-third >> label:Back");
  expect(line(app.texts(), "routes")).toBe("first,second,third");
  expect(line(app.texts(), "backs")).toBe("1");
  await app.press("text:Pop by hand");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
});

test("a header of the app's own is handed its page: it reports the depth and pops", async () => {
  const app = await open("./nav-stack.fixture.tsx", { platform: "macos", reducedMotion: true });
  await app.press("text:Go to second");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
  await app.press("text:Go to custom");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second,custom");
  // The page draws its own header: the slot says how deep it is, and its own Back pops it —
  // `onBackPress` hears the press first, then the stack pops (`popOnBack` is not set).
  expect(app.shows("label:Custom back")).toBe(true);
  expect(line(app.texts(), "depth")).toBe("3");
  await app.press("label:Custom back");
  await app.waitUntil(() => line(app.texts(), "routes") === "first,second");
  expect(line(app.texts(), "backs")).toBe("1");
});
