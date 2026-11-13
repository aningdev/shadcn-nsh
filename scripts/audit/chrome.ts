/**
 * The two pieces the demo audit needs to look at a packaged NSH web app the way the docs site
 * shows it: a static server for a directory of packages, and a headless Chrome driven over the
 * DevTools protocol (set the viewport, load the app, wait until it drew, take a PNG).
 *
 * Not part of the check pipeline: `docs/specs/demo-audit.md` explains what it was run for.
 */
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
};

/** Serves the files under `root` (`/` is `root/index.html`), 127.0.0.1 only. */
export function serve(root: string): { url: string; stop: () => void } {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const url = new URL(request.url);
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      const file = path.join(root, relative || "index.html");
      if (!path.resolve(file).startsWith(path.resolve(root))) {
        return new Response("forbidden", { status: 403 });
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        const index = path.join(file, "index.html");
        if (!fs.existsSync(index)) return new Response("not found", { status: 404 });
        return new Response(Bun.file(index));
      }
      if (!fs.existsSync(file)) return new Response("not found", { status: 404 });
      return new Response(Bun.file(file), {
        headers: { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" },
      });
    },
  });
  return { url: `http://127.0.0.1:${server.port}`, stop: () => server.stop(true) };
}

/** A page of headless Chrome: one viewport, one app at a time. */
export interface Page {
  /** Loads `url` at `width` × `height` and resolves once the app hid its loading screen. */
  load(url: string, size: { width: number; height: number }): Promise<void>;
  /** Runs `expression` in the page and returns its value (promises awaited). */
  evaluate<T>(expression: string): Promise<T>;
  /** Writes the viewport as a PNG. */
  screenshot(file: string): Promise<void>;
}

export interface Browser {
  page(): Promise<Page>;
  close(): Promise<void>;
}

/** Where Chrome, Edge or Chromium is installed (macOS and Linux, as `port:render` finds it). */
export function chromePath(): string | undefined {
  const named = process.env.NSH_BROWSER ?? process.env.CHROME_PATH;
  if (named) return fs.existsSync(named) ? named : undefined;
  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
          path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
        ]
      : ["google-chrome", "chromium", "microsoft-edge"].flatMap((name) =>
          (process.env.PATH ?? "")
            .split(path.delimiter)
            .map((dir) => path.join(dir, name))
            .filter((exe) => fs.existsSync(exe)),
        );
  return candidates.find((exe) => fs.existsSync(exe));
}

type Message = {
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: unknown;
};

/** The default: the CPU draws the pixels and nothing animates (as `port:render` asks of Chrome). */
const FLAGS = [
  "--headless=new",
  "--remote-debugging-port=0",
  "--disable-gpu",
  "--force-prefers-reduced-motion",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-background-networking",
];

/** Starts Chrome and connects to its first page. */
export async function launch(exe = chromePath()): Promise<Browser> {
  if (!exe) throw new Error("No Chrome, Chromium or Edge found: set CHROME_PATH");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "nsh-audit-chrome-"));
  const child: ChildProcess = spawn(exe, [...FLAGS, `--user-data-dir=${profile}`], {
    stdio: "ignore",
  });
  const portFile = path.join(profile, "DevToolsActivePort");
  for (let i = 0; i < 200 && !fs.existsSync(portFile); i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!fs.existsSync(portFile)) {
    child.kill("SIGKILL");
    throw new Error("Chrome did not open its DevTools port");
  }
  const port = fs.readFileSync(portFile, "utf8").split("\n")[0]!.trim();
  const origin = `http://127.0.0.1:${port}`;
  const pages = (await (await fetch(`${origin}/json/list`)).json()) as {
    type: string;
    url: string;
    webSocketDebuggerUrl: string;
  }[];
  const first = pages.find((entry) => entry.type === "page" && !entry.url.startsWith("devtools"));
  const target =
    first ??
    ((await (await fetch(`${origin}/json/new?about:blank`, { method: "PUT" })).json()) as {
      webSocketDebuggerUrl: string;
    });

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise<void>((resolve, reject) => {
    socket.onopen = () => resolve();
    socket.onerror = () => reject(new Error("Chrome WebSocket failed to open"));
  });

  let nextId = 0;
  const pending = new Map<number, (message: Message) => void>();
  socket.onmessage = (event) => {
    const message = JSON.parse(String(event.data)) as Message;
    if (message.id === undefined) return;
    const settle = pending.get(message.id);
    if (!settle) return;
    pending.delete(message.id);
    settle(message);
  };
  const send = (method: string, params: Record<string, unknown> = {}) =>
    new Promise<Message>((resolve) => {
      const id = ++nextId;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
  const call = async (method: string, params: Record<string, unknown> = {}) => {
    const message = await send(method, params);
    if (message.error) throw new Error(`${method}: ${JSON.stringify(message.error)}`);
    return message.result as Record<string, unknown>;
  };

  await call("Page.enable");
  await call("Runtime.enable");
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "light" }],
  });

  const evaluate = async <T>(expression: string): Promise<T> => {
    const result = await call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    const exception = result.exceptionDetails as
      | { text?: string; exception?: { description?: string } }
      | undefined;
    if (exception) {
      throw new Error(
        `page evaluation failed: ${exception.exception?.description ?? exception.text ?? expression}`,
      );
    }
    return (result.result as { value: T }).value;
  };

  const page: Page = {
    async load(url, size) {
      await call("Emulation.setDeviceMetricsOverride", {
        width: size.width,
        height: size.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await call("Page.navigate", { url });
      // The packaged template shows `#status` until the app started, and again (with
      // `failed`) when it could not: wait for the first, stop on the second.
      for (let i = 0; i < 300; i++) {
        const state = await evaluate<string | null>(
          `(() => { const s = document.querySelector("#status"); return !s ? "none" : s.className === "failed" ? "failed:" + s.innerText : s.hidden ? "ready" : "loading"; })()`,
        );
        if (state?.startsWith("failed:"))
          throw new Error(`${url} failed to start: ${state.slice(7)}`);
        if (state === "ready" || state === "none") break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      // Two frames and a beat: entrances that a manual clock or reduced motion did not land.
      await evaluate(
        `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 250))))`,
      );
    },
    evaluate,
    async screenshot(file) {
      const result = await call("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, Buffer.from(String(result.data), "base64"));
    },
  };

  return {
    page: async () => page,
    async close() {
      socket.close();
      child.kill("SIGKILL");
      fs.rmSync(profile, { recursive: true, force: true });
    },
  };
}
