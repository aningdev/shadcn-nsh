/**
 * The palette's first frame: a demo the site switched to `shadcn` must draw shadcn from its very
 * first frame — no frame of the build-time theme first, which a visitor would see as a flash.
 *
 *   bun run check:palette [--only button] [--schemes dark,light] [--shots <dir>] [--deadline 8000]
 *
 * Opens the packaged demo (`public/demos/<id>/`, `bun run docs:demos`) in headless Chrome over the
 * DevTools protocol (`demo-frames.ts`), with the palette seeded in localStorage before any page
 * script runs — what the site's switch does before it loads a panel again — and records what each
 * display frame paints:
 * the colors the app writes into the page (its views' inline styles) and into its canvases (icons
 * and the like), frame by frame. The first frame with content must already carry the chosen theme's
 * own colors, and no frame may paint a color only another theme has.
 *
 * Each palette in `demos/palettes.ts` is a run, so `nsh-gallery` is the control: its run has to show
 * the NSH Gallery theme's colors, and a check that stopped seeing a theme fails instead of passing.
 *
 * `--shots <dir>` also keeps the compositor's frames (a screencast) as `palette-<id>-<scheme>/
 * frame-<n>.png`, for a look by eye beside it.
 *
 * `--deadline <ms>` is the longest a run may take to see the page (8000 by default): a demo that
 * never paints fails the run rather than holding the check open.
 *
 * Chrome: `NSH_BROWSER` or `CHROME_PATH` names it, else the usual install paths are tried.
 * Nothing here compiles NSH or needs the site built: it reads a packaged demo and the theme files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_THEMES } from "../../../packages/theme/themes/index";
import { PALETTES, PALETTE_KEY, type PaletteId } from "../demos/palettes";
import { packagedDemo, repo, servePackagedDemos, watchDemo } from "./demo-frames";

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const demo = named("--only") ?? "button";
const schemes = (named("--schemes") ?? "dark,light").split(",").map((scheme) => scheme.trim());
const shots = named("--shots");
/** How long to keep recording after the first painted frame, in milliseconds. */
const wait = Number(named("--wait") ?? 1200);
/** How long a run may take to see the page at all, in milliseconds. */
const deadline = Number(named("--deadline") ?? 8000);

function named(name: string): string | undefined {
  const at = args.indexOf(name);
  return at < 0 ? undefined : args[at + 1];
}

/** The demo app's id and the key its storage keeps the palette under (`src/lib/palette.ts`). */
const nsh = JSON.parse(fs.readFileSync(path.join(docsRoot, "demos", "nsh.json"), "utf8")) as {
  id: string;
};
const STORAGE_KEY = `nsh:${nsh.id}:${PALETTE_KEY}`;

packagedDemo("check:palette", demo);

/** Every string a theme file holds (a gradient's stops and a shadow's colors are in one). */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** The sRGB channels `oklch(L C H)` stands for (the conversion CSS does), 0 to 255. */
function oklch(lightness: number, chroma: number, hue: number): [number, number, number] {
  const h = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(h);
  const b = chroma * Math.sin(h);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const encode = (channel: number) => {
    const c = Math.min(1, Math.max(0, channel));
    return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055));
  };
  return [
    encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/**
 * A color as its sRGB channels (`"r,g,b"`), comparing a theme's colors with what the page paints —
 * the page gets `rgb()` and hex from the runtime, the theme files say `oklch()`. `null` for a value
 * that is no color this can read (a `color-mix()`, a name): those are left out of the comparison.
 */
function rgb(value: string): string | null {
  const v = value.trim().toLowerCase();
  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const digits = hex[1]!;
    if (digits.length === 3 || digits.length === 4) {
      return [...digits.slice(0, 3)].map((d) => parseInt(d + d, 16)).join(",");
    }
    if (digits.length === 6 || digits.length === 8) {
      return [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16)).join(",");
    }
    return null;
  }
  const fn = v.match(/^(rgba?|oklch)\(([^)]*)\)$/);
  if (!fn) return null;
  const parts = fn[2]!
    .split(/[\s,/]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (fn[1] === "oklch") {
    const number = (part: string | undefined) =>
      part?.endsWith("%") ? Number(part.slice(0, -1)) / 100 : Number(part);
    if (parts.length < 3) return null;
    const [l, c, h] = [number(parts[0]), number(parts[1]), number(parts[2])] as const;
    if (![l, c, h].every(Number.isFinite)) return null;
    return oklch(l, c, h).join(",");
  }
  if (parts.length < 3) return null;
  const channels = parts
    .slice(0, 3)
    .map((part) =>
      part.endsWith("%")
        ? Math.round((Number(part.slice(0, -1)) * 255) / 100)
        : Math.round(Number(part)),
    );
  return channels.every(Number.isFinite) ? channels.join(",") : null;
}

/** A palette's colors: every color its theme holds — the spec and the `theme.json` built from it. */
function themeColors(id: PaletteId): Set<string> {
  const theme = ALL_THEMES.find((entry) => entry.id === id);
  if (!theme) throw new Error(`palette: no theme "${id}"`);
  const colors = [...strings(theme.spec), ...strings(theme.theme)]
    .map(rgb)
    .filter((color): color is string => color !== null);
  return new Set(colors);
}

/** The colors only `a` has: what the other theme's canvas or page never shows. */
function ownOnly(a: Set<string>, b: Set<string>): Set<string> {
  return new Set([...a].filter((color) => !b.has(color)));
}

/** What the page records, frame by frame. */
type Frame = {
  /** Milliseconds since the navigation started, at the frame's start. */
  t: number;
  /** How many fills and strokes the frame drew on canvases. */
  draws: number;
  /** The views on screen at the frame's start; 0 while the page keeps them hidden. */
  views: number;
  colors: string[];
};

const palettes = PALETTES.map((palette) => ({
  ...palette,
  colors: themeColors(palette.id),
}));

const server = servePackagedDemos();
const origin = server.origin;

let failed = 0;
for (const palette of palettes) {
  for (const scheme of schemes) {
    const name = `${demo}: palette=${palette.id}, ${scheme}`;
    const frames = await run(palette.id, scheme);
    const own = ownOnly(palette.colors, union(palettes, palette.id));
    const foreign = palettes
      .filter((other) => other.id !== palette.id)
      .map((other) => ownOnly(other.colors, palette.colors));
    const foreignColors = new Set(foreign.flatMap((colors) => [...colors]));

    const painted = frames.filter((frame) => frame.draws > 0 || frame.views > 0);
    const first = painted[0];
    if (!first) {
      console.error(`palette: ${name}: nothing was painted`);
      failed += 1;
      continue;
    }
    const colorsOf = (frame: Frame) =>
      frame.colors.map(rgb).filter((color): color is string => color !== null);
    const early = colorsOf(first).filter((color) => foreignColors.has(color));
    const all = [...new Set(painted.flatMap(colorsOf))];
    const late = all.filter((color) => foreignColors.has(color));
    const themed = colorsOf(first).filter((color) => own.has(color));
    console.log(
      `palette: ${name}: first frame at ${Math.round(first.t)} ms, ${first.views} views, ${first.colors.length} colors (${themed.length} of its own)`,
    );
    if (themed.length === 0) {
      console.error(
        `palette: ${name}: the first frame carries none of the ${palette.id} theme's colors`,
      );
      console.error(`palette:   it painted: ${first.colors.slice(0, 8).join(", ")}`);
      failed += 1;
    }
    if (late.length > 0) {
      console.error(`palette: ${name}: it painted ${late.length} color(s) only another theme has:`);
      console.error(`palette:   ${late.slice(0, 8).join(", ")}`);
      if (early.length > 0) console.error(`palette:   ${early.length} of them in the first frame`);
      failed += 1;
    }
  }
}

server.stop();
if (failed > 0) {
  console.error(`palette: ${failed} run(s) failed`);
  process.exit(1);
}
console.log(`palette: every palette's first frame is drawn in it (${demo}, ${schemes.join(", ")})`);

/** All the other palettes' colors, as one set. */
function union(all: { id: PaletteId; colors: Set<string> }[], except: PaletteId): Set<string> {
  const out = new Set<string>();
  for (const palette of all) {
    if (palette.id === except) continue;
    for (const color of palette.colors) out.add(color);
  }
  return out;
}

/** One run: the page in `palette` and `scheme`, open in a fresh Chrome, its frames read back. */
async function run(palette: PaletteId, scheme: string): Promise<Frame[]> {
  const url = `${origin}/demos/${demo}/index.html?idiom=desktop&theme=${scheme}`;
  const dir = shots ? path.join(shots, `palette-${palette}-${scheme}`) : undefined;
  if (dir) fs.mkdirSync(dir, { recursive: true });
  let frames: Frame[] = [];
  // Enough frames after the first painted one to see a swap that came later.
  let until = 0;
  let at = 0;
  await watchDemo({
    label: "check:palette",
    url,
    source: sampler(palette, STORAGE_KEY),
    deadlineMs: deadline,
    screencast: dir
      ? (png) => {
          fs.writeFileSync(path.join(dir, `frame-${String(at++).padStart(2, "0")}.png`), png);
        }
      : undefined,
    poll: async (read) => {
      const seen = await read("JSON.stringify(window.__paletteFrames ?? [])");
      frames = JSON.parse(seen || "[]") as Frame[];
      const painted = frames.findIndex((frame) => frame.draws > 0 || frame.views > 0);
      if (painted >= 0 && until === 0) until = Date.now() + wait;
      return until > 0 && Date.now() > until;
    },
  });
  return frames;
}

function sampler(palette: string, key: string): string {
  return `(() => {
  try { localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(palette)}); } catch {}
  const frames = [];
  Object.defineProperty(window, "__paletteFrames", { value: frames });
  let pending = { t: performance.now(), draws: 0, views: 0, colors: [] };
  const seen = new Set();
  const add = (value) => {
    if (typeof value === "string" && value && !seen.has(value)) {
      seen.add(value);
      pending.colors.push(value);
    }
  };
  const flush = () => {
    frames.push(pending);
    pending = { t: performance.now(), draws: 0, views: 0, colors: [] };
    seen.clear();
  };

  // What the app draws on its canvases (icons and the like).
  const ctx = CanvasRenderingContext2D.prototype;
  const style = (name) => {
    const desc = Object.getOwnPropertyDescriptor(ctx, name);
    if (!desc || !desc.set) return;
    Object.defineProperty(ctx, name, {
      configurable: true,
      get() { return desc.get.call(this); },
      set(value) { desc.set.call(this, value); add(value); },
    });
  };
  style("fillStyle");
  style("strokeStyle");
  const stop = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function (offset, value) {
    add(String(value));
    return stop.call(this, offset, value);
  };
  for (const name of ["fillRect", "fill", "fillText", "strokeRect", "stroke", "strokeText"]) {
    const original = ctx[name];
    if (typeof original !== "function") continue;
    ctx[name] = function (...rest) {
      const page = document.getElementById("app");
      if (page && page.style.visibility === "hidden") return original.apply(this, rest);
      pending.draws += 1;
      add(this.fillStyle);
      add(this.strokeStyle);
      return original.apply(this, rest);
    };
  }

  // What the app writes into the page: its views' inline styles.
  const sampleViews = () => {
    const page = document.getElementById("app");
    if (page && page.style.visibility === "hidden") return;
    const root = document.querySelector(".nsh-root");
    if (!root) return;
    const views = root.querySelectorAll("[style]");
    if (views.length > pending.views) pending.views = views.length;
    for (const view of views) {
      const s = view.style;
      add(s.backgroundColor);
      add(s.color);
      add(s.borderColor);
      add(s.borderTopColor);
      add(s.borderBottomColor);
      add(s.fill);
      add(s.stroke);
    }
  };

  const tick = () => { sampleViews(); flush(); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
})();`;
}
