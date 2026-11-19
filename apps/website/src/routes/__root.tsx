import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";

import SearchDialog from "@/components/fd/search";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/layout.shared";
import { sitePaletteCss } from "@/lib/themes";

import appCss from "@/styles/fd.css?url";

/** The site in the shadcn theme (`src/lib/themes.ts`), read once. */
const PALETTE_CSS = sitePaletteCss();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      // `maximum-scale=1`: iOS Safari zooms the page into an input under 16 points as it takes the
      // focus — the search field's, and a preview's (NSH's inputs are 14), whose frame zooms this
      // page. Pinching still zooms on iOS.
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // The app icon's mark, in the arch it has on nsh (`public/favicon.svg`).
      { rel: "icon", href: `${import.meta.env.BASE_URL}favicon.svg`, type: "image/svg+xml" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: PALETTE_CSS }} />
        <HeadContent />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog }}>
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
