"use client";

/**
 * The showcase app running in a frame: the packaged `apps/showcase` (built by `docs:demos` into
 * `public/showcase/`) — NSH's official Gallery shell and its scenes, rebuilt with this library's
 * components, with the palette and the appearance switched live inside the app. The home page's
 * "See it running" shows it.
 *
 * The frame carries the site's theme in `?theme=` (the packaged page's head script reads it before
 * the first paint, `player-options.ts`) and is told of later switches by message, as the demo
 * panels are.
 */
import { useEffect, useRef, useState } from "react";

import { siteTheme, withParam } from "@/components/fd/demo-panel";

/** The app's packaged page, under the site's own origin (the packager's output, `build-demos.ts`). */
const APP_HREF = "/showcase/index.html";

/** The desktop layout the app is worth: as wide as the page, at a window's height. */
const FRAME_HEIGHT = 720;

export function ShowcaseFrame() {
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
  );
}
