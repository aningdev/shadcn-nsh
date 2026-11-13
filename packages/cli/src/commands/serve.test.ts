import { afterEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

import { fileUnder, startRegistryServer, type RegistryServer } from "./serve";

let server: RegistryServer | null = null;
let root: string | null = null;

afterEach(async () => {
  await server?.close();
  server = null;
  if (root) fs.rmSync(root, { recursive: true, force: true });
  root = null;
});

/** A registry at `<root>/r` and a sibling at `<root>/r2`, which shares the first one's prefix. */
function registry(): { r: string; sibling: string } {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "shadcn-nsh-serve-"));
  const r = path.join(root, "r");
  const sibling = path.join(root, "r2");
  fs.mkdirSync(r);
  fs.mkdirSync(sibling);
  fs.writeFileSync(path.join(r, "index.json"), '{"items":[]}\n');
  fs.writeFileSync(path.join(r, "button.json"), '{"name":"button"}\n');
  fs.writeFileSync(path.join(sibling, "secret.json"), '{"secret":true}\n');
  return { r, sibling };
}

/** A request with the path exactly as written: `fetch` normalises `..` before sending it. */
function request(url: string, pathname: string): Promise<{ status: number; body: string }> {
  const { hostname, port } = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname, port, path: pathname }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

describe("fileUnder", () => {
  test("resolves a path inside the directory", () => {
    expect(fileUnder("/srv/public/r", "/button.json")).toBe(
      path.join("/srv/public/r", "button.json"),
    );
    expect(fileUnder("/srv/public/r", "/r/button.json")).toBe(
      path.join("/srv/public/r", "r/button.json"),
    );
  });

  test("refuses a sibling that shares the directory's prefix", () => {
    expect(fileUnder("/srv/public/r", "/../r2/secret.json")).toBeNull();
    expect(fileUnder("C:\\public\\r", "/../r2/secret.json")).toBeNull();
  });

  test("refuses the directory itself and any path that leaves it", () => {
    expect(fileUnder("/srv/public/r", "/")).toBeNull();
    expect(fileUnder("/srv/public/r", "/..")).toBeNull();
    expect(fileUnder("/srv/public/r", "/../../etc/passwd")).toBeNull();
  });
});

describe("serve", () => {
  test("serves the index, an item, and the /r/ layout a static host gives it", async () => {
    const { r } = registry();
    server = await startRegistryServer({ dir: r });

    for (const pathname of ["/", "/index.json", "/button.json", "/r/button.json"]) {
      const res = await fetch(`${server.url}${pathname}`);
      expect(res.status).toBe(200);
      expect(await res.text()).toContain(pathname.endsWith("button.json") ? "button" : "items");
    }
  });

  test("does not serve a sibling directory's file, even from a raw .. path", async () => {
    const { r } = registry();
    server = await startRegistryServer({ dir: r });

    const { status, body } = await request(server.url, "/../r2/secret.json");
    expect([403, 404]).toContain(status);
    expect(body).not.toContain('"secret":true');
  });
});
