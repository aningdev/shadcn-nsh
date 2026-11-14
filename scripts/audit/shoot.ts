/**
 * Screenshots one NSH page (a `.tsx` entry) at one size and idiom, through the same packaged
 * web build the docs site embeds:
 *
 *   bun scripts/audit/shoot.ts apps/docs/demos/accordion.tsx --size 390x844 --idiom phone \
 *     --out /tmp/accordion.png
 *
 * The entry's `nsh.json` (its theme and aliases) is the one in `--cwd` or beside the entry.
 * `--idiom` asks the app to run as a phone or a desktop window (`desktop` when left out: the
 * page measures the browser's pointer, as a release package does). `--theme` asks for the dark
 * appearance (`prefers-color-scheme`); light is the default, as in the audit's own shots.
 */
import path from "node:path";

import { launch, serve } from "./chrome";
import { type Target, packageTarget } from "./targets";

const [entry, ...rest] = process.argv.slice(2);
const valueOf = (flag: string) => {
  const at = rest.indexOf(flag);
  return at >= 0 ? rest[at + 1] : undefined;
};
if (!entry) {
  console.error(
    "usage: bun scripts/audit/shoot.ts <entry.tsx> --size 390x844 [--idiom phone|desktop] [--theme light|dark] --out shot.png [--cwd dir]",
  );
  process.exit(1);
}

const size = /^(\d+)x(\d+)$/.exec(valueOf("--size") ?? "390x844");
if (!size) {
  console.error("--size takes WIDTHxHEIGHT, e.g. 390x844");
  process.exit(1);
}
const width = Number(size[1]);
const height = Number(size[2]);
const idiom = valueOf("--idiom");
if (idiom && idiom !== "phone" && idiom !== "desktop") {
  console.error("--idiom takes phone or desktop");
  process.exit(1);
}
const theme = valueOf("--theme");
if (theme !== undefined && theme !== "light" && theme !== "dark") {
  console.error("--theme takes light or dark");
  process.exit(1);
}
const cwd = path.resolve(valueOf("--cwd") ?? path.dirname(entry));
const out = path.resolve(valueOf("--out") ?? path.join("/tmp", `nsh-audit-${Date.now()}.png`));
const work = process.env.NSH_AUDIT_WORK ?? path.join("/tmp", "nsh-audit");

const slug = `one-${path.basename(entry, ".tsx").replace(/[^a-z0-9]/gi, "-")}`;
const target: Target = { id: slug, kind: "official", entry: path.resolve(entry), cwd, slug };

const home = packageTarget(target, work, rest.includes("--force"));
const server = serve(path.dirname(home));
const browser = await launch();
try {
  const page = await browser.page();
  const url = `${server.url}/${path.basename(home)}/index.html${idiom ? `?idiom=${idiom}` : ""}`;
  await page.load(url, { width, height }, { theme });
  await page.screenshot(out);
  console.log(
    `${out} (${width}×${height}${idiom ? `, ${idiom} idiom` : ", measured idiom"}` +
      `${theme ? `, ${theme}` : ""})`,
  );
} finally {
  await browser.close();
  server.stop();
}
