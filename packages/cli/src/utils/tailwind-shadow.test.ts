import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { shadowedThemeTokens, shadowedTokens, warnShadowedTokens } from "./tailwind-shadow";

let current: Fixture | undefined;

afterEach(() => {
  current?.remove();
  current = undefined;
});

/** A fixture app whose `nsh.json` is `nsh` — as text, so a test can leave comments in it. */
function appWith(nsh: string, files: Record<string, string> = {}): string {
  current = makeFixture({ items: [], files: { ...files, "nsh.json": nsh } });
  return current.app;
}

const json = (value: unknown): string => JSON.stringify(value);

/** Write a file under the fixture root, outside the app, for a monorepo's apps and packages. */
function writeInRoot(fixture: Fixture, relative: string, content: string): void {
  const file = path.join(fixture.root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

describe("shadowedTokens", () => {
  test("nothing when the app writes no tailwind colors", () => {
    expect(shadowedTokens(["primary", "border"], undefined)).toEqual([]);
    expect(shadowedTokens(["primary", "border"], {})).toEqual([]);
  });

  test("nothing when the colors shadow no token", () => {
    expect(shadowedTokens(["primary"], { danger: "#f00", success: "#0f0" })).toEqual([]);
  });

  test("one name", () => {
    expect(shadowedTokens(["primary", "border"], { primary: "oklch(0.6 0.2 20)" })).toEqual([
      "primary",
    ]);
  });

  test("several names, in the app's order", () => {
    expect(
      shadowedTokens(["primary", "border", "ring"], {
        ring: "#111",
        border: "#222",
        primary: "#333",
      }),
    ).toEqual(["ring", "border", "primary"]);
  });

  test("a shade names no token: only the top-level name is compared", () => {
    expect(
      shadowedTokens(["brand", "primary"], { brand: { 500: "#f00" }, primary500: "#0f0" }),
    ).toEqual(["brand"]);
  });

  test("a colors value that is no object shadows nothing", () => {
    expect(shadowedTokens(["primary"], ["primary"])).toEqual([]);
    expect(shadowedTokens(["primary"], "primary")).toEqual([]);
  });
});

describe("shadowedThemeTokens", () => {
  test("the theme file nsh.json names, read with comments in it", async () => {
    const app = appWith(
      `{
        // a comment the app may have left
        "theme": "./theme.json",
        "tailwind": { "colors": { "primary": "#f00", "danger": "#0f0" } },
      }`,
      {
        "theme.json": `{
          "cssVars": {
            "theme": { "radius": "0.5rem" },
            "light": { "primary": "oklch(0.5 0.1 20)", "border": "#eee" },
            "dark": { "primary": "oklch(0.8 0.1 20)" },
          },
        }`,
      },
    );
    expect(await shadowedThemeTokens(app)).toEqual(["primary"]);
  });

  test("the theme written in nsh.json itself", async () => {
    const app = appWith(
      json({
        theme: { cssVars: { theme: {}, light: { border: "#eee" }, dark: {} } },
        tailwind: { colors: { border: "#f00", primary: "#00f" } },
      }),
    );
    expect(await shadowedThemeTokens(app)).toEqual(["border"]);
  });

  test("a theme value NSH cannot read defines no token", async () => {
    const app = appWith(
      json({
        theme: { cssVars: { theme: {}, light: { primary: null, border: { $value: "#eee" } } } },
        tailwind: { colors: { primary: "#f00", border: "#0f0" } },
      }),
    );
    expect(await shadowedThemeTokens(app)).toEqual([]);
  });

  test("nothing when nsh.json has no tailwind, colors or theme", async () => {
    expect(await shadowedThemeTokens(appWith(json({ name: "t" })))).toEqual([]);
    expect(
      await shadowedThemeTokens(appWith(json({ tailwind: { colors: { primary: "#f00" } } }))),
    ).toEqual([]);
    expect(await shadowedThemeTokens(appWith(json({ theme: "./missing.json" })))).toEqual([]);
  });
});

describe("warnShadowedTokens", () => {
  test("one line naming the tokens and the docs, on stderr", async () => {
    const app = appWith(
      json({
        theme: { cssVars: { light: { primary: "#111", border: "#222" } } },
        tailwind: { colors: { primary: "#f00", border: "#0f0" } },
      }),
    );
    const out = await captured(() => warnShadowedTokens(app));
    expect(out.lines).toEqual([]);
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0]).toContain(
      "shadcn-nsh: nsh.json's tailwind.colors shadows the theme tokens primary, border",
    );
    expect(out.errors[0]).toContain(
      "https://shadcn-nsh.aning.dev/docs/theme#override-from-nshjson",
    );
  });

  test("nothing when the app's colors shadow no token", async () => {
    const app = appWith(
      json({
        theme: { cssVars: { light: { primary: "#111" } } },
        tailwind: { colors: { danger: "#f00" } },
      }),
    );
    const out = await captured(() => warnShadowedTokens(app));
    expect(out.errors).toEqual([]);
  });

  test("nothing when nsh.json is missing or broken", async () => {
    current = makeFixture({ items: [] });
    expect((await captured(() => warnShadowedTokens(current!.root))).errors).toEqual([]);

    const app = appWith('{ "tailwind": { "colors": { "primary": "#f00" } }');
    const out = await captured(() => warnShadowedTokens(app));
    expect(out.errors).toEqual([]);
  });

  test("a monorepo's apps each get their line, the path saying which", async () => {
    current = makeFixture({ items: [] });
    writeInRoot(current, "packages/ui/nsh-ui.json", json({}));
    writeInRoot(
      current,
      "apps/web/nsh.json",
      json({
        theme: { cssVars: { light: { primary: "#111" } } },
        tailwind: { colors: { primary: "#f00" } },
      }),
    );
    writeInRoot(
      current,
      "apps/desk/nsh.json",
      json({
        theme: { cssVars: { light: { primary: "#111" } } },
        tailwind: { colors: { danger: "#f00" } },
      }),
    );
    const out = await captured(() => warnShadowedTokens(current!.root));
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0]).toContain(
      "apps/web/nsh.json's tailwind.colors shadows the theme tokens primary",
    );
  });
});
