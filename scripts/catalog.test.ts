import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  catalog,
  checkCatalog,
  components,
  isGeneratedCurrent,
  renderGenerated,
  writeGenerated,
  type RegistryItem,
} from "./catalog";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

const ui = (name: string): RegistryItem => ({
  name,
  type: "registry:ui",
  files: [{ path: `packages/ui/${name}.tsx`, type: "registry:ui", target: `ui/${name}.tsx` }],
});

const lib = (name: string): RegistryItem => ({
  name,
  type: "registry:lib",
  files: [{ path: `packages/ui/lib/${name}.ts`, type: "registry:lib" }],
});

type Fixture = {
  items: RegistryItem[];
  files?: Record<string, string>;
  index?: string;
};

/** A repo-shaped directory: the registry, every component's four files, and the index export. */
function fixture({ items, files = {}, index }: Fixture): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nsh-catalog-"));
  roots.push(root);
  fs.writeFileSync(path.join(root, "registry.json"), `${JSON.stringify({ items }, null, 2)}\n`);

  const defaults: Record<string, string> = {};
  for (const item of items) {
    if (item.type !== "registry:ui") continue;
    defaults[`packages/ui/${item.name}.tsx`] = "export const value = 1;\n";
    defaults[`apps/docs/demos/${item.name}.tsx`] = "// demo\n";
    defaults[`apps/docs/demos/${item.name}.ref.tsx`] = "// reference\n";
    defaults[`apps/docs/src/pages/docs/components/${item.name}.md`] = "## Installation\n";
  }
  for (const [rel, text] of Object.entries({ ...defaults, ...files })) {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }

  const exporter =
    index ??
    `${items
      .filter((item) => item.type === "registry:ui")
      .map((item) => `export * from "./${item.name}";`)
      .join("\n")}\n`;
  fs.writeFileSync(path.join(root, "packages/ui/index.ts"), exporter);
  return root;
}

const remove = (root: string, rel: string) => fs.rmSync(path.join(root, rel), { force: true });

describe("catalog", () => {
  test("lists registry:ui items in registry order, with their files", () => {
    const root = fixture({ items: [lib("press"), ui("beta"), ui("alpha")] });
    const set = components(root);

    expect(set.map((component) => component.id)).toEqual(["beta", "alpha"]);
    expect(set[0]!.item.name).toBe("beta");
    expect(set[0]!.uiFile).toBe(path.join(root, "packages/ui/beta.tsx"));
    expect(set[0]!.demo).toBe(path.join(root, "apps/docs/demos/beta.tsx"));
    expect(set[0]!.reference).toBe(path.join(root, "apps/docs/demos/beta.ref.tsx"));
    expect(set[0]!.page).toBe(path.join(root, "apps/docs/src/pages/docs/components/beta.md"));
  });

  test("exposes the paths the scripts share", () => {
    const root = fixture({ items: [ui("alpha")] });
    const paths = catalog(root).paths;

    expect(paths.registry).toBe(path.join(root, "registry.json"));
    expect(paths.generated).toBe(path.join(root, "apps/docs/demos/catalog.generated.ts"));
    expect(paths.index).toBe(path.join(root, "packages/ui/index.ts"));
  });
});

describe("checkCatalog", () => {
  test("a complete component has no problems", () => {
    const root = fixture({ items: [ui("alpha")] });
    expect(checkCatalog(catalog(root))).toEqual([]);
  });

  test("reports a missing file, reference page, docs page and export", () => {
    const root = fixture({ items: [ui("alpha")], index: 'export * from "./other";\n' });
    remove(root, "apps/docs/demos/alpha.tsx");
    remove(root, "apps/docs/demos/alpha.ref.tsx");
    remove(root, "apps/docs/src/pages/docs/components/alpha.md");
    remove(root, "packages/ui/alpha.tsx");

    const problems = checkCatalog(catalog(root));
    expect(problems).toContain("alpha: no packages/ui/alpha.tsx");
    expect(problems).toContain("alpha: no demo apps/docs/demos/alpha.tsx");
    expect(problems).toContain("alpha: no reference page apps/docs/demos/alpha.ref.tsx");
    expect(problems).toContain("alpha: no docs page apps/docs/src/pages/docs/components/alpha.md");
    expect(problems).toContain('alpha: packages/ui/index.ts does not export "./alpha"');
  });

  test("reports a component whose registry file is not packages/ui/<id>.tsx", () => {
    const root = fixture({
      items: [
        {
          ...ui("alpha"),
          files: [{ path: "packages/ui/other.tsx", type: "registry:ui" }],
        },
      ],
      files: { "packages/ui/other.tsx": "export const value = 1;\n" },
    });

    expect(checkCatalog(catalog(root))).toContain(
      'registry:ui "alpha" points at packages/ui/other.tsx, not packages/ui/alpha.tsx',
    );
  });

  test("accepts a named export and ignores demo / page files that are not components", () => {
    const root = fixture({
      items: [ui("alpha")],
      index: 'export {\n  value,\n  type AlphaProps,\n} from "./alpha";\n',
      files: {
        "apps/docs/demos/App.tsx": "",
        "apps/docs/demos/kit.tsx": "",
        "apps/docs/demos/render-cases.ts": "",
        "apps/docs/demos/alpha.test.tsx": "",
        "apps/docs/demos/baseline/shot.png": "",
        "apps/docs/src/pages/docs/components/index.astro": "",
      },
    });

    expect(checkCatalog(catalog(root))).toEqual([]);
  });

  test("reports demos, reference pages and docs pages for no component", () => {
    const root = fixture({
      items: [ui("alpha")],
      files: {
        "apps/docs/demos/orphan.tsx": "",
        "apps/docs/demos/orphan.ref.tsx": "",
        "apps/docs/src/pages/docs/components/orphan.md": "",
      },
    });

    expect(checkCatalog(catalog(root)).sort()).toEqual([
      "apps/docs/demos/orphan.ref.tsx: reference page for no component",
      "apps/docs/demos/orphan.tsx: demo for no component",
      "apps/docs/src/pages/docs/components/orphan.md: docs page for no component",
    ]);
  });
});

describe("catalog.generated.ts", () => {
  test("renders registry order and is current once written", () => {
    const root = fixture({ items: [ui("beta"), ui("alpha")] });
    const cat = catalog(root);

    expect(isGeneratedCurrent(cat)).toBe(false);
    expect(renderGenerated(cat)).toContain(
      'export const componentIds = ["beta", "alpha"] as const;',
    );

    writeGenerated(cat);
    expect(isGeneratedCurrent(cat)).toBe(true);
    expect(fs.readFileSync(cat.paths.generated, "utf8")).toContain(
      "// Generated by `bun run catalog`",
    );
  });

  test("is stale when the registry gains a component", () => {
    const root = fixture({ items: [ui("alpha")] });
    writeGenerated(catalog(root));
    expect(isGeneratedCurrent(catalog(root))).toBe(true);

    const registryFile = path.join(root, "registry.json");
    const registry = JSON.parse(fs.readFileSync(registryFile, "utf8")) as {
      items: RegistryItem[];
    };
    registry.items.push(ui("gamma"));
    fs.writeFileSync(registryFile, `${JSON.stringify(registry, null, 2)}\n`);

    const cat = catalog(root);
    expect(isGeneratedCurrent(cat)).toBe(false);
    expect(renderGenerated(cat)).toContain(
      'export const componentIds = ["alpha", "gamma"] as const;',
    );
  });
});
