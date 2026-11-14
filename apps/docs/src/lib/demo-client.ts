/**
 * The Preview / Source and Phone / Desktop switches of the demo panels, and the site's theme
 * carried into the demos. Ported in shape from `references/nsh/website/src/lib/demo-client.ts`
 * (without its sounds): a frame runs the packaged demo at the layout's real size and idiom, at a
 * fixed height, and follows the page's appearance.
 */

/** The page's theme, as the packaged page takes it (`?theme=`). */
const siteTheme = () => (document.documentElement.classList.contains("light") ? "light" : "dark");

/** Calls `change` with the page's theme whenever it changes. */
function onThemeChange(change: (theme: "light" | "dark") => void) {
  let last = siteTheme();
  new MutationObserver(() => {
    const now = siteTheme();
    if (now !== last) change((last = now));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

/**
 * The idioms of the layouts and their frames (`LAYOUTS` in `demo.js`): a panel's frame is as wide
 * as fits, up to these, and always the layout's height; the app lays out at that size, 1:1.
 */
const LAYOUTS = {
  mobile: { width: 390, height: 844, idiom: "phone" },
  desktop: { width: 1024, height: 640, idiom: "desktop" },
} as const;
type Layout = keyof typeof LAYOUTS;

/** The layout the visitor chose last, for every demo (a convenience). */
const LAYOUT_KEY = "nsh-demo-layout";

function savedLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "desktop" ? "desktop" : "mobile";
  } catch {
    return "mobile";
  }
}

/** A player URL with `name=value` set: its value replaced, or the parameter added. */
function withParam(url: string, name: string, value: string) {
  const parsed = new URL(url, document.baseURI);
  parsed.searchParams.set(name, value);
  return parsed.href;
}

/** A player URL for `layout`: its idiom in `?idiom=`. */
const withIdiom = (url: string, layout: Layout) => withParam(url, "idiom", LAYOUTS[layout].idiom);

/** The page's theme in a player URL's `?theme=`: added, or replaced. */
const withTheme = (url: string, theme: "light" | "dark") => withParam(url, "theme", theme);

/** A demo's URL in `layout`, as the page's theme has it now. */
const playerSrc = (url: string, layout: Layout) => withTheme(withIdiom(url, layout), siteTheme());

/** The "open in a new tab" links: a demo's own page, whose idiom the panel switches. */
const DEMO_LINK = 'a[href*="?idiom="]';
/** A frame that runs the packaged demo, at the player URL the panel gave it. */
const DEMO_FRAME = ".phone__screen iframe[data-player-src]";

/**
 * Demos follow the page's theme: the page in `?theme=` before they load (and in "Open in a new
 * tab" links), a message when the theme changes, so a running demo switches without reloading.
 */
function themeDemos(root: ParentNode) {
  const frames = [...root.querySelectorAll<HTMLIFrameElement>(DEMO_FRAME)];
  const links = [...root.querySelectorAll<HTMLAnchorElement>(DEMO_LINK)];
  const apply = () => {
    const want = siteTheme();
    for (const link of links) link.href = withTheme(link.href, want);
    for (const frame of frames) {
      if (frame.dataset.theme === want) continue;
      if (frame.dataset.loaded === "1") {
        // Running: tell it. The page is this one's origin, and takes a message only from there.
        frame.contentWindow?.postMessage({ theme: want }, window.location.origin);
      } else {
        // Not loaded yet (or reloading, `layoutDemo` cleared the mark): change the URL.
        const src = frame.getAttribute("src");
        if (src) frame.setAttribute("src", withTheme(src, want));
      }
      frame.dataset.theme = want;
    }
  };
  for (const frame of frames) frame.dataset.theme = "";
  for (const frame of frames)
    frame.addEventListener("load", () => {
      frame.dataset.loaded = "1";
    });
  apply();
  onThemeChange(apply);
}

/**
 * The Phone / Desktop switch of a demo panel: the frame's size, the idiom the app runs with (it
 * reloads: an idiom is fixed when an app starts), and the frame's width, the stage's up to the
 * layout's (never scaled: the app shows at its real size).
 */
function layoutDemo(demo: HTMLElement, all: HTMLElement[]) {
  const phone = demo.querySelector<HTMLElement>(".phone");
  const frame = demo.querySelector<HTMLIFrameElement>(".phone__screen iframe");
  const stage = demo.querySelector<HTMLElement>(".demo__stage");
  const buttons = [...demo.querySelectorAll<HTMLButtonElement>("[data-demo-layout]")];
  if (!phone || !stage || buttons.length === 0) return;

  // The frame is the layout's height, not the content's: a demo page scrolls what does not fit,
  // so the panel never grows or shrinks after the app loads (the website's player measures the
  // content and resizes, which makes the page jump while a demo settles).
  const fit = () => {
    const size = LAYOUTS[(demo.dataset.layout as Layout) ?? "mobile"];
    const room = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    const width = Math.round(Math.max(280, Math.min(size.width, room || size.width)));
    phone.style.setProperty("--phone-w", String(width));
    phone.style.setProperty("--phone-h", String(size.height));
    if (frame) {
      frame.width = String(width);
      frame.height = String(size.height);
    }
  };
  new ResizeObserver(fit).observe(stage);

  const apply = (layout: Layout, save: boolean) => {
    const changed = demo.dataset.layout !== layout || phone.dataset.layout !== layout;
    demo.dataset.layout = layout;
    phone.dataset.layout = layout;
    for (const b of buttons) {
      const on = b.dataset.demoLayout === layout;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    }
    for (const link of demo.querySelectorAll<HTMLAnchorElement>(DEMO_LINK)) {
      link.href = withIdiom(link.href, layout);
    }
    if (frame?.dataset.playerSrc) {
      frame.dataset.playerSrc = withIdiom(frame.dataset.playerSrc, layout);
      // The frame's first load, or the new idiom in a running one (an idiom is fixed at start).
      if (changed || !frame.getAttribute("src")) {
        // The document that runs from here on has not loaded yet: a theme change goes to its URL,
        // not to the window it is replacing.
        delete frame.dataset.loaded;
        delete frame.dataset.theme;
        frame.setAttribute("src", playerSrc(frame.dataset.playerSrc, layout));
      }
    }
    fit();
    if (save) {
      try {
        localStorage.setItem(LAYOUT_KEY, layout);
      } catch {}
      // The other demos of the page follow.
      for (const other of all) {
        if (other !== demo) other.dispatchEvent(new CustomEvent("demo-layout", { detail: layout }));
      }
    }
  };

  for (const b of buttons) {
    b.addEventListener("click", () => apply(b.dataset.demoLayout as Layout, true));
    b.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const at = buttons.indexOf(b);
      const nextId = (at + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length;
      const next = buttons[nextId] ?? b;
      apply(next.dataset.demoLayout as Layout, true);
      next.focus();
    });
  }
  demo.addEventListener("demo-layout", (e) => apply((e as CustomEvent<Layout>).detail, false));
  apply(savedLayout(), false);
}

/** Preview / Source and Phone / Desktop switches for demo panels. */
export function initDemos(root: ParentNode = document) {
  // Before the theme: a frame gets its URL (the layout's idiom, then the page's theme) before it
  // first loads.
  const panels = [...root.querySelectorAll<HTMLElement>(".demo[data-layout]")];
  for (const demo of panels) layoutDemo(demo, panels);
  themeDemos(root);

  for (const demo of root.querySelectorAll<HTMLElement>(".demo[data-view]")) {
    const tabs = [...demo.querySelectorAll<HTMLButtonElement>("[data-demo-view]")];
    const show = (view: string, focus = false) => {
      demo.dataset.view = view;
      for (const tab of tabs) {
        const selected = tab.dataset.demoView === view;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
        if (panel) panel.toggleAttribute("data-active", selected);
        if (selected && focus) tab.focus();
      }
    };
    for (const tab of tabs) {
      tab.addEventListener("click", () => show(tab.dataset.demoView!));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const at = tabs.indexOf(tab);
        const nextId = (at + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
        const next = tabs[nextId] ?? tab;
        show(next.dataset.demoView!, true);
      });
    }
  }
}
