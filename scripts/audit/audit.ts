/**
 * The demo audit's batch, which `docs/specs/demo-audit.md` was written from: package every
 * catalog component's page, its reference page and the official NSH website example it ports,
 * photograph each at the player's two sizes, and measure what the docs page's two layouts hand
 * the preview.
 *
 *   bun scripts/audit/audit.ts build   [--only id,id] [--force]  # nsh package into /tmp/nsh-audit
 *   bun scripts/audit/audit.ts shots   [--only id,id]             # PNGs under apps/docs/demos/shots/audit
 *   bun scripts/audit/audit.ts canvas                            # the docs preview (needs build:docs)
 *   bun scripts/audit/audit.ts probe                             # the probe at both idioms, standalone
 *
 * `canvas` needs `bun run build:docs` first (the site embeds the packaged demos; a page without
 * one shows source only) and leaves the probe in `apps/docs/dist/demos/__audit-probe`. The
 * screenshots directory under `apps/docs/demos` is gitignored, and the packages stay in the work
 * directory.
 */
import fs from "node:fs";
import path from "node:path";

import { catalog } from "../catalog";
import { repo } from "../port/lib";
import { launch, type Page, serve } from "./chrome";
import { type Target, packageTarget, shotName, shotsDir, targetsFor } from "./targets";

const work = process.env.NSH_AUDIT_WORK ?? path.join("/tmp", "nsh-audit");
const packages = path.join(work, "packages");
const probeDir = path.join(repo, "scripts", "audit", "probe");
const dist = path.join(repo, "apps", "docs", "dist");

/** The player's two frames: a phone (a finger) and a desktop window (a pointer). */
const LAYOUTS = {
  phone: { width: 390, height: 844, idiom: "phone" },
  desktop: { width: 1024, height: 640, idiom: "desktop" },
} as const;
type Layout = keyof typeof LAYOUTS;

const [command = "all", ...rest] = process.argv.slice(2);
const valueOf = (flag: string) => {
  const at = rest.indexOf(flag);
  return at >= 0 ? rest[at + 1] : undefined;
};
const only = valueOf("--only")?.split(",").filter(Boolean);
const force = rest.includes("--force");

const ids = catalog()
  .components.map((component) => component.id)
  .filter((id) => !only || only.includes(id));

const probeTarget: Target = {
  id: "audit-probe",
  kind: "official",
  entry: path.join(probeDir, "probe.tsx"),
  cwd: probeDir,
  slug: "audit-probe",
};

type Failures = { slug: string; message: string }[];
const writeJson = (name: string, value: unknown) => {
  fs.mkdirSync(work, { recursive: true });
  fs.writeFileSync(path.join(work, name), `${JSON.stringify(value, null, 2)}\n`);
};

/** Every target built so far in the work directory (a run with `--only` keeps the others). */
function builtTargets(): Target[] {
  const all = ids.flatMap((id) => targetsFor(id));
  return all.filter((target) => fs.existsSync(path.join(packages, target.slug, "index.html")));
}

async function build() {
  const failures: Failures = [];
  const targets = ids.flatMap((id) => targetsFor(id));
  console.log(`packaging ${targets.length} targets into ${packages}`);
  for (const target of targets) {
    if (!fs.existsSync(target.entry)) {
      failures.push({
        slug: target.slug,
        message: `${path.relative(repo, target.entry)}: missing`,
      });
      continue;
    }
    const started = Date.now();
    try {
      packageTarget(target, work, force);
      console.log(`  ${target.slug} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ slug: target.slug, message });
      console.error(`  ${target.slug}: ${message.split("\n")[0]}`);
    }
  }
  writeJson("build-failures.json", failures);
  console.log(
    `built ${targets.length - failures.length}/${targets.length}; failures in build-failures.json`,
  );
}

/** The docs canvas, as `canvas` measured it (`work/canvas.json`), for the extra screenshots. */
function canvasSizes(): Record<Layout, { width: number; height: number }> | undefined {
  const file = path.join(work, "canvas.json");
  if (!fs.existsSync(file)) return undefined;
  const measured = JSON.parse(fs.readFileSync(file, "utf8")) as {
    layouts: Record<string, { frame: { width: number; height: number } }>;
  };
  // `canvas` names the phone layout `mobile` (the site's word for it).
  const size = (layout: Layout) => {
    const frame = measured.layouts[layout === "phone" ? "mobile" : layout]?.frame;
    return frame ? { width: frame.width, height: frame.height } : undefined;
  };
  const phone = size("phone");
  const desktop = size("desktop");
  return phone && desktop ? { phone, desktop } : undefined;
}

async function shots() {
  const targets = builtTargets();
  if (targets.length === 0) throw new Error("nothing built: run `build` first");
  const server = serve(packages);
  const browser = await launch();
  const page = await browser.page();
  const failures: Failures = [];
  const canvas = canvasSizes();
  let written = 0;
  try {
    for (const target of targets) {
      const url = `${server.url}/${target.slug}/index.html`;
      for (const layout of ["phone", "desktop"] as const) {
        const file = path.join(shotsDir, shotName(target, layout));
        try {
          await page.load(`${url}?idiom=${LAYOUTS[layout].idiom}`, LAYOUTS[layout]);
          await page.screenshot(file);
          written += 1;
        } catch (error) {
          failures.push({ slug: shotName(target, layout), message: String(error) });
        }
      }
      // The docs' own frames (its phone is a desktop browser's idiom): only demos and references.
      if (canvas && target.kind !== "official") {
        for (const layout of ["phone", "desktop"] as const) {
          const size = canvas[layout];
          try {
            await page.load(url, size);
            await page.screenshot(
              path.join(shotsDir, `${target.id}-${target.kind}-canvas${layout}.png`),
            );
            written += 1;
          } catch (error) {
            failures.push({ slug: `${target.slug}-canvas${layout}`, message: String(error) });
          }
        }
      }
    }
  } finally {
    await browser.close();
    server.stop();
  }
  writeJson("shot-failures.json", failures);
  console.log(
    `${written} screenshots under ${path.relative(repo, shotsDir)}; ${failures.length} failures`,
  );
}

/** Waits in the page until `expression` is truthy (or fails after `tries` 100 ms polls). */
async function until(page: Page, expression: string, tries = 100) {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate<boolean>(`Boolean(${expression})`)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`page never satisfied: ${expression}`);
}

type CanvasLayout = {
  viewport: { width: number; height: number };
  /** The demo's `data-layout` after the switch. */
  layout: string;
  stage: { clientWidth: number; padding: number };
  frame: { width: number; height: number; cssWidth: string; cssHeight: string };
  probe: string;
  screenshot: string;
};

/**
 * Measures what the docs page hands its preview in each layout, at a wide and a narrow page.
 * The preview is then pointed at the probe app (served from the built site, so same-origin) and
 * its text read: that is what the demos themselves see.
 */
async function canvas() {
  if (!fs.existsSync(path.join(dist, "index.html"))) {
    throw new Error("apps/docs/dist is missing: run `bun run build:docs` first");
  }
  const probe = packageTarget(probeTarget, work, force);
  fs.rmSync(path.join(dist, "demos", "__audit-probe"), { recursive: true, force: true });
  fs.cpSync(probe, path.join(dist, "demos", "__audit-probe"), { recursive: true });

  // The site is built for GitHub Pages' project path (`astro.config.mjs`'s `base`): the demo
  // iframes ask for `/shadcn-nsh/demos/<id>/`, so the server has to answer under that prefix.
  const site = path.join(work, "site");
  const prefix = "shadcn-nsh";
  fs.rmSync(site, { recursive: true, force: true });
  fs.mkdirSync(site, { recursive: true });
  fs.symlinkSync(dist, path.join(site, prefix));
  const server = serve(site);
  const browser = await launch();
  const page = await browser.page();
  const layouts: Record<string, CanvasLayout> = {};
  const viewports = [
    { label: "wide", width: 1440, height: 900 },
    { label: "laptop", width: 1280, height: 800 },
    { label: "narrow", width: 560, height: 900 },
    { label: "small", width: 400, height: 900 },
  ];
  try {
    for (const viewport of viewports) {
      for (const layout of ["mobile", "desktop"] as const) {
        await page.load(`${server.url}/${prefix}/docs/components/accordion/`, viewport);
        await until(page, "document.querySelector('.demo .phone__screen iframe')");
        // The frame is `loading="lazy"` and the panel sits far down the page: it loads once shown.
        await page.evaluate(`document.querySelector(".demo").scrollIntoView({ block: "start" })`);
        await until(
          page,
          `(() => { const d = document.querySelector('.demo iframe').contentDocument; return d && d.querySelector('#status')?.hidden; })()`,
        );
        // The site's own switch: it sets `data-layout` on the panel and the frame, and resizes.
        await page.evaluate(
          `(() => { const button = document.querySelector('[data-demo-layout="${layout}"]'); if (button) button.click(); return Boolean(button); })()`,
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
        const measured = await page.evaluate<string>(`(() => {
          const demo = document.querySelector(".demo[data-layout]");
          const stage = demo.querySelector(".demo__stage");
          const frame = demo.querySelector(".phone__screen iframe");
          const phone = demo.querySelector(".phone");
          return JSON.stringify({
            layout: demo.dataset.layout,
            stage: { clientWidth: stage.clientWidth, padding: parseFloat(getComputedStyle(stage).paddingLeft) },
            frame: {
              width: Number(frame.getAttribute("width")),
              height: Number(frame.getAttribute("height")),
              cssWidth: phone.style.getPropertyValue("--phone-w"),
              cssHeight: phone.style.getPropertyValue("--phone-h"),
            },
          });
        })()`);
        const {
          layout: shown,
          stage,
          frame,
        } = JSON.parse(measured) as {
          layout: string;
          stage: CanvasLayout["stage"];
          frame: CanvasLayout["frame"];
        };
        // The probe: the same package shape as every demo, on the docs' own origin.
        await page.evaluate(
          `(() => { const frame = document.querySelector(".demo .phone__screen iframe"); frame.src = "/${prefix}/demos/__audit-probe/index.html"; return true; })()`,
        );
        await until(
          page,
          "document.querySelector('.demo iframe').contentDocument?.body?.innerText.includes('Canvas probe')",
        );
        const probeText = await page.evaluate<string>(
          `document.querySelector(".demo iframe").contentDocument.body.innerText`,
        );
        const key = viewport.label === "wide" ? layout : `${layout}-${viewport.label}`;
        const screenshot = path.join(shotsDir, `canvas-${key}.png`);
        await page.screenshot(screenshot);
        layouts[key] = {
          viewport: { width: viewport.width, height: viewport.height },
          layout: shown,
          stage,
          frame,
          probe: probeText,
          screenshot: path.relative(repo, screenshot),
        };
        console.log(
          `${key}: frame ${frame.width}×${frame.height} · ${probeText.split("\n").slice(0, 4).join(" · ")}`,
        );
      }
    }
  } finally {
    await browser.close();
    server.stop();
  }
  writeJson("canvas.json", { layouts });
  console.log(`canvas measurements in ${path.join(work, "canvas.json")}`);
}

/** The probe alone, at each idiom: what the website player would give the same app. */
async function probe() {
  packageTarget(probeTarget, work, force);
  const server = serve(packages);
  const browser = await launch();
  const page = await browser.page();
  try {
    for (const layout of ["phone", "desktop"] as const) {
      await page.load(
        `${server.url}/audit-probe/index.html?idiom=${LAYOUTS[layout].idiom}`,
        LAYOUTS[layout],
      );
      const file = path.join(shotsDir, `probe-${layout}.png`);
      await page.screenshot(file);
      console.log(`${layout}: ${path.relative(repo, file)}`);
    }
    // And the docs' own phone frame: a 390 × 844 frame with the browser's measured idiom.
    for (const layout of ["phone", "desktop"] as const) {
      await page.load(`${server.url}/audit-probe/index.html`, LAYOUTS[layout]);
      const file = path.join(shotsDir, `probe-measured-${layout}.png`);
      await page.screenshot(file);
      console.log(`measured ${layout}: ${path.relative(repo, file)}`);
    }
  } finally {
    await browser.close();
    server.stop();
  }
}

if (command === "build") await build();
else if (command === "shots") await shots();
else if (command === "canvas") await canvas();
else if (command === "probe") await probe();
else if (command === "all") {
  await build();
  await shots();
  await canvas();
  await probe();
} else {
  console.error(`unknown command ${command}: build, shots, canvas, probe or all`);
  process.exit(1);
}
