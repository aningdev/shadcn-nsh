import type { NshUiConfig } from "../types";
import { relativeImport, resolveAlias } from "./paths";

/** Rewrite monorepo / package imports to the consumer project's aliases. */
export function transformContent(
  content: string,
  absoluteTargetFile: string,
  config: NshUiConfig,
  cwd: string,
) {
  const themeModule = resolveAlias(cwd, config.aliases.theme);
  const themeImport = relativeImport(absoluteTargetFile, themeModule);

  return content
    .replaceAll(`from "@shadcn-nsh/theme"`, `from "${themeImport}"`)
    .replaceAll(`from '@shadcn-nsh/theme'`, `from '${themeImport}'`);
}
