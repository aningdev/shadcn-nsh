import path from "node:path";

import type { NshUiConfig } from "../types";
import { relativeImport, resolveAlias } from "./paths";

/**
 * Rewrite monorepo / package imports to the consumer project's aliases.
 *
 * `./lib/*` covers every shared module the registry ships (`state`, `utils`, `surface`, etc.):
 * each is installed under the app's `lib` alias, while the importing component
 * sits under `components/ui`, so the relative import must be recomputed.
 * Without it, `./lib/state` from `components/ui/x.tsx` would resolve to
 * `components/ui/lib/state`.
 */
export function transformContent(
  content: string,
  absoluteTargetFile: string,
  config: NshUiConfig,
  cwd: string,
) {
  const themeModule = resolveAlias(cwd, config.aliases.theme);
  const themeImport = relativeImport(absoluteTargetFile, themeModule);
  const libDir = resolveAlias(cwd, config.aliases.lib);
  const schemaImport = relativeImport(absoluteTargetFile, path.join(libDir, "schema"));
  const baseImport = relativeImport(absoluteTargetFile, path.join(libDir, "base"));

  const rewritten = content
    .replaceAll(`from "@shadcn-nsh/theme"`, `from "${themeImport}"`)
    .replaceAll(`from '@shadcn-nsh/theme'`, `from '${themeImport}'`)
    .replaceAll(`from "../../schema"`, `from "${schemaImport}"`)
    .replaceAll(`from '../../schema'`, `from '${schemaImport}'`)
    .replaceAll(`from "../nsh-gallery"`, `from "${baseImport}"`)
    .replaceAll(`from '../nsh-gallery'`, `from '${baseImport}'`)
    .replaceAll(`from "./themes/nsh-gallery"`, `from "${baseImport}"`)
    .replaceAll(`from './themes/nsh-gallery'`, `from '${baseImport}'`);

  return rewritten.replace(
    /from (["'])\.\/lib\/([\w-]+)\1/g,
    (_match, quote: string, name: string) =>
      `from ${quote}${relativeImport(absoluteTargetFile, path.join(libDir, name))}${quote}`,
  );
}
