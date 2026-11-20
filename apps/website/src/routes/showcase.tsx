"use client";

/**
 * The showcase page (`/showcase`): the packaged showcase app (`apps/showcase`, built by
 * `docs:demos` into `public/showcase-app/`) running full width — NSH's official Gallery shell and its
 * scenes, rebuilt with this library's components, under each of the themes and live palette and
 * appearance switching inside the app.
 *
 * The page is outside the docs (`createFileRoute("/showcase")`, the home layout, no docs sidebar or
 * nav entry): the docs panel (`DemoPanel`) is a component page's preview; this is a whole app. The
 * frame carries the site's theme in `?theme=` (the packaged page's head script reads it before the
 * first paint, `player-options.ts`) and is told of later switches by message, as the panels are.
 */
import { createFileRoute } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { useEffect, useRef, useState } from "react";

import { siteTheme, withParam } from "@/components/fd/demo-panel";
import { baseOptions, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/layout.shared";

export const Route = createFileRoute("/showcase")({
  component: Showcase,
  head: () => ({
    meta: [
      { title: `Showcase · ${SITE_TITLE}` },
      { name: "description", content: SITE_DESCRIPTION },
    ],
  }),
});

/**
 * The app's packaged page, under the site's own origin: `public/showcase-app/` (the packager's
 * output, `build-demos.ts`), not `public/showcase/` — the prerenderer writes this route's page to
 * `showcase/index.html`, and the two cannot share one path.
 */
const APP_HREF = "/showcase-app/index.html";

/** The desktop layout the app is worth: as wide as the page, at a window's height. */
const FRAME_HEIGHT = 720;

function Showcase() {
  // The frame's URL is set once the theme is known (after mount, so the static markup and the
  // first client render agree).
  const [src, setSrc] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    const apply = () => {
      const theme = siteTheme();
      setSrc((current) => current ?? withParam(APP_HREF, "theme", theme));
      const running = frame.current;
      if (!running) return;
      // A running app is told of a switch by message; the URL is only what it loaded with.
      if (loaded.current) running.contentWindow?.postMessage({ theme }, window.location.origin);
      running.dataset.theme = theme;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        { text: "Docs", url: "/docs/getting-started" },
        { text: "Components", url: "/docs/components" },
        { text: "Themes", url: "/docs/themes" },
      ]}
    >
      <main className="mx-auto flex w-full max-w-(--fd-layout-width) min-w-0 flex-col gap-6 px-4 py-16 md:px-8 md:py-24">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Showcase</h1>
          <p className="text-fd-muted-foreground max-w-3xl">
            NSH&apos;s official Gallery, rebuilt with this library&apos;s components: the sidebar
            and the scenes, each theme and appearance chosen live inside the app.
          </p>
        </section>
        <div className="border-fd-border not-prose overflow-hidden rounded-xl border">
          <iframe
            ref={frame}
            src={src}
            title="The shadcn-nsh showcase app"
            loading="lazy"
            onLoad={() => {
              loaded.current = true;
              if (frame.current) frame.current.dataset.theme = siteTheme();
            }}
            className="block w-full border-0 bg-transparent"
            style={{ height: FRAME_HEIGHT }}
          />
        </div>
      </main>
    </HomeLayout>
  );
}
