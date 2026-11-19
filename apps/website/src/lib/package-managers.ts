/**
 * The package managers an install command is shown in, and the group its tabs share.
 *
 * `vite.config.ts` hands this list to Fumadocs' `remarkNpm`, which turns a fence tagged `npm`
 * into the site's own `CodeBlockTabs`; `InstallTabs` draws the same tabs from the same list for the
 * install line the themes page writes in JSX. Fumadocs' default list also offers yarn and writes
 * Bun's command as `bun x`; this site shows three tabs and writes pnpm's as `pnx` and Bun's as
 * `bunx`, so the list is spelled out here once.
 *
 * Every line of an install command is a `npx shadcn-nsh …` line, so a manager's command is one
 * substitution per line and anything else in a snippet is left as it is.
 */
export interface PackageManager {
  /** The tab's label, and the value the tabs remember. */
  name: "npm" | "pnpm" | "bun";
  /** The command as this manager runs it. */
  command: (command: string) => string;
}

/**
 * The `groupId` every install tab block carries: Fumadocs keeps the choice in it (session storage,
 * and local storage because the blocks persist), so picking pnpm in one block picks it in the rest
 * and after a reload.
 */
export const PACKAGE_MANAGER_GROUP = "package-manager";

export const PACKAGE_MANAGERS: PackageManager[] = [
  { name: "npm", command: (command) => command },
  { name: "pnpm", command: (command) => command.replace(/^npx /gm, "pnx ") },
  { name: "bun", command: (command) => command.replace(/^npx /gm, "bunx ") },
];
