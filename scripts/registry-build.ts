/**
 * `bun run registry:build`, defined once: write `public/r` from `registry.json` (and check each
 * item's imports, P6), then format it. `bun run test:install` calls the same function to build a
 * fresh copy in a temporary directory, so the committed artifact and what the test compares it
 * with cannot be built two ways.
 *
 *   bun run registry:build
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import { runBuild } from "../packages/cli/src/commands/build";
import { StepFailure } from "./failure";

const repo = path.resolve(import.meta.dir, "..");

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

if (import.meta.main) {
  try {
    await buildRegistry(path.join(repo, "public/r"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`registry:build: ${detail}`);
    process.exit(1);
  }
}
