/** Phone / Desktop frame sizes (keep in sync with `LAYOUTS` in `demo.js`). */
const LAYOUTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1024, height: 640 },
} as const;
type Layout = keyof typeof LAYOUTS;

const LAYOUT_KEY = "nsh-demo-layout";

function savedLayout(): Layout {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "desktop" ? "desktop" : "mobile";
  } catch {
    return "mobile";
  }
}

const MIN_HEIGHT = 420;

/** Resize the demo iframe for Phone / Desktop (CSS width; no NSH player idiom). */
function layoutDemo(demo: HTMLElement, all: HTMLElement[]) {
  const phone = demo.querySelector<HTMLElement>(".phone");
  const frame = demo.querySelector<HTMLIFrameElement>(".phone__screen iframe");
  const stage = demo.querySelector<HTMLElement>(".demo__stage");
  const buttons = [...demo.querySelectorAll<HTMLButtonElement>("[data-demo-layout]")];
  if (!phone || !stage || buttons.length === 0) return;

  const fit = () => {
    const size = LAYOUTS[(demo.dataset.layout as Layout) ?? "mobile"];
    const room = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    const width = Math.round(Math.max(280, Math.min(size.width, room || size.width)));
    const height = Math.max(MIN_HEIGHT, Math.min(size.height, Math.round(width * (size.height / size.width))));
    phone.style.setProperty("--phone-w", String(width));
    phone.style.setProperty("--phone-h", String(height));
    if (frame) {
      frame.width = String(width);
      frame.height = String(height);
    }
  };
  new ResizeObserver(fit).observe(stage);

  const apply = (layout: Layout, save: boolean) => {
    if (demo.dataset.layout === layout && phone.dataset.layout === layout) return fit();
    demo.dataset.layout = layout;
    phone.dataset.layout = layout;
    for (const b of buttons) {
      const on = b.dataset.demoLayout === layout;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    }
    fit();
    if (save) {
      try {
        localStorage.setItem(LAYOUT_KEY, layout);
      } catch {}
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
      const next = buttons[(at + (event.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length]!;
      apply(next.dataset.demoLayout as Layout, true);
      next.focus();
    });
  }
  demo.addEventListener("demo-layout", (e) => apply((e as CustomEvent<Layout>).detail, false));
  apply(savedLayout(), false);
}

/** Preview / Source and Phone / Desktop switches for demo panels. */
export function initDemos(root: ParentNode = document) {
  const panels = [...root.querySelectorAll<HTMLElement>(".demo[data-layout]")];
  for (const demo of panels) layoutDemo(demo, panels);

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
