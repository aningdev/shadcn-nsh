"use client";

/**
 * The showcase app running in a frame: the packaged `apps/showcase` (built by `docs:demos` into
 * `public/showcase/`) — NSH's official Gallery shell and its scenes, rebuilt with this library's
 * components, with the palette and the appearance switched live inside the app. The home page's
 * "See it running" shows it.
 *
 * Over the frame: Desktop | Phone and Open in new tab. The layout's idiom rides in `?idiom=` as in
 * the demo panels (an idiom is fixed when an app starts, so the frame loads again when it changes);
 * desktop is the default here, the app's whole shell. The frame carries the site's theme in
 * `?theme=` (the packaged page's head script reads it before the first paint, `player-options.ts`)
 * and is told of later switches by message, as the demo panels are.
 */
import { useEffect, useRef, useState } from "react";

import { siteTheme, ToggleGroup, withParam } from "@/components/fd/demo-panel";
import { CONTROL_FOCUS } from "@/components/fd/toolbar";

/** The app's packaged page, under the site's own origin (the packager's output, `build-demos.ts`). */
const APP_HREF = "/showcase/index.html";

/** Desktop is as wide as the page; phone is a phone's width. Both at a window's height. */
const LAYOUTS = {
  desktop: { width: undefined, idiom: "desktop" },
  phone: { width: 390, idiom: "phone" },
} as const;
type Layout = keyof typeof LAYOUTS;

const FRAME_HEIGHT = 720;

export function ShowcaseFrame() {
  const [layout, setLayout] = useState<Layout>("desktop");
  // The frame's URL is set once the theme is known (after mount, so the static markup and the
  // first client render agree).
  const [src, setSrc] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    loaded.current = false;
    const href = withParam(APP_HREF, "idiom", LAYOUTS[layout].idiom);
    setSrc(withParam(href, "theme", siteTheme()));
  }, [layout]);

  // The page's theme: in the URL while the frame has not loaded, a message once it has.
  useEffect(() => {
    const apply = () => {
      const theme = siteTheme();
      const running = frame.current;
      if (running?.dataset.theme === theme) return;
      if (running && loaded.current) {
        running.contentWindow?.postMessage({ theme }, window.location.origin);
      } else {
        setSrc((current) => (current ? withParam(current, "theme", theme) : current));
      }
      if (running) running.dataset.theme = theme;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const { width } = LAYOUTS[layout];

  return (
    <div className="not-prose flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          label="Layout"
          role="radiogroup"
          options={[
            { value: "desktop", label: "Desktop" },
            { value: "phone", label: "Phone" },
          ]}
          value={layout}
          onChange={setLayout}
        />
        <a
          href={src ?? APP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-fd-primary text-fd-primary-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-opacity hover:opacity-90 ${CONTROL_FOCUS}`}
        >
          Open in new tab <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="border-fd-border bg-fd-card overflow-hidden rounded-xl border">
        <iframe
          ref={frame}
          src={src}
          title="The shadcn-nsh showcase app"
          loading="lazy"
          width={width}
          onLoad={() => {
            loaded.current = true;
            if (frame.current) frame.current.dataset.theme = siteTheme();
          }}
          className={`mx-auto block max-w-full bg-transparent ${width ? "border-fd-border border-x" : "w-full border-0"}`}
          style={{ height: FRAME_HEIGHT }}
        />
      </div>
    </div>
  );
}
