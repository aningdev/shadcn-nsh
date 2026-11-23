/// <reference types="vite/client" />

/** Set by `define` in `vite.config.ts` at build time. */
interface ImportMetaEnv {
  /** The released version the site documents: `packages/cli/package.json`'s. */
  readonly DOCS_VERSION: string;
  /** `CHANGELOG.md`'s `Unreleased` has entries: the site is ahead of `DOCS_VERSION`. */
  readonly DOCS_UNRELEASED: boolean;
  /**
   * Which docs site this build is: `dev` for `main` at `/dev/`, `release` for a `v*` tag at the
   * root. Derived from `DOCS_BASE` (`vite.config.ts`).
   */
  readonly DOCS_CHANNEL: "dev" | "release";
}
