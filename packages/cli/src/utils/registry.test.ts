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
// A package the app installs, and the runtime the baseline supplies.
fs.writeFileSync(path.join(dir, "clock.tsx"), 'import { Clock } from "lucide";\n');
fs.writeFileSync(
  path.join(dir, "label.tsx"),
  'import { Text } from "nsh";\nimport { Button } from "nsh/base";\n',
);

afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

// Two themes: the same `lib/theme.ts` beside a `lib/finishes.json` each, as the registry ships them.
fs.mkdirSync(path.join(dir, "theme"));
fs.mkdirSync(path.join(dir, "themes", "shadcn"), { recursive: true });
fs.writeFileSync(path.join(dir, "theme/theme.ts"), 'import finishes from "./finishes.json";\n');
fs.writeFileSync(path.join(dir, "theme/finishes.json"), "{}\n");
fs.writeFileSync(path.join(dir, "themes/shadcn/theme.json"), "{}\n");
fs.writeFileSync(path.join(dir, "themes/shadcn/finishes.json"), "{}\n");
// A component, whose theme comes from the package the theme items ship.
fs.writeFileSync(path.join(dir, "themed.tsx"), 'import { colors } from "@shadcn-nsh/theme";\n');

const picker = {
  name: "picker",
  type: "registry:ui",
  files: [{ path: "picker.tsx", type: "registry:ui" }],
};

const defaultTheme = {
  name: "theme",
  type: "registry:theme",
  files: [
    { path: "theme/theme.ts", type: "registry:lib", target: "lib/theme.ts" },
    { path: "theme/finishes.json", type: "registry:lib", target: "lib/finishes.json" },
  ],
};

const neutralTheme = {
  name: "theme-shadcn",
  type: "registry:theme",
  files: [
    { path: "themes/shadcn/theme.json", type: "registry:file", target: "theme.json" },
    { path: "themes/shadcn/finishes.json", type: "registry:lib", target: "lib/finishes.json" },
    { path: "theme/theme.ts", type: "registry:lib", target: "lib/theme.ts" },
  ],
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

  test("a second theme ships lib/theme.ts beside its own finishes, and needs no dependency", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [defaultTheme, neutralTheme],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([]);
  });

  test("a component's theme package import is the default theme's", async () => {
    const registry: Registry = {
      name: "t",
      homepage: "",
      items: [defaultTheme, neutralTheme, themed],
    };
    expect(await checkRegistryDependencies(registry, dir)).toEqual([
      'themed: imports "theme" but does not declare it',
    ]);

    const declared: Registry = {
      ...registry,
      items: [defaultTheme, neutralTheme, { ...themed, registryDependencies: ["theme"] }],
    };
    expect(await checkRegistryDependencies(declared, dir)).toEqual([]);
  });
});
