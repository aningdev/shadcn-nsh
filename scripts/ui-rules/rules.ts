/**
 * The rules `packages/ui` holds beyond what TypeScript and the theme check see (docs/ARCHITECTURE.md,
 * P8): a component never picks a theme's geometry by name, never paints a colour that is not a theme
 * role, and never writes a state's colour into a Tailwind class. The two markers `// color: <why>` and
 * `// state: <why>` say why one line departs (on the line or the line above).
 *
 * Pure: no `node:fs`, so the unit test reads it and the script walks the files.
 */

export interface Violation {
  /** The file, relative to the repository root. */
  file: string;
  /** 1-based line. */
  line: number;
  /** 1-based column. */
  column: number;
  /** Which rule failed. */
  rule: "controls" | "theme-name" | "colour" | "state";
  /** The line's text, trimmed. */
  text: string;
}

/**
 * The components whose colour literals are not the interface's, each with the reason it stays:
 * a platform's fixed identity colour, an identity hue, or an ink a template recolours.
 */
/** The theme names a component must not compare against: a component reads the dimensions, not the theme. */
const themeNames = ["apple", "material", "shadcn", "solid-glass", "winui"] as const;

const themeName = new RegExp(`["'](${themeNames.join("|")})["']`);

/** A Tailwind state variant whose value is a raw colour, or one built at run time. */
const stateColour =
  /\b(?:hover|group-hover|active|group-active|focus|focus-within|focus-visible|disabled|checked|data-[a-z-]+):(?:bg|text|border|ring|fill|stroke|shadow)-(?:white|black|\[#|\[rgb|\[hsl|\[oklch)/;

/** A state variant whose utility name is interpolated, so Tailwind never sees it. */
const stateComposed = /\b(?:hover|group-hover|active|group-active|focus|focus-within):\$\{/;

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

/** The violations of one file's source, in line order. */
export function violations(source: string, file: string): Violation[] {
  const lines = source.split("\n");
  const found: Violation[] = [];
  lines.forEach((raw, index) => {
    const line = index + 1;
    const code = codeOf(raw);
    if (code.trim() === "") return;
    const report = (rule: Violation["rule"], column: number) =>
      found.push({ file, line, column, rule, text: raw.trim() });

    if (/(?<![\w.])controls\(\s*\)/.test(code) || /\bControls\b/.test(code)) report("controls", 1);
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
  });
  return found;
}
