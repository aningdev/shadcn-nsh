import path from "node:path";

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
  const popupModule = path.join(resolveAlias(cwd, config.aliases.lib), "popup-surface");
  const popupImport = relativeImport(absoluteTargetFile, popupModule);

  return content
    .replaceAll(`from "@shadcn-nsh/theme"`, `from "${themeImport}"`)
    .replaceAll(`from '@shadcn-nsh/theme'`, `from '${themeImport}'`)
    .replaceAll(`from "./lib/popup-surface"`, `from "${popupImport}"`)
    .replaceAll(`from './lib/popup-surface'`, `from '${popupImport}'`);
}
