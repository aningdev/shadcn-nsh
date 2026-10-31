import fs from "node:fs/promises";
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

    const server = Bun.serve({
      port,
      async fetch(req) {
        const url = new URL(req.url);
        let pathname = url.pathname;
        if (pathname === "/") pathname = "/index.json";
        if (pathname.startsWith("/r/")) pathname = pathname.slice(2); // "/r/x" → "/x"
        if (!pathname.startsWith("/")) pathname = `/${pathname}`;

        const filePath = path.join(root, pathname);
        if (!filePath.startsWith(root)) {
          return new Response("Forbidden", { status: 403 });
        }

        try {
          const body = await fs.readFile(filePath);
          return new Response(body, {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "access-control-allow-origin": "*",
            },
          });
        } catch {
          return new Response(`Not found: ${pathname}`, { status: 404 });
        }
      },
    });

    console.log(`Serving ${root}`);
    console.log(`  http://127.0.0.1:${server.port}/index.json`);
    console.log(`  http://127.0.0.1:${server.port}/button.json`);
    console.log(`CLI: --registry http://127.0.0.1:${server.port}/{name}.json`);
  });
