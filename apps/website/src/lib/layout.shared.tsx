import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

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
 * The release the site documents, next to the name. The site deploys from `main`, so when the
 * changelog's `Unreleased` has entries it is ahead of that release and the label says so: `+`
 * after the version, spelled out for hover and screen readers. Both values are fixed at build time
 * (`vite.config.ts`). Not a link: the title it sits in already links home.
 */
function VersionLabel() {
  const version = `v${import.meta.env.DOCS_VERSION}`;
  const ahead = import.meta.env.DOCS_UNRELEASED;
  return (
    <span
      title={ahead ? `${version} with unreleased changes` : version}
      className="text-fd-muted-foreground rounded-md border px-1.5 py-0.5 font-mono text-xs font-normal"
    >
      {version}
      {ahead && (
        <>
          <span aria-hidden>+</span>
          <span className="sr-only"> with unreleased changes</span>
        </>
      )}
    </span>
  );
}

/**
 * The chrome the home layout and the docs layout share: the name with the version it documents, and
 * the repo it is edited in. No
 * `links`: the sidebar's tree already starts with Getting started, CLI, Theme and the components,
 * and the docs layout draws `links` in that same sidebar, so they would be listed twice.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {SITE_TITLE}
          <VersionLabel />
        </>
      ),
    },
    githubUrl: REPO_URL,
  };
}
