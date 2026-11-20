/**
 * The steps every `nsh package --target web` in this repo shares: the web runtime added first, one
 * package at a time (its output flattened), a pool that runs several at once. `build-demos.ts`
 * packages the docs demos and the showcase app (`apps/showcase`) through this module, so the
 * concurrency and the flattening live in one place.
 *
 *   bun apps/website/scripts/build-demos.ts [--only <id>,<id>]   # the whole set, or a few of it
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * How many `nsh package` run at once: one per core (most of a package is compressing the runtime),
 * at most 8; `DEMO_JOBS` overrides it. Packages made side by side are byte for byte the ones made
 * one at a time (checked on nsh 0.5.1), so the old one-at-a-time limit is gone.
 */
export const PACKAGE_CONCURRENCY =
  Number(process.env.DEMO_JOBS) || Math.min(os.availableParallelism(), 8);

/**
 * The web runtime, once before the first package: `nsh package --target web` adds it itself when
 * it is missing, and several packages starting together on a fresh machine (CI) each add it and
 * remove one another's half-written directory ("remove ~/.nsh/runtime/web: Directory not empty").
 */
export function ensureWebRuntime(): void {
  const runtime = spawnSync("nsh", ["component", "add", "web"], { stdio: "inherit" });
  if (runtime.status !== 0) {
    console.error("nsh component add web failed. Is `nsh` installed?");
    process.exit(1);
  }
}

/**
 * `nsh package` writes `outDir/<the app's name>/index.html`; the site serves each app from its own
 * directory, so the one level of nesting is moved up and removed.
 */
export function flattenPackageDir(outDir: string) {
  const kids = fs.readdirSync(outDir, { withFileTypes: true });
  if (fs.existsSync(path.join(outDir, "index.html"))) return;
  const nested = kids.find((k) => k.isDirectory());
  if (!nested) {
    throw new Error(`No index.html under ${outDir}`);
  }
  const nestedDir = path.join(outDir, nested.name);
  for (const file of fs.readdirSync(nestedDir)) {
    fs.renameSync(path.join(nestedDir, file), path.join(outDir, file));
  }
  fs.rmSync(nestedDir, { recursive: true, force: true });
}

/** One app to package: its entry and the directory the CLI resolves it from, its output
 * directory, and what runs on the flattened package afterwards (the panel's player options). */
export interface WebPackage {
  /** The package's name: its output directory, and what `--only` names it by. */
  name: string;
  /** The app's entry file, as `nsh package` takes it (relative to `cwd`). */
  entry: string;
  /** Where the CLI resolves the entry and the app's `nsh.json` from. */
  cwd: string;
  /** The output directory, under `apps/website/public/`. */
  outDir: string;
  /** Runs on the flattened package (the panel's `?idiom=` and `?theme=`, `player-options.ts`). */
  after?: (outDir: string, name: string) => void;
}

/** Packages one app (`nsh package --target web`), flattens its output and runs `after`. */
export function packageOne(app: WebPackage): Promise<void> {
  fs.rmSync(app.outDir, { recursive: true, force: true });
  fs.mkdirSync(app.outDir, { recursive: true });
  console.log(`nsh package ${app.name} → ${path.relative(process.cwd(), app.outDir)}`);
  return new Promise((resolve, reject) => {
    const child = spawn(
      "nsh",
      ["package", app.entry, "--target", "web", "--out", app.outDir, "--name", app.name],
      { stdio: "inherit", cwd: app.cwd },
    );
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`nsh package failed: ${app.name} (exit ${code})`));
        return;
      }
      try {
        flattenPackageDir(app.outDir);
        app.after?.(app.outDir, app.name);
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  });
}

/** Runs `work` over `items`, `limit` at a time, and answers how many failed (each failure logged). */
export async function runPool<T>(items: T[], limit: number, work: (item: T) => Promise<void>) {
  let next = 0;
  let failed = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      if (item === undefined) break;
      try {
        await work(item);
      } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        failed += 1;
      }
    }
  });
  await Promise.all(workers);
  return failed;
}
