/**
 * The docs panel's two parameters, made to work in the page `nsh package --target web` writes.
 *
 * The panel gives a demo the layout's idiom (`?idiom=phone|desktop`) and the site's theme
 * (`?theme=light|dark`, and a `postMessage({ theme })` when it changes), as the website's player
 * page takes them (`references/nsh/crates/nsh-platform-web/web/index.html`). The release template
 * has no entry for either, so this module adds them to the page after packaging.
 */
import fs from "node:fs";
import path from "node:path";

/**
 * Before the first paint: `?theme=` applied to the page's own background, and both parameters
 * kept where the player options below read them.
 */
const HEAD_SCRIPT = `  <script>
    // The docs panel's layout and theme (see player-options.ts): the idiom the app believes it
    // runs on, and the appearance it is drawn in. Nothing here when the page is opened on its own.
    (() => {
      const params = new URLSearchParams(location.search);
      const theme = params.get("theme");
      const forced = theme === "dark" || theme === "light" ? theme : undefined;
      window.nshDemo = { idiom: params.get("idiom") || undefined, theme: forced };
      if (!forced) return;
      // System colors follow \`color-scheme\`, so the page behind the app is the theme's too,
      // without a color of ours: the packaged page paints white before the app's first frame.
      document.documentElement.style.colorScheme = forced;
      const style = document.createElement("style");
      style.textContent = "html, body { background: Canvas; color: CanvasText; }";
      document.head.append(style);
    })();
  </script>
`;

/** The runtime's idiom and appearance options: absent, it measures both itself. */
const OPTIONS = [
  "        idiom: window.nshDemo.idiom,",
  '        dark: window.nshDemo.theme === undefined ? undefined : window.nshDemo.theme === "dark",',
].join("\n");

/**
 * The panel's theme switch for a running app: a message from this page (its own origin), so the
 * app changes appearance without a reload.
 */
const LISTENER = `    addEventListener("message", (event) => {
      if (event.origin !== location.origin) return;
      const theme = event.data?.theme;
      if (theme !== "dark" && theme !== "light") return;
      document.documentElement.style.colorScheme = theme;
      player.setDark(theme === "dark");
    });`;

/** The theme the page loaded with, once the app runs (its engine's environment is what reads it). */
const START_THEME =
  '    if (window.nshDemo.theme) player.setDark(window.nshDemo.theme === "dark");';

/**
 * Make the packaged page take the panel's `?idiom=` and `?theme=`, and a running app's theme from
 * `postMessage({ theme })`.
 *
 * The release template has no entry for either: `nsh package --target web` writes a page whose
 * `createPlayer` passes no `idiom` and no `dark`, and whose runtime then measures the idiom from
 * the browser's pointer (`pointer: fine` and `hover: hover`: always desktop on a mouse) and
 * follows `prefers-color-scheme`. The website's player page
 * (`references/nsh/crates/nsh-platform-web/web/index.html`) has both, but it is built by
 * `cargo xtask web` — compiling NSH, which this repository does not do. So the two options are
 * added to the page the installed CLI writes, here and only here. `idiom` and `dark` are the
 * runtime's own options (`nsh.js`'s `createPlayer`); `player.setDark` its own method.
 *
 * The appearance takes both: `dark` keeps the runtime's `prefers-color-scheme` listener from
 * overruling the panel, and `setDark` after the app runs is what the app's `colorScheme()` reads
 * (the engine's environment starts light; `nsh_environment` carries no appearance).
 *
 * Markers are the template's exact text: a `nsh` release that changes them fails the build
 * loudly instead of shipping demos that ignore the panel (`docs/toolchain.md` says what to do
 * then).
 */
export function addPlayerOptions(outDir: string, name: string) {
  const index = path.join(outDir, "index.html");
  const html = fs.readFileSync(index, "utf8");
  const options = 'createPlayer(document.getElementById("app"), {';
  const ready = "    player = loaded;";
  const ran = "    player.preloadSides(app.sides);";
  const head = "</head>";
  for (const marker of [options, ready, ran, head]) {
    if (!html.includes(marker)) {
      throw new Error(
        `${name}: the packaged index.html has no ${JSON.stringify(marker)}: ` +
          "nsh's web template changed, so `apps/docs/scripts/player-options.ts` must be updated",
      );
    }
  }
  fs.writeFileSync(
    index,
    html
      .replace(head, `${HEAD_SCRIPT}${head}`)
      .replace(options, `${options}\n${OPTIONS}`)
      .replace(ready, `${ready}\n${LISTENER}`)
      // Once the app runs: its engine's environment is the one `setDark` writes.
      .replace(ran, `${START_THEME}\n${ran}`),
  );
}
