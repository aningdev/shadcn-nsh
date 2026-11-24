/**
 * The render check under the themes the demos can switch to: every demo, and its reference page
 * beside it, drawn with the theme its palette names (`apps/website/demos/palettes.ts`) — shadcn's,
 * the theme the registry installs — and the two compared, so a component drawn by hand still draws
 * what its theme says.
 *
 *   bun scripts/port/render-theme.ts [--only <id,...>] [--changed [<ref>]] [--shard <i>/<n>] [--jobs <n>]
 *                                   [--theme <id,...>] [--against <dir>] [--filter <name>] [--list]
 *
 * The test opens each page with the palette in its storage, as the site's switch leaves it, and the
 * page reads it before it mounts (`apply-palette.ts`): the theme arrives the way an app gets it,
 * not from a second `nsh.json` or a copy of the demos with a `selectTheme` added. `nsh-gallery` is the
 * build-time theme, whose check is `render.ts`.
 *
 * `--only`, `--changed` and `--shard` narrow the ids exactly as they do there, `--changed` also
 * narrows the themes to the ones whose values moved, and `--theme` names themes to check; the two
 * intersect. The pages run in the same pool (`--jobs`, `scripts/port/render-shared.ts`). `--list`
 * prints what the flags selected and why, and draws nothing.
 *
 * Nothing is kept as a baseline — the build-time theme's pictures are (`render.ts`) — so this
 * pass is reviewed by eye (`port:sheet`) and by what it reports: a component and its reference
 * page differ under a theme exactly when a shell overrides what the theme says.
 *
 * The pictures stay in `demos/shots-theme/`.
 *
 * `--against <dir>` draws every page on its own (no reference page beside it) and compares each
 * picture with the same one in `<dir>`, a copy of `shots-theme/` an earlier run left: the proof
 * that a theme refactor moved no pixel under any theme (`docs/port.md`, 主题改动的验收).
 */
import fs from "node:fs";
import path from "node:path";

import { PALETTES } from "../../apps/website/demos/palettes";
import { cases } from "../../apps/website/demos/render-cases";
import { catalog } from "../catalog";
import { changedScope, narrowed } from "./affected";
import { repo } from "./lib";
import {
  compareAgainst,
  comparePairs,
  jobCount,
  listScope,
  onlyIds,
  shardIds,
  runPages,
  softwareBrowser,
  testArgs,
} from "./render-shared";

const demos = catalog().paths.demos;
const shots = path.join(demos, "shots-theme");
/** The themes to check: the build-time one is `render.ts`'s. */
const pool: string[] = PALETTES.filter((palette) => palette.id !== "nsh-gallery").map(
  ({ id }) => id,
);
const only = onlyIds();

/** The themes `--theme` names, validated against the pool; nothing when the flag is absent. */
const namedThemes = (() => {
  const at = process.argv.indexOf("--theme");
  if (at < 0) return undefined;
  const value = process.argv[at + 1];
  const ids = (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    console.error("theme: --theme takes a comma-separated list of themes (`--theme shadcn,apple`)");
    process.exit(1);
  }
  const unknown = ids.filter((id) => !pool.includes(id));
  if (unknown.length > 0) {
    console.error(
      `theme: no theme is called ${unknown.join(", ")}; this pass draws ${pool.join(", ")}`,
    );
    process.exit(1);
  }
  return ids;
})();

const scope = changedScope("theme", pool);
/** The ids to draw: `--only` and `--changed` both narrow, and together they intersect. */
const ids = shardIds(narrowed(only, scope.ids));
/** The themes to draw: `--theme` and `--changed` both narrow, and together they intersect. */
const themes = pool.filter(
  (id) => (namedThemes?.includes(id) ?? true) && (scope.themes?.includes(id) ?? true),
);
if (process.argv.includes("--list")) {
  listScope("theme", ids, themes, pool);
  process.exit(0);
}
if (themes.length === 0 || ids?.length === 0) {
  console.log("theme: nothing to draw");
  process.exit(0);
}
const palettes = PALETTES.filter((palette) => themes.includes(palette.id));
/** One test process per sheet: a narrowed theme pick needs its own `--filter`, and `nsh test`
 * takes one filter at a time. The whole pool stays one process per page. */
const narrowedThemes = themes.length < pool.length;
const tasks = narrowedThemes
  ? (ids ?? cases.map(({ id }) => id)).flatMap((id) => themes.map((theme) => `${id}:${theme}`))
  : ids;

/** The earlier run's pictures `--against` names, or nothing. */
const against = (() => {
  const at = process.argv.indexOf("--against");
  if (at < 0) return undefined;
  const value = process.argv[at + 1];
  const dir = value ? path.resolve(value) : "";
  if (!value || !fs.existsSync(dir)) {
    console.error("theme: --against takes the directory of an earlier run's pictures");
    process.exit(1);
  }
  if (dir === path.resolve(shots)) {
    console.error(
      `theme: --against cannot be ${path.relative(repo, shots)}, which this run clears; copy it first`,
    );
    process.exit(1);
  }
  return dir;
})();
const chosen = cases.filter(({ id }) => !ids || ids.includes(id));

// The runtime `nsh test` runs with is the installed CLI's (`docs/toolchain.md`); it finds its
// runtimes next to `bin/nsh`, so nothing sets `NSH_RUNTIME` here; a caller that sets it still gets
// it through `process.env`.
const env = { ...process.env };

fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });
const browserScript = softwareBrowser();
let status: number;
try {
  status = await runPages({
    pass: "theme",
    testFile: against ? "render-theme-components.test.tsx" : "render-theme.test.tsx",
    cwd: demos,
    env,
    ids: tasks,
    filterFor: narrowedThemes
      ? (task) => {
          const [id, theme] = task.split(":");
          return `id=${id}: ${theme},`;
        }
      : undefined,
    args: testArgs(),
    browser: browserScript.script,
    jobs: jobCount(),
  });
} finally {
  browserScript.done();
}

let differs = 0;
let moved = 0;
if (status === 0) {
  for (const palette of palettes) {
    const check = {
      pass: "theme",
      shots,
      name: (id: string, scheme: string) => `${id}-${palette.id}-${scheme}`,
      only: ids,
      // `--against` draws each page alone: the reference pages are what an earlier run had.
      reference: against === undefined,
    };
    differs += comparePairs(check);
    if (against) moved += compareAgainst(check, against);
  }
}

console.log(`screenshots: ${path.relative(repo, shots)}`);
console.log("one page of them all: bun run port:sheet");

const pairs = against
  ? 0
  : chosen.filter(({ selfReference }) => !selfReference).length * 2 * palettes.length;
if (differs > 0) {
  console.error(`theme: ${differs} of ${pairs} pages differ from their reference under a theme`);
}
if (moved > 0) {
  console.error(`theme: ${moved} pictures differ from ${path.relative(repo, against!)}`);
}
if (differs > 0 || moved > 0) process.exit(1);
if (status === 0) {
  if (against) console.log(`theme: every picture matches ${path.relative(repo, against)}`);
  else console.log(`theme: ${pairs} pairs match under ${themes.join(", ")}`);
}
process.exit(status);
