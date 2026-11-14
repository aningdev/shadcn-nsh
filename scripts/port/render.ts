/**
 * Runs the render check (`<root>/demos/render.test.tsx`) in a headless browser. The test writes
 * its screenshots to `shots/` beside it, relative to the directory it runs in, so it runs there.
 *
 *   bun scripts/port/render.ts [--only <id,...>] [--filter <name>] [--no-baseline]
 *
 * `--only` runs the pages of the ids named (a comma-separated list of catalog ids, matched
 * whole: `--only table` leaves `data-table` alone), which is what a family's change needs. The
 * test names carry `id=` so `nsh test`'s substring `--filter` can name one alone.
 * `--no-baseline` skips the comparison with `baseline/`, which was recorded on macOS: another
 * platform draws text differently, so there only the component ↔ reference pairs are a gate.
 *
 * The pictures are compared here, after the test, which only takes them: byte for byte, or
 * within a page's `tolerance` (the avatar's circular photos) or the antialiasing budget every
 * page shares (`render-cases.ts`). A difference beyond that fails the gate.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { antialiasing, cases, schemes } from "../../apps/docs/demos/render-cases";
import { catalog } from "../catalog";
import { repo } from "./lib";
import { compareWithinTolerance } from "./pixels";

const demos = catalog().paths.demos;

/** The ids `--only` names, validated: the test narrows its table by `RENDER_ONLY`. */
function onlyIds(): string[] | undefined {
  const at = process.argv.indexOf("--only");
  if (at < 0) return undefined;
  const value = process.argv[at + 1];
  if (!value) {
    console.error("render: --only takes a comma-separated list of ids (`--only select,combobox`)");
    process.exit(1);
  }
  const ids = value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length === 0) {
    console.error("render: --only names no id");
    process.exit(1);
  }
  const unknown = ids.filter((id) => !catalog().components.some((c) => c.id === id));
  if (unknown.length > 0) {
    console.error(`render: no component is called ${unknown.join(", ")}`);
    process.exit(1);
  }
  return ids;
}

const only = onlyIds();
/** The same list for `baseline.ts`: it re-records (or checks) those pictures alone. */
const onlyArg = only ? ["--only", only.join(",")] : [];
const shots = path.join(demos, "shots");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });

// An installed CLI finds its runtimes next to `bin/nsh`, so nothing sets `NSH_RUNTIME`
// here; a caller that sets it still gets it through `process.env`.
const env = { ...process.env };

/** The arguments `nsh test` takes: everything but our own (`--only <ids>`, `--no-baseline`). */
const passthrough = process.argv.slice(2).filter((arg, index, all) => {
  if (arg === "--no-baseline" || arg === "--only") return false;
  return all[index - 1] !== "--only";
});

/** Where Chrome, Edge or Chromium installs, in `nsh`'s own order and paths (cut down). */
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
 * `exe` with the flags the comparison needs, as a script `--browser` can name. The GPU is left
 * alone: on it Chrome draws the antialiased corner of a rounded edge (a `Status` dot's) a level
 * off (1/255) now and then, so a page differs from itself (`status: pointer, dark`, about one
 * run in six); drawn on the CPU the two pictures match every time. And the user asks for less
 * motion: the test pages pass `reducedMotion`, which the web target does not emulate (only a
 * headless engine does), so the runtime's `.nsh-reduce` would never switch off transitions and
 * endless animations — a spinner would turn with the wall clock, a few degrees apart between
 * two runs. Windows spawns no script: there the check runs as it did, with `nsh`'s own browser
 * and flags.
 */
function browserWithFlags(exe: string): string | undefined {
  if (process.platform === "win32") return undefined;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nsh-render-"));
  const script = path.join(dir, "browser");
  const quoted = `'${exe.replaceAll("'", `'\\''`)}'`;
  fs.writeFileSync(
    script,
    `#!/bin/sh\nexec ${quoted} --disable-gpu --force-prefers-reduced-motion "$@"\n`,
    {
      mode: 0o755,
    },
  );
  return script;
}

const given = process.argv.includes("--browser");
const exe = given ? undefined : browser();
const software = exe ? browserWithFlags(exe) : undefined;
if (!given && !software) {
  console.log(
    "render: no browser found to run without the GPU or with reduced motion; a rounded corner may differ by 1/255 and endless animations move between runs",
  );
}

/** One `nsh test` run: the whole table, or the pages of one id (`id=<id>:`, a substring). */
function run(filter?: string): number {
  const result = spawnSync(
    "nsh",
    [
      "test",
      "render.test.tsx",
      "--target",
      "web",
      ...(software ? ["--browser", software] : []),
      ...(filter ? ["--filter", filter] : passthrough),
    ],
    { cwd: demos, stdio: "inherit", env },
  );
  return result.status ?? 1;
}

let status = 0;
if (only) {
  for (const id of only) {
    if (status !== 0) break;
    status = run(`id=${id}:`);
  }
} else {
  status = run();
}
if (software) fs.rmSync(path.dirname(software), { recursive: true, force: true });
console.log(`screenshots: ${path.relative(repo, shots)}`);
console.log("one page of them all: bun run port:sheet");

/** Every pair, compared: byte for byte, or within the page's tolerance (`pixels.ts`). */
function comparePixels(): number {
  let failed = 0;
  for (const { id, tolerance } of cases) {
    const allowed = tolerance ?? antialiasing;
    for (const scheme of schemes) {
      const name = `${id}-pointer-${scheme}`;
      const ours = path.join(shots, `${name}.png`);
      const theirs = path.join(shots, `${name}.ref.png`);
      if (!fs.existsSync(ours) || !fs.existsSync(theirs)) {
        console.error(`render: ${name}: no screenshots to compare`);
        failed += 1;
        continue;
      }
      const a = fs.readFileSync(ours);
      const b = fs.readFileSync(theirs);
      if (a.equals(b)) continue;
      const { ok, report } = compareWithinTolerance(a, b, allowed);
      if (ok) console.log(`render: ${name}: within the antialiasing budget — ${report}`);
      else {
        const why = tolerance ? ` (${tolerance.why})` : "";
        console.error(`render: ${name}: outside the budget — ${report}${why}`);
        failed += 1;
      }
    }
  }
  return failed;
}

const differs = status === 0 ? comparePixels() : 0;
if (differs > 0) process.exit(1);
// A filtered run holds only some of the shots, so it cannot be compared with the whole baseline;
// a `--only` run holds exactly the ids it names, which `baseline.ts` checks on their own.
if (status === 0) {
  if (process.argv.includes("--filter")) {
    console.log("baseline: skipped for a filtered run");
  } else if (process.argv.includes("--no-baseline")) {
    console.log("baseline: skipped (--no-baseline)");
  } else {
    const compare = spawnSync("bun", [path.join(import.meta.dir, "baseline.ts"), ...onlyArg], {
      cwd: repo,
      stdio: "inherit",
    });
    if ((compare.status ?? 1) !== 0) process.exit(compare.status ?? 1);
  }
}
process.exit(status);
