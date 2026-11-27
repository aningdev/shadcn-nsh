/**
 * The narrow check: every demo fits a 320-point phone. `apps/website/demos/narrow.test.tsx` opens
 * each one at that width and screenshots it; this script reads the page's right margin in every
 * picture, which must be bare page from top to bottom. A card, a field, a row of cells or a
 * skeleton line that runs past its card reaches into the margin, and the demo is named.
 *
 *   bun run check:narrow [--only <id,...>]
 *
 * Why a picture and not the layout: what a visitor sees is the page as drawn, whichever view is
 * too wide (a fixed width with no `maxWidth`, a text column that will not shrink). The rule the
 * demos follow is in `docs/component-authoring.md`.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inflateSync } from "node:zlib";

import { catalog } from "./catalog";

/** A decoded picture: `channels` samples per pixel (3 RGB or 4 RGBA), rows top to bottom. */
type Picture = { width: number; height: number; channels: number; data: Uint8Array };

const u32 = (bytes: Uint8Array, at: number) =>
  ((bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!) >>> 0;

/** Decodes a non-interlaced 8- or 16-bit PNG (RGB or RGBA). A 16-bit sample keeps its high byte. */
function decodePng(bytes: Uint8Array): Picture {
  if (bytes.length < 8 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e) {
    throw new Error("not a PNG");
  }
  let at = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat: Uint8Array[] = [];
  while (at + 8 <= bytes.length) {
    const length = u32(bytes, at);
    const type = String.fromCharCode(
      bytes[at + 4]!,
      bytes[at + 5]!,
      bytes[at + 6]!,
      bytes[at + 7]!,
    );
    const data = bytes.subarray(at + 8, at + 8 + length);
    at += 12 + length;
    if (type === "IHDR") {
      width = u32(data, 0);
      height = u32(data, 4);
      bitDepth = data[8]!;
      colorType = data[9]!;
      interlace = data[12]!;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if ((bitDepth !== 8 && bitDepth !== 16) || interlace !== 0 || channels === 0) {
    throw new Error(
      `unsupported PNG: ${bitDepth}-bit, color type ${colorType}, interlace ${interlace}`,
    );
  }
  if (width === 0 || height === 0) throw new Error("empty PNG");
  const raw = inflateSync(Buffer.concat(idat.map((chunk) => Buffer.from(chunk))));
  const sample = bitDepth === 16 ? 2 : 1;
  const stride = width * channels * sample;
  const data = new Uint8Array(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos++]!;
    const row = data.subarray(y * stride, (y + 1) * stride);
    const prior = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null;
    const bytesPerPixel = channels * sample;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel]! : 0;
      const up = prior ? prior[x]! : 0;
      const upLeft = prior && x >= bytesPerPixel ? prior[x - bytesPerPixel]! : 0;
      let value = raw[pos + x]!;
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (filter !== 0) {
        throw new Error(`PNG filter ${filter}`);
      }
      row[x] = value & 0xff;
    }
    pos += stride;
  }
  if (sample === 1) return { width, height, channels, data };
  const down = new Uint8Array(width * height * channels);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    for (let c = 0; c < channels; c += 1) {
      down[pixel * channels + c] = data[(pixel * channels + c) * 2]!;
    }
  }
  return { width, height, channels, data: down };
}

/** The ids `--only` names, or every component when the flag is absent. */
function onlyIds(): string[] | undefined {
  const at = process.argv.indexOf("--only");
  if (at < 0) return undefined;
  const value = process.argv[at + 1];
  if (!value) {
    console.error("narrow: --only takes a comma-separated list of ids (`--only select,combobox`)");
    process.exit(1);
  }
  const ids = value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    console.error("narrow: --only names no id");
    process.exit(1);
  }
  const unknown = ids.filter(
    (id) => !catalog().components.some((component) => component.id === id),
  );
  if (unknown.length > 0) {
    console.error(`narrow: no component is called ${unknown.join(", ")}`);
    process.exit(1);
  }
  return ids;
}

/** Where Chrome, Edge or Chromium installs. `NSH_BROWSER` and `CHROME_PATH` win. */
function browser(): string | undefined {
  const named = process.env.NSH_BROWSER ?? process.env.CHROME_PATH;
  if (named) return fs.existsSync(named) ? named : undefined;
  if (process.platform === "darwin") {
    const apps = [
      "Google Chrome.app/Contents/MacOS/Google Chrome",
      "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
      "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "Chromium.app/Contents/MacOS/Chromium",
    ];
    for (const app of apps) {
      for (const root of ["/Applications", path.join(os.homedir(), "Applications")]) {
        const exe = path.join(root, app);
        if (fs.existsSync(exe)) return exe;
      }
    }
    return undefined;
  }
  if (process.platform === "win32") {
    const apps = [
      "Google\\Chrome\\Application\\chrome.exe",
      "Microsoft\\Edge\\Application\\msedge.exe",
      "Chromium\\Application\\chrome.exe",
    ];
    for (const app of apps) {
      for (const root of ["ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"]) {
        const exe = path.join(process.env[root] ?? "", app);
        if (exe && fs.existsSync(exe)) return exe;
      }
    }
    return undefined;
  }
  for (const name of ["google-chrome", "google-chrome-stable", "microsoft-edge", "chromium"]) {
    for (const dir of (process.env.PATH ?? "").split(path.delimiter)) {
      const exe = path.join(dir, name);
      if (exe && fs.existsSync(exe)) return exe;
    }
  }
  return undefined;
}

/**
 * A `--browser` script that draws on the CPU and asks for reduced motion, so a rounded corner
 * and a looping animation hold still between runs. Windows keeps `nsh`'s own browser. A caller
 * that already passed `--browser` is left alone.
 */
function softwareBrowser(): { script?: string; done: () => void } {
  const given = process.argv.includes("--browser");
  const exe = given ? undefined : browser();
  if (process.platform === "win32" || !exe) {
    if (!given) {
      console.log(
        "narrow: no browser found to run without the GPU or with reduced motion; a rounded corner may differ by 1/255",
      );
    }
    return { done: () => {} };
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nsh-narrow-"));
  const script = path.join(dir, "browser");
  const quoted = `'${exe.replaceAll("'", `'\\''`)}'`;
  fs.writeFileSync(
    script,
    `#!/bin/sh\nexec ${quoted} --disable-gpu --force-prefers-reduced-motion "$@"\n`,
    { mode: 0o755 },
  );
  return {
    script,
    done: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

/** The page's right margin is 20 points; the band read leaves the card's edge 4 of them. */
const BAND = 16;
/** How far a channel may stray from the page's color and still be page (antialiasing). */
const DELTA = 6;

/**
 * Demos that fill the screen with margins of their own, narrower than the page's 20: what the
 * check would read as page is their frame. Each with why.
 */
const FILLS_THE_SCREEN: Record<string, string> = {
  "nav-stack": "a stack is the whole screen: its header rule and grouped list keep 14 points",
};

const demos = catalog().paths.demos;
const shots = path.join(demos, "shots", "narrow");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });

const only = onlyIds();
const browserScript = softwareBrowser();
const run = (filter?: string) =>
  spawnSync(
    "nsh",
    [
      "test",
      "narrow.test.tsx",
      "--target",
      "web",
      ...(browserScript.script ? ["--browser", browserScript.script] : []),
      ...(filter ? ["--filter", filter] : []),
    ],
    { cwd: demos, stdio: "inherit" },
  ).status ?? 1;

let status = 0;
try {
  for (const filter of only ? only.map((id) => `narrow id=${id}:`) : [undefined]) {
    status ||= run(filter);
  }
} finally {
  browserScript.done();
}

/** The rows whose right margin is not bare page: `[first, last]` runs, in points. */
function overflow(picture: Picture): [number, number][] {
  const { width, height, channels, data } = picture;
  const at = (x: number, y: number) => (y * width + x) * channels;
  const page = data.slice(at(width - 1, height - 1), at(width - 1, height - 1) + 3);
  const runs: [number, number][] = [];
  for (let y = 0; y < height; y++) {
    let bare = true;
    for (let x = width - BAND; x < width && bare; x++) {
      const p = at(x, y);
      for (let c = 0; c < 3; c++) if (Math.abs(data[p + c]! - page[c]!) > DELTA) bare = false;
    }
    if (bare) continue;
    const last = runs.at(-1);
    if (last && last[1] === y - 1) last[1] = y;
    else runs.push([y, y]);
  }
  return runs;
}

const wide: string[] = [];
for (const file of fs.readdirSync(shots).sort()) {
  const id = path.basename(file, ".png");
  if (id in FILLS_THE_SCREEN) continue;
  const runs = overflow(decodePng(fs.readFileSync(path.join(shots, file))));
  if (runs.length === 0) continue;
  wide.push(id);
  console.log(
    `narrow: ${id} runs into the margin at y ${runs.map(([a, b]) => `${a}–${b}`).join(", ")}`,
  );
}
console.log(`screenshots: ${path.relative(process.cwd(), shots)}`);
if (wide.length > 0) {
  console.log(`narrow: ${wide.length} demo(s) wider than 320 points: ${wide.join(", ")}`);
  process.exit(1);
}
if (status !== 0) process.exit(status);
console.log("narrow: every demo fits 320 points");
