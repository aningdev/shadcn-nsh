/**
 * The type checker's half of the `@/` import alias: the docs' snippets import
 * `@/components/ui/<name>` and `@/lib/…`, so an app's `tsconfig.json` must map `"@/*"` to the
 * app root for `nsh check` and the editors. The bundler reads `nsh.json`, not this file; init
 * sets both. A child tsconfig's `paths` replace the base's, so ours carry the NSH mappings the
 * base declares too.
 *
 * Existing files are edited through `setJsonValue`: comments, untouched keys and their
 * formatting survive, and the inserted entries are written the way the file itself is.
 */
import fs from "node:fs/promises";
import path from "node:path";

import { parse, printParseErrorCode, type JSONPath, type ParseError } from "jsonc-parser";

import { setJsonValue } from "./jsonc-edit";
import { isNotFound, isRecord } from "./registry-schema";

/** NSH's own type mappings, restated for the app root, for when there is no
 * `.nsh/tsconfig.json` to read them from. */
export const NSH_TYPE_PATHS: Record<string, string[]> = {
  nsh: ["./.nsh/types/nsh/index.d.ts"],
  "nsh/*": ["./.nsh/types/nsh/*.d.ts"],
  "*": ["./.nsh/types/*.d.ts"],
};

/** What `ensureAtPaths` did to the app's `tsconfig.json`. */
export type AtPaths = {
  /** `wrote` the file, `merged` entries into it, found it `present` (nothing to do), `conflict`
   *  (`@/*` maps somewhere else — left alone), or `warn` (not understood — left alone). */
  status: "wrote" | "merged" | "present" | "conflict" | "warn";
  /** For `merged`: `"base"` when the NSH base's own mappings were restated with `@/*`. For
   *  `conflict`: where `@/*` maps now. For `warn`: what could not be read. */
  detail?: string;
};

/** The parse options every read here uses: JSONC, for tsconfig allows both. */
const READ = { allowTrailingComma: true } as const;

/**
 * The `compilerOptions.paths` of `<app>/.nsh/tsconfig.json`, each target rewritten for the app
 * root — TypeScript resolves the base's `paths` against the base file's own directory. Null
 * when there is nothing to read: missing, unreadable, or no paths.
 */
export async function nshTypePaths(appDir: string): Promise<Record<string, string[]> | null> {
  const file = path.join(appDir, ".nsh", "tsconfig.json");
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
  const errors: ParseError[] = [];
  const root = parse(text, errors, READ);
  if (errors.length > 0 || !isRecord(root)) return null;
  const compilerOptions = root.compilerOptions;
  if (!isRecord(compilerOptions)) return null;
  const declared = compilerOptions.paths;
  if (!isRecord(declared)) return null;

  const base = path.join(appDir, ".nsh");
  const fromBase = (target: string) => {
    const rel = path.relative(appDir, path.resolve(base, target)).split(path.sep).join("/");
    return rel.startsWith("..") ? rel : `./${rel}`;
  };
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(declared)) {
    const targets = (Array.isArray(value) ? value : [value]).map((target) =>
      typeof target === "string" ? fromBase(target) : String(target),
    );
    out[key] = targets;
  }
  return out;
}

/** The base's paths plus the one this CLI is here to add, `@/*` last. */
function withAt(paths: Record<string, string[]>): Record<string, string[]> {
  return { ...paths, "@/*": ["./*"] };
}

/** The base's mappings — read from `.nsh/tsconfig.json` when there is one, this CLI's knowledge
 *  of NSH's when there is not. */
async function basePaths(appDir: string): Promise<Record<string, string[]>> {
  return (await nshTypePaths(appDir)) ?? NSH_TYPE_PATHS;
}

/**
 * Make the app's `tsconfig.json` map `"@/*"` to the app root: write the file when there is
 * none, merge into one that is there — its comments, key order and every other key kept — and
 * leave one alone that cannot be read, or that maps `@/*` somewhere else, and say so, for the
 * command to warn about: the docs' snippets import `@/components/ui/…` and `@/lib/…`, and where
 * `@/*` goes is the app's choice, not ours to overwrite.
 */
export async function ensureAtPaths(appDir: string): Promise<AtPaths> {
  const file = path.join(appDir, "tsconfig.json");
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch (error) {
    if (!isNotFound(error)) return { status: "warn", detail: String(error) };
    const read = await nshTypePaths(appDir);
    await fs.writeFile(file, composeFresh(read ?? NSH_TYPE_PATHS, read == null));
    return { status: "wrote" };
  }

  const errors: ParseError[] = [];
  const root = parse(text, errors, READ);
  const [first] = errors;
  if (first) {
    return {
      status: "warn",
      detail: `could not be read as JSONC (${printParseErrorCode(first.error)} at ${first.offset})`,
    };
  }
  if (!isRecord(root)) return { status: "warn", detail: "not a JSON object at the top" };

  const set = async (jsonPath: JSONPath, value: unknown): Promise<void> => {
    await fs.writeFile(file, setJsonValue(text, jsonPath, value));
  };

  const compilerOptions = root.compilerOptions;
  if (compilerOptions === undefined) {
    await set(["compilerOptions"], { paths: withAt(await basePaths(appDir)) });
    return { status: "merged", detail: "base" };
  }
  if (!isRecord(compilerOptions)) {
    return { status: "warn", detail: "compilerOptions is not an object" };
  }

  const paths = compilerOptions.paths;
  if (paths === undefined) {
    await set(["compilerOptions", "paths"], withAt(await basePaths(appDir)));
    return { status: "merged", detail: "base" };
  }
  if (!isRecord(paths)) {
    return { status: "warn", detail: "compilerOptions.paths is not an object" };
  }
  if (Object.keys(paths).length === 0) {
    // An empty `paths` declares the replacement just as well as none at all, so fill it in
    // place — with the base's mappings, not only `@/*`.
    await set(["compilerOptions", "paths"], withAt(await basePaths(appDir)));
    return { status: "merged", detail: "base" };
  }

  const at = paths["@/*"];
  if (at !== undefined) {
    if (JSON.stringify(at) === JSON.stringify(["./*"]) || at === "./*") {
      return { status: "present" };
    }
    return { status: "conflict", detail: JSON.stringify(at) };
  }

  await set(["compilerOptions", "paths", "@/*"], ["./*"]);
  return { status: "merged" };
}

/** A fresh `tsconfig.json`: the NSH base under it, the base's own mappings restated, and
 *  `@/*`. `fallback` says the mappings were not read from the base but spelled out here, and
 *  the comment says why they are spelled out. */
function composeFresh(paths: Record<string, string[]>, fallback: boolean): string {
  const entries = Object.entries(withAt(paths)).map(
    ([key, targets]) => `      ${JSON.stringify(key)}: ${JSON.stringify(targets)}`,
  );
  const note = fallback
    ? `      // No .nsh/tsconfig.json to read: NSH's own mappings, as this CLI knows them.\n` +
      `      // A child's "paths" replace the base's, so these are restated here.\n`
    : "";
  return `{
  "extends": "./.nsh/tsconfig.json",
  "compilerOptions": {
    "paths": {
${note}${entries.join(",\n")}
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
`;
}
