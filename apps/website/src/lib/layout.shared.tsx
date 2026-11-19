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

const appName = SITE_TITLE;

/**
 * The chrome the home layout and the docs layout share: the name, and the repo it is edited in. No
 * `links`: the sidebar's tree already starts with Getting started, CLI, Theme and the components,
 * and the docs layout draws `links` in that same sidebar, so they would be listed twice.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
    githubUrl: REPO_URL,
  };
}
