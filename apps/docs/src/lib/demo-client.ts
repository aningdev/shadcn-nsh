/**
 * The Preview / Source and Phone / Desktop switches of the demo panels, and the site's theme
 * carried into the demos. Ported in shape from `references/nsh/website/src/lib/demo-client.ts`
 * (without its sounds): a frame runs the packaged demo at the layout's real size and idiom, as
 * tall as the app's content up to the layout's height, and follows the page's appearance.
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
 * The idioms of the layouts and their largest frames (`LAYOUTS` in `demo.js`): a panel's frame is
 * as wide as fits, up to these, and the app lays out at that width, 1:1.
 */
const LAYOUTS = {
  mobile: { width: 390, height: 844, idiom: "phone" },
  desktop: { width: 1024, height: 900, idiom: "desktop" },
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

/** A player URL for `layout`: its idiom in `?idiom=`. */
const withIdiom = (url: string, layout: Layout) =>
  /[?&]idiom=/.test(url)
    ? url.replace(/([?&]idiom=)[a-z]+/, `$1${LAYOUTS[layout].idiom}`)
    : url.replace(/\?/, `?idiom=${LAYOUTS[layout].idiom}&`);

/** The page's theme in a player URL's `?theme=`: added, or replaced. */
const withTheme = (url: string, theme: "light" | "dark") =>
  /[?&]theme=/.test(url)
    ? url.replace(/([?&]theme=)(dark|light)/, `$1${theme}`)
    : url.replace(/\?/, `?theme=${theme}&`);

/** A demo's URL in `layout`, as the page's theme has it now. */
const playerSrc = (url: string, layout: Layout) => withTheme(withIdiom(url, layout), siteTheme());

/**
 * Demos follow the page's theme: the page in `?theme=` before they load (and in "Open in a new
 * tab" links), a message when the theme changes, so a running demo switches without reloading.
 */
function themeDemos(root: ParentNode) {
  const frames = [
    ...root.querySelectorAll<HTMLIFrameElement>(".phone__screen iframe[data-player-src]"),
  ];
  const links = [...root.querySelectorAll<HTMLAnchorElement>('a[href*="?idiom="]')];
  const apply = () => {
    const want = siteTheme();
    for (const link of links) link.href = withTheme(link.href, want);
    for (const frame of frames) {
      if (frame.dataset.theme === want) continue;
      // Running: tell the page; not loaded yet (lazy): change the URL.
      if (frame.dataset.loaded) frame.contentWindow?.postMessage({ theme: want }, "*");
      else if (frame.getAttribute("src")) {
        frame.setAttribute("src", withTheme(frame.getAttribute("src")!, want));
      }
      frame.dataset.theme = want;
    }
  };
  for (const frame of frames) frame.dataset.theme = "";
  for (const frame of frames) frame.addEventListener("load", () => (frame.dataset.loaded = "1"));
  apply();
  onThemeChange(apply);
}

/** Frames never get shorter than this, and keep this much below the content (popups and dialogs
 * lift out of the frame). */
const MIN_HEIGHT = 420;
const ROOM_BELOW = 32;

/**
 * The height the app needs in `frame` (it is on the site's origin): the bottom of the lowest
 * thing it draws, not counting views that fill the frame (a page's background), or, when a view
 * that fills it scrolls, the frame's height plus what is out of view; 0 when it cannot tell.
 */
function contentHeight(frame: HTMLIFrameElement) {
  try {
    const doc = frame.contentDocument;
    const app = doc?.getElementById("app");
    if (!doc || !app) return 0;
    const full = doc.documentElement.clientHeight;
    const view = doc.defaultView!;
    let bottom = 0;
    // `clip`: the bottom of the views around that clip what they hold (a virtual list's rows out
    // of view); views that fill the frame do not.
    const walk = (el: Element, clip: number) => {
      const r = el.getBoundingClientRect();
      let inner = clip;
      if (r.height >= full * 0.9) {
        // Only scroll views (`nsh.js`'s `.nsh-scroll`) say they hold more.
        const hidden = el.classList.contains("nsh-scroll") ? el.scrollHeight - el.clientHeight : 0;
        if (hidden > 1) bottom = Math.max(bottom, full + hidden);
      } else if (r.width > 0 && r.height > 0) {
        const style = view.getComputedStyle(el);
        // What draws: a leaf (text, an image, a border), or a view with a background; a bare
        // container may stretch over empty room.
        const draws = el.childElementCount === 0 || style.backgroundColor !== "rgba(0, 0, 0, 0)";
        if (draws && r.top < Math.min(full, clip))
          bottom = Math.max(bottom, Math.min(full, clip, r.bottom));
        if (style.overflowY !== "visible") inner = Math.min(clip, r.bottom);
      }
      for (const child of el.children) walk(child, inner);
    };
    walk(app, Infinity);
    return Math.ceil(bottom);
  } catch {
    return 0;
  }
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

  // The height the app's content takes (`contentHeight`), once measured.
  let content = 0;

  const fit = () => {
    const size = LAYOUTS[(demo.dataset.layout as Layout) ?? "mobile"];
    const room = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    const width = Math.round(Math.max(280, Math.min(size.width, room || size.width)));
    const height = content
      ? Math.min(size.height, Math.max(MIN_HEIGHT, content + ROOM_BELOW))
      : size.height;
    phone.style.setProperty("--phone-w", String(width));
    phone.style.setProperty("--phone-h", String(height));
    if (frame) {
      frame.width = String(width);
      frame.height = String(height);
    }
  };
  new ResizeObserver(fit).observe(stage);

  // Each run measures again once it settles: the frame then ends below the content instead of a
  // layout's height.
  frame?.addEventListener("load", () => {
    content = 0;
    fit();
    for (const delay of [800, 2000]) {
      setTimeout(() => {
        const measured = contentHeight(frame);
        if (measured && (!content || measured > content)) {
          content = measured;
          fit();
        }
      }, delay);
    }
  });

  const apply = (layout: Layout, save: boolean) => {
    const changed = demo.dataset.layout !== layout || phone.dataset.layout !== layout;
    demo.dataset.layout = layout;
    phone.dataset.layout = layout;
    for (const b of buttons) {
      const on = b.dataset.demoLayout === layout;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    }
    for (const link of demo.querySelectorAll<HTMLAnchorElement>('a[href*="?idiom="]')) {
      link.href = withIdiom(link.href, layout);
    }
    if (frame?.dataset.playerSrc) {
      frame.dataset.playerSrc = withIdiom(frame.dataset.playerSrc, layout);
      // The frame's first load, or the new idiom in a running one (an idiom is fixed at start).
      if (changed || !frame.getAttribute("src")) {
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
      const next =
        buttons[(at + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length]!;
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
        const next = tabs[(at + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]!;
        show(next.dataset.demoView!, true);
      });
    }
  }
}
