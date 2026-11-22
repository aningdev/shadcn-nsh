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

  test("merges semantics.json: adds missing style keys, finish roles, and finish fields while keeping app values", () => {
    const existing = {
      typography: { fontFamily: "{font-sans}" },
      state: { "press-scale": 1, "pressed-opacity": 0.8 },
      finishes: {
        shared: {
          card: {
            gradient: "linear-gradient(180deg, {card} 0%, {card} 100%)",
          },
        },
        light: {
          card: { shadow: "none" },
        },
        dark: {},
      },
    };
    const incoming = {
      typography: { fontFamily: null },
      state: { "press-scale": 0.97, "pressed-opacity": 0.7 },
      controls: "base",
      finishes: {
        shared: {
          card: {
            gradient: "linear-gradient(180deg, {popover} 0%, {popover} 100%)",
            material: null,
          },
          dialog: {
            background: "{card}",
            "border-color": "{border}",
            material: null,
          },
        },
        light: {
          card: { shadow: "0 1px 0 oklch(0 0 0 / 0.04)" },
          dialog: { shadow: "0 12px 28px -10px oklch(0 0 0 / 0.22)" },
        },
        dark: {
          card: { shadow: "0 1px 0 oklch(0 0 0 / 0.35)" },
          dialog: { shadow: "0 16px 32px -10px oklch(0 0 0 / 0.6)" },
        },
      },
    };
    const { theme, added, missing } = mergeTheme(existing, incoming);
    expect(theme).toEqual({
      typography: { fontFamily: "{font-sans}" },
      state: { "press-scale": 1, "pressed-opacity": 0.8 },
      controls: "base",
      finishes: {
        shared: {
          card: {
            gradient: "linear-gradient(180deg, {card} 0%, {card} 100%)",
            material: null,
          },
          dialog: {
            background: "{card}",
            "border-color": "{border}",
            material: null,
          },
        },
        light: {
          card: { shadow: "none" },
          dialog: { shadow: "0 12px 28px -10px oklch(0 0 0 / 0.22)" },
        },
        dark: {
          card: { shadow: "0 1px 0 oklch(0 0 0 / 0.35)" },
          dialog: { shadow: "0 16px 32px -10px oklch(0 0 0 / 0.6)" },
        },
      },
    });
    expect(added).toBe(6);
    expect(missing).toEqual([
      "controls",
      "finishes.shared.card.material",
      "finishes.shared.dialog",
      "finishes.light.dialog",
      "finishes.dark.card",
      "finishes.dark.dialog",
    ]);
  });
});
