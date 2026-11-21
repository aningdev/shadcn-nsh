/**
 * Package each catalog demo (`apps/website/demos/<id>.tsx`, from `scripts/catalog.ts`), the site's
 * own page demos (`PAGE_DEMOS`: the themes page's showcase) and the showcase app
 * (`apps/showcase/App.tsx`, framed on the home page) with `nsh package --target web` into
 * apps/website/public/<name>/ (flattened index.html).
 *
 * The catalog's `--check` already guarantees every component has its demo, that the page demos
 * exist and that no other demo is orphaned; this script only packages the set, sorted by name so
 * the log is stable. The shared steps (the runtime first, the pool, the flattening) live in
 * `package-web.ts`.
 *
 * Each packaged page then gets the panel's `?idiom=` and `?theme=` (`player-options.ts`).
 *
 *   bun apps/website/scripts/build-demos.ts [--only <id>,<id>]   # one or a few, while iterating;
 *                                                                # `--only showcase` the app alone
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { catalog, PAGE_DEMOS } from "../../../scripts/catalog";
import {
  ensureWebRuntime,
  PACKAGE_CONCURRENCY,
  packageOne,
  runPool,
  type WebPackage,
} from "./package-web";
import { addPlayerOptions } from "./player-options";

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(docsRoot, "../..");

const cat = catalog();
const args = process.argv.slice(2);
const onlyAt = args.indexOf("--only");
/** `--only <id>,<id>`: just those demos (the whole set otherwise). */
const onlyArg = onlyAt >= 0 ? args[onlyAt + 1] : undefined;
const only = onlyArg
  ? new Set(
      onlyArg
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
  : undefined;

/** The apps this script packages: the component demos, the page demos, and the showcase app. */
const apps: WebPackage[] = [
  ...cat.components.map((component) => component.demo),
  ...PAGE_DEMOS.map((id) => path.join(cat.paths.demos, `${id}.tsx`)),
].map((entry) => ({
  name: path.basename(entry, ".tsx"),
  entry,
  cwd: cat.paths.demos,
  outDir: path.join(docsRoot, "public", "demos", path.basename(entry, ".tsx")),
  after: addPlayerOptions,
}));

// The showcase app is an app of its own (`nsh.json`, `theme.ts`, `tests/`), not a demo file: its
// entry resolves from its own directory. Its package goes to `public/showcase/`, which the home
// page frames (`ShowcaseFrame`).
apps.push({
  name: "showcase",
  entry: "App.tsx",
  cwd: path.join(repoRoot, "apps/showcase"),
  outDir: path.join(docsRoot, "public", "showcase"),
  after: addPlayerOptions,
});

const entries = apps
  .filter((app) => !only || only.has(app.name))
  .sort((a, b) => a.name.localeCompare(b.name));

if (entries.length === 0) {
  console.error("The catalog has no component demos");
  process.exit(1);
}

ensureWebRuntime();

const started = Date.now();
const failed = await runPool(entries, PACKAGE_CONCURRENCY, packageOne);
const elapsedSec = ((Date.now() - started) / 1000).toFixed(1);

if (failed) {
  console.error(
    `\n${failed} app(s) failed in ${elapsedSec}s. Is \`nsh\` installed and web target available?`,
  );
  process.exit(1);
}

console.log(`\n${entries.length} apps packaged under apps/website/public/ in ${elapsedSec}s`);
