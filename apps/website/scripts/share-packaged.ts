/**
 * One copy of what the packaged apps share.
 *
 * `nsh package --target web` writes a whole static site per app, and the runtime in it is the
 * same bytes every time: `nsh.<hash>.js` and its `browser.<hash>/` modules, the syntax and math
 * tables, the preload/start scripts. The wasm differs only by the features the app links — 25
 * distinct wasms across the 84 demos, 42 of them on one. Copied per app, that was 966 MB of the
 * 1.1 GB the docs build deployed, and `docs` deploys two channels of it.
 *
 * So every file whose bytes another app also has keeps one copy, under `public/_nsh/<path inside
 * the package>`; the other copies are deleted and the pages name `../_nsh/<path>` instead. `nsh`
 * names each file after its content, so two apps writing the same name write the same bytes —
 * checked here (size, then sha256) rather than assumed.
 *
 * What stays with its app: the page (`index.html`), the app's own bundle (`app.<hash>.js`), the
 * theme chunks (they import that bundle), the `facades/` the bundle imports, and the
 * `manifest.webmanifest`. Their references are module imports resolved from the file, so moving
 * them would mean rewriting the bundle; they are ~90 KB an app.
 *
 * The precompressed `.gz`/`.br` siblings go: the page names only the plain file and nothing
 * requests the others, while GitHub Pages compresses on the wire. They were 414 MB a channel.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { WebPackage } from "./package-web";

/** Where the shared files go, under `apps/website/public/`: `public/_nsh/<path>`. */
export const SHARED_ROOT = "_nsh";

/** What a page loads as itself: the page, its bundle, the chunks that import the bundle, its
 * facades, its manifest. Never shared. */
const PER_APP = [/^index\.html$/, /^app\.[0-9a-f]+\.js$/, /^facades\//, /^manifest\.webmanifest$/];

/** What `sharePackaged` did: files kept once, bytes not copied again, bytes of `.gz`/`.br` gone,
 * and the names that had several apps' different bytes under one name (kept with each app). */
export interface Sharing {
  files: number;
  saved: number;
  dropped: number;
  differing: string[];
}

/**
 * Keeps one copy of every file the `apps` share, under `<publicRoot>/_nsh/`, deletes the other
 * copies and the precompressed siblings, and points each app's page at the shared copy. `_nsh` is
 * rebuilt from scratch: run it on the whole set, not on a few of it.
 */
export function sharePackaged(apps: WebPackage[], publicRoot: string): Sharing {
  const sharedRoot = path.join(publicRoot, SHARED_ROOT);
  fs.rmSync(sharedRoot, { recursive: true, force: true });

  const dropped = apps.reduce((bytes, app) => bytes + dropPrecompressed(app.outDir), 0);

  // Every file of every app, by the path it has inside its package.
  const groups = new Map<string, { file: string; size: number }[]>();
  for (const app of apps) {
    for (const rel of walk(app.outDir)) {
      const file = path.join(app.outDir, rel);
      const group = groups.get(rel) ?? [];
      group.push({ file, size: fs.statSync(file).size });
      groups.set(rel, group);
    }
  }

  const shared: string[] = [];
  const differing: string[] = [];
  let saved = 0;
  for (const [rel, copies] of groups) {
    if (copies.length < 2 || PER_APP.some((pattern) => pattern.test(rel))) continue;
    const sizes = new Set(copies.map((copy) => copy.size));
    if (sizes.size > 1 || new Set(copies.map((copy) => hash(copy.file))).size > 1) {
      differing.push(rel);
      continue;
    }
    const [keeper, ...rest] = copies;
    if (!keeper) continue;
    const target = path.join(sharedRoot, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(keeper.file, target);
    for (const copy of rest) {
      fs.rmSync(copy.file);
      saved += copy.size;
    }
    shared.push(rel);
  }

  // Longest first, so a name that is the tail of another is rewritten after it.
  const longestFirst = shared.sort((a, b) => b.length - a.length);
  for (const app of apps) rewritePage(app, sharedRoot, longestFirst);
  for (const app of apps) pruneEmptyDirs(app.outDir);

  return { files: shared.length, saved, dropped, differing };
}

/** The page names the shared copy: `./<rel>` and `"<rel>"` become `<prefix><rel>`, where the
 * prefix climbs out of the app's directory into `_nsh`. A reference in any other form throws
 * rather than shipping a page that asks for a file that is not there. */
function rewritePage(app: WebPackage, sharedRoot: string, shared: string[]) {
  const page = path.join(app.outDir, "index.html");
  const html = fs.readFileSync(page, "utf8");
  const prefix = `${path.relative(app.outDir, sharedRoot).split(path.sep).join("/")}/`;
  let rewritten = html;
  for (const rel of shared) {
    rewritten = rewritten.split(`./${rel}`).join(`${prefix}${rel}`);
    rewritten = rewritten.split(`"${rel}"`).join(`"${prefix}${rel}"`);
  }
  for (const rel of shared) {
    if (count(html, rel) !== count(rewritten, `${prefix}${rel}`)) {
      throw new Error(
        `${app.name}/index.html names ${rel} in a form sharePackaged does not rewrite`,
      );
    }
  }
  if (rewritten !== html) fs.writeFileSync(page, rewritten);
}

/** The files under `dir`, as paths relative to it, directories and all. */
function walk(dir: string, prefix = ""): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(dir, entry.name), `${prefix}${entry.name}/`)
      : [`${prefix}${entry.name}`],
  );
}

/** Deletes the `.gz` and `.br` siblings under `dir`; answers how many bytes they held. */
function dropPrecompressed(dir: string): number {
  let bytes = 0;
  for (const rel of walk(dir)) {
    if (!/\.(gz|br)$/.test(rel)) continue;
    const file = path.join(dir, rel);
    bytes += fs.statSync(file).size;
    fs.rmSync(file);
  }
  return bytes;
}

/** Removes the directories left empty by the move, `dir` itself excepted. */
function pruneEmptyDirs(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(dir, entry.name);
    pruneEmptyDirs(child);
    if (fs.readdirSync(child).length === 0) fs.rmdirSync(child);
  }
}

function hash(file: string): string {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}
