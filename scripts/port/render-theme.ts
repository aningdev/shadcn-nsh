/**
 * The render check under the themes the demos can switch to: every demo, and its reference page
 * beside it, drawn with the theme its palette names (`apps/website/demos/palettes.ts`) — shadcn's,
 * the theme the registry installs — and the two compared, so a component drawn by hand still draws
 * what its theme says.
 *
 *   bun scripts/port/render-theme.ts [--only <id,...>] [--changed [<ref>]] [--jobs <n>]
 *                                   [--filter <name>]
 *
 * The test opens each page with the palette in its storage, as the site's switch leaves it, and the
 * page reads it before it mounts (`apply-palette.ts`): the theme arrives the way an app gets it,
 * not from a second `nsh.json` or a copy of the demos with a `selectTheme` added. `default` is the
 * build-time theme, whose check is `render.ts`.
 *
 * `--only` and `--changed` narrow the ids exactly as they do there, and the pages run in the same
 * pool (`--jobs`, `scripts/port/render-shared.ts`).
 *
 * Nothing is kept as a baseline — the build-time theme's pictures are (`render.ts`) — so this
 * pass is reviewed by eye (`port:sheet`) and by what it reports: a component and its reference
 * page differ under a theme exactly when a shell overrides what the theme says.
 *
 * The pictures stay in `demos/shots-theme/`.
 */
import fs from "node:fs";
import path from "node:path";

import { PALETTES } from "../../apps/website/demos/palettes";
import { cases } from "../../apps/website/demos/render-cases";
import { catalog } from "../catalog";
import { changedIds, narrowed } from "./affected";
import { repo } from "./lib";
import {
  comparePairs,
  jobCount,
  onlyIds,
  runPages,
  softwareBrowser,
  testArgs,
} from "./render-shared";

const demos = catalog().paths.demos;
const shots = path.join(demos, "shots-theme");
const only = onlyIds();
const changed = changedIds("theme");
/** The ids to draw: `--only` and `--changed` both narrow, and together they intersect. */
const ids = narrowed(only, changed);
if (ids?.length === 0) {
  console.log("theme: nothing to draw");
  process.exit(0);
}
/** The themes to check: the build-time one is `render.ts`'s. */
const palettes = PALETTES.filter((palette) => palette.id !== "default");
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
    testFile: "render-theme.test.tsx",
    cwd: demos,
    env,
    ids,
    args: testArgs(),
    browser: browserScript.script,
    jobs: jobCount(),
  });
} finally {
  browserScript.done();
}

let differs = 0;
if (status === 0) {
  for (const palette of palettes) {
    differs += comparePairs({
      pass: "theme",
      shots,
      name: (id, scheme) => `${id}-${palette.id}-${scheme}`,
      only: ids,
    });
  }
}

console.log(`screenshots: ${path.relative(repo, shots)}`);
console.log("one page of them all: bun run port:sheet");

const pairs = chosen.filter(({ selfReference }) => !selfReference).length * 2 * palettes.length;
if (differs > 0) {
  console.error(`theme: ${differs} of ${pairs} pages differ from their reference under a theme`);
  process.exit(1);
}
if (status === 0) {
  const themes = palettes.map((palette) => palette.id).join(", ");
  console.log(`theme: ${pairs} pairs match under ${themes}`);
}
process.exit(status);
