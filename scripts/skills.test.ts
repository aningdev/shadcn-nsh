// Holds the shipped skill to the library: every component path, imported name and
// composition part it shows must exist in `registry.json` and `packages/ui`.
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const skillDir = join(root, "skills", "shadcn-nsh");

/** Primitives a snippet may use without importing them from us. */
const nshPrimitives = new Set(["View", "Text", "Scroll", "Fragment"]);

interface RegistryFile {
  path: string;
  target: string;
}

interface RegistryItem {
  name: string;
  type: string;
  files?: RegistryFile[];
}

const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8")) as {
  items: RegistryItem[];
};

/** Every file the registry installs, by the path the app imports it from. */
const targets = new Map<string, { source: string; item: string }>();
for (const item of registry.items) {
  for (const file of item.files ?? []) {
    targets.set(file.target, { source: file.path, item: item.name });
  }
}

function markdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...markdownFiles(path));
    else if (entry.endsWith(".md")) out.push(path);
  }
  return out.sort();
}

interface CodeBlock {
  file: string;
  lang: string;
  code: string;
}

const blocks: CodeBlock[] = [];
for (const file of markdownFiles(skillDir)) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/^```([\w-]*)\n([\s\S]*?)^```$/gm)) {
    blocks.push({ file, lang: match[1], code: match[2] });
  }
}

/** The names a file exports, following `export { … } from` and `export * from`. */
function exportsOf(file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file)) return new Set();
  seen.add(file);
  const source = readFileSync(file, "utf8");
  const names = new Set<string>();

  for (const match of source.matchAll(
    /^export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/gm,
  )) {
    names.add(match[1]);
  }

  for (const match of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const part of match[1].split(",")) {
      const cleaned = part.trim().replace(/^type\s+/, "");
      if (!cleaned) continue;
      const exported = cleaned
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (exported) names.add(exported);
    }
  }

  for (const match of source.matchAll(/^export\s+\*\s+from\s+["']([^"']+)["']/gm)) {
    const next = resolve(dirname(file), match[1]);
    const base = [next, `${next}.ts`, `${next}.tsx`, `${next}/index.ts`, `${next}/index.tsx`].find(
      (candidate) => existsSync(candidate),
    );
    if (!base) continue;
    for (const name of exportsOf(base, seen)) names.add(name);
  }

  return names;
}

/** The file `@/…` becomes after `shadcn-nsh add`, or the registry error. */
function sourceFor(specifier: string): RegistryFile & { path: string } {
  const appPath = specifier.replace(/^@\//, "");
  const candidates = [
    appPath,
    `${appPath}.ts`,
    `${appPath}.tsx`,
    `${appPath}/index.ts`,
    `${appPath}/index.tsx`,
  ];
  for (const candidate of candidates) {
    const hit = targets.get(candidate);
    if (hit) return { path: hit.source, target: candidate };
  }
  throw new Error(`"${specifier}" is not installed by any registry item`);
}

/** Every PascalCase name `packages/ui` exports: components, parts and their looks. */
function knownNames(): Set<string> {
  const known = new Set<string>();
  for (const dir of [join(root, "packages/ui"), join(root, "packages/ui/lib")]) {
    for (const entry of readdirSync(dir)) {
      if (!entry.endsWith(".tsx") && !entry.endsWith(".ts")) continue;
      if (entry.includes(".test.")) continue;
      for (const name of exportsOf(join(dir, entry))) if (/^[A-Z]/.test(name)) known.add(name);
    }
  }
  return known;
}

const namePattern = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g;

describe("shadcn-nsh skill", () => {
  test("has frontmatter that triggers on shadcn-nsh", () => {
    const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
    const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
    expect(frontmatter).not.toBeNull();
    expect(frontmatter![1]).toMatch(/^name: shadcn-nsh$/m);
    expect(frontmatter![1]).toMatch(/^description: .*shadcn-nsh/m);
    expect(frontmatter![1]).toMatch(/^description: .*(nsh-ui\.json|@\/components\/ui)/m);
  });

  test("links only reference files that exist", () => {
    const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
    const links = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)].map((match) => match[1]);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(statSync(join(skillDir, link)).isFile()).toBe(true);
    }
  });

  test("every imported component and name exists", () => {
    const failures: string[] = [];
    for (const block of blocks) {
      if (block.lang !== "tsx" && block.lang !== "ts" && block.lang !== "typescript") continue;
      for (const match of block.code.matchAll(namePattern)) {
        const [, list, specifier] = match;
        if (!specifier.startsWith("@/")) continue;
        try {
          const installed = sourceFor(specifier);
          const exported = exportsOf(join(root, installed.path));
          for (const part of list.split(",")) {
            const name = part
              .trim()
              .replace(/^type\s+/, "")
              .split(/\s+as\s+/)[0]
              .trim();
            if (!name) continue;
            if (!exported.has(name)) {
              failures.push(
                `${relative(root, block.file)}: ${name} is not exported by ${specifier} (${installed.path})`,
              );
            }
          }
        } catch (error) {
          failures.push(`${relative(root, block.file)}: ${(error as Error).message}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  test("every component and part shown exists", () => {
    const known = knownNames();

    const failures: string[] = [];
    for (const block of blocks) {
      const local = new Set<string>();
      for (const match of block.code.matchAll(
        /(?:function|const|class|interface|type)\s+([A-Z][\w]*)/g,
      )) {
        local.add(match[1]);
      }
      for (const match of block.code.matchAll(namePattern)) {
        for (const part of match[1].split(",")) {
          const name = part
            .trim()
            .replace(/^type\s+/, "")
            .split(/\s+as\s+/)
            .pop()
            ?.trim();
          if (name) local.add(name);
        }
      }

      if (block.lang === "text") {
        for (const line of block.code.split("\n")) {
          const name = line.replace(/[│├└─\s]/g, "").match(/^([A-Z][A-Za-z0-9]*)/)?.[1];
          if (name && !known.has(name)) {
            failures.push(`${relative(root, block.file)}: composition part ${name} does not exist`);
          }
        }
        continue;
      }

      if (block.lang !== "tsx" && block.lang !== "ts") continue;
      for (const match of block.code.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
        const tag = match[1];
        if (local.has(tag) || known.has(tag) || nshPrimitives.has(tag)) continue;
        failures.push(`${relative(root, block.file)}: <${tag}> does not exist`);
      }
    }
    expect(failures).toEqual([]);
  });

  test("every part named in prose and tables exists", () => {
    const known = knownNames();
    // `Root` names a composition role, not a component.
    const roleWords = new Set(["Root"]);
    const failures: string[] = [];
    for (const file of markdownFiles(skillDir)) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(/`([A-Z][A-Za-z0-9]*)`/g)) {
        const name = match[1];
        if (known.has(name) || nshPrimitives.has(name) || roleWords.has(name)) continue;
        failures.push(`${relative(root, file)}: ${name} does not exist`);
      }
    }
    expect(failures).toEqual([]);
  });

  test("skills.sh.json points at this repo's skills", () => {
    const config = JSON.parse(readFileSync(join(root, "skills.sh.json"), "utf8")) as {
      paths: string[];
    };
    expect(config.paths).toEqual(["./skills"]);
    for (const path of config.paths) {
      expect(statSync(join(root, path)).isDirectory()).toBe(true);
      expect(statSync(join(root, path, "shadcn-nsh", "SKILL.md")).isFile()).toBe(true);
    }
  });
});
