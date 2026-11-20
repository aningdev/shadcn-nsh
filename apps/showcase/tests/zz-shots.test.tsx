// Scratch: phone dark screenshots. Deleted after the shots are taken.
import { open, test } from "nsh/test";

const phone = { platform: "macos", width: 390, height: 844 } as const;
const dir = "/Users/zhuxining/Code/shadcn-nsh-wt/sc-primitives/.handoff/shots";

const demos: [name: string, marker: string, file: string][] = [
  ["Text", "Spans and links", "text"],
  ["Image", "Resize modes", "image"],
  ["Scroll", "Paging", "scroll"],
  ["List", "Viewable items (at least half shown)", "list"],
  ["WebView", "Web views", "web-view"],
  ["Video", "AVPlayer / MediaPlayer", "video"],
];

test("shot phone dark", async () => {
  const app = await open("../App.tsx", phone);
  await app.setColorScheme("dark");
  for (const [name, marker, file] of demos) {
    await app.press(`label:${name}`);
    await app.waitFor(`text:${marker}`);
    await app.wait(1200);
    if (file === "image") await app.wait(2500);
    await app.screenshot(`${dir}/${file}-phone-dark-1.png`);
    await app.back();
    await app.waitFor("text:PRIMITIVES");
  }
});
