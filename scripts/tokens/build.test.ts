import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { lint } from "@google/design.md/linter";

import { mergeFinishes } from "../theme/tokens";
import { buildAllTokens, checkAllTokens, discoverDtcgThemes } from "./build";
import { formatColorOpToCss, formatDtcgColor } from "./color";
import { compileSemanticsJson, compileThemeJson } from "./compile";
import { dtcgColorToHex } from "./design-md";
import { lintDtcgSources, lintDtcgTheme } from "./lint";
import { lookupToken, mergeTokenTrees, resolveAliases, resolvePermutation } from "./resolver";
import { validateResolverDocument, validateTokensDocument } from "./schema-validate";
import {
  EXT_NS,
  NAMED_CUBIC_BEZIERS,
  RADIUS_KEYS,
  SHAPE_ROLES,
  TYPE_ROLES,
  type ColorOpExtension,
  type DtcgColor,
  type DtcgGradientStop,
  type DtcgShadowItem,
  type DtcgTransition,
  type DtcgTypography,
} from "./types";

const root = path.join(import.meta.dir, "..", "..");
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const readText = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

const TOKEN_FILES = [
  "packages/theme/tokens/base/style.shared.tokens.json",
  "packages/theme/tokens/base/style.pointer.tokens.json",
  "packages/theme/tokens/base/style.touch.tokens.json",
  "packages/theme/tokens/themes/apple/theme.tokens.json",
  "packages/theme/tokens/themes/apple/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/apple/light.tokens.json",
  "packages/theme/tokens/themes/apple/dark.tokens.json",
  "packages/theme/tokens/themes/apple/pointer.tokens.json",
  "packages/theme/tokens/themes/apple/touch.tokens.json",
  "packages/theme/tokens/themes/default/theme.tokens.json",
  "packages/theme/tokens/themes/default/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/default/light.tokens.json",
  "packages/theme/tokens/themes/default/dark.tokens.json",
  "packages/theme/tokens/themes/material/theme.tokens.json",
  "packages/theme/tokens/themes/material/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/material/light.tokens.json",
  "packages/theme/tokens/themes/material/dark.tokens.json",
  "packages/theme/tokens/themes/material/pointer.tokens.json",
  "packages/theme/tokens/themes/material/touch.tokens.json",
  "packages/theme/tokens/themes/shadcn/theme.tokens.json",
  "packages/theme/tokens/themes/shadcn/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/shadcn/light.tokens.json",
  "packages/theme/tokens/themes/shadcn/dark.tokens.json",
  "packages/theme/tokens/themes/solid-glass/theme.tokens.json",
  "packages/theme/tokens/themes/solid-glass/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/solid-glass/light.tokens.json",
  "packages/theme/tokens/themes/solid-glass/dark.tokens.json",
  "packages/theme/tokens/themes/winui/theme.tokens.json",
  "packages/theme/tokens/themes/winui/finishes.shared.tokens.json",
  "packages/theme/tokens/themes/winui/light.tokens.json",
  "packages/theme/tokens/themes/winui/dark.tokens.json",
  "packages/theme/tokens/themes/winui/pointer.tokens.json",
  "packages/theme/tokens/themes/winui/touch.tokens.json",
];

const RESOLVER_PATH = "packages/theme/tokens/themes/default/theme.resolver.json";
const THEME_IDS = ["apple", "default", "material", "shadcn", "solid-glass", "winui"] as const;

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

describe("DTCG 2025.10 build (all six themes)", () => {
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

  test("compiles all six themes' theme.json and semantics.json byte-identical to committed files", () => {
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
      const tokensTarget = path.join(tmp, "packages/theme/light.tokens.json");
      fs.writeFileSync(tokensTarget, `${fs.readFileSync(tokensTarget, "utf8")}\n`);
      const designMdTarget = path.join(tmp, "packages/theme/themes/apple/DESIGN.md");
      fs.writeFileSync(designMdTarget, `${fs.readFileSync(designMdTarget, "utf8")}drift\n`);
      const drifted = checkAllTokens(tmp);
      expect(drifted.problems).toEqual([
        "packages/theme/themes/apple/DESIGN.md differs from what packages/theme/tokens builds",
        "packages/theme/light.tokens.json differs from what packages/theme/tokens builds",
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
      expect(compiledTheme.cssVars.theme.radius).toBe("8px");
      const compiledSemantics = compileSemanticsJson(resolverAbs) as {
        state: { "press-scale": number };
        finishes: { shared: { card: { shadow: string } } };
      };
      expect(compiledSemantics.state["press-scale"]).toBe(1);
      expect(compiledSemantics.finishes.shared.card.shadow).toBe(
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
      shared.shape.$extensions["dev.aning.shadcn-nsh"].curve = "squircle";
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
    expect(text).toContain("shape.$extensions");
    expect(text).toContain("apple.glass");
    expect(text).toContain("missing");
  });

  test("rejects invalid controls preset enum value and shape.corners.button in $extensions", () => {
    const problems = withMutatedDefault((tmp) => {
      const sharedPath = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const shared = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
      shared.controls.$extensions["dev.aning.shadcn-nsh"].preset = "cupertin";
      shared.shape.$extensions["dev.aning.shadcn-nsh"].corners.button = "pill";
      fs.writeFileSync(sharedPath, JSON.stringify(shared, null, 2));
    });
    const text = problems.join("\n");
    expect(text).toContain("controls.$extensions");
    expect(text).toContain('preset: "cupertin"');
    expect(text).toContain('corners.button: "pill"');
  });

  test("rejects missing or extra radius and shape roles", () => {
    const extra = withMutatedDefault((tmp) => {
      const themePath = path.join(tmp, "packages/theme/tokens/themes/default/theme.tokens.json");
      const themeDoc = JSON.parse(fs.readFileSync(themePath, "utf8"));
      themeDoc.dimension.radius.extra = { $value: { value: 14, unit: "px" } };
      fs.writeFileSync(themePath, JSON.stringify(themeDoc, null, 2));

      const sharedPath = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const shared = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
      shared.dimension.shape.extra = { $value: "{dimension.radius.extra}" };
      fs.writeFileSync(sharedPath, JSON.stringify(shared, null, 2));
    });
    expect(extra.join("\n")).toContain('dimension.radius has unexpected key "extra"');
    expect(extra.join("\n")).toContain('dimension.shape has unexpected key "extra"');

    const missing = withMutatedDefault((tmp) => {
      const themePath = path.join(tmp, "packages/theme/tokens/themes/default/theme.tokens.json");
      const themeDoc = JSON.parse(fs.readFileSync(themePath, "utf8"));
      delete themeDoc.dimension.radius.modal;
      fs.writeFileSync(themePath, JSON.stringify(themeDoc, null, 2));

      const sharedPath = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const shared = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
      delete shared.dimension.shape.modal;
      fs.writeFileSync(sharedPath, JSON.stringify(shared, null, 2));
    });
    expect(missing.join("\n")).toContain("dimension.radius.modal is missing");
    expect(missing.join("\n")).toContain("dimension.shape.modal is missing");
  });

  test("rejects reference with mismatched $type", () => {
    const problems = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.dimension.shape.container.$value = "{color.card}";
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
      themeDoc.dimension.radius.container.$value.value = -4;
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
    expect(text).toContain("dimension.radius.container value -4 must be >= 0");
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

  test("resolves per-tier overrides, motion timing/spring replacement, font-sans, and alias colorOps", () => {
    // 1. Per-tier overrides (apple pointer vs touch)
    const appleResolver = path.join(root, "packages/theme/tokens/themes/apple/theme.resolver.json");
    const applePointer = resolvePermutation(appleResolver, {
      appearance: "light",
      input: "pointer",
    }).resolved as Record<string, any>;
    const appleTouch = resolvePermutation(appleResolver, {
      appearance: "light",
      input: "touch",
    }).resolved as Record<string, any>;
    expect(applePointer.dimension.size.density.row.$value.value).toBe(32);
    expect(appleTouch.dimension.size.density.row.$value.value).toBe(44);
    expect(applePointer.typography.body.$value.fontSize.value).toBe(13);
    expect(appleTouch.typography.body.$value.fontSize.value).toBe(17);

    // 2. Motion union replacement (winui timing replaces base spring; spring replaces timing)
    const winuiResolver = path.join(root, "packages/theme/tokens/themes/winui/theme.resolver.json");
    const winuiMerged = resolvePermutation(winuiResolver, {
      appearance: "light",
      input: "pointer",
    }).merged as Record<string, any>;
    expect(winuiMerged.motion.press.timing.$value.duration.value).toBe(83);
    expect(winuiMerged.motion.press.$extensions).toBeUndefined();

    const backToSpring = mergeTokenTrees(structuredClone(winuiMerged), {
      motion: {
        press: {
          $extensions: { "dev.aning.shadcn-nsh": { spring: { stiffness: 500, damping: 30 } } },
        },
      },
    }) as Record<string, any>;
    expect(backToSpring.motion.press.timing).toBeUndefined();
    expect(backToSpring.motion.press.$extensions["dev.aning.shadcn-nsh"].spring).toEqual({
      stiffness: 500,
      damping: 30,
    });

    // 3. WinUI font-sans, brand-fill = var(--primary), and Material alias-backed colorOp (down-tint)
    const winuiTheme = compileThemeJson(winuiResolver);
    expect(winuiTheme.cssVars.theme["font-sans"]).toBe("Segoe UI Variable, Segoe UI, sans-serif");
    expect(winuiTheme.cssVars.theme["brand-fill"]).toBe("var(--primary)");
    expect(Object.keys(winuiTheme.cssVars.theme).at(-1)).toBe("font-sans");

    const matResolver = path.join(
      root,
      "packages/theme/tokens/themes/material/theme.resolver.json",
    );
    const matTheme = compileThemeJson(matResolver);
    expect(matTheme.cssVars.light["down-tint"]).toBe(
      "color-mix(in srgb, var(--destructive) 12%, transparent)",
    );
  });

  test("rejects out-of-range state opacities and negative stroke/shake values", () => {
    const problems = withMutatedDefault((tmp) => {
      const p = path.join(tmp, "packages/theme/tokens/base/style.shared.tokens.json");
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      doc.state.overlay.hover.$value = 1.5;
      doc.dimension.stroke.hairline.$value.value = -0.5;
      doc.duration.shake.$value.value = -10;
      fs.writeFileSync(p, JSON.stringify(doc, null, 2));
    }).join("\n");
    expect(problems).toContain("state.overlay.hover is 1.5, not in [0, 1]");
    expect(problems).toContain("dimension.stroke.hairline value -0.5 must be >= 0");
    expect(problems).toContain("duration.shake value -10 must be >= 0");
  });
});

const EMITTED_TOKEN_FILES = [
  "packages/theme/light.tokens.json",
  "packages/theme/dark.tokens.json",
  ...THEME_IDS.flatMap((id) => [
    `packages/theme/themes/${id}/light.tokens.json`,
    `packages/theme/themes/${id}/dark.tokens.json`,
  ]),
];

describe("per-appearance standalone .tokens.json distribution", () => {
  for (const rel of EMITTED_TOKEN_FILES) {
    test(`${rel}: valid DTCG 2025.10, self-contained, all aliases resolve in-file, all colors have 6-digit hex`, () => {
      const doc = readJson(rel) as Record<string, unknown>;
      expect(validateTokensDocument(doc)).toEqual([]);

      // Self-contained: no $ref, every {...} alias resolves within this file, every color has #rrggbb.
      const walk = (node: unknown, at: string) => {
        if (typeof node === "string") {
          const m = /^\{(.+)\}$/.exec(node);
          if (m) expect(() => lookupToken(doc, m[1]!)).not.toThrow();
          return;
        }
        if (Array.isArray(node)) {
          node.forEach((item, idx) => walk(item, `${at}[${idx}]`));
          return;
        }
        if (node !== null && typeof node === "object") {
          const rec = node as Record<string, unknown>;
          expect(Object.hasOwn(rec, "$ref"), `${at}.$ref`).toBe(false);
          if ("colorSpace" in rec && Array.isArray(rec.components)) {
            expect(typeof rec.hex, `${at}.hex`).toBe("string");
            expect(rec.hex as string, `${at}.hex`).toMatch(/^#[0-9a-f]{6}$/i);
          }
          for (const [k, v] of Object.entries(rec)) walk(v, at ? `${at}.${k}` : k);
        }
      };
      walk(doc, "");

      expect(validateTokensDocument(resolveAliases(doc))).toEqual([]);
    });
  }

  for (const themeId of THEME_IDS) {
    for (const appearance of ["light", "dark"] as const) {
      test(`${themeId} (${appearance}): matches compiled theme.json and semantics.json at pointer tier`, () => {
        const doc = readJson(
          `packages/theme/themes/${themeId}/${appearance}.tokens.json`,
        ) as Record<string, any>;
        const resolved = resolveAliases(doc) as Record<string, any>;
        const themeJson = readJson(`packages/theme/themes/${themeId}/theme.json`) as {
          cssVars: {
            theme: Record<string, string>;
            light: Record<string, string>;
            dark: Record<string, string>;
          };
        };
        const semanticsJson = readJson(`packages/theme/themes/${themeId}/semantics.json`) as Record<
          string,
          any
        >;

        if (themeId === "default") {
          expect(readText(`packages/theme/${appearance}.tokens.json`)).toBe(
            readText(`packages/theme/themes/default/${appearance}.tokens.json`),
          );
        }

        // Radii & font families in theme.json cssVars.theme
        for (const { cssVar, dtcg } of RADIUS_KEYS) {
          const dim = resolved.dimension.radius[dtcg].$value as { value: number; unit: string };
          expect(`${dim.value}${dim.unit}`).toBe(themeJson.cssVars.theme[cssVar]);
        }
        for (const [key, tok] of Object.entries(doc.font.family as Record<string, any>)) {
          if (key.startsWith("$")) continue;
          const v = tok.$value;
          expect(Array.isArray(v) ? v.join(", ") : String(v)).toBe(
            themeJson.cssVars.theme[`font-${key}`],
          );
        }

        // Colors in theme.json cssVars.theme (C-layer) and cssVars[appearance] (A/B-layer)
        const expectedColors: Record<string, string> = {};
        for (const [k, v] of Object.entries(themeJson.cssVars.theme)) {
          if (k === "radius" || k.startsWith("radius-") || k.startsWith("font-")) continue;
          expectedColors[k] = v;
        }
        Object.assign(expectedColors, themeJson.cssVars[appearance]);

        const docColorKeys = Object.keys(doc.color).filter((k) => !k.startsWith("$"));
        expect(docColorKeys.sort()).toEqual(Object.keys(expectedColors).sort());
        for (const key of docColorKeys) {
          const tok = doc.color[key] as Record<string, any>;
          const ext = tok.$extensions?.[EXT_NS] as Record<string, unknown> | undefined;
          let cssColor: string;
          if (ext?.colorOp) {
            cssColor = formatColorOpToCss(ext.colorOp as ColorOpExtension);
          } else if (typeof tok.$value === "string") {
            const m = /^\{color\.([a-z0-9-]+)\}$/.exec(tok.$value);
            cssColor = m ? `var(--${m[1]})` : tok.$value;
          } else {
            cssColor = formatDtcgColor(tok.$value as DtcgColor);
          }
          expect(cssColor, `color.${key}`).toBe(expectedColors[key]);
        }

        // Typography at pointer tier
        const rawFontFamily = doc.typography.$extensions?.[EXT_NS]?.fontFamily ?? null;
        const fontMatch =
          typeof rawFontFamily === "string"
            ? /^\{font\.family\.([a-z0-9-]+)\}$/.exec(rawFontFamily)
            : null;
        expect(fontMatch ? `{font-${fontMatch[1]}}` : rawFontFamily).toBe(
          semanticsJson.typography.fontFamily,
        );
        for (const role of TYPE_ROLES) {
          const val = resolved.typography[role].$value as DtcgTypography;
          expect((val.fontSize as { value: number }).value).toBe(
            semanticsJson.typography[role].fontSize.pointer,
          );
          expect(val.lineHeight).toBe(semanticsJson.typography[role].lineHeight.pointer);
          expect(val.fontWeight).toBe(semanticsJson.typography[role].fontWeight);
          expect(val.letterSpacing.value).toBe(semanticsJson.typography[role].letterSpacing);
        }

        // Dimension: shape, size (pointer tier), stroke, focus, icon (pointer tier)
        for (const role of SHAPE_ROLES) {
          const ref = doc.dimension.shape[role].$value as string;
          const m = /^\{dimension\.radius\.([a-z0-9-]+)\}$/.exec(ref)!;
          expect(`{radius-${m[1]}}`).toBe(semanticsJson.dimension.shape[role]);
        }
        expect(resolved.dimension.size.hit.$value.value).toBe(
          semanticsJson.dimension.size.hit.pointer,
        );
        for (const section of ["density", "height"] as const) {
          for (const [k, tok] of Object.entries(
            resolved.dimension.size[section] as Record<string, any>,
          )) {
            if (k.startsWith("$")) continue;
            expect(tok.$value.value).toBe(semanticsJson.dimension.size[section].pointer[k]);
          }
        }
        for (const [k, tok] of Object.entries(
          resolved.dimension.size.control as Record<string, any>,
        )) {
          if (k.startsWith("$")) continue;
          expect(tok.$value.value).toBe(semanticsJson.dimension.size.control.pointer[k]);
        }
        expect(doc.dimension.size.control.$extensions[EXT_NS].switch).toBe(
          semanticsJson.dimension.size.control.pointer.switch,
        );
        for (const [k, tok] of Object.entries(resolved.dimension.stroke as Record<string, any>)) {
          if (k.startsWith("$")) continue;
          expect(tok.$value.value).toBe(semanticsJson.dimension.stroke[k]);
        }
        expect(doc.dimension.focus.$extensions[EXT_NS].style).toBe(
          semanticsJson.dimension.focus.style,
        );
        expect(resolved.dimension.focus.width.$value.value).toBe(
          semanticsJson.dimension.focus.width,
        );
        expect(resolved.dimension.focus.offset.$value.value).toBe(
          semanticsJson.dimension.focus.offset,
        );
        for (const [k, tok] of Object.entries(resolved.dimension.icon as Record<string, any>)) {
          if (k.startsWith("$")) continue;
          expect(tok.$value.value).toBe(semanticsJson.dimension.icon.pointer[k]);
        }

        // Shape, state, duration, transition, motion, controls
        expect(doc.shape.$extensions[EXT_NS]).toEqual(semanticsJson.shape);
        expect(doc.state["press-scale"].$value).toBe(semanticsJson.state["press-scale"]);
        expect(doc.state["pressed-opacity"].$value).toBe(semanticsJson.state["pressed-opacity"]);
        expect(doc.state["accent-pressed-opacity"].$value).toBe(
          semanticsJson.state["accent-pressed-opacity"],
        );
        expect(doc.state.$extensions[EXT_NS].ripple).toBe(semanticsJson.state.ripple);
        for (const [k, tok] of Object.entries(doc.state.overlay as Record<string, any>)) {
          if (k.startsWith("$")) continue;
          expect(tok.$value).toBe(semanticsJson.state.overlay[k]);
        }
        for (const [k, tok] of Object.entries(doc.state.disabled as Record<string, any>)) {
          if (k.startsWith("$")) continue;
          expect(tok.$value).toBe(semanticsJson.state.disabled[k]);
        }
        expect(doc.state.disabled.$extensions[EXT_NS].fill).toBe(semanticsJson.state.disabled.fill);
        expect(doc.duration.shake.$value.value).toBe(semanticsJson.duration.shake);

        const bezierNameOf = (tf: [number, number, number, number], ref: string) => {
          const name = /^\{cubicBezier\.([a-z0-9-]+)\}$/.exec(ref)?.[1];
          const nsh = name ? doc.cubicBezier[name]?.$extensions?.[EXT_NS]?.nshEasing : undefined;
          if (nsh) return nsh as string;
          return Object.entries(NAMED_CUBIC_BEZIERS).find(([, spec]) =>
            spec.value.every((v, i) => Math.abs(v - tf[i]!) < 1e-6),
          )?.[0];
        };

        const enterResolved = resolved.transition.enter.$value as DtcgTransition;
        expect({
          duration: enterResolved.duration.value,
          timingFunction: bezierNameOf(
            enterResolved.timingFunction as [number, number, number, number],
            doc.transition.enter.$value.timingFunction,
          ),
        }).toEqual(semanticsJson.transition.enter);

        for (const role of ["press", "settle", "control", "move"] as const) {
          const spring = doc.motion[role].$extensions?.[EXT_NS]?.spring;
          if (spring) {
            expect(spring).toEqual(semanticsJson.motion[role]);
          } else {
            const tVal = resolved.motion[role].timing.$value as DtcgTransition;
            expect({
              duration: tVal.duration.value,
              timingFunction: bezierNameOf(
                tVal.timingFunction as [number, number, number, number],
                doc.motion[role].timing.$value.timingFunction,
              ),
            }).toEqual(semanticsJson.motion[role]);
          }
        }
        expect(doc.controls.$extensions[EXT_NS].preset).toBe(semanticsJson.controls);

        // Merged finishes for this appearance
        const toFlatRef = (s: string) => {
          const m = /^\{color\.([a-z0-9-]+)\}$/.exec(s);
          return m ? `{${m[1]}}` : s;
        };
        const toFinishColor = (tok: Record<string, any>) => {
          const ext = tok.$extensions?.[EXT_NS] as Record<string, unknown> | undefined;
          if (ext?.transparentKeyword) return "transparent";
          if (ext?.colorOp) return formatColorOpToCss(ext.colorOp as ColorOpExtension);
          return typeof tok.$value === "string"
            ? toFlatRef(tok.$value)
            : formatDtcgColor(tok.$value as DtcgColor);
        };
        const mergedFinishes = mergeFinishes(semanticsJson.finishes, appearance);
        const docFinishRoles = Object.keys(doc.finish).filter((k) => !k.startsWith("$"));
        expect(docFinishRoles.sort()).toEqual(Object.keys(mergedFinishes).sort());
        for (const role of docFinishRoles) {
          const g = doc.finish[role] as Record<string, any>;
          const compiled: Record<string, unknown> = {};
          if (g.background) compiled.background = toFinishColor(g.background);
          if (g.gradient) {
            const gExt = g.gradient.$extensions?.[EXT_NS];
            const angle = (gExt?.angle as number | undefined) ?? 180;
            const tStops = new Set<number>((gExt?.transparentStops as number[] | undefined) ?? []);
            const stops = (g.gradient.$value as DtcgGradientStop[]).map((s, idx) => {
              const col = tStops.has(idx)
                ? "transparent"
                : typeof s.color === "string"
                  ? toFlatRef(s.color)
                  : formatDtcgColor(s.color);
              return `${col} ${Math.round(s.position * 10000) / 100}%`;
            });
            compiled.gradient = `linear-gradient(${angle}deg, ${stops.join(", ")})`;
          }
          if (g.shadow) {
            if (g.shadow.$extensions?.[EXT_NS]?.none) {
              compiled.shadow = "none";
            } else {
              const raw = g.shadow.$value;
              const items = (Array.isArray(raw) ? raw : [raw]) as DtcgShadowItem[];
              compiled.shadow = items
                .map((s) => {
                  const fmtLen = (d: { value: number; unit: string }) =>
                    d.value === 0 ? "0" : `${d.value}${d.unit}`;
                  const parts: string[] = [];
                  if (s.inset) parts.push("inset");
                  parts.push(fmtLen(s.offsetX), fmtLen(s.offsetY), fmtLen(s.blur));
                  if (s.spread.value !== 0) parts.push(fmtLen(s.spread));
                  parts.push(
                    typeof s.color === "string" ? toFlatRef(s.color) : formatDtcgColor(s.color),
                  );
                  return parts.join(" ");
                })
                .join(", ");
            }
          }
          if (g["border-color"]) compiled["border-color"] = toFinishColor(g["border-color"]);
          if (g["border-top-color"])
            compiled["border-top-color"] = toFinishColor(g["border-top-color"]);
          if (g["border-bottom-color"])
            compiled["border-bottom-color"] = toFinishColor(g["border-bottom-color"]);
          if (g.foreground) compiled.foreground = toFinishColor(g.foreground);
          const gExt = g.$extensions?.[EXT_NS];
          if (gExt && "backdropFilter" in gExt) compiled.backdropFilter = gExt.backdropFilter;
          if (gExt && "material" in gExt) {
            const mat = structuredClone(gExt.material);
            if (mat?.apple && typeof mat.apple.tint === "string") {
              mat.apple.tint = toFlatRef(mat.apple.tint);
            }
            if (mat?.android?.ripple && typeof mat.android.ripple.color === "string") {
              mat.android.ripple.color = toFlatRef(mat.android.ripple.color);
            }
            compiled.material = mat;
          }
          expect(compiled, `finish.${role}`).toEqual(mergedFinishes[role]);
        }
      });
    }
  }
});

const DESIGN_MD_FILES = [
  "packages/theme/DESIGN.md",
  ...THEME_IDS.map((id) => `packages/theme/themes/${id}/DESIGN.md`),
];

function extractFrontmatterYaml(markdown: string): Record<string, any> {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  if (!m) throw new Error("DESIGN.md is missing YAML front matter");
  return Bun.YAML.parse(m[1]!) as Record<string, any>;
}

describe("generated DESIGN.md validation and compiled equality", () => {
  test("packages/theme/DESIGN.md matches packages/theme/themes/default/DESIGN.md byte for byte", () => {
    expect(readText("packages/theme/DESIGN.md")).toBe(
      readText("packages/theme/themes/default/DESIGN.md"),
    );
  });

  for (const rel of DESIGN_MD_FILES) {
    test(`${rel}: passes @google/design.md linter with 0 errors and valid section order`, () => {
      const text = readText(rel);
      const report = lint(text);
      const errors = report.findings.filter((f) => f.severity === "error");
      expect(errors).toEqual([]);
      expect(report.summary.errors).toBe(0);
      expect(report.findings.some((f) => f.rule === "broken-ref")).toBe(false);
      expect(report.findings.some((f) => f.rule === "section-order")).toBe(false);
    });
  }

  for (const themeId of THEME_IDS) {
    test(`${themeId}: DESIGN.md YAML matches compiled pointer-tier light & dark theme values`, () => {
      const resolver = readJson(`packages/theme/tokens/themes/${themeId}/theme.resolver.json`) as {
        name: string;
        description: string;
      };
      const yaml = extractFrontmatterYaml(readText(`packages/theme/themes/${themeId}/DESIGN.md`));
      const lightDoc = resolveAliases(
        readJson(`packages/theme/themes/${themeId}/light.tokens.json`),
      ) as Record<string, any>;
      const darkDoc = resolveAliases(
        readJson(`packages/theme/themes/${themeId}/dark.tokens.json`),
      ) as Record<string, any>;

      expect(yaml.version).toBe("alpha");
      expect(yaml.name).toBe(resolver.name);
      expect(yaml.description).toBe(resolver.description);

      // Colors: every color in light/dark compiled trees must match its DESIGN.md hex entry
      const colorNames = Object.keys(lightDoc.color).filter((k) => !k.startsWith("$"));
      const flatYamlColors = new Map<string, string>();
      for (const [k, v] of Object.entries(yaml.colors as Record<string, unknown>)) {
        if (k === "light" || k === "dark") continue;
        flatYamlColors.set(k, v as string);
      }
      for (const name of colorNames) {
        const expectedLight = dtcgColorToHex(lightDoc.color[name].$value as DtcgColor);
        const expectedDark = dtcgColorToHex(darkDoc.color[name].$value as DtcgColor);
        if (flatYamlColors.has(name)) {
          expect(flatYamlColors.get(name), `color.${name}`).toBe(expectedLight);
          expect(expectedLight, `color.${name} mode invariance`).toBe(expectedDark);
        } else {
          expect(yaml.colors.light[name], `colors.light.${name}`).toBe(expectedLight);
          expect(yaml.colors.dark[name], `colors.dark.${name}`).toBe(expectedDark);
        }
      }

      // Typography (pointer tier)
      for (const role of TYPE_ROLES) {
        const expected = lightDoc.typography[role].$value as DtcgTypography;
        const expectedFamily = Array.isArray(expected.fontFamily)
          ? expected.fontFamily.join(", ")
          : String(expected.fontFamily);
        const expectedSize = expected.fontSize as { value: number; unit: string };
        expect(yaml.typography[role]).toEqual({
          fontFamily: expectedFamily,
          fontSize: `${expectedSize.value}${expectedSize.unit}`,
          fontWeight: expected.fontWeight,
          lineHeight: expected.lineHeight,
          letterSpacing: `${expected.letterSpacing.value}${expected.letterSpacing.unit}`,
        });
      }

      // Rounded (semantic shape roles)
      for (const role of SHAPE_ROLES) {
        const dim = lightDoc.dimension.shape[role].$value as { value: number; unit: string };
        expect(yaml.rounded[role], `rounded.${role}`).toBe(`${dim.value}${dim.unit}`);
      }

      // Spacing (pointer tier dimension.size, stroke, focus, icon)
      const hit = lightDoc.dimension.size.hit.$value as { value: number; unit: string };
      expect(yaml.spacing.hit).toBe(`${hit.value}${hit.unit}`);
      for (const sub of ["density", "control", "height"] as const) {
        for (const [k, tok] of Object.entries(
          lightDoc.dimension.size[sub] as Record<string, any>,
        )) {
          if (k.startsWith("$") || !tok?.$value) continue;
          expect(yaml.spacing[sub][k], `spacing.${sub}.${k}`).toBe(
            `${tok.$value.value}${tok.$value.unit}`,
          );
        }
      }
      for (const sub of ["stroke", "focus", "icon"] as const) {
        for (const [k, tok] of Object.entries(lightDoc.dimension[sub] as Record<string, any>)) {
          if (k.startsWith("$") || !tok?.$value) continue;
          expect(yaml.spacing[sub][k], `spacing.${sub}.${k}`).toBe(
            `${tok.$value.value}${tok.$value.unit}`,
          );
        }
      }

      // Motion (timing transitions & shake duration)
      const enter = lightDoc.transition.enter.$value as DtcgTransition;
      expect(yaml.motion.enter).toEqual({
        duration: `${enter.duration.value}${enter.duration.unit}`,
        delay: `${enter.delay.value}${enter.delay.unit}`,
        timingFunction: `cubic-bezier(${(enter.timingFunction as number[]).join(", ")})`,
      });
      expect(yaml.motion.shake).toEqual({
        duration: `${lightDoc.duration.shake.$value.value}${lightDoc.duration.shake.$value.unit}`,
      });
      for (const role of ["press", "settle", "control", "move"] as const) {
        const timingTok = lightDoc.motion[role]?.timing;
        if (timingTok) {
          const val = timingTok.$value as DtcgTransition;
          expect(yaml.motion[role]).toEqual({
            duration: `${val.duration.value}${val.duration.unit}`,
            delay: `${val.delay.value}${val.delay.unit}`,
            timingFunction: `cubic-bezier(${(val.timingFunction as number[]).join(", ")})`,
          });
        } else {
          expect(yaml.motion[role]).toBeUndefined();
        }
      }

      // Components: verify every component reference resolves to the exact compiled light/pointer value
      const parsed = lint(readText(`packages/theme/themes/${themeId}/DESIGN.md`)).designSystem;
      expect(parsed.components.size).toBeGreaterThan(0);
      for (const [compName, comp] of parsed.components) {
        expect(comp.unresolvedRefs, `${themeId}.components.${compName}`).toEqual([]);
        const roundedProp = comp.properties.get("rounded");
        if (roundedProp && typeof roundedProp === "object" && roundedProp.type === "dimension") {
          const rawRef = yaml.components[compName]?.rounded as string | undefined;
          const m = rawRef ? /^\{rounded\.([a-z0-9-]+)\}$/.exec(rawRef) : null;
          if (m) {
            const expectedDim = lightDoc.dimension.shape[m[1]!].$value as {
              value: number;
              unit: string;
            };
            expect(`${roundedProp.value}${roundedProp.unit}`).toBe(
              `${expectedDim.value}${expectedDim.unit}`,
            );
          }
        }
        const bgProp = comp.properties.get("backgroundColor");
        if (bgProp && typeof bgProp === "object" && bgProp.type === "color") {
          const rawRef = yaml.components[compName]?.backgroundColor as string | undefined;
          const m = rawRef ? /^\{colors\.(?:light\.)?([a-z0-9-]+)\}$/.exec(rawRef) : null;
          if (m) {
            expect(bgProp.hex.toLowerCase()).toBe(
              dtcgColorToHex(lightDoc.color[m[1]!].$value as DtcgColor),
            );
          }
        }
      }
    });
  }
});
