/**
 * What the two picture checks share (`render.ts`, `render-theme.ts`): which ids `--only` names,
 * the browser the pages are drawn in, the pool of `nsh test` processes that draws the pages, and
 * the comparison of every component with its reference page.
 *
 * Both are scripts, not a library: `scripts/port` is the tooling around the components, and only
 * it reads `apps/website/demos`.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { antialiasing, cases, schemes } from "../../apps/website/demos/render-cases";
import { catalog } from "../catalog";
import { compareWithinTolerance } from "./pixels";

/**
 * The arguments `nsh test` takes: everything but this script's own (`--only`, `--changed`,
 * `--jobs`, `--no-baseline`), each with its value. A caller's `--filter` and `--browser` stay.
 */
export function testArgs(): string[] {
  const argv = process.argv.slice(2);
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "--only" || arg === "--jobs") {
      i += 1;
      continue;
    }
    if (arg === "--no-baseline") continue;
    if (arg === "--changed") {
      // The ref is optional, so only a non-flag after it comes with the flag.
      if (argv[i + 1] && !argv[i + 1]!.startsWith("-")) i += 1;
      continue;
    }
    rest.push(arg);
  }
  return rest;
}

/**
 * How many `nsh test` processes run at once: `--jobs N`, or half the cores at most six. One
 * process at a time is the run there was before the pool, and the wall time everything else is
 * compared with.
 */
export function jobCount(): number {
  const at = process.argv.indexOf("--jobs");
  if (at < 0) return Math.max(1, Math.min(6, Math.floor(os.cpus().length / 2)));
  const value = Number(process.argv[at + 1]);
  if (!Number.isInteger(value) || value < 1) {
    console.error(
      "render: --jobs takes a count of processes (`--jobs 4`; `--jobs 1` is one at a time)",
    );
    process.exit(1);
  }
  return value;
}

/** The ids `--only` names, validated: the pool draws those pages and no others. */
export function onlyIds(): string[] | undefined {
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

/**
 * The `--browser` script a run passes `nsh test`, or nothing when the caller named a browser
 * itself (`--browser`) or this host has none: then the check runs as `nsh` would run it.
 */
export function softwareBrowser(): { script?: string; done: () => void } {
  const given = process.argv.includes("--browser");
  const exe = given ? undefined : browser();
  const script = exe ? browserWithFlags(exe) : undefined;
  if (!given && !script) {
    console.log(
      "render: no browser found to run without the GPU or with reduced motion; a rounded corner may differ by 1/255 and endless animations move between runs",
    );
  }
  return {
    script,
    done: () => {
      if (script) fs.rmSync(path.dirname(script), { recursive: true, force: true });
    },
  };
}

/** What one picture check runs, and where: the pool passes it to every `nsh test` process. */
export type PageRun = {
  /** The check's name in a message: `render`, `theme`. */
  pass: string;
  /** The test file beside the demos (`render.test.tsx`, `render-theme.test.tsx`). */
  testFile: string;
  /** The directory the test runs in: `apps/website/demos`, where its `shots/` go. */
  cwd: string;
  env: Record<string, string | undefined>;
  /** The ids to draw, or nothing for the whole table. */
  ids?: string[];
  /** `nsh test`'s own arguments (`testArgs()`), and the wrapper `--browser` script. */
  args: string[];
  browser?: string;
  /** How many processes run at once (`jobCount()`). */
  jobs: number;
};

/** One `nsh test` process: an id's pages (`id=<id>:`), or the whole table when `id` is absent. */
type Task = { id?: string; label: string; args: string[] };

/** A process that ended: its status, and everything it wrote, buffered until it is printed. */
type Done = { task: Task; status: number; output: string; ms: number };

/** `nsh test` in its own process, its output kept until it ends, so two runs never interleave. */
function one(run: PageRun, task: Task): Promise<Done> {
  const started = performance.now();
  return new Promise((resolve) => {
    const child = spawn("nsh", task.args, {
      cwd: run.cwd,
      env: run.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      output += chunk;
    });
    child.on("error", (error) => {
      output += `${error.message}\n`;
    });
    child.on("close", (code, signal) => {
      const status = signal ? 1 : (code ?? 1);
      resolve({ task, status, output, ms: performance.now() - started });
    });
  });
}

/** A process's whole output, with what it was and whether it passed above it. */
function report(pass: string, done: Done) {
  const took = `${(done.ms / 1000).toFixed(1)}s`;
  const header = `${pass}: ${done.task.label}: ${done.status === 0 ? "passed" : `failed (exit ${done.status})`} in ${took}`;
  const body = done.output.trimEnd();
  if (done.status === 0) {
    console.log(header);
    if (body) console.log(body);
  } else {
    // A failure's own lines say why; they go to stderr with it so a CI log shows them at once.
    console.error(header);
    if (body) console.error(body);
  }
}

/**
 * The pool: one `nsh test --filter id=<id>:` process per id, `jobs` of them at a time. `nsh`
 * runs one file's tests one after the other, so a page's wall time is mostly the engine's: four
 * ids serially took 18 s, as four processes 10 s, with no clash between their screenshots.
 *
 * Every process's output is buffered and printed whole when it ends, so a failure reads in one
 * piece. After the first failure no new id is started (the in-flight ones finish and print); the
 * run fails with that status. `--filter` and `--jobs 1` with no list run the table in one process,
 * which is the check as it was before the pool.
 */
export async function runPages(run: PageRun): Promise<number> {
  const base = [
    "test",
    run.testFile,
    "--target",
    "web",
    ...(run.browser ? ["--browser", run.browser] : []),
  ];
  // Our own `--filter` picks pages `nsh` names itself, so the pool cannot shard them further.
  const filtered = run.ids === undefined && run.args.includes("--filter");
  const wholeTable = run.ids === undefined;
  const tasks: Task[] =
    wholeTable && (run.jobs === 1 || filtered)
      ? [
          {
            label: filtered ? "the pages `--filter` names" : "the whole table",
            args: base.concat(run.args),
          },
        ]
      : (run.ids ?? cases.map(({ id }) => id)).map((id) => ({
          id,
          label: `id=${id}`,
          args: base.concat(["--filter", `id=${id}:`]),
        }));
  const jobs = Math.min(run.jobs, tasks.length);
  if (jobs > 1) console.log(`${run.pass}: ${tasks.length} pages, ${jobs} processes at a time`);

  let next = 0;
  let started = 0;
  let failure = 0;
  const worker = async () => {
    for (;;) {
      if (failure !== 0) return;
      const index = next++;
      if (index >= tasks.length) return;
      started += 1;
      const done = await one(run, tasks[index]!);
      report(run.pass, done);
      if (done.status !== 0 && failure === 0) failure = done.status;
    }
  };
  await Promise.all(Array.from({ length: jobs }, worker));

  const unrun = tasks.length - started;
  if (failure !== 0 && unrun > 0) {
    console.error(
      `${run.pass}: stopped after a failure; ${unrun} of ${tasks.length} pages were not run`,
    );
  }
  return failure;
}

/** What one picture check compares, and where its pictures are. */
export type PairCheck = {
  /** The check's own name in a message: `render`, `theme`. */
  pass: string;
  /** The directory the pictures are in. */
  shots: string;
  /** A picture's name for an id and an appearance, without `.png`. */
  name: (id: string, scheme: string) => string;
  /** The ids `--only` ran alone: the other pages' pictures are not there to compare. */
  only?: string[];
};

/** Every pair, compared: byte for byte, or within the page's tolerance (`pixels.ts`). */
export function comparePairs(check: PairCheck): number {
  let failed = 0;
  for (const { id, tolerance, selfReference } of cases) {
    if (check.only && !check.only.includes(id)) continue;
    // A self-reference has no second page: its picture is the only one.
    if (selfReference) continue;
    const allowed = tolerance ?? antialiasing;
    for (const scheme of schemes) {
      const name = check.name(id, scheme);
      const ours = path.join(check.shots, `${name}.png`);
      const theirs = path.join(check.shots, `${name}.ref.png`);
      if (!fs.existsSync(ours) || !fs.existsSync(theirs)) {
        console.error(`${check.pass}: ${name}: no screenshots to compare`);
        failed += 1;
        continue;
      }
      const a = fs.readFileSync(ours);
      const b = fs.readFileSync(theirs);
      if (a.equals(b)) continue;
      const { ok, report } = compareWithinTolerance(a, b, allowed);
      if (ok) console.log(`${check.pass}: ${name}: within the antialiasing budget — ${report}`);
      else {
        const why = tolerance ? ` (${tolerance.why})` : "";
        console.error(`${check.pass}: ${name}: outside the budget — ${report}${why}`);
        failed += 1;
      }
    }
  }
  return failed;
}
