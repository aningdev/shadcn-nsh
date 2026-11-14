/**
 * The copy-into-app gate, run from the app's side: build the registry, serve it, install it into
 * real NSH apps with this repository's CLI, and type check — and run — what landed there.
 *
 * Two passes, because they catch different things (docs/port.md#检查):
 *
 * - **all at once**: one app, `init`, `add --all`, `nsh check`, then `nsh test` on a page that
 *   imports every item: a component that cannot resolve, or throws while it loads, fails here;
 * - **one at a time**: a fresh app per `registry:ui` item, `add <item>` and `nsh check`: an
 *   import no item delivers (a missing `registryDependencies` entry or lib file), or a file the
 *   transform points at the wrong place, shows up only when the item is installed alone.
 *
 * Both passes install what the items import (`lucide` today): the apps start without a
 * `package.json`, and `add` writes one and runs the app's package manager. A missing
 * `dependencies` entry therefore fails `nsh check` here, the way it would in a user's app.
 *
 * Before either, a fresh build of `registry.json` is compared with the committed `public/r`: the
 * artifact an app installs from must be the one the sources make today. The build is the one
 * `bun run registry:build` makes (`scripts/registry-build.ts`), not a copy of its steps.
 *
 * The set of items is the catalog's (`scripts/catalog.ts`); the built `index.json` says where each
 * lands, and the two must name the same `registry:ui` items. A sample naming no catalog component
 * fails the run instead of dropping out of the page it renders.
 *
 *   bun run test:install [--filter <name>] [--jobs <n>] [--keep]
 *
 * The apps are temporary and removed at the end, failure or not (`--keep` leaves them for a
 * look). `NSH_BIN` picks the `nsh` to use, else the one on PATH.
 */
import { rmSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { startRegistryServer, type RegistryServer } from "../packages/cli/src/commands/serve";
import type { RegistryIndexItem } from "../packages/cli/src/types";
import {
  isNotFound,
  isRecord,
  parseRegistryItem,
  RegistryShapeError,
} from "../packages/cli/src/utils/registry-schema";
import { components } from "./catalog";
import { StepFailure } from "./failure";
import { buildRegistry } from "./registry-build";

const repo = path.resolve(import.meta.dir, "..");
const cli = path.join(repo, "packages/cli/src/index.ts");
/** The built registry: what the docs site serves and `add` reads by default. */
const published = path.join(repo, "public/r");

const HELP = `The registry as an app receives it: install every item into a fresh NSH app, and type check it.

  bun run test:install [options]

  --filter <name>  only the registry:ui items whose name contains this (skips the all-at-once pass)
  --jobs <n>       how many items to install at a time (default: 8)
  --keep           keep the temporary apps (they are removed even when the run fails)
  -h, --help       this
`;

type Options = { filter?: string; jobs: number; keep: boolean; help: boolean };

type Run = { code: number; output: string };

type Item = {
  name: string;
  /** Where the item's own file lands in the app, relative to it. */
  target: string;
};

type Failure = { step: string; detail: string };

type Result<T> = { value: T; error: Failure | null; ms: number };

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    jobs: Math.max(2, Math.min(8, os.cpus().length)),
    keep: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--keep") opts.keep = true;
    else if (arg === "-h" || arg === "--help") opts.help = true;
    else if (arg === "--filter" || arg === "--jobs") {
      const value = argv[++i];
      if (value == null) throw new Error(`${arg} needs a value\n\n${HELP}`);
      if (arg === "--filter") {
        if (value.trim() === "") throw new Error(`--filter needs a name\n\n${HELP}`);
        opts.filter = value;
      } else {
        opts.jobs = Number(value);
        if (!Number.isInteger(opts.jobs) || opts.jobs < 1) {
          throw new Error(`--jobs takes a positive whole number, not "${value}"`);
        }
      }
    } else throw new Error(`unknown argument: ${arg}\n\n${HELP}`);
  }
  return opts;
}

/** Run a command with no terminal, collecting everything it prints. */
async function run(command: string, args: string[], cwd: string): Promise<Run> {
  let child;
  try {
    child = Bun.spawn({
      cmd: [command, ...args],
      cwd,
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
      env: process.env,
    });
  } catch (error) {
    return { code: 127, output: error instanceof Error ? error.message : String(error) };
  }
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { code, output: `${stdout}${stderr}` };
}

/**
 * The few lines that say why a command failed: its own errors, or the tail of what it printed
 * when it named none (`nsh check`'s summary line is the failure, not the reason).
 */
function reason(output: string, limit = 4): string {
  const lines = output
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "")
    .filter((line) => !line.startsWith("error type"));
  const errors = lines.filter((line) => /\berror\b/i.test(line));
  return (errors.length > 0 ? errors : lines.slice(-limit))
    .slice(0, limit)
    .map((line) => `      ${line}`)
    .join("\n");
}

/** A step of the run: `run` it, and turn a non-zero exit into a failure that names the step. */
async function step(label: string, command: string, args: string[], cwd: string): Promise<void> {
  const result = await run(command, args, cwd);
  if (result.code !== 0) throw new StepFailure(label, reason(result.output));
}

function failureOf(thrown: unknown): Failure {
  const detail = thrown instanceof Error ? thrown.message : String(thrown);
  return { step: thrown instanceof StepFailure ? thrown.step : "run", detail };
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

/** An item's file as an import path from the app's root, without the extension. */
function moduleOf(item: Item) {
  const target = item.target || `components/ui/${item.name}.tsx`;
  return target.replace(/\.(tsx?|jsx?)$/, "");
}

/** The `nsh` to drive: `NSH_BIN`, the one on PATH, or the installer's two usual homes. */
async function findNsh(): Promise<{ command: string; version: string } | null> {
  const candidates = [
    process.env.NSH_BIN,
    "nsh",
    path.join(os.homedir(), ".local/bin/nsh"),
    path.join(os.homedir(), ".nsh/bin/nsh"),
  ].filter((candidate): candidate is string => candidate != null && candidate !== "");
  for (const command of candidates) {
    const result = await run(command, ["--version"], repo);
    if (result.code === 0) return { command, version: result.output.trim() };
  }
  return null;
}

/** The registry's `registry:ui` items, as the CLI's catalog lists them, read from the index. */
async function uiItems(url: string): Promise<Item[]> {
  const res = await fetch(`${url}/index.json`);
  if (!res.ok) {
    throw new StepFailure(
      "registry index",
      `could not read ${url}/index.json: ${res.status} ${res.statusText}`,
    );
  }
  let index: unknown;
  try {
    index = await res.json();
  } catch (error) {
    throw new StepFailure("registry index", `${url}/index.json is not JSON`, { cause: error });
  }
  if (!isRecord(index) || !Array.isArray(index.items)) {
    throw new StepFailure("registry index", `${url}/index.json has no items array`);
  }
  return index.items
    .map((item, at) => ({ item, where: `${url}/index.json items[${at}]` }))
    .filter(({ item }) => isRecord(item) && item.type === "registry:ui")
    .map(({ item, where }) => itemAt(item, where))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** One index entry: the name `add` takes and the file the item lands at, checked from JSON. */
function itemAt(value: unknown, where: string): Item {
  let item: RegistryIndexItem;
  try {
    item = parseRegistryItem(value, where);
  } catch (error) {
    if (error instanceof RegistryShapeError) {
      throw new StepFailure("registry index", error.message, { cause: error });
    }
    throw error;
  }
  const own = item.files.find((file) => file.type === "registry:ui");
  return { name: item.name, target: own?.target ?? "" };
}

/**
 * Compare the committed `public/r` with a fresh build of `registry.json`: an item that is out of
 * date, one the build adds, or one the registry no longer lists. `vp fmt` writes both sides the
 * same way, so a matching registry is byte-equal.
 */
async function registryDrift(fresh: string): Promise<string[]> {
  const [built, committed] = await Promise.all([list(fresh), list(published)]);
  const outOfDate: string[] = [];
  for (const name of built) {
    if (committed.includes(name) && !(await same(fresh, published, name))) outOfDate.push(name);
  }
  const extra = committed.filter((name) => !built.includes(name));
  const missing = built.filter((name) => !committed.includes(name));
  const problems: string[] = [];
  if (outOfDate.length > 0) problems.push(`out of date: ${outOfDate.join(", ")}`);
  if (extra.length > 0) problems.push(`not in registry.json: ${extra.join(", ")}`);
  if (missing.length > 0) problems.push(`missing from public/r: ${missing.join(", ")}`);
  return problems;
}

async function list(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
  return entries.filter((name) => name.endsWith(".json")).sort();
}

async function same(a: string, b: string, name: string): Promise<boolean> {
  const [left, right] = await Promise.all([
    fs.readFile(path.join(a, name), "utf8"),
    fs.readFile(path.join(b, name), "utf8"),
  ]);
  return left === right;
}

/**
 * The components the generated page renders, with the props each needs. An item not listed is
 * only imported: enough to prove its module loads, without pinning every item's props here.
 */
const SAMPLES: { item: string; import: string; jsx: string }[] = [
  {
    item: "avatar",
    import: 'import { Avatar } from "./components/ui/avatar";',
    jsx: '<Avatar name="Ada Lovelace" />',
  },
  {
    item: "badge",
    import: 'import { Badge } from "./components/ui/badge";',
    jsx: "<Badge>Badge</Badge>",
  },
  {
    item: "button",
    import: 'import { Button } from "./components/ui/button";',
    jsx: '<Button variant="default">Primary</Button>',
  },
  {
    item: "checkbox",
    import: 'import { Checkbox } from "./components/ui/checkbox";',
    jsx: "<Checkbox checked={false} />",
  },
  {
    item: "input",
    import: 'import { Input } from "./components/ui/input";',
    jsx: '<Input value="" />',
  },
  {
    item: "progress",
    import: 'import { Progress } from "./components/ui/progress";',
    jsx: "<Progress value={0.5} />",
  },
  {
    item: "spinner",
    import: 'import { Spinner } from "./components/ui/spinner";',
    jsx: '<Spinner size={16} tint="#000000" />',
  },
  {
    item: "switch",
    import: 'import { Switch } from "./components/ui/switch";',
    jsx: "<Switch checked={false} />",
  },
  {
    item: "toggle",
    import: 'import { Toggle } from "./components/ui/toggle";',
    jsx: "<Toggle>Toggle</Toggle>",
  },
];

/** A page that imports every installed item, at the path the registry gives it. */
function allPage(items: Item[]): string {
  const sampled = new Map(SAMPLES.map((sample) => [sample.item, sample]));
  const imports = items
    .map((item) => sampled.get(item.name)?.import ?? `import "./${moduleOf(item)}";`)
    .sort();
  const rendered = items
    .filter((item) => sampled.has(item.name))
    .map((item) => `      ${sampled.get(item.name)!.jsx}`);
  return `// Written by scripts/install-test.ts; this app is temporary.
import { mount, Text, View } from "nsh";

${imports.join("\n")}

// From the top: the page is taller than the screen, and \`texts()\` reports only what is on it.
function All() {
  return (
    <View class="items-center gap-4">
      <Text>all items mounted</Text>
${rendered.join("\n")}
    </View>
  );
}

mount(All);
`;
}

const ALL_TEST = `// Written by scripts/install-test.ts; this app is temporary.
import { expect, open, test } from "nsh/test";

test("every item loads and the page mounts", async () => {
  const app = await open("./All.tsx");
  expect(app.texts()).toContain("all items mounted");
});
`;

/**
 * The packages the app's `package.json` lists: `add` wrote the file itself (an NSH app starts
 * without one) and installed what the items import (`lucide` today) through the app's manager.
 */
async function assertPackages(dir: string, packages: string[]) {
  const file = path.join(dir, "package.json");
  const manifest = await fs
    .readFile(file, "utf8")
    .then((text) => JSON.parse(text) as { dependencies?: Record<string, string> })
    .catch(() => null);
  if (manifest == null) {
    throw new StepFailure("add", `      add left no package.json, so no ${packages.join(", ")}`);
  }
  const listed = Object.keys(manifest.dependencies ?? {});
  for (const name of packages) {
    if (!listed.includes(name)) {
      throw new StepFailure(
        "add",
        `      add installed no ${name} (package.json lists ${listed.join(", ") || "nothing"})`,
      );
    }
  }
}

/** An NSH app with `nsh-ui.json` and the theme in it: what `init` leaves behind. */
async function scaffold(template: string, registry: string, nsh: string) {
  await fs.mkdir(template, { recursive: true });
  await step("nsh init", nsh, ["init", template, "--template", "ts"], path.dirname(template));
  await step("shadcn-nsh init", "bun", [cli, "init", "--registry", registry], template);
}

/** Copy the scaffolded app to `dir`: each run starts from the state `init` left. */
async function copyApp(template: string, dir: string) {
  await fs.cp(template, dir, { recursive: true });
}

async function installEveryItem(template: string, dir: string, items: Item[], nsh: string) {
  await copyApp(template, dir);
  await step("add --all", "bun", [cli, "add", "--all"], dir);
  await fs.writeFile(path.join(dir, "All.tsx"), allPage(items));
  await fs.writeFile(path.join(dir, "All.test.tsx"), ALL_TEST);
  await step("nsh check", nsh, ["check", "."], dir);
  await step("nsh test", nsh, ["test", "."], dir);
  // The items import `lucide`, which is what the app's own package manager had to install.
  await assertPackages(dir, ["lucide"]);
}

async function installOneItem(template: string, dir: string, item: Item, nsh: string) {
  await copyApp(template, dir);
  // `nsh check` below fails when the item imports a package `add` did not install (`lucide`).
  await step("add", "bun", [cli, "add", item.name], dir);
  // `nsh check` only notices a file that did not land when something imports it: assert it is there.
  if (item.target) {
    try {
      await fs.access(path.join(dir, item.target));
    } catch {
      throw new StepFailure("add", `      add wrote no ${item.target}`);
    }
  }
  await step("nsh check", nsh, ["check", "."], dir);
}

/** Run `work` over `values`, `size` at a time, handing each result over as it finishes. */
async function pool<T>(
  values: T[],
  size: number,
  work: (value: T) => Promise<void>,
  done: (result: Result<T>) => void,
): Promise<Result<T>[]> {
  const results: Result<T>[] = [];
  let next = 0;
  const worker = async () => {
    for (;;) {
      const value = values[next++];
      if (value == null) return;
      const started = performance.now();
      let error: Failure | null = null;
      try {
        await work(value);
      } catch (thrown) {
        error = failureOf(thrown);
      }
      const result: Result<T> = { value, error, ms: performance.now() - started };
      results.push(result);
      done(result);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, values.length) }, worker));
  return results;
}

/** A fresh build of `registry.json`, in `dir`, written the way `registry:build` writes it. */
async function buildFresh(dir: string) {
  try {
    await buildRegistry(dir);
  } catch (error) {
    if (error instanceof StepFailure) throw error;
    throw new StepFailure(
      "registry build",
      error instanceof Error ? error.message : String(error),
      { cause: error },
    );
  }
}

/** The catalog's component ids: the only source of the set the test installs one at a time. */
function catalogIds(): string[] {
  return components(repo)
    .map((component) => component.id)
    .sort();
}

async function main(): Promise<number> {
  let opts: Options;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`install test: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }
  if (opts.help) {
    console.log(HELP);
    return 0;
  }

  // The samples render a component each; one that names no catalog component would silently drop
  // out of the all-at-once page, so it fails instead.
  const ids = catalogIds();
  const unknown = SAMPLES.filter((sample) => !ids.includes(sample.item));
  if (unknown.length > 0) {
    console.error(
      `install test: SAMPLES names no catalog component: ${unknown.map((s) => s.item).join(", ")}`,
    );
    console.error("      add the item to registry.json, or drop the sample");
    return 1;
  }

  const started = performance.now();
  const installed = await findNsh();
  if (!installed) {
    console.error("install test: no nsh to run");
    console.error(
      "      install it with `curl -fsSL https://nsh.dev/install.sh | sh` (docs/toolchain.md)",
    );
    return 1;
  }
  const nsh = installed.command;
  console.log(`install test: ${installed.version}`);

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "shadcn-nsh-install-"));
  let server: RegistryServer | null = null;
  const clean = () => {
    server?.close().catch((error: unknown) => {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`install test: could not stop the registry server: ${detail}`);
    });
    if (!opts.keep) rmSync(tmp, { recursive: true, force: true });
  };
  const onSignal = () => {
    clean();
    process.exit(130);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  try {
    const fresh = path.join(tmp, "registry");
    await buildFresh(fresh);
    const drift = await registryDrift(fresh);
    if (drift.length > 0) {
      console.error("install test: public/r is not what registry.json builds today");
      console.error("      run `bun run registry:build` and commit public/r");
      for (const problem of drift) console.error(`      ${problem}`);
      return 1;
    }
    const files = await list(fresh);
    console.log(`install test: public/r matches a fresh build (${files.length - 1} items)`);

    server = await startRegistryServer({ dir: fresh });
    const registry = `${server.url}/{name}.json`;
    console.log(`install test: serving it at ${server.url}`);

    const indexed = await uiItems(server.url);
    // The set is the catalog's; the index is the seam an app reads. Disagreement is a failure:
    // the catalog drives every other script, and an item only one of them knows installs alone.
    const built = new Set(indexed.map((item) => item.name));
    const catalog = new Set(ids);
    const absent = ids.filter((id) => !built.has(id));
    const extra = [...built].filter((name) => !catalog.has(name)).sort();
    if (absent.length > 0 || extra.length > 0) {
      console.error("install test: registry.json and the built index.json disagree");
      if (absent.length > 0) {
        console.error(`      in registry.json but not in index.json: ${absent.join(", ")}`);
      }
      if (extra.length > 0) {
        console.error(`      in index.json but not in registry.json: ${extra.join(", ")}`);
      }
      return 1;
    }
    const targets = new Map(indexed.map((item) => [item.name, item.target]));
    const all = ids.map((name) => ({ name, target: targets.get(name) ?? "" }));
    const items = opts.filter ? all.filter((item) => item.name.includes(opts.filter!)) : all;
    if (items.length === 0) {
      console.error(`install test: no registry:ui item matches "${opts.filter ?? ""}"`);
      return 1;
    }
    console.log(`install test: temporary apps in ${tmp}\n`);

    const template = path.join(tmp, "template");
    const scaffoldStart = performance.now();
    try {
      await scaffold(template, registry, nsh);
    } catch (thrown) {
      const failure = failureOf(thrown);
      console.error(`  ✗ ${failure.step} ${seconds(performance.now() - scaffoldStart)}`);
      console.error(failure.detail);
      return 1;
    }
    console.log(`  ✓ init, one template app ${seconds(performance.now() - scaffoldStart)}\n`);

    if (opts.filter == null) {
      console.log("all items in one app");
      const startedAll = performance.now();
      try {
        await installEveryItem(template, path.join(tmp, "all"), all, nsh);
      } catch (thrown) {
        const failure = failureOf(thrown);
        console.error(`  ✗ ${failure.step} ${seconds(performance.now() - startedAll)}`);
        console.error(failure.detail);
        console.error("\ninstall test: an app with every item in it does not type check or run");
        return 1;
      }
      const label = `add --all (${all.length} items), nsh check, nsh test`;
      console.log(`  ✓ ${label} ${seconds(performance.now() - startedAll)}\n`);
    }

    const each = `each item in its own app (${items.length} item${items.length === 1 ? "" : "s"}`;
    console.log(`${each}, ${opts.jobs} at a time)`);
    const width = Math.max(...items.map((item) => item.name.length));
    const eachStart = performance.now();
    const results = await pool(
      items,
      opts.jobs,
      (item) => installOneItem(template, path.join(tmp, "each", item.name), item, nsh),
      (result) => {
        const name = result.value.name.padEnd(width);
        if (result.error) {
          console.error(`  ✗ ${name} ${result.error.step} ${seconds(result.ms)}`);
          console.error(result.error.detail);
        } else {
          console.log(`  ✓ ${name} ${seconds(result.ms)}`);
        }
      },
    );

    const failed = results.filter((result) => result.error);
    if (failed.length > 0) {
      console.error(
        `\ninstall test: ${failed.length} of ${items.length} items failed — ` +
          failed.map((result) => result.value.name).join(", "),
      );
      return 1;
    }

    const runs = opts.filter == null ? ", one app with all of them runs" : "";
    console.log(
      `\ninstall test: ${items.length} of ${items.length} items install and type check${runs} ` +
        `(${seconds(performance.now() - eachStart)} for the items, ` +
        `${seconds(performance.now() - started)} in all)`,
    );
    return 0;
  } catch (thrown) {
    const failure = failureOf(thrown);
    console.error(`install test: ${failure.step} failed`);
    console.error(failure.detail);
    return 1;
  } finally {
    clean();
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    if (opts.keep) console.log(`install test: kept ${tmp}`);
  }
}

process.exit(await main());
