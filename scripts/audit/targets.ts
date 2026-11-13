/**
 * What the demo audit photographs: every catalog component's page, its reference page and the
 * official NSH website example it ports (`references/nsh/website/demos/el-<name>.tsx`), packaged
 * as a web app so a browser can show them at the docs player's two sizes.
 *
 * The packages go under a work directory (`/tmp/nsh-audit` by default), never into the repo:
 * `nsh package` writes 5–10 MB each, and they are a build product of this script.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { addPlayerOptions } from "../../apps/docs/scripts/player-options";
import { repo } from "../port/lib";

/** The official website example whose scene a component's demo should follow, by catalog id. */
export const OFFICIAL: Record<string, string> = {
  accordion: "accordion",
  "alert-dialog": "alert-dialog",
  avatar: "avatar",
  button: "button",
  carousel: "carousel",
  checkbox: "checkbox",
  collapsible: "collapsible",
  "color-picker": "color-picker",
  combobox: "combobox",
  command: "command",
  "data-table": "data-table",
  "date-picker": "date-picker",
  dialog: "dialog",
  "diff-view": "diff-view",
  "dock-area": "dock",
  editor: "editor",
  "emoji-picker": "emoji-picker",
  "hover-card": "hover-card",
  input: "input",
  link: "link",
  menu: "menu",
  "number-input": "number-input",
  "otp-input": "otp-input",
  pagination: "pagination",
  plot: "plot",
  popover: "popover",
  progress: "progress",
  "radio-group": "radio",
  resizable: "resizable",
  scrollbar: "scrollbar",
  select: "select",
  sheet: "sheet",
  slider: "slider",
  switch: "switch",
  table: "table",
  tabs: "tabs",
  toast: "toast",
  toggle: "toggle",
  toolbar: "toolbar",
  tooltip: "tooltip",
  tree: "tree",
  // The website's own `demos/text-view.tsx` (no `el-` prefix), and `el-text-selection` with it.
  "text-view": "../text-view",
};

/** Official examples that are not one file per component: several plot kinds, two editors. */
export const OFFICIAL_EXTRA: Record<string, string[]> = {
  plot: ["plot-cells", "plot-dots", "plot-dual", "plot-pie", "plot-ranges", "plot-treemap"],
  editor: ["rich-editor"],
  "text-view": ["text-selection"],
};

export type Kind = "demo" | "ref" | "official";

export type Target = {
  /** Catalog id (the demo's and the reference page's name). */
  id: string;
  kind: Kind;
  /** The official example's name, for `kind: "official"`. */
  official?: string;
  /** The one official example the mapping names (its shot has no extra suffix). */
  primary?: boolean;
  /** The entry file, absolute. */
  entry: string;
  /** The directory `nsh package` runs in (its `nsh.json` gives the theme and aliases). */
  cwd: string;
  /** The package directory's name, unique across targets. */
  slug: string;
};

export const demosDir = path.join(repo, "apps", "docs", "demos");
export const officialDir = path.join(repo, "references", "nsh", "website", "demos");
/**
 * The audit's own screenshots, beside the render check's `shots/` rather than inside it: the
 * render check empties its directory on every run, and the audit's pictures outlive it.
 */
export const shotsDir = path.join(demosDir, "shots-audit");

/** Every target of `id`: its demo, its reference page and the official example, when there is one. */
export function targetsFor(id: string): Target[] {
  const targets: Target[] = [
    {
      id,
      kind: "demo",
      entry: path.join(demosDir, `${id}.tsx`),
      cwd: demosDir,
      slug: `demo-${id}`,
    },
    {
      id,
      kind: "ref",
      entry: path.join(demosDir, `${id}.ref.tsx`),
      cwd: demosDir,
      slug: `ref-${id}`,
    },
  ];
  const official = OFFICIAL[id];
  if (official) {
    const name = official.startsWith("../") ? official.slice(3) : `el-${official}`;
    targets.push({
      id,
      kind: "official",
      official: name,
      primary: true,
      entry: path.join(officialDir, `${name}.tsx`),
      cwd: officialDir,
      slug: `official-${name}`,
    });
  }
  for (const extra of OFFICIAL_EXTRA[id] ?? []) {
    const name = `el-${extra}`;
    targets.push({
      id,
      kind: "official",
      official: name,
      entry: path.join(officialDir, `${name}.tsx`),
      cwd: officialDir,
      slug: `official-${name}`,
    });
  }
  return targets;
}

/** The screenshot's name: `<id>-<kind>-<layout>[-<official>].png`. */
export function shotName(target: Target, layout: "phone" | "desktop"): string {
  const suffix =
    target.official && !target.primary ? `-${target.official.replace(/^el-/, "")}` : "";
  return `${target.id}-${target.kind}-${layout}${suffix}.png`;
}

const idOf = (slug: string) => `dev.audit.nsh.${slug.replace(/[^a-z0-9]/gi, "")}`;

/**
 * Packages `target` into `work` and returns the directory that holds its `index.html`, flattening
 * the package's nested folder. A packaged page can already be there (`force: false`).
 *
 * The page gets the docs panel's `?idiom=` and `?theme=` from the same function that prepares the
 * docs' own packages (`apps/docs/scripts/player-options.ts`), so a probe shows the idiom and
 * appearance the panel gives a demo — and the two cannot drift apart.
 */
export function packageTarget(target: Target, work: string, force = false): string {
  const home = path.join(work, "packages", target.slug);
  const index = path.join(home, "index.html");
  if (!force && fs.existsSync(index)) return home;
  fs.rmSync(home, { recursive: true, force: true });
  fs.mkdirSync(home, { recursive: true });
  const result = spawnSync(
    "nsh",
    [
      "package",
      path.relative(target.cwd, target.entry),
      "--target",
      "web",
      "--out",
      home,
      "--name",
      target.slug,
      "--id",
      idOf(target.slug),
      "--app-version",
      "0.0.0",
      "--build",
      "1",
    ],
    { cwd: target.cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`nsh package ${target.slug}: ${result.stderr || result.stdout}`);
  }
  // `nsh package` writes `<out>/<name>/`; the server maps `/` to `index.html` of a directory.
  const nested = path.join(home, target.slug);
  if (!fs.existsSync(index) && fs.existsSync(nested)) {
    for (const file of fs.readdirSync(nested)) {
      fs.renameSync(path.join(nested, file), path.join(home, file));
    }
    fs.rmSync(nested, { recursive: true, force: true });
  }
  if (!fs.existsSync(index))
    throw new Error(`nsh package ${target.slug}: no index.html under ${home}`);
  addPlayerOptions(home, target.slug);
  return home;
}
