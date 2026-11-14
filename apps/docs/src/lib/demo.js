import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createHighlighter } from "shiki";

import { themes } from "./markdown.js";

// Component demos live in `apps/docs/demos/<name>.tsx` and package to
// `public/demos/<name>/` via `bun run docs:demos`. The panel mirrors
// references/nsh/website: Preview | Source, Phone | Desktop, filename,
// Shiki-highlighted source. Preview is our packaged web iframe (not the
// NSH shared player).

const ROOT = process.cwd();
const DEMOS = join(ROOT, "demos");

/**
 * The two layouts a panel switches between, as the website's player has them
 * (`references/nsh/website/src/lib/demo.js`): a phone (390 × 844 points, the
 * phone idiom: a finger, touch density) and a desktop window (1024 × 640
 * points, the desktop idiom: a pointer).
 *
 * The frame keeps the layout's height whatever the demo draws (a demo page
 * scrolls what does not fit), so switching demos or layouts never makes the
 * page jump. The idiom is fixed when the app starts, so a layout switch
 * reloads the frame.
 */
export const LAYOUTS = {
  mobile: { width: 390, height: 844, idiom: "phone" },
  desktop: { width: 1024, height: 640, idiom: "desktop" },
};

export function demoFile(name) {
  return join(DEMOS, `${name}.tsx`);
}

export function demoSource(name) {
  try {
    return readFileSync(demoFile(name), "utf8").replace(/\s+$/, "");
  } catch {
    return null;
  }
}

export function demoReady(name) {
  return existsSync(join(ROOT, "public", "demos", name, "index.html"));
}

export function demoHref(name, base = "/") {
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}demos/${name}/index.html`;
}

/**
 * The demo's URL in a layout: its idiom in `?idiom=`, which `build-demos.ts`
 * makes the packaged page pass to the runtime. The site's theme rides in
 * `?theme=` and is added in `demo-client.ts` (it is the visitor's, not the
 * build's).
 */
export function playerHref(name, { base = "/", layout = "mobile" } = {}) {
  return `${demoHref(name, base)}?idiom=${LAYOUTS[layout].idiom}`;
}

let highlighter;

export async function highlight(code, lang = "tsx") {
  highlighter ??= createHighlighter({
    themes: [themes.light, themes.dark],
    langs: ["tsx", "sh", "bash", "ts", "js", "json"],
  });
  const html = (await highlighter).codeToHtml(code, {
    lang,
    themes: { light: themes.light.name, dark: themes.dark.name },
    defaultColor: "light",
  });
  return html.replace('<pre class="shiki', '<pre class="astro-code shiki');
}

const escape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const COPY = {
  preview: "Preview",
  source: "Source",
  open: "Open in new tab",
  frame: (name) => `Live demo: ${name}`,
  pending: "The live preview is not built yet.",
  runLocally: "From the repo root:",
  missing: (name) => `Demo “${name}” was not found in apps/docs/demos.`,
  label: "Demo",
  live: "Live",
  layout: "Layout",
  mobile: "Phone",
  desktop: "Desktop",
};

export function frameBar(title, badge) {
  return `<div class="phone__bar"><span class="phone__tile" aria-hidden="true"><svg viewBox="14 12 100 100" width="12" height="12"><path d="M30 100 V58 a34 34 0 0 1 68 0 V100" fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round"/></svg></span><span class="phone__title">${escape(title)}</span>${badge ? `<span class="phone__badge"><i aria-hidden="true"></i>${escape(badge)}</span>` : ""}</div>`;
}

export function phoneHtml(name, { base = "/", layout = "mobile" } = {}) {
  const t = COPY;
  const size = LAYOUTS[layout];
  const ready = demoReady(name);
  // The player URL goes in `data-player-src`, not `src`: `demo-client.ts` sets
  // it with the layout's idiom and the page's theme before the first load, so a
  // frame never loads twice (the website's `phoneHtml` does the same).
  const screen = ready
    ? `<iframe allow="clipboard-write" data-player-src="${escape(playerHref(name, { base, layout }))}" title="${escape(t.frame(name))}" loading="lazy" width="${size.width}" height="${size.height}"></iframe>`
    : `<div class="phone__placeholder">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>
        <p class="phone__placeholder-title">${escape(t.pending)}</p>
        <p>${escape(t.runLocally)}</p>
        <code>bun run docs:demos</code>
      </div>`;
  const bar = frameBar(`${name}.tsx`, ready ? t.live : "");
  return `<div class="phone" data-layout="${layout}" style="--phone-w:${size.width};--phone-h:${size.height}">${bar}<div class="phone__screen">${screen}</div></div>`;
}

/** Demo panel for a component docs page. */
export async function demoPanelHtml(name, { base = "/" } = {}) {
  const t = COPY;
  const source = demoSource(name);
  if (source === null) {
    return `<div class="demo demo--missing" role="note">${escape(t.missing(name))}</div>`;
  }
  const code = await highlight(source);
  const file = `${name}.tsx`;
  const id = `demo-${name.replace(/[^a-z0-9_-]/gi, "-")}`;
  const ready = demoReady(name);

  if (!ready) {
    return `<figure class="demo demo--source-only" data-demo="${escape(name)}" data-pagefind-ignore>
      <figcaption class="demo__bar">
        <span class="demo__label">${escape(t.label)}</span>
        <span class="demo__file">${escape(file)}</span>
      </figcaption>
      <div class="demo__code">${code}</div>
      <p class="demo__pending-hint">${escape(t.pending)} Run <code>bun run docs:demos</code>.</p>
    </figure>`;
  }

  // `mobile` matches `demo-client.ts`'s default, so the frame never shows one
  // layout and then jumps to the other; the visitor's saved layout applies at
  // once, before the frame loads.
  return `<figure class="demo" data-demo="${escape(name)}" data-view="preview" data-layout="mobile" data-pagefind-ignore>
    <figcaption class="demo__bar">
      <div class="demo__views" data-slot="tabs-list" data-size="xs" role="tablist" aria-label="${escape(t.label)}">
        <button type="button" data-slot="tabs-trigger" role="tab" id="${id}-tab-preview" aria-controls="${id}-preview" aria-selected="true" data-demo-view="preview">${escape(t.preview)}</button>
        <button type="button" data-slot="tabs-trigger" role="tab" id="${id}-tab-source" aria-controls="${id}-source" aria-selected="false" tabindex="-1" data-demo-view="source">${escape(t.source)}</button>
      </div>
      <div class="demo__layouts" data-slot="toggle-group" data-variant="segmented" data-size="xs" role="radiogroup" aria-label="${escape(t.layout)}">
        <button type="button" data-slot="toggle-group-item" role="radio" aria-checked="true" data-demo-layout="mobile">${escape(t.mobile)}</button>
        <button type="button" data-slot="toggle-group-item" role="radio" aria-checked="false" tabindex="-1" data-demo-layout="desktop">${escape(t.desktop)}</button>
      </div>
      <span class="demo__file">${escape(file)}</span>
      <div class="demo__actions" data-slot="button-group" role="group">
        <a data-slot="button" data-variant="outline" data-size="icon-xs" href="${escape(playerHref(name, { base }))}" target="_blank" rel="noopener" title="${escape(t.open)}" aria-label="${escape(t.open)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></a>
      </div>
    </figcaption>
    <div class="demo__body">
    <div class="demo__stage" id="${id}-preview" role="tabpanel" aria-labelledby="${id}-tab-preview" data-active>${phoneHtml(name, { base })}</div>
    <div class="demo__code" id="${id}-source" role="tabpanel" aria-labelledby="${id}-tab-source">${code}</div>
    </div>
  </figure>`;
}
