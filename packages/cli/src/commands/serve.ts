import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import { Command } from "commander";

export const serve = new Command()
  .name("serve")
  .description("Serve public/r over HTTP for local CLI testing")
  .option("-p, --port <port>", "port", "4173")
  .option("-d, --dir <path>", "registry directory", "./public/r")
  .option("-c, --cwd <cwd>", "working directory", process.cwd())
  .action(async (opts: { port: string; dir: string; cwd: string }) => {
    const root = path.resolve(opts.cwd, opts.dir);
    const port = Number(opts.port);

    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
        let pathname = url.pathname;
        if (pathname === "/") pathname = "/index.json";
        if (pathname.startsWith("/r/")) pathname = pathname.slice(2); // "/r/x" → "/x"
        if (!pathname.startsWith("/")) pathname = `/${pathname}`;

        const filePath = path.join(root, pathname);
        if (!filePath.startsWith(root)) {
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

    console.log(`Serving ${root}`);
    console.log(`  http://127.0.0.1:${port}/index.json`);
    console.log(`  http://127.0.0.1:${port}/button.json`);
    console.log(`CLI: --registry http://127.0.0.1:${port}/{name}.json`);
  });
