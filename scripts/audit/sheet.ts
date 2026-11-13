/**
 * Contact sheets of the audit's screenshots, one page per `--out`: images at 1:1 with a caption,
 * in rows of `--cols`.
 *
 *   bun scripts/audit/sheet.ts --out /tmp/sheets/accordion.png --cols 3 \
 *     accordion-demo-phone.png accordion-ref-phone.png accordion-official-phone.png
 *
 * Reads `apps/docs/demos/shots-audit/<name>`, writes the PNG it is given. `docs/specs/demo-audit.md`
 * was reviewed this way.
 */
import fs from "node:fs";
import path from "node:path";

import { launch, serve } from "./chrome";
import { shotsDir } from "./targets";

const args = process.argv.slice(2);
const valueOf = (flag: string) => {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : undefined;
};
const cols = Number(valueOf("--cols") ?? 3);
const out = valueOf("--out");
const title = valueOf("--title") ?? "";
const images: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out" || args[i] === "--cols" || args[i] === "--title") i += 1;
  else images.push(args[i]!);
}
if (!out || images.length === 0) {
  console.error(
    "usage: bun scripts/audit/sheet.ts --out sheet.png [--cols 3] [--title text] a.png b.png",
  );
  process.exit(1);
}

/** The PNG's pixel size, from its IHDR. */
function pngSize(file: string): { width: number; height: number } {
  const bytes = fs.readFileSync(file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const sizes = images.map((name) => pngSize(path.join(shotsDir, name)));
const cellWidth = Math.max(...sizes.map((size) => size.width));
const rows: string[] = [];
for (let i = 0; i < images.length; i += cols) {
  const cells = images
    .slice(i, i + cols)
    .map(
      (name, at) =>
        `<figure><img src="/${name}" width="${sizes[i + at]!.width}" height="${sizes[i + at]!.height}"><figcaption>${name}</figcaption></figure>`,
    )
    .join("");
  rows.push(`<div class="row">${cells}</div>`);
}
const html = `<!doctype html><meta charset="utf-8"><style>
  html, body { margin: 0; background: #f4f4f1; font: 12px/1.4 ui-monospace, Menlo, monospace; color: #333; }
  h1 { margin: 0; padding: 12px 16px; font-size: 14px; }
  .row { display: flex; gap: 12px; padding: 0 12px 12px; align-items: flex-start; }
  figure { margin: 0; background: #fff; border: 1px solid #d8d8d2; }
  img { display: block; }
  figcaption { padding: 4px 6px; border-top: 1px solid #eee; }
</style>${title ? `<h1>${title}</h1>` : ""}${rows.join("")}`;

const server = serve(shotsDir);
await Bun.write(path.join(shotsDir, "_sheet.html"), html);
const browser = await launch();
try {
  const page = await browser.page();
  await page.load(`${server.url}/_sheet.html`, {
    width: cols * (cellWidth + 12) + 24,
    height: 600,
  });
  const size = await page.evaluate<string>(
    `JSON.stringify({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight })`,
  );
  const measured = JSON.parse(size) as { width: number; height: number };
  // The page is taller than the window: resize to it, then take the whole thing.
  await page.load(`${server.url}/_sheet.html`, { width: measured.width, height: measured.height });
  await page.screenshot(out);
  console.log(`${out} (${measured.width}×${measured.height})`);
} finally {
  await browser.close();
  server.stop();
  fs.rmSync(path.join(shotsDir, "_sheet.html"), { force: true });
}
