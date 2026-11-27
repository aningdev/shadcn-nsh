import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { parseRegistry } from "../../packages/cli/src/utils/registry-schema";
import {
  addComponent,
  catalog,
  CatalogError,
  checkCatalog,
  checkNshManifest,
  components,
  isGeneratedCurrent,
  isNshManifestCurrent,
  renderGenerated,
  renderNshManifest,
  writeGenerated,
  writeNshManifest,
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

/** A repo-shaped directory: the registry, every component's three files, and the index export. */
function fixture({ items, files = {}, index }: Fixture): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nsh-catalog-"));
  roots.push(root);
  fs.writeFileSync(
    path.join(root, "registry.json"),
    `${JSON.stringify({ name: "fixture", homepage: "", items }, null, 2)}\n`,
  );

  const defaults: Record<string, string> = {};
  for (const item of items) {
    if (item.type !== "registry:ui") continue;
    defaults[`packages/ui/${item.name}.tsx`] = "export const value = 1;\n";
    defaults[`apps/website/demos/${item.name}.tsx`] = "// demo\n";
    defaults[`apps/website/content/docs/components/${item.name}.md`] = "## Installation\n";
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
    expect(set[0]!.demo).toBe(path.join(root, "apps/website/demos/beta.tsx"));
    expect(set[0]!.page).toBe(path.join(root, "apps/website/content/docs/components/beta.md"));
  });

  test("exposes the paths the scripts share", () => {
    const root = fixture({ items: [ui("alpha")] });
    const paths = catalog(root).paths;

    expect(paths.registry).toBe(path.join(root, "registry.json"));
    expect(paths.generated).toBe(path.join(root, "apps/website/demos/catalog.generated.ts"));
    expect(paths.index).toBe(path.join(root, "packages/ui/index.ts"));
  });
});

describe("checkCatalog", () => {
  test("a complete component has no problems", () => {
    const root = fixture({ items: [ui("alpha")] });
    expect(checkCatalog(catalog(root))).toEqual([]);
  });

  test("reports a missing file, docs page and export", () => {
    const root = fixture({ items: [ui("alpha")], index: 'export * from "./other";\n' });
    remove(root, "apps/website/demos/alpha.tsx");
    remove(root, "apps/website/content/docs/components/alpha.md");
    remove(root, "packages/ui/alpha.tsx");

    const problems = checkCatalog(catalog(root));
    expect(problems).toContain("alpha: no packages/ui/alpha.tsx");
    expect(problems).toContain("alpha: no demo apps/website/demos/alpha.tsx");
    expect(problems).toContain("alpha: no docs page apps/website/content/docs/components/alpha.md");
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
        "apps/website/demos/App.tsx": "",
        "apps/website/demos/kit.tsx": "",
        "apps/website/demos/stage.tsx": "",
        "apps/website/demos/photos.ts": "",
        "apps/website/demos/palettes.ts": "",
        "apps/website/demos/apply-palette.ts": "",
        "apps/website/demos/avatar-data.ts": "",
        "apps/website/demos/editor-sample.ts": "",
        "apps/website/demos/editor-server.ts": "",
        "apps/website/demos/props.test-d.ts": "",
        "apps/website/demos/narrow.test.tsx": "",
        "apps/website/demos/catalog.generated.ts": "",
        "apps/website/content/docs/components/index.astro": "",
      },
    });

    expect(checkCatalog(catalog(root))).toEqual([]);
  });

  test("accepts a namespace re-export", () => {
    const root = fixture({ items: [ui("alpha")], index: 'export * as alpha from "./alpha";\n' });
    expect(checkCatalog(catalog(root))).toEqual([]);
  });

  test("reports demos and docs pages for no component", () => {
    const root = fixture({
      items: [ui("alpha")],
      files: {
        "apps/website/demos/orphan.tsx": "",
        "apps/website/content/docs/components/orphan.md": "",
      },
    });

    expect(checkCatalog(catalog(root)).sort()).toEqual([
      "apps/website/content/docs/components/orphan.md: docs page for no component",
      "apps/website/demos/orphan.tsx: demo for no component",
    ]);
  });
});

describe("addComponent", () => {
  test("appends the item and regenerates the list", () => {
    const root = fixture({ items: [ui("alpha")] });
    addComponent(catalog(root), ui("beta"));

    const cat = catalog(root);
    expect(cat.components.map((component) => component.id)).toEqual(["alpha", "beta"]);
    expect(fs.readFileSync(cat.paths.generated, "utf8")).toContain('"beta"');
    const written = parseRegistry(
      JSON.parse(fs.readFileSync(cat.paths.registry, "utf8")),
      cat.paths.registry,
    );
    expect(written.items.map((item) => item.name)).toEqual(["alpha", "beta"]);
  });

  test("refuses a duplicate id", () => {
    const root = fixture({ items: [ui("alpha")] });
    expect(() => addComponent(catalog(root), ui("alpha"))).toThrow('already lists "alpha"');
  });

  test("refuses an item that is not a component or lacks the item shape", () => {
    const root = fixture({ items: [ui("alpha")] });
    expect(() => addComponent(catalog(root), lib("press"))).toThrow("registry:ui");
    expect(() => addComponent(catalog(root), { ...ui("beta"), files: [] })).toThrow(CatalogError);
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
    const registry = parseRegistry(JSON.parse(fs.readFileSync(registryFile, "utf8")), registryFile);
    registry.items.push(ui("gamma"));
    fs.writeFileSync(registryFile, `${JSON.stringify(registry, null, 2)}\n`);

    const cat = catalog(root);
    expect(isGeneratedCurrent(cat)).toBe(false);
    expect(renderGenerated(cat)).toContain(
      'export const componentIds = ["alpha", "gamma"] as const;',
    );
  });
});

const cliPackage = (root: string, version = "0.11.0") => {
  fs.mkdirSync(path.join(root, "packages/cli"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "packages/cli/package.json"),
    `${JSON.stringify({ name: "shadcn-nsh", version })}\n`,
  );
};

describe("nsh.json", () => {
  test("a fixture without the CLI package skips the manifest", () => {
    const root = fixture({ items: [ui("alpha")] });
    expect(checkNshManifest(catalog(root))).toEqual([]);
    expect(isNshManifestCurrent(catalog(root))).toBe(true);
  });

  test("reports a missing manifest", () => {
    const root = fixture({ items: [ui("alpha")] });
    cliPackage(root);
    expect(checkNshManifest(catalog(root))).toEqual(["nsh.json: missing (run bun run catalog)"]);
  });

  test("reports a version that disagrees with the CLI package", () => {
    const root = fixture({ items: [ui("alpha")] });
    cliPackage(root, "0.11.0");
    const cat = catalog(root);
    fs.writeFileSync(path.join(root, "nsh.json"), renderNshManifest(cat, "0.10.0"));
    expect(checkNshManifest(cat)).toContain(
      'nsh.json: version "0.10.0" does not match packages/cli/package.json "0.11.0"',
    );
  });

  test("reports a component export that is missing or extra", () => {
    const root = fixture({ items: [ui("alpha"), ui("beta")] });
    cliPackage(root);
    const cat = catalog(root);
    const parsed = JSON.parse(renderNshManifest(cat, "0.11.0")) as {
      exports: Record<string, string>;
    };
    delete parsed.exports["shadcn-nsh/beta"];
    parsed.exports["shadcn-nsh/gamma"] = "packages/ui/gamma.tsx";
    fs.writeFileSync(path.join(root, "nsh.json"), `${JSON.stringify(parsed, null, 2)}\n`);
    expect(checkNshManifest(cat)).toEqual([
      'nsh.json: exports missing "beta"',
      'nsh.json: exports include "gamma", which is not a registry:ui item',
    ]);
  });

  test("is current once written, and stale when a non-component export changes", () => {
    const root = fixture({ items: [ui("beta"), ui("alpha")] });
    cliPackage(root);
    const cat = catalog(root);
    expect(isNshManifestCurrent(cat)).toBe(false);

    writeNshManifest(cat);
    expect(checkNshManifest(cat)).toEqual([]);
    expect(isNshManifestCurrent(cat)).toBe(true);

    const text = fs.readFileSync(path.join(root, "nsh.json"), "utf8");
    const parsed = JSON.parse(text) as { exports: Record<string, string> };
    expect(Object.keys(parsed.exports).slice(0, 3)).toEqual([
      "shadcn-nsh",
      "shadcn-nsh/theme",
      "shadcn-nsh/themes",
    ]);
    expect(parsed.exports["shadcn-nsh/alpha"]).toBe("packages/ui/alpha.tsx");
    expect(parsed.exports["shadcn-nsh/beta"]).toBe("packages/ui/beta.tsx");
    const alphaAt = text.indexOf('"shadcn-nsh/alpha"');
    const betaAt = text.indexOf('"shadcn-nsh/beta"');
    expect(alphaAt).toBeGreaterThan(0);
    expect(alphaAt).toBeLessThan(betaAt);

    delete parsed.exports["shadcn-nsh/themes/apple"];
    fs.writeFileSync(path.join(root, "nsh.json"), `${JSON.stringify(parsed, null, 2)}\n`);
    expect(checkNshManifest(cat)).toEqual([]);
    expect(isNshManifestCurrent(cat)).toBe(false);
  });
});
