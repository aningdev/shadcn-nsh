import Link from "fumadocs-core/link";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { OTHER_DOCS } from "@/lib/base";

/** The site's name and description, for the chrome and every page's head. */
export const SITE_TITLE = "shadcn-nsh";

export const SITE_DESCRIPTION =
  "Styled component layer for Native Shell: copy-into-app components on nsh/base, same idea as shadcn/ui on Radix.";

/** The repository the docs are edited in; the URLs below are read from it. */
export const gitConfig = {
  user: "aningdev",
  repo: "shadcn-nsh",
  branch: "main",
};

export const REPO_URL = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

export const EDIT_BASE = `${REPO_URL}/edit/${gitConfig.branch}/`;

export const NSH_SITE_URL = "https://nsh.dev";

/**
 * What this build documents, next to the name and linking the other docs site: the release at the
 * root, `main` under `/dev/`. The release label carries the version (`packages/cli/package.json`),
 * with `+` when the changelog's `Unreleased` has entries and an explanation for hover and screen
 * readers; the dev label says it is `main`. Both values are fixed at build time (`vite.config.ts`),
 * and so is the site the label leads to (`OTHER_DOCS`).
 */
function VersionLabel() {
  const dev = import.meta.env.DOCS_CHANNEL === "dev";
  const version = `v${import.meta.env.DOCS_VERSION}`;
  const ahead = !dev && import.meta.env.DOCS_UNRELEASED;
  const label = dev ? "dev (main)" : version;
  return (
    <a
      href={OTHER_DOCS.href}
      title={OTHER_DOCS.title}
      className="text-fd-muted-foreground hover:text-fd-foreground rounded-md border px-1.5 py-0.5 font-mono text-xs font-normal transition-colors"
    >
      {label}
      {ahead && (
        <>
          <span aria-hidden>+</span>
          <span className="sr-only"> with unreleased changes</span>
        </>
      )}
      <span className="sr-only"> — {OTHER_DOCS.label}</span>
    </a>
  );
}

/**
 * The chrome the home layout and the docs layout share: the name linking home, what this build
 * documents, and where the other docs site is, plus the repo it is edited in. No
 * `links`: the sidebar's tree already starts with Getting started, CLI, Theme and the components,
 * and the docs layout draws `links` in that same sidebar, so they would be listed twice.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // A function so the name stays the home link while the label, itself a link to the other
      // docs site, sits beside it.
      title: ({ href, ...props }) => (
        <span className="flex items-center gap-2">
          <Link href={href} {...props}>
            {SITE_TITLE}
          </Link>
          <VersionLabel />
        </span>
      ),
    },
    githubUrl: REPO_URL,
  };
}
