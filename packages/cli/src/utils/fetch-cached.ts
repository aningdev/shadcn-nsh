/**
 * Registry JSON over the network, with the last copy of each URL kept on disk for when the
 * network is not there. The CLI's registry URL is pinned to its release tag, so a URL's body
 * does not change and the copy is the registry as it is; a moving URL (`--registry` at a branch)
 * gets the copy it last saw, and the notice says when that was.
 *
 * Only a request that never got an answer falls back: an HTTP error is the registry's answer
 * (a missing item, a wrong URL) and is thrown as such. `file:` URLs are read, never cached.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/** The registry could not be reached, and there is no copy of `url` to use instead. */
export class RegistryUnreachable extends Error {
  constructor(
    readonly url: string,
    options?: ErrorOptions,
  ) {
    super(`Cannot reach ${url}, and there is no cached copy of it.`, options);
    this.name = "RegistryUnreachable";
  }
}

type Cached = { url: string; fetchedAt: string; body: unknown };

/** Where the copies live: `SHADCN_NSH_CACHE_DIR`, else the platform's user cache directory. */
export function cacheDir(): string {
  const env = process.env;
  if (env.SHADCN_NSH_CACHE_DIR) return env.SHADCN_NSH_CACHE_DIR;
  const base =
    env.XDG_CACHE_HOME ||
    (process.platform === "win32" && env.LOCALAPPDATA) ||
    path.join(os.homedir(), ".cache");
  return path.join(base, "shadcn-nsh");
}

const cacheFile = (url: string) =>
  path.join(cacheDir(), `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.json`);

/** The hosts a notice has been printed for, so a run that reads twenty items says it once. */
const noticed = new Set<string>();

/**
 * The JSON at `url`. `onHttpError` makes the error for a non-ok answer, so each caller can say
 * what it was fetching. Throws `RegistryUnreachable` when there is neither network nor a copy.
 */
export async function fetchJson(
  url: string,
  onHttpError: (res: Response) => Error,
): Promise<unknown> {
  const cacheable = /^https?:/.test(url);
  let res: Response;
  try {
    res = await fetch(url);
  } catch (error) {
    if (!cacheable) throw error;
    return fromCache(url, error);
  }
  if (!res.ok) throw onHttpError(res);
  const body: unknown = await res.json();
  if (cacheable) await save(url, body);
  return body;
}

async function fromCache(url: string, cause: unknown): Promise<unknown> {
  let cached: Cached;
  try {
    cached = JSON.parse(await fs.readFile(cacheFile(url), "utf8")) as Cached;
  } catch {
    throw new RegistryUnreachable(url, { cause });
  }
  const host = new URL(url).host;
  if (!noticed.has(host)) {
    noticed.add(host);
    console.error(
      `shadcn-nsh: cannot reach ${host} — using the registry cached ${cached.fetchedAt}.`,
    );
  }
  return cached.body;
}

/** Keep a copy; a cache that cannot be written only means no fallback later, not a failure now. */
async function save(url: string, body: unknown): Promise<void> {
  const record: Cached = { url, fetchedAt: new Date().toISOString(), body };
  try {
    await fs.mkdir(cacheDir(), { recursive: true });
    await fs.writeFile(cacheFile(url), JSON.stringify(record));
  } catch {
    // Read-only home, full disk: the command still has its answer.
  }
}
