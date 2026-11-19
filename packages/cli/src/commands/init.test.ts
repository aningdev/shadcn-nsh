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
const defaultFinishes = source("packages/theme/finishes.json");
const neutralTheme = source("packages/theme/themes/shadcn/theme.json");
const neutralFinishes = source("packages/theme/themes/shadcn/finishes.json");
const glassTheme = source("packages/theme/themes/solid-glass/theme.json");
const glassFinishes = source("packages/theme/themes/solid-glass/finishes.json");

const fixture = (): Fixture =>
  makeFixture({
    items: [
      "theme",
      "theme-default",
      "theme-shadcn",
      "theme-solid-glass",
      "switch-geometry",
      "press",
      "spinner",
      "children",
      "button",
      "utils",
    ],
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
    expect(current.read("lib/finishes.json")).toBe(neutralFinishes);
    // The same data as a theme the app lists, for `selectTheme` to come back to.
    expect(current.read("themes/shadcn/theme.json")).toBe(neutralTheme);
    expect(current.read("themes/shadcn/finishes.json")).toBe(neutralFinishes);
    expect(current.read("themes/shadcn/index.ts")).toContain('from "../../lib/theme"');
    // The roles module comes with it: a theme item does not ship one of its own.
    expect(current.exists("lib/theme.ts")).toBe(true);
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
    expect(current.read("lib/finishes.json")).toBe(glassFinishes);
    // The same data as the theme the app lists, `themes/solid-glass/`, beside the roles module.
    expect(current.read("themes/solid-glass/theme.json")).toBe(glassTheme);
    expect(current.read("themes/solid-glass/index.ts")).toContain('from "../../lib/theme"');
    expect(current.exists("lib/theme.ts")).toBe(true);
    expect(recordedTheme(current)).toBe("theme-solid-glass");
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
    expect(current.read("lib/finishes.json")).toBe(neutralFinishes);
    expect(recordedTheme(current)).toBe("theme-shadcn");
  });

  test("defaults to the library's own theme, and records that", async () => {
    current = fixture();
    await captured(() => runInit({ cwd: current!.app, registry: current!.url }));

    expect(current.read("theme.json")).toBe(defaultTheme);
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
      'Unknown theme "solarized". Choose one of: default, shadcn, solid-glass.',
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
    expect(current.read("lib/finishes.json")).toBe(neutralFinishes);
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
    expect(current.read("lib/finishes.json")).toBe(neutralFinishes);
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
    expect(current.read("lib/finishes.json")).toBe(neutralFinishes);
    expect(current.exists("lib/theme.ts")).toBe(true);

    await captured(() =>
      runInit({ cwd: current!.app, registry: current!.url, theme: "default", overwrite: true }),
    );

    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("lib/finishes.json")).toBe(defaultFinishes);
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
    expect(current.read("themes/shadcn/finishes.json")).toBe(neutralFinishes);
    // The roles module it imports is the app's, two directories up from `themes/shadcn/`.
    expect(current.read("themes/shadcn/index.ts")).toContain('from "../../lib/theme"');
    expect(current.read("theme.json")).toBe(defaultTheme);
    expect(current.read("lib/finishes.json")).toBe(defaultFinishes);
    expect(recordedTheme(current)).toBe("theme");

    // Taking it again changes nothing: it is one more theme, not the app's.
    const again = await captured(() =>
      runAdd(["theme-shadcn"], { cwd: current!.app, registry: current!.url }),
    );
    expect(again.lines).toContain("skip themes/shadcn/theme.json (identical)");
  });

  test("add theme-default installs the library's own theme as one more theme", async () => {
    // An app built on another theme: the one it was built with is not on disk as a theme yet.
    current = await neutral();
    const before = current.read("theme.json");

    const out = await captured(() =>
      runAdd(["theme-default"], { cwd: current!.app, registry: current!.url }),
    );

    expect(out.lines).toContain("write themes/default/index.ts");
    expect(current.read("themes/default/theme.json")).toBe(defaultTheme);
    expect(current.read("themes/default/finishes.json")).toBe(defaultFinishes);
    // The roles module it imports is the app's, two directories up from `themes/default/`.
    expect(current.read("themes/default/index.ts")).toContain('from "../../lib/theme"');
    // The build-time theme is the app's, and adding one more does not touch it.
    expect(current.read("theme.json")).toBe(before);
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
