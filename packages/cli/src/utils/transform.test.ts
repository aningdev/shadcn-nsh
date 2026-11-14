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
    expect(out).toBe('import { colors } from "../../lib/theme";');
  });

  test("rewrites ./lib/* relative to the component", () => {
    const out = transformContent(
      'import { createOpenState } from "./lib/open-state";',
      path.join(cwd, "components/ui/popover.tsx"),
      config,
      cwd,
    );
    expect(out).toBe('import { createOpenState } from "../../lib/open-state";');
  });
});
