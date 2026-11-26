import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

import { parse } from "jsonc-parser";

import { captured, makeFixture, type Fixture } from "../testing/fixture";
import { runAdd } from "./add";
import { runInit } from "./init";

const repo = path.resolve(import.meta.dir, "../../../..");
const source = (relative: string) => fs.readFileSync(path.join(repo, relative), "utf8");
const rootTheme = source("packages/theme/theme.json");
const rootDesignMd = source("packages/theme/DESIGN.md");
const neutralTheme = source("packages/theme/themes/shadcn/theme.json");
const neutralDesignMd = source("packages/theme/themes/shadcn/DESIGN.md");
const glassTheme = source("packages/theme/themes/solid-glass/theme.json");
const glassDesignMd = source("packages/theme/themes/solid-glass/DESIGN.md");
const appleTheme = source("packages/theme/themes/apple/theme.json");
const appleDesignMd = source("packages/theme/themes/apple/DESIGN.md");
const materialTheme = source("packages/theme/themes/material/theme.json");
const materialDesignMd = source("packages/theme/themes/material/DESIGN.md");
const winuiTheme = source("packages/theme/themes/winui/theme.json");
const winuiDesignMd = source("packages/theme/themes/winui/DESIGN.md");

const fixture = (): Fixture =>
  makeFixture({
    items: [
      "theme",
      "theme-nsh-gallery",
      "theme-shadcn",
      "theme-solid-glass",
      "theme-apple",
      "theme-material",
      "theme-winui",
      "theme-native",
      "motion",
      "spinner",
      "utils",
      "icons",
      "button",
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
    expect(current.read("DESIGN.md")).toBe(neutralDesignMd);
    expect(current.exists("light.tokens.json")).toBe(false);
    expect(current.exists("dark.tokens.json")).toBe(false);
    expect(current.exists("lib/ui/semantics.json")).toBe(false);
    expect(current.exists("themes/shadcn/theme.json")).toBe(false);
    expect(current.exists("themes/shadcn/DESIGN.md")).toBe(false);
    expect(current.read("themes/shadcn.ts")).toContain('from "../lib/ui/schema"');
    expect(current.read("themes/shadcn.ts")).toContain('from "../lib/ui/base"');
    expect(current.read("lib/ui/preset.ts")).toContain('from "../../themes/shadcn"');
    expect(current.exists("lib/ui/schema.ts")).toBe(true);
    expect(current.exists("lib/ui/materials.ts")).toBe(true);
    expect(current.exists("lib/ui/effects.ts")).toBe(true);
    expect(current.exists("lib/ui/paradigm.ts")).toBe(true);
    expect(current.exists("lib/ui/base.ts")).toBe(true);
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-shadcn");
    expect((JSON.parse(current.read("nsh.json")) as { theme?: string }).theme).toBe("./theme.json");
  });

  test("init --theme solid-glass builds the app on the glass, and lists it too", async () => {
    current = fixture();
    const out = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "solid-glass" }),
    );

    expect(out.lines).toContain("write theme.json");
    expect(current.read("theme.json")).toBe(glassTheme);
    expect(current.read("DESIGN.md")).toBe(glassDesignMd);
    expect(current.read("themes/solid-glass.ts")).toContain('from "../lib/ui/base"');
    expect(current.read("lib/ui/preset.ts")).toContain('from "../../themes/solid-glass"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-solid-glass");
  });

  test("init --theme apple builds the app on Apple's palette, and lists it too", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "apple" }));

    expect(current.read("theme.json")).toBe(appleTheme);
    expect(current.read("DESIGN.md")).toBe(appleDesignMd);
    expect(current.read("themes/apple.ts")).toContain('from "../lib/ui/base"');
    expect(current.read("lib/ui/preset.ts")).toContain('from "../../themes/apple"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-apple");
  });

  test("init --theme material builds the app on Material's palette, and lists it too", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "material" }));

    expect(current.read("theme.json")).toBe(materialTheme);
    expect(current.read("DESIGN.md")).toBe(materialDesignMd);
    expect(current.read("themes/material.ts")).toContain('from "../lib/ui/base"');
    expect(current.read("lib/ui/preset.ts")).toContain('from "../../themes/material"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-material");
  });

  test("init --theme winui builds the app on WinUI 3's palette, and lists it too", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "winui" }));

    expect(current.read("theme.json")).toBe(winuiTheme);
    expect(current.read("DESIGN.md")).toBe(winuiDesignMd);
    expect(current.read("themes/winui.ts")).toContain('from "../lib/ui/base"');
    expect(current.read("lib/ui/preset.ts")).toContain('from "../../themes/winui"');
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-winui");
  });

  test("init --theme native builds the app on the NSH Gallery theme, with Apple's, Material's, WinUI 3's and the chooser beside it", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "native" }));

    expect(current.read("theme.json")).toBe(rootTheme);
    expect(current.read("DESIGN.md")).toBe(rootDesignMd);
    expect(current.exists("themes/apple.ts")).toBe(true);
    expect(current.exists("themes/material.ts")).toBe(true);
    expect(current.exists("themes/winui.ts")).toBe(true);
    expect(current.exists("themes/nsh-gallery.ts")).toBe(true);
    expect(current.read("themes/native/index.ts")).toContain("nativeTheme");
    expect(current.exists("lib/ui/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-native");
  });

  test("--overwrite replaces colors the app has changed, and nothing else", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));
    const own = rootTheme.replace(/oklch\([^)]*\)/, "oklch(0.5 0.2 30)");
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
    expect(current.read("DESIGN.md")).toBe(neutralDesignMd);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("init --theme without --overwrite merges missing theme.json keys and keeps app values", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn" }));
    const parsed = JSON.parse(current.read("theme.json")) as {
      cssVars: { light: Record<string, string>; theme: Record<string, string> };
    };
    parsed.cssVars.light.primary = "oklch(0.4 0.2 260)";
    delete parsed.cssVars.light.brand;
    delete parsed.cssVars.theme.scrim;
    current.write("theme.json", `${JSON.stringify(parsed, null, 2)}\n`);

    const out = await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "shadcn" }),
    );

    expect(out.lines.some((line) => line.startsWith("merge theme.json (added 2 keys)"))).toBe(true);
    const merged = JSON.parse(current.read("theme.json")) as typeof parsed;
    expect(merged.cssVars.light.primary).toBe("oklch(0.4 0.2 260)");
    expect(merged.cssVars.light.brand).toBeDefined();
    expect(merged.cssVars.theme.scrim).toBeDefined();
  });

  test("defaults to NSH Gallery, and records that", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(current.read("theme.json")).toBe(rootTheme);
    expect(current.read("DESIGN.md")).toBe(rootDesignMd);
    expect(current.read("lib/ui/preset.ts")).toContain('from "./base"');
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
      'Unknown theme "solarized". Choose one of: nsh-gallery, shadcn, solid-glass, apple, material, winui, native.',
    );
    expect(current.exists("nsh-ui.json")).toBe(false);
    expect(current.exists("theme.json")).toBe(false);
  });

  test("the old name `default` is an error too, listing the ids there are", async () => {
    current = fixture();
    let error: unknown;
    try {
      await runInit({ cwd: current.app, registry: current.url, theme: "default" });
    } catch (caught) {
      error = caught;
    }

    expect(String(error)).toContain(
      'Unknown theme "default". Choose one of: nsh-gallery, shadcn, solid-glass, apple, material, winui, native.',
    );
    expect(current.exists("nsh-ui.json")).toBe(false);
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

  test("an nsh-ui.json without the field is the build-time theme, and stays as it is", async () => {
    current = fixture();
    writeOldConfig(current);

    const out = await captured(() => runAdd(["button"], { cwd: current!.app }));

    expect(out.result).toBe(0);
    expect(current.read("theme.json")).toBe(rootTheme);
    expect(current.exists("components/ui/button.tsx")).toBe(true);
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
    expect(current.read("DESIGN.md")).toBe(neutralDesignMd);
    expect(recordedTheme(current)).toBe("theme-shadcn");
    expect(out.lines).toContain("skip themes/shadcn.ts (identical)");
  });

  test("add --all --overwrite keeps it too", async () => {
    current = await neutral();

    await captured(() =>
      runAdd([], { cwd: current!.app, registry: current!.url, all: true, overwrite: true }),
    );

    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.read("DESIGN.md")).toBe(neutralDesignMd);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("add theme is a plain add: switching the build-time theme is init --theme", async () => {
    current = await neutral();

    await captured(() => runAdd(["theme"], { cwd: current!.app, registry: current!.url }));

    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(recordedTheme(current)).toBe("theme-shadcn");

    current.write("theme.json", neutralTheme.replace(/oklch\([^)]*\)/, "oklch(0.5 0.2 30)"));
    await captured(() =>
      runAdd(["theme"], { cwd: current!.app, registry: current!.url, overwrite: true }),
    );
    expect(current.read("theme.json")).toBe(neutralTheme);
    expect(current.exists("lib/ui/theme.ts")).toBe(true);

    await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "nsh-gallery", overwrite: true }),
    );

    expect(current.read("theme.json")).toBe(rootTheme);
    expect(current.read("DESIGN.md")).toBe(rootDesignMd);
    expect(recordedTheme(current)).toBe("theme");
  });

  test("add theme-shadcn installs one more theme, and leaves the build-time one alone", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    const out = await captured(() =>
      runAdd(["theme-shadcn"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.lines).toContain("write themes/shadcn.ts");
    expect(current.read("themes/shadcn.ts")).toContain('from "../lib/ui/schema"');
    expect(current.exists("themes/shadcn/theme.json")).toBe(false);
    expect(current.exists("themes/shadcn/DESIGN.md")).toBe(false);
    expect(current.read("theme.json")).toBe(rootTheme);
    expect(current.read("DESIGN.md")).toBe(rootDesignMd);
    expect(recordedTheme(current)).toBe("theme");

    const again = await captured(() =>
      runAdd(["theme-shadcn"], { cwd: current!.app, registry: current!.url }),
    );
    expect(again.lines).toContain("skip themes/shadcn.ts (identical)");
  });

  test("add theme-nsh-gallery installs the library's own theme as one more theme", async () => {
    current = await neutral();
    const before = current.read("theme.json");
    const beforeDesignMd = current.read("DESIGN.md");

    const out = await captured(() =>
      runAdd(["theme-nsh-gallery"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.lines).toContain("write themes/nsh-gallery.ts");
    expect(current.read("themes/nsh-gallery.ts")).toContain('from "../lib/ui/schema"');
    expect(current.read("theme.json")).toBe(before);
    expect(current.read("DESIGN.md")).toBe(beforeDesignMd);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("add theme in an app on the build-time theme keeps the app's own colors", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));
    const own = rootTheme.replace(/oklch\([^)]*\)/, "oklch(0.5 0.2 30)");
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

    expect(out.lines).toContain("would write themes/shadcn.ts");
    expect(current.exists("themes/shadcn.ts")).toBe(false);
    expect(current.read("theme.json")).toBe(rootTheme);
    expect(current.read("DESIGN.md")).toBe(rootDesignMd);
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
