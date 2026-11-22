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
  "packages/theme/tokens/themes/shadcn/theme.tokens.json",
  "packages/theme/tokens/themes/shadcn/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/shadcn/light.tokens.json",
  "packages/theme/tokens/themes/shadcn/dark.tokens.json",
  "packages/theme/tokens/themes/solid-glass/theme.tokens.json",
  "packages/theme/tokens/themes/solid-glass/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/solid-glass/light.tokens.json",
  "packages/theme/tokens/themes/solid-glass/dark.tokens.json",
];

const RESOLVER_PATH = "packages/theme/tokens/themes/default/theme.resolver.json";
const THEME_IDS = ["default", "shadcn", "solid-glass"] as const;

describe("DTCG 2025.10 schema validation", () => {
  for (const file of TOKEN_FILES) {
    test(`validates ${file} against official 2025.10 format.json`, () => {
      expect(validateTokensDocument(readJson(file))).toEqual([]);
    });
  }

  for (const themeId of THEME_IDS) {
    const resolver = `packages/theme/tokens/themes/${themeId}/theme.resolver.json`;
    test(`validates ${resolver} against official 2025.10 resolver.json`, () => {
      expect(validateResolverDocument(readJson(resolver))).toEqual([]);
    });
  }

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

describe("DTCG 2025.10 build (default, shadcn, solid-glass)", () => {
  test("discovers DTCG-sourced themes", () => {
    expect(discoverDtcgThemes(root)).toEqual([...THEME_IDS]);
  });

  for (const themeId of THEME_IDS) {
    const resolver = `packages/theme/tokens/themes/${themeId}/theme.resolver.json`;
    for (const appearance of ["light", "dark"] as const) {
      for (const input of ["pointer", "touch"] as const) {
        test(`${themeId}: resolves (${appearance}, ${input}) without dangling/circular aliases and passes format schema`, () => {
          const { resolved } = resolvePermutation(path.join(root, resolver), {
            appearance,
            input,
          });
          expect(validateTokensDocument(resolved)).toEqual([]);
        });
      }
    }
  }

  test("compiles default, shadcn, and solid-glass theme.json and semantics.json byte-identical to committed files", () => {
    for (const themeId of THEME_IDS) {
      const absResolver = path.join(
        root,
        `packages/theme/tokens/themes/${themeId}/theme.resolver.json`,
      );
      const builtTheme = `${JSON.stringify(compileThemeJson(absResolver), null, 2)}\n`;
      const builtSemantics = `${JSON.stringify(compileSemanticsJson(absResolver), null, 2)}\n`;

      expect(builtTheme).toBe(readText(`packages/theme/themes/${themeId}/theme.json`));
      expect(builtSemantics).toBe(readText(`packages/theme/themes/${themeId}/semantics.json`));
      if (themeId === "default") {
        expect(builtTheme).toBe(readText("packages/theme/theme.json"));
        expect(builtSemantics).toBe(readText("packages/theme/semantics.json"));
      }
    }
  });

  test("checkAllTokens passes cleanly on repo and detects drift when a compiled file is modified", () => {
    expect(checkAllTokens(root)).toEqual({ themes: [...THEME_IDS], problems: [] });

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-build-test-"));
    try {
      fs.cpSync(path.join(root, "packages/theme"), path.join(tmp, "packages/theme"), {
        recursive: true,
      });
      expect(checkAllTokens(tmp).problems).toEqual([]);

      const target = path.join(tmp, "packages/theme/themes/shadcn/theme.json");
      fs.writeFileSync(target, `${fs.readFileSync(target, "utf8")}// drift\n`);
      const drifted = checkAllTokens(tmp);
      expect(drifted.problems).toEqual([
        "packages/theme/themes/shadcn/theme.json differs from what packages/theme/tokens builds",
      ]);

      buildAllTokens(tmp);
      expect(checkAllTokens(tmp).problems).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("compiles an isolated theme without sibling default and supports sparse sets.base radii", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-isolated-test-"));
    try {
      fs.cpSync(path.join(root, "packages/theme/tokens/base"), path.join(tmp, "base"), {
        recursive: true,
      });
      const themeDir = path.join(tmp, "themes/custom");
      fs.mkdirSync(themeDir, { recursive: true });
      fs.cpSync(
        path.join(root, "packages/theme/tokens/themes/shadcn/finishes.shared.tokens.json"),
        path.join(themeDir, "finishes.shared.tokens.json"),
      );
      fs.cpSync(
        path.join(root, "packages/theme/tokens/themes/shadcn/light.tokens.json"),
        path.join(themeDir, "light.tokens.json"),
      );
      fs.cpSync(
        path.join(root, "packages/theme/tokens/themes/shadcn/dark.tokens.json"),
        path.join(themeDir, "dark.tokens.json"),
      );
      const baseShared = JSON.parse(
        fs.readFileSync(path.join(tmp, "base/style.shared.tokens.json"), "utf8"),
      );
      const shadcnTheme = readJson("packages/theme/tokens/themes/shadcn/theme.tokens.json");
      baseShared.dimension.radius = shadcnTheme.dimension.radius;
      fs.writeFileSync(
        path.join(tmp, "base/style.shared.tokens.json"),
        `${JSON.stringify(baseShared, null, 2)}\n`,
      );

      // Sparse theme.tokens.json omits dimension.radius (inherited from base) and overrides state.press-scale.
      const sparseTheme = {
        $schema: shadcnTheme.$schema,
        $description: "Sparse custom theme.",
        font: shadcnTheme.font,
        color: shadcnTheme.color,
        state: shadcnTheme.state,
      };
      fs.writeFileSync(
        path.join(themeDir, "theme.tokens.json"),
        `${JSON.stringify(sparseTheme, null, 2)}\n`,
      );
      fs.cpSync(
        path.join(root, "packages/theme/tokens/themes/shadcn/theme.resolver.json"),
        path.join(themeDir, "theme.resolver.json"),
      );

      const resolverAbs = path.join(themeDir, "theme.resolver.json");
      expect(lintDtcgTheme(resolverAbs, { repoRoot: tmp })).toEqual([]);
      const compiledTheme = compileThemeJson(resolverAbs);
      expect(compiledTheme.cssVars.theme.radius).toBe("10px");
      const compiledSemantics = compileSemanticsJson(resolverAbs) as {
        state: { pressScale: number };
        finishes: { shared: { card: { boxShadow: string } } };
      };
      expect(compiledSemantics.state.pressScale).toBe(1);
      expect(compiledSemantics.finishes.shared.card.boxShadow).toBe(
        "0 1px 3px oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)",
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("DTCG source lint", () => {
  test("passes on packages/theme/tokens/", () => {
    const result = lintDtcgSources(root);
    expect(result.themes).toEqual([...THEME_IDS]);
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

  test("rejects negative radius and non-boolean shadow none flag", () => {
    const problems = withMutatedDefault((tmp) => {
      const themePath = path.join(tmp, "packages/theme/tokens/themes/default/theme.tokens.json");
      const themeDoc = JSON.parse(fs.readFileSync(themePath, "utf8"));
      themeDoc.dimension.radius.card.$value.value = -4;
      fs.writeFileSync(themePath, JSON.stringify(themeDoc, null, 2));

      const finPath = path.join(
        tmp,
        "packages/theme/tokens/themes/default/finishes.shared.tokens.json",
      );
      const finDoc = JSON.parse(fs.readFileSync(finPath, "utf8"));
      finDoc.finish.field.shadow.$extensions["dev.aning.shadcn-nsh"] = { none: false };
      fs.writeFileSync(finPath, JSON.stringify(finDoc, null, 2));
    });
    const text = problems.join("\n");
    expect(text).toContain("dimension.radius.card value -4 must be >= 0");
    expect(text).toContain("none must be true");
  });

  test("validates alpha colorOp on border-color and translucent mix colorOp in solid-glass", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-sg-colorop-"));
    try {
      fs.cpSync(path.join(root, "packages/theme/tokens"), path.join(tmp, "packages/theme/tokens"), {
        recursive: true,
      });
      const sgDarkPath = path.join(
        tmp,
        "packages/theme/tokens/themes/solid-glass/dark.tokens.json",
      );
      const sgDark = JSON.parse(fs.readFileSync(sgDarkPath, "utf8"));
      // Corrupt ring-halo (mix of translucent ring 0.4 alpha and transparent) -> must fail.
      sgDark.color["ring-halo"].$value.alpha = 0.5;
      // Corrupt finish.on.border-color (alpha colorOp) -> must fail.
      sgDark.finish.on["border-color"].$value.alpha = 0.9;
      fs.writeFileSync(sgDarkPath, JSON.stringify(sgDark, null, 2));

      const problems = lintDtcgTheme(
        path.join(tmp, "packages/theme/tokens/themes/solid-glass/theme.resolver.json"),
        { repoRoot: tmp },
      ).join("\n");
      expect(problems).toContain(
        "color.ring-halo: static $value differs from live colorOp evaluation",
      );
      expect(problems).toContain(
        "finish.on.border-color: static $value differs from live colorOp evaluation",
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
