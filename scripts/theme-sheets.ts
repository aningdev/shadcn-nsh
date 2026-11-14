/**
 * The shadcn theme experiment's comparison sheets, from what `theme-preview.ts` photographed.
 *
 *   bun scripts/theme-sheets.ts [id,id]        # default: the 16 components the spec lists
 *
 * One page per component (`theme/sheet-<id>.png`), two columns — the default theme | the shadcn
 * one — and four rows: light phone, light desktop, dark phone, dark desktop. Plus one overview
 * (`theme/sheet-overview.png`): every component's light desktop demo, a row each.
 *
 * Reads `apps/docs/demos/shots-audit/theme/<id>-<name>-<kind>-<layout>-<appearance>.png` and calls
 * `scripts/audit/sheet.ts` with them; not part of the check pipeline.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { shotsDir } from "./audit/targets";
import { repo } from "./port/lib";

/** The components `docs/specs/theme-shadcn.md` compares, and the kind (or of them) a row shows. */
const LIST = [
  "button",
  "toggle",
  "switch",
  "checkbox",
  "radio-group",
  "slider",
  "input",
  "select",
  "tabs",
  "segmented",
  "dialog",
  "menu",
  "accordion",
  "data-table",
  "date-picker",
  "toast",
];

const theme = path.join(shotsDir, "theme");
const ids = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const wanted = ids.length > 0 ? ids.flatMap((arg) => arg.split(",")) : LIST;
const missing = wanted.filter(
  (id) => !fs.existsSync(path.join(theme, `${id}-shadcn-demo-desktop-light.png`)),
);
if (missing.length > 0) {
  console.error(`no shadcn screenshots for ${missing.join(", ")}: run theme-preview.ts first`);
  process.exit(1);
}

const file = (id: string, name: string, kind: string, layout: string, appearance: string) =>
  path.join(theme, `${id}-${name}-${kind}-${layout}-${appearance}.png`);

const sheet = (out: string, title: string, images: string[]) => {
  const result = spawnSync(
    "bun",
    [
      "scripts/audit/sheet.ts",
      "--out",
      out,
      "--cols",
      "2",
      "--title",
      title,
      ...images.map((image) => path.relative(shotsDir, image)),
    ],
    { cwd: repo, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(`sheet.ts ${out}: exit ${result.status}`);
  process.stdout.write(result.stdout);
};

for (const id of wanted) {
  const images: string[] = [];
  for (const appearance of ["light", "dark"]) {
    for (const layout of ["phone", "desktop"]) {
      for (const name of ["default", "shadcn"]) {
        images.push(file(id, name, "demo", layout, appearance));
      }
    }
  }
  const present = images.filter((image) => fs.existsSync(image));
  if (present.length !== images.length) {
    console.warn(`${id}: ${images.length - present.length} of 8 screenshots missing`);
  }
  sheet(path.join(theme, `sheet-${id}.png`), `${id} — default | shadcn`, present);
}

const overview: string[] = [];
for (const id of wanted) {
  for (const name of ["default", "shadcn"])
    overview.push(file(id, name, "demo", "desktop", "light"));
}
sheet(
  path.join(theme, "sheet-overview.png"),
  "shadcn theme experiment — light desktop, default | shadcn",
  overview.filter((image) => fs.existsSync(image)),
);
