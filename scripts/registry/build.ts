/**
 * `bun run registry:build`, defined once: write `public/r` from `registry.json` (and check each
 * item's imports match its registry dependencies), then format it. `bun run test:install` calls
 * the same function to build a fresh copy in a temporary directory, so the committed artifact
 * and what the test compares it with cannot be built two ways.
 *
 * A copied file is the file itself, headers and credit line included: an app that reads a
 * copied file reads the same text as this repository.
 *
 *   bun run registry:build
 *   bun run registry:build --check   # fail when the committed `public/r` is not what a build writes
 */
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runBuild } from "../../packages/cli/src/commands/build";

const repo = path.resolve(import.meta.dir, "../..");

/**
 * A failure that names the step it happened in, for the scripts that run several commands
 * (`bun run test:install` prints the step, then the reason).
 */
export class StepFailure extends Error {
  /** The step's label, as the caller names it (`"registry build"`). */
  readonly step: string;

  constructor(step: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "StepFailure";
    this.step = step;
  }
}

/** Build `registry.json` into `output` (created if missing) and format it with `vp fmt`. */
export async function buildRegistry(output: string): Promise<void> {
  const code = await runBuild("./registry.json", { cwd: repo, output });
  if (code !== 0) throw new StepFailure("registry build", `building ${output} exited ${code}`);
  const format = spawnSync("vp", ["fmt", output], { cwd: repo, stdio: "inherit" });
  if (format.error) {
    throw new StepFailure("registry format", format.error.message, { cause: format.error });
  }
  if (format.status !== 0) {
    throw new StepFailure("registry format", `\`vp fmt ${output}\` exited ${format.status}`);
  }
}

/** The files of `dir` and their contents, by name. */
async function contents(dir: string): Promise<Map<string, string>> {
  const names = (await readdir(dir)).sort();
  return new Map(
    await Promise.all(
      names.map(async (name) => [name, await readFile(path.join(dir, name), "utf8")] as const),
    ),
  );
}

/**
 * Build into a temporary directory and name every file of `public/r` that differs from it, is
 * missing, or is left over: a component edited after the last build ships its old source to apps.
 */
async function checkRegistry(): Promise<string[]> {
  const fresh = await mkdtemp(path.join(tmpdir(), "registry-check-"));
  try {
    await buildRegistry(fresh);
    const [built, committed] = await Promise.all([
      contents(fresh),
      contents(path.join(repo, "public/r")),
    ]);
    const names = [...new Set([...built.keys(), ...committed.keys()])].sort();
    return names.flatMap((name) => {
      if (!committed.has(name)) return [`public/r/${name} is missing`];
      if (!built.has(name)) return [`public/r/${name} is not built from registry.json`];
      return built.get(name) === committed.get(name) ? [] : [`public/r/${name} is stale`];
    });
  } finally {
    await rm(fresh, { recursive: true, force: true });
  }
}

if (import.meta.main) {
  try {
    if (process.argv.includes("--check")) {
      const problems = await checkRegistry();
      if (problems.length > 0) {
        console.error(problems.map((p) => `registry:build: ${p}`).join("\n"));
        console.error("registry:build: run `bun run registry:build` and commit public/r");
        process.exit(1);
      }
      console.log("registry ok — public/r is what registry.json builds");
    } else {
      await buildRegistry(path.join(repo, "public/r"));
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`registry:build: ${detail}`);
    process.exit(1);
  }
}
