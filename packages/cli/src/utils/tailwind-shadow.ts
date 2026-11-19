import fs from "node:fs/promises";
import path from "node:path";

import { parse } from "jsonc-parser";

import { isRecord } from "./registry-schema";
import { resolveWorkspace } from "./workspace";

/** The docs section on the `"tailwind"` override: why the colors win, and how to avoid it. */
const DOCS = "https://shadcn-nsh.aning.dev/docs/theme#override-from-nshjson";

/**
 * The names an app's `"tailwind"` `colors` shadows of its theme's tokens.
 *
 * NSH lets a Tailwind color win over the theme token of the same name, for classes only
 * (Tailwind, "Your Tailwind colors win"): with `"colors": { "primary": "#f00" }`, `bg-primary`
 * is red while `token("primary")` and the components drawing with the theme keep the theme's
 * color — two colors for one name, inside one control.
 *
 * `tokens` are the theme's token names, as its file writes them (its CSS variables' without
 * `--`); `colors` is the `"colors"` object as `nsh.json` has it, and one that is no object
 * shadows nothing. A shade of a color (`{ "brand": { "500": … } }`) names no token, so only
 * the top-level names are compared. The names come back in the order the app wrote them.
 */
export function shadowedTokens(tokens: Iterable<string>, colors: unknown): string[] {
  if (!isRecord(colors)) return [];
  const theme = new Set(tokens);
  return Object.keys(colors).filter((name) => theme.has(name));
}

/**
 * The theme tokens the app at `appDir` shadows with `"tailwind"` `colors`, read from its
 * `nsh.json`: the theme is the file `"theme"` names, relative to the `nsh.json`, or the theme
 * written in it. An `nsh.json` or theme file that is missing or unreadable shadows nothing —
 * this only warns, so it never fails a command over a file NSH itself reports on.
 */
export async function shadowedThemeTokens(appDir: string): Promise<string[]> {
  const nsh = await readJsonc(path.join(appDir, "nsh.json"));
  if (!isRecord(nsh)) return [];
  const colors = isRecord(nsh.tailwind) ? nsh.tailwind.colors : undefined;
  if (!isRecord(colors)) return [];

  const theme =
    typeof nsh.theme === "string" ? await readJsonc(path.resolve(appDir, nsh.theme)) : nsh.theme;
  return shadowedTokens(themeTokens(theme), colors);
}

/**
 * One line on stderr per app whose `"tailwind"` `colors` shadow theme tokens, naming them and
 * the docs section; nothing for an app whose colors shadow none.
 *
 * `cwd` is the app or monorepo directory a command was given: in a monorepo each app has its
 * own `nsh.json` and its own colors, so each one that shadows gets its line, the path saying
 * which. `init` and `add` call it after their own output; it warns, and never fails them.
 */
export async function warnShadowedTokens(cwd: string): Promise<void> {
  const { apps } = await resolveWorkspace(cwd);
  for (const appDir of apps) {
    const names = await shadowedThemeTokens(appDir);
    if (names.length === 0) continue;
    const nshJson = path.relative(path.resolve(cwd), path.join(appDir, "nsh.json"));
    console.error(
      `shadcn-nsh: ${nshJson}'s tailwind.colors shadows the theme tokens ${names.join(", ")} — ` +
        `token classes take the Tailwind color, token() the theme's. See ${DOCS}`,
    );
  }
}

/**
 * Every token name the theme defines, shadcn's `cssVars` as `nsh.json`'s `"theme"` gives it:
 * `theme`'s names in both appearances, `light`'s and `dark`'s. A name whose value NSH cannot
 * read (it takes a string or a number) is no token, so it is left out — the same names NSH
 * checks token classes against.
 */
function themeTokens(theme: unknown): string[] {
  if (!isRecord(theme)) return [];
  const cssVars = theme.cssVars;
  if (!isRecord(cssVars)) return [];

  const names = new Set<string>();
  for (const section of ["theme", "light", "dark"]) {
    const vars = cssVars[section];
    if (!isRecord(vars)) continue;
    for (const [name, value] of Object.entries(vars)) {
      if (typeof value === "string" || typeof value === "number") names.add(name);
    }
  }
  return [...names];
}

/** A JSON(C) file's value, `undefined` when there is no such file: the files here are the
 *  app's, they may carry comments, and one that is broken is NSH's to report. */
async function readJsonc(file: string): Promise<unknown> {
  try {
    return parse(await fs.readFile(file, "utf8"), [], { allowTrailingComma: true });
  } catch {
    return undefined;
  }
}
