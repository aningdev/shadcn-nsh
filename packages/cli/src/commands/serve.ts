import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import { Command } from "commander";

/**
 * The file `pathname` names under `root`, or null when it leaves the directory. `root` itself is
 * not a file. A sibling that shares the prefix (`public/r2` for `public/r`) is outside: comparing
 * strings would let it through, `path.relative` does not.
 */
export function fileUnder(root: string, pathname: string): string | null {
  const file = path.join(root, pathname);
  const relative = path.relative(root, file);
  if (
    relative === "" ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    return null;
  }
  return file;
}

/** A registry being served: the base URL, the bound port, and a way to stop it. */
export type RegistryServer = {
  /** `http://127.0.0.1:<port>`: an item is at `<url>/<name>.json`, the catalog at `<url>/index.json`. */
  url: string;
  port: number;
  close(): Promise<void>;
};

/**
 * Serve a built registry directory over HTTP: `/<name>.json` (and `/r/<name>.json`, the layout
 * a static host such as GitHub Pages gives it), `index.json` for `/`.
 *
 * `port: 0` lets the OS pick a free one, which `port` reports afterwards: `bun run test:install`
 * starts a server on whatever is free instead of claiming a fixed port.
 */
export async function startRegistryServer(opts: {
  dir: string;
  port?: number;
}): Promise<RegistryServer> {
  const root = path.resolve(opts.dir);
  const port = opts.port ?? 0;

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      let pathname = url.pathname;
      if (pathname === "/") pathname = "/index.json";
      if (pathname.startsWith("/r/")) pathname = pathname.slice(2); // "/r/x" → "/x"
      if (!pathname.startsWith("/")) pathname = `/${pathname}`;

      const filePath = fileUnder(root, pathname);
      if (filePath === null) {
        res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }

      try {
        const body = await fs.readFile(filePath);
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "access-control-allow-origin": "*",
        });
        res.end(body);
      } catch {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end(`Not found: ${pathname}`);
      }
    } catch (error) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(error instanceof Error ? error.message : String(error));
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  const bound = typeof address === "object" && address != null ? address.port : port;

  return {
    url: `http://127.0.0.1:${bound}`,
    port: bound,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        // `fetch` keeps connections alive, and a kept-alive one holds `close` open.
        server.closeAllConnections?.();
      }),
  };
}

export const serve = new Command()
  .name("serve")
  .description("Serve public/r over HTTP for local CLI testing")
  .option("-p, --port <port>", "port (0 picks a free one)", "4173")
  .option("-d, --dir <path>", "registry directory", "./public/r")
  .option("-c, --cwd <cwd>", "working directory", process.cwd())
  .action(async (opts: { port: string; dir: string; cwd: string }) => {
    const root = path.resolve(opts.cwd, opts.dir);
    const server = await startRegistryServer({ dir: root, port: Number(opts.port) });

    console.log(`Serving ${root}`);
    console.log(`  ${server.url}/index.json`);
    console.log(`  ${server.url}/button.json`);
    console.log(`CLI: --registry ${server.url}/{name}.json`);
  });
