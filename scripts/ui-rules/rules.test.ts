import { describe, expect, test } from "bun:test";

import { violations } from "./rules";

const rules = (source: string, file = "packages/ui/example.tsx") =>
  violations(source, file).map((problem) => problem.rule);

describe("ui rules", () => {
  test("flags a theme's whole control geometry and its type", () => {
    expect(
      rules(`const presets: Record<Controls, number> = { base: 1 };
import type { Controls } from "@shadcn-nsh/theme";
const at = presets[controls()];`),
    ).toEqual(["controls", "controls", "controls"]);
  });

  test("leaves a component's own method named controls alone", () => {
    expect(rules(`  controls(variant: WindowControlsVariant): ViewStyle;`)).toEqual([]);
    expect(rules(`style={look.controls("caption")}`)).toEqual([]);
  });

  test("flags a theme id compared by name", () => {
    expect(rules(`if (currentTheme()?.id === "material") return 32;`)).toEqual(["theme-name"]);
    expect(rules(`const winui = theme.id !== 'winui';`)).toEqual(["theme-name"]);
  });

  test("flags colour literals outside a theme role", () => {
    expect(rules(`style={{ color: "#fff" }}`)).toEqual(["colour"]);
    expect(rules(`style={{ color: oklch(0.5 0.1 20) }}`)).toEqual(["colour"]);
    expect(rules(`class="text-[#123456]"`)).toEqual(["colour"]);
    expect(rules(`class="border-white"`)).toEqual(["colour"]);
    expect(rules(`class="bg-black/15"`)).toEqual(["colour"]);
  });

  test("leaves a converter that builds a colour string from its argument", () => {
    expect(rules("return `rgb(${channels.join(' ')})`;")).toEqual([]);
    expect(rules("return `oklch(${lightness} ${chroma} ${hue})`;")).toEqual([]);
  });

  test("flags an unmarked colour in any file, and takes the marker on the line or above", () => {
    expect(rules(`const close = "#FF5F57";`, "packages/ui/title-bar.tsx")).toEqual(["colour"]);
    expect(
      rules(`// color: the user's colour must read on any theme\nconst edge = "border-white";`),
    ).toEqual([]);
    expect(rules(`const edge = "border-white"; // color: the user's colour`)).toEqual([]);
  });

  test("flags a state colour written into a class", () => {
    expect(rules(`class="hover:bg-white"`)).toEqual(["state"]);
    expect(rules(`class="group-hover:text-black/15"`)).toEqual(["state"]);
  });

  test("leaves a state that names a theme role, and takes the marker", () => {
    expect(rules(`class="hover:bg-hover group-hover:text-foreground"`)).toEqual([]);
    expect(
      rules(
        `// state: the rail hides until the pointer is over the row\nclass="group-hover:opacity-100"`,
      ),
    ).toEqual([]);
  });

  test("ignores prose in comments", () => {
    expect(rules(`/** WinUI draws "material" with "#fff" here. */`)).toEqual([]);
    expect(rules(`// the material theme's 32×4`)).toEqual([]);
  });
});

describe("import direction", () => {
  const imports = (source: string, file = "packages/ui/button.tsx") =>
    violations(source, file).map((problem) => [problem.rule, problem.match]);

  test("a lib module never imports a component", () => {
    expect(imports(`import { Button } from "../button";`, "packages/ui/lib/press.ts")).toEqual([
      ["layer", "../button"],
    ]);
    expect(imports(`export { Button } from "../button";`, "packages/ui/lib/tool.ts")).toEqual([
      ["layer", "../button"],
    ]);
  });

  test("a lib module imports its siblings and its package's own layers", () => {
    expect(
      imports(
        `import { mergeClasses } from "./class-names";\nimport { Icon } from "./icons";`,
        "packages/ui/lib/press.ts",
      ),
    ).toEqual([]);
  });

  test("a component imports a lib module and another component", () => {
    expect(
      imports(`import { read } from "./lib/live-value";\nimport { Button } from "./button";`),
    ).toEqual([]);
  });

  test("nothing in packages/ui reaches into apps, scripts or another package", () => {
    expect(imports(`import { cases } from "../../apps/website/demos/render-cases";`)).toEqual([
      ["layer", "../../apps/website/demos/render-cases"],
    ]);
    expect(
      imports(`import { repo } from "../../../scripts/port/lib";`, "packages/ui/lib/tool.ts"),
    ).toEqual([["layer", "../../../scripts/port/lib"]]);
    expect(imports(`import { z } from "zod";`)).toEqual([["layer", "zod"]]);
    expect(imports(`import { Button } from "@shadcn-nsh/ui";`)).toEqual([
      ["layer", "@shadcn-nsh/ui"],
    ]);
  });

  test("theme values come through the package entry, never its JSON or a theme directory", () => {
    expect(imports(`import { colors, token } from "@shadcn-nsh/theme";`)).toEqual([]);
    expect(imports(`import theme from "@shadcn-nsh/theme/theme.json";`)).toEqual([
      ["layer", "@shadcn-nsh/theme/theme.json"],
    ]);
    expect(imports(`import { apple } from "@shadcn-nsh/theme/themes/apple";`)).toEqual([
      ["layer", "@shadcn-nsh/theme/themes/apple"],
    ]);
  });

  test("nsh, its base, and the icon set are the layers below", () => {
    expect(
      imports(
        `import { View, split } from "nsh";\nimport { Button } from "nsh/base";\nimport type { IconNode } from "lucide";`,
      ),
    ).toEqual([]);
  });

  test("reports the import's own line, not the statement's first", () => {
    const found = violations(`import {\n  z,\n} from "zod";\n`, "packages/ui/button.tsx");
    expect(found.map((problem) => problem.line)).toEqual([3]);
    expect(found[0]?.column).toBe(8);
    expect(found[0]?.text).toBe(`} from "zod";`);
  });

  test("an allowlist entry excuses one specifier, and names why", () => {
    const source = `import { Button } from "../button";`;
    expect(
      violations(source, "packages/ui/lib/press.ts", [
        { file: "packages/ui/lib/press.ts", rule: "layer", match: "../button", reason: "probe" },
      ]),
    ).toEqual([]);
    expect(
      violations(source, "packages/ui/lib/press.ts", [
        { file: "packages/ui/lib/other.ts", rule: "layer", match: "../button", reason: "probe" },
      ]),
    ).toHaveLength(1);
    expect(
      violations(source, "packages/ui/lib/press.ts", [
        { file: "packages/ui/lib/press.ts", rule: "layer", match: "../input", reason: "probe" },
      ]),
    ).toHaveLength(1);
  });
});

describe("exported docs", () => {
  const docs = (source: string, file = "packages/ui/example.tsx") =>
    violations(source, file)
      .filter((problem) => problem.rule === "jsdoc")
      .map((problem) => [problem.line, problem.match]);

  test("an export with no doc comment is reported with its name", () => {
    expect(docs(`export const SIZE = 4;`)).toEqual([[1, "SIZE"]]);
    expect(docs(`export function Button() { return <View />; }`)).toEqual([[1, "Button"]]);
    expect(docs(`export type Variant = "a" | "b";`)).toEqual([[1, "Variant"]]);
    expect(docs(`export interface Look {\n  root(): ViewStyle;\n}`)).toEqual([[1, "Look"]]);
  });

  test("a doc comment above the export passes", () => {
    expect(docs(`/** The control's resting height. */\nexport const SIZE = 4;`)).toEqual([]);
    expect(docs(`/**\n * A button.\n */\nexport function Button() { return <View />; }`)).toEqual(
      [],
    );
  });

  test("a line comment is not a doc, and neither is a doc cut off by another comment", () => {
    expect(docs(`// a button\nexport function Button() { return <View />; }`)).toEqual([
      [2, "Button"],
    ]);
    expect(
      docs(`/** A caret. */\n// its corner is fixed geometry\nexport const CARET = "bg-brand";`),
    ).toEqual([[3, "CARET"]]);
  });

  test("an empty doc comment does not count", () => {
    expect(docs(`/** */\nexport const SIZE = 4;`)).toEqual([[2, "SIZE"]]);
  });

  test("one doc covers an overloaded function's later signatures", () => {
    expect(
      docs(
        `/** base with extra. */\nexport function joinClass(base: string): string;\n` +
          `export function joinClass(base: string, extra?: string): string;\n` +
          `export function joinClass(base: string, extra?: string) {\n  return base;\n}`,
      ),
    ).toEqual([]);
    expect(
      docs(
        `export function joinClass(base: string): string;\n` +
          `export function joinClass(base: string, extra?: string): string;`,
      ),
    ).toEqual([[1, "joinClass"]]);
  });

  test("a re-export is the other file's doc", () => {
    expect(docs(`export * from "./button";\nexport { Icon } from "./lib/icons";`)).toEqual([]);
  });

  test("reports the export's line and the line's text", () => {
    const found = violations(
      `/** a button */\nconst x = 1;\n\nexport const BUTTON_SIZE = 32;`,
      "packages/ui/example.tsx",
    );
    expect(found.map((problem) => [problem.line, problem.text])).toEqual([
      [4, "export const BUTTON_SIZE = 32;"],
    ]);
  });

  test("an allowlist entry excuses one export by name", () => {
    const source = `export const LEGACY = 1;`;
    expect(
      violations(source, "packages/ui/example.tsx", [
        { file: "packages/ui/example.tsx", rule: "jsdoc", match: "LEGACY", reason: "probe" },
      ]),
    ).toEqual([]);
    expect(
      violations(source, "packages/ui/example.tsx", [
        { file: "packages/ui/example.tsx", rule: "jsdoc", match: "OTHER", reason: "probe" },
      ]),
    ).toHaveLength(1);
  });
});
