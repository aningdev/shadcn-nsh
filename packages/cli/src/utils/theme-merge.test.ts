import { describe, expect, test } from "bun:test";

import { mergeTheme } from "./theme-merge";

describe("mergeTheme", () => {
  test("adds missing keys at any depth and keeps existing values", () => {
    const existing = {
      name: "mine",
      cssVars: { theme: { radius: "1rem" }, light: { primary: "#3366ff" } },
    };
    const incoming = {
      name: "gallery",
      cssVars: {
        theme: { radius: "10px", "radius-card": "12px", scrim: "rgba(0,0,0,0.45)" },
        light: {
          primary: "#c6ef6a",
          brand: "#c6ef6a",
          inset: "#f0f1f4",
        },
        dark: { brand: "#c6ef6a" },
      },
    };
    const { theme, added, missing } = mergeTheme(existing, incoming);
    expect(theme).toEqual({
      name: "mine",
      cssVars: {
        theme: { radius: "1rem", "radius-card": "12px", scrim: "rgba(0,0,0,0.45)" },
        light: {
          primary: "#3366ff",
          brand: "#c6ef6a",
          inset: "#f0f1f4",
        },
        dark: { brand: "#c6ef6a" },
      },
    });
    expect(added).toBe(5);
    expect(missing).toEqual([
      "cssVars.theme.radius-card",
      "cssVars.theme.scrim",
      "cssVars.light.brand",
      "cssVars.light.inset",
      "cssVars.dark",
    ]);
  });

  test("changes nothing when the app already has every key", () => {
    const theme = { cssVars: { theme: { radius: "1rem", scrim: "rgba(0,0,0,0.45)" } } };
    expect(mergeTheme(theme, theme)).toEqual({ theme, added: 0, missing: [] });
  });
});
