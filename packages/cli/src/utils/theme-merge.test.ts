import { describe, expect, test } from "bun:test";

import { mergeTheme } from "./theme-merge";

describe("mergeTheme", () => {
  test("adds missing keys at any depth and keeps existing values", () => {
    const existing = {
      name: "mine",
      cssVars: { theme: { radius: "1rem" }, light: { primary: "oklch(0.4 0.1 250)" } },
    };
    const incoming = {
      name: "shadcn-nsh",
      cssVars: {
        theme: { radius: "0.625rem" },
        light: {
          primary: "oklch(0.2 0 0)",
          "custom-shadow-ink": "oklch(0.1686 0.0226 263.69)",
          "custom-backdrop": "oklch(0 0 0 / 0.4)",
        },
        dark: { "custom-backdrop": "oklch(0 0 0 / 0.4)" },
      },
    };
    const { theme, added } = mergeTheme(existing, incoming);
    expect(theme).toEqual({
      name: "mine",
      cssVars: {
        theme: { radius: "1rem" },
        light: {
          primary: "oklch(0.4 0.1 250)",
          "custom-shadow-ink": "oklch(0.1686 0.0226 263.69)",
          "custom-backdrop": "oklch(0 0 0 / 0.4)",
        },
        dark: { "custom-backdrop": "oklch(0 0 0 / 0.4)" },
      },
    });
    expect(added).toBe(3);
  });

  test("changes nothing when the app already has every key", () => {
    const theme = { cssVars: { theme: { radius: "1rem" } } };
    expect(mergeTheme(theme, theme)).toEqual({ theme, added: 0 });
  });
});
