import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

import { compileOptionBSemantics, compileThemeJson, toLegacySemantics } from "./compile";
import { resolvePermutation } from "./resolver";
import { validateResolverDocument, validateTokensDocument } from "./schema-validate";

const root = path.join(import.meta.dir, "..", "..");
const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

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
      const errors = validateTokensDocument(readJson(file));
      expect(errors).toEqual([]);
    });
  }

  test(`validates ${RESOLVER_PATH} against official 2025.10 resolver.json`, () => {
    const errors = validateResolverDocument(readJson(RESOLVER_PATH));
    expect(errors).toEqual([]);
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

describe("DTCG 2025.10 resolver & round-trip spike (default theme)", () => {
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

  test("compiled theme.json deep-equals packages/theme/theme.json", () => {
    const compiled = compileThemeJson(path.join(root, RESOLVER_PATH));
    const current = readJson("packages/theme/theme.json");
    expect(compiled).toEqual(current);
  });

  test("compiled Option (b) semantics uses DTCG names and deep-equals packages/theme/semantics.json after documented mapping", () => {
    const optionB = compileOptionBSemantics(path.join(root, RESOLVER_PATH));

    // Verify Option (b) artifact uses DTCG field names directly
    expect(optionB.typography.roles.body).toEqual({
      fontSize: { pointer: 13, touch: 15 },
      lineHeight: { pointer: 19 / 13, touch: 21 / 15 },
      fontWeight: 400,
      letterSpacing: 0,
    });
    expect(optionB.motion.enter).toMatchObject({
      duration: 420,
      delay: 0,
      timingFunction: [0.333333, 1, 0.666667, 1],
    });
    expect(optionB.finishes.shared.card?.gradient).toBeDefined();

    const projected = toLegacySemantics(optionB);
    const current = readJson("packages/theme/semantics.json");
    expect(projected).toEqual(current);
  });
});
