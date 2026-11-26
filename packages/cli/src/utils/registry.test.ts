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
fs.writeFileSync(path.join(dir, "clock.tsx"), 'import { Clock } from "lucide";\n');
fs.writeFileSync(
  path.join(dir, "label.tsx"),
  'import { Text } from "nsh";\nimport { Button } from "nsh/base";\n',
);

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

// Theme v5 layout: `theme` ships schema.ts, nsh-gallery/index.ts (`base.ts`), preset.ts, and theme.ts;
// `theme-shadcn` ships sparse override under `themes/shadcn/index.ts` importing `../../schema` and `../nsh-gallery`.
fs.mkdirSync(path.join(dir, "theme/themes/nsh-gallery"), { recursive: true });
fs.mkdirSync(path.join(dir, "theme/themes/shadcn"), { recursive: true });
fs.writeFileSync(
  path.join(dir, "theme/schema.ts"),
  "export const defineTheme = (x: unknown) => x;\n",
);
fs.writeFileSync(
  path.join(dir, "theme/themes/nsh-gallery/index.ts"),
  'import { defineTheme } from "../../schema";\nexport const base = defineTheme({});\nexport default base;\n',
);
fs.writeFileSync(
  path.join(dir, "theme/preset.ts"),
  'export { base as presetTheme } from "./themes/nsh-gallery";\n',
);
fs.writeFileSync(path.join(dir, "theme/theme.ts"), "export const colors = {};\n");
fs.writeFileSync(path.join(dir, "theme/themes/shadcn/theme.json"), "{}\n");
fs.writeFileSync(path.join(dir, "theme/themes/shadcn/DESIGN.md"), "# shadcn\n");
fs.writeFileSync(
  path.join(dir, "theme/themes/shadcn/index.ts"),
  'import { defineTheme } from "../../schema";\nimport { base } from "../nsh-gallery";\nexport default defineTheme({ base });\n',
);
fs.writeFileSync(path.join(dir, "themed.tsx"), 'import { colors } from "@shadcn-nsh/theme";\n');

const picker = {
  name: "picker",
  type: "registry:ui",
  files: [{ path: "picker.tsx", type: "registry:ui" }],
};

const libraryTheme = {
  name: "theme",
  type: "registry:theme",
  files: [
    { path: "theme/schema.ts", type: "registry:lib", target: "lib/ui/schema.ts" },
    {
      path: "theme/themes/nsh-gallery/index.ts",
      type: "registry:lib",
      target: "lib/ui/base.ts",
    },
    { path: "theme/preset.ts", type: "registry:lib", target: "lib/ui/preset.ts" },
    { path: "theme/theme.ts", type: "registry:lib", target: "lib/ui/theme.ts" },
  ],
};

const neutralTheme = {
  name: "theme-shadcn",
  type: "registry:theme",
  files: [
    {
      path: "theme/themes/shadcn/theme.json",
      type: "registry:file",
      target: "themes/shadcn/theme.json",
    },
    {
      path: "theme/themes/shadcn/DESIGN.md",
      type: "registry:file",
      target: "themes/shadcn/DESIGN.md",
    },
    {
      path: "theme/themes/shadcn/index.ts",
      type: "registry:lib",
      target: "themes/shadcn.ts",
    },
  ],
  registryDependencies: ["theme"],
};

const themed = {
  name: "themed",
  type: "registry:ui",
  files: [{ path: "themed.tsx", type: "registry:ui" }],
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

  test("reports a package import the item does not install", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [
        { name: "clock", type: "registry:ui", files: [{ path: "clock.tsx", type: "registry:ui" }] },
      ],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([
      'clock: imports "lucide" but does not declare it in dependencies',
    ]);
  });

  test("passes once the item declares the package it imports", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [
        {
          name: "clock",
          type: "registry:ui",
          dependencies: ["lucide@^1.66.0"],
          files: [{ path: "clock.tsx", type: "registry:ui" }],
        },
      ],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([]);
  });

  test("reports a package it declares but nothing imports", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [
        {
          name: "label",
          type: "registry:ui",
          dependencies: ["lucide@^1.66.0"],
          files: [{ path: "label.tsx", type: "registry:ui" }],
        },
      ],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([
      'label: declares "lucide@^1.66.0" but never imports it',
    ]);
  });

  test("nsh, which the runtime supplies, needs no dependencies entry", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [
        { name: "label", type: "registry:ui", files: [{ path: "label.tsx", type: "registry:ui" }] },
      ],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([]);
  });

  test("a second theme importing schema/base resolves cleanly against theme", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [libraryTheme, neutralTheme],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([]);
  });

  test("a component's theme package import is the build-time theme's", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [libraryTheme, neutralTheme, themed],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([
      'themed: imports "theme" but does not declare it',
    ]);

    const declared: Registry = {
      ...registry,
      items: [libraryTheme, neutralTheme, { ...themed, registryDependencies: ["theme"] }],
    };
    expect(await checkRegistryDependencies(declared, dir)).toEqual([]);
  });
});
