/**
 * The rules `packages/ui` holds beyond what TypeScript and the theme check see
 * (`docs/ARCHITECTURE.md`): a component never picks a theme's geometry by name, never paints a colour that is
 * not a theme role, and never writes a state's colour into a Tailwind class; an import stays inside
 * the layer it is written in; and every export says with a doc comment what it is for. A font family
 * is `font.sans` / `font.mono` (or a `font-sans` / `font-mono` class), never a `fontFamily` string,
 * and a caller's `class` is appended with `joinClass`, never written over by hand. The markers
 * `// color: <why>`, `// state: <why>` and `// font: <why>` say why one line departs (on the line or
 * the line above); an import or an export that departs is on `allowlist` with its reason.
 *
 * Pure: no `node:fs`, so the unit test reads it and the script walks the files.
 */
import { parseSync } from "oxc-parser";
import type { Comment, Declaration } from "oxc-parser";

export interface Violation {
  /** The file, relative to the repository root. */
  file: string;
  /** 1-based line. */
  line: number;
  /** 1-based column. */
  column: number;
  /** Which rule failed. */
  rule: "theme-name" | "colour" | "state" | "font-literal" | "class-merge" | "layer" | "jsdoc";
  /** The line's text, trimmed. */
  text: string;
  /** What an `Allowance` names to excuse this line: an import's specifier, or an export's name. */
  match?: string;
}

/** One line that departs from a rule, with why it stays; the check fails once an entry is not needed. */
export interface Allowance {
  /** The file, relative to the repository root. */
  file: string;
  /** Which rule it departs from. */
  rule: "layer" | "jsdoc";
  /** What it excuses: an import's specifier, or an export's name. */
  match: string;
  /** One line: why the layer or the doc is right here as it is. */
  reason: string;
}

/**
 * Nothing in `packages/ui` departs yet: the layers hold and every export is documented. An entry
 * belongs here only when a line cannot follow the rule, never to get a check to pass.
 */
export const allowlist: Allowance[] = [];

/**
 * The specifiers a component may import from outside its own package: NSH (and its base, by any of
 * its entry points) and the icon set. Theme values come through `@shadcn-nsh/theme`'s entry, which
 * reads `theme.ts`; never one of its JSON files or a `themes/<name>/` directory directly.
 */
const allowedPackages = (specifier: string): boolean =>
  specifier === "nsh" ||
  specifier.startsWith("nsh/") ||
  specifier === "lucide" ||
  specifier.startsWith("lucide/") ||
  specifier === "@shadcn-nsh/theme";

/** The theme names a component must not compare against: a component reads the dimensions, not the theme. */
const themeNames = ["apple", "material", "shadcn", "solid-glass", "winui"] as const;

const themeName = new RegExp(`["'](${themeNames.join("|")})["']`);

/** A Tailwind state variant whose value is a raw colour, or one built at run time. */
const stateColour =
  /\b(?:hover|group-hover|active|group-active|focus|focus-within|focus-visible|disabled|checked|data-[a-z-]+):(?:bg|text|border|ring|fill|stroke|shadow)-(?:white|black|\[#|\[rgb|\[hsl|\[oklch)/;

/** A state variant whose utility name is interpolated, so Tailwind never sees it. */
const stateComposed = /\b(?:hover|group-hover|active|group-active|focus|focus-within):\$\{/;

/** A font family written out (`fontFamily: "monospace"`). Read `font.mono` / `font.sans` instead. */
const fontLiteral = /fontFamily\s*:\s*["']/;

/**
 * A caller's `class` joined by hand: `props.class ? \`${own} ${props.class}\`` or `props.class ?? own`
 * (and the same for `mine.class`, or a `*Class` prop spliced into a template). `joinClass(own, props.class)`
 * is the one spelling. `props.class?.` is a read, and `props.itemClass ??` replaces a different prop.
 */
const classMerge = /(?:props|mine)\.class\s*\?(?:\?(?!\.)|\s*`)|(?:props|mine)\.\w*Class\s*\?\s*`/g;

const colourLiteral = [
  /#[0-9a-fA-F]{3,8}\b/,
  /\b(?:rgba?|hsla?)\(\s*[\d.]/,
  /\boklch\(\s*[\d.]/,
  /text-\[#/,
  /\b(?:bg|text|border|ring|fill|stroke)-(?:white|black)\b/,
  /(?<![\w-])black\/\d/,
];

/** The line without its comment, so prose about a colour or a theme is not code. */
const codeOf = (line: string): string => {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return "";
  const at = line.indexOf("//");
  if (at === -1) return line;
  // A `//` inside a string is part of it (`https://…`): only strip one that follows code.
  const before = line.slice(0, at);
  const quotes = (before.match(/["'`]/g) ?? []).length;
  return quotes % 2 === 0 ? before : line;
};

/** Whether the line or the one above it carries `marker`. */
const marked = (lines: string[], index: number, marker: string): boolean =>
  lines[index]!.includes(marker) || (index > 0 && lines[index - 1]!.includes(marker));

/** Where `index` (a 0-based offset in `source`) sits: its 1-based line and column, and that line's text. */
const at = (source: string, index: number) => {
  const before = source.slice(0, index);
  const line = before.split("\n").length;
  const column = index - before.lastIndexOf("\n");
  return { line, column, text: source.split("\n")[line - 1]?.trim() ?? "" };
};

/**
 * An import's specifier as a path from the repository root. `file` is the importing file's own
 * path, so `../x` is read against the file's directory, not the one the check runs from.
 */
const resolve = (file: string, specifier: string): { path: string; escapes: boolean } => {
  const parts = `${file.slice(0, file.lastIndexOf("/"))}/${specifier}`.split("/");
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) return { path: parts.join("/"), escapes: true };
      out.pop();
      continue;
    }
    out.push(part);
  }
  return { path: out.join("/"), escapes: false };
};

/** Whether `file` is a `packages/ui/lib` module (the layer a component may import, never the reverse). */
const inLib = (file: string): boolean => file.startsWith("packages/ui/lib/");

/** Whether `path` is a component file of `packages/ui` (not the shared `lib/` modules, not `index.ts`). */
const isComponent = (path: string): boolean =>
  path.startsWith("packages/ui/") &&
  !path.startsWith("packages/ui/lib/") &&
  path !== "packages/ui/index.ts";

/**
 * The import direction: a `packages/ui/lib` module never imports a component (`../button`: an
 * import list would have to be cut to `lib/`, since a component cannot be seen from there), and no
 * `packages/ui` file imports `apps/*`, `scripts/*`, another package, or one of the theme's JSON
 * files. Relative paths inside `packages/ui` and the three specifiers in `allowedPackages` are it.
 */
const imports = (source: string, file: string): Violation[] => {
  const { program } = parseSync(file, source);
  const found: Violation[] = [];
  for (const statement of program.body) {
    if (
      statement.type !== "ImportDeclaration" &&
      statement.type !== "ExportNamedDeclaration" &&
      statement.type !== "ExportAllDeclaration"
    ) {
      continue;
    }
    const specifier = "source" in statement ? statement.source : undefined;
    if (!specifier || specifier.type !== "Literal" || typeof specifier.value !== "string") continue;
    const report = () =>
      found.push({
        file,
        ...at(source, specifier.start),
        rule: "layer",
        match: specifier.value,
      });

    if (specifier.value.startsWith(".")) {
      const target = resolve(file, specifier.value);
      if (target.escapes || !target.path.startsWith("packages/ui")) report();
      else if (inLib(file) && isComponent(target.path)) report();
    } else if (!allowedPackages(specifier.value)) {
      report();
    }
  }
  return found;
};

/** A doc comment (`/** … *\/`) with words in it, nothing but whitespace between it and `start`. */
const documented = (comments: Comment[], start: number, source: string): boolean => {
  const last = comments.filter((comment) => comment.end <= start).pop();
  if (!last || last.type !== "Block" || !last.value.startsWith("*")) return false;
  if (/\S/.test(source.slice(last.end, start))) return false;
  return /\w/.test(last.value.replace(/\*/g, ""));
};

/** An identifier's name: a declaration's `id` is one, a destructuring pattern or a literal otherwise. */
const identifier = (id: { type: string; name?: string } | null | undefined): string | null =>
  id !== null && id !== undefined && (id.type === "Identifier" || id.type === "IdentifierName")
    ? (id.name ?? null)
    : null;

/** The name an exported declaration goes by, for the report: its own, or its declarators' names. */
const nameOf = (declaration: Declaration): string => {
  if ("declarations" in declaration) {
    return declaration.declarations
      .map((entry) => identifier(entry.id) ?? "(destructured)")
      .join(", ");
  }
  return "id" in declaration ? (identifier(declaration.id) ?? "(anonymous)") : "(anonymous)";
};

/** A function declaration's name, when the declaration is one (the only shape an overload takes). */
const signature = (declaration: Declaration | null): string | null =>
  declaration?.type === "FunctionDeclaration" || declaration?.type === "TSDeclareFunction"
    ? identifier(declaration.id)
    : null;

/**
 * Every export says what it is for: a function, a component, a type or a constant, with a `/** … *\/`
 * above it saying what it is, in a sentence. A re-export (`export * from`, `export { … }`) is the
 * other file's doc, and the second and later signatures of one overloaded function take the first's.
 */
const docs = (source: string, file: string): Violation[] => {
  const { program, comments } = parseSync(file, source);
  const found: Violation[] = [];
  let previous: Declaration | null = null;
  for (const statement of program.body) {
    if (statement.type === "ExportNamedDeclaration" && statement.declaration) {
      const declaration = statement.declaration;
      const group = signature(declaration);
      const documentedBefore =
        documented(comments, statement.start, source) ||
        (group !== null && group === signature(previous));
      if (!documentedBefore) {
        found.push({
          file,
          ...at(source, statement.start),
          rule: "jsdoc",
          match: nameOf(declaration),
        });
      }
      previous = declaration;
      continue;
    }
    previous = null;
  }
  return found;
};

/** The violations of one file's source, in line order. */
export function violations(
  source: string,
  file: string,
  allowed: Allowance[] = allowlist,
): Violation[] {
  const lines = source.split("\n");
  const found: Violation[] = [];
  lines.forEach((raw, index) => {
    const line = index + 1;
    const code = codeOf(raw);
    if (code.trim() === "") return;
    const report = (rule: Violation["rule"], column: number) =>
      found.push({ file, line, column, rule, text: raw.trim() });

    const name = themeName.exec(code);
    if (name) report("theme-name", name.index + 1);
    const stateHit = marked(lines, index, "// state:")
      ? null
      : (stateColour.exec(code) ?? stateComposed.exec(code));
    if (stateHit) report("state", stateHit.index + 1);
    if (!stateHit && !marked(lines, index, "// color:")) {
      for (const pattern of colourLiteral) {
        const hit = pattern.exec(code);
        if (hit) {
          report("colour", hit.index + 1);
          break;
        }
      }
    }
    if (!marked(lines, index, "// font:")) {
      const fontHit = fontLiteral.exec(code);
      if (fontHit) report("font-literal", fontHit.index + 1);
    }
  });
  // Across lines: `props.class` and the `? \`` that follows it may not share a line.
  const stripped = lines.map(codeOf).join("\n");
  classMerge.lastIndex = 0;
  for (const hit of stripped.matchAll(classMerge)) {
    const where = at(stripped, hit.index ?? 0);
    found.push({ file, ...where, rule: "class-merge" });
  }
  const excused = (violation: Violation): boolean =>
    allowed.some(
      (entry) =>
        entry.file === violation.file &&
        entry.rule === violation.rule &&
        entry.match === (violation.match ?? violation.text),
    );
  found.push(...imports(source, file), ...docs(source, file));
  return found
    .filter((violation) => !excused(violation))
    .sort((a, b) => a.line - b.line || a.column - b.column);
}
