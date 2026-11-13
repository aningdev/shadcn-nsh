import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { captured } from "../testing/fixture";
import { runBuild } from "./build";

type Project = { root: string; output: string; remove(): void };

/**
 * A registry of one item (`button`, importing nothing) over a source file, and an output
 * directory holding what an earlier build left behind.
 */
function project(): Project {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-nsh-build-"));
  const output = path.join(root, "public/r");
  fs.mkdirSync(path.join(root, "ui"), { recursive: true });
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(root, "ui/button.tsx"), "export const Button = () => null;\n");
  fs.writeFileSync(
    path.join(root, "registry.json"),
    `${JSON.stringify(
      {
        name: "test",
        homepage: "",
        items: [
          {
            name: "button",
            type: "registry:ui",
            title: "Button",
            description: "A button.",
            registryDependencies: [],
            files: [
              { path: "ui/button.tsx", type: "registry:ui", target: "components/ui/button.tsx" },
            ],
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  return {
    root,
    output,
    remove: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

let current: Project | null = null;

afterEach(() => {
  current?.remove();
  current = null;
});

describe("build", () => {
  test("writes every item and the catalog the CLI reads", async () => {
    current = project();
    const out = await captured(() =>
      runBuild("./registry.json", { cwd: current!.root, output: "./public/r" }),
    );

    expect(out.result).toBe(0);
    expect(fs.existsSync(path.join(current.output, "button.json"))).toBe(true);
    const item = JSON.parse(fs.readFileSync(path.join(current.output, "button.json"), "utf8"));
    expect(item.files[0].content).toContain("export const Button");
    const index = JSON.parse(fs.readFileSync(path.join(current.output, "index.json"), "utf8"));
    expect(index.items.map((entry: { name: string }) => entry.name)).toEqual(["button"]);
    expect(out.text).toContain("built public/r/index.json");
  });

  test("removes an item registry.json no longer lists, and leaves other files alone", async () => {
    current = project();
    // What an earlier build left: a registry item, named after its file.
    fs.writeFileSync(
      path.join(current.output, "dates.json"),
      `${JSON.stringify(
        {
          name: "dates",
          type: "registry:ui",
          files: [{ path: "ui/dates.tsx", type: "registry:ui", target: "components/ui/dates.tsx" }],
        },
        null,
        2,
      )}\n`,
    );
    fs.writeFileSync(path.join(current.output, "notes.txt"), "mine\n");

    const out = await captured(() =>
      runBuild("./registry.json", { cwd: current!.root, output: "./public/r" }),
    );

    expect(out.result).toBe(0);
    expect(fs.existsSync(path.join(current.output, "dates.json"))).toBe(false);
    expect(fs.existsSync(path.join(current.output, "notes.txt"))).toBe(true);
    expect(out.text).toContain("removed public/r/dates.json (not in registry.json)");
  });

  test("keeps a file the previous index lists once it is no longer item-shaped", async () => {
    current = project();
    fs.writeFileSync(
      path.join(current.output, "index.json"),
      `${JSON.stringify({ name: "test", homepage: "", items: [{ name: "dates" }] })}\n`,
    );
    fs.writeFileSync(path.join(current.output, "dates.json"), "{}\n");

    const out = await captured(() =>
      runBuild("./registry.json", { cwd: current!.root, output: "./public/r" }),
    );

    expect(out.result).toBe(0);
    expect(fs.existsSync(path.join(current.output, "dates.json"))).toBe(true);
    expect(out.text).not.toContain("removed public/r/dates.json");
  });

  test("leaves JSON it did not write alone, as with -o at a directory holding a project", async () => {
    current = project();
    // The output is the project root (`-o .`) or a directory beside other JSON: nothing here is
    // a registry item, so nothing is removed, whatever `registry.json` lists.
    for (const [name, content] of Object.entries({
      "package.json": '{"name":"app","private":true}\n',
      "tsconfig.json": '{"compilerOptions":{"strict":true}}\n',
      "notes.json": '{"name":"notes","private":true}\n',
      "broken.json": "{not json\n",
      "button.json.bak": "{}\n",
    })) {
      fs.writeFileSync(path.join(current.root, name), content);
    }

    const out = await captured(() =>
      runBuild("./registry.json", { cwd: current!.root, output: "." }),
    );

    expect(out.result).toBe(0);
    for (const name of [
      "package.json",
      "tsconfig.json",
      "notes.json",
      "broken.json",
      "button.json.bak",
      "registry.json",
    ]) {
      expect(fs.existsSync(path.join(current.root, name))).toBe(true);
    }
    expect(out.text).not.toContain("removed");
  });

  test("writes nothing when an item imports what no item ships", async () => {
    current = project();
    fs.writeFileSync(
      path.join(current.root, "ui/button.tsx"),
      'import { press } from "./lib/press";\n\nexport const Button = () => press;\n',
    );

    const out = await captured(() =>
      runBuild("./registry.json", { cwd: current!.root, output: "./public/r" }),
    );

    expect(out.result).toBe(1);
    expect(fs.existsSync(path.join(current.output, "index.json"))).toBe(false);
    expect(out.errors.join("\n")).toContain('imports "./lib/press", which no registry item ships');
  });
});
