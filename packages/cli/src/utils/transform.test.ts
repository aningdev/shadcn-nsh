import { describe, expect, test } from "bun:test";
import path from "node:path";

import { DEFAULT_CONFIG, type NshUiConfig } from "../types";
import { transformContent } from "./transform";

const config: NshUiConfig = {
  ...DEFAULT_CONFIG(),
  registry: "https://example.test/{name}.json",
};

const cwd = path.resolve("/app");

describe("transformContent", () => {
  test("rewrites the theme package import relative to the component", () => {
    const out = transformContent(
      'import { colors } from "@shadcn-nsh/theme";',
      path.join(cwd, "components/ui/button.tsx"),
      config,
      cwd,
    );
    expect(out).toBe('import { colors } from "../../lib/ui/theme";');
  });

  test("rewrites ./lib/* relative to the component", () => {
    const out = transformContent(
      'import { createOpenState } from "./lib/state";',
      path.join(cwd, "components/ui/popover.tsx"),
      config,
      cwd,
    );
    expect(out).toBe('import { createOpenState } from "../../lib/ui/state";');
  });

  test("rewrites monorepo theme relative imports for themes/<id>.ts and lib/ui/*", () => {
    const themeFile = path.join(cwd, "themes/shadcn.ts");
    expect(
      transformContent(
        'import { defineTheme } from "../../schema";\nimport { base } from "../nsh-gallery";',
        themeFile,
        config,
        cwd,
      ),
    ).toBe(
      'import { defineTheme } from "../lib/ui/schema";\nimport { base } from "../lib/ui/base";',
    );

    expect(
      transformContent(
        'export { nshGallery as presetTheme } from "./themes/nsh-gallery";',
        path.join(cwd, "lib/ui/preset.ts"),
        config,
        cwd,
      ),
    ).toBe('export { nshGallery as presetTheme } from "./base";');
  });
});
