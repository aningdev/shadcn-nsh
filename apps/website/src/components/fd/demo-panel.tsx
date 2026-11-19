"use client";

/**
 * A component page's demo panel: Preview | Source, Phone | Desktop and the demo theme, over the packaged demo in
 * `public/demos/<name>/`. The behaviour is the Astro `DemoFrame` + `src/lib/demo-client.ts` one,
 * as a component:
 *
 * - the frame runs the demo at the layout's real size (390×640 phone, 1024×640 desktop) and at a
 *   height fixed by the layout, so switching demo or layout never moves the page;
 * - the layout's idiom rides in `?idiom=` — an idiom is fixed when an app starts, so the frame
 *   loads again when it changes — and the visitor's choice is kept in `localStorage`;
 * - the site's theme rides in `?theme=` before the first load, and a running frame is told with a
 *   message afterwards (the demo page listens for it), so a theme switch does not reload it.
 *
 * The toolbar's controls are drawn here, one height (`h-8`) and one width (`CONTROL_WIDTH`) for all
 * three, so they stack in one column when a narrow screen wraps the row; the Source tab is
 * Fumadocs' code block, highlighted in the browser when the tab first opens. It is imported only
 * there (`import.meta.env.SSR` drops the import from the server builds): shiki's oniguruma wasm
 * does not resolve in the server bundle.
 *
 * Nothing here reads the theme while rendering: it is read after mount, so the static markup and
 * the first client render agree.
 */
import { type ComponentProps, type ComponentType, useEffect, useRef, useState } from "react";

import { PaletteSwitch } from "@/components/fd/palette-switch";
import { CONTROL_FOCUS, CONTROL_WIDTH } from "@/components/fd/toolbar";
import { onPaletteChange } from "@/lib/palette";

const LAYOUTS = {
  mobile: { width: 390, height: 640, idiom: "phone" },
  desktop: { width: 1024, height: 640, idiom: "desktop" },
} as const;
type Layout = keyof typeof LAYOUTS;

/** The layout the visitor chose last, for every demo (the old panel's key, kept). */
const LAYOUT_KEY = "nsh-demo-layout";

const siteTheme = (): "light" | "dark" =>
  document.documentElement.classList.contains("light") ? "light" : "dark";

const withParam = (href: string, name: string, value: string) => {
  const parsed = new URL(href, document.baseURI);
  parsed.searchParams.set(name, value);
  return parsed.href;
};

const demoHref = (name: string) => `/demos/${name}/index.html`;

function savedLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "desktop" ? "desktop" : "mobile";
  } catch {
    return "mobile";
  }
}

type ToggleOption<T extends string> = { value: T; label: string; id?: string; controls?: string };

/**
 * The toolbar's two switches, one look: a bordered group whose chosen item is lifted, like the
 * library's toggle group. `tablist` for Preview | Source (it switches panels), `radiogroup` for
 * Phone | Desktop.
 */
function ToggleGroup<T extends string>({
  label,
  role,
  options,
  value,
  onChange,
}: {
  label: string;
  role: "tablist" | "radiogroup";
  options: ToggleOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      role={role}
      aria-label={label}
      className={`bg-fd-muted inline-flex h-8 ${CONTROL_WIDTH} items-center gap-0.5 rounded-lg border p-0.5`}
    >
      {options.map((option) => {
        const on = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role={role === "tablist" ? "tab" : "radio"}
            id={option.id}
            aria-controls={option.controls}
            aria-selected={role === "tablist" ? on : undefined}
            aria-checked={role === "radiogroup" ? on : undefined}
            onClick={() => onChange(option.value)}
            className={`h-full flex-1 rounded-md px-2.5 text-sm transition-colors ${CONTROL_FOCUS} ${
              on
                ? "bg-fd-background text-fd-foreground shadow-sm"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type DemoPanelProps = {
  /** The demo's name: `apps/website/demos/<name>.tsx`, packaged to `public/demos/<name>/`. */
  name: string;
  /** `apps/website/demos/<name>.tsx`, read for the Source tab (a lazily imported `?raw` module). */
  loadSource?: () => Promise<string>;
  /** Kept for frontmatter compat; the panel sizes the frame itself. */
  height?: number;
};

export function DemoPanel({ name, loadSource }: DemoPanelProps) {
  const [view, setView] = useState<"preview" | "source">("preview");
  const [source, setSource] = useState<string>();
  const [layout, setLayout] = useState<Layout>("mobile");
  // The frame's URL, set once the theme and the saved layout are known (after mount).
  const [src, setSrc] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  // A palette is read when a demo app starts, so the frame loads again for one (`palette.ts`):
  // a new mount, since a frame does not reload for the URL it already has.
  const [reloads, setReloads] = useState(0);

  const chooseLayout = (next: Layout) => {
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {}
  };

  // The highlighter is loaded when the tab first opens, and only in the browser.
  const [CodeBlock, setCodeBlock] = useState<
    ComponentType<{
      lang: string;
      code: string;
      codeblock?: ComponentProps<"figure"> & { viewportProps?: ComponentProps<"div"> };
    }>
  >();
  useEffect(() => {
    if (view !== "source" || CodeBlock) return;
    if (!import.meta.env.SSR) {
      import("fumadocs-ui/components/dynamic-codeblock").then((module) =>
        setCodeBlock(() => module.DynamicCodeBlock),
      );
    }
  }, [view, CodeBlock]);

  // The source is read when the tab opens, not with the page.
  useEffect(() => {
    if (view !== "source" || source !== undefined || !loadSource) return;
    let live = true;
    loadSource().then((text) => {
      if (live) setSource(text);
    });
    return () => {
      live = false;
    };
  }, [view, source, loadSource]);

  // The saved layout applies at once, before the frame's first load.
  useEffect(() => setLayout(savedLayout()), []);

  useEffect(() => {
    loaded.current = false;
    const href = withParam(demoHref(name), "idiom", LAYOUTS[layout].idiom);
    setSrc(withParam(href, "theme", siteTheme()));
  }, [name, layout]);

  useEffect(
    () =>
      onPaletteChange(() => {
        loaded.current = false;
        // The URL carries the theme of the frame's first load; a running frame was told of later
        // switches by message, so the new load is given the page's theme as it is now.
        setSrc((current) => (current ? withParam(current, "theme", siteTheme()) : current));
        setReloads((count) => count + 1);
      }),
    [],
  );

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

  const size = LAYOUTS[layout];
  const id = `demo-${name.replace(/[^a-z0-9_-]/gi, "-")}`;

  return (
    <figure className="not-prose bg-fd-card text-fd-card-foreground my-6 rounded-xl border">
      <figcaption className="flex flex-wrap items-center gap-2 border-b px-3 py-2 text-sm">
        <ToggleGroup
          label="Demo"
          role="tablist"
          options={[
            {
              value: "preview",
              label: "Preview",
              id: `${id}-tab-preview`,
              controls: `${id}-preview`,
            },
            { value: "source", label: "Source", id: `${id}-tab-source`, controls: `${id}-source` },
          ]}
          value={view}
          onChange={setView}
        />
        <ToggleGroup
          label="Layout"
          role="radiogroup"
          options={[
            { value: "mobile", label: "Phone" },
            { value: "desktop", label: "Desktop" },
          ]}
          value={layout}
          onChange={chooseLayout}
        />
        <PaletteSwitch />
        <span className="text-fd-muted-foreground ml-auto font-mono text-xs">{name}.tsx</span>
        <a
          href={src ?? demoHref(name)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-fd-muted-foreground rounded-md px-2 py-1"
          title="Open in new tab"
          aria-label="Open in new tab"
        >
          ↗
        </a>
      </figcaption>
      <div
        role="tabpanel"
        id={`${id}-preview`}
        hidden={view !== "preview"}
        className="overflow-auto p-3"
      >
        <iframe
          key={`${src}-${reloads}`}
          ref={frame}
          src={src}
          title={`Live demo: ${name}`}
          allow="clipboard-write"
          loading="lazy"
          width={size.width}
          height={size.height}
          onLoad={() => {
            loaded.current = true;
            if (frame.current) frame.current.dataset.theme = siteTheme();
          }}
          className="mx-auto block max-w-full border-0 bg-transparent"
        />
      </div>
      <div role="tabpanel" id={`${id}-source`} hidden={view !== "source"} className="p-3">
        {/* The preview's height: switching tabs never moves the page. The code scrolls inside. */}
        {source === undefined ? null : CodeBlock ? (
          <CodeBlock
            lang="tsx"
            code={source}
            codeblock={{
              className: "my-0",
              style: { height: size.height },
              viewportProps: { style: { height: "100%", maxHeight: "none" } },
            }}
          />
        ) : (
          <pre className="overflow-auto text-xs leading-relaxed" style={{ height: size.height }}>
            <code>{source}</code>
          </pre>
        )}
      </div>
    </figure>
  );
}
