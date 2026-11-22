import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

import { parse } from "jsonc-parser";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runAdd } from "./add";
import { runInit } from "./init";

const repo = path.resolve(import.meta.dir, "../../../..");
const source = (relative: string) => fs.readFileSync(path.join(repo, relative), "utf8");
const defaultTheme = source("packages/theme/theme.json");
const defaultFinishes = source("packages/theme/semantics.json");
const defaultLightTokens = source("packages/theme/light.tokens.json");
const defaultDarkTokens = source("packages/theme/dark.tokens.json");
const defaultDesignMd = source("packages/theme/DESIGN.md");
const neutralTheme = source("packages/theme/themes/shadcn/theme.json");
const neutralFinishes = source("packages/theme/themes/shadcn/semantics.json");
const neutralLightTokens = source("packages/theme/themes/shadcn/light.tokens.json");
const neutralDarkTokens = source("packages/theme/themes/shadcn/dark.tokens.json");
const neutralDesignMd = source("packages/theme/themes/shadcn/DESIGN.md");
const glassTheme = source("packages/theme/themes/solid-glass/theme.json");
const glassFinishes = source("packages/theme/themes/solid-glass/semantics.json");
const glassLightTokens = source("packages/theme/themes/solid-glass/light.tokens.json");
const glassDarkTokens = source("packages/theme/themes/solid-glass/dark.tokens.json");
const glassDesignMd = source("packages/theme/themes/solid-glass/DESIGN.md");
const appleTheme = source("packages/theme/themes/apple/theme.json");
const appleFinishes = source("packages/theme/themes/apple/semantics.json");
const appleLightTokens = source("packages/theme/themes/apple/light.tokens.json");
const appleDarkTokens = source("packages/theme/themes/apple/dark.tokens.json");
const appleDesignMd = source("packages/theme/themes/apple/DESIGN.md");
const materialTheme = source("packages/theme/themes/material/theme.json");
const materialFinishes = source("packages/theme/themes/material/semantics.json");
const materialLightTokens = source("packages/theme/themes/material/light.tokens.json");
const materialDarkTokens = source("packages/theme/themes/material/dark.tokens.json");
const materialDesignMd = source("packages/theme/themes/material/DESIGN.md");
const winuiTheme = source("packages/theme/themes/winui/theme.json");
const winuiFinishes = source("packages/theme/themes/winui/semantics.json");
const winuiLightTokens = source("packages/theme/themes/winui/light.tokens.json");
const winuiDarkTokens = source("packages/theme/themes/winui/dark.tokens.json");
const winuiDesignMd = source("packages/theme/themes/winui/DESIGN.md");

const fixture = (): Fixture =>
  makeFixture({
    items: [
      "theme",
      "theme-default",
      "theme-shadcn",
      "theme-solid-glass",
      "theme-apple",
      "theme-material",
      "theme-winui",
      "theme-native",
      "switch-geometry",
      "press",
      "spinner",
      "as-text",
      "icons",
      "button",
      "utils",
    ],
    installed: true,
  });

let current: Fixture | null = null;

afterEach(() => {
  current?.remove();
  current = null;
});

/** `nsh-ui.json` the way an app made before themes were recorded has it: no `theme`. */
function writeOldConfig(app: Fixture) {
  app.write("nsh-ui.json", `${JSON.stringify({ registry: app.url }, null, 2)}\n`);
}

const recordedTheme = (app: Fixture) =>
  (JSON.parse(app.read("nsh-ui.json")) as { theme?: string }).theme;

describe("init --theme", () => {
  test("installs the theme's own files, and records which one", async () => {
    current = fixture();
    const out = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn" }),
    );

    expect(out.lines).toContain("write theme.json");
    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.read("light.tokens.json")).toBe(neutralLightTokens);
    expect(current.read("dark.tokens.json")).toBe(neutralDarkTokens);
    expect(current.read("DESIGN.md")).toBe(neutralDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(neutralFinishes);
    // The same data as a theme the app lists, for `selectTheme` to come back to.
    expect(current.read("themes/shadcn/theme.json")).toBe(neutralTheme);
    expect(current.read("themes/shadcn/semantics.json")).toBe(neutralFinishes);
    expect(current.read("themes/shadcn/light.tokens.json")).toBe(neutralLightTokens);
    expect(current.read("themes/shadcn/dark.tokens.json")).toBe(neutralDarkTokens);
    expect(current.read("themes/shadcn/DESIGN.md")).toBe(neutralDesignMd);
    expect(current.read("themes/shadcn/index.ts")).toContain('from "../../lib/ui/theme"');
    // The roles module comes with it: a theme item does not ship one of its own.
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-shadcn");
    // The app still points its runtime at `theme.json`, whatever theme that is.
    expect((JSON.parse(current.read("nsh.json")) as { theme?: string }).theme).toBe("./theme.json");
  });

  test("init --theme solid-glass builds the app on the glass, and lists it too", async () => {
    current = fixture();
    const out = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "solid-glass" }),
    );

    expect(out.lines).toContain("write theme.json");
    expect(current.read("theme.json")).toBe(glassTheme);
    expect(current.read("light.tokens.json")).toBe(glassLightTokens);
    expect(current.read("dark.tokens.json")).toBe(glassDarkTokens);
    expect(current.read("DESIGN.md")).toBe(glassDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(glassFinishes);
    // The same data as the theme the app lists, `themes/solid-glass/`, beside the roles module.
    expect(current.read("themes/solid-glass/theme.json")).toBe(glassTheme);
    expect(current.read("themes/solid-glass/light.tokens.json")).toBe(glassLightTokens);
    expect(current.read("themes/solid-glass/dark.tokens.json")).toBe(glassDarkTokens);
    expect(current.read("themes/solid-glass/DESIGN.md")).toBe(glassDesignMd);
    expect(current.read("themes/solid-glass/index.ts")).toContain('from "../../lib/ui/theme"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-solid-glass");
  });

  test("init --theme apple builds the app on Apple's palette, and lists it too", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "apple" }));

    expect(current.read("theme.json")).toBe(appleTheme);
    expect(current.read("light.tokens.json")).toBe(appleLightTokens);
    expect(current.read("dark.tokens.json")).toBe(appleDarkTokens);
    expect(current.read("DESIGN.md")).toBe(appleDesignMd);
    expect(current.read("themes/apple/light.tokens.json")).toBe(appleLightTokens);
    expect(current.read("themes/apple/dark.tokens.json")).toBe(appleDarkTokens);
    expect(current.read("themes/apple/DESIGN.md")).toBe(appleDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(appleFinishes);
    expect(current.read("themes/apple/index.ts")).toContain('from "../../lib/ui/theme"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-apple");
  });

  test("init --theme material builds the app on Material's palette, and lists it too", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "material" }));

    expect(current.read("theme.json")).toBe(materialTheme);
    expect(current.read("light.tokens.json")).toBe(materialLightTokens);
    expect(current.read("dark.tokens.json")).toBe(materialDarkTokens);
    expect(current.read("DESIGN.md")).toBe(materialDesignMd);
    expect(current.read("themes/material/light.tokens.json")).toBe(materialLightTokens);
    expect(current.read("themes/material/dark.tokens.json")).toBe(materialDarkTokens);
    expect(current.read("themes/material/DESIGN.md")).toBe(materialDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(materialFinishes);
    expect(current.read("themes/material/index.ts")).toContain('from "../../lib/ui/theme"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-material");
  });

  test("init --theme winui builds the app on WinUI 3's palette, and lists it too", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "winui" }));

    expect(current.read("theme.json")).toBe(winuiTheme);
    expect(current.read("light.tokens.json")).toBe(winuiLightTokens);
    expect(current.read("dark.tokens.json")).toBe(winuiDarkTokens);
    expect(current.read("DESIGN.md")).toBe(winuiDesignMd);
    expect(current.read("themes/winui/light.tokens.json")).toBe(winuiLightTokens);
    expect(current.read("themes/winui/dark.tokens.json")).toBe(winuiDarkTokens);
    expect(current.read("themes/winui/DESIGN.md")).toBe(winuiDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(winuiFinishes);
    expect(current.read("themes/winui/index.ts")).toContain('from "../../lib/ui/theme"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-winui");
  });

  test("init --theme native builds the app on the default theme, with Apple's, Material's, WinUI 3's and the chooser beside it", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "native" }));

    // One build-time theme: the default's. The platform's own is chosen at run time.
    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("light.tokens.json")).toBe(defaultLightTokens);
    expect(current.read("dark.tokens.json")).toBe(defaultDarkTokens);
    expect(current.read("DESIGN.md")).toBe(defaultDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(defaultFinishes);
    expect(current.read("themes/apple/theme.json")).toBe(appleTheme);
    expect(current.read("themes/apple/light.tokens.json")).toBe(appleLightTokens);
    expect(current.read("themes/apple/DESIGN.md")).toBe(appleDesignMd);
    expect(current.read("themes/material/theme.json")).toBe(materialTheme);
    expect(current.read("themes/material/light.tokens.json")).toBe(materialLightTokens);
    expect(current.read("themes/material/DESIGN.md")).toBe(materialDesignMd);
    expect(current.read("themes/winui/theme.json")).toBe(winuiTheme);
    expect(current.read("themes/winui/light.tokens.json")).toBe(winuiLightTokens);
    expect(current.read("themes/winui/DESIGN.md")).toBe(winuiDesignMd);
    expect(current.exists("themes/default/theme.json")).toBe(true);
    expect(current.exists("themes/default/light.tokens.json")).toBe(true);
    expect(current.exists("themes/default/dark.tokens.json")).toBe(true);
    expect(current.exists("themes/default/DESIGN.md")).toBe(true);
    expect(current.read("themes/native/index.ts")).toContain("nativeTheme");
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-native");
  });

  test("--overwrite replaces colors the app has changed, and nothing else", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));
    const own = defaultTheme.replace(/oklch\([^)]*\)/, "oklch(0.5 0.2 30)");
    current.write("theme.json", own);

    const kept = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn" }),
    );
    expect(kept.lines).toContain("kept theme.json (the app's colors stay)");
    expect(current.read("theme.json")).toBe(own);

    const replaced = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn", overwrite: true }),
    );
    expect(replaced.lines.some((line) => line.startsWith("overwrite theme.json"))).toBe(true);
    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.read("lib/ui/semantics.json")).toBe(neutralFinishes);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("init --theme without --overwrite merges missing semantics.json keys and keeps app values", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn" }));
    const semantics = JSON.parse(current.read("lib/ui/semantics.json")) as {
      state: { "press-scale": number };
      controls?: string;
      finishes: { shared: Record<string, Record<string, unknown>> };
    };
    semantics.state["press-scale"] = 0.95;
    delete semantics.controls;
    delete semantics.finishes.shared.dialog;
    current.write("lib/ui/semantics.json", `${JSON.stringify(semantics, null, 2)}\n`);

    const out = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn" }),
    );

    expect(
      out.lines.some((line) => line.startsWith("merge lib/ui/semantics.json (added 2 keys)")),
    ).toBe(true);
    const merged = JSON.parse(current.read("lib/ui/semantics.json")) as typeof semantics;
    expect(merged.state["press-scale"]).toBe(0.95);
    expect(merged.controls).toBe("base");
    expect(merged.finishes.shared.dialog).toBeDefined();
  });

  test("defaults to the library's own theme, and records that", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("light.tokens.json")).toBe(defaultLightTokens);
    expect(current.read("dark.tokens.json")).toBe(defaultDarkTokens);
    expect(current.read("DESIGN.md")).toBe(defaultDesignMd);
    expect(recordedTheme(current)).toBe("theme");
  });

  test("an unknown theme is an error naming the ones there are, and writes nothing", async () => {
    current = fixture();
    let error: unknown;
    try {
      await runInit({ cwd: current.app, registry: current.url, theme: "solarized" });
    } catch (caught) {
      error = caught;
    }

    expect(String(error)).toContain(
      'Unknown theme "solarized". Choose one of: default, shadcn, solid-glass, apple, material, winui, native.',
    );
    expect(current.exists("nsh-ui.json")).toBe(false);
    expect(current.exists("theme.json")).toBe(false);
  });
});

describe("the app's theme", () => {
  /** An app that installed the neutral theme, and a component in it. */
  async function neutral(): Promise<Fixture> {
    const app = fixture();
    await captured(() => runInit({ cwd: app.app, registry: app.url, theme: "shadcn" }));
    await captured(() => runAdd(["button"], { cwd: app.app, registry: app.url }));
    return app;
  }

  test("an nsh-ui.json without the field is the default theme, and stays as it is", async () => {
    current = fixture();
    writeOldConfig(current);

    const out = await captured(() => runAdd(["button"], { cwd: current!.app }));

    expect(out.result).toBe(0);
    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.exists("components/ui/button.tsx")).toBe(true);
    // Nothing rewrites the file the app already had, so an older app gains no field.
    expect(recordedTheme(current)).toBeUndefined();
  });

  test("add --overwrite keeps the theme the app installed", async () => {
    current = await neutral();
    const before = current.read("theme.json");

    const out = await captured(() =>
      runAdd(["button"], { cwd: current!.app, registry: current!.url, overwrite: true }),
    );

    expect(out.result).toBe(0);
    expect(current.read("theme.json")).toBe(before);
    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.read("lib/ui/semantics.json")).toBe(neutralFinishes);
    expect(recordedTheme(current)).toBe("theme-shadcn");
    // The `theme` dependency resolved to the item `nsh-ui.json` names, not the default one.
    expect(out.lines).toContain("skip themes/shadcn/theme.json (identical)");
  });

  test("add --all --overwrite keeps it too", async () => {
    current = await neutral();

    await captured(() =>
      runAdd([], { cwd: current!.app, registry: current!.url, all: true, overwrite: true }),
    );

    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.read("lib/ui/semantics.json")).toBe(neutralFinishes);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("add theme is a plain add: switching the build-time theme is init --theme", async () => {
    current = await neutral();

    await captured(() => runAdd(["theme"], { cwd: current!.app, registry: current!.url }));

    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(recordedTheme(current)).toBe("theme-shadcn");

    // `theme` named is the app's build-time theme, as the dependency is: `--overwrite` restores
    // the shadcn colors, never the library's default ones.
    current.write("theme.json", neutralTheme.replace(/oklch\([^)]*\)/, "oklch(0.5 0.2 30)"));
    await captured(() =>
      runAdd(["theme"], { cwd: current!.app, registry: current!.url, overwrite: true }),
    );
    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.read("lib/ui/semantics.json")).toBe(neutralFinishes);
    expect(current.exists("lib/ui/theme.ts")).toBe(true);

    await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "default", overwrite: true }),
    );

    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("lib/ui/semantics.json")).toBe(defaultFinishes);
    expect(recordedTheme(current)).toBe("theme");
  });

  test("add theme-shadcn installs one more theme, and leaves the build-time one alone", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    const out = await captured(() =>
      runAdd(["theme-shadcn"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.lines).toContain("write themes/shadcn/index.ts");
    expect(current.read("themes/shadcn/theme.json")).toBe(neutralTheme);
    expect(current.read("themes/shadcn/semantics.json")).toBe(neutralFinishes);
    expect(current.read("themes/shadcn/light.tokens.json")).toBe(neutralLightTokens);
    expect(current.read("themes/shadcn/dark.tokens.json")).toBe(neutralDarkTokens);
    expect(current.read("themes/shadcn/DESIGN.md")).toBe(neutralDesignMd);
    // The roles module it imports is the app's, two directories up from `themes/shadcn/`.
    expect(current.read("themes/shadcn/index.ts")).toContain('from "../../lib/ui/theme"');
    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("light.tokens.json")).toBe(defaultLightTokens);
    expect(current.read("dark.tokens.json")).toBe(defaultDarkTokens);
    expect(current.read("DESIGN.md")).toBe(defaultDesignMd);
    expect(current.read("lib/ui/semantics.json")).toBe(defaultFinishes);
    expect(recordedTheme(current)).toBe("theme");

    // Taking it again changes nothing: it is one more theme, not the app's.
    const again = await captured(() =>
      runAdd(["theme-shadcn"], { cwd: current!.app, registry: current!.url }),
    );
    expect(again.lines).toContain("skip themes/shadcn/theme.json (identical)");
    expect(again.lines).toContain("skip themes/shadcn/light.tokens.json (identical)");
    expect(again.lines).toContain("skip themes/shadcn/dark.tokens.json (identical)");
    expect(again.lines).toContain("skip themes/shadcn/DESIGN.md (identical)");
  });

  test("add theme-default installs the library's own theme as one more theme", async () => {
    // An app built on another theme: the one it was built with is not on disk as a theme yet.
    current = await neutral();
    const before = current.read("theme.json");
    const beforeLight = current.read("light.tokens.json");
    const beforeDark = current.read("dark.tokens.json");
    const beforeDesignMd = current.read("DESIGN.md");

    const out = await captured(() =>
      runAdd(["theme-default"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.lines).toContain("write themes/default/index.ts");
    expect(current.read("themes/default/theme.json")).toBe(defaultTheme);
    expect(current.read("themes/default/semantics.json")).toBe(defaultFinishes);
    expect(current.read("themes/default/light.tokens.json")).toBe(defaultLightTokens);
    expect(current.read("themes/default/dark.tokens.json")).toBe(defaultDarkTokens);
    expect(current.read("themes/default/DESIGN.md")).toBe(defaultDesignMd);
    // The roles module it imports is the app's, two directories up from `themes/default/`.
    expect(current.read("themes/default/index.ts")).toContain('from "../../lib/ui/theme"');
    // The build-time theme is the app's, and adding one more does not touch it.
    expect(current.read("theme.json")).toBe(before);
    expect(current.read("light.tokens.json")).toBe(beforeLight);
    expect(current.read("dark.tokens.json")).toBe(beforeDark);
    expect(current.read("DESIGN.md")).toBe(beforeDesignMd);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("add theme in a default app keeps the app's own colors", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));
    const own = defaultTheme.replace(/oklch\([^)]*\)/, "oklch(0.5 0.2 30)");
    current.write("theme.json", own);

    await captured(() => runAdd(["theme"], { cwd: current!.app, registry: current!.url }));

    expect(current.read("theme.json")).toBe(own);
    expect(recordedTheme(current)).toBe("theme");
  });

  test("a dry run writes nothing and records nothing", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    const out = await captured(() =>
      runAdd(["theme-shadcn"], { cwd: current!.app, registry: current!.url, dryRun: true }),
    );

    expect(out.lines).toContain("would write themes/shadcn/theme.json");
    expect(current.exists("themes/shadcn/theme.json")).toBe(false);
    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("light.tokens.json")).toBe(defaultLightTokens);
    expect(current.read("dark.tokens.json")).toBe(defaultDarkTokens);
    expect(current.read("DESIGN.md")).toBe(defaultDesignMd);
    expect(recordedTheme(current)).toBe("theme");
  });
});

describe("the @/ alias", () => {
  /** The base `.nsh/tsconfig.json` NSH writes: JSONC, its paths relative to its own directory. */
  const NSH_BASE = `// Generated by nsh.
{
  "compilerOptions": {
    "paths": {
      "nsh": ["./types/nsh/index.d.ts"],
      "nsh/*": ["./types/nsh/*.d.ts"],
      "*": ["./types/*.d.ts"],
      "extra": "./types/extra.d.ts"
    }
  }
}`;

  test("writes both halves into a fresh app: tsconfig paths, and nsh.json's alias", async () => {
    current = fixture();
    current.write(".nsh/tsconfig.json", NSH_BASE);

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.lines).toContain("write tsconfig.json");
    expect(out.lines).toContain("update nsh.json alias @ → ./");
    // The base's own mappings ride along, rewritten for the app root, @/* last.
    expect(JSON.parse(current.read("tsconfig.json"))).toEqual({
      extends: "./.nsh/tsconfig.json",
      compilerOptions: {
        paths: {
          nsh: ["./.nsh/types/nsh/index.d.ts"],
          "nsh/*": ["./.nsh/types/nsh/*.d.ts"],
          "*": ["./.nsh/types/*.d.ts"],
          extra: ["./.nsh/types/extra.d.ts"],
          "@/*": ["./*"],
        },
      },
      include: ["**/*.ts", "**/*.tsx"],
    });
    expect(JSON.parse(current.read("nsh.json"))).toEqual({
      name: "T",
      id: "dev.t",
      version: "0.0.0",
      build: 1,
      theme: "./theme.json",
      resolve: { alias: { "@": "./" } },
    });
  });

  test("edits nsh.json in place: only the new keys are added, its short arrays stay on one line", async () => {
    current = fixture();
    current.write(
      "nsh.json",
      `{
  "name": "T",
  "id": "dev.t",
  "version": "0.0.0",
  "build": 1,
  "resolve": {
    "conditions": ["node"]
  }
}
`,
    );

    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(current.read("nsh.json")).toBe(`{
  "name": "T",
  "id": "dev.t",
  "version": "0.0.0",
  "build": 1,
  "resolve": {
    "conditions": ["node"],
    "alias": {
      "@": "./"
    }
  },
  "theme": "./theme.json"
}
`);
  });

  test("a fresh app with no .nsh to read falls back to the mappings this CLI knows", async () => {
    current = fixture();

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.lines).toContain("write tsconfig.json");
    const tsconfig = current.read("tsconfig.json");
    expect(tsconfig).toContain("No .nsh/tsconfig.json to read");
    expect(tsconfig).toContain('"nsh": ["./.nsh/types/nsh/index.d.ts"]');
    expect(tsconfig).toContain('"@/*": ["./*"]');
  });

  test("merges into the tsconfig an nsh-init app already has, keeping its comment and keys", async () => {
    current = fixture();
    current.write(".nsh/tsconfig.json", NSH_BASE);
    current.write(
      "tsconfig.json",
      `{
  "extends": "./.nsh/tsconfig.json",
  // my include list
  "include": ["**/*.ts", "**/*.tsx"]
}`,
    );

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.lines).toContain(
      "update tsconfig.json paths (@/* → ./*, plus .nsh/tsconfig.json's own)",
    );
    expect(current.read("tsconfig.json")).toBe(`{
  "extends": "./.nsh/tsconfig.json",
  // my include list
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "paths": {
      "nsh": ["./.nsh/types/nsh/index.d.ts"],
      "nsh/*": ["./.nsh/types/nsh/*.d.ts"],
      "*": ["./.nsh/types/*.d.ts"],
      "extra": ["./.nsh/types/extra.d.ts"],
      "@/*": ["./*"]
    }
  }
}`);
  });

  test("adds only @/* to paths the app has, without dragging the base's in", async () => {
    current = fixture();
    current.write(
      "tsconfig.json",
      `{
  "compilerOptions": {
    "paths": {
      "utils/*": ["./src/utils/*"]
    }
  }
}`,
    );

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.lines).toContain("update tsconfig.json paths (@/* → ./*)");
    const tsconfig = current.read("tsconfig.json");
    const paths = (
      parse(tsconfig, undefined, { allowTrailingComma: true }) as {
        compilerOptions?: { paths?: Record<string, string[]> };
      }
    ).compilerOptions?.paths;
    expect(paths).toEqual({ "utils/*": ["./src/utils/*"], "@/*": ["./*"] });
    expect(tsconfig).not.toContain(".nsh/types");
  });

  test("warns and keeps a tsconfig that maps @/* somewhere else", async () => {
    const own = `{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`;
    current = fixture();
    current.write("tsconfig.json", own);

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.lines).not.toContain("update tsconfig.json paths (@/* → ./*)");
    expect(out.errors.join("\n")).toContain(
      'tsconfig.json maps @/* to ["./src/*"], not ./* — kept',
    );
    expect(current.read("tsconfig.json")).toBe(own);
  });

  test("warns and keeps a tsconfig it cannot read as JSONC", async () => {
    const broken = `{ "extends": "./.nsh/tsconfig.json" oops`;
    current = fixture();
    current.write("tsconfig.json", broken);

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.errors.join("\n")).toContain("tsconfig.json could not be read as JSONC");
    expect(current.read("tsconfig.json")).toBe(broken);
  });

  test("warns and keeps an nsh.json that maps @ somewhere else", async () => {
    current = fixture();
    current.write(
      "nsh.json",
      `${JSON.stringify({
        name: "T",
        id: "dev.t",
        version: "0.0.0",
        build: 1,
        resolve: { alias: { "@": "./src" } },
      })}\n`,
    );

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.errors.join("\n")).toContain('nsh.json maps @ to "./src", not ./ — kept');
    // The alias is the app's choice, but the rest of init still ran.
    expect(JSON.parse(current.read("nsh.json")).resolve.alias).toEqual({ "@": "./src" });
    expect((JSON.parse(current.read("nsh.json")) as { theme?: string }).theme).toBe("./theme.json");
    expect(current.exists("theme.json")).toBe(true);
  });

  test("a second init changes nothing", async () => {
    current = fixture();
    current.write(".nsh/tsconfig.json", NSH_BASE);
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));
    const tsconfig = current.read("tsconfig.json");
    const nshJson = current.read("nsh.json");

    const out = await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(out.lines).toContain("skip tsconfig.json paths (@/* → ./* already)");
    expect(out.lines).not.toContain("update nsh.json alias @ → ./");
    expect(current.read("tsconfig.json")).toBe(tsconfig);
    expect(current.read("nsh.json")).toBe(nshJson);
  });
});
