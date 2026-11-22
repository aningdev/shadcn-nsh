import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { buildAllTokens, checkAllTokens, discoverDtcgThemes } from "./build";
import { compileSemanticsJson, compileThemeJson } from "./compile";
import { lintDtcgSources, lintDtcgTheme } from "./lint";
import { resolvePermutation } from "./resolver";
import { validateResolverDocument, validateTokensDocument } from "./schema-validate";

const root = path.join(import.meta.dir, "..", "..");
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const readText = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

const TOKEN_FILES = [
  "packages/theme/tokens/base/style.shared.tokens.json",
  "packages/theme/tokens/base/style.pointer.tokens.json",
  "packages/theme/tokens/base/style.touch.tokens.json",
  "packages/theme/tokens/themes/default/theme.tokens.json",
  "packages/theme/tokens/themes/default/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/default/light.tokens.json",
  "packages/theme/tokens/themes/default/dark.tokens.json",
];

const RESOLVER_PATH = "packages/theme/tokens/themes/default/theme.resolver.json";

describe("DTCG 2025.10 schema validation", () => {
  for (const file of TOKEN_FILES) {
    test(`validates ${file} against official 2025.10 format.json`, () => {
      expect(validateTokensDocument(readJson(file))).toEqual([]);
    });
  }

  test(`validates ${RESOLVER_PATH} against official 2025.10 resolver.json`, () => {
    expect(validateResolverDocument(readJson(RESOLVER_PATH))).toEqual([]);
  });

  test("rejects invalid DTCG token & resolver fixtures", () => {
    // 1. Hue >= 360 violates Color Module hueComponent exclusiveMaximum: 360
    expect(
      validateTokensDocument({
        bad: {
          $type: "color",
          $value: { colorSpace: "oklch", components: [0.5, 0.1, 360] },
        },
      }).length,
    ).toBeGreaterThan(0);

    // 2. Period in token name violates Format §5.1.1 character restrictions
    expect(
      validateTokensDocument({
        "a.b": {
          $type: "number",
          $value: 1,
        },
      }).length,
    ).toBeGreaterThan(0);

    // 3. String fontWeight violates Format §8.4
    expect(
      validateTokensDocument({
        w: {
          $type: "fontWeight",
          $value: "400",
        },
      }).length,
    ).toBeGreaterThan(0);

    // 4. Modifier with only 1 context violates Resolver §4.1.5.1 (minProperties: 2)
    expect(
      validateResolverDocument({
        version: "2025.10",
        modifiers: { appearance: { contexts: { light: [] } } },
        resolutionOrder: [{ $ref: "#/modifiers/appearance" }],
      }).length,
    ).toBeGreaterThan(0);
  });
});

describe("DTCG 2025.10 build (default theme)", () => {
  test("discovers DTCG-sourced themes", () => {
    expect(discoverDtcgThemes(root)).toEqual(["default"]);
  });

  for (const appearance of ["light", "dark"] as const) {
    for (const input of ["pointer", "touch"] as const) {
      test(`resolves (${appearance}, ${input}) without dangling/circular aliases and passes format schema`, () => {
        const { resolved } = resolvePermutation(path.join(root, RESOLVER_PATH), {
          appearance,
          input,
        });
        expect(validateTokensDocument(resolved)).toEqual([]);
      });
    }
  }

  test("compiles default theme.json and semantics.json byte-identical to committed files", () => {
    const absResolver = path.join(root, RESOLVER_PATH);
    const builtTheme = `${JSON.stringify(compileThemeJson(absResolver), null, 2)}\n`;
    const builtSemantics = `${JSON.stringify(compileSemanticsJson(absResolver), null, 2)}\n`;

    expect(builtTheme).toBe(readText("packages/theme/theme.json"));
    expect(builtTheme).toBe(readText("packages/theme/themes/default/theme.json"));
    expect(builtSemantics).toBe(readText("packages/theme/semantics.json"));
    expect(builtSemantics).toBe(readText("packages/theme/themes/default/semantics.json"));
  });

  test("checkAllTokens passes cleanly on repo and detects drift when a compiled file is modified", () => {
    expect(checkAllTokens(root)).toEqual({ themes: ["default"], problems: [] });

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-build-test-"));
    try {
      fs.cpSync(path.join(root, "packages/theme"), path.join(tmp, "packages/theme"), {
        recursive: true,
      });
      expect(checkAllTokens(tmp).problems).toEqual([]);

      const target = path.join(tmp, "packages/theme/theme.json");
      fs.writeFileSync(target, `${fs.readFileSync(target, "utf8")}// drift\n`);
      const drifted = checkAllTokens(tmp);
      expect(drifted.problems).toEqual([
        "packages/theme/theme.json differs from what packages/theme/tokens builds",
      ]);

      buildAllTokens(tmp);
      expect(checkAllTokens(tmp).problems).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("DTCG source lint", () => {
  test("passes on packages/theme/tokens/", () => {
    const result = lintDtcgSources(root);
    expect(result.themes).toEqual(["default"]);
    expect(result.problems).toEqual([]);
  });

  function withMutatedDefault(mutate: (tmp: string) => void): string[] {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-lint-test-"));
    try {
      fs.cpSync(path.join(root, "packages/theme/tokens"), path.join(tmp, "packages/theme/tokens"), {
        recursive: true,
      });
      mutate(tmp);
      return lintDtcgTheme(path.join(tmp, RESOLVER_PATH), { repoRoot: tmp });
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }

  test("rejects disallowed $extensions namespace and unexpected keys", () => {
    const problems = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.shape.$extensions["dev.nsh"] = { curve: "continuous" };
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    });
    expect(problems.join("\n")).toContain('disallowed namespace "dev.nsh"');
  });

  test("rejects invalid enum and invalid material in $extensions", () => {
    const problems = withMutatedDefault((tmp) => {
      const sharedPath = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const shared = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
      shared.indicator.$extensions["dev.aning.shadcn-nsh"].tabs = "rail";
      fs.writeFileSync(sharedPath, JSON.stringify(shared, null, 2));

      const finPath = path.join(
        tmp,
        "packages/theme/tokens/themes/default/finishes.shared.tokens.json",
      );
      const fin = JSON.parse(fs.readFileSync(finPath, "utf8"));
      fin.finish.card.$extensions["dev.aning.shadcn-nsh"].material = {
        apple: { glass: "frosted", tint: "{color.missing}" },
      };
      fs.writeFileSync(finPath, JSON.stringify(fin, null, 2));
    });
    const text = problems.join("\n");
    expect(text).toContain("indicator");
    expect(text).toContain("apple.glass");
    expect(text).toContain("missing");
  });

  test("rejects reference with mismatched $type", () => {
    const problems = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.dimension.shape.card.$value = "{color.card}";
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    });
    expect(problems.join("\n")).toContain('of $type "color", expected "dimension"');
  });

  test("rejects dangling and circular aliases", () => {
    const dangling = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/themes/default/light.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.color["card-foreground"].$value = "{color.does-not-exist}";
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    });
    expect(dangling.join("\n")).toContain("Unresolved DTCG alias");

    const circular = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/themes/default/light.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.color.card.$value = "{color.card-foreground}";
      doc.color["card-foreground"].$value = "{color.card}";
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    });
    expect(circular.join("\n")).toContain("Circular alias detected");
  });

  test("rejects drifted static $value on colorOp tokens", () => {
    const problems = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/themes/default/light.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.color.hover.$value.components = [0.5, 0.2, 120];
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    });
    expect(problems.join("\n")).toContain("differs from live colorOp evaluation");
  });

  test("rejects missing $description on colour roles", () => {
    const problems = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/themes/default/light.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      delete doc.color.background.$description;
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    });
    expect(problems.join("\n")).toContain("color.background is missing $description");
  });
});
