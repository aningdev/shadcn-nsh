import { describe, expect, test } from "bun:test";

import { themeScope } from "../port/affected";
import {
  classifyChanges,
  contractMoves,
  contractSources,
  decisionRecords,
  flatten,
  gateVerdict,
  keyKind,
  type ContractSource,
  type Flat,
  type ThemeChange,
  type ThemeDiff,
} from "./diff";

const theme = {
  cssVars: {
    theme: {
      background: "oklch(1 0 0)",
      primary: "oklch(0.2 0 0)",
      radius: "0.625rem",
      "font-sans": "Inter",
    },
    light: {},
    dark: {},
  },
};

const flat = (entries: [string, string][]): Flat => new Map(entries);

describe("keyKind", () => {
  test("a colour role is a colour; a dimension or font token sharing the prefix is a value", () => {
    expect(keyKind("color.background", theme)).toBe("colour");
    expect(keyKind("color.radius", theme)).toBe("value");
    expect(keyKind("color.font-sans", theme)).toBe("value");
  });

  test("a finish field is a colour only when it paints one", () => {
    expect(keyKind("finish.card.background", theme)).toBe("colour");
    expect(keyKind("finish.card.gradient", theme)).toBe("colour");
    expect(keyKind("finish.card.shadow", theme)).toBe("value");
    expect(keyKind("dimension.control.md", theme)).toBe("value");
  });
});

describe("flatten", () => {
  test("resolves a var, a token reference and a relative colour in both appearances", () => {
    const css = {
      cssVars: {
        theme: { card: "oklch(1 0 0)" },
        light: { background: "oklch(0.5 0 0)", foreground: "oklch(0 0 0)" },
        dark: { background: "oklch(0.2 0 0)" },
      },
    };
    const semantics = {
      finishes: {
        shared: { menu: { background: "{card}", borderColor: "oklch(from {card} l c h / 0.8)" } },
        light: {},
        dark: {},
      },
      dimension: { control: { md: "32px" } },
    };

    const light = flatten(css, semantics, "light");
    expect(light.get("color.background")).toBe("oklch(0.5 0 0)");
    expect(light.get("finish.menu.background")).toBe("oklch(1 0 0)");
    expect(light.get("finish.menu.borderColor")).toBe("alpha(oklch(1 0 0), 0.8)");
    expect(light.get("dimension.control.md")).toBe("32px");

    expect(flatten(css, semantics, "dark").get("color.background")).toBe("oklch(0.2 0 0)");
  });
});

describe("classifyChanges", () => {
  test("a changed colour, an unchanged value and an added key", () => {
    const before = flat([
      ["color.primary", "oklch(0.2 0 0)"],
      ["dimension.control.md", "32px"],
    ]);
    const after = flat([
      ["color.primary", "oklch(0.4 0 0)"],
      ["dimension.control.md", "32px"],
      ["color.background", "oklch(1 0 0)"],
    ]);
    const changes = classifyChanges(before, after, theme);
    expect(changes).toEqual([
      { key: "color.primary", kind: "colour", before: "oklch(0.2 0 0)", after: "oklch(0.4 0 0)" },
      { key: "color.background", kind: "contract", after: "oklch(1 0 0)" },
    ]);
  });

  test("a changed dimension is a value", () => {
    const before = flat([["dimension.control.md", "32px"]]);
    const after = flat([["dimension.control.md", "36px"]]);
    expect(classifyChanges(before, after, theme)).toEqual([
      { key: "dimension.control.md", kind: "value", before: "32px", after: "36px" },
    ]);
  });
});

describe("contractSources", () => {
  test("the base tokens, the theme package's code, the material allow-lists and the build", () => {
    const sources = contractSources([
      "packages/theme/tokens/base/color.tokens.json",
      "packages/theme/theme.ts",
      "packages/theme/materials.ts",
      "scripts/theme/material.ts",
      "scripts/tokens/build.ts",
      "packages/theme/themes/shadcn/theme.json",
      "packages/theme/README.md",
    ]);
    expect(sources.map(({ file }) => file)).toEqual([
      "packages/theme/tokens/base/color.tokens.json",
      "packages/theme/theme.ts",
      "packages/theme/materials.ts",
      "scripts/theme/material.ts",
      "scripts/tokens/build.ts",
    ]);
  });
});

describe("themeScope", () => {
  const pool = ["shadcn", "solid-glass", "apple", "material", "winui"];

  test("a colour alone moves no page, and names the value checks", () => {
    const scope = themeScope({ shadcn: ["colour"] }, [], pool);
    expect(scope.ids).toBe("none");
    expect(scope.themes).toEqual([]);
    expect(scope.why.join(" ")).toContain("theme:diff");
  });

  test("a value moves every page in the themes that carry it", () => {
    expect(themeScope({ shadcn: ["value"], apple: ["colour"] }, [], pool)).toEqual({
      ids: "all",
      themes: ["shadcn"],
      why: ["shadcn: a dimension, type, shadow, material, state, motion or opacity changed"],
    });
  });

  test("a value in a theme the pass does not draw moves nothing", () => {
    const scope = themeScope({ default: ["value"] }, [], pool);
    expect(scope.ids).toBe("none");
    expect(scope.themes).toEqual([]);
    expect(scope.why.join(" ")).toContain("default");
  });

  test("an added or removed key moves every page in every theme", () => {
    const scope = themeScope({ material: ["contract"] }, [], pool);
    expect(scope.ids).toBe("all");
    expect(scope.themes).toEqual(pool);
    expect(scope.why.join(" ")).toContain("keys added or removed in material");
  });

  test("a changed source outside the values moves every page in every theme", () => {
    const scope = themeScope({}, ["packages/theme/theme.ts (the theme's reader)"], pool);
    expect(scope.ids).toBe("all");
    expect(scope.themes).toEqual(pool);
  });

  test("nothing changed moves nothing", () => {
    expect(themeScope({}, [], pool)).toEqual({ ids: "none", themes: [], why: [] });
  });
});

describe("contractMoves", () => {
  const diffOf = (
    themes: Record<string, ThemeChange> = {},
    contract: ContractSource[] = [],
  ): ThemeDiff => ({ ref: "origin/main", base: "abcdef", files: [], contract, themes });

  test("a shared source and an added key, named by theme and mode", () => {
    const theme: ThemeChange = {
      id: "default",
      kinds: ["contract"],
      modes: {
        light: [{ key: "color.fill", kind: "contract", after: "oklch(1 0 0)" }],
        dark: [{ key: "color.mark", kind: "contract" }],
      },
    };
    expect(
      contractMoves(
        diffOf({ default: theme }, [
          { file: "packages/theme/theme.ts", why: "the theme's reader" },
        ]),
      ),
    ).toEqual([
      { where: "packages/theme/theme.ts", what: "the theme's reader" },
      { where: "default light", what: "+ color.fill" },
      { where: "default dark", what: "- color.mark" },
    ]);
  });

  test("a value change alone is not the contract", () => {
    const theme: ThemeChange = {
      id: "apple",
      kinds: ["value"],
      modes: {
        light: [{ key: "color.primary", kind: "value", before: "a", after: "b" }],
        dark: [],
      },
    };
    expect(contractMoves(diffOf({ apple: theme }))).toEqual([]);
  });
});

describe("gateVerdict", () => {
  const diffOf = (themes: Record<string, ThemeChange> = {}): ThemeDiff => ({
    ref: "origin/main",
    base: "abcdef",
    files: [],
    contract: [],
    themes,
  });
  const added: ThemeChange = {
    id: "default",
    kinds: ["contract"],
    modes: { light: [{ key: "color.fill", kind: "contract" }], dark: [] },
  };

  test("only the decision records a branch adds count", () => {
    expect(
      decisionRecords([
        "docs/decisions/0005-fill-layer.md",
        "docs/decisions/README.md",
        "docs/specs/native-themes.md",
        "packages/ui/button.tsx",
      ]),
    ).toEqual(["docs/decisions/0005-fill-layer.md"]);
  });

  test("nothing moved passes", () => {
    expect(gateVerdict(diffOf(), []).passed).toBe(true);
  });

  test("a key without a record fails, with the record passes", () => {
    expect(gateVerdict(diffOf({ default: added }), []).passed).toBe(false);
    expect(
      gateVerdict(diffOf({ default: added }), ["docs/decisions/0004-theme-contract-freeze.md"])
        .passed,
    ).toBe(true);
  });
});
