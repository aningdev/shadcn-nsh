import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Test fixtures: a temporary NSH app and a `file://` registry holding real items copied out of
 * `public/r` (the built registry), so commands run end to end over `fetch` without a server.
 *
 * Test-only; nothing in the published CLI imports it.
 */
export type Fixture = {
  /** The temporary directory holding both the app and the registry. */
  root: string;
  /** The app: `nsh.json` and whatever the commands write. */
  app: string;
  /** The registry directory: `<item>.json` for each item, plus `index.json`. */
  registry: string;
  /** The `--registry` value pointing at the fixture registry. */
  url: string;
  write(relative: string, content: string): string;
  read(relative: string): string;
  exists(relative: string): boolean;
  remove(): void;
};

const repo = path.resolve(import.meta.dir, "../../../..");

export function makeFixture(opts: {
  /** Item names to copy from `public/r` into the fixture registry. */
  items: string[];
  /** Files to put in the app first, relative to the app root. */
  files?: Record<string, string>;
}): Fixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-nsh-"));
  const app = path.join(root, "app");
  const registry = path.join(root, "registry");
  fs.mkdirSync(app, { recursive: true });
  fs.mkdirSync(registry, { recursive: true });

  fs.writeFileSync(
    path.join(app, "nsh.json"),
    `${JSON.stringify({ name: "T", id: "dev.t", version: "0.0.0", build: 1 }, null, 2)}\n`,
  );

  const catalog: unknown[] = [];
  for (const name of opts.items) {
    const item = JSON.parse(
      fs.readFileSync(path.join(repo, "public/r", `${name}.json`), "utf8"),
    ) as {
      name: string;
      type: string;
      title?: string;
      description?: string;
      files: { path: string; type: string; target?: string }[];
    };
    fs.writeFileSync(path.join(registry, `${name}.json`), `${JSON.stringify(item, null, 2)}\n`);
    catalog.push({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      files: item.files.map(({ path: file, type, target }) => ({ path: file, type, target })),
    });
  }
  fs.writeFileSync(
    path.join(registry, "index.json"),
    `${JSON.stringify({ name: "fixture", homepage: "", items: catalog }, null, 2)}\n`,
  );

  const fixture: Fixture = {
    root,
    app,
    registry,
    url: `file://${registry}/{name}.json`,
    write(relative, content) {
      const file = path.join(app, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
      return file;
    },
    read(relative) {
      return fs.readFileSync(path.join(app, relative), "utf8");
    },
    exists(relative) {
      return fs.existsSync(path.join(app, relative));
    },
    remove() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };

  for (const [relative, content] of Object.entries(opts.files ?? {}))
    fixture.write(relative, content);

  return fixture;
}

/**
 * Run `fn` with `console.log` collected, so a command's output can be asserted, and
 * `console.error` too (`errors`), for the commands that report a problem there.
 */
export async function captured<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; lines: string[]; text: string; errors: string[] }> {
  const lines: string[] = [];
  const errors: string[] = [];
  const log = console.log;
  const error = console.error;
  console.log = (...args: unknown[]) => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  };
  console.error = (...args: unknown[]) => {
    errors.push(args.map((arg) => String(arg)).join(" "));
  };
  try {
    const result = await fn();
    return { result, lines, text: lines.join("\n"), errors };
  } finally {
    console.log = log;
    console.error = error;
  }
}
