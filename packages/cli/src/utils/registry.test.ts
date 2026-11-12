import { afterAll, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { Registry } from "../types";
import { checkRegistryDependencies } from "./registry";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "registry-deps-"));
fs.mkdirSync(path.join(dir, "lib"));
fs.writeFileSync(path.join(dir, "lib/format.ts"), "export const format = 1;\n");
fs.writeFileSync(path.join(dir, "picker.tsx"), 'import { format } from "./lib/format";\n');

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

const picker = {
  name: "picker",
  type: "registry:ui",
  files: [{ path: "picker.tsx", type: "registry:ui" }],
};

describe("checkRegistryDependencies", () => {
  test("reports a relative import that no item ships", async () => {
    const registry: Registry = { name: "t", homepage: "", items: [picker] };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([
      'picker: imports "./lib/format", which no registry item ships',
    ]);
  });

  test("passes once an item ships it and the importer declares it", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [
        {
          name: "format",
          type: "registry:lib",
          files: [{ path: "lib/format.ts", type: "registry:lib" }],
        },
        { ...picker, registryDependencies: ["format"] },
      ],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([]);
  });
});
