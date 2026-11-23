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
