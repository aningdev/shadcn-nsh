import { readFileSync } from "node:fs";
import { join } from "node:path";

// Same allsum-light / allsum-dark themes as references/nsh/website: Shiki emits
// light hex values; global.css maps them onto --code-* for both site themes.
const theme = (name) =>
  JSON.parse(readFileSync(join(process.cwd(), "src", `${name}.theme.json`), "utf8"));

export const themes = { light: theme("light"), dark: theme("dark") };

export const langs = [
  "tsx",
  "ts",
  "js",
  "json",
  "sh",
  "bash",
  "diff",
  "html",
  "yaml",
  "css",
];

/** Package-manager fence langs highlight as shell. */
export const langAlias = {
  npx: "bash",
  bunx: "bash",
  pnx: "bash",
  yarn: "bash",
};

export const shikiConfig = {
  themes,
  defaultColor: "light",
  langs,
  langAlias,
};
