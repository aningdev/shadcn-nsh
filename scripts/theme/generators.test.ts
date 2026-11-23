import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { appleDtcgOutput } from "./apple";
import { themeSourceDocs, type ThemeGeneratorOutput } from "./dtcg";
import { m3DtcgOutput } from "./m3";
import { themeFiles as shadcnThemeFiles } from "./shadcn";
import { themeFiles as solidGlassThemeFiles } from "./solid-glass";
import { winuiDtcgOutput } from "./winui";

const root = path.join(import.meta.dir, "../..");
const vp = path.join(root, "node_modules/.bin/vp");

const generators: { id: string; output: () => ThemeGeneratorOutput }[] = [
  { id: "shadcn", output: shadcnThemeFiles },
  { id: "solid-glass", output: solidGlassThemeFiles },
  { id: "apple", output: appleDtcgOutput },
  { id: "material", output: m3DtcgOutput },
  { id: "winui", output: winuiDtcgOutput },
];

/**
 * The generators write `packages/theme/tokens/themes/<id>/` and nothing else: each one, run again,
 * must reproduce the committed DTCG source byte for byte. The files are formatted with `vp fmt`
 * after writing, so the comparison goes through the same formatter rather than `JSON.stringify`.
 */
describe("each generator reproduces its committed DTCG source", () => {
  for (const { id, output } of generators) {
    test(id, () => {
      const dir = path.join("packages/theme/tokens/themes", id);
      const docs = themeSourceDocs(output(), root);
      const written = fs.mkdtempSync(path.join(os.tmpdir(), `nsh-${id}-`));
      try {
        for (const [name, doc] of Object.entries(docs)) {
          if (doc === null) continue;
          fs.writeFileSync(path.join(written, name), `${JSON.stringify(doc, null, 2)}\n`);
        }
        if (fs.existsSync(vp)) execFileSync(vp, ["fmt", written], { cwd: root, stdio: "ignore" });

        const committed = fs
          .readdirSync(path.join(root, dir))
          .filter((name) => name.endsWith(".json"))
          .sort();
        const stated = Object.entries(docs)
          .filter(([, doc]) => doc !== null)
          .map(([name]) => name)
          .sort();
        expect(stated).toEqual(committed);

        for (const name of committed) {
          const doc = docs[name];
          if (doc === null) {
            expect(fs.existsSync(path.join(written, name)), `${id}/${name}`).toBe(false);
            continue;
          }
          expect(fs.readFileSync(path.join(written, name), "utf8"), `${id}/${name}`).toBe(
            fs.readFileSync(path.join(root, dir, name), "utf8"),
          );
        }
      } finally {
        fs.rmSync(written, { recursive: true, force: true });
      }
    });
  }
});
