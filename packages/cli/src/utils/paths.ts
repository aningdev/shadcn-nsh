import path from "node:path";

/** Resolve a project-relative alias like `./lib/theme` against cwd. */
export function resolveAlias(cwd: string, alias: string) {
  return path.resolve(cwd, alias);
}

/** Relative import from one absolute file path to another module (no extension). */
export function relativeImport(fromFile: string, toModuleFile: string) {
  let rel = path.relative(path.dirname(fromFile), toModuleFile);
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel.replace(/\\/g, "/").replace(/\.(tsx?|jsx?)$/, "");
}

export function defaultTarget(
  file: { path: string; type: string; target?: string },
  aliases: {
    ui: string;
    lib: string;
  },
) {
  if (file.target) return file.target;
  const base = path.basename(file.path);
  if (file.type === "registry:ui") return path.posix.join(aliases.ui.replace(/^\.\//, ""), base);
  if (file.type === "registry:lib") return path.posix.join(aliases.lib.replace(/^\.\//, ""), base);
  return base;
}
