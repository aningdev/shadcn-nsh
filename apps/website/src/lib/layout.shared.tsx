import Link from "fumadocs-core/link";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { VersionSwitch } from "@/components/fd/version-switch";

/** The site's name and description, for the chrome and every page's head. */
export const SITE_TITLE = "shadcn-nsh";

export const SITE_DESCRIPTION =
  "Styled, themeable UI for Native Shell, built on nsh/base. Install with TSX nshm or the copy-into-app CLI. No third-party runtime dependency.";

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
 * The chrome the home layout and the docs layout share: the name linking home and a version
 * selector next to it to switch between the latest release (`/`) and `dev` (`/dev/`). No
 * `links`: the sidebar's tree already starts with Get started, Theming, and the components,
 * and the docs layout draws `links` in that same sidebar, so they would be listed twice.
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // A function so the name stays the home link while the version selector sits beside it.
      title: ({ href, ...props }) => (
        <span className="flex items-center gap-2">
          <Link href={href} {...props}>
            {SITE_TITLE}
          </Link>
          <VersionSwitch />
        </span>
      ),
    },
    githubUrl: REPO_URL,
  };
}
